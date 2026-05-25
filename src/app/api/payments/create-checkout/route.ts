import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

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
    price           = body.price;
    mentorName      = (body.mentorName  ?? "").trim();
    durLabel        = (body.durLabel    ?? "").trim();
    if (!mentorId || !menteeEmail || !date || !time || !price) throw new Error("missing fields");
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const client = getServiceClient();

  // Resolve mentee id
  const { data: menteeRow } = await client
    .from("mentees")
    .select("id, nom")
    .eq("email", menteeEmail)
    .single() as { data: { id: string; nom: string } | null };

  if (!menteeRow) return NextResponse.json({ error: "Mentee account not found" }, { status: 404 });

  // Create session in DB with status=pending
  const { data: sessionRow, error: sessionErr } = await client
    .from("sessions")
    .insert({
      mentor_id:        mentorId,
      mentee_id:        menteeRow.id,
      topic:            topic || null,
      date,
      time,
      language:         language || null,
      duration_minutes: durationMinutes,
      price_cents:      Math.round(price * 100),
      status:           "pending",
    })
    .select("id")
    .single() as { data: { id: string } | null; error: unknown };

  if (sessionErr || !sessionRow) {
    console.error("[payments/create-checkout] session insert:", sessionErr);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }

  // Also insert into connexions for dashboard visibility
  await client.from("connexions").insert({
    mentor_id: mentorId,
    mentee_id: menteeRow.id,
    statut:    "pending",
    date:      `${date}T${time}:00`,
  });

  const origin = req.headers.get("origin") ?? "https://growviaconnect.com";
  const productName = mentorName
    ? `GrowVia Session with ${mentorName}${durLabel ? ` – ${durLabel}` : ""}`
    : `GrowVia Mentoring Session${durLabel ? ` – ${durLabel}` : ""}`;

  // Create Stripe Checkout session
  const stripeSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: menteeEmail,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: Math.round(price * 100),
        product_data: {
          name: productName,
          ...(topic ? { description: topic } : {}),
        },
      },
    }],
    metadata: {
      session_id:   sessionRow.id,
      mentor_id:    mentorId,
      mentee_email: menteeEmail,
    },
    success_url: `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${origin}/book/${mentorId}`,
  });

  // Save Stripe session id so the webhook can look it up if needed
  await client
    .from("sessions")
    .update({ stripe_session_id: stripeSession.id })
    .eq("id", sessionRow.id);

  return NextResponse.json({ url: stripeSession.url });
}
