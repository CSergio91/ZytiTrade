import { createClient } from '@supabase/supabase-js';

// Local Supabase configuration (defaults to local docker port 54321)
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.dummy';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserSession {
  email: string;
  name?: string;
  isDemo?: boolean;
}

export const getStoredSession = (): UserSession | null => {
  try {
    const raw = localStorage.getItem('zyti_user_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredSession = (user: UserSession | null) => {
  if (user) {
    localStorage.setItem('zyti_user_session', JSON.stringify(user));
  } else {
    localStorage.removeItem('zyti_user_session');
  }
};
