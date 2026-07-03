import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Called by the dashboard every 30 seconds while the user is on-page. Bumps
 * mentors.last_active_at / mentees.last_active_at so the messaging notifier
 * can decide whether to send an email or stay silent.
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email: string };
    if (!email) return NextResponse.json({ ok: false });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
    const c = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

    const now = new Date().toISOString();
    // Best-effort: touch both tables so we don't need to know the role first.
    await Promise.all([
      c.from("mentors").update({ last_active_at: now }).eq("email", email),
      c.from("mentees").update({ last_active_at: now }).eq("email", email),
    ]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[workspace/presence]", err);
    return NextResponse.json({ ok: false });
  }
}
