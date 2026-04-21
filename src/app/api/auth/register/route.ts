import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  await connection();

  // Assign to a local variable first — Next.js docs confirm that
  // `const env = process.env; env.VAR` is NOT statically inlined at build
  // time, unlike direct `process.env.VAR` dot-notation access.
  const env = process.env;
  const supabaseUrl = env["NEXT_PUBLIC_SUPABASE_URL"] || "";
  const serviceKey =
    env["SUPABASE_SERVICE_ROLE_KEY"] ||
    env["SUPABASE_SECRET_KEY"] ||
    "";

  if (!serviceKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not set in environment variables." },
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

  sendWelcomeEmail(email, nom, role).catch(() => {});

  return NextResponse.json({ userId: data.user.id });
}
