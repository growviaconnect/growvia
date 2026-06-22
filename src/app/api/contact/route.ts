import { NextRequest, NextResponse } from "next/server";
import { sendContactNotification, sendContactConfirmation } from "@/lib/email";

export async function POST(req: NextRequest) {
  let name: string, email: string, subject: string, message: string;
  try {
    const body = await req.json();
    name    = (body.name    ?? "").trim();
    email   = (body.email   ?? "").trim();
    subject = (body.subject ?? "").trim();
    message = (body.message ?? "").trim();
    if (!name || !email || !subject || !message) throw new Error("missing fields");
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const params = { name, email, subject, message };

  const { error } = await sendContactNotification(params);
  if (error) {
    console.error("[api/contact] notification failed:", error);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }

  // Confirmation to sender is best-effort
  sendContactConfirmation(params).catch(err =>
    console.error("[api/contact] confirmation failed:", err)
  );

  return NextResponse.json({ sent: true });
}
