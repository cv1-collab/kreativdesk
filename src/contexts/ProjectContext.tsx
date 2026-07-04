/* eslint-disable react-refresh/only-export-components */
import { checkIsSuperAdmin } from '../config/admins';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc, query, where, arrayUnion, arrayRemove, getDocs } from 'firebase/firestore';
import { handleFirestoreError } from '../utils/errorHandlers';
import { offboardProject } from '../services/projectService';
import { demoTemplates } from '../utils/demoTemplates';

// Interfaces für TypeScript-Stabilität
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
  const isAdmin = checkIsSuperAdmin(currentUser?.email) || currentUser?.uid === '7VnJ8RSZVAXG9pcPIEklPaWl0fG3';
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);

  const getQuery = (colName: string) => {
    if (!currentUser?.companyId) return query(collection(db, colName), where('companyId', '==', 'loading-state'));
    return query(collection(db, colName), where('companyId', '==', currentUser.companyId));
  };

  useEffect(() => {
    if (!currentUser?.companyId) return;

    const unsubs: any[] = [];

    unsubs.push(onSnapshot(getQuery('projects'), snap => {
      const projs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Project)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setProjects(projs);
      if (projs.length > 0 && !activeProjectId) setActiveProjectId(projs[0].id);
    }, (err) => console.error("Firestore-Fehler (projects):", err)));

    unsubs.push(onSnapshot(getQuery('companyUsers'), snap => {
      setCompanyUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as CompanyUser)));
    }));

    unsubs.push(onSnapshot(getQuery('projectMembers'), snap => {
      setProjectMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }));

    unsubs.push(onSnapshot(getQuery('timeEntries'), snap => {
      setTimeEntries(snap.docs.map(d => ({ id: d.id, ...d.data() } as TimeEntry)));
    }));

    unsubs.push(onSnapshot(getQuery('defects'), snap => {
      setDefects(snap.docs.map(d => ({ id: d.id, ...d.data() } as Defect)));
    }));

    return () => unsubs.forEach(unsub => unsub());
  }, [currentUser?.companyId]);

  const addProject = async (projectData: any) => {
    if (!currentUser?.companyId) return;
    await addDoc(collection(db, 'projects'), { ...projectData, createdAt: new Date().toISOString(), ownerId: currentUser?.uid, companyId: currentUser?.companyId, memberIds: [currentUser?.uid] });
  };

  const removeProject = async (id: string) => {
    if (!currentUser?.companyId) return;
    await offboardProject(id, currentUser.companyId);
  };

  const addCompanyUser = async (userData: any) => {
    if (!currentUser?.companyId) return;
    await addDoc(collection(db, 'companyUsers'), { ...userData, ownerId: currentUser?.uid, companyId: currentUser?.companyId, createdAt: new Date().toISOString() });
  };

  const updateCompanyUser = async (id: string, userData: any) => {
    if (!currentUser?.companyId) return;
    await updateDoc(doc(db, 'companyUsers', id), { ...userData });
  };

  const removeCompanyUser = async (id: string) => {
    if (!currentUser?.companyId) return;
    await deleteDoc(doc(db, 'companyUsers', id));
  };

  const addProjectMember = async (projectId: string, memberData: any) => {
    if (!currentUser?.companyId) return;
    await addDoc(collection(db, 'projectMembers'), { projectId, ...memberData, companyId: currentUser.companyId, joinedAt: new Date().toISOString() });
    await updateDoc(doc(db, 'projects', projectId), { memberIds: arrayUnion(memberData.userId) });
  };

  const removeProjectMember = async (projectId: string, userId: string) => {
    if (!currentUser?.companyId) return;
    const q = query(collection(db, 'projectMembers'), where('projectId', '==', projectId), where('userId', '==', userId));
    const snap = await getDocs(q);
    snap.forEach(d => deleteDoc(d.ref));
    await updateDoc(doc(db, 'projects', projectId), { memberIds: arrayRemove(userId) });
  };

  const addTimeEntry = async (entryData: any) => {
    if (!currentUser?.companyId) return;
    await addDoc(collection(db, 'timeEntries'), { ...entryData, ownerId: currentUser?.uid, companyId: currentUser?.companyId, createdAt: new Date().toISOString() });
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