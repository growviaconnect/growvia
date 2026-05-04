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

  let email: string;
  try {
    const body = await req.json() as { email: string };
    email = (body.email ?? "").trim();
    if (!email) throw new Error("missing email");
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const client = getServiceClient();
  const origin = req.headers.get("origin") ?? "https://growviaconnect.com";

  // Find the mentee's active subscription to get their Stripe customer ID
  const { data: menteeRow } = await client
    .from("mentees")
    .select("id")
    .eq("email", email)
    .single() as { data: { id: string } | null };

  if (!menteeRow) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const { data: subRow } = await client
    .from("mentee_subscriptions")
    .select("stripe_customer_id")
    .eq("mentee_id", menteeRow.id)
    .not("stripe_customer_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .single() as { data: { stripe_customer_id: string } | null };

  if (!subRow?.stripe_customer_id) {
    return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer:   subRow.stripe_customer_id,
    return_url: `${origin}/settings?tab=subscription`,
  });

  return NextResponse.json({ url: portalSession.url });
}
