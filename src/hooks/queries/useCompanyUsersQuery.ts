import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

export const COMPANY_USERS_QUERY_KEY = 'company_users';

export interface CompanyUserItem {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: string;
  company?: string;
  email?: string;
  phone?: string;
  companyId: string;
  status?: string;
  createdAt?: string;
}

export function useCompanyUsersQuery(companyId?: string | null) {
  const queryClient = useQueryClient();
  const queryKey = [COMPANY_USERS_QUERY_KEY, companyId];

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<CompanyUserItem[]> => {
      if (!companyId) return [];

      const { data, error } = await supabase
        .from('company_users')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useCompanyUsersQuery] Error fetching company users:', error);
        throw error;
      }

      return (data || []).map((u: any) => ({
        id: u.id,
        name: u.name || [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email || 'Kontakt',
        firstName: u.first_name || u.name?.split(' ')[0] || '',
        lastName: u.last_name || u.name?.split(' ').slice(1).join(' ') || '',
        role: u.role || 'partner',
        company: u.company || '',
        email: u.email || '',
        phone: u.phone || '',
        companyId: u.company_id || companyId,
        status: u.status || 'neu',
        createdAt: u.created_at,
      }));
    },
    enabled: Boolean(companyId),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  // Realtime subscription for contact updates
  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel(`realtime_company_users_${companyId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'company_users',
        filter: `company_id=eq.${companyId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: [COMPANY_USERS_QUERY_KEY, companyId] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, queryClient]);

  return query;
}
