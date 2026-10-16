import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { offboardCompanyUser, syncCompanySeats, isExternalRole } from '../services/userService';

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
  name?: string;
  email?: string;
  role?: string;
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

      const mappedProfiles: CompanyUser[] = (profs || []).map((p: any) => {
        const normRole = String(p.role || '').toLowerCase().trim();
        const isAdminRole = normRole === 'owner' || normRole === 'admin' || normRole === 'super_admin';
        const isClientRole =
          normRole === 'client' ||
          normRole === 'kunde' ||
          normRole === 'auftraggeber' ||
          normRole === 'bauherr' ||
          normRole.includes('client');
        const isExtRole = isExternalRole(normRole);
        const mappedRole: CompanyUser['role'] = isAdminRole
          ? 'Admin'
          : isClientRole
          ? 'Client'
          : isExtRole
          ? 'External Planner'
          : 'Internal';
        return {
          id: p.id,
          name: p.name || p.email,
          email: p.email,
          role: mappedRole,
          avatar: p.photo_url || p.avatar || '',
          ownerId: p.id,
          companyId: p.company_id || safeCompanyId
        };
      });

      const mappedCrm: CompanyUser[] = (crmData || []).map((u: any) => ({
        id: u.id,
        userId: u.user_id || u.id,
        crmId: u.id,
        name: u.name || [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email || 'Kontakt',
        email: u.email || '',
        role: (u.role as any) || 'Internal',
        avatar: '',
        ownerId: u.user_id || u.id,
        companyId: safeCompanyId
      }));

      const userMap = new Map<string, CompanyUser>();
      mappedProfiles.forEach(p => { 
        const key = (p.email || p.id || '').toLowerCase();
        if (key) userMap.set(key, p); 
      });
      mappedCrm.forEach((c: any) => { 
        const key = (c.email || c.id || '').toLowerCase();
        if (key) {
          const existing = userMap.get(key);
          if (existing) {
            userMap.set(key, {
              ...c,
              ...existing,
              id: existing.id || c.userId || c.id,
              userId: existing.id || c.userId || c.id,
              crmId: c.id,
              name: existing.name || c.name,
              role: existing.role === 'Admin' ? 'Admin' : (c.role || existing.role),
              avatar: existing.avatar || c.avatar
            } as any);
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
      const [{ data: mems }, { data: crmUsers }, { data: profs }] = await Promise.all([
        supabase.from('project_members').select('*').eq('company_id', safeCompanyId),
        supabase.from('company_users').select('id, user_id, name, first_name, last_name, email, notes, role').eq('company_id', safeCompanyId),
        supabase.from('profiles').select('id, email, name, role').eq('company_id', safeCompanyId)
      ]);

      const mapped: ProjectMember[] = (mems || []).map(m => {
        let role = (m as any).project_role || ((m as any).role !== 'member' ? (m as any).role : null);
        const matchedUser = crmUsers?.find((cu: any) => 
          cu.id === m.user_id || 
          cu.user_id === m.user_id || 
          (cu.email && (m as any).user_email && cu.email.toLowerCase() === (m as any).user_email.toLowerCase())
        );
        const resolvedEmail = (m as any).user_email || matchedUser?.email || '';
        const matchedProfile = profs?.find((p: any) =>
          p.id === m.user_id ||
          (resolvedEmail && p.email && p.email.toLowerCase() === resolvedEmail.toLowerCase())
        );
        if (!role && matchedUser) {
          if (matchedUser.notes && matchedUser.notes.includes('__CRM_META__:')) {
            try {
              const parts = matchedUser.notes.split('__CRM_META__:');
              const meta = JSON.parse(parts[1]);
              if (meta.projectRoles && meta.projectRoles[m.project_id]) {
                role = meta.projectRoles[m.project_id];
              }
            } catch (e) {}
          }
        }
        const resolvedName =
          matchedProfile?.name ||
          matchedUser?.name ||
          [matchedUser?.first_name, matchedUser?.last_name].filter(Boolean).join(' ') ||
          resolvedEmail ||
          'Teammitglied';
        const resolvedCompanyRole = matchedUser?.role || matchedProfile?.role || 'External Partner';
        return {
          id: m.id,
          projectId: m.project_id,
          userId: matchedProfile?.id || matchedUser?.user_id || matchedUser?.id || m.user_id,
          userEmail: resolvedEmail || matchedProfile?.email || '',
          email: resolvedEmail || matchedProfile?.email || '',
          name: resolvedName,
          role: resolvedCompanyRole,
          companyRole: resolvedCompanyRole,
          companyId: m.company_id,
          projectRole: role || 'Editor'
        };
      });

      // Fallback-Synchronisation: Auch externe Partner/Gäste aus company_users (__CRM_META__.projectRoles) einbeziehen,
      // falls project_members wegen einer Foreign-Key-Restriktion (noch kein auth.users Eintrag) den Insert abgelehnt hat.
      (crmUsers || []).forEach((cu: any) => {
        if (!cu.notes || typeof cu.notes !== 'string' || !cu.notes.includes('__CRM_META__:')) return;
        try {
          const parts = cu.notes.split('__CRM_META__:');
          const meta = JSON.parse(parts[1]);
          const projectRolesMap: Record<string, string> = { ...(meta?.projectRoles || {}) };
          if (meta?.assignedProjectId && !projectRolesMap[meta.assignedProjectId]) {
            projectRolesMap[meta.assignedProjectId] = 'Editor';
          }
          Object.entries(projectRolesMap).forEach(([pid, pRole]) => {
            if (!pid) return;
            const cuEmail = (cu.email || '').toLowerCase().trim();
            const alreadyExists = mapped.some(existing =>
              existing.projectId === pid &&
              (existing.userId === cu.id ||
               (cu.user_id && existing.userId === cu.user_id) ||
               (cuEmail && existing.userEmail && existing.userEmail.toLowerCase().trim() === cuEmail))
            );
            if (!alreadyExists) {
              const cuName = cu.name || [cu.first_name, cu.last_name].filter(Boolean).join(' ') || cu.email || 'Kontakt';
              mapped.push({
                id: `crm-pm-${cu.id}-${pid}`,
                projectId: pid,
                userId: cu.user_id || cu.id,
                userEmail: cu.email || '',
                email: cu.email || '',
                name: cuName,
                role: cu.role || 'External Partner',
                companyRole: cu.role || 'External Partner',
                companyId: safeCompanyId,
                projectRole: pRole || 'Editor'
              });
            }
          });
        } catch (_) {}
      });

      setProjectMembers(mapped);
      return mapped;
    } catch (err) {
      console.error('Error fetching project members in useProjectTeam:', err);
    }
    return [];
  }, []);

  const addCompanyUser = useCallback(async (safeCompanyId: string, userData?: any) => {
    if (safeCompanyId && userData && (userData.name || userData.email)) {
      try {
        const meta = {
          department: userData.department || '',
          hourlyRate: Number(userData.hourlyRate ?? userData.hourly_rate ?? 0) || 0,
          projectRoles: userData.projectRoles || {}
        };
        const notesWithMeta = `${userData.notes || ''}\n__CRM_META__:${JSON.stringify(meta)}`.trim();
        await supabase.from('company_users').insert({
          company_id: safeCompanyId,
          name: userData.name || userData.email?.split('@')[0] || 'Teammitglied',
          email: (userData.email || '').toLowerCase().trim(),
          phone: userData.phone || '',
          role: userData.role || 'employee',
          status: userData.status || 'team',
          notes: notesWithMeta,
          created_at: new Date().toISOString()
        });
        await syncCompanySeats(safeCompanyId);
      } catch (e) {
        console.error('Fehler beim Hinzufügen des Benutzers:', e);
      }
    }
    await fetchCompanyUsers(safeCompanyId);
  }, [fetchCompanyUsers]);

  const updateCompanyUser = useCallback(async (safeCompanyId: string, id?: string, userData?: any) => {
    if (safeCompanyId && id && userData) {
      try {
        const updatePayload: Record<string, any> = {};
        if (userData.name !== undefined) updatePayload.name = userData.name;
        if (userData.email !== undefined) updatePayload.email = userData.email.toLowerCase().trim();
        if (userData.phone !== undefined) updatePayload.phone = userData.phone;
        if (userData.role !== undefined) updatePayload.role = userData.role;
        if (userData.department !== undefined) updatePayload.department = userData.department;
        if (userData.status !== undefined) updatePayload.status = userData.status;
        if (userData.hourlyRate !== undefined || userData.hourly_rate !== undefined) {
          updatePayload.hourly_rate = Number(userData.hourlyRate ?? userData.hourly_rate ?? 0);
        }
        if (Object.keys(updatePayload).length > 0) {
          await supabase
            .from('company_users')
            .update(updatePayload as any)
            .eq('company_id', safeCompanyId)
            .or(`id.eq.${id},user_id.eq.${id}`);
          await syncCompanySeats(safeCompanyId);
        }
      } catch (e) {
        console.error('Fehler beim Aktualisieren des Benutzers:', e);
      }
    }
    await fetchCompanyUsers(safeCompanyId);
  }, [fetchCompanyUsers]);

  const removeCompanyUser = useCallback(async (id: string, safeCompanyId: string) => {
    if (!id) return;
    try {
      await offboardCompanyUser(id, safeCompanyId);
    } catch (e) {
      console.error('Fehler beim Löschen des Benutzers:', e);
    }
    await fetchCompanyUsers(safeCompanyId);
  }, [fetchCompanyUsers]);

  const addProjectMember = useCallback(async (projectId: string, memberData: any, safeCompanyId: string) => {
    if (!projectId || !memberData?.userId) return;
    const initialRole = memberData.projectRole || 'Editor';
    const cleanEmail = (memberData.userEmail || '').toLowerCase().trim();
    const newMember: ProjectMember = {
      id: `pm-${Date.now()}`,
      projectId,
      userId: memberData.userId,
      userEmail: cleanEmail,
      email: cleanEmail,
      name: memberData.name || cleanEmail || 'Teammitglied',
      role: memberData.companyRole || 'External Partner',
      projectRole: initialRole,
      companyRole: memberData.companyRole || 'External Partner',
      companyId: safeCompanyId
    };

    setProjectMembers(prev => [...prev, newMember]);

    try {
      const insertPayload: any = {
        project_id: projectId,
        user_id: memberData.userId,
        company_id: safeCompanyId,
        project_role: initialRole
      };
      if (cleanEmail) insertPayload.user_email = cleanEmail;
      const { error: insErr } = await supabase.from('project_members').insert(insertPayload);
      if (insErr) {
        delete insertPayload.user_email;
        const { error: retryErr } = await supabase.from('project_members').insert(insertPayload);
        if (retryErr) {
          delete insertPayload.project_role;
          insertPayload.role = initialRole;
          await supabase.from('project_members').insert(insertPayload);
        }
      }
    } catch (err) {
      console.warn('addProjectMember error:', err);
    }

    try {
      let u: any = null;
      const { data: byIdRows } = await supabase.from('company_users')
        .select('id, notes')
        .eq('company_id', safeCompanyId)
        .or(`id.eq.${memberData.userId},user_id.eq.${memberData.userId}`)
        .limit(1);
      u = Array.isArray(byIdRows) && byIdRows.length > 0 ? byIdRows[0] : null;

      if (!u && cleanEmail) {
        const { data: byEmailRows } = await supabase.from('company_users')
          .select('id, notes')
          .eq('company_id', safeCompanyId)
          .ilike('email', cleanEmail)
          .limit(1);
        u = Array.isArray(byEmailRows) && byEmailRows.length > 0 ? byEmailRows[0] : null;
      }

      if (u) {
        const rawNotes = u.notes || '';
        const parts = rawNotes.split('__CRM_META__:');
        const cleanText = (parts[0] || '').trim();
        let meta: any = {};
        if (parts[1]) {
          try {
            meta = JSON.parse(parts[1]);
          } catch (e) {}
        }
        if (!meta.projectRoles) meta.projectRoles = {};
        meta.projectRoles[projectId] = initialRole;
        const updatedNotes = (cleanText ? `${cleanText}\n\n` : '') + `__CRM_META__:${JSON.stringify(meta)}`;
        await supabase.from('company_users')
          .update({ notes: updatedNotes })
          .eq('id', u.id)
          .eq('company_id', safeCompanyId);
      }
    } catch (e) {}

    await Promise.all([
      fetchCompanyUsers(safeCompanyId),
      fetchProjectMembers(safeCompanyId)
    ]);
  }, [fetchCompanyUsers, fetchProjectMembers]);

  const updateProjectMemberRole = useCallback(async (projectId: string, userId: string, newRole: string, safeCompanyId: string) => {
    if (!projectId || !userId) return;

    // 1. Instant optimistic state update in memory
    setProjectMembers(prev => prev.map(m => {
      if (m.projectId === projectId && (m.userId === userId || m.id === userId)) {
        return { ...m, projectRole: newRole };
      }
      return m;
    }));

    // 2. Native database column update in project_members (match user_id, id, or linked company_users id)
    try {
      const { data: cuMatchRows } = await supabase.from('company_users')
        .select('id, user_id')
        .eq('company_id', safeCompanyId)
        .or(`id.eq.${userId},user_id.eq.${userId}`)
        .limit(1);
      const cuMatch = Array.isArray(cuMatchRows) && cuMatchRows.length > 0 ? cuMatchRows[0] : null;

      const candidateIds = Array.from(new Set([userId, cuMatch?.id, cuMatch?.user_id].filter(Boolean)));
      for (const cid of candidateIds) {
        await supabase.from('project_members')
          .update({ project_role: newRole } as any)
          .eq('project_id', projectId)
          .eq('user_id', cid);
      }
      await supabase.from('project_members')
        .update({ project_role: newRole } as any)
        .eq('project_id', projectId)
        .eq('id', userId);
    } catch (err) {
      console.warn('Native project_members update error:', err);
    }

    // 3. Persist in company_users CRM_META (matching by ID or email)
    try {
      let u: any = null;
      const { data: byIdRows } = await supabase.from('company_users')
        .select('id, notes')
        .eq('company_id', safeCompanyId)
        .or(`id.eq.${userId},user_id.eq.${userId}`)
        .limit(1);
      u = Array.isArray(byIdRows) && byIdRows.length > 0 ? byIdRows[0] : null;

      if (!u) {
        // Look up by profile or email
        const { data: prof } = await supabase.from('profiles').select('email').eq('id', userId).maybeSingle();
        if (prof?.email) {
          const { data: byEmailRows } = await supabase.from('company_users')
            .select('id, notes')
            .eq('company_id', safeCompanyId)
            .ilike('email', prof.email)
            .limit(1);
          u = Array.isArray(byEmailRows) && byEmailRows.length > 0 ? byEmailRows[0] : null;
        }
      }

      if (u) {
        const rawNotes = u.notes || '';
        const parts = rawNotes.split('__CRM_META__:');
        const cleanText = (parts[0] || '').trim();
        let meta: any = {};
        if (parts[1]) {
          try {
            meta = JSON.parse(parts[1]);
          } catch (e) {}
        }
        if (!meta.projectRoles) meta.projectRoles = {};
        meta.projectRoles[projectId] = newRole;
        const updatedNotes = (cleanText ? `${cleanText}\n\n` : '') + `__CRM_META__:${JSON.stringify(meta)}`;
        await supabase.from('company_users')
          .update({ notes: updatedNotes })
          .eq('id', u.id)
          .eq('company_id', safeCompanyId);
      }
    } catch (e) {
      console.error('Error persisting project role in company_users:', e);
    }
  }, []);


  const removeProjectMember = useCallback(async (projectId: string, userId: string, safeCompanyId: string) => {
    if (!projectId || !userId) return;
    setProjectMembers(prev => prev.filter(m => !(m.projectId === projectId && (m.userId === userId || m.id === userId))));

    try {
      const { data: cuMatchRows } = await supabase.from('company_users')
        .select('id, user_id, notes')
        .eq('company_id', safeCompanyId)
        .or(`id.eq.${userId},user_id.eq.${userId}`)
        .limit(1);
      const cuMatch = Array.isArray(cuMatchRows) && cuMatchRows.length > 0 ? cuMatchRows[0] : null;
      const candidateIds = Array.from(new Set([userId, cuMatch?.id, cuMatch?.user_id].filter(Boolean)));
      for (const cid of candidateIds) {
        await supabase.from('project_members').delete().eq('project_id', projectId).eq('user_id', cid);
      }
      await supabase.from('project_members').delete().eq('project_id', projectId).eq('id', userId);

      // Auch aus company_users.__CRM_META__.projectRoles entfernen, damit externe Zugriffe vollständig entzogen werden
      if (cuMatch && cuMatch.notes && typeof cuMatch.notes === 'string' && cuMatch.notes.includes('__CRM_META__:')) {
        try {
          const parts = cuMatch.notes.split('__CRM_META__:');
          const cleanText = (parts[0] || '').trim();
          const meta = JSON.parse(parts[1] || '{}');
          let changed = false;
          if (meta.projectRoles && meta.projectRoles[projectId]) {
            delete meta.projectRoles[projectId];
            changed = true;
          }
          if (meta.assignedProjectId === projectId) {
            delete meta.assignedProjectId;
            changed = true;
          }
          if (changed) {
            const updatedNotes = (cleanText ? `${cleanText}\n\n` : '') + `__CRM_META__:${JSON.stringify(meta)}`;
            await supabase.from('company_users')
              .update({ notes: updatedNotes })
              .eq('id', cuMatch.id)
              .eq('company_id', safeCompanyId);
          }
        } catch (_) {}
      }
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
