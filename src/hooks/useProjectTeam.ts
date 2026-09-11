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
      mappedProfiles.forEach(p => { 
        const key = (p.email || p.id || '').toLowerCase();
        if (key) userMap.set(key, p); 
      });
      mappedCrm.forEach(c => { 
        const key = (c.email || c.id || '').toLowerCase();
        if (key) {
          const existing = userMap.get(key);
          if (existing) {
            userMap.set(key, {
              ...existing,
              ...c,
              id: existing.id || c.id,
              name: existing.name || c.name,
              avatar: existing.avatar || c.avatar
            });
          } else {
            userMap.set(key, c);
          }
        }
      });

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
      const [{ data: mems }, { data: crmUsers }] = await Promise.all([
        supabase.from('project_members').select('*').eq('company_id', safeCompanyId),
        supabase.from('company_users').select('id, notes, role').eq('company_id', safeCompanyId)
      ]);

      if (mems) {
        const mapped: ProjectMember[] = mems.map(m => {
          let role = (m as any).project_role || (m as any).role;
          if (!role && crmUsers) {
            const u = crmUsers.find((cu: any) => cu.id === m.user_id);
            if (u?.notes && u.notes.startsWith('__CRM_META__:')) {
              try {
                const meta = JSON.parse(u.notes.replace('__CRM_META__:', ''));
                if (meta.projectRoles && meta.projectRoles[m.project_id]) {
                  role = meta.projectRoles[m.project_id];
                }
              } catch (e) {}
            }
          }
          return {
            id: m.id,
            projectId: m.project_id,
            userId: m.user_id,
            companyId: m.company_id,
            projectRole: role || 'Viewer'
          };
        });
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
    const initialRole = memberData.projectRole || 'Viewer';
    const newMember: ProjectMember = {
      id: `pm-${Date.now()}`,
      projectId,
      userId: memberData.userId,
      userEmail: memberData.userEmail || '',
      projectRole: initialRole,
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

    try {
      const { data: u } = await supabase.from('company_users')
        .select('id, notes')
        .eq('id', memberData.userId)
        .maybeSingle();

      if (u) {
        let meta: any = {};
        if (u.notes && u.notes.startsWith('__CRM_META__:')) {
          try {
            meta = JSON.parse(u.notes.replace('__CRM_META__:', ''));
          } catch (e) {}
        }
        if (!meta.projectRoles) meta.projectRoles = {};
        meta.projectRoles[projectId] = initialRole;
        await supabase.from('company_users')
          .update({ notes: `__CRM_META__:${JSON.stringify(meta)}` })
          .eq('id', u.id);
      }
    } catch (e) {}

    await fetchProjectMembers(safeCompanyId);
  }, [fetchProjectMembers]);

  const updateProjectMemberRole = useCallback(async (projectId: string, userId: string, newRole: string, safeCompanyId: string) => {
    if (!projectId || !userId) return;

    // 1. Instant optimistic state update in memory
    setProjectMembers(prev => prev.map(m => {
      if (m.projectId === projectId && (m.userId === userId || m.id === userId)) {
        return { ...m, projectRole: newRole };
      }
      return m;
    }));

    // 2. Try native column update if column exists
    try {
      await supabase.from('project_members')
        .update({ project_role: newRole } as any)
        .eq('project_id', projectId)
        .eq('user_id', userId);
    } catch (err) {
      // Column might not exist yet
    }

    // 3. Persist in company_users CRM_META
    try {
      const { data: u } = await supabase.from('company_users')
        .select('id, notes')
        .eq('id', userId)
        .maybeSingle();

      if (u) {
        let meta: any = {};
        if (u.notes && u.notes.startsWith('__CRM_META__:')) {
          try {
            meta = JSON.parse(u.notes.replace('__CRM_META__:', ''));
          } catch (e) {}
        }
        if (!meta.projectRoles) meta.projectRoles = {};
        meta.projectRoles[projectId] = newRole;
        await supabase.from('company_users')
          .update({ notes: `__CRM_META__:${JSON.stringify(meta)}` })
          .eq('id', u.id);
      }
    } catch (e) {
      console.error('Error persisting project role in company_users:', e);
    }
  }, []);

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
    updateProjectMemberRole,
    removeProjectMember,
    loadingTeam,
    setLoadingTeam
  };
}
