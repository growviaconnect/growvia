import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createMeetSession } from "@/lib/google-calendar";
import { sendConfirmationWithMeet } from "@/lib/email";

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

  // Fetch connexion with mentor and mentee details
  const { data: conn, error: fetchError } = await client
    .from("connexions")
    .select("id, date, mentor_id, mentee_id, mentors(nom, email), mentees(nom, email)")
    .eq("id", connexionId)
    .single() as { data: ConnexionRow | null; error: unknown };

  if (fetchError || !conn) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Create Google Meet link (non-fatal if it fails)
  let meetLink = "";
  try {
    meetLink = await createMeetSession({
      mentorName:  conn.mentors?.nom   ?? "Mentor",
      mentorEmail: conn.mentors?.email ?? "",
      menteeName:  conn.mentees?.nom   ?? "Mentee",
      menteeEmail: conn.mentees?.email ?? "",
      startIso:    conn.date,
    });
  } catch (err) {
    console.error("[accept] Google Meet creation failed:", err);
  }

  // Update connexion: statut → active, store meet_link
  const { error: updateError } = await client
    .from("connexions")
    .update({ statut: "active", ...(meetLink ? { meet_link: meetLink } : {}) })
    .eq("id", connexionId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Mirror to sessions table (best-effort: update existing row if one matches)
  await client
    .from("sessions")
    .update({ status: "confirmed", ...(meetLink ? { meet_link: meetLink } : {}) })
    .eq("mentor_id", conn.mentor_id)
    .eq("mentee_id", conn.mentee_id);

  // Send confirmation emails with Meet link to both parties
  sendConfirmationWithMeet({
    mentorEmail: conn.mentors?.email ?? "",
    mentorNom:   conn.mentors?.nom   ?? "Mentor",
    menteeEmail: conn.mentees?.email ?? "",
    menteeNom:   conn.mentees?.nom   ?? "Mentee",
    date:        conn.date,
    meetLink:    meetLink || undefined,
  }).catch(err => console.error("[accept] email send failed:", err));

  return NextResponse.json({ success: true, meetLink: meetLink || null });
}
