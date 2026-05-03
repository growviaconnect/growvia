import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendAccountDeletionEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const env = process.env;
  const supabaseUrl = env["NEXT_PUBLIC_SUPABASE_URL"] || "";
  const serviceKey  = env["SUPABASE_SERVICE_ROLE_KEY"] || env["SUPABASE_SECRET_KEY"] || "";

  if (!serviceKey) {
    return NextResponse.json({ error: "Service key not configured" }, { status: 503 });
  }

  // ── 1. Verify auth token ──────────────────────────────────────────────────
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: { user }, error: authError } = await admin.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId    = user.id;
  const userEmail = user.email ?? "";
  const ip        = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  const userAgent = req.headers.get("user-agent") ?? "";

  // ── 2. Rate limiting: max 3 deletion attempts per 15 min ─────────────────
  const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { count: attemptCount } = await admin
    .from("security_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("action", "delete_account_attempt")
    .gte("created_at", fifteenMinAgo);

  if ((attemptCount ?? 0) >= 3) {
    return NextResponse.json(
      { error: "rate_limited", message: "Trop de tentatives. Réessayez dans 15 minutes." },
      { status: 429 },
    );
  }

  // Log this attempt before proceeding
  await admin.from("security_logs").insert({
    user_id:    userId,
    action:     "delete_account_attempt",
    ip,
    user_agent: userAgent,
    meta:       { email: userEmail },
  });

  try {
    // ── 3. Fetch profile data ───────────────────────────────────────────────
    const { data: mentorData } = await admin
      .from("mentors").select("*").eq("id", userId).maybeSingle();
    const { data: menteeData } = await admin
      .from("mentees").select("*").eq("id", userId).maybeSingle();

    const profileData = mentorData ?? menteeData ?? {};
    const role        = mentorData ? "mentor" : "mentee";
    const fullName    = (profileData as { nom?: string }).nom ?? userEmail;

    // ── 4. Archive to deleted_accounts ─────────────────────────────────────
    await admin.from("deleted_accounts").insert({
      original_user_id: userId,
      email:            userEmail,
      full_name:        fullName,
      role,
      plan:             null,
      created_at:       user.created_at,
      reason:           "user_request",
      snapshot:         profileData,
    });

    // ── 5. Delete active data ───────────────────────────────────────────────
    // Profiles
    if (mentorData) await admin.from("mentors").delete().eq("id", userId);
    if (menteeData) await admin.from("mentees").delete().eq("id", userId);

    // Sessions / connexions — silently ignore if table name differs
    await admin.from("connexions")
      .delete().or(`mentor_id.eq.${userId},mentee_id.eq.${userId}`)
      .then(() => null).catch(() => null);

    // AI matchings
    await admin.from("ai_matching_responses")
      .delete().or(`mentor_id.eq.${userId},mentee_id.eq.${userId}`)
      .then(() => null).catch(() => null);

    // ── 6. Delete Supabase auth user ────────────────────────────────────────
    const { error: deleteAuthError } = await admin.auth.admin.deleteUser(userId);
    if (deleteAuthError) throw deleteAuthError;

    // ── 7. Log success ──────────────────────────────────────────────────────
    await admin.from("security_logs").insert({
      user_id:    userId,
      action:     "delete_account_success",
      ip,
      user_agent: userAgent,
      meta:       { email: userEmail, role },
    }).catch(() => null);

    // ── 8. Send confirmation email (non-blocking) ───────────────────────────
    sendAccountDeletionEmail(userEmail, fullName, new Date()).catch(() => null);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    await admin.from("security_logs").insert({
      user_id:    userId,
      action:     "delete_account_error",
      ip,
      user_agent: userAgent,
      meta:       { email: userEmail, error: message },
    }).catch(() => null);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
