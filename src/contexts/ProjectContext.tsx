/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { offboardProject } from '../services/projectService';
import { demoTemplates } from '../utils/demoTemplates';
import { ensureDefaultCompanyFolders } from '../services/seedService';
import { sendNotification } from '../lib/notifications';
import { useProjectDefects, Defect } from '../hooks/useProjectDefects';
import { useProjectTeam, CompanyUser, ProjectMember } from '../hooks/useProjectTeam';
import { useProjectTimeEntries, TimeEntry } from '../hooks/useProjectTimeEntries';
import { queryClient } from '../lib/queryClient';
import { PROJECTS_QUERY_KEY } from '../hooks/queries/useProjectsQuery';
import { safeStorage } from '../utils/safeStorage';
import { checkIsSuperAdmin } from '../config/admins';

export type { Defect, CompanyUser, ProjectMember, TimeEntry };

export interface Project { 
  id: string; 
  name: string; 
  description: string; 
  status: 'active' | 'planning' | 'completed'; 
  role: 'owner' | 'admin' | 'viewer'; 
  createdAt: string; 
  ownerId: string; 
  companyId: string; 
  memberIds?: string[];
  siteLocation?: string;
  site_location?: string;
  cam1Url?: string;
  cam1_url?: string;
  cam2Url?: string;
  cam2_url?: string;
  droneUrl?: string;
  drone_url?: string;
  logisticsUrl?: string;
  logistics_url?: string;
  accessUrl?: string;
  access_url?: string;
}

interface ProjectContextType {
  projects: Project[];
  activeProjectId: string | null;
  companyUsers: CompanyUser[];
  projectMembers: ProjectMember[];
  timeEntries: TimeEntry[];
  defects: Defect[];
  setActiveProject: (id: string | null) => void;
  addProject: (project: any) => Promise<any>;
  removeProject: (id: string) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  renameProject: (id: string, newName: string) => Promise<void>;
  updateProjectStatus: (id: string, status: string) => Promise<void>;
  fetchCompanyUsers: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchProjectDetails: () => Promise<void>;
  refreshAllData: () => Promise<void>;
  addCompanyUser: (user: any) => Promise<void>;
  updateCompanyUser: (id: string, user: any) => Promise<void>;
  removeCompanyUser: (id: string) => Promise<void>;
  addProjectMember: (projectId: string, memberData: any) => Promise<void>;
  updateProjectMemberRole: (projectId: string, userId: string, newRole: string) => Promise<void>;
  removeProjectMember: (projectId: string, userId: string) => Promise<void>;
  addTimeEntry: (entry: any) => Promise<void>;
  isDemoMode: boolean;
  demoData: any;
}

export const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectIdRaw] = useState<string | null>(() => {
    return safeStorage.getString('kreativdesk_active_project_id') || null;
  });

  const setActiveProjectId = useCallback((val: string | null | ((prev: string | null) => string | null)) => {
    setActiveProjectIdRaw(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      if (next) safeStorage.setItem('kreativdesk_active_project_id', next);
      else safeStorage.removeItem('kreativdesk_active_project_id');
      return next;
    });
  }, []);

  // Modular Custom Domain Hooks
  const { defects, fetchDefects } = useProjectDefects();
  const {
    companyUsers,
    projectMembers,
    fetchCompanyUsers: fetchTeamUsers,
    fetchProjectMembers,
    addCompanyUser: addTeamUser,
    updateCompanyUser: updateTeamUser,
    removeCompanyUser: removeTeamUser,
    addProjectMember: addTeamMember,
    updateProjectMemberRole: updateTeamMemberRole,
    removeProjectMember: removeTeamMember
  } = useProjectTeam();
  const { timeEntries, fetchTimeEntries, addTimeEntry: addTimeEntryInternal } = useProjectTimeEntries();

  const getSafeCompanyId = useCallback(() => {
    if (!currentUser) return '';
    const isSuper = checkIsSuperAdmin(currentUser.email) || currentUser.role === 'super_admin';
    const previewCompanyId = isSuper ? safeStorage.session.getString('admin_preview_company_id') : '';
    return previewCompanyId || currentUser.companyId || (currentUser as any)?.company_id || currentUser.uid || '';
  }, [currentUser]);

  const fetchProjects = useCallback(async () => {
    if (!currentUser || !currentUser.uid) return;
    const safeCompanyId = getSafeCompanyId();
    const roleLower = String(currentUser.role || '').toLowerCase().trim();
    const isExternalUser = ['guest', 'client', 'external', 'partner', 'subcontractor', 'handwerker', 'bauherr', 'field guest', 'external planner'].includes(roleLower);

    try {
      if (!isExternalUser) {
        await ensureDefaultCompanyFolders(safeCompanyId, currentUser.uid);
      }

      let projQuery = supabase.from('projects').select('*');
      if (safeCompanyId && safeCompanyId !== currentUser.uid) {
        projQuery = projQuery.eq('company_id', safeCompanyId);
      } else {
        projQuery = projQuery.or(`company_id.eq.${safeCompanyId},owner_id.eq.${currentUser.uid}`);
      }
      const { data } = await projQuery.order('created_at', { ascending: false });

      if (data) {
        let mappedProjects: Project[] = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          status: (p.status as any) || 'planning',
          role: 'owner',
          createdAt: p.created_at || new Date().toISOString(),
          ownerId: p.owner_id || currentUser.uid,
          companyId: p.company_id,
          siteLocation: p.site_location || p.siteLocation || '',
          site_location: p.site_location || p.siteLocation || '',
          cam1Url: p.cam1_url || p.cam1Url || '',
          cam1_url: p.cam1_url || p.cam1Url || '',
          cam2Url: p.cam2_url || p.cam2Url || '',
          cam2_url: p.cam2_url || p.cam2Url || '',
          droneUrl: p.drone_url || p.droneUrl || '',
          drone_url: p.drone_url || p.droneUrl || '',
          logisticsUrl: p.logistics_url || p.logisticsUrl || '',
          logistics_url: p.logistics_url || p.logisticsUrl || '',
          accessUrl: p.access_url || p.accessUrl || '',
          access_url: p.access_url || p.accessUrl || ''
        }));

        if (isExternalUser && safeCompanyId) {
          try {
            const assignedProjectIds = new Set<string>();
            const userEmailLower = (currentUser.email || '').toLowerCase().trim();
            const [{ data: mems }, { data: crmRows }] = await Promise.all([
              supabase.from('project_members').select('project_id, user_id, user_email').eq('company_id', safeCompanyId),
              userEmailLower
                ? supabase.from('company_users').select('id, user_id, email, notes').eq('company_id', safeCompanyId).ilike('email', userEmailLower)
                : Promise.resolve({ data: [] as any[] })
            ]);

            const myIds = new Set<string>([currentUser.uid]);
            (crmRows || []).forEach((cu: any) => {
              if (cu.id) myIds.add(String(cu.id));
              if (cu.user_id) myIds.add(String(cu.user_id));
              if ((cu as any).project_id) assignedProjectIds.add(String((cu as any).project_id));
              if (cu.notes && typeof cu.notes === 'string' && cu.notes.includes('__CRM_META__:')) {
                try {
                  const parts = cu.notes.split('__CRM_META__:');
                  const meta = JSON.parse(parts[1] || '{}');
                  if (meta?.assignedProjectId) assignedProjectIds.add(String(meta.assignedProjectId));
                  if (meta?.projectRoles && typeof meta.projectRoles === 'object') {
                    Object.keys(meta.projectRoles).forEach(pid => assignedProjectIds.add(pid));
                  }
                } catch (_) {}
              }
            });

            (mems || []).forEach((m: any) => {
              const matchesId = m.user_id && myIds.has(String(m.user_id));
              const matchesEmail = userEmailLower && m.user_email && String(m.user_email).toLowerCase().trim() === userEmailLower;
              if ((matchesId || matchesEmail) && m.project_id) {
                assignedProjectIds.add(String(m.project_id));
              }
            });

            mappedProjects = mappedProjects.filter(p => assignedProjectIds.has(p.id) || p.ownerId === currentUser.uid);
          } catch (_) {}
        }

        setProjects(mappedProjects);
        setActiveProjectId(prev => {
          if (prev && mappedProjects.some(p => p.id === prev)) {
            return prev;
          }
          return mappedProjects.length > 0 ? mappedProjects[0].id : null;
        });
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  }, [currentUser, getSafeCompanyId, setActiveProjectId]);

  const fetchCompanyUsers = useCallback(async () => {
    const safeCompanyId = getSafeCompanyId();
    if (!safeCompanyId) return;
    await fetchTeamUsers(safeCompanyId);
  }, [getSafeCompanyId, fetchTeamUsers]);

  const fetchProjectDetails = useCallback(async () => {
    if (!currentUser || !currentUser.uid) return;
    const safeCompanyId = getSafeCompanyId();
    if (!safeCompanyId) return;

    try {
      await Promise.all([
        fetchProjectMembers(safeCompanyId),
        fetchDefects(safeCompanyId, currentUser.uid),
        fetchTimeEntries(safeCompanyId, currentUser.uid)
      ]);
    } catch (err) {
      console.error("Error fetching project details in ProjectContext:", err);
    }
  }, [currentUser, getSafeCompanyId, fetchProjectMembers, fetchDefects, fetchTimeEntries]);

  useEffect(() => {
    if (!currentUser) {
      setProjects([]);
      setActiveProjectId(null);
      return;
    }

    fetchProjects();
    fetchCompanyUsers();
    fetchProjectDetails();

    const safeCompanyId = getSafeCompanyId();
    const companyFilter = safeCompanyId ? `company_id=eq.${safeCompanyId}` : undefined;
    const channel = supabase
      .channel(`schema-db-changes-${safeCompanyId || 'global'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects', filter: companyFilter }, () => {
        fetchProjects();
        queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'company_users', filter: companyFilter }, () => {
        fetchCompanyUsers();
        fetchProjectDetails();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: companyFilter }, () => {
        fetchCompanyUsers();
        fetchProjectDetails();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_members', filter: companyFilter }, () => {
        fetchProjectDetails();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'defects', filter: companyFilter }, () => {
        fetchProjectDetails();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'time_entries', 
        filter: companyFilter 
      }, () => {
        fetchProjectDetails();
      })
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel).catch(() => {});
      }
    };
  }, [currentUser, getSafeCompanyId, fetchProjects, fetchCompanyUsers, fetchProjectDetails]);

  const refreshAllData = useCallback(async () => {
    await Promise.all([
      fetchProjects(),
      fetchCompanyUsers(),
      fetchProjectDetails()
    ]);
  }, [fetchProjects, fetchCompanyUsers, fetchProjectDetails]);

  const addProject = async (projectData: any) => {
    if (!currentUser) return;
    const safeCompanyId = getSafeCompanyId();

    const { data: newProj, error } = await supabase
      .from('projects')
      .insert({
        name: projectData.name,
        description: projectData.description || '',
        status: projectData.status || 'planning',
        company_id: safeCompanyId,
        owner_id: currentUser.uid
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error("Error creating project:", error);
      throw error;
    }

    if (newProj) {
      const createdProj: Project = {
        id: newProj.id,
        name: newProj.name,
        description: newProj.description || '',
        status: (newProj.status as any) || 'planning',
        role: 'owner',
        createdAt: newProj.created_at || new Date().toISOString(),
        ownerId: newProj.owner_id || currentUser.uid,
        companyId: newProj.company_id || safeCompanyId
      };
      setProjects(prev => [createdProj, ...prev.filter(p => p.id !== createdProj.id)]);
      setActiveProjectId(createdProj.id);
      
      try {
        await ensureDefaultCompanyFolders(safeCompanyId, currentUser.uid);
      } catch (e) {}

      try {
        await sendNotification({
          companyId: safeCompanyId,
          title: 'Neues Projekt erstellt 🚀',
          message: `Das Projekt "${createdProj.name}" wurde erfolgreich angelegt.`,
          type: 'info',
          link: `/project/${createdProj.id}/overview`
        });
      } catch (e) {}

      await refreshAllData();
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] });
      return createdProj;
    }

    await refreshAllData();
    queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] });
  };

  const removeProject = async (id: string) => {
    const targetProj = projects.find(p => p.id === id);
    const safeCompanyId = getSafeCompanyId();
    try {
      await offboardProject(id, safeCompanyId);
    } catch (err) {
      console.error("Fehler beim Löschen des Projekts:", err);
    }
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) {
      setActiveProjectId(null);
    }

    if (safeCompanyId) {
      try {
        await sendNotification({
          companyId: safeCompanyId,
          title: 'Projekt gelöscht 🗑️',
          message: `Das Projekt "${targetProj?.name || 'Unbekannt'}" wurde gelöscht.`,
          type: 'info'
        });
      } catch (e) {}
    }

    await fetchProjects();
    queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] });
  };

  const updateProjectStatus = async (id: string, status: string) => {
    const targetProj = projects.find(p => p.id === id);
    const safeCompanyId = getSafeCompanyId();
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: status as any } : p));
    try {
      let query = supabase.from('projects').update({ status }).eq('id', id);
      if (safeCompanyId) query = query.eq('company_id', safeCompanyId);
      await query;
    } catch (err) {
      console.error("Fehler beim Aktualisieren des Projektstatus:", err);
    }

    if (safeCompanyId) {
      try {
        await sendNotification({
          companyId: safeCompanyId,
          title: 'Projekt-Status aktualisiert',
          message: `Der Status von "${targetProj?.name || 'Projekt'}" ist neu: ${status}.`,
          type: 'info'
        });
      } catch (e) {}
    }

    await fetchProjects();
    queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] });
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const targetProj = projects.find(p => p.id === id);
    const safeCompanyId = getSafeCompanyId();

    // 1. Optimistic local state update
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));

    // 2. Prepare database payload
    const dbUpdates: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    if (updates.name !== undefined) dbUpdates.name = updates.name.trim();
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if ((updates as any).siteLocation !== undefined) dbUpdates.site_location = (updates as any).siteLocation;
    if ((updates as any).site_location !== undefined) dbUpdates.site_location = (updates as any).site_location;
    if ((updates as any).droneUrl !== undefined) dbUpdates.drone_url = (updates as any).droneUrl;
    if ((updates as any).drone_url !== undefined) dbUpdates.drone_url = (updates as any).drone_url;

    try {
      let updateQuery = (supabase.from('projects') as any).update(dbUpdates).eq('id', id);
      if (safeCompanyId) updateQuery = updateQuery.eq('company_id', safeCompanyId);
      const { error } = await updateQuery;
      if (error) {
        // Fallback: If extended columns don't exist in schema cache, retry with core columns only
        if (error.code === 'PGRST204' || error.message?.includes('updated_at') || error.message?.includes('column')) {
          delete dbUpdates.updated_at;
          delete dbUpdates.site_location;
          delete dbUpdates.drone_url;
          if (Object.keys(dbUpdates).length > 0) {
            let retryQuery = (supabase.from('projects') as any).update(dbUpdates).eq('id', id);
            if (safeCompanyId) retryQuery = retryQuery.eq('company_id', safeCompanyId);
            const retry = await retryQuery;
            if (retry.error) throw retry.error;
          }
        } else {
          throw error;
        }
      }
    } catch (err) {
      console.error("Fehler beim Aktualisieren des Projekts:", err);
      throw err;
    }

    // 3. Notification if renamed
    if (safeCompanyId && updates.name && targetProj && targetProj.name !== updates.name) {
      try {
        await sendNotification({
          companyId: safeCompanyId,
          title: 'Projekt umbenannt ✏️',
          message: `Das Projekt "${targetProj.name}" wurde in "${updates.name}" umbenannt.`,
          type: 'info',
          link: `/project/${id}/overview`
        });
      } catch (e) {}
    }

    await fetchProjects();
    queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] });
  };

  const renameProject = async (id: string, newName: string) => {
    if (!newName || !newName.trim()) return;
    await updateProject(id, { name: newName.trim() });
  };

  const addCompanyUser = async (userData: any) => {
    const safeCompanyId = getSafeCompanyId();
    await addTeamUser(safeCompanyId, userData);
  };

  const updateCompanyUser = async (id: string, userData: any) => {
    const safeCompanyId = getSafeCompanyId();
    await updateTeamUser(safeCompanyId, id, userData);
  };

  const removeCompanyUser = async (id: string) => {
    const safeCompanyId = getSafeCompanyId();
    await removeTeamUser(id, safeCompanyId);
  };

  const addProjectMember = async (projectId: string, memberData: any) => {
    const safeCompanyId = getSafeCompanyId();
    await addTeamMember(projectId, memberData, safeCompanyId);
  };

  const updateProjectMemberRole = async (projectId: string, userId: string, newRole: string) => {
    const safeCompanyId = getSafeCompanyId();
    await updateTeamMemberRole(projectId, userId, newRole, safeCompanyId);
  };

  const removeProjectMember = async (projectId: string, userId: string) => {
    const safeCompanyId = getSafeCompanyId();
    await removeTeamMember(projectId, userId, safeCompanyId);
  };

  const addTimeEntry = async (entryData: any) => {
    if (!currentUser?.uid) return;
    const safeCompanyId = getSafeCompanyId();
    await addTimeEntryInternal(entryData, safeCompanyId, currentUser.uid);
  };

  const contextValue = useMemo(() => ({
    projects, activeProjectId, companyUsers, projectMembers, timeEntries, defects,
    setActiveProject: setActiveProjectId, addProject, removeProject, updateProject, renameProject, updateProjectStatus,
    fetchCompanyUsers, fetchProjects, fetchProjectDetails, refreshAllData,
    addCompanyUser, updateCompanyUser, removeCompanyUser, addProjectMember, updateProjectMemberRole, removeProjectMember,
    addTimeEntry,
    isDemoMode: false,
    demoData: demoTemplates.construction
  }), [
    projects, activeProjectId, companyUsers, projectMembers, timeEntries, defects,
    fetchCompanyUsers, fetchProjects, fetchProjectDetails, refreshAllData
  ]);

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}

export const useProjects = useProject;