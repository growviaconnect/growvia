#!/usr/bin/env node
/**
 * Diagnostic: verify the Resend setup that Supabase Auth relies on.
 *
 * Three checks, in order:
 *   1. Is the API key valid? (calls GET /domains on Resend)
 *   2. Is the sender domain (growviaconnect.com) verified?
 *   3. Does a real SMTP send succeed with the same creds Supabase uses?
 *
 * Usage
 * -----
 *   RESEND_API_KEY="re_..." \
 *   TEST_TO="your-personal@gmail.com" \
 *     node scripts/check-resend-smtp.mjs
 *
 *   TEST_TO is the destination address for the live test send. If you have
 *   the Resend account in sandbox mode, only the address you signed up with
 *   is accepted — use that as TEST_TO.
 */

import nodemailer from "nodemailer";

const apiKey = process.env.RESEND_API_KEY;
const testTo = process.env.TEST_TO;

if (!apiKey) {
  console.error("Missing RESEND_API_KEY. Get it from https://resend.com/api-keys");
  process.exit(1);
}
if (!testTo) {
  console.error("Missing TEST_TO (destination email for the test send).");
  process.exit(1);
}

const SENDER = "contact@growviaconnect.com";
const DOMAIN = "growviaconnect.com";

console.log("\n── 1. Validate Resend API key ──────────────────────");
{
  const res = await fetch("https://api.resend.com/domains", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    console.log(`  ❌ API key rejected (HTTP ${res.status}). Body: ${await res.text()}`);
    console.log("  → The same key is in Supabase smtp_pass. Generate a new one.");
    process.exit(1);
  }
  console.log("  ✅ API key accepted");
}

console.log("\n── 2. Check sender domain verification ─────────────");
{
  const res = await fetch("https://api.resend.com/domains", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const json = await res.json();
  const domains = json?.data ?? [];
  console.log(`  Found ${domains.length} domain(s) in this Resend account:`);
  for (const d of domains) {
    console.log(`   - ${d.name} (region ${d.region ?? "?"}, status: ${d.status})`);
  }
  const target = domains.find(d => d.name?.toLowerCase() === DOMAIN);
  if (!target) {
    console.log(`  ❌ ${DOMAIN} is NOT in this Resend account.`);
    console.log("  → Either add it at https://resend.com/domains, or you're using");
    console.log("    an API key from a different Resend account than the one set up.");
  } else if (target.status !== "verified") {
    console.log(`  ❌ ${DOMAIN} exists but status is "${target.status}" (not verified).`);
    console.log("  → Resend will reject every send from this domain until DNS is verified.");
  } else {
    console.log(`  ✅ ${DOMAIN} is verified`);
  }
}

console.log("\n── 3. Live SMTP send test ──────────────────────────");
{
  const transporter = nodemailer.createTransport({
    host: "smtp.resend.com",
    port: 465,
    secure: true,
    auth: { user: "resend", pass: apiKey },
  });
  try {
    await transporter.verify();
    console.log("  ✅ SMTP authentication succeeded (server greeting OK)");
  } catch (e) {
    console.log(`  ❌ SMTP verify failed: ${e.message}`);
    process.exit(1);
  }

  try {
    const info = await transporter.sendMail({
      from: `GrowVia <${SENDER}>`,
      to: testTo,
      subject: "GrowVia SMTP diagnostic — please ignore",
      text: "If you receive this, the same path Supabase Auth uses for password-reset emails is working.",
    });
    console.log(`  ✅ Message accepted by Resend SMTP (id=${info.messageId})`);
    console.log(`     Watch ${testTo} for it within a minute, and check Resend > Emails.`);
  } catch (e) {
    console.log(`  ❌ sendMail failed: ${e.message}`);
    if (e.responseCode) console.log(`     SMTP response code: ${e.responseCode}`);
    if (e.response)     console.log(`     SMTP response: ${e.response}`);
  }
}
