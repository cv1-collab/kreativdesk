/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { offboardProject } from '../services/projectService';
import { demoTemplates } from '../utils/demoTemplates';
import { seedDemoProjectToSupabase, ensureDefaultCompanyFolders } from '../services/seedService';

export interface Project { id: string; name: string; description: string; status: 'active' | 'planning' | 'completed'; role: 'owner' | 'admin' | 'viewer'; createdAt: string; ownerId: string; companyId: string; memberIds?: string[]; }
export interface CompanyUser { id: string; name: string; email: string; role: 'Admin' | 'Internal' | 'External Planner' | 'Client'; department?: string; hourlyRate?: number; avatar?: string; ownerId: string; companyId: string; }
export interface TimeEntry { id: string; userId: string; projectId: string; date: string; hours: number; description: string; hourlyRate?: number; ownerId: string; companyId: string; }
export interface Defect { id: string; title: string; status: string; priority: string; assignee: string; date: string; trade: string; location: string; description: string; imageUrl?: string; ownerId: string; companyId: string; projectId: string; dueDate?: string; }

interface ProjectContextType {
  projects: Project[]; activeProjectId: string | null; companyUsers: CompanyUser[]; projectMembers: any[]; timeEntries: TimeEntry[]; defects: Defect[];
  setActiveProject: (id: string | null) => void; addProject: (project: any) => Promise<void>; removeProject: (id: string) => Promise<void>;
  addCompanyUser: (user: any) => Promise<void>; updateCompanyUser: (id: string, user: any) => Promise<void>; removeCompanyUser: (id: string) => Promise<void>;
  addProjectMember: (projectId: string, memberData: any) => Promise<void>; removeProjectMember: (projectId: string, userId: string) => Promise<void>;
  addTimeEntry: (entry: any) => Promise<void>; isDemoMode: boolean; demoData: any;
}

export const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);

  const fetchProjects = useCallback(async () => {
    if (!currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;

    try {
      await ensureDefaultCompanyFolders(safeCompanyId, currentUser.uid);

      let { data: projs } = await supabase
        .from('projects')
        .select('*')
        .eq('company_id', safeCompanyId)
        .order('created_at', { ascending: false });

      // If company has 0 projects, seed default demo project automatically
      if (!projs || projs.length === 0) {
        await seedDemoProjectToSupabase(safeCompanyId, currentUser.uid, 'construction');
        const { data: seededProjs } = await supabase
          .from('projects')
          .select('*')
          .eq('company_id', safeCompanyId)
          .order('created_at', { ascending: false });
        projs = seededProjs || [];
      }

      if (projs) {
        const mappedProjects: Project[] = projs.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          status: p.status || 'planning',
          role: 'owner',
          createdAt: p.created_at || new Date().toISOString(),
          ownerId: p.owner_id || currentUser.uid,
          companyId: p.company_id
        }));
        setProjects(mappedProjects);
        if (mappedProjects.length > 0 && !activeProjectId) {
          setActiveProjectId(mappedProjects[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  }, [currentUser?.companyId, activeProjectId, currentUser?.uid]);

  const fetchCompanyUsers = useCallback(async () => {
    if (!currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;

    try {
      const { data: profs } = await supabase
        .from('profiles')
        .select('*')
        .eq('company_id', safeCompanyId);

      if (profs) {
        const users: CompanyUser[] = profs.map(p => ({
          id: p.id,
          name: p.name || p.email,
          email: p.email,
          role: p.role === 'owner' ? 'Admin' : 'Internal',
          avatar: p.photo_url || '',
          ownerId: p.id,
          companyId: p.company_id || safeCompanyId
        }));
        setCompanyUsers(users);
      }
    } catch (err) {
      console.error("Error fetching company users:", err);
    }
  }, [currentUser]);

  const fetchProjectDetails = useCallback(async () => {
    if (!currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;

    try {
      const { data: mems } = await supabase
        .from('project_members')
        .select('*')
        .eq('company_id', safeCompanyId);

      if (mems) {
        setProjectMembers(mems.map(m => ({
          id: m.id,
          projectId: m.project_id,
          userId: m.user_id,
          companyId: m.company_id
        })));
      }

      const { data: defs } = await supabase
        .from('defects')
        .select('*')
        .eq('company_id', safeCompanyId);

      if (defs) {
        setDefects(defs.map(d => ({
          id: d.id,
          title: d.title,
          status: d.status,
          priority: d.priority || 'Medium',
          assignee: d.assignee || '',
          date: d.created_at || new Date().toISOString(),
          trade: d.trade || '',
          location: d.location || '',
          description: d.description || '',
          imageUrl: d.image_url,
          ownerId: d.owner_id || currentUser.uid,
          companyId: d.company_id,
          projectId: d.project_id
        })));
      }
    } catch (err) {
      console.error("Error fetching project details:", err);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.companyId) return;

    fetchProjects();
    fetchCompanyUsers();
    fetchProjectDetails();

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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.companyId, fetchProjects, fetchCompanyUsers, fetchProjectDetails]);

  const addProject = async (projectData: any) => {
    if (!currentUser?.companyId) return;

    const { data: newProj, error } = await supabase
      .from('projects')
      .insert({
        name: projectData.name,
        description: projectData.description || '',
        status: projectData.status || 'planning',
        company_id: currentUser.companyId,
        owner_id: currentUser.uid
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating project:", error);
      throw error;
    }

    await fetchProjects();
    if (newProj) {
      setActiveProjectId(newProj.id);
    }
  };

  const removeProject = async (id: string) => {
    try {
      const safeCompanyId = currentUser?.companyId || (currentUser?.uid ? `comp_${currentUser.uid}` : '');
      await offboardProject(id, safeCompanyId);
    } catch (err) {
      console.error("Fehler beim Löschen des Projekts:", err);
    }
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) {
      setActiveProjectId(null);
    }
    await fetchProjects();
  };

  const addCompanyUser = async (userData: any) => {
    fetchCompanyUsers();
  };

  const updateCompanyUser = async (id: string, userData: any) => {
    fetchCompanyUsers();
  };

  const removeCompanyUser = async (id: string) => {
    fetchCompanyUsers();
  };

  const addProjectMember = async (projectId: string, memberData: any) => {
    if (!currentUser?.companyId) return;
    await supabase.from('project_members').insert({
      project_id: projectId,
      user_id: memberData.userId,
      company_id: currentUser.companyId
    });
    fetchProjectDetails();
  };

  const removeProjectMember = async (projectId: string, userId: string) => {
    if (!currentUser?.companyId) return;
    await supabase.from('project_members').delete().eq('project_id', projectId).eq('user_id', userId);
    fetchProjectDetails();
  };

  const addTimeEntry = async (entryData: any) => {
    // Time entry
  };

  return (
    <ProjectContext.Provider value={{ 
      projects, activeProjectId, companyUsers, projectMembers, timeEntries, defects, 
      setActiveProject: setActiveProjectId, addProject, removeProject, addCompanyUser, 
      updateCompanyUser, removeCompanyUser, addProjectMember, removeProjectMember, 
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