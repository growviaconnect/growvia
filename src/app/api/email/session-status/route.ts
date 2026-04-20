import { NextRequest, NextResponse } from "next/server";
import { sendSessionStatusNotification, type StatusParams } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as StatusParams;
  const { menteeEmail, menteeNom, mentorNom, date, accepted } = body;

  if (!menteeEmail || !menteeNom || !mentorNom || !date || accepted === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { error } = await sendSessionStatusNotification(body);
  if (error) return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  return NextResponse.json({ sent: true });
}
