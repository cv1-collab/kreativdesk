import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../contexts/ProjectContext';
import { useLanguage } from '../contexts/LanguageContext'; 
import { useAuth } from '../contexts/AuthContext';
import PitchDeckStudio from './PitchDeckStudio';
import { ArrowLeft, FolderOpen, MonitorPlay, ChevronRight, KanbanSquare, Plus, LayoutDashboard, GripVertical, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../utils';

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
    task_title: 'Titel der Aufgabe:',
    delete_confirm: 'Task wirklich löschen?'
  }
};

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects } = useProject();
  const { currentUser } = useAuth();
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const project = projects.find(p => p.id === projectId);
  const [isPitchStudioOpen, setIsPitchStudioOpen] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);

  const fetchTasks = async () => {
    if (!projectId || !currentUser?.companyId) return;
    try {
      const { data } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .eq('company_id', currentUser.companyId);

      if (data) setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId, currentUser]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = async (e: React.DragEvent, status: string) => {
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      await supabase.from('project_tasks').update({ status }).eq('id', taskId);
      fetchTasks();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAddTask = async (status: string) => {
    const title = window.prompt(t('task_title'));
    if (title && currentUser?.companyId && projectId) {
      await supabase.from('project_tasks').insert({
        title,
        status,
        project_id: projectId,
        company_id: currentUser.companyId,
        owner_id: currentUser.uid,
        created_at: new Date().toISOString()
      });
      fetchTasks();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm(t('delete_confirm'))) {
      await supabase.from('project_tasks').delete().eq('id', taskId);
      fetchTasks();
    }
  };

  if (!project) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between bg-surface border border-border p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/app')} className="p-2.5 bg-background hover:bg-surface border border-border rounded-xl text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-black text-text-primary flex items-center gap-2">
              {project.name}
            </h2>
            <p className="text-xs text-text-muted">{project.description || t('project_overview')}</p>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border p-6 rounded-3xl shadow-sm">
        <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <KanbanSquare className="text-blue-500" size={20} />
          {t('task_board')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['todo', 'in_progress', 'done'].map((colStatus) => (
            <div 
              key={colStatus} 
              onDrop={(e) => handleDrop(e, colStatus)}
              onDragOver={handleDragOver}
              className="bg-background border border-border/50 rounded-2xl p-4 min-h-[300px]"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-xs uppercase tracking-wider text-text-muted">{colStatus.replace('_', ' ')}</span>
                <button onClick={() => handleAddTask(colStatus)} className="p-1 hover:bg-surface rounded-lg text-text-muted hover:text-text-primary">
                  <Plus size={16} />
                </button>
              </div>

              <div className="space-y-2">
                {tasks.filter(t => t.status === colStatus).map(task => (
                  <div 
                    key={task.id} 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="p-3 bg-surface border border-border rounded-xl shadow-sm flex items-center justify-between cursor-grab active:cursor-grabbing"
                  >
                    <span className="text-sm font-medium text-text-primary">{task.title}</span>
                    <button onClick={() => handleDeleteTask(task.id)} className="text-text-muted hover:text-red-500 p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}