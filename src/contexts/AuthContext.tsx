"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getUserSession, setUserSession, clearUserSession, type UserSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { clearAuthCookie } from "@/lib/auth";

type AuthCtx = {
  session: UserSession | null;
  setSession: (s: UserSession) => void;
  clearSession: () => void;
};

const AuthContext = createContext<AuthCtx>({
  session: null,
  setSession: () => {},
  clearSession: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<UserSession | null>(null);

  useEffect(() => {
    // Hydrate from localStorage on client mount
    setSessionState(getUserSession());

    // Stay in sync with Supabase auth (handles token expiry, sign-out from another tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        clearUserSession();
        clearAuthCookie();
        setSessionState(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  function setSession(s: UserSession) {
    setUserSession(s);
    setSessionState(s);
  }

  function clearSession() {
    clearUserSession();
    clearAuthCookie();
    setSessionState(null);
  }

  return (
    <AuthContext.Provider value={{ session, setSession, clearSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
