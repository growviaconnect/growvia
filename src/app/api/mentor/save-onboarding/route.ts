import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  let email: string;
  let userId: string | undefined;
  let data: Record<string, unknown>;

  try {
    const body = await req.json() as { email: string; userId?: string; data: Record<string, unknown> };
    email  = (body.email ?? "").trim().toLowerCase();
    userId = body.userId || undefined;
    data   = body.data;
    if (!email || !data || typeof data !== "object") throw new Error("missing fields");
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // Service role bypasses RLS — preferred path
  const client = createClient(
    supabaseUrl,
    serviceKey || anonKey,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // Always UPDATE (never INSERT) — the row already exists from step 1.
  // Using upsert here caused a NOT NULL violation on 'nom' when the stored id
  // didn't match userId and Supabase fell back to an INSERT.
  const { error } = userId
    ? await client.from("mentors").update(data).eq("id", userId)
    : await client.from("mentors").update(data).eq("email", email);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
