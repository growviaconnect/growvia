import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

/**
 * ONE-TIME setup route — creates GrowVia subscription products in Stripe
 * and returns the price IDs to add to Vercel env vars.
 *
 * Protected by STRIPE_SETUP_TOKEN env var.
 * Call once: GET /api/setup/stripe-products?token=YOUR_TOKEN
 * Then DELETE this file.
 */

const PLANS = [
  { envKey: "STRIPE_BASIC_PRICE_ID",    name: "GrowVia Basic",    description: "Access to mentors, 2–3 AI matchings/month", amount: 499,  nickname: "basic"    },
  { envKey: "STRIPE_STANDARD_PRICE_ID", name: "GrowVia Standard", description: "Extended AI matching, certified mentors",   amount: 999,  nickname: "standard" },
  { envKey: "STRIPE_PREMIUM_PRICE_ID",  name: "GrowVia Premium",  description: "ALL mentors, unlimited AI matching",        amount: 1499, nickname: "premium"  },
];

export async function GET(req: NextRequest) {
  // Simple token guard so this can't be called by anyone else
  const token = req.nextUrl.searchParams.get("token");
  const expected = process.env.STRIPE_SETUP_TOKEN;
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Forbidden — set STRIPE_SETUP_TOKEN env var and pass ?token=" }, { status: 403 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY ?? "";
  if (!secretKey || secretKey.includes("placeholder")) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY not configured" }, { status: 503 });
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2026-04-22.dahlia" as const });

  const results: { envKey: string; priceId: string; productId: string; amount: number }[] = [];

  try {
    for (const plan of PLANS) {
      const product = await stripe.products.create({ name: plan.name, description: plan.description });
      const price   = await stripe.prices.create({
        product:    product.id,
        unit_amount: plan.amount,
        currency:   "eur",
        recurring:  { interval: "month" },
        nickname:   plan.nickname,
      });
      results.push({ envKey: plan.envKey, priceId: price.id, productId: product.id, amount: plan.amount });
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }

  const vercelInstructions = results.map(r => `${r.envKey}=${r.priceId}`).join("\n");

  return NextResponse.json({
    success: true,
    message: "✅ Products created. Add these to Vercel env vars, then DELETE src/app/api/setup/stripe-products/route.ts",
    vercel_env_vars: vercelInstructions,
    details: results,
  });
}
