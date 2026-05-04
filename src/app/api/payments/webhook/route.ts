import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { sendBookingConfirmation } from "@/lib/email";

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
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[payments/webhook] signature error:", msg);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const stripeSession = event.data.object as Stripe.Checkout.Session;
    const sessionId     = stripeSession.metadata?.session_id;
    const menteeEmail   = stripeSession.metadata?.mentee_email ?? stripeSession.customer_email ?? "";

    if (!sessionId) {
      console.error("[payments/webhook] missing session_id in metadata");
      return NextResponse.json({ received: true });
    }

    const client = getServiceClient();

    // Mark session as paid
    await client.from("sessions").update({ status: "paid" }).eq("id", sessionId);

    // Fetch session + mentor + mentee details for emails
    const { data: sessionRow } = await client
      .from("sessions")
      .select("mentor_id, mentee_id, date, time")
      .eq("id", sessionId)
      .single() as { data: { mentor_id: string; mentee_id: string; date: string; time: string } | null };

    if (!sessionRow) {
      console.error("[payments/webhook] session row not found:", sessionId);
      return NextResponse.json({ received: true });
    }

    type NameEmailResult = { data: { email: string; nom: string } | null };
    const [{ data: mentorRow }, { data: menteeRow }] = await Promise.all([
      client.from("mentors").select("email, nom").eq("id", sessionRow.mentor_id).single() as unknown as Promise<NameEmailResult>,
      client.from("mentees").select("email, nom").eq("id", sessionRow.mentee_id).single() as unknown as Promise<NameEmailResult>,
    ]);

    if (mentorRow && menteeRow) {
      sendBookingConfirmation({
        mentorEmail: mentorRow.email,
        mentorNom:   mentorRow.nom,
        menteeEmail: menteeRow.email,
        menteeNom:   menteeRow.nom,
        date:        `${sessionRow.date}T${sessionRow.time}:00`,
        sessionId,
      }).catch(err => console.error("[payments/webhook] email:", err));
    }
  }

  return NextResponse.json({ received: true });
}
