import { NextRequest, NextResponse } from "next/server";
import { sendBookingConfirmation, scheduleSessionReminders, type BookingParams } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as BookingParams;
  const { mentorEmail, mentorNom, menteeEmail, menteeNom, date, sessionId } = body;

  if (!mentorEmail || !mentorNom || !menteeEmail || !menteeNom || !date || !sessionId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Send booking confirmations immediately
  const results = await sendBookingConfirmation(body);
  const failed  = results.filter(r => r.error);
  if (failed.length) return NextResponse.json({ error: failed[0].error }, { status: 500 });

  // Schedule 24h and 2h reminders via Resend's scheduledAt — no cron needed
  scheduleSessionReminders({ mentorEmail, mentorNom, menteeEmail, menteeNom, sessionDate: date }).catch(() => {});

  return NextResponse.json({ sent: true });
}
