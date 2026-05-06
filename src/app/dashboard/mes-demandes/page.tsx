"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, Calendar, Loader2, Video, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getUserSession } from "@/lib/session";

type BookingRequest = {
  id: string;
  date: string;
  time: string;
  duration_minutes: number | null;
  status: string;
  meet_link: string | null;
  created_at: string;
  mentor_id: string;
  mentors: {
    nom: string;
    photo_url: string | null;
    poste_actuel: string | null;
    entreprise: string | null;
    specialite: string | null;
  } | null;
};

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    pending:   { label: "En attente", color: "#fbbf24",              bg: "rgba(251,191,36,0.1)"    },
    confirmed: { label: "Confirmée",  color: "#4ade80",              bg: "rgba(74,222,128,0.1)"    },
    active:    { label: "Confirmée",  color: "#4ade80",              bg: "rgba(74,222,128,0.1)"    },
    refused:   { label: "Refusée",    color: "#f87171",              bg: "rgba(248,113,113,0.1)"   },
    rejected:  { label: "Refusée",    color: "#f87171",              bg: "rgba(248,113,113,0.1)"   },
    cancelled: { label: "Annulée",    color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.04)" },
  };
  const c = map[status] ?? { label: status, color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.04)" };
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0"
      style={{ color: c.color, background: c.bg }}
    >
      {c.label}
    </span>
  );
}

function formatDate(date: string, time: string) {
  try {
    const d = new Date(`${date}T${time}:00`);
    return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  } catch {
    return date;
  }
}

function formatSentAt(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

function BookingCard({
  booking,
  cancelling,
  onCancel,
}: {
  booking: BookingRequest;
  cancelling: boolean;
  onCancel: () => void;
}) {
  const mentor     = booking.mentors;
  const mentorName = mentor?.nom ?? "Mentor";
  const isConfirmed = booking.status === "confirmed" || booking.status === "active";

  return (
    <div
      className="rounded-[14px] p-[18px] flex flex-col gap-3.5"
      style={{
        background: "rgba(255,255,255,0.03)",
        border:     "1px solid rgba(157,141,241,0.12)",
      }}
    >
      {/* Mentor identity + status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {mentor?.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mentor.photo_url}
              alt={mentorName}
              className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}
            >
              {initials(mentorName)}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-white text-sm leading-tight truncate">{mentorName}</p>
            <p className="text-xs text-white/45 mt-0.5 truncate">
              {mentor?.poste_actuel ?? mentor?.specialite ?? ""}
              {mentor?.entreprise && (
                <span className="text-white/25"> · {mentor.entreprise}</span>
              )}
            </p>
          </div>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Date / heure / durée */}
      <div className="flex items-center gap-2 text-xs text-white/45">
        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
        <span>
          {formatDate(booking.date, booking.time)}
          {booking.time && ` · ${booking.time.replace(":", "h")}`}
          {booking.duration_minutes ? ` · ${booking.duration_minutes} min` : ""}
        </span>
      </div>

      {/* Actions */}
      {isConfirmed && booking.meet_link && (
        <a
          href={booking.meet_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 self-start"
          style={{ background: "#7C3AED" }}
        >
          <Video className="w-4 h-4" />
          Rejoindre Google Meet →
        </a>
      )}

      {booking.status === "pending" && (
        <button
          onClick={onCancel}
          disabled={cancelling}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400/60 hover:text-red-400 border border-red-400/15 hover:border-red-400/30 transition-colors self-start disabled:opacity-40"
        >
          <X className="w-3 h-3" />
          {cancelling ? "Annulation…" : "Annuler la demande"}
        </button>
      )}

      {/* Date d'envoi */}
      <div className="flex justify-end mt-0.5">
        <span className="text-[11px] text-white/20">
          Envoyée le {formatSentAt(booking.created_at)}
        </span>
      </div>
    </div>
  );
}

export default function MesDemandesPage() {
  const router  = useRouter();
  const session = getUserSession();

  const [bookings,    setBookings]    = useState<BookingRequest[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [cancelling,  setCancelling]  = useState<string | null>(null);
  const [menteeDbId,  setMenteeDbId]  = useState<string | null>(null);

  useEffect(() => {
    if (!session) { router.push("/auth/login?next=/dashboard/mes-demandes"); return; }
    if (session.role !== "mentee") { router.push("/dashboard"); return; }
    fetchBookings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchBookings() {
    try {
      const { data: profile } = await supabase
        .from("mentees")
        .select("id")
        .eq("email", session!.email)
        .single() as { data: { id: string } | null };

      if (!profile) return;
      setMenteeDbId(profile.id);

      const { data } = await supabase
        .from("sessions")
        .select("id, date, time, duration_minutes, status, meet_link, created_at, mentor_id, mentors(nom, photo_url, poste_actuel, entreprise, specialite)")
        .eq("mentee_id", profile.id)
        .order("created_at", { ascending: false });

      setBookings((data ?? []) as unknown as BookingRequest[]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(booking: BookingRequest) {
    if (!window.confirm("Annuler cette demande de session ?")) return;
    setCancelling(booking.id);
    try {
      await supabase.from("sessions").update({ status: "cancelled" }).eq("id", booking.id);
      if (menteeDbId) {
        await supabase
          .from("connexions")
          .update({ statut: "cancelled" })
          .eq("mentor_id", booking.mentor_id)
          .eq("mentee_id", menteeDbId)
          .eq("statut", "pending");
      }
      setBookings(prev =>
        prev.map(b => b.id === booking.id ? { ...b, status: "cancelled" } : b)
      );
    } finally {
      setCancelling(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0A1A]">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Retour au tableau de bord
        </Link>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)" }}
          >
            <Clock className="w-5 h-5 text-[#A78BFA]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Mes Demandes</h1>
            <p className="text-white/35 text-sm mt-0.5">
              {loading
                ? "Chargement…"
                : `${bookings.length} demande${bookings.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-[#7C3AED] animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}
            >
              <Calendar className="w-8 h-8 text-[#A78BFA]" />
            </div>
            <p className="text-white/50 text-base mb-1">Aucune demande envoyée pour l'instant</p>
            <p className="text-white/25 text-sm mb-6">
              Trouvez un mentor et réservez votre première session.
            </p>
            <Link
              href="/explore/find-a-mentor"
              className="inline-flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
            >
              Trouver un mentor <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#A78BFA]/60 mb-5">
              MES DEMANDES
            </p>
            <div className="space-y-4">
              {bookings.map(booking => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  cancelling={cancelling === booking.id}
                  onCancel={() => handleCancel(booking)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
