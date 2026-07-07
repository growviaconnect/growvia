import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendSignupConfirmation } from "@/lib/email";

/**
 * "Resend confirmation email" — used by both /auth/register (when the user
 * is on the check-your-email card) and /auth/login (when they try to sign in
 * with an unconfirmed account). Bypasses supabase.auth.resend which routes
 * through Supabase's SMTP path (previously unreliable); instead we generate
 * the confirmation URL server-side and send via Resend REST like every other
 * transactional email in the app, so every attempt shows in the Resend logs.
 */
export async function POST(req: NextRequest) {
  const env = process.env;
  const supabaseUrl = env["NEXT_PUBLIC_SUPABASE_URL"] || "";
  const serviceKey  = env["SUPABASE_SERVICE_ROLE_KEY"] || env["SUPABASE_SECRET_KEY"] || "";
  const appUrl      = env["NEXT_PUBLIC_APP_URL"] || "https://growviaconnect.com";

  if (!serviceKey) {
    return NextResponse.json({ error: "Supabase service role not configured" }, { status: 503 });
  }

  try {
    const { email: rawEmail } = (await req.json()) as { email: string };
    const email = (rawEmail ?? "").trim().toLowerCase();
    if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Look up the user to (a) short-circuit if already confirmed, and
    // (b) grab their name + role from user_metadata.
    const { data: list, error: lookupErr } = await admin.auth.admin.listUsers({ perPage: 200 });
    if (lookupErr) {
      console.error("[resend-confirmation] listUsers failed:", lookupErr.message);
      // Always respond OK to avoid revealing account existence.
      return NextResponse.json({ ok: true });
    }
    const user = list.users.find(u => u.email?.toLowerCase() === email);
    if (!user) {
      // Same intentional silence — anti-enumeration.
      return NextResponse.json({ ok: true });
    }
    if (user.email_confirmed_at) {
      return NextResponse.json({ ok: true, alreadyConfirmed: true });
    }

    const nom  = (user.user_metadata?.nom  as string | undefined) ?? "there";
    const role = (user.user_metadata?.role as string | undefined) ?? "mentee";

    // Generate a fresh confirmation link. The `password` field is required by
    // GenerateSignupLinkParams' TS type, but Supabase ignores it at runtime
    // when the user already exists (which is the only case this endpoint is
    // ever called from — see the listUsers lookup above).
    const redirectTo = `${appUrl}/auth/login?confirmed=1`;
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type:     "signup",
      email,
      password: "",
      options:  { redirectTo },
    });
    if (linkErr || !linkData?.properties?.action_link) {
      console.error("[resend-confirmation] generateLink failed:", linkErr?.message);
      return NextResponse.json({ error: "Could not generate confirmation link" }, { status: 500 });
    }

    const { error: mailErr } = await sendSignupConfirmation({
      to:              email,
      nom,
      role,
      confirmationUrl: linkData.properties.action_link,
    });
    if (mailErr) {
      console.error("[resend-confirmation] Resend send failed:", mailErr);
      return NextResponse.json({ error: "Could not send confirmation email" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[resend-confirmation] threw:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
