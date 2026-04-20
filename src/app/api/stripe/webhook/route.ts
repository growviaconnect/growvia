import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-03-25.dahlia" as const,
});

// Service-role client (bypasses RLS) — only used server-side
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  const sig  = req.headers.get("stripe-signature") ?? "";
  const body = await req.text();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const plan    = session.metadata?.plan;
    const email   = session.metadata?.email ?? session.customer_email;

    if (plan && email) {
      const supabase = getServiceClient();
      // Update plan in the mentees/mentors table (best-effort, ignore errors)
      await supabase.from("mentees").update({ plan }).eq("email", email);
      await supabase.from("mentors").update({ plan }).eq("email", email);
    }
  }

  return NextResponse.json({ received: true });
}
