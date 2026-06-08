import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendProposeNewTime } from "@/lib/email";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function POST(req: NextRequest) {
  let connexionId: string, newDate: string, newTime: string;
  try {
    const body = await req.json() as { connexionId: string; newDate: string; newTime: string };
    connexionId = (body.connexionId ?? "").trim();
    newDate     = (body.newDate     ?? "").trim(); // YYYY-MM-DD
    newTime     = (body.newTime     ?? "").trim(); // HH:MM
    if (!connexionId || !newDate || !newTime) throw new Error("missing fields");
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const client = getServiceClient();

  type ConnRow = {
    id: string; date: string; mentor_id: string; mentee_id: string;
    mentors: { nom: string; email: string } | null;
    mentees: { nom: string; email: string } | null;
  };
  const { data: conn } = await client
    .from("connexions")
    .select("id, date, mentor_id, mentee_id, mentors(nom, email), mentees(nom, email)")
    .eq("id", connexionId)
    .single() as { data: ConnRow | null };

  if (!conn) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const newDateTimeIso = `${newDate}T${newTime}:00`;

  // Fetch session row to get duration (for calendar link)
  const { data: sessionRow } = await client
    .from("sessions")
    .select("duration_minutes")
    .eq("mentor_id", conn.mentor_id)
    .eq("mentee_id", conn.mentee_id)
    .in("status", ["pending", "confirmed"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle() as { data: { duration_minutes: number | null } | null };

  const durationMinutes = sessionRow?.duration_minutes ?? 60;

  // Mark connexion as rescheduled and store proposed time
  await client
    .from("connexions")
    .update({ statut: "rescheduled", proposed_date: newDate, proposed_time: newTime })
    .eq("id", connexionId);

  // Mirror proposed time to the sessions row
  await client
    .from("sessions")
    .update({ status: "rescheduled", proposed_date: newDate, proposed_time: newTime })
    .eq("mentor_id", conn.mentor_id)
    .eq("mentee_id", conn.mentee_id)
    .in("status", ["pending", "confirmed"]);

  // Email mentee with calendar link for the proposed new time
  if (conn.mentees?.email) {
    sendProposeNewTime({
      menteeEmail:      conn.mentees.email,
      menteeNom:        conn.mentees.nom   ?? "there",
      mentorNom:        conn.mentors?.nom  ?? "Your mentor",
      newDateIso:       newDateTimeIso,
      durationMinutes,
    }).catch(err => console.error("[modify] email:", err));
  }

  return NextResponse.json({ success: true });
}
