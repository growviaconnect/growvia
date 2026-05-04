import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendBookingConfirmation } from "@/lib/email";

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? "";
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  let mentorId: string, menteeEmail: string, topic: string,
      date: string, time: string, language: string, durationMinutes: number, priceCents: number | null,
      isFreeSession: boolean;

  try {
    const body = (await req.json()) as {
      mentorId: string; menteeEmail: string; topic: string;
      date: string; time: string; language?: string; durationMinutes?: number;
      priceCents?: number | null; isFreeSession?: boolean;
    };
    mentorId       = (body.mentorId    ?? "").trim();
    menteeEmail    = (body.menteeEmail ?? "").trim();
    topic          = (body.topic       ?? "").trim();
    date           = (body.date        ?? "").trim();
    time           = (body.time        ?? "").trim();
    language       = (body.language    ?? "").trim();
    durationMinutes = body.durationMinutes ?? 60;
    priceCents     = body.priceCents ?? null;
    isFreeSession  = body.isFreeSession ?? false;
    if (!mentorId || !menteeEmail || !date || !time) throw new Error("missing fields");
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const client = createClient(supabaseUrl, serviceKey || anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Resolve mentee DB id + free_session_used flag
  const { data: menteeRow } = await client
    .from("mentees")
    .select("id, nom, free_session_used")
    .eq("email", menteeEmail)
    .single() as { data: { id: string; nom: string; free_session_used: boolean } | null };

  if (!menteeRow) {
    return NextResponse.json({ error: "Mentee account not found" }, { status: 404 });
  }

  // Guard the free-session path: reject if they've already used it
  if (isFreeSession && menteeRow.free_session_used) {
    return NextResponse.json({ error: "Free session already used" }, { status: 403 });
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

  const dateTimeIso = `${date}T${time}:00`;

  // Insert session
  const { data: sessionRow, error: sessionErr } = await client
    .from("sessions")
    .insert({
      mentor_id:        mentorId,
      mentee_id:        menteeRow.id,
      mentee_email:     menteeEmail,
      topic:            topic || null,
      date,
      time,
      language:         language || null,
      duration_minutes: durationMinutes,
      price_cents:      isFreeSession ? 0 : priceCents,
      status:           "pending",
    })
    .select("id")
    .single() as { data: { id: string } | null; error: unknown };

  if (sessionErr || !sessionRow) {
    console.error("[sessions/create] sessions insert:", sessionErr);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }

  // Mark free session as used (atomically after successful insert)
  if (isFreeSession) {
    await client.from("mentees").update({ free_session_used: true }).eq("id", menteeRow.id);
  }

  // Also insert into connexions so the dashboard can display it
  await client.from("connexions").insert({
    mentor_id: mentorId,
    mentee_id: menteeRow.id,
    statut:    "pending",
    date:      dateTimeIso,
  });

  // Send booking confirmation emails
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
