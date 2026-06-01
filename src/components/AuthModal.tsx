"use client";

import { useEffect, useRef, useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";

type Tab = "signin" | "signup";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  tab: Tab;
  onTabChange: (t: Tab) => void;
}

function PasswordInput({
  id,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete={id === "signup-password" ? "new-password" : "current-password"}
        className="w-full pr-10"
        style={inputStyle}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "11px 14px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  color: "#fff",
  fontSize: 14,
  outline: "none",
  transition: "border-color 0.15s ease",
};

export default function AuthModal({ open, onClose, tab, onTabChange }: AuthModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Sign-in state
  const [siEmail,    setSiEmail]    = useState("");
  const [siPassword, setSiPassword] = useState("");

  // Sign-up state
  const [suEmail,    setSuEmail]    = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suConfirm,  setSuConfirm]  = useState("");

  // Body scroll lock + Escape key
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-sm"
        style={{
          background: "linear-gradient(160deg, #13101f 0%, #0d0a1a 100%)",
          border: "1px solid rgba(124,58,237,0.25)",
          borderRadius: 20,
          boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset, 0 24px 80px rgba(0,0,0,0.7), 0 0 48px rgba(124,58,237,0.12)",
          padding: "32px 28px 28px",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white/35 hover:text-white hover:bg-white/8 transition-all duration-150"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Logo */}
        <div className="mb-6">
          <span className="text-white font-extrabold text-lg tracking-tight">GrowVia</span>
        </div>

        {/* Tabs */}
        <div
          className="flex mb-7 p-1 rounded-xl"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          {(["signin", "signup"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => onTabChange(t)}
              className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200"
              style={
                tab === t
                  ? { background: "#7C3AED", color: "#fff", boxShadow: "0 2px 12px rgba(124,58,237,0.4)" }
                  : { color: "rgba(255,255,255,0.4)" }
              }
            >
              {t === "signin" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        {/* ── Sign-in form ─────────────────────────────── */}
        {tab === "signin" && (
          <form onSubmit={e => e.preventDefault()} className="flex flex-col gap-3">
            <div>
              <label htmlFor="si-email" className="block text-xs font-medium text-white/45 mb-1.5">Email</label>
              <input
                id="si-email"
                type="email"
                placeholder="you@example.com"
                value={siEmail}
                onChange={e => setSiEmail(e.target.value)}
                autoComplete="email"
                style={inputStyle}
                onFocus={e => { (e.target as HTMLInputElement).style.borderColor = "rgba(124,58,237,0.6)"; }}
                onBlur={e  => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="si-password" className="text-xs font-medium text-white/45">Password</label>
                <a
                  href="/auth/forgot-password"
                  className="text-xs text-[#A78BFA] hover:text-white transition-colors"
                  onClick={onClose}
                >
                  Forgot password?
                </a>
              </div>
              <PasswordInput
                id="si-password"
                placeholder="••••••••"
                value={siPassword}
                onChange={setSiPassword}
              />
            </div>

            <button
              type="submit"
              className="mt-1 w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                boxShadow: "0 4px 20px rgba(124,58,237,0.45)",
              }}
            >
              Enter
            </button>

            <p className="text-center text-xs text-white/30 mt-1">
              No account yet?{" "}
              <button
                type="button"
                onClick={() => onTabChange("signup")}
                className="text-[#A78BFA] hover:text-white transition-colors"
              >
                Sign up
              </button>
            </p>
          </form>
        )}

        {/* ── Sign-up form ─────────────────────────────── */}
        {tab === "signup" && (
          <form onSubmit={e => e.preventDefault()} className="flex flex-col gap-3">
            <div>
              <label htmlFor="su-email" className="block text-xs font-medium text-white/45 mb-1.5">Email</label>
              <input
                id="su-email"
                type="email"
                placeholder="you@example.com"
                value={suEmail}
                onChange={e => setSuEmail(e.target.value)}
                autoComplete="email"
                style={inputStyle}
                onFocus={e => { (e.target as HTMLInputElement).style.borderColor = "rgba(124,58,237,0.6)"; }}
                onBlur={e  => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
              />
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-xs font-medium text-white/45 mb-1.5">Password</label>
              <PasswordInput
                id="signup-password"
                placeholder="At least 8 characters"
                value={suPassword}
                onChange={setSuPassword}
              />
            </div>

            <div>
              <label htmlFor="su-confirm" className="block text-xs font-medium text-white/45 mb-1.5">Confirm password</label>
              <PasswordInput
                id="su-confirm"
                placeholder="Repeat your password"
                value={suConfirm}
                onChange={setSuConfirm}
              />
              {suConfirm && suPassword && suConfirm !== suPassword && (
                <p className="mt-1.5 text-xs text-red-400/80">Passwords don&apos;t match</p>
              )}
            </div>

            <button
              type="submit"
              className="mt-1 w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                boxShadow: "0 4px 20px rgba(124,58,237,0.45)",
              }}
            >
              Sign up
            </button>

            <p className="text-center text-xs text-white/30 mt-1">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => onTabChange("signin")}
                className="text-[#A78BFA] hover:text-white transition-colors"
              >
                Sign in
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
