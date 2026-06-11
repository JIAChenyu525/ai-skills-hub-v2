import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createClient, type Session, type User } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ybbepmotbitjrpsvsics.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliYmVwbW90Yml0anJwc3ZzaWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTU2MzksImV4cCI6MjA5NjU5MTYzOX0.iuJu5TUHQ3TdQb5hCSqb_Ie3XGOa5f2V_IWRPoTn77g"
);

export { supabase };

export interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  session: null, user: null, profile: null, loading: true,
  signIn: async () => ({}), signUp: async () => ({}), signOut: async () => {},
  updateProfile: async () => {},
});

const ADMIN_EMAILS = ["2396143108@qq.com"];

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase.from("profiles").select("*").eq("user_id", userId).single();
  return data;
}

async function ensureProfile(user: User): Promise<Profile> {
  let profile = await fetchProfile(user.id);
  if (!profile) {
    const { data } = await supabase.from("profiles").insert({
      user_id: user.id,
      username: user.email?.split("@")[0] || "用户",
      avatar_url: null,
      bio: null,
    }).select().single();
    profile = data;
  }
  return profile!;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        const p = await ensureProfile(session.user);
        setProfile(p);
      }
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        const p = await ensureProfile(session.user);
        setProfile(p);
      } else {
        setUser(null); setProfile(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { error: "邮箱或密码错误" };
    return {};
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email: email.trim(), password });
    if (error) return { error: error.message };
    // Auto login after signup
    const { error: err2 } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (err2) return { error: "注册成功！请登录" };
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null); setProfile(null);
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return;
    const { data: updated } = await supabase.from("profiles").update(data).eq("user_id", user.id).select().single();
    if (updated) setProfile(updated);
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
export function useIsAdmin() {
  const { user } = useAuth();
  return user?.email ? ADMIN_EMAILS.includes(user.email) : false;
}
