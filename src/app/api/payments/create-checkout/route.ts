import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const STRIPE_FEE_RATE  = 0.014;
export const STRIPE_FEE_FIXED = 25;

export function calcStripeFee(amountCents: number): number {
  return Math.ceil(amountCents * STRIPE_FEE_RATE + STRIPE_FEE_FIXED);
}

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
  let mentorId: string, menteeEmail: string, topic: string, date: string, time: string,
      language: string, durationMinutes: number, price: number, mentorName: string, durLabel: string;

  try {
    const body = await req.json() as {
      mentorId: string; menteeEmail: string; topic: string; date: string; time: string;
      language: string; durationMinutes?: number; price: number; mentorName: string; durLabel?: string;
    };
    mentorId        = (body.mentorId    ?? "").trim();
    menteeEmail     = (body.menteeEmail ?? "").trim();
    topic           = (body.topic       ?? "").trim();
    date            = (body.date        ?? "").trim();
    time            = (body.time        ?? "").trim();
    language        = (body.language    ?? "").trim();
    durationMinutes = body.durationMinutes ?? 60;
    price           = body.price ?? 0;
    mentorName      = (body.mentorName  ?? "").trim();
    durLabel        = (body.durLabel    ?? "").trim();
    if (!mentorId || !menteeEmail || !date || !time) throw new Error("missing fields");
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const client = getServiceClient();
  const origin = req.headers.get("origin") ?? "https://growviaconnect.com";

  const { data: menteeRow } = await client
    .from("mentees")
    .select("id, nom, free_discovery_used")
    .eq("email", menteeEmail)
    .single() as { data: { id: string; nom: string; free_discovery_used: boolean } | null };

  if (!menteeRow) return NextResponse.json({ error: "Mentee account not found" }, { status: 404 });

  const isFreeSession = !menteeRow.free_discovery_used;

  let stripeCustomerId: string | null = null;
  if (!isFreeSession) {
    const { data: subRow } = await client
      .from("mentee_subscriptions")
      .select("stripe_customer_id")
      .eq("mentee_id", menteeRow.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle() as { data: { stripe_customer_id: string } | null };

    if (!subRow?.stripe_customer_id) {
      return NextResponse.json({
        error:       "SUBSCRIPTION_REQUIRED",
        message:     "An active subscription is required to book sessions after your free discovery session.",
        redirectUrl: `${origin}/subscribe?redirect=${encodeURIComponent(`/book/${mentorId}`)}`,
      }, { status: 402 });
    }
    stripeCustomerId = subRow.stripe_customer_id;
  }

  const priceCents = isFreeSession ? 0 : Math.round(price * 100);

  const { data: sessionRow, error: sessionErr } = await client
    .from("sessions")
    .insert({
      mentor_id:        mentorId,
      mentee_id:        menteeRow.id,
      mentee_email:     menteeEmail,
      topic:            topic    || null,
      date,
      time,
      language:         language || null,
      duration_minutes: durationMinutes,
      price_cents:      priceCents,
      status:           "pending",
    })
    .select("id")
    .single() as { data: { id: string } | null; error: unknown };

  if (sessionErr || !sessionRow) {
    console.error("[create-checkout] session insert:", sessionErr);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }

  let paymentIntentId: string | null = null;

  if (!isFreeSession && priceCents > 0 && stripeCustomerId) {
    const stripe = getStripe();
    if (!stripe) {
      await client.from("sessions").update({ status: "cancelled" }).eq("id", sessionRow.id);
      return NextResponse.json({ error: "Payment processing unavailable" }, { status: 503 });
    }

    try {
      const customer = await stripe.customers.retrieve(stripeCustomerId) as Stripe.Customer;
      const pmId = (customer.invoice_settings?.default_payment_method as string | null) ?? null;

      if (!pmId) {
        await client.from("sessions").update({ status: "cancelled" }).eq("id", sessionRow.id);
        return NextResponse.json({
          error:       "NO_PAYMENT_METHOD",
          message:     "No payment method on file. Please update your card in settings.",
          redirectUrl: `${origin}/settings?tab=subscription`,
        }, { status: 402 });
      }

      const pi = await stripe.paymentIntents.create({
        amount:         priceCents,
        currency:       "eur",
        customer:       stripeCustomerId,
        payment_method: pmId,
        confirm:        true,
        off_session:    true,
        description:    `GrowVia session${mentorName ? ` with ${mentorName}` : ""}${durLabel ? ` – ${durLabel}` : ""}`,
        metadata: {
          session_id:   sessionRow.id,
          mentor_id:    mentorId,
          mentee_id:    menteeRow.id,
          session_date: date,
        },
      });

      if (pi.status !== "succeeded") {
        await client.from("sessions").update({ status: "cancelled" }).eq("id", sessionRow.id);
        return NextResponse.json({
          error:       "PAYMENT_FAILED",
          message:     "Payment could not be completed. Please check your payment method.",
          redirectUrl: `${origin}/settings?tab=subscription`,
        }, { status: 402 });
      }

      paymentIntentId = pi.id;
      await client.from("sessions").update({ status: "paid", payment_intent_id: pi.id }).eq("id", sessionRow.id);

    } catch (stripeErr) {
      console.error("[create-checkout] Stripe charge error:", stripeErr);
      await client.from("sessions").update({ status: "cancelled" }).eq("id", sessionRow.id);
      const isCardDecline = stripeErr instanceof Stripe.errors.StripeCardError;
      return NextResponse.json({
        error:       isCardDecline ? "CARD_DECLINED" : "PAYMENT_FAILED",
        message:     isCardDecline
          ? `Card declined: ${(stripeErr as InstanceType<typeof Stripe.errors.StripeCardError>).message}`
          : "Payment processing failed. Please try again.",
        redirectUrl: `${origin}/settings?tab=subscription`,
      }, { status: 402 });
    }
  }

  await client.from("connexions").insert({
    mentor_id: mentorId,
    mentee_id: menteeRow.id,
    statut:    "pending",
    date:      `${date}T${time}:00`,
  });

  if (isFreeSession) {
    await client.from("mentees").update({ free_discovery_used: true }).eq("id", menteeRow.id);
  }

  const successUrl = isFreeSession
    ? `${origin}/booking/success?free=true&session_id=${sessionRow.id}`
    : `${origin}/booking/success?session_id=${sessionRow.id}`;

  return NextResponse.json({
    url:             successUrl,
    sessionId:       sessionRow.id,
    paid:            priceCents > 0,
    paymentIntentId: paymentIntentId,
    ...(priceCents > 0 ? { feeCents: calcStripeFee(priceCents) } : {}),
  });
}
