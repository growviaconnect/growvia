import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const env = process.env;
  const supabaseUrl = env["NEXT_PUBLIC_SUPABASE_URL"] ?? "";
  const serviceKey = env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
  const anonKey = env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] ?? "";

  const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let menteeId: string;
  try {
    const body = await req.json() as { menteeId: string };
    menteeId = body.menteeId;
    if (!menteeId) throw new Error("missing menteeId");
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (serviceKey) {
    // Preferred path: service role bypasses RLS entirely
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verify the token belongs to a real user before using elevated privileges
    const { data: { user }, error: authErr } = await admin.auth.getUser(token);
    if (!user || authErr) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { error } = await admin
      .from("mentees")
      .update({ has_used_free_ai_match: true })
      .eq("id", menteeId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // Fallback: anon client scoped to the caller's session (relies on RLS allowing self-update)
  const client = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { error } = await client
    .from("mentees")
    .update({ has_used_free_ai_match: true })
    .eq("id", menteeId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
