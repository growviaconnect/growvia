import { NextResponse } from "next/server";

export async function GET() {
  function check(key: string) {
    const v = process.env[key];
    if (!v || v.includes("placeholder")) return "❌ missing";
    return `✅ ${v.slice(0, 14)}…`;
  }

  const vars = {
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL:        check("NEXT_PUBLIC_SUPABASE_URL"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY:   check("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    SUPABASE_SERVICE_ROLE_KEY:       check("SUPABASE_SERVICE_ROLE_KEY"),
    // Stripe core
    STRIPE_SECRET_KEY:               check("STRIPE_SECRET_KEY"),
    STRIPE_WEBHOOK_SECRET:           check("STRIPE_WEBHOOK_SECRET"),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: check("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
    // Stripe price IDs
    STRIPE_BASIC_PRICE_ID:           check("STRIPE_BASIC_PRICE_ID"),
    STRIPE_STANDARD_PRICE_ID:        check("STRIPE_STANDARD_PRICE_ID"),
    STRIPE_PREMIUM_PRICE_ID:         check("STRIPE_PREMIUM_PRICE_ID"),
    // Email
    RESEND_API_KEY:                  check("RESEND_API_KEY"),
    // Google Meet
    GOOGLE_SERVICE_ACCOUNT_JSON:     check("GOOGLE_SERVICE_ACCOUNT_JSON"),
    // AI
    ANTHROPIC_API_KEY:               check("ANTHROPIC_API_KEY"),
  };

  const missing = Object.entries(vars).filter(([, v]) => v.startsWith("❌")).map(([k]) => k);
  return NextResponse.json({ status: missing.length === 0 ? "all good ✅" : `${missing.length} missing ❌`, vars });
}
