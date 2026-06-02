import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const { to, senderNom, preview } = (await req.json()) as {
      to: string;
      senderNom: string;
      preview: string;
    };

    if (!to || !senderNom) return NextResponse.json({ ok: false });

    const key = process.env.RESEND_API_KEY ?? "";
    if (!key) return NextResponse.json({ ok: false });

    const r = new Resend(key);
    await r.emails.send({
      from: "GrowVia <contact@growviaconnect.com>",
      to,
      subject: `New message from ${senderNom} — GrowVia`,
      html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f0eeff;font-family:Inter,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0eeff;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
        <tr><td style="background:#0D0A1A;border-radius:16px 16px 0 0;padding:20px 32px;">
          <span style="color:#fff;font-weight:800;font-size:17px;">GrowVia</span>
        </td></tr>
        <tr><td style="background:#fff;border-radius:0 0 16px 16px;padding:36px 32px;">
          <h2 style="margin:0 0 8px;color:#0D0A1A;font-size:22px;font-weight:800;">New message from ${senderNom}</h2>
          <p style="margin:0 0 20px;color:#6b7280;font-size:15px;line-height:1.6;">
            ${senderNom} sent you a message in your GrowVia workspace.
          </p>
          <div style="background:#f5f3ff;border-radius:10px;border:1px solid #ede9fe;padding:14px 18px;color:#374151;font-size:14px;line-height:1.65;margin-bottom:28px;">
            &ldquo;${preview.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}${preview.length >= 120 ? "&hellip;" : ""}&rdquo;
          </div>
          <a href="https://growviaconnect.com/dashboard"
            style="display:inline-block;background:#7C3AED;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:10px;">
            Open workspace &rarr;
          </a>
          <p style="margin:28px 0 0;color:#9ca3af;font-size:12px;line-height:1.6;border-top:1px solid #ede9fe;padding-top:20px;">
            GrowVia &mdash; Connect your potential &nbsp;&bull;&nbsp;
            <a href="https://growviaconnect.com" style="color:#7C3AED;text-decoration:none;">growviaconnect.com</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[workspace/notify]", err);
    return NextResponse.json({ ok: false });
  }
}
