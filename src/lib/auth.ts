// Cookie-based auth flag — readable by Next.js middleware (unlike localStorage)

export function setAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = "gv_auth=1; path=/; max-age=3600; SameSite=Lax";
}

export function clearAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = "gv_auth=; path=/; max-age=0; SameSite=Lax";
}
