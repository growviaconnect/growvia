import { NextRequest, NextResponse } from "next/server";
import { sendBookingConfirmation, type BookingParams } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as BookingParams;
  const { mentorEmail, mentorNom, menteeEmail, menteeNom, date, sessionId } = body;

  if (!mentorEmail || !mentorNom || !menteeEmail || !menteeNom || !date || !sessionId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const results = await sendBookingConfirmation(body);
  const failed  = results.filter(r => r.error);
  if (failed.length) return NextResponse.json({ error: failed[0].error }, { status: 500 });
  return NextResponse.json({ sent: true });
}
