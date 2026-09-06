import React, { useState, useEffect } from 'react';
import { CheckCircle2, Plus, Trash2, Calendar as CalendarIcon, Clock, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useProject } from '../contexts/ProjectContext';
import { cn } from '../utils';
import { callGeminiAPI } from '../utils/geminiClient';

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
    if (!currentUser?.companyId) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;

    try {
      const { data } = await supabase
        .from('goals')
        .select('*')
        .eq('company_id', safeCompanyId)
        .order('created_at', { ascending: false });

      if (data) {
        setGoals(data.map(d => {
          let priorityVal: 'Low' | 'Medium' | 'High' = 'Medium';
          let displayTitle = d.title || '';
          if (displayTitle.startsWith('[High] ')) {
            priorityVal = 'High';
            displayTitle = displayTitle.replace('[High] ', '');
          } else if (displayTitle.startsWith('[Low] ')) {
            priorityVal = 'Low';
            displayTitle = displayTitle.replace('[Low] ', '');
          } else if (displayTitle.startsWith('[Medium] ')) {
            priorityVal = 'Medium';
            displayTitle = displayTitle.replace('[Medium] ', '');
          }
          return {
            id: d.id,
            title: displayTitle,
            completed: d.current_value === 1 || (d as any).completed === true,
            priority: priorityVal,
            createdAt: d.created_at,
            projectId
          };
        }));
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
      const fullTitle = priority !== 'Medium' ? `[${priority}] ${newGoal.trim()}` : newGoal.trim();
      await supabase.from('goals').insert({
        title: fullTitle,
        company_id: safeCompanyId,
        target_value: 1,
        current_value: 0,
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
      await supabase.from('goals').update({ current_value: !currentCompleted ? 1 : 0 }).eq('id', goalId);
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

  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const handleGenerateAiGoals = async () => {
    setIsGeneratingAi(true);
    try {
      const prompt = `Erstelle genau 3 professionelle Tagesziele für ein Bau- / Architekturprojekt im Schweizer Standard. 
Antworte als reines JSON-Array von Strings, z.B. ["Bewehrung EG prüfen", "Elektriker bezüglich Trassees kontaktieren", "Lieferschein Beton kontrollieren"]. Kein Markdown.`;

      const res = await callGeminiAPI('gemini-2.5-flash', [{ text: prompt }]);
      const rawText = res?.text || (typeof res === 'string' ? res : '');
      const match = rawText.match(/\[[\s\S]*\]/);
      let suggestions: string[] = [];
      try {
        suggestions = match ? JSON.parse(match[0]) : JSON.parse(rawText);
      } catch (e) {
        console.warn("Failed to parse DailyGoals AI response", e);
      }

      if (Array.isArray(suggestions)) {
        const safeCompanyId = currentUser?.companyId || currentUser?.uid;
        if (safeCompanyId) {
          for (const title of suggestions) {
            await supabase.from('goals').insert({
              company_id: safeCompanyId,
              title: `[High] ${title}`,
              target_value: 1,
              current_value: 0,
              created_at: new Date().toISOString()
            });
          }
          fetchGoals();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const completedCount = goals.filter(g => g.completed).length;
  const totalCount = goals.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-sm h-full flex flex-col">
      <div className="flex flex-wrap sm:flex-nowrap items-start sm:items-center justify-between gap-2 mb-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-base text-text-primary flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
            <span className="truncate">{t('daily_goals')}</span>
          </h3>
          <p className="text-xs text-text-muted mt-0.5 font-medium truncate">
            🎯 {completedCount} von {totalCount} Zielen ({progressPercent}%)
          </p>
        </div>
        
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          <button 
            onClick={handleGenerateAiGoals} 
            disabled={isGeneratingAi}
            className="px-2.5 py-1.5 bg-accent-ai/10 text-accent-ai hover:bg-accent-ai/20 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
            title="KI-Tagesziele vorschlagen"
          >
            <Sparkles size={14} className="shrink-0" /> 
            <span>{isGeneratingAi ? '...' : 'KI-Ziele'}</span>
          </button>
          <button 
            onClick={() => setIsAdding(!isAdding)} 
            className="px-2.5 py-1.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title={t('add_goal')}
          >
            <Plus size={14} className="shrink-0" /> 
            <span>{t('add_goal')}</span>
          </button>
        </div>
      </div>

      {/* Fortschrittsbalken */}
      {totalCount > 0 && (
        <div className="w-full h-2 bg-background border border-border/50 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

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