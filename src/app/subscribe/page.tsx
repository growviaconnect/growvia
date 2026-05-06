"use client";
// v2 — redesign FR

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, Loader2, ArrowLeft, Zap } from "lucide-react";
import { getUserSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

/* ── Plan definitions ─────────────────────────────────────────── */
const FREE_FEATURES = [
  "1 session découverte",
  "Voir certains mentors",
  "1 matching IA maximum",
];

const PAID_PLANS = [
  {
    key:      "basic",
    label:    "Basic",
    price:    "4,99",
    tagline:  "Premiers pas dans le mentorat",
    features: [
      "Accès à plus de mentors",
      "2–3 matchings IA/mois",
      "Sessions de mentorat standard",
      "Filtres de recherche de base",
      "Support par email",
    ],
    highlight: false,
    ctaLabel:  "Démarrer Basic",
  },
  {
    key:      "standard",
    label:    "Standard",
    price:    "9,99",
    tagline:  "La croissance sérieuse commence ici",
    features: [
      "Accès à la majorité des mentors",
      "Matching IA étendu",
      "Accès aux mentors certifiés",
      "Filtres avancés (expérience, domaine)",
      "Recommandations personnalisées",
      "Support prioritaire par email",
    ],
    highlight: true,
    ctaLabel:  "Démarrer Standard",
  },
  {
    key:      "premium",
    label:    "Premium",
    price:    "14,99",
    tagline:  "Accès maximum, impact maximum",
    features: [
      "Accès à TOUS les mentors",
      "Matching IA illimité",
      "Réservation prioritaire",
      "Meilleurs mentors exclusifs",
      "Contenu exclusif & ateliers",
    ],
    highlight: false,
    ctaLabel:  "Démarrer Premium",
  },
] as const;

/* ── Plan card ────────────────────────────────────────────────── */
function PlanCard({
  planKey,
  label,
  price,
  priceNote,
  tagline,
  features,
  isPopular,
  isCurrent,
  isLoading,
  animDelay,
  onSubscribe,
  onFree,
}: {
  planKey:     string;
  label:       string;
  price:       string;
  priceNote:   string;
  tagline:     string;
  features:    readonly string[];
  isPopular:   boolean;
  isCurrent:   boolean;
  isLoading:   boolean;
  animDelay:   number;
  onSubscribe?: () => void;
  onFree?:     () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isFree = planKey === "free";

  const baseTransform = isPopular ? "scale(1.02)" : "none";
  const hoverTransform = isPopular ? "scale(1.02) translateY(-4px)" : "translateY(-4px)";

  return (
    <div
      className="relative flex flex-col fade-up"
      style={{
        borderRadius: 16,
        padding:      28,
        background:   "rgba(255,255,255,0.03)",
        border:       isCurrent
          ? "1px solid rgba(157,141,241,0.4)"
          : isPopular
            ? "1px solid rgba(157,141,241,0.35)"
            : hovered
              ? "1px solid rgba(157,141,241,0.28)"
              : "1px solid rgba(157,141,241,0.12)",
        transform:    !isCurrent && hovered ? hoverTransform : baseTransform,
        boxShadow:    !isCurrent && hovered ? "0 12px 40px rgba(157,141,241,0.1)" : "none",
        transition:   "all 0.3s ease",
        animationDelay: `${animDelay}ms`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Badge: current plan */}
      {isCurrent && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span
            className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap"
            style={{ background: "#7C3AED", color: "#fff" }}
          >
            VOTRE PLAN ACTUEL
          </span>
        </div>
      )}

      {/* Badge: most popular */}
      {isPopular && !isCurrent && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span
            className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap"
            style={{ background: "#fbbf24", color: "#000" }}
          >
            <Zap className="w-3 h-3" /> LE PLUS POPULAIRE
          </span>
        </div>
      )}

      {/* Plan eyebrow + price */}
      <div className="mb-5">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.22em] mb-3"
          style={{ color: "rgba(167,139,250,0.5)" }}
        >
          {label}
        </p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[2.6rem] font-extrabold text-white leading-none">{price}€</span>
          <span className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>{priceNote}</span>
        </div>
        <p className="text-sm mt-2 italic" style={{ color: "rgba(167,139,250,0.55)" }}>
          {tagline}
        </p>
      </div>

      {/* Features */}
      <ul className="flex-1 mb-7" style={{ lineHeight: 1.8 }}>
        {features.map(f => (
          <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
            <Check
              className="w-4 h-4 flex-shrink-0 mt-[3px]"
              style={{ color: "#A78BFA" }}
            />
            {f}
          </li>
        ))}
      </ul>

      {/* CTA button */}
      {isCurrent ? (
        <button
          disabled
          className="w-full py-3 rounded-xl text-sm font-bold transition-all"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)", cursor: "not-allowed" }}
        >
          Plan actuel ✓
        </button>
      ) : isFree ? (
        <button
          onClick={onFree}
          className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:bg-[rgba(124,58,237,0.18)]"
          style={{
            background: "transparent",
            border:     "1px solid rgba(124,58,237,0.4)",
            color:      "#A78BFA",
            borderRadius: 40,
          }}
        >
          Commencer gratuitement →
        </button>
      ) : (
        <button
          onClick={onSubscribe}
          disabled={isLoading}
          className="shimmer-btn w-full py-3 rounded-[40px] text-sm font-bold text-white transition-all disabled:opacity-60"
          style={{ background: "#7C3AED" }}
        >
          {isLoading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Redirection…
            </span>
          ) : (
            PAID_PLANS.find(p => p.key === planKey)?.ctaLabel ?? `Démarrer ${label}`
          )}
        </button>
      )}
    </div>
  );
}

/* ── Main content ─────────────────────────────────────────────── */
function SubscribeContent() {
  const router      = useRouter();
  const params      = useSearchParams();
  const redirectUrl = params.get("redirect") ?? "";
  const session     = getUserSession();

  const [loading,         setLoading]         = useState<string | null>(null);
  const [error,           setError]           = useState<string | null>(null);
  const [currentPlan,     setCurrentPlan]     = useState<string | null>(null);
  const [freeSessionUsed, setFreeSessionUsed] = useState(false);
  const [planLoading,     setPlanLoading]     = useState(false);
  const [menteeId,        setMenteeId]        = useState<string | null>(null);

  useEffect(() => {
    if (!session?.email || session.role !== "mentee") return;
    setPlanLoading(true);
    supabase
      .from("mentees").select("id, free_session_used").eq("email", session.email).single()
      .then(({ data: menteeRow }) => {
        if (!menteeRow) { setCurrentPlan("free"); setPlanLoading(false); return; }
        const row = menteeRow as { id: string; free_session_used: boolean };
        setMenteeId(row.id);
        setFreeSessionUsed(row.free_session_used);
        supabase
          .from("mentee_subscriptions")
          .select("plan, status")
          .eq("mentee_id", row.id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .then(({ data }) => {
            setCurrentPlan((data?.[0] as { plan: string } | undefined)?.plan ?? (row.free_session_used ? null : "free"));
            setPlanLoading(false);
          });
      });
  }, [session?.email, session?.role]);

  async function handleSubscribe(plan: string) {
    if (!session?.email) {
      router.push(`/auth/register?redirect=/subscribe${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`);
      return;
    }
    setLoading(plan);
    setError(null);
    try {
      const res = await fetch("/api/subscriptions/create-checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          plan,
          email: session.email,
          ...(menteeId    ? { menteeId    } : {}),
          ...(redirectUrl ? { redirectUrl } : {}),
        }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue. Réessayez.");
      setLoading(null);
    }
  }

  const isCurrent = (key: string) => !planLoading && currentPlan === key;

  const showFree     = !freeSessionUsed;
  const totalColumns = showFree ? 4 : 3;

  return (
    <>
      <style>{`
        @keyframes shimmer-text {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .shimmer-purple {
          background: linear-gradient(90deg, #A78BFA 0%, #C4B5FD 38%, #7C3AED 62%, #A78BFA 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer-text 3s linear infinite;
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .fade-up {
          opacity: 0;
          animation: fade-up 0.55s cubic-bezier(0.22,1,0.36,1) both;
        }
        .shimmer-btn:hover {
          background: #6D28D9 !important;
          box-shadow: 0 0 24px rgba(124,58,237,0.4);
        }
      `}</style>

      <div className="min-h-screen bg-[#0D0A1A]">
        {/* Background glow */}
        <div
          className="pointer-events-none fixed inset-0"
          style={{ background: "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(124,58,237,0.14) 0%, transparent 70%)" }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-28">

          {/* Back */}
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-sm mb-12 transition-colors"
            style={{ color: "rgba(255,255,255,0.35)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)"; }}
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>

          {/* ── Hero header ─────────────────────────────────── */}
          <div className="text-center mb-16">

            {/* Eyebrow badge */}
            <div
              className="fade-up inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] px-4 py-2 rounded-full mb-7"
              style={{
                animationDelay: "0ms",
                background:     "rgba(124,58,237,0.08)",
                border:         "1px solid rgba(124,58,237,0.28)",
                color:          "#A78BFA",
              }}
            >
              Choisissez votre plan
            </div>

            {/* Title */}
            <h1
              className="fade-up text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight"
              style={{ animationDelay: "60ms" }}
            >
              Accédez à votre{" "}
              <span className="shimmer-purple">réseau de mentors</span>
            </h1>

            {/* Subtitle */}
            <p
              className="fade-up text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
              style={{
                animationDelay: "120ms",
                color:          "rgba(167,139,250,0.55)",
              }}
            >
              Commencez gratuitement, évoluez quand vous êtes prêt.
              Votre carte est enregistrée à l&apos;abonnement — les sessions sont débitées
              automatiquement à la confirmation du mentor.
            </p>
          </div>

          {/* ── Plan cards grid ──────────────────────────────── */}
          <div
            className={`grid grid-cols-1 gap-6 mb-12 ${
              totalColumns === 4
                ? "sm:grid-cols-2 lg:grid-cols-4"
                : "sm:grid-cols-3"
            }`}
          >
            {/* FREE */}
            {showFree && (
              <PlanCard
                planKey="free"
                label="Free"
                price="0"
                priceNote="/ pour toujours"
                tagline="Commencez à explorer"
                features={FREE_FEATURES}
                isPopular={false}
                isCurrent={isCurrent("free")}
                isLoading={false}
                animDelay={200}
                onFree={() => router.push("/explore")}
              />
            )}

            {/* PAID */}
            {PAID_PLANS.map((plan, i) => (
              <PlanCard
                key={plan.key}
                planKey={plan.key}
                label={plan.label}
                price={plan.price}
                priceNote="/ mois"
                tagline={plan.tagline}
                features={plan.features}
                isPopular={plan.highlight}
                isCurrent={isCurrent(plan.key)}
                isLoading={loading === plan.key}
                animDelay={(showFree ? 300 : 200) + i * 100}
                onSubscribe={() => handleSubscribe(plan.key)}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <div
              className="rounded-xl px-4 py-3 mb-6 text-sm text-red-400 text-center"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              {error}
            </div>
          )}

          {/* ── Bottom note ──────────────────────────────────── */}
          <div className="text-center space-y-3">
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.22)" }}>
              Les sessions sont débitées uniquement après confirmation par le mentor.
              Annulation possible à tout moment.
            </p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
              Déjà abonné ?{" "}
              <Link
                href="/dashboard"
                className="transition-colors hover:text-white"
                style={{ color: "#A78BFA" }}
              >
                Mon Espace →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0D0A1A]" />}>
      <SubscribeContent />
    </Suspense>
  );
}
