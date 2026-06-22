import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendSessionCancellationEmail } from "@/lib/email";

type ConnexionRow = {
  id: string;
  date: string;
  statut: string;
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

  const { data: conn, error: fetchError } = await client
    .from("connexions")
    .select("id, date, statut, mentor_id, mentee_id, mentors(nom, email), mentees(nom, email)")
    .eq("id", connexionId)
    .single() as { data: ConnexionRow | null; error: unknown };

  if (fetchError || !conn) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (conn.statut === "cancelled") {
    return NextResponse.json({ error: "Already cancelled" }, { status: 409 });
  }

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
    .update({ status: "cancelled" })
    .eq("mentor_id", conn.mentor_id)
    .eq("mentee_id", conn.mentee_id)
    .in("status", ["pending", "rescheduled", "confirmed"]);

  // Refund eligibility: cancellation must be made more than 2 hours before session start
  const sessionStart = new Date(conn.date).getTime();
  const refundEligible = sessionStart - Date.now() > 2 * 60 * 60 * 1000;

  // Send cancellation confirmation email to mentee
  const menteeEmail = conn.mentees?.email;
  if (menteeEmail) {
    sendSessionCancellationEmail({
      menteeEmail,
      menteeNom:      conn.mentees?.nom  ?? "Mentee",
      mentorNom:      conn.mentors?.nom  ?? "Mentor",
      sessionDate:    conn.date,
      refundEligible,
    }).catch(err => console.error("[mentee-cancel] email send failed:", err));
  }

  return NextResponse.json({ success: true, refundEligible });
}
