import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendWelcomeEmail } from "@/lib/email";

/**
 * Signup flow: no email verification. The user is created with
 * email_confirm=true so auth.users.email_confirmed_at is populated
 * immediately and they can sign in right away.
 *
 * Access is intentionally not gated by any email confirmation. If we ever
 * need to re-introduce it, flip Supabase Auth's mailer_autoconfirm to
 * false and set email_confirm=false here.
 */
export async function POST(req: NextRequest) {
  const env = process.env;
  const supabaseUrl = env["NEXT_PUBLIC_SUPABASE_URL"] || "";
  const serviceKey  = env["SUPABASE_SERVICE_ROLE_KEY"] || env["SUPABASE_SECRET_KEY"] || "";

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

    // Create the auth user pre-confirmed.
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role, nom },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const userId = data.user.id;

    // Insert the domain row keyed by auth.users.id so onboarding finds it later.
    const table = role === "mentor" ? "mentors" : role === "mentee" ? "mentees" : null;
    if (table) {
      const { error: insertErr } = await admin.from(table).insert({
        id: userId, nom, email, statut: "active",
      });
      if (insertErr) console.error("[register] domain insert warning:", insertErr.message);
    }

    // Fire-and-forget welcome email through Resend REST (traceable in the
    // Resend dashboard). Never blocks the signup response.
    sendWelcomeEmail(email, nom, role).catch(err =>
      console.error("[register] welcome email failed:", err),
    );

    return NextResponse.json({ userId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
