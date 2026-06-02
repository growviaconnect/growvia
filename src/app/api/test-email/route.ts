import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// POST /api/test-email
// Body: { to?: string }   — defaults to the admin address if omitted
// Returns the raw Resend API response so you can see exactly what happened.
// Remove this route before going to production.
export async function POST(req: NextRequest) {
  const key = process.env.RESEND_API_KEY ?? "";
  if (!key) {
    return NextResponse.json(
      { ok: false, error: "RESEND_API_KEY is not set in environment variables" },
      { status: 500 }
    );
  }

  let to = "growviaconnect@gmail.com";
  try {
    const body = await req.json();
    if (typeof body?.to === "string" && body.to.includes("@")) to = body.to;
  } catch { /* use default */ }

  const r = new Resend(key);
  const result = await r.emails.send({
    from: "GrowVia <contact@growviaconnect.com>",
    to,
    subject: "GrowVia — Resend test ✓",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;">
        <h2 style="color:#7C3AED;margin-bottom:8px;">Email delivery confirmed ✓</h2>
        <p style="color:#374151;">This test email was sent from <strong>GrowVia</strong> via Resend.</p>
        <p style="color:#6b7280;font-size:13px;">
          Sent at: <strong>${new Date().toISOString()}</strong><br/>
          Environment: <strong>${process.env.NODE_ENV ?? "unknown"}</strong>
        </p>
      </div>
    `,
  });

  if (result.error) {
    console.error("[test-email] Resend error:", result.error);
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  console.log("[test-email] sent successfully, id:", result.data?.id);
  return NextResponse.json({ ok: true, id: result.data?.id, to });
}
