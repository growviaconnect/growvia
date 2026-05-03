import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendSessionStatusNotification } from "@/lib/email";

type ConnexionRow = {
  id: string;
  date: string;
  mentor_id: string;
  mentee_id: string;
  mentors: { nom: string; email: string } | null;
  mentees: { nom: string; email: string } | null;
};

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? "";
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  let connexionId: string;
  try {
    const body = (await req.json()) as { connexionId: string };
    connexionId = (body.connexionId ?? "").trim();
    if (!connexionId) throw new Error("missing connexionId");
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const client = createClient(supabaseUrl, serviceKey || anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Fetch connexion details for email
  const { data: conn, error: fetchError } = await client
    .from("connexions")
    .select("id, date, mentor_id, mentee_id, mentors(nom, email), mentees(nom, email)")
    .eq("id", connexionId)
    .single() as { data: ConnexionRow | null; error: unknown };

  if (fetchError || !conn) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Update connexion: statut → cancelled
  const { error: updateError } = await client
    .from("connexions")
    .update({ statut: "cancelled" })
    .eq("id", connexionId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Mirror to sessions table (best-effort)
  await client
    .from("sessions")
    .update({ status: "declined" })
    .eq("mentor_id", conn.mentor_id)
    .eq("mentee_id", conn.mentee_id);

  // Notify the mentee
  sendSessionStatusNotification({
    menteeEmail: conn.mentees?.email ?? "",
    menteeNom:   conn.mentees?.nom   ?? "Mentee",
    mentorNom:   conn.mentors?.nom   ?? "Mentor",
    date:        conn.date,
    accepted:    false,
  }).catch(err => console.error("[decline] email send failed:", err));

  return NextResponse.json({ success: true });
}
