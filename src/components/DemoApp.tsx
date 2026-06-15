import React, { Suspense, lazy, useContext } from 'react';
import { ProjectContext } from '../contexts/ProjectContext';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils';

// 🔥 WICHTIG: Pfad-Ebene korrigiert (../ anstatt ./)
import { demoTemplates } from '../utils/demoTemplates';

// === LAZY IMPORTS ===
const Dashboard = lazy(() => import('./Dashboard'));
const ProjectTeam = lazy(() => import('./ProjectTeam'));
const CalendarComponent = lazy(() => import('./Calendar'));
const Finance = lazy(() => import('./Finance'));
const BIMViewer = lazy(() => import('./BIMViewer'));
const MeetChat = lazy(() => import('./MeetChat'));
const CRM = lazy(() => import('./CRM'));
const Documents = lazy(() => import('./Documents'));
const SiteMonitoring = lazy(() => import('./SiteMonitoring'));
const Whiteboard = lazy(() => import('./Whiteboard'));
const PitchDeck = lazy(() => import('./PitchDeck'));
const Defects = lazy(() => import('./Defects'));
const API = lazy(() => import('./API'));
const PlanEditorViewer = lazy(() => import('./PlanEditorViewer'));

// 🔥 Statischer Provider für maximalen Speed beim Launch
export const LiveDemoProjectProvider = ({ children }: { children: React.ReactNode }) => {
  // Wir ziehen uns nur das perfekte Architektur-Projekt für den Launch
  const template = demoTemplates.construction;

  const activeProject = {
    id: 'demo-1',
    companyId: 'demo-company',
    // 🔥 FIX: Wir mappen die Emails der Team-Mitglieder direkt in das Projekt-Array
    memberIds: template.members.map((m: any) => m.email || m.id), 
    ...template.project
  };

  const mockCompanyUsers = template.members.map((m: any) => ({
     id: m.email || m.id, 
     name: m.name, 
     email: m.email, 
     role: m.role.includes('Intern') ? 'Internal' : 'External Planner',
     department: m.role, 
     avatar: m.photoURL || m.avatar, 
     ownerId: 'demo', 
     companyId: 'demo-company'
  }));

  const mockProjectMembers = template.members.map((m: any) => ({
     id: `pm-${m.email || m.id}`, 
     projectId: 'demo-1', 
     userId: m.email || m.id, 
     companyId: 'demo-company', 
     role: m.role, 
     joinedAt: new Date().toISOString()
  }));

  return (
    <ProjectContext.Provider value={{
      projects: [activeProject],
      activeProjectId: 'demo-1',
      companyUsers: mockCompanyUsers,
      projectMembers: mockProjectMembers,
      timeEntries: [],
      defects: [],
      setActiveProject: () => {}, addProject: async () => {}, removeProject: async () => {}, 
      addCompanyUser: async () => {}, updateCompanyUser: async () => {}, removeCompanyUser: async () => {}, 
      addProjectMember: async () => {}, removeProjectMember: async () => {}, addTimeEntry: async () => {},
      isDemoMode: true,
      demoData: template
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

interface DemoAppProps {
  activeTab: string;
}

export default function DemoApp({ activeTab }: DemoAppProps) {
  const isFullscreenTab = ['bim', 'plans', 'whiteboard'].includes(activeTab);

  return (
    <LiveDemoProjectProvider>
      <div className={cn(
        "h-full w-full bg-background text-text-primary flex flex-col relative",
        isFullscreenTab ? "p-0" : "p-4 md:p-8"
      )}>
        <Suspense fallback={
          <div className="flex h-full w-full flex-col items-center justify-center text-text-muted gap-3 flex-1">
            <Loader2 className="w-8 h-8 animate-spin text-accent-ai" />
            <span className="text-sm font-bold uppercase tracking-widest">Lade Modul...</span>
          </div>
        }>
          {activeTab === 'overview' && <Dashboard />}
          {activeTab === 'team' && <ProjectTeam />}
          {activeTab === 'calendar' && <CalendarComponent />}
          {activeTab === 'finance' && <Finance />}
          {activeTab === 'bim' && <BIMViewer />}
          {activeTab === 'plans' && <PlanEditorViewer />} 
          {activeTab === 'meet' && <MeetChat />}
          {activeTab === 'crm' && <CRM />}
          {activeTab === 'documents' && <Documents />}
          {activeTab === 'site' && <SiteMonitoring />}
          {activeTab === 'whiteboard' && <Whiteboard />}
          {activeTab === 'pitch' && <PitchDeck />}
          {activeTab === 'defects' && <Defects />}
          {activeTab === 'api' && <API />}
        </Suspense>
      </div>
    </LiveDemoProjectProvider>
  );
}