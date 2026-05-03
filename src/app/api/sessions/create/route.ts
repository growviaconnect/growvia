import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendBookingConfirmation } from "@/lib/email";

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? "";
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  let mentorId: string, menteeEmail: string, topic: string,
      date: string, time: string, language: string, durationMinutes: number;

  try {
    const body = (await req.json()) as {
      mentorId: string; menteeEmail: string; topic: string;
      date: string; time: string; language: string; durationMinutes?: number;
    };
    mentorId        = (body.mentorId    ?? "").trim();
    menteeEmail     = (body.menteeEmail ?? "").trim();
    topic           = (body.topic       ?? "").trim();
    date            = (body.date        ?? "").trim();
    time            = (body.time        ?? "").trim();
    language        = (body.language    ?? "").trim();
    durationMinutes = body.durationMinutes ?? 60;
    if (!mentorId || !menteeEmail || !date || !time) throw new Error("missing fields");
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const client = createClient(supabaseUrl, serviceKey || anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Resolve mentee DB id
  const { data: menteeRow } = await client
    .from("mentees")
    .select("id, nom")
    .eq("email", menteeEmail)
    .single() as { data: { id: string; nom: string } | null };

  if (!menteeRow) {
    return NextResponse.json({ error: "Mentee account not found" }, { status: 404 });
  }

  // Resolve mentor email and name
  const { data: mentorRow } = await client
    .from("mentors")
    .select("email, nom")
    .eq("id", mentorId)
    .single() as { data: { email: string; nom: string } | null };

  if (!mentorRow) {
    return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
  }

  // Build the combined datetime ISO string for connexions
  const dateTimeIso = `${date}T${time}:00`;

  // Insert into sessions table
  const { data: sessionRow, error: sessionErr } = await client
    .from("sessions")
    .insert({
      mentor_id:        mentorId,
      mentee_id:        menteeRow.id,
      topic:            topic || null,
      date,
      time,
      duration_minutes: durationMinutes,
      status:           "pending",
    })
    .select("id")
    .single() as { data: { id: string } | null; error: unknown };

  if (sessionErr || !sessionRow) {
    console.error("[sessions/create] sessions insert:", sessionErr);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }

  // Also insert into connexions so the dashboard can display it
  await client
    .from("connexions")
    .insert({
      mentor_id: mentorId,
      mentee_id: menteeRow.id,
      statut:    "pending",
      date:      dateTimeIso,
    });

  // Send booking confirmation emails (to mentor + mentee)
  sendBookingConfirmation({
    mentorEmail: mentorRow.email,
    mentorNom:   mentorRow.nom,
    menteeEmail,
    menteeNom:   menteeRow.nom,
    date:        dateTimeIso,
    sessionId:   sessionRow.id,
  }).catch(err => console.error("[sessions/create] email:", err));

  return NextResponse.json({ success: true, sessionId: sessionRow.id });
}
