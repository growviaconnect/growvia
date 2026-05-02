import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createMeetLink } from "@/lib/google-meet";
import { sendSessionStatusNotification, scheduleSessionReminders } from "@/lib/email";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL  ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: NextRequest) {
  const { connexId } = await req.json() as { connexId: string };
  if (!connexId) return NextResponse.json({ error: "connexId required" }, { status: 400 });

  const db = adminClient();

  const { data: conn, error: fetchErr } = await db
    .from("connexions")
    .select("id, date, mentors(nom, email), mentees(nom, email)")
    .eq("id", connexId)
    .single();

  if (fetchErr || !conn) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Generate Meet link — non-fatal if Google creds are missing or API fails
  let meetLink: string | null = null;
  try {
    const start = new Date(conn.date as string);
    const end   = new Date(start.getTime() + 60 * 60_000);
    const mentor = conn.mentors as { nom: string; email: string } | null;
    const mentee = conn.mentees as { nom: string; email: string } | null;
    meetLink = await createMeetLink({
      title:     `GrowVia — ${mentor?.nom ?? "Mentor"} × ${mentee?.nom ?? "Mentee"}`,
      startIso:  start.toISOString(),
      endIso:    end.toISOString(),
      attendees: [mentor?.email, mentee?.email].filter(Boolean) as string[],
    });
  } catch (e) {
    console.error("[session/accept] Meet link generation failed:", e);
  }

  // Confirm session in DB
  const { error: updateErr } = await db
    .from("connexions")
    .update({ statut: "active", meet_link: meetLink })
    .eq("id", connexId);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  const mentor     = conn.mentors as { nom: string; email: string } | null;
  const mentee     = conn.mentees as { nom: string; email: string } | null;
  const mentorNom  = mentor?.nom  ?? "your mentor";
  const menteeNom  = mentee?.nom  ?? "your mentee";
  const mentorEmail = mentor?.email ?? "";
  const menteeEmail = mentee?.email ?? "";
  const sessionDate = conn.date as string;

  // Notify mentee (fire-and-forget)
  if (menteeEmail) {
    sendSessionStatusNotification({
      menteeEmail,
      menteeNom,
      mentorNom,
      date:     sessionDate,
      accepted: true,
      meetLink: meetLink ?? undefined,
    }).catch(() => {});
  }

  // Schedule 24h + 2h reminders for both parties
  if (mentorEmail && menteeEmail) {
    scheduleSessionReminders({
      mentorEmail,
      mentorNom,
      menteeEmail,
      menteeNom,
      sessionDate,
      meetLink: meetLink ?? undefined,
    }).catch(() => {});
  }

  return NextResponse.json({ accepted: true, meetLink });
}
