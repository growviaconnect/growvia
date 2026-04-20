import { NextResponse } from "next/server";

// Temporary endpoint — DELETE after confirming env vars on Vercel
// Visit /api/debug/env to see which Supabase/Resend variables are present
export async function GET() {
  function present(key: string) {
    const v = process.env[key];
    if (!v) return "❌ missing";
    return `✅ set (starts with: ${v.slice(0, 12)}…)`;
  }

  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL:    present("NEXT_PUBLIC_SUPABASE_URL"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: present("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    SUPABASE_SERVICE_ROLE_KEY:   present("SUPABASE_SERVICE_ROLE_KEY"),
    SUPABASE_SECRET_KEY:         present("SUPABASE_SECRET_KEY"),
    RESEND_API_KEY:              present("RESEND_API_KEY"),
    STRIPE_SECRET_KEY:           present("STRIPE_SECRET_KEY"),
  });
}
