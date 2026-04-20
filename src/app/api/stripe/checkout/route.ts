import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  if (!key || key.includes("placeholder")) return null;
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" as const });
}

const PRICE_IDS: Record<string, string | undefined> = {
  basic:    process.env.STRIPE_PRICE_BASIC,
  standard: process.env.STRIPE_PRICE_STANDARD,
  premium:  process.env.STRIPE_PRICE_PREMIUM,
};

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured yet. Add STRIPE_SECRET_KEY to your environment variables." },
        { status: 503 }
      );
    }

    const { plan, email } = (await req.json()) as { plan: string; email: string };

    const priceId = PRICE_IDS[plan];
    if (!priceId || priceId.includes("placeholder")) {
      return NextResponse.json(
        { error: "Stripe price IDs are not configured yet. Add STRIPE_PRICE_* to your environment variables." },
        { status: 503 }
      );
    }

    const origin = req.headers.get("origin") ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { plan, email },
      success_url: `${origin}/dashboard?plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
