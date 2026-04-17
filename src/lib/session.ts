const TTL = 10 * 60 * 1000; // 10 minutes

// ─── Generic read/write with TTL ──────────────────────────────────────────────

function lsRead<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const s = JSON.parse(raw) as T & { _ts: number };
    if (Date.now() - (s._ts ?? 0) > TTL) { localStorage.removeItem(key); return null; }
    // Refresh TTL on every read (keeps session alive while user is active)
    localStorage.setItem(key, JSON.stringify({ ...s, _ts: Date.now() }));
    return s;
  } catch { return null; }
}

function lsWrite(key: string, data: object) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify({ ...data, _ts: Date.now() }));
}

function lsClear(key: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

// ─── User session ─────────────────────────────────────────────────────────────

export type Role = "mentor" | "mentee" | "school_admin";

export type UserSession = {
  nom: string;
  email: string;
  role: Role;
  specialite?: string | null;
  objectif?: string | null;
  bio?: string;
  photo?: string;
  plan?: "free" | "pro" | "school";
};

export function getUserSession(): UserSession | null {
  return lsRead<UserSession>("gv_user");
}

export function setUserSession(data: UserSession) {
  lsWrite("gv_user", data);
}

export function clearUserSession() {
  lsClear("gv_user");
}

// ─── Admin session & credentials ─────────────────────────────────────────────

const ADMIN_DEFAULTS = {
  nom: "Admin GrowVia",
  email: "growviaconnect@gmail.com",
  password: "growvia2026",
};

export type AdminCreds = { nom: string; email: string; password: string };

export function getAdminCreds(): AdminCreds {
  if (typeof window === "undefined") return ADMIN_DEFAULTS;
  try {
    const raw = localStorage.getItem("gv_admin_creds");
    return raw ? { ...ADMIN_DEFAULTS, ...JSON.parse(raw) } : ADMIN_DEFAULTS;
  } catch { return ADMIN_DEFAULTS; }
}

export function saveAdminCreds(data: Partial<AdminCreds>) {
  if (typeof window === "undefined") return;
  localStorage.setItem("gv_admin_creds", JSON.stringify({ ...getAdminCreds(), ...data }));
}

export function isAdminAuthed(): boolean {
  return !!lsRead<{ ok: boolean }>("gv_admin");
}

export function setAdminAuthed() {
  lsWrite("gv_admin", { ok: true });
}

export function clearAdminSession() {
  lsClear("gv_admin");
}
