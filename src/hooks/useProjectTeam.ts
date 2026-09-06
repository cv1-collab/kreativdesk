import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface CompanyUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Internal' | 'External Planner' | 'Client';
  department?: string;
  hourlyRate?: number;
  avatar?: string;
  ownerId: string;
  companyId: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  companyId: string;
  userEmail?: string;
  projectRole?: string;
  companyRole?: string;
}

export function useProjectTeam() {
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState<boolean>(false);

  const fetchCompanyUsers = useCallback(async (safeCompanyId: string) => {
    if (!safeCompanyId) return [];
    try {
      const { data: profs } = await supabase
        .from('profiles')
        .select('*')
        .eq('company_id', safeCompanyId);

      const { data: crmData } = await supabase
        .from('company_users')
        .select('*')
        .eq('company_id', safeCompanyId);

      const mappedProfiles: CompanyUser[] = (profs || []).map((p: any) => ({
        id: p.id,
        name: p.name || p.email,
        email: p.email,
        role: p.role === 'owner' ? 'Admin' : 'Internal',
        avatar: p.photo_url || p.avatar || '',
        ownerId: p.id,
        companyId: p.company_id || safeCompanyId
      }));

      const mappedCrm: CompanyUser[] = (crmData || []).map((u: any) => ({
        id: u.id,
        name: u.name || [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email || 'Kontakt',
        email: u.email || '',
        role: (u.role as any) || 'Internal',
        avatar: '',
        ownerId: u.id,
        companyId: safeCompanyId
      }));

      const userMap = new Map<string, CompanyUser>();
      mappedProfiles.forEach(p => { if (p.id || p.email) userMap.set(p.id || p.email, p); });
      mappedCrm.forEach(c => { if (c.id || c.email) userMap.set(c.id || c.email, c); });

      const combinedUsers = Array.from(userMap.values());
      setCompanyUsers(combinedUsers);
      return combinedUsers;
    } catch (err) {
      console.error('Error fetching company users in useProjectTeam:', err);
      return [];
    }
  }, []);

  const fetchProjectMembers = useCallback(async (safeCompanyId: string) => {
    if (!safeCompanyId) return [];
    try {
      const { data: mems } = await supabase
        .from('project_members')
        .select('*')
        .eq('company_id', safeCompanyId);

      if (mems) {
        const mapped: ProjectMember[] = mems.map(m => ({
          id: m.id,
          projectId: m.project_id,
          userId: m.user_id,
          companyId: m.company_id
        }));
        setProjectMembers(mapped);
        return mapped;
      }
    } catch (err) {
      console.error('Error fetching project members in useProjectTeam:', err);
    }
    return [];
  }, []);

  const addCompanyUser = useCallback(async (safeCompanyId: string) => {
    await fetchCompanyUsers(safeCompanyId);
  }, [fetchCompanyUsers]);

  const updateCompanyUser = useCallback(async (safeCompanyId: string) => {
    await fetchCompanyUsers(safeCompanyId);
  }, [fetchCompanyUsers]);

  const removeCompanyUser = useCallback(async (id: string, safeCompanyId: string) => {
    if (!id) return;
    try {
      await supabase.from('company_users').delete().eq('id', id);
      await supabase.from('profiles').delete().eq('id', id).eq('company_id', safeCompanyId);
    } catch (e) {
      console.error('Fehler beim Löschen des Benutzers:', e);
    }
    await fetchCompanyUsers(safeCompanyId);
  }, [fetchCompanyUsers]);

  const addProjectMember = useCallback(async (projectId: string, memberData: any, safeCompanyId: string) => {
    if (!projectId || !memberData?.userId) return;
    const newMember: ProjectMember = {
      id: `pm-${Date.now()}`,
      projectId,
      userId: memberData.userId,
      userEmail: memberData.userEmail || '',
      projectRole: memberData.projectRole || 'Viewer',
      companyRole: memberData.companyRole || 'External Partner',
      companyId: safeCompanyId
    };

    setProjectMembers(prev => [...prev, newMember]);

    try {
      await supabase.from('project_members').insert({
        project_id: projectId,
        user_id: memberData.userId,
        company_id: safeCompanyId
      });
    } catch (err) {
      console.warn('addProjectMember error:', err);
    }
    await fetchProjectMembers(safeCompanyId);
  }, [fetchProjectMembers]);

  const removeProjectMember = useCallback(async (projectId: string, userId: string, safeCompanyId: string) => {
    if (!projectId || !userId) return;
    setProjectMembers(prev => prev.filter(m => !(m.projectId === projectId && m.userId === userId)));

    try {
      await supabase.from('project_members').delete().eq('project_id', projectId).eq('user_id', userId);
    } catch (err) {
      console.warn('removeProjectMember error:', err);
    }
    await fetchProjectMembers(safeCompanyId);
  }, [fetchProjectMembers]);

  return {
    companyUsers,
    projectMembers,
    setCompanyUsers,
    setProjectMembers,
    fetchCompanyUsers,
    fetchProjectMembers,
    addCompanyUser,
    updateCompanyUser,
    removeCompanyUser,
    addProjectMember,
    removeProjectMember,
    loadingTeam,
    setLoadingTeam
  };
}
