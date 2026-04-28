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
  updated_at?: string | null;
  // onboarding fields
  job_title?: string | null;
  company?: string | null;
  industry?: string | null;
  years_experience?: string | null;
  seniority?: string | null;
  expertise?: string[] | null;
  help_with?: string | null;
  languages?: string[] | null;
  availability?: string | null;
  mentor_score?: number | null;
  session_price?: number | null;
  onboarding_completed?: boolean | null;
  // profile + survey fields
  photo_url?: string | null;
  bio?: string | null;
  localisation?: string | null;
  poste_actuel?: string | null;
  entreprise?: string | null;
  annees_experience?: number | null;
  secteurs?: string[] | null;
  competences?: Record<string, unknown> | null;
  type_profils_aides?: string[] | null;
  style_mentorat?: string | null;
  disponibilite_heures?: number | null;
  max_mentees?: number | null;
  langues?: string[] | null;
  cv_url?: string | null;
  linkedin_url?: string | null;
  motivation?: string | null;
  format_prefere?: string | null;
  survey_completed?: boolean | null;
  // legacy fields
  location?: string | null;
  mentoring_experience?: string | null;
  session_preferences?: string[] | null;
  certification_willing?: boolean | null;
  recommended_price?: number | null;
  match_score_override?: number | null;
};

export type Mentee = {
  id: string;
  nom: string;
  email: string;
  objectif: string | null;
  statut: "pending" | "active" | "rejected";
  actif: boolean;
  created_at: string;
  updated_at?: string | null;
  // onboarding fields
  age_range?: string | null;
  situation?: string | null;
  field?: string | null;
  main_goal?: string | null;
  interests?: string[] | null;
  clarity_level?: number | null;
  description?: string | null;
  has_used_free_ai_match?: boolean | null;
  // profile + survey fields
  photo_url?: string | null;
  bio?: string | null;
  localisation?: string | null;
  objectif_principal?: string | null;
  secteurs_vises?: string[] | null;
  poste_cible?: string | null;
  horizon_temporel?: string | null;
  niveau_etudes?: string | null;
  ecole?: string | null;
  experiences?: string | null;
  style_apprentissage?: string | null;
  frequence_souhaitee?: string | null;
  format_prefere?: string | null;
  langues?: string[] | null;
  competences?: Record<string, unknown> | null;
  cv_url?: string | null;
  linkedin_url?: string | null;
  motivation?: string | null;
  survey_completed?: boolean | null;
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
