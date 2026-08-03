import { supabase } from './lib/supabase';

export const isConfigured = true;

export const auth: any = {
  get currentUser() {
    return null;
  },
  signOut: () => supabase.auth.signOut()
};

export const db: any = null;
export const storage: any = null;
export const functions: any = null;