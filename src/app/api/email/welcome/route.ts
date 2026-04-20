import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { to, nom, role } = (await req.json()) as { to: string; nom: string; role: string };
  if (!to || !nom) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const { error } = await sendWelcomeEmail(to, nom, role);
  if (error) return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  return NextResponse.json({ sent: true });
}
