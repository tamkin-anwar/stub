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
  signUp: (args: {
    email: string;
    password: string;
    username: string;
    displayName: string;
  }) => Promise<{ needsConfirmation: boolean }>;
  signIn: (args: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileChecked, setProfileChecked] = useState(false);
  const [loading, setLoading] = useState(supabaseReady);
  // Bumped on unmount and before each new load; a load only commits its
  // result while its token is still current (guards unmount + overlapping loads).
  const loadSeq = useRef(0);

  const loadProfile = useCallback(async (userId: string) => {
    if (!supabase) return;
    const seq = ++loadSeq.current;
    let { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    // Just after sign-up the trigger row can lag by a beat; give it one retry.
    if (!data) {
      await sleep(900);
      ({ data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle());
    }
    if (seq !== loadSeq.current) return;
    setProfile((data as Profile) ?? null);
    setProfileChecked(true);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (cancelled) return;
        setSession(data.session);
        if (data.session?.user) await loadProfile(data.session.user.id);
        else setProfileChecked(true);
      })
      .catch(() => !cancelled && setProfileChecked(true))
      .finally(() => !cancelled && setLoading(false));

    let currentUserId: string | null = null;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      const nextId = next?.user?.id ?? null;
      // Token refreshes and tab refocus re-fire this with the same user; only
      // re-check the profile when a signed-in identity actually changes.
      if (nextId && nextId === currentUserId) return;
      currentUserId = nextId;
      if (nextId) {
        setProfileChecked(false);
        void loadProfile(nextId);
      } else {
        setProfile(null);
        setProfileChecked(true);
      }
    });

    return () => {
      cancelled = true;
      loadSeq.current++;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signUp: AuthValue["signUp"] = useCallback(async ({ email, password, username, displayName }) => {
    if (!supabase) throw new Error("Supabase is not configured.");
    const clean = username.trim().toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { username: clean, display_name: displayName.trim() || clean } },
    });
    if (error) throw error;
    // With email confirmation on, Supabase returns a user but no session.
    return { needsConfirmation: !data.session };
  }, []);

  const signIn: AuthValue["signIn"] = useCallback(async ({ email, password }) => {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
  }, []);

  const resendConfirmation: AuthValue["resendConfirmation"] = useCallback(async (email: string) => {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { error } = await supabase.auth.resend({ type: "signup", email: email.trim() });
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
      resendConfirmation,
      refreshProfile,
    }),
    [
      loading,
      profileChecked,
      session,
      profile,
      signUp,
      signIn,
      signOut,
      resendConfirmation,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
