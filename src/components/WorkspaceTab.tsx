"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { UserSession } from "@/lib/session";
import {
  ChevronLeft, ChevronRight, Send, Plus, CheckSquare, Square,
  Calendar, X, Loader2, MessageSquare, ClipboardList, Trash2,
  Upload, FileText, Download, CheckCircle2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type WorkspaceConnexion = {
  id: string;
  date: string;
  statut: string;
  mentor_id: string | null;
  mentors: { nom: string; email: string; specialite: string | null } | null;
  mentees: { id: string; nom: string; email: string; objectif: string | null; photo_url: string | null } | null;
};

type AssignmentStatus = "pending" | "in_progress" | "completed" | "done";

type Assignment = {
  id: string;
  connexion_id: string;
  mentor_id: string | null;
  mentee_id: string | null;
  title: string;
  description: string | null;
  file_url: string | null;
  response_file_url: string | null;
  response_file_name: string | null;
  response_submitted_at: string | null;
  due_date: string | null;
  status: AssignmentStatus;
  created_at: string;
};

type Message = {
  id: string;
  connexion_id: string;
  sender_email: string;
  sender_nom: string;
  content: string;
  created_at: string;
};

// ─── Shared primitives ────────────────────────────────────────────────────────

function initials(nom: string) {
  return nom.split(" ").map(w => w[0] ?? "").join("").toUpperCase().slice(0, 2);
}

function Card({ children, className = "", onClick, style }: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.07] ${className}`}
      style={{ background: "rgba(255,255,255,0.04)", ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function WorkspaceTab({ connexions, user }: {
  connexions: WorkspaceConnexion[];
  user: UserSession;
}) {
  const active = connexions.filter(c => ["active", "completed"].includes(c.statut));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? active.find(c => c.id === selectedId) ?? null : null;

  if (selected) {
    return (
      <WorkspaceDetail
        connexion={selected}
        user={user}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  return <WorkspaceList connexions={active} user={user} onSelect={setSelectedId} />;
}

// ─── List view ────────────────────────────────────────────────────────────────

function WorkspaceList({ connexions, user, onSelect }: {
  connexions: WorkspaceConnexion[];
  user: UserSession;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-white tracking-tight">Workspace</h1>

      {connexions.length === 0 ? (
        <Card className="p-10 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}
          >
            <MessageSquare className="w-7 h-7 text-[#A78BFA]" />
          </div>
          <h3 className="font-semibold text-white mb-1.5">No active sessions yet</h3>
          <p className="text-white/35 text-sm max-w-xs mx-auto leading-relaxed">
            Once a session is confirmed you&apos;ll be able to access assignments and private messaging here.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {connexions.map(c => {
            const partner = user.role === "mentor" ? c.mentees : c.mentors;
            const partnerNom = partner?.nom ?? "—";
            const sub = user.role === "mentor"
              ? (c.mentees?.objectif ?? "Mentoring")
              : (c.mentors?.specialite ?? "Mentor");
            return (
              <Card
                key={c.id}
                className="p-5 cursor-pointer hover:border-[#7C3AED]/40 transition-colors group"
                onClick={() => onSelect(c.id)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}
                  >
                    {initials(partnerNom)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white">{partnerNom}</div>
                    <div className="text-xs text-white/40 mt-0.5 truncate">{sub}</div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-full"
                      style={c.statut === "completed"
                        ? { background: "rgba(16,185,129,0.12)", color: "#34d399" }
                        : { background: "rgba(124,58,237,0.18)", color: "#A78BFA" }}
                    >
                      {c.statut}
                    </span>
                    <ChevronRight className="w-4 h-4 text-white/25 group-hover:text-[#A78BFA] transition-colors" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Detail view ──────────────────────────────────────────────────────────────

function WorkspaceDetail({ connexion, user, onBack }: {
  connexion: WorkspaceConnexion;
  user: UserSession;
  onBack: () => void;
}) {
  const isMentor = user.role === "mentor";
  const partner = isMentor ? connexion.mentees : connexion.mentors;
  const partnerEmail = isMentor ? (connexion.mentees?.email ?? null) : (connexion.mentors?.email ?? null);
  const partnerNom = partner?.nom ?? "—";
  const partnerSub = isMentor
    ? (connexion.mentees?.objectif ?? "Mentoring")
    : (connexion.mentors?.specialite ?? "Mentor");

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingWs, setLoadingWs] = useState(true);

  // Assignment form (mentor only)
  const [showForm, setShowForm] = useState(false);
  const [aTitle, setATitle] = useState("");
  const [aDesc, setADesc] = useState("");
  const [aDue, setADue] = useState("");
  const [aLoading, setALoading] = useState(false);

  // Messaging
  const [newMsg, setNewMsg] = useState("");
  const [msgLoading, setMsgLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load workspace data + subscribe to real-time messages
  useEffect(() => {
    let mounted = true;

    (async () => {
      const [{ data: aData }, { data: mData }] = await Promise.all([
        supabase.from("assignments").select("*").eq("connexion_id", connexion.id).order("created_at"),
        supabase.from("messages").select("*").eq("connexion_id", connexion.id).order("created_at"),
      ]);
      if (!mounted) return;
      setAssignments((aData ?? []) as Assignment[]);
      setMessages((mData ?? []) as Message[]);
      setLoadingWs(false);
    })();

    const channel = supabase
      .channel(`ws-msg-${connexion.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `connexion_id=eq.${connexion.id}` },
        payload => {
          if (!mounted) return;
          setMessages(prev => {
            const incoming = payload.new as Message;
            // Skip optimistic duplicates (own messages already inserted)
            if (prev.some(m => m.id === incoming.id)) return prev;
            // Also skip if content+email match a temp message
            if (prev.some(m => m.id.startsWith("temp-") && m.sender_email === incoming.sender_email && m.content === incoming.content)) {
              return prev.map(m => (m.id.startsWith("temp-") && m.content === incoming.content) ? incoming : m);
            }
            return [...prev, incoming];
          });
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [connexion.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function addAssignment() {
    if (!aTitle.trim() || aLoading) return;
    setALoading(true);
    try {
      const { data, error } = await supabase
        .from("assignments")
        .insert({
          connexion_id: connexion.id,
          mentor_id:    connexion.mentor_id,
          mentee_id:    connexion.mentees?.id ?? null,
          title:        aTitle.trim(),
          description:  aDesc.trim() || null,
          due_date:     aDue || null,
          status:       "pending",
        })
        .select()
        .single();

      if (error) {
        console.error("[workspace/addAssignment] insert failed:", error);
        alert(`Failed to add assignment: ${error.message}`);
        return;
      }
      if (data) {
        setAssignments(prev => [...prev, data as Assignment]);
        setATitle(""); setADesc(""); setADue(""); setShowForm(false);

        // Fire-and-forget email notification to the mentee.
        if (connexion.mentees?.email) {
          fetch("/api/workspace/notify-assignment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              menteeEmail: connexion.mentees.email,
              menteeNom:   connexion.mentees.nom ?? "there",
              mentorNom:   user.nom,
              title:       aTitle.trim(),
            }),
          }).catch(err => console.error("[workspace/notify-assignment] error:", err));
        }
      }
    } finally {
      setALoading(false);
    }
  }

  async function updateStatus(a: Assignment, status: AssignmentStatus) {
    setAssignments(prev => prev.map(x => x.id === a.id ? { ...x, status } : x));
    const { error } = await supabase.from("assignments").update({ status, updated_at: new Date().toISOString() }).eq("id", a.id);
    if (error) console.error("[workspace/updateStatus] failed:", error);
  }

  async function deleteAssignment(id: string) {
    setAssignments(prev => prev.filter(a => a.id !== id));
    await supabase.from("assignments").delete().eq("id", id);
  }

  // ── Mentee response upload ────────────────────────────────────────────────
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const responseInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  async function handleResponseUpload(a: Assignment, file: File) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File too large — max 10 MB.");
      return;
    }
    setUploadError(null);
    setUploadingId(a.id);
    try {
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${a.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("assignment-files").upload(path, file, { upsert: true });
      if (upErr) throw new Error(upErr.message);
      const { data: signed } = await supabase.storage.from("assignment-files").createSignedUrl(path, 60 * 60 * 24 * 30);
      const fileUrl = signed?.signedUrl ?? path;

      const nowIso = new Date().toISOString();
      const { error: updErr } = await supabase.from("assignments").update({
        response_file_url:     fileUrl,
        response_file_name:    file.name,
        response_submitted_at: nowIso,
        status:                "completed",
        updated_at:            nowIso,
      }).eq("id", a.id);
      if (updErr) throw new Error(updErr.message);

      setAssignments(prev => prev.map(x => x.id === a.id
        ? { ...x, response_file_url: fileUrl, response_file_name: file.name, response_submitted_at: nowIso, status: "completed" }
        : x));

      // Fire-and-forget email notification to the mentor.
      if (connexion.mentors?.email) {
        fetch("/api/workspace/notify-response", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mentorEmail: connexion.mentors.email,
            mentorNom:   connexion.mentors.nom ?? "there",
            menteeNom:   user.nom,
            title:       a.title,
          }),
        }).catch(err => console.error("[workspace/notify-response] error:", err));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      console.error("[workspace/response upload]", msg);
      setUploadError(msg);
    } finally {
      setUploadingId(null);
    }
  }

  async function sendMessage() {
    const content = newMsg.trim();
    if (!content || msgLoading) return;
    setNewMsg("");
    setMsgLoading(true);

    // Optimistic insert
    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      connexion_id: connexion.id,
      sender_email: user.email,
      sender_nom: user.nom,
      content,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          connexion_id:   connexion.id,
          sender_email:   user.email,
          sender_nom:     user.nom,
          receiver_email: partnerEmail,
          content,
        })
        .select()
        .single();
      if (error) console.error("[workspace/sendMessage] insert failed:", error);
      if (!error && data) {
        setMessages(prev => prev.map(m => m.id === tempId ? (data as Message) : m));
      }
      // The notify endpoint skips the email if the recipient's last_active_at
      // is within the presence window (see /api/workspace/notify).
      if (partnerEmail) {
        fetch("/api/workspace/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: partnerEmail, senderNom: user.nom, preview: content.slice(0, 120) }),
        }).catch(() => {});
      }
    } finally {
      setMsgLoading(false);
    }
  }

  function fmtMsgTime(iso: string) {
    return new Date(iso).toLocaleString("en-GB", {
      hour: "2-digit", minute: "2-digit", day: "numeric", month: "short",
    });
  }

  if (loadingWs) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 text-[#7C3AED] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl border border-white/10 hover:border-white/20 flex items-center justify-center text-white/50 hover:text-white transition-colors flex-shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}
          >
            {initials(partnerNom)}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-white leading-tight truncate">{partnerNom}</div>
            <div className="text-xs text-white/35 truncate">{partnerSub}</div>
          </div>
        </div>
      </div>

      {/* Panels */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* ── Assignments ── */}
        <Card className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#A78BFA]" />
              <span className="font-bold text-white text-sm">Assignments</span>
              <span className="text-xs text-white/30">
                {assignments.filter(a => a.status === "done").length}/{assignments.length}
              </span>
            </div>
            {isMentor && (
              <button
                onClick={() => setShowForm(f => !f)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#A78BFA] transition-colors"
                style={{ background: showForm ? "rgba(124,58,237,0.3)" : "rgba(124,58,237,0.15)" }}
              >
                {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {/* Add form */}
          {showForm && isMentor && (
            <div
              className="rounded-xl border border-white/[0.08] p-4 space-y-3"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <input
                value={aTitle}
                onChange={e => setATitle(e.target.value)}
                placeholder="Assignment title *"
                className="w-full rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/25 border border-white/10 focus:border-[#7C3AED] focus:outline-none"
                style={{ background: "rgba(255,255,255,0.05)" }}
              />
              <textarea
                value={aDesc}
                onChange={e => setADesc(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="w-full rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/25 border border-white/10 focus:border-[#7C3AED] focus:outline-none resize-none"
                style={{ background: "rgba(255,255,255,0.05)" }}
              />
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-1.5 flex-1 rounded-xl border border-white/10 px-3 py-2"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <Calendar className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                  <input
                    type="date"
                    value={aDue}
                    onChange={e => setADue(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-white focus:outline-none min-w-0"
                    style={{ colorScheme: "dark" }}
                  />
                </div>
                <button
                  onClick={addAssignment}
                  disabled={!aTitle.trim() || aLoading}
                  className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
                >
                  {aLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Add
                </button>
              </div>
            </div>
          )}

          {uploadError && (
            <div className="text-xs text-red-400 px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              {uploadError}
            </div>
          )}

          {/* Assignment list */}
          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: "360px" }}>
            {assignments.length === 0 ? (
              <div className="text-center py-8 text-white/30 text-sm">
                {isMentor ? "Add your first assignment above" : "No assignments yet"}
              </div>
            ) : (
              assignments.map(a => {
                const done = a.status === "completed" || a.status === "done";
                const badgeColor =
                  done                             ? { fg: "#34d399", bg: "rgba(16,185,129,0.14)", border: "rgba(16,185,129,0.30)", label: "Completed" } :
                  a.status === "in_progress"       ? { fg: "#FBBF24", bg: "rgba(251,191,36,0.14)", border: "rgba(251,191,36,0.30)", label: "In progress" } :
                                                    { fg: "#A78BFA", bg: "rgba(124,58,237,0.14)", border: "rgba(124,58,237,0.30)", label: "New" };
                const isUploading = uploadingId === a.id;
                return (
                  <div
                    key={a.id}
                    className="flex flex-col gap-3 p-3 rounded-xl border border-white/[0.06] group"
                    style={{ background: done ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.02)" }}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => updateStatus(a, done ? "pending" : "completed")}
                        className="mt-0.5 flex-shrink-0 transition-colors"
                        style={{ color: done ? "#34d399" : "rgba(255,255,255,0.25)" }}
                        aria-label="Toggle completed"
                      >
                        {done ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className={`text-sm font-medium leading-snug ${done ? "text-white/35 line-through" : "text-white"}`}>
                            {a.title}
                          </div>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: badgeColor.bg, color: badgeColor.fg, border: `1px solid ${badgeColor.border}` }}
                          >
                            {badgeColor.label}
                          </span>
                        </div>
                        {a.description && (
                          <div className="text-xs text-white/35 mt-0.5 leading-relaxed">{a.description}</div>
                        )}
                        {a.due_date && (
                          <div className="flex items-center gap-1 mt-1.5 text-xs text-white/30">
                            <Calendar className="w-3 h-3" />
                            Due {new Date(a.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </div>
                        )}
                      </div>
                      {isMentor && (
                        <button
                          onClick={() => deleteAssignment(a.id)}
                          className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-white/30 hover:text-red-400 transition-all"
                          aria-label="Delete assignment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* ── Response section — mentee upload / mentor view ── */}
                    {a.response_file_url ? (
                      <div className="flex items-center gap-2 pl-7">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <FileText className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                        <a
                          href={a.response_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#A78BFA] hover:text-white truncate transition-colors"
                        >
                          {a.response_file_name ?? "Response document"}
                        </a>
                        <span className="text-[10px] text-white/25 flex-shrink-0">
                          {a.response_submitted_at ? new Date(a.response_submitted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : ""}
                        </span>
                        <Download className="w-3 h-3 text-white/25 flex-shrink-0" />
                      </div>
                    ) : !isMentor && (
                      <div className="pl-7">
                        <input
                          ref={el => { responseInputRefs.current[a.id] = el; }}
                          type="file"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                          className="hidden"
                          onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) handleResponseUpload(a, f);
                            e.target.value = "";
                          }}
                        />
                        <button
                          onClick={() => responseInputRefs.current[a.id]?.click()}
                          disabled={isUploading}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A78BFA] hover:text-white transition-colors disabled:opacity-50"
                        >
                          {isUploading
                            ? <><Loader2 className="w-3 h-3 animate-spin" /> Uploading…</>
                            : <><Upload className="w-3 h-3" /> Upload response (PDF, Word, image · max 10 MB)</>}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* ── Messages ── */}
        <Card className="p-5 flex flex-col gap-4" style={{ minHeight: "400px" }}>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#A78BFA]" />
            <span className="font-bold text-white text-sm">Messages</span>
          </div>

          {/* Message list */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1" style={{ maxHeight: "290px" }}>
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-white/25 text-sm">
                Start the conversation
              </div>
            ) : (
              messages.map(m => {
                const isOwn = m.sender_email === user.email;
                return (
                  <div key={m.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] flex flex-col gap-0.5 ${isOwn ? "items-end" : "items-start"}`}>
                      {!isOwn && (
                        <span className="text-xs text-white/30 px-1">{m.sender_nom}</span>
                      )}
                      <div
                        className="px-3.5 py-2.5 text-sm leading-relaxed"
                        style={isOwn
                          ? { background: "#7C3AED", color: "#fff", borderRadius: "16px 16px 4px 16px" }
                          : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.85)", borderRadius: "16px 16px 16px 4px" }}
                      >
                        {m.content}
                      </div>
                      <span className="text-[10px] text-white/20 px-1">{fmtMsgTime(m.created_at)}</span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <div className="flex items-end gap-2">
            <textarea
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Type a message…"
              rows={1}
              className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 border border-white/10 focus:border-[#7C3AED] focus:outline-none resize-none"
              style={{ background: "rgba(255,255,255,0.05)" }}
            />
            <button
              onClick={sendMessage}
              disabled={!newMsg.trim() || msgLoading}
              className="w-10 h-10 flex-shrink-0 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 flex items-center justify-center rounded-xl transition-colors"
            >
              {msgLoading
                ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                : <Send className="w-4 h-4 text-white" />}
            </button>
          </div>
        </Card>

      </div>
    </div>
  );
}
