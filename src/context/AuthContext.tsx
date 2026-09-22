import React, { createContext, useContext, useEffect, useMemo, useState } from '\''react'\'';
import { Linking } from '\''react-native'\'';
import { Session } from '\''@supabase/supabase-js'\'';
import { isCloudConfigured, supabase } from '\''../services/supabase'\'';

type AuthContextValue = {
  session: Session | null; loading: boolean; configured: boolean;
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string): Promise<string>;
  resetPassword(email: string): Promise<void>;
  updatePassword(password: string): Promise<void>; signOut(): Promise<void>; deleteAccount(): Promise<void>;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isCloudConfigured);
  useEffect(() => {
    if (!supabase) return setLoading(false);
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!supabase) return;
    const handle = async (url: string | null) => { if (!url) return; const parameters = new URLSearchParams(url.split('\''#'\'')[1] ?? url.split('\''?'\'')[1] ?? '\'''\''); const access_token = parameters.get('\''access_token'\''); const refresh_token = parameters.get('\''refresh_token'\''); if (access_token && refresh_token) await supabase.auth.setSession({ access_token, refresh_token }); };
    Linking.getInitialURL().then(handle); const listener = Linking.addEventListener('\''url'\'', event => { void handle(event.url); }); return () => listener.remove();
  }, []);
  const value = useMemo<AuthContextValue>(() => ({
    session, loading, configured: isCloudConfigured,
    signIn: async (email, password) => { if (!supabase) throw new Error('\''Cloud sync is not configured.'\''); const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; },
    signUp: async (email, password) => { if (!supabase) throw new Error('\''Cloud sync is not configured.'\''); const { data, error } = await supabase.auth.signUp({ email, password }); if (error) throw error; return data.session ? '\''Account created.'\'' : '\''Check your email to confirm your account.'\''; },
    resetPassword: async email => { if (!supabase) throw new Error('\''Cloud sync is not configured.'\''); const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: '\''stride://reset-password'\'' }); if (error) throw error; },
    updatePassword: async password => { if (!supabase) throw new Error('\''Cloud sync is not configured.'\''); const { error } = await supabase.auth.updateUser({ password }); if (error) throw error; },
    signOut: async () => { if (supabase) { const { error } = await supabase.auth.signOut(); if (error) throw error; } },
    deleteAccount: async () => { if (!supabase) throw new Error('\''Cloud sync is not configured.'\''); const { error } = await supabase.rpc('\''delete_own_account'\''); if (error) throw error; await supabase.auth.signOut(); },
  }), [session, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => { const value = useContext(AuthContext); if (!value) throw new Error('\''useAuth requires AuthProvider'\''); return value; };
