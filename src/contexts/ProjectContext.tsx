/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { offboardProject } from '../services/projectService';
import { demoTemplates } from '../utils/demoTemplates';
import { ensureDefaultCompanyFolders } from '../services/seedService';

export interface Project { id: string; name: string; description: string; status: 'active' | 'planning' | 'completed'; role: 'owner' | 'admin' | 'viewer'; createdAt: string; ownerId: string; companyId: string; memberIds?: string[]; }
export interface CompanyUser { id: string; name: string; email: string; role: 'Admin' | 'Internal' | 'External Planner' | 'Client'; department?: string; hourlyRate?: number; avatar?: string; ownerId: string; companyId: string; }
export interface TimeEntry { id: string; userId: string; projectId: string; date: string; hours: number; description: string; hourlyRate?: number; ownerId: string; companyId: string; }
export interface Defect { id: string; title: string; status: string; priority: string; assignee: string; date: string; trade: string; location: string; description: string; imageUrl?: string; ownerId: string; companyId: string; projectId: string; dueDate?: string; }

interface ProjectContextType {
  projects: Project[]; activeProjectId: string | null; companyUsers: CompanyUser[]; projectMembers: any[]; timeEntries: TimeEntry[]; defects: Defect[];
  setActiveProject: (id: string | null) => void; addProject: (project: any) => Promise<any>; removeProject: (id: string) => Promise<void>;
  updateProjectStatus: (id: string, status: string) => Promise<void>;
  fetchCompanyUsers: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchProjectDetails: () => Promise<void>;
  refreshAllData: () => Promise<void>;
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
    const previewCompanyId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('admin_preview_company_id') : null;
    const safeCompanyId = previewCompanyId || currentUser.companyId || currentUser.uid;

    try {
      await ensureDefaultCompanyFolders(safeCompanyId, currentUser.uid);

      let { data: projs } = await supabase
        .from('projects')
        .select('*')
        .or(`company_id.eq.${safeCompanyId},owner_id.eq.${currentUser.uid}`)
        .order('created_at', { ascending: false });

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
        setActiveProjectId(prev => prev || (mappedProjects.length > 0 ? mappedProjects[0].id : null));
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  }, [currentUser?.companyId, currentUser?.uid]);

  const fetchCompanyUsers = useCallback(async () => {
    if (!currentUser || !currentUser.uid) return;
    const previewCompanyId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('admin_preview_company_id') : null;
    const safeCompanyId = previewCompanyId || currentUser.companyId || currentUser.uid;

    try {
      const { data: profs } = await supabase
        .from('profiles')
        .select('*')
        .eq('company_id', safeCompanyId);

      const { data: crmData } = await supabase
        .from('company_users')
        .select('*')
        .eq('company_id', safeCompanyId);

      const mappedProfiles: CompanyUser[] = (profs || []).map(p => ({
        id: p.id,
        name: p.name || p.email,
        email: p.email,
        role: p.role === 'owner' ? 'Admin' : 'Internal',
        avatar: p.photo_url || '',
        ownerId: p.id,
        companyId: p.company_id || safeCompanyId
      }));

      const mappedCrm: CompanyUser[] = (crmData || []).map(u => ({
        id: u.id,
        name: u.name || [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email || 'Kontakt',
        email: u.email || '',
        role: u.role || 'Partner',
        avatar: '',
        ownerId: u.id,
        companyId: safeCompanyId
      }));

      const userMap = new Map<string, CompanyUser>();
      mappedProfiles.forEach(p => { if (p.id || p.email) userMap.set(p.id || p.email, p); });
      mappedCrm.forEach(c => { if (c.id || c.email) userMap.set(c.id || c.email, c); });

      const combinedUsers = Array.from(userMap.values());
      setCompanyUsers(combinedUsers);
    } catch (err) {
      console.error("Error fetching company users:", err);
    }
  }, [currentUser]);

  const fetchProjectDetails = useCallback(async () => {
    if (!currentUser || !currentUser.uid) return;
    const previewCompanyId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('admin_preview_company_id') : null;
    const safeCompanyId = previewCompanyId || currentUser.companyId || currentUser.uid;

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
        setDefects(defs.map(d => {
          const rawStatus = d.status || 'To Do';
          const lowerSt = rawStatus.toLowerCase().trim();
          const normStatus = (lowerSt === 'offen' || lowerSt === 'to do') ? 'To Do' :
                             (lowerSt === 'in arbeit' || lowerSt === 'in progress') ? 'In Progress' :
                             (lowerSt === 'in prüfung' || lowerSt === 'in review') ? 'In Review' :
                             (lowerSt === 'erledigt' || lowerSt === 'behoben' || lowerSt === 'done') ? 'Done' : rawStatus;

          const rawSev = d.severity || d.priority || 'Medium';
          const lowerSev = rawSev.toLowerCase().trim();
          const normSev = (lowerSev === 'kritisch' || lowerSev === 'critical') ? 'Critical' :
                          (lowerSev === 'hoch' || lowerSev === 'high') ? 'High' :
                          (lowerSev === 'mittel' || lowerSev === 'medium') ? 'Medium' :
                          (lowerSev === 'leicht' || lowerSev === 'low') ? 'Low' : rawSev;

          return {
            id: d.id,
            title: d.title || d.prompt || 'Mangel',
            status: normStatus,
            priority: normSev,
            assignee: d.assignee || '',
            date: d.created_at || new Date().toISOString(),
            trade: d.trade || '',
            location: d.location || '',
            description: d.description || '',
            imageUrl: d.image_url,
            ownerId: d.owner_id || currentUser.uid,
            companyId: d.company_id,
            projectId: d.project_id || d.projectId
          };
        }));
      }

      // Multi-tier TimeEntries Fetching
      const localCacheKey = `time_entries_cache_${safeCompanyId}`;
      const localCached = localStorage.getItem(localCacheKey);
      const localTimes = localCached ? JSON.parse(localCached) : [];

      const { data: times } = await supabase
        .from('time_entries')
        .select('*')
        .eq('company_id', safeCompanyId);

      let configTime: any = null;
      try {
        const { data } = await supabase
          .from('system_config')
          .select('*')
          .eq('id', `time_entries_${safeCompanyId}`)
          .maybeSingle();
        configTime = data;
      } catch (e) {}

      const configTimes = (configTime as any)?.data?.entries || configTime?.entries || [];
      const timeMap = new Map();
      [...localTimes, ...configTimes, ...(times || [])].forEach((t: any) => {
        if (t && (t.id || t.description || t.hours)) {
          const tId = t.id || `time-${t.date}-${t.hours}`;
          timeMap.set(tId, {
            id: tId,
            userId: t.userId || t.user_id || currentUser.uid,
            projectId: t.projectId || t.project_id || 'global',
            date: t.date || new Date().toISOString().split('T')[0],
            hours: Number(t.hours || 0),
            description: t.description || 'Zeiterfassung',
            hourlyRate: Number(t.hourlyRate || t.hourly_rate || 120),
            isBillable: t.isBillable !== undefined ? t.isBillable : (t.is_billable !== undefined ? t.is_billable : true),
            ownerId: t.ownerId || t.owner_id || currentUser.uid,
            companyId: t.companyId || t.company_id || safeCompanyId
          });
        }
      });
      const mergedTimes = Array.from(timeMap.values());
      setTimeEntries(mergedTimes as TimeEntry[]);
      localStorage.setItem(localCacheKey, JSON.stringify(mergedTimes));

    } catch (err) {
      console.error("Error fetching project details:", err);
    }
  }, [currentUser]);

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
    const safeCompanyId = currentUser.companyId || currentUser.uid;

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

      await refreshAllData();
      return createdProj;
    }

    await refreshAllData();
  };

  const removeProject = async (id: string) => {
    try {
      const safeCompanyId = currentUser?.companyId || (currentUser?.uid ? currentUser.uid : '');
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

  const updateProjectStatus = async (id: string, status: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: status as any } : p));
    try {
      await supabase.from('projects').update({ status }).eq('id', id);
    } catch (err) {
      console.error("Fehler beim Aktualisieren des Projektstatus:", err);
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
    if (!currentUser) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;
    try {
      await supabase.from('company_users').delete().eq('id', id);
      await supabase.from('profiles').delete().eq('id', id).eq('company_id', safeCompanyId);
    } catch (e) {
      console.error("Fehler beim Löschen des Benutzers:", e);
    }
    await fetchCompanyUsers();
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
    if (!currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;

    const tId = entryData.id || `time-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newEntry: TimeEntry = {
      id: tId,
      userId: entryData.userId || entryData.user_id || currentUser.uid,
      projectId: entryData.projectId || entryData.project_id || 'global',
      date: entryData.date || new Date().toISOString().split('T')[0],
      hours: Number(entryData.hours || 0),
      description: entryData.description || 'Zeiterfassung',
      hourlyRate: Number(entryData.hourlyRate || entryData.hourly_rate || 120),
      ownerId: currentUser.uid,
      companyId: safeCompanyId
    };

    setTimeEntries(prev => {
      const updated = [newEntry, ...prev];
      localStorage.setItem(`time_entries_cache_${safeCompanyId}`, JSON.stringify(updated));
      return updated;
    });

    try {
      const { data: existingConfig } = await supabase.from('system_config').select('data').eq('id', `time_entries_${safeCompanyId}`).maybeSingle();
      const existingEntries = existingConfig?.data?.entries || [];
      await supabase.from('system_config').upsert({
        id: `time_entries_${safeCompanyId}`,
        data: { entries: [newEntry, ...existingEntries], companyId: safeCompanyId }
      });
    } catch (err) {
      console.warn("ProjectContext addTimeEntry backup warning:", err);
    }

    try {
      await supabase.from('time_entries').insert({
        id: newEntry.id,
        user_id: newEntry.userId,
        project_id: newEntry.projectId,
        date: newEntry.date,
        hours: newEntry.hours,
        description: newEntry.description,
        hourly_rate: newEntry.hourlyRate,
        is_billable: entryData.isBillable !== undefined ? entryData.isBillable : true,
        company_id: safeCompanyId,
        owner_id: currentUser.uid,
        created_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn("ProjectContext addTimeEntry insert warning:", err);
    }
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