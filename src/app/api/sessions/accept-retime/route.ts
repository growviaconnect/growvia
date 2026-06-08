import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { createMeetSession } from "@/lib/google-calendar";
import { sendConfirmationWithMeet, sendPaymentFailedEmail, sendRetimeAccepted, scheduleSessionReminders } from "@/lib/email";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2026-04-22.dahlia" as const });
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function POST(req: NextRequest) {
  let connexionId: string;
  try {
    const body = await req.json() as { connexionId: string };
    connexionId = (body.connexionId ?? "").trim();
    if (!connexionId) throw new Error("missing connexionId");
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const client = getServiceClient();

  type ConnRow = {
    id: string; date: string; mentor_id: string; mentee_id: string;
    proposed_date: string | null; proposed_time: string | null;
    mentors: { nom: string; email: string } | null;
    mentees: { nom: string; email: string } | null;
  };
  const { data: conn } = await client
    .from("connexions")
    .select("id, date, mentor_id, mentee_id, proposed_date, proposed_time, mentors(nom, email), mentees(nom, email)")
    .eq("id", connexionId)
    .single() as { data: ConnRow | null };

  if (!conn) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  // Resolve proposed time: prefer connexions row (migration 020), fall back to sessions
  let proposedDate = conn.proposed_date;
  let proposedTime = conn.proposed_time;

  const { data: sessionRow } = await client
    .from("sessions")
    .select("id, price_cents, mentee_email, proposed_date, proposed_time, duration_minutes")
    .eq("mentor_id", conn.mentor_id)
    .eq("mentee_id", conn.mentee_id)
    .eq("status", "rescheduled")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle() as {
      data: { id: string; price_cents: number | null; mentee_email: string | null; proposed_date: string | null; proposed_time: string | null; duration_minutes: number | null } | null
    };

  if (!proposedDate || !proposedTime) {
    proposedDate = sessionRow?.proposed_date ?? null;
    proposedTime = sessionRow?.proposed_time ?? null;
  }

  if (!proposedDate || !proposedTime) {
    return NextResponse.json({ error: "No proposed time found" }, { status: 400 });
  }

  const newDateTimeIso    = `${proposedDate}T${proposedTime}:00`;
  const durationMinutes   = sessionRow?.duration_minutes ?? 60;

  // Update connexion to new time, clear proposed fields, set active
  await client
    .from("connexions")
    .update({ date: newDateTimeIso, statut: "active", proposed_date: null, proposed_time: null })
    .eq("id", connexionId);

  // Charge via saved card if price is set
  const stripe = getStripe();
  let paymentIntentId: string | null = null;
  let paymentOk = true;

  if (stripe && sessionRow?.price_cents && sessionRow.price_cents > 0) {
    const { data: subRow } = await client
      .from("mentee_subscriptions")
      .select("stripe_customer_id")
      .eq("mentee_id", conn.mentee_id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle() as { data: { stripe_customer_id: string } | null };

    if (subRow?.stripe_customer_id) {
      try {
        const customer = await stripe.customers.retrieve(subRow.stripe_customer_id) as Stripe.Customer;
        const pmId     = (customer.invoice_settings?.default_payment_method as string | null) ?? null;
        if (pmId) {
          const pi = await stripe.paymentIntents.create({
            amount: sessionRow.price_cents, currency: "eur",
            customer: subRow.stripe_customer_id, payment_method: pmId,
            confirm: true, off_session: true, description: "GrowVia session (rescheduled)",
            metadata: { session_id: sessionRow.id, mentee_id: conn.mentee_id },
          });
          paymentIntentId = pi.id;
          paymentOk       = pi.status === "succeeded";
        } else { paymentOk = false; }
      } catch { paymentOk = false; }
    }
  }

  if (!paymentOk) {
    const menteeEmail = sessionRow?.mentee_email ?? conn.mentees?.email ?? "";
    if (menteeEmail) {
      sendPaymentFailedEmail({ menteeEmail, menteeNom: conn.mentees?.nom ?? "there", sessionDate: newDateTimeIso })
        .catch(err => console.error("[accept-retime] payment email:", err));
    }
    return NextResponse.json({ error: "Payment could not be processed", paymentFailed: true }, { status: 402 });
  }

  // Create Google Meet
  let meetLink = "";
  try {
    meetLink = await createMeetSession({
      mentorName:      conn.mentors?.nom   ?? "Mentor",
      mentorEmail:     conn.mentors?.email ?? "",
      menteeName:      conn.mentees?.nom   ?? "Mentee",
      menteeEmail:     conn.mentees?.email ?? "",
      startIso:        newDateTimeIso,
      durationMinutes,
    });
  } catch (err) { console.error("[accept-retime] Meet:", err); }

  // Update sessions row
  if (sessionRow?.id) {
    await client.from("sessions").update({
      status: "confirmed", date: proposedDate, time: proposedTime,
      proposed_date: null, proposed_time: null,
      ...(meetLink        ? { meet_link: meetLink }               : {}),
      ...(paymentIntentId ? { payment_intent_id: paymentIntentId } : {}),
    }).eq("id", sessionRow.id);
  }

  // Update connexion meet link
  if (meetLink) {
    await client.from("connexions").update({ meet_link: meetLink }).eq("id", connexionId);
  }

  const emailBase = {
    mentorEmail:     conn.mentors?.email ?? "",
    mentorNom:       conn.mentors?.nom   ?? "Mentor",
    menteeEmail:     conn.mentees?.email ?? "",
    menteeNom:       conn.mentees?.nom   ?? "Mentee",
    newDateIso:      newDateTimeIso,
    meetLink:        meetLink || undefined,
    durationMinutes,
  };

  // Send confirmation to both parties (mentee sees "accepted" confirmation, mentor sees "accepted")
  sendConfirmationWithMeet({
    ...emailBase,
    date: newDateTimeIso,
  }).catch(err => console.error("[accept-retime] confirmation email:", err));

  // Also send the specific "mentee accepted your retime" notification to mentor
  sendRetimeAccepted(emailBase)
    .catch(err => console.error("[accept-retime] retime-accepted email:", err));

  // Queue new 24h and 2h reminders for the updated session time
  scheduleSessionReminders({
    mentorEmail:     emailBase.mentorEmail,
    mentorNom:       emailBase.mentorNom,
    menteeEmail:     emailBase.menteeEmail,
    menteeNom:       emailBase.menteeNom,
    sessionDate:     newDateTimeIso,
    meetLink:        meetLink || undefined,
    durationMinutes,
  }).catch(err => console.error("[accept-retime] reminder scheduling:", err));

  return NextResponse.json({ success: true, meetLink: meetLink || null });
}
