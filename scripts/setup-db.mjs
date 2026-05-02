#!/usr/bin/env node
/**
 * One-shot script to push pending Supabase migrations, including
 * 009_mentor_availability.sql, directly to the remote database without
 * needing `supabase login` or a linked project.
 *
 * Usage
 * -----
 *   DATABASE_URL="postgresql://postgres.xxxx:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:5432/postgres" \
 *     node scripts/setup-db.mjs
 *
 * Or add it to your shell before running:
 *   export DATABASE_URL="..."
 *   node scripts/setup-db.mjs
 *
 * Where to get DATABASE_URL
 * -------------------------
 * 1. Open Supabase Dashboard → Project Settings → Database
 * 2. Scroll to "Connection string" → select "URI" tab
 * 3. Copy the string — it looks like:
 *      postgresql://postgres.txpibvjktfltowjmvvmg:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
 * 4. Replace [YOUR-PASSWORD] with your actual database password
 *    (visible / resettable on the same page)
 *
 * What this runs
 * --------------
 * npx supabase db push --db-url <DATABASE_URL>
 * This applies every migration in supabase/migrations/ that hasn't been
 * recorded in the remote supabase_migrations.schema_migrations table yet.
 */

import { execSync } from "node:child_process";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error(`
ERROR: DATABASE_URL is not set.

Get it from:
  Supabase Dashboard → Project Settings → Database → Connection string (URI tab)

Then run:
  DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@HOST:5432/postgres" \\
    node scripts/setup-db.mjs
`);
  process.exit(1);
}

console.log("Pushing migrations to remote database...\n");

try {
  execSync(`npx supabase db push --db-url "${dbUrl}"`, {
    stdio: "inherit",
    cwd: process.cwd(),
  });
  console.log("\nMigrations applied successfully.");
} catch (err) {
  console.error("\nMigration push failed. Check the error above.");
  process.exit(1);
}
