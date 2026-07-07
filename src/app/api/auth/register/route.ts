import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendSignupConfirmation } from "@/lib/email";

/**
 * Signup flow:
 *   1. Create the auth user via admin API with email_confirm = FALSE so
 *      auth.users.email_confirmed_at stays NULL until the user clicks the
 *      confirmation link. No manual admin validation step.
 *   2. Insert the domain row (mentors / mentees) with statut='active'
 *      keyed by auth.users.id.
 *   3. Ask Supabase for the signup confirmation URL via admin.generateLink,
 *      but send the email OURSELVES through Resend REST (rather than
 *      Supabase's SMTP path) so every attempt is traceable in the Resend
 *      dashboard alongside every other transactional email.
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

    // 2. Insert the domain row keyed by auth.users.id.
    const table = role === "mentor" ? "mentors" : role === "mentee" ? "mentees" : null;
    if (table) {
      const { error: insertErr } = await admin.from(table).insert({
        id: userId, nom, email, statut: "active",
      });
      if (insertErr) console.error("[register] domain insert warning:", insertErr.message);
    }

    // 3. Generate the confirmation URL and send it OURSELVES via Resend REST.
    const redirectTo = `${appUrl}/auth/login?confirmed=1`;
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type:     "signup",
      email,
      password,
      options:  { redirectTo },
    });
    if (linkErr || !linkData?.properties?.action_link) {
      console.error("[register] generateLink failed:", linkErr?.message);
      return NextResponse.json({ error: "Could not generate confirmation link" }, { status: 500 });
    }
    const confirmationUrl = linkData.properties.action_link;

    const { error: mailErr } = await sendSignupConfirmation({
      to: email, nom, role, confirmationUrl,
    });
    if (mailErr) {
      console.error("[register] Resend send failed:", mailErr);
      return NextResponse.json({ error: "Confirmation email failed to send" }, { status: 500 });
    }

    return NextResponse.json({ userId, requiresEmailConfirmation: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
