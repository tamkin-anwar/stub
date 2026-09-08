import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { supabaseReady } from "../lib/env";
import type { Profile } from "../lib/types";

interface AuthValue {
  ready: boolean;
  configured: boolean;
  loading: boolean;
  /** True once a profile lookup has finished for the current session (found or not). */
  profileChecked: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  signUp: (args: { email: string; password: string; username: string; displayName: string }) => Promise<void>;
  signIn: (args: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileChecked, setProfileChecked] = useState(false);
  const [loading, setLoading] = useState(supabaseReady);
  const mounted = useRef(true);

  const loadProfile = useCallback(async (userId: string) => {
    if (!supabase) return;
    let { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    // Just after sign-up the trigger row can lag by a beat; give it one retry.
    if (!data) {
      await sleep(900);
      ({ data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle());
    }
    if (mounted.current) {
      setProfile((data as Profile) ?? null);
      setProfileChecked(true);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted.current) return;
      setSession(data.session);
      if (data.session?.user) await loadProfile(data.session.user.id);
      else setProfileChecked(true);
      if (mounted.current) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setProfileChecked(false);
      if (next?.user) {
        void loadProfile(next.user.id);
      } else {
        setProfile(null);
        setProfileChecked(true);
      }
    });

    return () => {
      mounted.current = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signUp: AuthValue["signUp"] = useCallback(async ({ email, password, username, displayName }) => {
    if (!supabase) throw new Error("Supabase is not configured.");
    const clean = username.trim().toLowerCase();
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { username: clean, display_name: displayName.trim() || clean } },
    });
    if (error) throw error;
  }, []);

  const signIn: AuthValue["signIn"] = useCallback(async ({ email, password }) => {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setProfile(null);
    setProfileChecked(true);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user) await loadProfile(session.user.id);
  }, [session, loadProfile]);

  const value = useMemo<AuthValue>(
    () => ({
      ready: !loading,
      configured: supabaseReady,
      loading,
      profileChecked,
      session,
      user: session?.user ?? null,
      profile,
      signUp,
      signIn,
      signOut,
      refreshProfile,
    }),
    [loading, profileChecked, session, profile, signUp, signIn, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
