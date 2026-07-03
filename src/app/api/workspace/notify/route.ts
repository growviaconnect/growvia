import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://growviaconnect.com";
const ACTIVE_WINDOW_MS = 60_000; // recipient counts as "active" if seen within the last 60 s

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function isRecipientActive(email: string): Promise<boolean> {
  const c = admin();
  const cutoff = new Date(Date.now() - ACTIVE_WINDOW_MS).toISOString();
  const [m1, m2] = await Promise.all([
    c.from("mentors").select("last_active_at").eq("email", email).maybeSingle(),
    c.from("mentees").select("last_active_at").eq("email", email).maybeSingle(),
  ]);
  const t = ((m1.data as { last_active_at: string | null } | null)?.last_active_at)
         ?? ((m2.data as { last_active_at: string | null } | null)?.last_active_at)
         ?? null;
  return !!t && t > cutoff;
}

export async function POST(req: NextRequest) {
  try {
    const { to, senderNom, preview } = (await req.json()) as {
      to: string; senderNom: string; preview: string;
    };
    if (!to || !senderNom) return NextResponse.json({ ok: false });

    // Suppress the email if the recipient is currently on the app.
    if (await isRecipientActive(to)) {
      return NextResponse.json({ ok: true, skipped: "recipient_active" });
    }

    const key = process.env.RESEND_API_KEY ?? "";
    if (!key) return NextResponse.json({ ok: false });
    const r = new Resend(key);

    const safePreview = preview.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeSender  = senderNom.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    await r.emails.send({
      from: "GrowVia <contact@growviaconnect.com>",
      to,
      subject: `New message from ${senderNom} — GrowVia`,
      html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f0eeff;font-family:Inter,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0eeff;padding:40px 16px;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="background:#0D0A1A;border-radius:16px 16px 0 0;padding:20px 32px;color:#fff;font-weight:800;font-size:17px;">GrowVia</td></tr>
<tr><td style="background:#fff;border-radius:0 0 16px 16px;padding:36px 32px;">
<h2 style="margin:0 0 8px;color:#0D0A1A;font-size:22px;font-weight:800;">You have a new message from ${safeSender}</h2>
<p style="margin:0 0 20px;color:#6b7280;font-size:15px;line-height:1.6;">${safeSender} sent you a message on GrowVia Connect.</p>
<div style="background:#f5f3ff;border-radius:10px;border:1px solid #ede9fe;padding:14px 18px;color:#374151;font-size:14px;line-height:1.65;margin-bottom:28px;">&ldquo;${safePreview}${preview.length >= 120 ? "&hellip;" : ""}&rdquo;</div>
<a href="${APP_URL}/dashboard" style="display:inline-block;background:#7C3AED;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:10px;">Open workspace &rarr;</a>
<p style="margin:28px 0 0;color:#9ca3af;font-size:12px;line-height:1.6;border-top:1px solid #ede9fe;padding-top:20px;">GrowVia &mdash; Connect your potential</p>
</td></tr></table></td></tr></table></body></html>`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[workspace/notify]", err);
    return NextResponse.json({ ok: false });
  }
}
