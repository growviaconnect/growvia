import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  // connection() opts this handler into dynamic rendering so all
  // process.env reads below happen at request time, never build time.
  await connection();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    "";

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      {
        error:
          "Server misconfiguration: add SUPABASE_SERVICE_ROLE_KEY to your Vercel environment variables.",
      },
      { status: 503 }
    );
  }

  const { email, password, role, nom } = (await req.json()) as {
    email: string;
    password: string;
    role: string;
    nom: string;
  };

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role, nom },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Best-effort — don't fail registration if email sending fails
  sendWelcomeEmail(email, nom, role).catch(() => {});

  return NextResponse.json({ userId: data.user.id });
}
