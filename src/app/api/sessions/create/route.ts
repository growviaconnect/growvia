import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendBookingConfirmation } from "@/lib/email";

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? "";
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  // ── Step 0: Validate environment ──────────────────────────────────────────
  console.log("[sessions/create] STEP 0 — env check", {
    hasSupabaseUrl: !!supabaseUrl,
    hasServiceKey:  !!serviceKey,
    hasAnonKey:     !!anonKey,
    usingKey:       serviceKey ? "service_role" : "anon",
  });

  if (!supabaseUrl || !anonKey) {
    console.error("[sessions/create] STEP 0 FAILED — missing Supabase env vars");
    return NextResponse.json({
      error: "Server misconfiguration",
      step:  "env",
      detail: { supabaseUrl: !!supabaseUrl, anonKey: !!anonKey },
    }, { status: 500 });
  }

  // ── Step 1: Parse request body ─────────────────────────────────────────────
  let mentorId: string, menteeEmail: string, topic: string,
      date: string, time: string, language: string, durationMinutes: number,
      priceCents: number | null, isFreeSession: boolean;

  try {
    const body = (await req.json()) as {
      mentorId: string; menteeEmail: string; topic: string;
      date: string; time: string; language?: string; durationMinutes?: number;
      priceCents?: number | null; isFreeSession?: boolean;
    };
    mentorId        = (body.mentorId    ?? "").trim();
    menteeEmail     = (body.menteeEmail ?? "").trim();
    topic           = (body.topic       ?? "").trim();
    date            = (body.date        ?? "").trim();
    time            = (body.time        ?? "").trim();
    language        = (body.language    ?? "").trim();
    durationMinutes = body.durationMinutes ?? 60;
    priceCents      = body.priceCents ?? null;
    isFreeSession   = body.isFreeSession ?? false;

    console.log("[sessions/create] STEP 1 — request body parsed", {
      mentorId, menteeEmail, date, time, topic, language,
      durationMinutes, priceCents, isFreeSession,
    });

    if (!mentorId || !menteeEmail || !date || !time) {
      throw new Error(`missing required fields: mentorId=${mentorId} menteeEmail=${menteeEmail} date=${date} time=${time}`);
    }
  } catch (e) {
    console.error("[sessions/create] STEP 1 FAILED — bad request body:", e);
    return NextResponse.json({ error: "Bad request", step: "parse", detail: String(e) }, { status: 400 });
  }

  const client = createClient(supabaseUrl, serviceKey || anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // ── Step 2: Resolve mentee ─────────────────────────────────────────────────
  console.log("[sessions/create] STEP 2 — looking up mentee by email:", menteeEmail);
  const { data: menteeRow, error: menteeErr } = await client
    .from("mentees")
    .select("id, nom, free_session_used")
    .eq("email", menteeEmail)
    .single() as { data: { id: string; nom: string; free_session_used: boolean } | null; error: unknown };

  console.log("[sessions/create] STEP 2 — mentee lookup result:", {
    found: !!menteeRow,
    id: menteeRow?.id,
    free_session_used: menteeRow?.free_session_used,
    error: menteeErr,
  });

  if (!menteeRow) {
    return NextResponse.json({
      error: "Mentee account not found",
      step:  "mentee_lookup",
      detail: menteeErr,
    }, { status: 404 });
  }

  if (isFreeSession && menteeRow.free_session_used) {
    return NextResponse.json({ error: "Free session already used", step: "free_session_guard" }, { status: 403 });
  }

  // ── Step 3: Resolve mentor ─────────────────────────────────────────────────
  console.log("[sessions/create] STEP 3 — looking up mentor:", mentorId);
  const { data: mentorRow, error: mentorErr } = await client
    .from("mentors")
    .select("email, nom")
    .eq("id", mentorId)
    .single() as { data: { email: string; nom: string } | null; error: unknown };

  console.log("[sessions/create] STEP 3 — mentor lookup result:", {
    found: !!mentorRow,
    email: mentorRow?.email,
    error: mentorErr,
  });

  if (!mentorRow) {
    return NextResponse.json({
      error: "Mentor not found",
      step:  "mentor_lookup",
      detail: mentorErr,
    }, { status: 404 });
  }

  const dateTimeIso = `${date}T${time}:00`;
  console.log("[sessions/create] dateTimeIso:", dateTimeIso);

  // ── Step 4: Insert connexion (primary dashboard record) ────────────────────
  const connexionPayload = {
    mentor_id: mentorId,
    mentee_id: menteeRow.id,
    statut:    "pending",
    date:      dateTimeIso,
  };
  console.log("[sessions/create] STEP 4 — inserting connexion:", connexionPayload);

  const { data: connexionRow, error: connexionErr } = await client
    .from("connexions")
    .insert(connexionPayload)
    .select("id")
    .single() as { data: { id: string } | null; error: unknown };

  console.log("[sessions/create] STEP 4 — connexion insert result:", {
    success: !!connexionRow,
    id: connexionRow?.id,
    error: connexionErr,
  });

  if (connexionErr || !connexionRow) {
    console.error("[sessions/create] STEP 4 FAILED — connexion insert:", JSON.stringify(connexionErr));
    return NextResponse.json({
      error:  "Failed to create session",
      step:   "connexion_insert",
      detail: connexionErr,
    }, { status: 500 });
  }

  // ── Step 5: Mark free session used ────────────────────────────────────────
  if (isFreeSession) {
    console.log("[sessions/create] STEP 5 — marking free_session_used for mentee:", menteeRow.id);
    const { error: flagErr } = await client
      .from("mentees")
      .update({ free_session_used: true })
      .eq("id", menteeRow.id);
    if (flagErr) {
      console.error("[sessions/create] STEP 5 WARN — failed to mark free_session_used:", JSON.stringify(flagErr));
    } else {
      console.log("[sessions/create] STEP 5 — free_session_used marked");
    }
  }

  // ── Step 6: Insert sessions row (best-effort) ──────────────────────────────
  const sessionPayload = {
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
  };
  console.log("[sessions/create] STEP 6 — inserting sessions row:", sessionPayload);

  let sessionId: string | null = null;
  const { data: sessionRow, error: sessionErr } = await client
    .from("sessions")
    .insert(sessionPayload)
    .select("id")
    .single() as { data: { id: string } | null; error: unknown };

  console.log("[sessions/create] STEP 6 — sessions insert result:", {
    success: !!sessionRow,
    id: sessionRow?.id,
    error: sessionErr,
  });

  if (sessionErr || !sessionRow) {
    console.error(
      "[sessions/create] STEP 6 WARN — sessions insert failed (connexion %s still valid): %s",
      connexionRow.id, JSON.stringify(sessionErr),
    );
  } else {
    sessionId = sessionRow.id;
  }

  // ── Step 7: Send booking confirmation emails ───────────────────────────────
  console.log("[sessions/create] STEP 7 — sending confirmation emails");
  sendBookingConfirmation({
    mentorEmail: mentorRow.email,
    mentorNom:   mentorRow.nom,
    menteeEmail,
    menteeNom:   menteeRow.nom,
    date:        dateTimeIso,
    sessionId:   sessionId ?? connexionRow.id,
  }).catch(err => console.error("[sessions/create] STEP 7 WARN — email send failed:", err));

  console.log("[sessions/create] SUCCESS — connexionId:", connexionRow.id, "sessionId:", sessionId);
  return NextResponse.json({
    success:   true,
    sessionId: sessionId ?? connexionRow.id,
    debug: {
      connexionId: connexionRow.id,
      sessionId,
      sessionInsertFailed: !sessionId,
      sessionErr: sessionErr ?? null,
    },
  });
}
