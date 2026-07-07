import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Signup flow:
 *   1. Create the auth user via admin API with email_confirm = FALSE so
 *      auth.users.email_confirmed_at stays NULL until the user clicks the
 *      confirmation link. No manual admin validation step exists.
 *   2. Insert the domain row (mentors/mentees) with statut='active' so it's
 *      immediately usable once the email is verified.
 *   3. Trigger Supabase to send the confirmation email through the project's
 *      configured SMTP (Resend) via admin.generateLink({ type: 'signup' }).
 */
export async function POST(req: NextRequest) {
  const env = process.env;
  const supabaseUrl = env["NEXT_PUBLIC_SUPABASE_URL"] || "";
  const serviceKey  = env["SUPABASE_SERVICE_ROLE_KEY"] || env["SUPABASE_SECRET_KEY"] || "";
  const appUrl      = env["NEXT_PUBLIC_APP_URL"] || "https://growviaconnect.com";

  if (!serviceKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not set in environment variables." },
      { status: 503 },
    );
  }

  try {
    const { email, password, role, nom } = (await req.json()) as {
      email: string; password: string; role: string; nom: string;
    };

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Create the auth user in an unconfirmed state.
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { role, nom },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const userId = data.user.id;

    // 2. Insert the domain row keyed by auth.users.id so the onboarding flow
    //    can find it on first login. statut='active' by table default; setting
    //    it explicitly documents intent.
    const table = role === "mentor" ? "mentors" : role === "mentee" ? "mentees" : null;
    if (table) {
      const { error: insertErr } = await admin.from(table).insert({
        id: userId, nom, email, statut: "active",
      });
      if (insertErr) console.error("[register] domain insert warning:", insertErr.message);
    }

    // 3. Trigger the Supabase-managed confirmation email via generateLink.
    //    Uses the project's "Confirmation" email template + configured SMTP.
    const redirectTo = `${appUrl}/auth/login?confirmed=1`;
    const { error: linkErr } = await admin.auth.admin.generateLink({
      type:  "signup",
      email,
      password,
      options: { redirectTo },
    });
    if (linkErr) console.error("[register] generateLink warning:", linkErr.message);

    return NextResponse.json({ userId, requiresEmailConfirmation: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
