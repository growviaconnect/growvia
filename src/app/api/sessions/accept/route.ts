import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { createMeetSession } from "@/lib/google-calendar";
import { sendConfirmationWithMeet, sendPaymentFailedEmail } from "@/lib/email";

type ConnexionRow = {
  id:        string;
  date:      string;
  mentor_id: string;
  mentee_id: string;
  mentors:   { nom: string; email: string } | null;
  mentees:   { nom: string; email: string } | null;
};

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2026-04-22.dahlia" as const });
}

function getServiceClient() {
  const url    = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? "";
  const key    = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
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

  // ── 1. Fetch connexion with mentor/mentee info ────────────────────────────
  const { data: conn, error: fetchError } = await client
    .from("connexions")
    .select("id, date, mentor_id, mentee_id, mentors(nom, email), mentees(nom, email)")
    .eq("id", connexionId)
    .single() as { data: ConnexionRow | null; error: unknown };

  if (fetchError || !conn) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // ── 2. Find matching session row to get price ─────────────────────────────
  const { data: sessionRow } = await client
    .from("sessions")
    .select("id, price_cents, mentee_email")
    .eq("mentor_id", conn.mentor_id)
    .eq("mentee_id", conn.mentee_id)
    .in("status", ["pending", "paid"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single() as {
      data: { id: string; price_cents: number | null; mentee_email: string | null } | null
    };

  // ── 3. Charge mentee via saved card (if price set and Stripe configured) ──
  const stripe = getStripe();
  let paymentIntentId: string | null = null;
  let paymentOk = true;

  if (stripe && sessionRow?.price_cents && sessionRow.price_cents > 0) {
    // Look up mentee's Stripe customer ID from their active subscription
    const { data: subRow } = await client
      .from("mentee_subscriptions")
      .select("stripe_customer_id")
      .eq("mentee_id", conn.mentee_id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single() as { data: { stripe_customer_id: string } | null };

    if (subRow?.stripe_customer_id) {
      try {
        // Retrieve the customer's default payment method
        const customer = await stripe.customers.retrieve(subRow.stripe_customer_id) as Stripe.Customer;
        const pmId     = (customer.invoice_settings?.default_payment_method as string | null)
          ?? null;

        if (pmId) {
          const pi = await stripe.paymentIntents.create({
            amount:               sessionRow.price_cents,
            currency:             "eur",
            customer:             subRow.stripe_customer_id,
            payment_method:       pmId,
            confirm:              true,
            off_session:          true,
            description:          "GrowVia session",
            metadata: {
              session_id: sessionRow.id,
              mentee_id:  conn.mentee_id,
            },
          });
          paymentIntentId = pi.id;
          paymentOk       = pi.status === "succeeded";
        } else {
          // No payment method on file — charge fails gracefully
          paymentOk = false;
          console.warn("[accept] no default payment method for customer", subRow.stripe_customer_id);
        }
      } catch (payErr) {
        paymentOk = false;
        console.error("[accept] PaymentIntent failed:", payErr);
      }
    }
    // If no subscription found, proceed without charging (mentor-initiated sessions without subscriptions)
  }

  // ── 4. Handle payment failure ─────────────────────────────────────────────
  if (!paymentOk) {
    const menteeEmail = sessionRow?.mentee_email ?? conn.mentees?.email ?? "";
    if (menteeEmail) {
      sendPaymentFailedEmail({
        menteeEmail,
        menteeNom:   conn.mentees?.nom   ?? "there",
        sessionDate: conn.date,
      }).catch(err => console.error("[accept] payment failed email:", err));
    }
    // Keep status as pending; mentor UI shows failure note
    return NextResponse.json({ error: "Payment could not be processed", paymentFailed: true }, { status: 402 });
  }

  // ── 5. Create Google Meet link ────────────────────────────────────────────
  let meetLink = "";
  try {
    meetLink = await createMeetSession({
      mentorName:  conn.mentors?.nom   ?? "Mentor",
      mentorEmail: conn.mentors?.email ?? "",
      menteeName:  conn.mentees?.nom   ?? "Mentee",
      menteeEmail: conn.mentees?.email ?? "",
      startIso:    conn.date,
    });
  } catch (err) {
    console.error("[accept] Google Meet creation failed:", err);
  }

  // ── 6. Update connexion → active ──────────────────────────────────────────
  await client
    .from("connexions")
    .update({ statut: "active", ...(meetLink ? { meet_link: meetLink } : {}) })
    .eq("id", connexionId);

  // ── 7. Update sessions row → paid + meet_link + payment_intent_id ─────────
  if (sessionRow?.id) {
    await client
      .from("sessions")
      .update({
        status:             "paid",
        ...(meetLink         ? { meet_link: meetLink }               : {}),
        ...(paymentIntentId  ? { payment_intent_id: paymentIntentId } : {}),
      })
      .eq("id", sessionRow.id);
  } else {
    // Fallback: update by mentor+mentee if session id unknown
    await client
      .from("sessions")
      .update({
        status:             "paid",
        ...(meetLink         ? { meet_link: meetLink }               : {}),
        ...(paymentIntentId  ? { payment_intent_id: paymentIntentId } : {}),
      })
      .eq("mentor_id", conn.mentor_id)
      .eq("mentee_id", conn.mentee_id);
  }

  // ── 8. Send confirmation emails with Meet link ────────────────────────────
  sendConfirmationWithMeet({
    mentorEmail: conn.mentors?.email ?? "",
    mentorNom:   conn.mentors?.nom   ?? "Mentor",
    menteeEmail: conn.mentees?.email ?? "",
    menteeNom:   conn.mentees?.nom   ?? "Mentee",
    date:        conn.date,
    meetLink:    meetLink || undefined,
  }).catch(err => console.error("[accept] email send failed:", err));

  return NextResponse.json({ success: true, meetLink: meetLink || null });
}
