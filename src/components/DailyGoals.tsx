import React, { useState, useEffect } from 'react';
import { CheckCircle2, Plus, Trash2, Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../utils';
import { handleFirestoreError, OperationType } from '../utils/errorHandlers';

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
  createdAt: any;
  projectId: string;
}

export default function DailyGoals({ projectId }: { projectId: string }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [isAdding, setIsAdding] = useState(false);
  const { currentUser } = useAuth();
  
  const { language, t: globalT } = useLanguage();
  const t = (key: string) => localTranslations[language as 'en' | 'de']?.[key] || globalT(key) || key;

  // === MULTI-TENANT FILTERUNG (GOALS LESEN) ===
  useEffect(() => {
    if (!currentUser || !currentUser.uid || !db || !projectId) return;

    // +++ WÄCHTER HINZUGEFÜGT +++
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;

    const fetchGoals = async () => {
      try {
        if (currentUser.uid === 'demo-user') {
          setGoals([
            { id: '1', title: t('demo_goal_1'), completed: true, priority: 'High', createdAt: new Date(), projectId },
            { id: '2', title: t('demo_goal_2'), completed: false, priority: 'Medium', createdAt: new Date(), projectId },
            { id: '3', title: t('demo_goal_3'), completed: false, priority: 'Low', createdAt: new Date(), projectId }
          ]);
          return;
        }

        const q = query(
          collection(db, 'goals'),
          where('companyId', '==', safeCompanyId), // <-- Sicherer Wächter
          where('projectId', '==', projectId)
        );
        const querySnapshot = await getDocs(q);
        const goalsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Goal[];
        
        goalsData.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        });
        
        setGoals(goalsData);
      } catch (err) {
        handleFirestoreError(err, OperationType.READ, 'goals');
      }
    };

    fetchGoals();
  }, [currentUser, projectId, language]); 

  // === MULTI-TENANT FILTERUNG (GOALS SCHREIBEN) ===
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim() || !currentUser || !currentUser.uid || !db) return;

    // +++ WÄCHTER HINZUGEFÜGT +++
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;

    const goalData = {
      title: newGoal,
      completed: false,
      priority,
      projectId,
      ownerId: currentUser.uid,
      companyId: safeCompanyId, // <-- Sicherer Wächter
      createdAt: serverTimestamp()
    };

    try {
      if (currentUser.uid === 'demo-user') {
        const newGoalObj = {
          ...goalData,
          id: Date.now().toString(),
          createdAt: { toMillis: () => Date.now() }
        } as Goal;
        setGoals([newGoalObj, ...goals]);
      } else {
        const docRef = await addDoc(collection(db, 'goals'), goalData);
        setGoals([{ ...goalData, id: docRef.id, createdAt: { toMillis: () => Date.now() } } as Goal, ...goals]);
      }
      setNewGoal('');
      setIsAdding(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'goals');
    }
  };

  const toggleGoal = async (id: string, currentStatus: boolean) => {
    try {
      if (currentUser?.uid === 'demo-user') {
        setGoals(goals.map(g => g.id === id ? { ...g, completed: !currentStatus } : g));
        return;
      }
      const goalRef = doc(db, 'goals', id);
      await updateDoc(goalRef, { completed: !currentStatus });
      setGoals(goals.map(g => g.id === id ? { ...g, completed: !currentStatus } : g));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `goals/${id}`);
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      if (currentUser?.uid === 'demo-user') {
        setGoals(goals.filter(g => g.id !== id));
        return;
      }
      await deleteDoc(doc(db, 'goals', id));
      setGoals(goals.filter(g => g.id !== id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `goals/${id}`);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium flex items-center gap-2">
          <CalendarIcon size={18} className="text-accent-ai" />
          {t('daily_goals')}
        </h3>
        <span className="text-xs font-bold text-text-muted bg-background px-2 py-1 rounded-md border border-border">
          {goals.filter(g => g.completed).length}/{goals.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 space-y-2">
        <AnimatePresence>
          {goals.map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "group flex items-start gap-3 p-3 rounded-lg border transition-all",
                goal.completed 
                  ? "bg-background border-border/50 opacity-60" 
                  : "bg-surface border-border hover:border-accent-ai/30"
              )}
            >
              <button 
                onClick={() => toggleGoal(goal.id, goal.completed)}
                className="mt-0.5 shrink-0 text-text-muted hover:text-accent-ai transition-colors"
              >
                <CheckCircle2 size={18} className={cn(goal.completed && "text-emerald-500 fill-emerald-500/10")} />
              </button>
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium transition-all",
                  goal.completed ? "text-text-muted line-through" : "text-text-primary"
                )}>
                  {goal.title}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!goal.completed && (
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider",
                    goal.priority === 'High' ? "bg-red-500/10 text-red-500" :
                    goal.priority === 'Medium' ? "bg-orange-500/10 text-orange-500" :
                    "bg-blue-500/10 text-blue-500"
                  )}>
                    {t(goal.priority.toLowerCase())}
                  </span>
                )}
                <button 
                  onClick={() => deleteGoal(goal.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-red-500 transition-all rounded hover:bg-red-500/10"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isAdding ? (
        <form onSubmit={handleAddGoal} className="mt-4 p-3 bg-background border border-border rounded-lg animate-in fade-in zoom-in-95">
          <input
            autoFocus
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder={t('goal_placeholder')}
            className="w-full bg-transparent border-none outline-none text-sm font-medium text-text-primary placeholder-text-muted mb-3"
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {(['Low', 'Medium', 'High'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={cn(
                    "px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors",
                    priority === p 
                      ? (p === 'High' ? "bg-red-500/20 text-red-500" : p === 'Medium' ? "bg-orange-500/20 text-orange-500" : "bg-blue-500/20 text-blue-500")
                      : "bg-background border border-border text-text-muted hover:bg-white/5"
                  )}
                >
                  {t(p.toLowerCase())}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text-primary transition-colors"
              >
                {t('cancel')}
              </button>
              <button 
                type="submit"
                disabled={!newGoal.trim()}
                className="px-3 py-1.5 text-xs font-medium bg-accent-ai text-white rounded hover:bg-accent-ai/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('save')}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <button 
          onClick={() => setIsAdding(true)}
          className="mt-4 w-full py-2 border border-dashed border-border/50 rounded-lg text-sm font-bold text-text-muted hover:text-accent-ai hover:border-accent-ai/50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          {t('add_goal')}
        </button>
      )}
    </div>
  );
}