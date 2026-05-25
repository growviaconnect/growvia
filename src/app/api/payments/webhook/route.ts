import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { sendBookingConfirmation } from "@/lib/email";

const PLAN_PRICE_MAP: Record<string, string> = {
  [process.env.STRIPE_BASIC_PRICE_ID    ?? "__none__"]: "basic",
  [process.env.STRIPE_STANDARD_PRICE_ID ?? "__none__"]: "standard",
  [process.env.STRIPE_PREMIUM_PRICE_ID  ?? "__none__"]: "premium",
};

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2026-04-22.dahlia" as const });
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });

  const sig           = req.headers.get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  const body          = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[webhook] signature error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  const client = getServiceClient();

  // ── checkout.session.completed ────────────────────────────────────────────
  if (event.type === "checkout.session.completed") {
    const cs = event.data.object as Stripe.Checkout.Session;

    if (cs.mode === "subscription") {
      // Subscription checkout completed → save to mentee_subscriptions
      const plan        = cs.metadata?.plan ?? "";
      const menteeEmail = cs.metadata?.mentee_email ?? cs.customer_email ?? "";
      const menteeId    = cs.metadata?.mentee_id;
      const customerId  = typeof cs.customer === "string" ? cs.customer : cs.customer?.id ?? "";
      const subId       = typeof cs.subscription === "string" ? cs.subscription : cs.subscription?.id ?? "";

      // Fetch subscription to get period end
      let periodEnd: string | null = null;
      try {
        const sub = await stripe.subscriptions.retrieve(subId) as unknown as { current_period_end: number };
        periodEnd = new Date(sub.current_period_end * 1000).toISOString();
      } catch { /* non-fatal */ }

      // Resolve mentee_id from email if not in metadata
      let resolvedMenteeId = menteeId;
      if (!resolvedMenteeId && menteeEmail) {
        const { data: mentee } = await client
          .from("mentees").select("id").eq("email", menteeEmail).single() as { data: { id: string } | null };
        resolvedMenteeId = mentee?.id;
      }

      if (resolvedMenteeId) {
        // Upsert subscription record
        await client.from("mentee_subscriptions").upsert({
          mentee_id:              resolvedMenteeId,
          plan,
          stripe_customer_id:     customerId,
          stripe_subscription_id: subId,
          status:                 "active",
          current_period_end:     periodEnd,
        }, { onConflict: "mentee_id" });

        // Keep local session plan in sync (mentee profile)
        await client.from("mentees").update({ plan }).eq("id", resolvedMenteeId);
      }
    }

    if (cs.mode === "payment") {
      // One-off session checkout completed → mark session paid + send emails
      const sessionId   = cs.metadata?.session_id;
      if (sessionId) {
        await client.from("sessions").update({ status: "paid" }).eq("id", sessionId);

        const { data: sessionRow } = await client
          .from("sessions")
          .select("mentor_id, mentee_id, date, time")
          .eq("id", sessionId)
          .single() as { data: { mentor_id: string; mentee_id: string; date: string; time: string } | null };

        if (sessionRow) {
          type NE = { data: { email: string; nom: string } | null };
          const [{ data: mentorRow }, { data: menteeRow }] = await Promise.all([
            client.from("mentors").select("email, nom").eq("id", sessionRow.mentor_id).single() as unknown as Promise<NE>,
            client.from("mentees").select("email, nom").eq("id", sessionRow.mentee_id).single() as unknown as Promise<NE>,
          ]);
          if (mentorRow && menteeRow) {
            sendBookingConfirmation({
              mentorEmail: mentorRow.email, mentorNom: mentorRow.nom,
              menteeEmail: menteeRow.email, menteeNom: menteeRow.nom,
              date: `${sessionRow.date}T${sessionRow.time}:00`,
              sessionId,
            }).catch(err => console.error("[webhook] email:", err));
          }
        }
      }
    }
  }

  // ── customer.subscription.updated ────────────────────────────────────────
  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription & { current_period_end: number };
    const subId = sub.id;

    // Determine plan from price ID on the first item
    const priceId   = sub.items.data[0]?.price?.id ?? "";
    const plan      = PLAN_PRICE_MAP[priceId] ?? sub.metadata?.plan ?? "";
    const periodEnd = new Date(sub.current_period_end * 1000).toISOString();
    const status    = sub.status === "active" || sub.status === "trialing" ? "active" : sub.status;

    await client
      .from("mentee_subscriptions")
      .update({ plan: plan || undefined, status, current_period_end: periodEnd })
      .eq("stripe_subscription_id", subId);
  }

  // ── customer.subscription.deleted ────────────────────────────────────────
  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription & { id: string };
    await client
      .from("mentee_subscriptions")
      .update({ status: "cancelled" })
      .eq("stripe_subscription_id", sub.id);
  }

  // ── payment_intent.payment_failed ─────────────────────────────────────────
  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const { sendPaymentFailedEmail } = await import("@/lib/email");

    // Find the session linked to this payment intent
    const { data: sessionRow } = await client
      .from("sessions")
      .select("mentee_id, mentor_id, date, time, mentee_email")
      .eq("payment_intent_id", pi.id)
      .single() as {
        data: { mentee_id: string; mentor_id: string; date: string; time: string; mentee_email: string | null } | null
      };

    if (sessionRow) {
      const menteeEmail = sessionRow.mentee_email ?? "";
      const { data: menteeRow } = await client
        .from("mentees").select("nom").eq("id", sessionRow.mentee_id).single() as { data: { nom: string } | null };

      if (menteeEmail) {
        sendPaymentFailedEmail({
          menteeEmail,
          menteeNom:   menteeRow?.nom ?? "there",
          sessionDate: `${sessionRow.date}T${sessionRow.time}:00`,
        }).catch(err => console.error("[webhook] payment failed email:", err));
      }
    }
  }

  return NextResponse.json({ received: true });
}
