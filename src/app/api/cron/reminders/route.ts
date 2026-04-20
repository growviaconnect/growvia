import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendSessionReminder } from "@/lib/email";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return createClient(url, key);
}

// Window: ±25 minutes around each target (so hourly cron never misses or double-sends)
const WINDOW_MS = 25 * 60 * 1000;

function window(hoursFromNow: number) {
  const target = Date.now() + hoursFromNow * 3_600_000;
  return {
    from: new Date(target - WINDOW_MS).toISOString(),
    to:   new Date(target + WINDOW_MS).toISOString(),
  };
}

export async function GET(req: NextRequest) {
  // Verify Vercel cron secret to prevent unauthorized calls
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("x-cron-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const results: { window: string; sessionId: string; status: string }[] = [];

  for (const hours of [24, 2] as const) {
    const { from, to } = window(hours);

    const { data: sessions, error } = await supabase
      .from("connexions")
      .select("id, date, statut, mentors(nom, email), mentees(nom, email)")
      .eq("statut", "active")
      .gte("date", from)
      .lte("date", to);

    if (error) {
      results.push({ window: `${hours}h`, sessionId: "query", status: `error: ${error.message}` });
      continue;
    }

    for (const session of sessions ?? []) {
      const mentor = (session.mentors as unknown as { nom: string; email: string } | null);
      const mentee = (session.mentees as unknown as { nom: string; email: string } | null);
      if (!mentor || !mentee) continue;

      const sends = await Promise.allSettled([
        sendSessionReminder({ email: mentor.email, nom: mentor.nom, otherNom: mentee.nom, date: session.date, role: "mentor", hoursUntil: hours }),
        sendSessionReminder({ email: mentee.email, nom: mentee.nom, otherNom: mentor.nom, date: session.date, role: "mentee", hoursUntil: hours }),
      ]);

      results.push({
        window: `${hours}h`,
        sessionId: session.id,
        status: sends.every(s => s.status === "fulfilled") ? "sent" : "partial",
      });
    }
  }

  return NextResponse.json({ ok: true, processed: results.length, results });
}
