import React, { useState, useEffect } from 'react';
import { CheckCircle2, Plus, Trash2, Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useProject } from '../contexts/ProjectContext';
import { cn } from '../utils';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    daily_goals: 'Daily Goals',
    add_goal: 'Add Goal',
    goal_placeholder: 'What needs to be done today?',
    cancel: 'Cancel',
    save: 'Save',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    demo_goal_1: 'Check ventilation plans',
    demo_goal_2: 'Coordinate electrician',
    demo_goal_3: 'Check material delivery'
  },
  de: {
    daily_goals: 'Tagesziele',
    add_goal: 'Ziel hinzufügen',
    goal_placeholder: 'Was steht heute an?',
    cancel: 'Abbrechen',
    save: 'Speichern',
    low: 'Niedrig',
    medium: 'Mittel',
    high: 'Hoch',
    demo_goal_1: 'Lüftungspläne prüfen',
    demo_goal_2: 'Elektriker koordinieren',
    demo_goal_3: 'Materiallieferung kontrollieren'
  }
};

interface Goal {
  id: string;
  title: string;
  completed: boolean;
  priority: 'Low' | 'Medium' | 'High';
  createdAt?: any;
  projectId?: string;
}

export default function DailyGoals({ projectId }: { projectId: string }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [isAdding, setIsAdding] = useState(false);
  const { currentUser } = useAuth();
  const { isDemoMode, demoData } = useProject() as any;
  
  const { language, t: globalT } = useLanguage();
  const t = (key: string) => localTranslations[language as 'en' | 'de']?.[key] || globalT(key) || key;

  const fetchGoals = async () => {
    if (!currentUser?.companyId || !projectId) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;

    try {
      const { data } = await supabase
        .from('goals')
        .select('*')
        .eq('company_id', safeCompanyId)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (data) {
        setGoals(data.map(d => ({
          id: d.id,
          title: d.title,
          completed: d.completed || false,
          priority: d.priority || 'Medium',
          createdAt: d.created_at,
          projectId: d.project_id
        })));
      }
    } catch (err) {
      console.error("Error fetching goals:", err);
    }
  };

  useEffect(() => {
    if (isDemoMode) {
      setGoals([
        { id: '1', title: t('demo_goal_1'), completed: true, priority: 'High', projectId },
        { id: '2', title: t('demo_goal_2'), completed: false, priority: 'Medium', projectId },
        { id: '3', title: t('demo_goal_3'), completed: false, priority: 'Low', projectId }
      ]);
      return;
    }

    fetchGoals();
  }, [currentUser, projectId, language, isDemoMode]); 

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim() || !currentUser) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;

    try {
      await supabase.from('goals').insert({
        title: newGoal,
        completed: false,
        priority: priority,
        project_id: projectId,
        company_id: safeCompanyId,
        owner_id: currentUser.uid,
        created_at: new Date().toISOString()
      });

      setNewGoal('');
      setIsAdding(false);
      fetchGoals();
    } catch (err) {
      console.error("Error adding goal:", err);
    }
  };

  const handleToggleGoal = async (goalId: string, currentCompleted: boolean) => {
    try {
      await supabase.from('goals').update({ completed: !currentCompleted }).eq('id', goalId);
      setGoals(prev => prev.map(g => g.id === goalId ? { ...g, completed: !currentCompleted } : g));
    } catch (err) {
      console.error("Error toggling goal:", err);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await supabase.from('goals').delete().eq('id', goalId);
      setGoals(prev => prev.filter(g => g.id !== goalId));
    } catch (err) {
      console.error("Error deleting goal:", err);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
          <CheckCircle2 size={20} className="text-emerald-500" />
          {t('daily_goals')}
        </h3>
        <button onClick={() => setIsAdding(!isAdding)} className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors">
          <Plus size={16} /> {t('add_goal')}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddGoal} className="mb-4 space-y-3 bg-background border border-border p-4 rounded-2xl">
          <input 
            type="text" 
            placeholder={t('goal_placeholder')} 
            value={newGoal} 
            onChange={(e) => setNewGoal(e.target.value)}
            className="w-full px-4 py-2 bg-surface border border-border/50 rounded-xl text-sm font-medium text-text-primary"
          />
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {(['Low', 'Medium', 'High'] as const).map((p) => (
                <button 
                  key={p} 
                  type="button" 
                  onClick={() => setPriority(p)}
                  className={cn("px-3 py-1 rounded-lg text-xs font-bold transition-all", priority === p ? "bg-blue-600 text-white" : "bg-surface text-text-muted")}
                >
                  {t(p.toLowerCase())}
                </button>
              ))}
            </div>
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md">{t('save')}</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {goals.map(goal => (
          <div key={goal.id} className="flex items-center justify-between p-3 bg-background border border-border/50 rounded-xl hover:border-border transition-colors">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleToggleGoal(goal.id, goal.completed)}>
              <div className={cn("w-5 h-5 rounded-md border flex items-center justify-center transition-colors", goal.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-border")}>
                {goal.completed && <CheckCircle2 size={14} />}
              </div>
              <span className={cn("text-sm font-medium", goal.completed ? "line-through text-text-muted" : "text-text-primary")}>
                {goal.title}
              </span>
            </div>
            <button onClick={() => handleDeleteGoal(goal.id)} className="text-text-muted hover:text-red-500 p-1"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}