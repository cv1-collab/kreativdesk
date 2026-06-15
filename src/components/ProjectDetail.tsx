import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../contexts/ProjectContext';
import { useLanguage } from '../contexts/LanguageContext'; 
import { useAuth } from '../contexts/AuthContext'; // <-- NEU
import PitchDeckStudio from './PitchDeckStudio';
import { ArrowLeft, FolderOpen, MonitorPlay, ChevronRight, KanbanSquare, Plus, LayoutDashboard, GripVertical, Trash2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { cn } from '../utils';

// === LOKALE ÜBERSETZUNGEN ===
const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    back_to_central: 'Back to Central',
    project_overview: 'Project Overview',
    status_active: 'Active',
    open_pitch: 'Open Pitch Studio',
    task_board: 'Task Board',
    add_task: 'Add Task',
    task_title: 'Task Title:',
    delete_confirm: 'Delete this task?'
  },
  de: {
    back_to_central: 'Zurück zur Zentrale',
    project_overview: 'Projektübersicht',
    status_active: 'Aktiv',
    open_pitch: 'Pitch Studio öffnen',
    task_board: 'Aufgaben & Board',
    add_task: 'Task erstellen',
    task_title: 'Task Titel:',
    delete_confirm: 'Möchtest du diese Aufgabe löschen?'
  }
};

export default function ProjectDetail() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects } = useProject() as any;
  const { language, t: globalT } = useLanguage();
  const { currentUser } = useAuth(); // <-- NEU
  
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;
  
  const activeProject = projects?.find((p: any) => p.id === projectId);
  
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks'>('overview');
  const [tasks, setTasks] = useState<any[]>([]);

  // === MULTI-TENANT FILTERUNG FÜR TASKS ===
  useEffect(() => {
    if (!projectId || !db || !currentUser?.companyId) return;
    const q = query(
      collection(db, 'projectTasks'), 
      where('projectId', '==', projectId),
      where('companyId', '==', currentUser.companyId) // <-- Mandanten-Sicherheit
    );
    const unsub = onSnapshot(q, snap => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [projectId, currentUser]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = async (e: React.DragEvent, status: string) => {
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId && db) {
      await updateDoc(doc(db, 'projectTasks', taskId), { status });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAddTask = async (status: string) => {
    const title = window.prompt(t('task_title'));
    if (title && db && currentUser?.companyId) {
      const id = `task-${Date.now()}`;
      await setDoc(doc(db, 'projectTasks', id), {
        id, 
        projectId, 
        title, 
        status, 
        priority: 'Medium', 
        createdAt: new Date().toISOString(),
        companyId: currentUser.companyId, // <-- Mandanten-Sicherheit
        ownerId: currentUser.uid
      });
    }
  };

  const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(t('delete_confirm'))) {
      await deleteDoc(doc(db, 'projectTasks', id));
    }
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar pb-24 md:pb-8">
        
        {/* HERO CARD FÜR PROJEKT-INFOS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-surface border border-border/50 p-4 md:p-6 rounded-2xl shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2.5 bg-background border border-border/50 hover:bg-white/5 rounded-xl transition-colors text-text-muted hover:text-text-primary shadow-sm" title={t('back_to_central')}>
              <ArrowLeft size={20} />
            </button>
            <div className="h-8 w-px bg-border/50 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {activeProject?.name?.substring(0, 2).toUpperCase() || 'PR'}
              </div>
              <div>
                <h1 className="font-bold text-lg md:text-xl text-text-primary tracking-tight leading-none mb-1">{activeProject?.name || 'Lade Projekt...'}</h1>
                <div className="flex items-center gap-2 text-xs text-text-muted font-medium uppercase tracking-wider">
                  <span className="flex items-center gap-1"><FolderOpen size={12} /> {activeProject?.status || t('status_active')}</span>
                  <span className="w-1 h-1 rounded-full bg-text-muted/30"></span>
                  <span>ID: {projectId?.substring(0, 8)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button onClick={() => setShowPitchModal(true)} className="w-full md:w-auto px-5 py-3 bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm">
              <MonitorPlay size={18} /> <span className="hidden sm:inline">{t('open_pitch')}</span><span className="sm:hidden">Pitch Studio</span>
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex bg-surface border border-border rounded-lg p-1 w-full md:w-fit mb-6 shadow-sm">
           <button onClick={() => setActiveTab('overview')} className={cn("flex-1 px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2", activeTab === 'overview' ? "bg-accent-ai/10 text-accent-ai shadow-sm border border-accent-ai/20" : "text-text-muted hover:text-text-primary")}>
             <LayoutDashboard size={16}/> {t('project_overview')}
           </button>
           <button onClick={() => setActiveTab('tasks')} className={cn("flex-1 px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2", activeTab === 'tasks' ? "bg-accent-ai/10 text-accent-ai shadow-sm border border-accent-ai/20" : "text-text-muted hover:text-text-primary")}>
             <KanbanSquare size={16}/> {t('task_board')}
           </button>
        </div>

        {/* TAB: ÜBERSICHT */}
        {activeTab === 'overview' && (
          <div className="w-full animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-surface border border-border/50 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4">{t('project_overview')}</h2>
                <p className="text-text-muted leading-relaxed">{activeProject?.description || 'Keine Beschreibung verfügbar.'}</p>
              </div>
              <div className="bg-surface border border-border/50 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4">Quick Links</h2>
                <div className="space-y-3">
                  <button onClick={() => setShowPitchModal(true)} className="w-full p-4 rounded-xl bg-background border border-border/50 flex items-center justify-between hover:border-purple-500/50 hover:bg-purple-500/5 transition-colors group shadow-sm">
                    <span className="flex items-center gap-3 font-bold text-sm text-text-primary"><MonitorPlay size={18} className="text-purple-500"/> Pitch Deck Studio</span>
                    <ChevronRight size={18} className="text-text-muted group-hover:text-purple-500"/>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: KANBAN BOARD */}
        {activeTab === 'tasks' && (
          <div className="flex flex-col h-[600px] bg-surface border border-border/50 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="p-4 border-b border-border/50 flex justify-between items-center bg-background/50">
              <h3 className="font-bold text-text-primary flex items-center gap-2"><KanbanSquare className="text-accent-ai" size={18} /> {t('task_board')}</h3>
            </div>
            
            <div className="flex-1 overflow-x-auto overflow-y-hidden flex gap-4 p-4 custom-scrollbar">
              {['To Do', 'In Progress', 'Review', 'Done'].map(status => {
                const columnTasks = tasks.filter(t => t.status === status);
                return (
                  <div 
                    key={status} 
                    className="flex-1 min-w-[280px] flex flex-col bg-background/50 rounded-xl border border-border/50"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, status)}
                  >
                    <div className="p-3 border-b border-border/50 flex justify-between items-center">
                      <span className="font-bold text-xs uppercase tracking-widest text-text-muted">{status}</span>
                      <span className="bg-surface px-2 py-0.5 rounded text-xs font-bold border border-border/50">{columnTasks.length}</span>
                    </div>
                    <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
                      {columnTasks.map(task => (
                        <div 
                          key={task.id} 
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          className="bg-surface border border-border rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing hover:border-accent-ai/50 transition-colors group relative"
                        >
                          <button onClick={(e) => handleDeleteTask(task.id, e)} className="absolute top-2 right-2 text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                          <div className="flex items-center gap-2 mb-1 text-text-muted">
                            <GripVertical size={12} className="opacity-50"/>
                          </div>
                          <h4 className="font-bold text-sm text-text-primary mb-1 pr-6">{task.title}</h4>
                          <div className="flex justify-between items-center mt-3">
                            <span className={cn("px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider", task.priority === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500')}>{task.priority}</span>
                          </div>
                        </div>
                      ))}
                      <button onClick={() => handleAddTask(status)} className="w-full py-2 bg-accent-ai/5 border border-dashed border-accent-ai/30 text-accent-ai rounded-lg text-xs font-bold flex justify-center items-center gap-1 hover:bg-accent-ai/10 transition-colors">
                        <Plus size={14}/> {t('add_task')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {showPitchModal && (
        <PitchDeckStudio onClose={() => setShowPitchModal(false)} projectId={projectId} />
      )}
    </main>
  );
}