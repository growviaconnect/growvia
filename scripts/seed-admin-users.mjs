#!/usr/bin/env node
/**
 * One-time seed: create Supabase Auth users for the two GrowVia founders.
 *
 * Usage
 * -----
 *   NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co" \
 *   SUPABASE_SERVICE_ROLE_KEY="..." \
 *   LUNA_INIT_PASSWORD="..." \
 *   YASMINE_INIT_PASSWORD="..." \
 *     node scripts/seed-admin-users.mjs
 *
 * If INIT passwords are omitted, a random password is generated and printed.
 * Each founder can change her own password later through the standard
 * "Forgot password" flow on /admin.
 *
 * Re-running this script on an existing user returns an error from Supabase,
 * which the script logs and continues past — it's safe to re-run.
 */

import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const seeds = [
  { name: "Luna Davin",    email: "lunadavin@growviaconnect.com",    pwd: process.env.LUNA_INIT_PASSWORD    },
  { name: "Yasmine Tunon", email: "yasminetunon@growviaconnect.com", pwd: process.env.YASMINE_INIT_PASSWORD },
];

for (const s of seeds) {
  const password = s.pwd ?? randomBytes(12).toString("base64url");
  const { data, error } = await admin.auth.admin.createUser({
    email: s.email,
    password,
    email_confirm: true,
    user_metadata: { name: s.name, role: "founder" },
  });
  if (error) {
    console.error(`[${s.email}] ${error.message}`);
  } else {
    console.log(`[${s.email}] created (id=${data.user?.id})${s.pwd ? "" : ` — initial password: ${password}`}`);
  }
}
