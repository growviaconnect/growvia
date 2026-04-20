import { createClient } from "@supabase/supabase-js";

// Fallback values allow the build to succeed on Vercel even if env vars are not yet
// configured in the dashboard — actual DB calls will simply fail gracefully at runtime.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://txpibvjktfltowjmvvmg.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_6ELkO-_Y66xpgzG6-OWfGg_RMMcPGKD";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type CertStatut = "none" | "pending" | "certified" | "rejected";

export type Mentor = {
  id: string;
  nom: string;
  email: string;
  specialite: string | null;
  statut: "pending" | "active" | "rejected";
  certification_statut: CertStatut;
  actif: boolean;
  created_at: string;
  // onboarding fields
  location?: string | null;
  languages?: string[] | null;
  industry?: string | null;
  job_title?: string | null;
  years_experience?: string | null;
  seniority?: string | null;
  expertise?: string[] | null;
  mentoring_experience?: string | null;
  motivation?: string | null;
  availability?: string | null;
  session_preferences?: string[] | null;
  certification_willing?: boolean | null;
  bio?: string | null;
  mentor_score?: number | null;
  recommended_price?: number | null;
};

export type Mentee = {
  id: string;
  nom: string;
  email: string;
  objectif: string | null;
  statut: "pending" | "active" | "rejected";
  actif: boolean;
  created_at: string;
  // onboarding fields
  age_range?: string | null;
  situation?: string | null;
  field?: string | null;
  main_goal?: string | null;
  interests?: string[] | null;
  clarity_level?: number | null;
  description?: string | null;
};

export type Connexion = {
  id: string;
  mentor_id: string | null;
  mentee_id: string | null;
  statut: "pending" | "active" | "completed" | "cancelled";
  date: string;
  created_at: string;
  mentors?: Pick<Mentor, "nom" | "email">;
  mentees?: Pick<Mentee, "nom" | "email">;
};

export type AIMatching = {
  id: string;
  mentor_id: string | null;
  mentee_id: string | null;
  score: number | null;
  statut: "active" | "cancelled";
  created_at: string;
  mentors?: Pick<Mentor, "nom" | "email">;
  mentees?: Pick<Mentee, "nom" | "email">;
};
