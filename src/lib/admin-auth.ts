// Whitelist of emails authorized to access /admin.
// Any logged-in Supabase user whose email is NOT in this set is signed back
// out immediately. Keep in sync with scripts/seed-admin-users.mjs.

export const ADMIN_EMAILS: ReadonlyArray<string> = [
  "lunadavin@growviaconnect.com",
  "yasminetunon@growviaconnect.com",
];

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export function adminDisplayName(email: string | null | undefined): string {
  const e = email?.trim().toLowerCase();
  if (e === "lunadavin@growviaconnect.com")    return "Luna Davin";
  if (e === "yasminetunon@growviaconnect.com") return "Yasmine Tunon";
  return "Admin";
}
