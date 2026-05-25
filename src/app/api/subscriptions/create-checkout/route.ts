import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const PRICE_IDS: Record<string, string | undefined> = {
  basic:    process.env.STRIPE_BASIC_PRICE_ID,
  standard: process.env.STRIPE_STANDARD_PRICE_ID,
  premium:  process.env.STRIPE_PREMIUM_PRICE_ID,
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

  let plan: string, email: string, menteeId: string, redirectUrl: string;
  try {
    const body = await req.json() as { plan: string; email: string; menteeId?: string; redirectUrl?: string };
    plan        = (body.plan        ?? "").trim().toLowerCase();
    email       = (body.email       ?? "").trim();
    menteeId    = (body.menteeId    ?? "").trim();
    redirectUrl = (body.redirectUrl ?? "").trim();
    if (!plan || !email) throw new Error("missing fields");
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const priceId = PRICE_IDS[plan];
  if (!priceId) {
    return NextResponse.json(
      { error: `No price configured for plan '${plan}'. Add STRIPE_${plan.toUpperCase()}_PRICE_ID to env vars.` },
      { status: 503 }
    );
  }

  const client = getServiceClient();
  const origin = req.headers.get("origin") ?? "https://growviaconnect.com";

  // Re-use existing Stripe customer if mentee already subscribed before
  let customerId: string | undefined;
  if (menteeId) {
    const { data: existingSub } = await client
      .from("mentee_subscriptions")
      .select("stripe_customer_id")
      .eq("mentee_id", menteeId)
      .not("stripe_customer_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .single() as { data: { stripe_customer_id: string } | null };

    customerId = existingSub?.stripe_customer_id;
  }

  const session = await stripe.checkout.sessions.create({
    mode:                   "subscription",
    payment_method_types:   ["card"],
    customer:               customerId,
    customer_email:         customerId ? undefined : email,
    line_items:             [{ price: priceId, quantity: 1 }],
    subscription_data: {
      metadata: { plan, mentee_email: email, ...(menteeId ? { mentee_id: menteeId } : {}) },
    },
    // Save card for future off-session charges (session payments)
    payment_method_collection: "always",
    metadata: { plan, mentee_email: email, ...(menteeId ? { mentee_id: menteeId } : {}) },
    success_url: `${origin}/subscribe/success?plan=${plan}${redirectUrl ? `&redirect=${encodeURIComponent(redirectUrl)}` : ""}`,
    cancel_url:  `${origin}/subscribe${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`,
  });

  return NextResponse.json({ url: session.url });
}
