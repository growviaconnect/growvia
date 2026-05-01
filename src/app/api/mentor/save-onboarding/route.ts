import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  let email: string;
  let data: Record<string, unknown>;

  try {
    const body = await req.json() as { email: string; userId?: string; data: Record<string, unknown> };
    email = (body.email ?? "").trim().toLowerCase();
    data  = body.data;
    if (!email || !data || typeof data !== "object") throw new Error("missing fields");
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const client = createClient(
    supabaseUrl,
    serviceKey || anonKey,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // UPDATE by email (UNIQUE NOT NULL) — never INSERT, so no NOT NULL violations.
  // id-based updates silently matched 0 rows when the stored id differed from
  // the auth user UUID, returning success without writing anything.
  const { error: updateError } = await client
    .from("mentors")
    .update(data)
    .eq("email", email);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Verify the write actually landed — a 0-row UPDATE returns no error in Postgres.
  const { data: row, error: selectError } = await client
    .from("mentors")
    .select("onboarding_completed")
    .eq("email", email)
    .single();

  if (selectError || !row) {
    return NextResponse.json({ error: "Mentor row not found after update" }, { status: 404 });
  }

  if (data.onboarding_completed === true && !row.onboarding_completed) {
    return NextResponse.json(
      { error: "onboarding_completed was not saved — mentor row may not exist yet" },
      { status: 422 },
    );
  }

  return NextResponse.json({ success: true });
}
