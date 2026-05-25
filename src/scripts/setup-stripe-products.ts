/**
 * One-time script to create GrowVia subscription products in Stripe.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_live_... npx ts-node --project tsconfig.json src/scripts/setup-stripe-products.ts
 *
 * After running, copy the printed price IDs into your Vercel environment variables:
 *   STRIPE_BASIC_PRICE_ID
 *   STRIPE_STANDARD_PRICE_ID
 *   STRIPE_PREMIUM_PRICE_ID
 */

import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("Error: STRIPE_SECRET_KEY env var is required.");
  process.exit(1);
}

const stripe = new Stripe(key, { apiVersion: "2026-04-22.dahlia" as const });

const PLANS = [
  {
    envKey:      "STRIPE_BASIC_PRICE_ID",
    name:        "GrowVia Basic",
    description: "Access to mentors, 2-3 AI matchings/month, standard sessions",
    amount:      499,   // 4.99 EUR in cents
    nickname:    "basic",
  },
  {
    envKey:      "STRIPE_STANDARD_PRICE_ID",
    name:        "GrowVia Standard",
    description: "Majority of mentors, extended AI matching, certified mentors",
    amount:      999,   // 9.99 EUR in cents
    nickname:    "standard",
  },
  {
    envKey:      "STRIPE_PREMIUM_PRICE_ID",
    name:        "GrowVia Premium",
    description: "ALL mentors, unlimited AI matching, priority booking, exclusive content",
    amount:      1499,  // 14.99 EUR in cents
    nickname:    "premium",
  },
];

async function main() {
  console.log("Creating GrowVia subscription products in Stripe…\n");

  for (const plan of PLANS) {
    // Create product
    const product = await stripe.products.create({
      name:        plan.name,
      description: plan.description,
    });

    // Create recurring price
    const price = await stripe.prices.create({
      product:       product.id,
      unit_amount:   plan.amount,
      currency:      "eur",
      recurring:     { interval: "month" },
      nickname:      plan.nickname,
    });

    console.log(`✓ ${plan.name}`);
    console.log(`  Product ID : ${product.id}`);
    console.log(`  Price ID   : ${price.id}`);
    console.log(`  → Add to Vercel: ${plan.envKey}=${price.id}\n`);
  }

  console.log("Done! Add the price IDs above to your Vercel environment variables.");
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
