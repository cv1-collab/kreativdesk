/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { offboardProject } from '../services/projectService';
import { demoTemplates } from '../utils/demoTemplates';
import { ensureDefaultCompanyFolders } from '../services/seedService';
import { sendNotification } from '../lib/notifications';
import { useProjectDefects, Defect } from '../hooks/useProjectDefects';
import { useProjectTeam, CompanyUser, ProjectMember } from '../hooks/useProjectTeam';
import { useProjectTimeEntries, TimeEntry } from '../hooks/useProjectTimeEntries';

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
  updateProjectStatus: (id: string, status: string) => Promise<void>;
  fetchCompanyUsers: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchProjectDetails: () => Promise<void>;
  refreshAllData: () => Promise<void>;
  addCompanyUser: (user: any) => Promise<void>;
  updateCompanyUser: (id: string, user: any) => Promise<void>;
  removeCompanyUser: (id: string) => Promise<void>;
  addProjectMember: (projectId: string, memberData: any) => Promise<void>;
  removeProjectMember: (projectId: string, userId: string) => Promise<void>;
  addTimeEntry: (entry: any) => Promise<void>;
  isDemoMode: boolean;
  demoData: any;
}

export const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

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
    removeProjectMember: removeTeamMember
  } = useProjectTeam();
  const { timeEntries, fetchTimeEntries, addTimeEntry: addTimeEntryInternal } = useProjectTimeEntries();

  const getSafeCompanyId = useCallback(() => {
    if (!currentUser) return '';
    const previewCompanyId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('admin_preview_company_id') : null;
    return previewCompanyId || currentUser.companyId || currentUser.uid || '';
  }, [currentUser]);

  const fetchProjects = useCallback(async () => {
    if (!currentUser || !currentUser.uid) return;
    const safeCompanyId = getSafeCompanyId();

    try {
      await ensureDefaultCompanyFolders(safeCompanyId, currentUser.uid);

      const { data } = await supabase
        .from('projects')
        .select('*')
        .or(`company_id.eq.${safeCompanyId},owner_id.eq.${currentUser.uid}`)
        .order('created_at', { ascending: false });

      if (data) {
        const mappedProjects: Project[] = data.map((p: any) => ({
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
        setProjects(mappedProjects);
        setActiveProjectId(prev => prev || (mappedProjects.length > 0 ? mappedProjects[0].id : null));
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  }, [currentUser, getSafeCompanyId]);

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
    if (!currentUser) return;

    fetchProjects();
    fetchCompanyUsers();
    fetchProjectDetails();

    const safeCompanyId = currentUser.companyId || currentUser.uid;
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchProjects();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_members' }, () => {
        fetchProjectDetails();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'defects' }, () => {
        fetchProjectDetails();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'time_entries', filter: `company_id=eq.${safeCompanyId}` }, () => {
        fetchProjectDetails();
      })
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel).catch(() => {});
      }
    };
  }, [currentUser, fetchProjects, fetchCompanyUsers, fetchProjectDetails]);

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
      .single();

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
      return createdProj;
    }

    await refreshAllData();
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
  };

  const updateProjectStatus = async (id: string, status: string) => {
    const targetProj = projects.find(p => p.id === id);
    const safeCompanyId = getSafeCompanyId();
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: status as any } : p));
    try {
      await supabase.from('projects').update({ status }).eq('id', id);
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
  };

  const addCompanyUser = async (_userData: any) => {
    const safeCompanyId = getSafeCompanyId();
    await addTeamUser(safeCompanyId);
  };

  const updateCompanyUser = async (_id: string, _userData: any) => {
    const safeCompanyId = getSafeCompanyId();
    await updateTeamUser(safeCompanyId);
  };

  const removeCompanyUser = async (id: string) => {
    const safeCompanyId = getSafeCompanyId();
    await removeTeamUser(id, safeCompanyId);
  };

  const addProjectMember = async (projectId: string, memberData: any) => {
    const safeCompanyId = getSafeCompanyId();
    await addTeamMember(projectId, memberData, safeCompanyId);
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

  return (
    <ProjectContext.Provider value={{ 
      projects, activeProjectId, companyUsers, projectMembers, timeEntries, defects, 
      setActiveProject: setActiveProjectId, addProject, removeProject, updateProjectStatus, 
      fetchCompanyUsers, fetchProjects, fetchProjectDetails, refreshAllData,
      addCompanyUser, updateCompanyUser, removeCompanyUser, addProjectMember, removeProjectMember, 
      addTimeEntry,
      isDemoMode: false,
      demoData: demoTemplates.construction
    }}>
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