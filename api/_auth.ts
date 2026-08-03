import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://jtgfrogbrkrllzdwzdrt.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Z2Zyb2dicmtybGx6ZHd6ZHJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0ODMzOTcsImV4cCI6MjEwMTA1OTM5N30.WHFlicuJoJ2xSevb2-HvWgPml8Rwz28fTOFppQkvlYE';

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export function getSupabaseAdmin() {
  return supabaseAdmin;
}

export async function verifyAuth(req: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split('Bearer ')[1];

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;
    
    const SUPER_ADMINS = ['cv1@gmx.ch', 'carlo@vesciodesign.ch'];
    if (SUPER_ADMINS.includes(user.email?.toLowerCase() || '')) {
      return user;
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return { ...user, plan: profile?.plan, companyId: profile?.company_id };
  } catch (error) {
    console.error('Auth verification failed:', error);
    return null;
  }
}
