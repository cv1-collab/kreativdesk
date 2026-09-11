import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const DEFAULT_SUPABASE_URL = 'https://jtgfrogbrkrllzdwzdrt.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Z2Zyb2dicmtybGx6ZHd6ZHJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0ODMzOTcsImV4cCI6MjEwMTA1OTM5N30.WHFlicuJoJ2xSevb2-HvWgPml8Rwz28fTOFppQkvlYE';

const rawUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) || '';
const rawKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) || '';

const cleanUrl = typeof rawUrl === 'string' ? rawUrl.replace(/^["']|["']$/g, '').trim() : '';
const cleanKey = typeof rawKey === 'string' ? rawKey.replace(/^["']|["']$/g, '').trim() : '';

export const supabaseUrl = cleanUrl && cleanUrl.startsWith('http') ? cleanUrl : DEFAULT_SUPABASE_URL;
export const supabaseAnonKey = cleanKey && cleanKey.length > 20 ? cleanKey : DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
