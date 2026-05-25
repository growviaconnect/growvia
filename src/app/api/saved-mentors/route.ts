import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function resolveUser(req: NextRequest) {
  const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "").trim();
  if (!token) return null;
  const admin = getAdmin();
  const { data: { user } } = await admin.auth.getUser(token);
  return user?.email ? { admin, email: user.email } : null;
}

async function getMenteeId(admin: ReturnType<typeof getAdmin>, email: string) {
  const { data } = await admin.from("mentees").select("id").eq("email", email).single();
  return (data as { id: string } | null)?.id ?? null;
}

// GET /api/saved-mentors?mentorId=... → { saved: boolean }
// GET /api/saved-mentors             → { saved: [{ mentor_id, mentor: {...} }] }
export async function GET(req: NextRequest) {
  const ctx = await resolveUser(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const menteeId = await getMenteeId(ctx.admin, ctx.email);
  if (!menteeId) return NextResponse.json({ error: "Mentee not found" }, { status: 404 });

  const mentorId = new URL(req.url).searchParams.get("mentorId");

  if (mentorId) {
    const { data } = await ctx.admin
      .from("saved_mentors")
      .select("id")
      .eq("mentee_id", menteeId)
      .eq("mentor_id", mentorId)
      .maybeSingle();
    return NextResponse.json({ saved: !!data });
  }

  // Full list — fetch IDs then details to avoid needing an FK relationship
  const { data: rows } = await ctx.admin
    .from("saved_mentors")
    .select("mentor_id, created_at")
    .eq("mentee_id", menteeId)
    .order("created_at", { ascending: false });

  const ids = (rows ?? []).map(r => (r as { mentor_id: string }).mentor_id);

  if (ids.length === 0) return NextResponse.json({ saved: [] });

  const { data: mentors } = await ctx.admin
    .from("mentors")
    .select("id, nom, poste_actuel, entreprise, photo_url, session_price, job_title, specialite, industry")
    .in("id", ids);

  // Preserve save order
  const byId = new Map((mentors ?? []).map(m => [(m as { id: string }).id, m]));
  const ordered = ids.map(id => byId.get(id)).filter(Boolean);

  return NextResponse.json({ saved: ordered });
}

// POST /api/saved-mentors { mentorId } → toggle → { saved: boolean }
export async function POST(req: NextRequest) {
  const ctx = await resolveUser(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let mentorId: string;
  try {
    const body = await req.json() as { mentorId: string };
    mentorId = (body.mentorId ?? "").trim();
    if (!mentorId) throw new Error("missing mentorId");
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const menteeId = await getMenteeId(ctx.admin, ctx.email);
  if (!menteeId) return NextResponse.json({ error: "Mentee not found" }, { status: 404 });

  const { data: existing } = await ctx.admin
    .from("saved_mentors")
    .select("id")
    .eq("mentee_id", menteeId)
    .eq("mentor_id", mentorId)
    .maybeSingle();

  if (existing) {
    await ctx.admin.from("saved_mentors").delete().eq("id", (existing as { id: string }).id);
    return NextResponse.json({ saved: false });
  }

  await ctx.admin.from("saved_mentors").insert({ mentee_id: menteeId, mentor_id: mentorId });
  return NextResponse.json({ saved: true });
}
