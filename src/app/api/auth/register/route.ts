import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendWelcomeEmail } from "@/lib/email";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  // Accept either naming convention used in different Supabase dashboard versions
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    ?? process.env.SUPABASE_SECRET_KEY
    ?? "";
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(req: NextRequest) {
  const { email, password, role, nom } = (await req.json()) as {
    email: string;
    password: string;
    role: string;
    nom: string;
  };

  const admin = getAdminClient();

  if (!admin) {
    return NextResponse.json(
      { error: "Server misconfiguration: set SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) in your environment variables." },
      { status: 503 }
    );
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role, nom },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Send welcome email (best-effort — don't fail registration if email fails)
  sendWelcomeEmail(email, nom, role).catch(() => {});

  return NextResponse.json({ userId: data.user.id });
}
