import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://growviaconnect.com";

export async function POST(req: NextRequest) {
  try {
    const { mentorEmail, mentorNom, menteeNom, title } = (await req.json()) as {
      mentorEmail: string; mentorNom: string; menteeNom: string; title: string;
    };
    if (!mentorEmail || !menteeNom) return NextResponse.json({ ok: false });

    const key = process.env.RESEND_API_KEY ?? "";
    if (!key) return NextResponse.json({ ok: false, reason: "resend_not_configured" });
    const r = new Resend(key);

    const safeTitle  = (title ?? "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeMentee = menteeNom.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    await r.emails.send({
      from: "GrowVia <contact@growviaconnect.com>",
      to:   mentorEmail,
      subject: `${menteeNom} submitted a response — GrowVia`,
      html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f0eeff;font-family:Inter,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0eeff;padding:40px 16px;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="background:#0D0A1A;border-radius:16px 16px 0 0;padding:20px 32px;color:#fff;font-weight:800;font-size:17px;">GrowVia</td></tr>
<tr><td style="background:#fff;border-radius:0 0 16px 16px;padding:36px 32px;">
<h2 style="margin:0 0 8px;color:#0D0A1A;font-size:22px;font-weight:800;">New response from ${safeMentee}</h2>
<p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.65;">
  Your mentee <strong>${safeMentee}</strong> has submitted a response to the assignment
  ${safeTitle ? `<strong>&ldquo;${safeTitle}&rdquo;</strong>` : ""}.
</p>
<a href="${APP_URL}/dashboard" style="display:inline-block;background:#7C3AED;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:10px;">Open workspace &rarr;</a>
<p style="margin:28px 0 0;color:#9ca3af;font-size:12px;line-height:1.6;border-top:1px solid #ede9fe;padding-top:20px;">GrowVia &mdash; Connect your potential</p>
</td></tr></table></td></tr></table></body></html>`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[workspace/notify-response]", err);
    return NextResponse.json({ ok: false });
  }
}
