import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Mentor = {
  id: string;
  nom: string;
  email: string;
  specialite: string | null;
  statut: "pending" | "active" | "rejected";
  created_at: string;
};

export type Mentee = {
  id: string;
  nom: string;
  email: string;
  objectif: string | null;
  statut: "pending" | "active" | "rejected";
  created_at: string;
};

export type Connexion = {
  id: string;
  mentor_id: string | null;
  mentee_id: string | null;
  statut: "pending" | "active" | "completed" | "cancelled";
  date: string;
  created_at: string;
  mentors?: Mentor;
  mentees?: Mentee;
};
