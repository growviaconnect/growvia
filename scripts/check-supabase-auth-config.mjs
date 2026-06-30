#!/usr/bin/env node
/**
 * Diagnostic: read the live Supabase Auth configuration via the Management
 * API and print the SMTP block + reset-password related flags.
 *
 * Usage
 * -----
 *   1. Create a Personal Access Token:
 *      https://supabase.com/dashboard/account/tokens
 *      ("Generate new token" — copy it ONCE).
 *
 *   2. Run:
 *      SUPABASE_ACCESS_TOKEN="sbp_..." \
 *      SUPABASE_PROJECT_REF="txpibvjktfltowjmvvmg" \
 *        node scripts/check-supabase-auth-config.mjs
 *
 *   (SUPABASE_PROJECT_REF defaults to the value used in src/lib/supabase.ts.)
 *
 * What it prints
 * --------------
 *   - smtp_admin_email / sender_name
 *   - smtp_host / smtp_port / smtp_user
 *   - whether smtp_pass is set (NEVER prints the value)
 *   - external_email_enabled (must be true for reset emails to be sent)
 *   - mailer_secure_email_change_enabled
 *   - mailer_autoconfirm
 *   - site_url + uri_allow_list (the redirectTo allow-list — most common cause
 *     of silent reset-email failures)
 *
 * No data is sent anywhere — the script just calls the Management API and
 * prints to stdout.
 */

const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref   = process.env.SUPABASE_PROJECT_REF ?? "txpibvjktfltowjmvvmg";

if (!token) {
  console.error("Missing SUPABASE_ACCESS_TOKEN.\n" +
    "Get one at https://supabase.com/dashboard/account/tokens and re-run:\n" +
    "  SUPABASE_ACCESS_TOKEN=\"sbp_...\" node scripts/check-supabase-auth-config.mjs");
  process.exit(1);
}

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/auth`, {
  headers: { Authorization: `Bearer ${token}` },
});

if (!res.ok) {
  console.error(`Management API returned ${res.status} ${res.statusText}`);
  console.error(await res.text());
  process.exit(1);
}

const cfg = await res.json();

const show = (k) => cfg[k] ?? "(empty)";
const yn   = (k) => (cfg[k] === true ? "YES" : cfg[k] === false ? "no" : "(unset)");

console.log(`\nProject: ${ref}\n`);
console.log("── SMTP ─────────────────────────────────────────────");
console.log(`sender_email     : ${show("smtp_admin_email")}`);
console.log(`sender_name      : ${show("smtp_sender_name")}`);
console.log(`smtp_host        : ${show("smtp_host")}`);
console.log(`smtp_port        : ${show("smtp_port")}`);
console.log(`smtp_user        : ${show("smtp_user")}`);
console.log(`smtp_pass set?   : ${cfg.smtp_pass ? "YES" : "no"}`);
console.log(`smtp_max_frequency: ${show("smtp_max_frequency")}`);
console.log("");
console.log("── Email flags ──────────────────────────────────────");
console.log(`external_email_enabled         : ${yn("external_email_enabled")}`);
console.log(`mailer_autoconfirm             : ${yn("mailer_autoconfirm")}`);
console.log(`mailer_secure_email_change     : ${yn("mailer_secure_email_change_enabled")}`);
console.log(`disable_signup                 : ${yn("disable_signup")}`);
console.log("");
console.log("── URL config (redirect allow-list) ─────────────────");
console.log(`site_url       : ${show("site_url")}`);
console.log(`uri_allow_list : ${show("uri_allow_list")}`);
console.log("");
console.log("── Reset-password rate-limit ────────────────────────");
console.log(`rate_limit_email_sent : ${show("rate_limit_email_sent")} (emails / hour)`);
console.log("");

// Heuristic diagnosis
console.log("── Diagnosis ────────────────────────────────────────");
const usingCustom = (cfg.smtp_host && cfg.smtp_host.toLowerCase() !== "smtp.supabase.co");
console.log(`Custom SMTP active?  ${usingCustom ? "YES" : "NO — Supabase default email service in use"}`);
if (cfg.smtp_host) console.log(`  Host configured: ${cfg.smtp_host}`);
if (!cfg.smtp_pass) console.log("  ⚠️  smtp_pass is NOT set → Supabase will fall back to default email");
const allow = (cfg.uri_allow_list ?? "").toString();
const needsReset = "/admin/reset-password";
if (!allow.includes(needsReset) && !allow.includes("/**")) {
  console.log(`  ⚠️  '${needsReset}' is NOT in uri_allow_list → resetPasswordForEmail will be silently dropped`);
}
console.log("");
