"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Eye, EyeOff, Check, ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { setAuthCookie } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import type { Role as SessionRole } from "@/lib/session";

type Tab = "signin" | "signup";
type Role = "mentee" | "mentor";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  tab: Tab;
  onTabChange: (t: Tab) => void;
}

// ── Shared style constants ────────────────────────────────────────────────────

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
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  background: "#0d0a1a",
  color: "#fff",
  appearance: "none",
  WebkitAppearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 14px center",
  paddingRight: 36,
  cursor: "pointer",
};

const optStyle: React.CSSProperties = { background: "#0d0a1a", color: "#fff" };
const optDisabledStyle: React.CSSProperties = { background: "#0d0a1a", color: "rgba(255,255,255,0.3)" };

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 500,
  color: "rgba(255,255,255,0.45)",
  marginBottom: 6,
  letterSpacing: "0.02em",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function PasswordInput({
  id,
  placeholder,
  value,
  onChange,
  autoComplete = "current-password",
}: {
  id: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
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
        autoComplete={autoComplete}
        style={inputStyle}
        onFocus={e => { (e.target as HTMLInputElement).style.borderColor = "rgba(124,58,237,0.6)"; }}
        onBlur={e  => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
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

function FocusInput({
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      autoComplete={autoComplete}
      style={inputStyle}
      onFocus={e => { (e.target as HTMLInputElement).style.borderColor = "rgba(124,58,237,0.6)"; }}
      onBlur={e  => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
    />
  );
}

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150"
      style={
        selected
          ? { background: "rgba(124,58,237,0.35)", color: "#C4B5FD", border: "1px solid rgba(124,58,237,0.6)" }
          : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.1)" }
      }
    >
      {selected && <Check className="w-3 h-3 flex-shrink-0" />}
      {label}
    </button>
  );
}

// ── Pricing tier logic ────────────────────────────────────────────────────────

type Tier = {
  label: string;
  range: string;
  color: string;
};

const TIERS: Tier[] = [
  { label: "Accessible",   range: "20 – 30 €/session", color: "#94A3B8" },
  { label: "Émergent",     range: "30 – 40 €/session", color: "#3B82F6" },
  { label: "Confirmé",     range: "40 – 50 €/session", color: "#10B981" },
  { label: "Expérimenté",  range: "50 – 65 €/session", color: "#F59E0B" },
  { label: "Expert",       range: "65 – 80 €/session", color: "#EF4444" },
  { label: "Référence",    range: "80 – 90 €/session", color: "#7C3AED" },
];

const PREMIUM_DOMAINS = ["Finance", "Tech", "Entrepreneurship"];

function getTierIndex(yearsExp: string, domain: string): number {
  let base = 0;
  if (yearsExp === "0-5")   base = 0;
  else if (yearsExp === "5-10")  base = 1;
  else if (yearsExp === "10-15") base = 2;
  else if (yearsExp === "15-20") base = 3;
  else if (yearsExp === "20+")   base = 4;
  else base = 2; // "Other"

  const bonus = PREMIUM_DOMAINS.includes(domain) ? 1 : 0;
  return Math.min(base + bonus, 5);
}

// ── Days / Slots ──────────────────────────────────────────────────────────────

const DAYS  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SLOTS = [
  { key: "morning",   label: "Morning",   sub: "8h – 12h" },
  { key: "afternoon", label: "Afternoon", sub: "13h – 18h" },
  { key: "evening",   label: "Evening",   sub: "19h – 22h" },
];

type Availability = Record<string, Set<string>>; // day → Set of slot keys

// ── Select options ────────────────────────────────────────────────────────────

const INDUSTRIES = ["Finance", "Tech", "Marketing", "Business", "HR", "Sales", "Operations", "Entrepreneurship", "Other"];
const YEARS_EXP  = ["0-5", "5-10", "10-15", "15-20", "20+", "Other"];

const OBJECTIVE_OPTIONS  = ["Career guidance", "Skill development", "Network building", "Side project help", "Other"];
const PASSION_OPTIONS    = ["Startups", "Leadership", "Creativity", "Innovation", "Sustainability", "Other"];

// ── Progress bar ─────────────────────────────────────────────────────────────

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="transition-all duration-300"
          style={{
            width: i === current ? 20 : 6,
            height: 6,
            borderRadius: 3,
            background: i <= current ? "#7C3AED" : "rgba(255,255,255,0.12)",
          }}
        />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AuthModal({ open, onClose, tab, onTabChange }: AuthModalProps) {
  const overlayRef    = useRef<HTMLDivElement>(null);
  const router        = useRouter();
  const { setSession } = useAuth();

  // Sign-in state
  const [siEmail,    setSiEmail]    = useState("");
  const [siPassword, setSiPassword] = useState("");
  const [siLoading,  setSiLoading]  = useState(false);
  const [siError,    setSiError]    = useState<string | null>(null);

  // Sign-up error/loading
  const [suLoading, setSuLoading] = useState(false);
  const [suError,   setSuError]   = useState<string | null>(null);

  // Sign-up — step 0
  const [suEmail,    setSuEmail]    = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suConfirm,  setSuConfirm]  = useState("");
  const [role,       setRole]       = useState<Role | null>(null);

  // Shared profile fields
  const [fullName, setFullName] = useState("");

  // Mentee-specific
  const [school,       setSchool]       = useState("");
  const [industry,     setIndustry]     = useState("");
  const [industryOther, setIndustryOther] = useState("");
  const [objectives,   setObjectives]   = useState<Set<string>>(new Set());
  const [objectiveOther, setObjectiveOther] = useState("");
  const [passions,     setPassions]     = useState<Set<string>>(new Set());
  const [passionOther, setPassionOther] = useState("");

  // Mentor-specific
  const [yearsExp,    setYearsExp]    = useState("");
  const [yearsOther,  setYearsOther]  = useState("");
  const [domain,      setDomain]      = useState("");
  const [domainOther, setDomainOther] = useState("");
  const [mentorPassions,     setMentorPassions]     = useState<Set<string>>(new Set());
  const [mentorPassionOther, setMentorPassionOther] = useState("");
  const [availability, setAvailability] = useState<Availability>({});

  // Step tracking
  const [step, setStep] = useState(0);
  // step 0 = email/pass/role
  // Mentee: 1 = profile, 2 = interests
  // Mentor: 1 = profile, 2 = passions, 3 = availability, 4 = pricing

  const menteeSteps = 3; // steps 0,1,2
  const mentorSteps = 5; // steps 0,1,2,3,4

  const totalSteps   = role === "mentor" ? mentorSteps : role === "mentee" ? menteeSteps : 1;
  const currentDot   = step; // 0-based

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

  // ── Helpers ────────────────────────────────────────────────────────────────

  function toggleSet(set: Set<string>, val: string): Set<string> {
    const next = new Set(set);
    if (next.has(val)) next.delete(val); else next.add(val);
    return next;
  }

  function toggleAvailability(day: string, slotKey: string) {
    setAvailability(prev => {
      const daySet = new Set(prev[day] ?? []);
      if (daySet.has(slotKey)) daySet.delete(slotKey); else daySet.add(slotKey);
      return { ...prev, [day]: daySet };
    });
  }

  function goNext() { setStep(s => s + 1); }
  function goBack() { setStep(s => Math.max(0, s - 1)); }

  function canAdvanceStep0() {
    return suEmail.trim() && suPassword.length >= 8 && suConfirm === suPassword && role !== null;
  }

  // ── Sign-in ────────────────────────────────────────────────────────────────

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setSiError(null);
    setSiLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: siEmail.trim().toLowerCase(),
        password: siPassword,
      });
      if (authError) throw authError;

      const user = data.user;
      const meta = user.user_metadata ?? {};
      const role = (meta.role as SessionRole) || "mentee";
      const nom  = (meta.nom  as string)      || user.email || "";

      setSession({ nom, email: user.email!, role, plan: (meta.plan as "free" | "pro" | "school") || "free" });
      setAuthCookie();
      onClose();
      // Dashboard handles onboarding-redirect itself; always send here.
      router.push("/dashboard");
    } catch {
      setSiError("Incorrect email or password. Please try again.");
    } finally {
      setSiLoading(false);
    }
  }

  // ── Sign-up final submit ───────────────────────────────────────────────────

  async function handleFinalSubmit() {
    setSuError(null);
    setSuLoading(true);
    const email = suEmail.trim().toLowerCase();
    const nom   = fullName.trim();
    const r     = role!;

    try {
      // 1. Create auth user (server-side, auto-confirms email)
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: suPassword, role: r, nom }),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = (json.error ?? "").toLowerCase();
        if (msg.includes("already") || msg.includes("duplicate") || msg.includes("unique")) {
          throw new Error("An account with this email already exists.");
        }
        throw new Error(json.error ?? "Registration failed. Please try again.");
      }

      // 2. Sign in immediately (email already confirmed)
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: suPassword });
      if (signInError) throw signInError;

      // 3. Insert domain row — best-effort, never block redirect on failure
      const table = r === "mentor" ? "mentors" : "mentees";
      supabase.from(table).insert({ nom, email, statut: "pending" }).then(() => {});

      // 4. Persist session + cookie, close modal, redirect
      setSession({ nom, email, role: r, plan: "free" });
      setAuthCookie();
      onClose();
      router.push(r === "mentor" ? "/onboarding/mentor" : "/dashboard");
    } catch (err: unknown) {
      setSuError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setSuLoading(false);
    }
  }

  // ── Tier display ───────────────────────────────────────────────────────────

  const tierIdx  = getTierIndex(yearsExp || "Other", domain || "");
  const tierData = TIERS[tierIdx];

  // ── Render helpers ─────────────────────────────────────────────────────────

  function renderSignIn() {
    return (
      <form onSubmit={handleSignIn} className="flex flex-col gap-3">
        {siError && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs text-red-400 border border-red-500/20 bg-red-500/10">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            {siError}
          </div>
        )}

        <div>
          <label htmlFor="si-email" style={labelStyle}>Email</label>
          <FocusInput id="si-email" type="email" placeholder="you@example.com" value={siEmail} onChange={setSiEmail} autoComplete="email" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="si-password" style={labelStyle}>Password</label>
            <a href="/auth/forgot-password" className="text-xs text-[#A78BFA] hover:text-white transition-colors" onClick={onClose}>
              Forgot password?
            </a>
          </div>
          <PasswordInput id="si-password" placeholder="••••••••" value={siPassword} onChange={setSiPassword} />
        </div>

        <button
          type="submit"
          disabled={siLoading}
          className="mt-1 w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)", boxShadow: "0 4px 20px rgba(124,58,237,0.45)" }}
        >
          {siLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : "Enter"}
        </button>

        <p className="text-center text-xs text-white/30 mt-1">
          No account yet?{" "}
          <button type="button" onClick={() => { onTabChange("signup"); setStep(0); setSiError(null); }} className="text-[#A78BFA] hover:text-white transition-colors">
            Sign up
          </button>
        </p>
      </form>
    );
  }

  // Step 0: Email / Password / Role
  function renderStep0() {
    return (
      <div className="flex flex-col gap-3">
        <div>
          <label htmlFor="su-email" style={labelStyle}>Email</label>
          <FocusInput id="su-email" type="email" placeholder="you@example.com" value={suEmail} onChange={setSuEmail} autoComplete="email" />
        </div>

        <div>
          <label htmlFor="su-password" style={labelStyle}>Password</label>
          <PasswordInput id="su-password" placeholder="At least 8 characters" value={suPassword} onChange={setSuPassword} autoComplete="new-password" />
        </div>

        <div>
          <label htmlFor="su-confirm" style={labelStyle}>Confirm password</label>
          <PasswordInput id="su-confirm" placeholder="Repeat your password" value={suConfirm} onChange={setSuConfirm} autoComplete="new-password" />
          {suConfirm && suPassword && suConfirm !== suPassword && (
            <p className="mt-1.5 text-xs text-red-400/80">Passwords don&apos;t match</p>
          )}
        </div>

        {/* Role selection */}
        <div>
          <label style={{ ...labelStyle, marginBottom: 8 }}>I want to join as…</label>
          <div className="grid grid-cols-2 gap-2">
            {(["mentee", "mentor"] as Role[]).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className="py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                style={
                  role === r
                    ? { background: "rgba(124,58,237,0.3)", color: "#C4B5FD", border: "1px solid rgba(124,58,237,0.6)" }
                    : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.1)" }
                }
              >
                {r === "mentee" ? "🎓 Mentee" : "🧑‍💼 Mentor"}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={goNext}
          disabled={!canAdvanceStep0()}
          className="mt-1 w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)", boxShadow: "0 4px 20px rgba(124,58,237,0.45)" }}
        >
          Continue <ChevronRight className="w-4 h-4" />
        </button>

        <p className="text-center text-xs text-white/30">
          Already have an account?{" "}
          <button type="button" onClick={() => onTabChange("signin")} className="text-[#A78BFA] hover:text-white transition-colors">
            Sign in
          </button>
        </p>
      </div>
    );
  }

  // Mentee Step 1: Name + School + Industry
  function renderMenteeStep1() {
    return (
      <div className="flex flex-col gap-3">
        <div>
          <label htmlFor="m-name" style={labelStyle}>Full name</label>
          <FocusInput id="m-name" placeholder="Jane Doe" value={fullName} onChange={setFullName} />
        </div>

        <div>
          <label htmlFor="m-school" style={labelStyle}>School / University</label>
          <FocusInput id="m-school" placeholder="e.g. HEC Paris, MIT…" value={school} onChange={setSchool} />
        </div>

        <div>
          <label htmlFor="m-industry" style={labelStyle}>Industry / Domain of interest</label>
          <select id="m-industry" value={industry} onChange={e => setIndustry(e.target.value)} style={selectStyle}>
            <option value="" disabled style={optDisabledStyle}>Select a domain…</option>
            {INDUSTRIES.map(i => <option key={i} value={i} style={optStyle}>{i}</option>)}
          </select>
        </div>

        {industry === "Other" && (
          <div>
            <label htmlFor="m-industry-other" style={labelStyle}>Please specify</label>
            <FocusInput id="m-industry-other" placeholder="Your domain" value={industryOther} onChange={setIndustryOther} />
          </div>
        )}
      </div>
    );
  }

  // Mentee Step 2: Objectives + Passions
  function renderMenteeStep2() {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <label style={labelStyle}>Main objectives (select all that apply)</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {OBJECTIVE_OPTIONS.map(opt => (
              <Chip key={opt} label={opt} selected={objectives.has(opt)} onClick={() => setObjectives(toggleSet(objectives, opt))} />
            ))}
          </div>
          {objectives.has("Other") && (
            <div className="mt-2">
              <FocusInput id="obj-other" placeholder="Describe your objective" value={objectiveOther} onChange={setObjectiveOther} />
            </div>
          )}
        </div>

        <div>
          <label style={labelStyle}>Centers of interest / Passions</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {PASSION_OPTIONS.map(opt => (
              <Chip key={opt} label={opt} selected={passions.has(opt)} onClick={() => setPassions(toggleSet(passions, opt))} />
            ))}
          </div>
          {passions.has("Other") && (
            <div className="mt-2">
              <FocusInput id="pass-other" placeholder="Describe your passion" value={passionOther} onChange={setPassionOther} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mentor Step 1: Name + Years exp + Domain
  function renderMentorStep1() {
    return (
      <div className="flex flex-col gap-3">
        <div>
          <label htmlFor="me-name" style={labelStyle}>Full name</label>
          <FocusInput id="me-name" placeholder="John Doe" value={fullName} onChange={setFullName} />
        </div>

        <div>
          <label htmlFor="me-years" style={labelStyle}>Years of experience</label>
          <select id="me-years" value={yearsExp} onChange={e => setYearsExp(e.target.value)} style={selectStyle}>
            <option value="" disabled style={optDisabledStyle}>Select…</option>
            {YEARS_EXP.map(y => <option key={y} value={y} style={optStyle}>{y === "Other" ? "Other" : `${y} years`}</option>)}
          </select>
        </div>

        {yearsExp === "Other" && (
          <div>
            <label htmlFor="me-years-other" style={labelStyle}>Please specify</label>
            <FocusInput id="me-years-other" placeholder="e.g. 22 years" value={yearsOther} onChange={setYearsOther} />
          </div>
        )}

        <div>
          <label htmlFor="me-domain" style={labelStyle}>Area of expertise / Domain</label>
          <select id="me-domain" value={domain} onChange={e => setDomain(e.target.value)} style={selectStyle}>
            <option value="" disabled style={optDisabledStyle}>Select a domain…</option>
            {INDUSTRIES.map(i => <option key={i} value={i} style={optStyle}>{i}</option>)}
          </select>
        </div>

        {domain === "Other" && (
          <div>
            <label htmlFor="me-domain-other" style={labelStyle}>Please specify</label>
            <FocusInput id="me-domain-other" placeholder="Your domain" value={domainOther} onChange={setDomainOther} />
          </div>
        )}
      </div>
    );
  }

  // Mentor Step 2: Passions
  function renderMentorStep2() {
    return (
      <div className="flex flex-col gap-3">
        <div>
          <label style={labelStyle}>Centers of interest / Passions</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {PASSION_OPTIONS.map(opt => (
              <Chip
                key={opt}
                label={opt}
                selected={mentorPassions.has(opt)}
                onClick={() => setMentorPassions(toggleSet(mentorPassions, opt))}
              />
            ))}
          </div>
          {mentorPassions.has("Other") && (
            <div className="mt-2">
              <FocusInput id="me-pass-other" placeholder="Describe your passion" value={mentorPassionOther} onChange={setMentorPassionOther} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mentor Step 3: Availability grid
  function renderMentorStep3() {
    return (
      <div>
        <label style={{ ...labelStyle, marginBottom: 12 }}>Weekly availability</label>
        <div className="overflow-x-auto -mx-1 px-1">
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "4px" }}>
            <thead>
              <tr>
                <th style={{ width: 80, textAlign: "left", fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 500, paddingBottom: 6 }}></th>
                {DAYS.map(d => (
                  <th key={d} style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600, textAlign: "center", paddingBottom: 6 }}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SLOTS.map(slot => (
                <tr key={slot.key}>
                  <td style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", paddingRight: 6, verticalAlign: "middle", lineHeight: 1.3 }}>
                    <span style={{ display: "block", fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>{slot.label}</span>
                    <span style={{ fontSize: 9 }}>{slot.sub}</span>
                  </td>
                  {DAYS.map(day => {
                    const active = availability[day]?.has(slot.key) ?? false;
                    return (
                      <td key={day} style={{ textAlign: "center", padding: 2 }}>
                        <button
                          type="button"
                          onClick={() => toggleAvailability(day, slot.key)}
                          style={{
                            width: "100%",
                            height: 32,
                            borderRadius: 6,
                            border: active ? "1px solid rgba(124,58,237,0.6)" : "1px solid rgba(255,255,255,0.08)",
                            background: active ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.03)",
                            cursor: "pointer",
                            transition: "all 0.15s",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          aria-pressed={active}
                        >
                          {active && <Check className="w-3 h-3" style={{ color: "#C4B5FD" }} />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-white/25">Tap each cell to toggle. You can update this later.</p>
      </div>
    );
  }

  // Mentor Step 4: Pricing
  function renderMentorStep4() {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <p style={{ ...labelStyle, marginBottom: 10 }}>Recommended pricing based on your profile</p>

          <div className="flex flex-col gap-2">
            {TIERS.map((tier, idx) => {
              const isRecommended = idx === tierIdx;
              return (
                <div
                  key={tier.label}
                  className="flex items-center justify-between px-4 py-3 rounded-xl transition-all"
                  style={{
                    background: isRecommended ? `${tier.color}18` : "rgba(255,255,255,0.03)",
                    border: isRecommended ? `1px solid ${tier.color}55` : "1px solid rgba(255,255,255,0.07)",
                    boxShadow: isRecommended ? `0 0 20px ${tier.color}22` : "none",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: tier.color }}
                    />
                    <span
                      className="text-sm font-semibold"
                      style={{ color: isRecommended ? "#fff" : "rgba(255,255,255,0.35)" }}
                    >
                      {tier.label}
                    </span>
                    {isRecommended && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                        style={{ background: `${tier.color}30`, color: tier.color }}
                      >
                        Your tier
                      </span>
                    )}
                  </div>
                  <span
                    className="text-sm font-bold tabular-nums"
                    style={{ color: isRecommended ? tier.color : "rgba(255,255,255,0.2)" }}
                  >
                    {tier.range}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-xs text-white/30 leading-relaxed">
            Based on{" "}
            <span className="text-white/50">{yearsExp || "?"} years</span> experience in{" "}
            <span className="text-white/50">{domain || "?"}</span>.
            {PREMIUM_DOMAINS.includes(domain) && (
              <span className="text-violet-400/70"> +1 tier bonus for your domain.</span>
            )}
            {" "}You can adjust your rate freely after joining.
          </p>
        </div>
      </div>
    );
  }

  // ── Nav buttons for multi-step ─────────────────────────────────────────────

  function isFinalStep() {
    if (role === "mentee") return step === 2;
    if (role === "mentor") return step === 4;
    return false;
  }

  function canAdvanceCurrent() {
    if (step === 0) return canAdvanceStep0();
    if (role === "mentee" && step === 1) return fullName.trim() !== "" && school.trim() !== "" && industry !== "";
    if (role === "mentor" && step === 1) return fullName.trim() !== "" && yearsExp !== "" && domain !== "";
    return true;
  }

  function renderStepContent() {
    if (step === 0) return renderStep0();
    if (role === "mentee") {
      if (step === 1) return renderMenteeStep1();
      if (step === 2) return renderMenteeStep2();
    }
    if (role === "mentor") {
      if (step === 1) return renderMentorStep1();
      if (step === 2) return renderMentorStep2();
      if (step === 3) return renderMentorStep3();
      if (step === 4) return renderMentorStep4();
    }
    return null;
  }

  function getStepTitle() {
    if (step === 0) return "Create your account";
    if (role === "mentee") {
      if (step === 1) return "Your profile";
      if (step === 2) return "Your interests";
    }
    if (role === "mentor") {
      if (step === 1) return "Your expertise";
      if (step === 2) return "Your passions";
      if (step === 3) return "Your availability";
      if (step === 4) return "Your pricing";
    }
    return "";
  }

  const isStep0 = tab === "signup" && step === 0;

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
        className="relative w-full max-w-sm max-h-[90vh] flex flex-col"
        style={{
          background: "linear-gradient(160deg, #13101f 0%, #0d0a1a 100%)",
          border: "1px solid rgba(124,58,237,0.25)",
          borderRadius: 20,
          boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset, 0 24px 80px rgba(0,0,0,0.7), 0 0 48px rgba(124,58,237,0.12)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white/35 hover:text-white hover:bg-white/8 transition-all duration-150 z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-7 pt-8 pb-6" style={{ scrollbarWidth: "none" }}>

          {/* Logo */}
          <div className="mb-5">
            <span className="text-white font-extrabold text-lg tracking-tight">GrowVia</span>
          </div>

          {/* Tabs — only show at top level */}
          {(tab === "signin" || isStep0) && (
            <div
              className="flex mb-6 p-1 rounded-xl"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              {(["signin", "signup"] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => { onTabChange(t); setStep(0); }}
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
          )}

          {/* Multi-step header (steps 1+) */}
          {tab === "signup" && step > 0 && (
            <div className="mb-5">
              <ProgressDots total={totalSteps} current={currentDot} />
              <h2 className="text-white font-bold text-base">{getStepTitle()}</h2>
            </div>
          )}

          {/* Form content */}
          {tab === "signin" ? renderSignIn() : renderStepContent()}

          {/* Bottom nav for steps 1+ */}
          {tab === "signup" && step > 0 && (
            <div className={`flex gap-2 mt-5 ${step > 0 ? "" : "hidden"}`}>
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/40 hover:text-white border border-white/10 hover:border-white/25 transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              {isFinalStep() ? (
                <>
                  {suError && (
                    <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs text-red-400 border border-red-500/20 bg-red-500/10 w-full mb-2">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      {suError}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={suLoading}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)", boxShadow: "0 4px 20px rgba(124,58,237,0.45)" }}
                  >
                    {suLoading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
                      : (role === "mentor" ? "Join as Mentor" : "Join as Mentee")}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canAdvanceCurrent()}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)", boxShadow: "0 4px 20px rgba(124,58,237,0.45)" }}
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
