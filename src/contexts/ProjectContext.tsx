import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, query, where, arrayUnion, arrayRemove } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/errorHandlers';
import { offboardProject } from '../services/projectService';

export interface Project {
  id: string; name: string; description: string;
  status: 'active' | 'planning' | 'completed';
  role: 'owner' | 'admin' | 'viewer';
  createdAt: string; ownerId: string; companyId: string;
  memberIds?: string[];
}

export interface CompanyUser {
  id: string; name: string; email: string;
  role: 'Admin' | 'Internal' | 'External Planner' | 'Client';
  department?: string; hourlyRate?: number; avatar?: string;
  ownerId: string; companyId: string;
}

export interface TimeEntry {
  id: string; userId: string; projectId: string;
  date: string; hours: number; description: string;
  hourlyRate?: number; ownerId: string; companyId: string;
}

export interface Defect {
  id: string; title: string; status: string; priority: string;
  assignee: string; date: string; trade: string; location: string; description: string;
  imageUrl?: string; ownerId: string; companyId: string; projectId: string;
}

// 🔥 PITCH DECK TEAM FALLBACK (Zeigt sich nur, solange das echte Team leer ist)
const MOCK_PITCH_TEAM: CompanyUser[] = [
  { id: 'mock-u1', name: 'Sarah Meier', email: 'sarah@kreativ-desk.ch', role: 'Internal', department: 'Lead Architect', ownerId: 'system', companyId: 'system', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
  { id: 'mock-u2', name: 'Michael Chen', email: 'michael@engineering.com', role: 'External Planner', department: 'Statik & Tragwerk', ownerId: 'system', companyId: 'system', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150' },
  { id: 'mock-u3', name: 'Elena Rossi', email: 'elena@client.com', role: 'Client', department: 'Bauherrenvertretung', ownerId: 'system', companyId: 'system', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150' },
  { id: 'mock-u4', name: 'David Weber', email: 'david@kreativ-desk.ch', role: 'Internal', department: 'Bauleitung', ownerId: 'system', companyId: 'system', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150' }
];

export const ProjectContext = createContext<any | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);

  useEffect(() => {
    if (!db || !currentUser || !currentUser.uid) return;

    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    const baseQuery = (coll: string) => query(collection(db, coll), where('companyId', '==', safeCompanyId));

    const unsubProjects = onSnapshot(baseQuery('projects'), snap => setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() } as Project))));
    const unsubUsers = onSnapshot(baseQuery('companyUsers'), snap => setCompanyUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as CompanyUser))));
    const unsubMembers = onSnapshot(baseQuery('projectMembers'), snap => setProjectMembers(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubTimes = onSnapshot(baseQuery('timeEntries'), snap => setTimeEntries(snap.docs.map(d => ({ id: d.id, ...d.data() } as TimeEntry))));
    const unsubDefects = onSnapshot(baseQuery('defects'), snap => setDefects(snap.docs.map(d => ({ id: d.id, ...d.data() } as Defect))));

    return () => { unsubProjects(); unsubUsers(); unsubMembers(); unsubTimes(); unsubDefects(); };
  }, [currentUser]);

  const addProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'ownerId' | 'companyId'>) => {
    if (!db || !currentUser?.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    const id = `proj-${Date.now()}`;
    const newProject: Project = { ...projectData, id, createdAt: new Date().toISOString(), ownerId: currentUser.uid, companyId: safeCompanyId, memberIds: [] };
    try { await setDoc(doc(db, 'projects', id), newProject); } 
    catch (err) { handleFirestoreError(err, OperationType.CREATE, 'projects'); }
  };

  const removeProject = async (id: string) => {
    if (!db || !currentUser?.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    try {
      await offboardProject(id, safeCompanyId);
      if (activeProjectId === id) setActiveProjectId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'projects/' + id);
    }
  };

  const addCompanyUser = async (userData: Omit<CompanyUser, 'id' | 'ownerId' | 'companyId'>) => {
    if (!db || !currentUser?.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    const id = `user-${Date.now()}`;
    const newUser: CompanyUser = { ...userData, id, ownerId: currentUser.uid, companyId: safeCompanyId };
    try { await setDoc(doc(db, 'companyUsers', id), newUser); } 
    catch (err) { handleFirestoreError(err, OperationType.CREATE, 'companyUsers'); }
  };

  const updateCompanyUser = async (id: string, updates: Partial<CompanyUser>) => {
    if (!db) return;
    try { await updateDoc(doc(db, 'companyUsers', id), updates); } 
    catch (err) { handleFirestoreError(err, OperationType.UPDATE, 'companyUsers/' + id); }
  };

  const removeCompanyUser = async (id: string) => {
    if (!db) return;
    try { await deleteDoc(doc(db, 'companyUsers', id)); } 
    catch (err) { handleFirestoreError(err, OperationType.DELETE, 'companyUsers/' + id); }
  };

  const addTimeEntry = async (entryData: Omit<TimeEntry, 'id' | 'ownerId' | 'companyId'>) => {
    if (!db || !currentUser?.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    const id = `time-${Date.now()}`;
    const newEntry: TimeEntry = { ...entryData, id, ownerId: currentUser.uid, companyId: safeCompanyId };
    try { await setDoc(doc(db, 'timeEntries', id), newEntry); } 
    catch (err) { handleFirestoreError(err, OperationType.CREATE, 'timeEntries'); }
  };

  const addProjectMember = async (projectId: string, memberData: any) => {
    if (!db || !currentUser?.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    const id = `pm-${Date.now()}`;
    const newMember = { id, projectId, userId: memberData.userId, companyId: safeCompanyId, role: memberData.companyRole || 'External Partner', joinedAt: new Date().toISOString() };
    try {
      await setDoc(doc(db, 'projectMembers', id), newMember);
      await updateDoc(doc(db, 'projects', projectId), { memberIds: arrayUnion(memberData.userId) });
    } catch (err) { handleFirestoreError(err, OperationType.CREATE, 'projectMembers/' + id); }
  };

  const removeProjectMember = async (projectId: string, userId: string) => {
    if (!db) return;
    const member = projectMembers.find((m: any) => m.projectId === projectId && m.userId === userId);
    if (member) {
      try {
        await deleteDoc(doc(db, 'projectMembers', member.id));
        await updateDoc(doc(db, 'projects', projectId), { memberIds: arrayRemove(userId) });
      } catch (err) { handleFirestoreError(err, OperationType.DELETE, 'projectMembers/' + member.id); }
    }
  };

  // 🔥 DIE PLATZHALTER-WEICHE FÜR LEERE PROJEKTE (KORRIGIERT!)
  // Wenn in der Firma nur der Admin ist (<= 1), zeige das globale Team
  const displayCompanyUsers = companyUsers.length <= 1 ? [...companyUsers, ...MOCK_PITCH_TEAM] : companyUsers;
  
  // Prüfe, wie viele Mitglieder dieses EINE spezifische Projekt hat
  const currentProjectMembers = projectMembers.filter(m => m.projectId === activeProjectId);
  
  // 🔥 LÖSUNG: Wenn das Projekt nur 1 Mitglied hat (dich als Ersteller), füge das Mock-Team hinzu!
  const displayProjectMembers = currentProjectMembers.length <= 1 && activeProjectId 
    ? [
        ...projectMembers,
        ...MOCK_PITCH_TEAM.map(u => ({
          id: `pm-mock-${u.id}`,
          projectId: activeProjectId,
          userId: u.id,
          companyId: 'system',
          role: u.department,
          joinedAt: new Date().toISOString()
        }))
      ]
    : projectMembers;

  // Hänge die IDs der Mock-User in das aktive Projekt, falls <= 1 User drin ist
  const displayProjects = projects.map(p => {
    const pMembers = projectMembers.filter(m => m.projectId === p.id);
    if (pMembers.length <= 1 && p.id === activeProjectId) {
      return { 
        ...p, 
        memberIds: [...(p.memberIds || []), ...MOCK_PITCH_TEAM.map(u => u.id)] 
      };
    }
    return p;
  });

  return (
    <ProjectContext.Provider value={{ 
      projects: displayProjects, 
      activeProjectId, 
      companyUsers: displayCompanyUsers, 
      projectMembers: displayProjectMembers, 
      timeEntries, defects,
      setActiveProject: setActiveProjectId, addProject, removeProject, addCompanyUser, updateCompanyUser,
      removeCompanyUser, addProjectMember, removeProjectMember, addTimeEntry,
      
      isDemoMode: false,
      demoData: null
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