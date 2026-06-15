import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, Download, Plus, X, Video, ChevronLeft, ChevronRight, 
  CalendarDays, UserPlus, Play, Pause, Square, Trash2, PenTool, Image as ImageIcon, Loader2
} from 'lucide-react';
import { cn } from '../utils';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, deleteDoc, doc, where, orderBy } from 'firebase/firestore';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    time_tracking: 'Time Tracking & Reports',
    new_entry: 'New Entry',
    export_pdf: 'Export PDF',
    date: 'Date',
    project_internal: 'Project / Internal',
    user: 'User',
    hours: 'Hours',
    desc: 'Description',
    save: 'Save',
    cancel: 'Cancel',
    no_entries: 'No entries found.',
    save_report: 'Save Report'
  },
  de: {
    time_tracking: 'Zeiterfassung & Rapporte',
    new_entry: 'Neuer Eintrag',
    export_pdf: 'Export PDF',
    date: 'Datum',
    project_internal: 'Projekt / Intern',
    user: 'Benutzer',
    hours: 'Stunden',
    desc: 'Beschreibung',
    save: 'Speichern',
    cancel: 'Abbrechen',
    no_entries: 'Keine Einträge gefunden.',
    save_report: 'Rapport speichern'
  }
};

const internalProjectsMap: Record<string, string> = {
  'internal_urlaub': 'Ferien / Urlaub',
  'internal_krank': 'Krankheit',
  'internal_admin': 'Administration',
  'internal_weiterbildung': 'Weiterbildung'
};

export default function AgendaRapport() {
  const { currentUser } = useAuth();
  const { projects } = useProject() as any;
  const { language } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || key;

  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // === MULTI-TENANT FILTERUNG ===
  useEffect(() => {
    if (!db || !currentUser?.companyId) return;

    const q = query(
      collection(db, 'timeEntries'), 
      where('companyId', '==', currentUser.companyId),
      orderBy('date', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setTimeEntries(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Snapshot error:", error);
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser]);

  if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="animate-spin text-accent-ai" /></div>;

  return (
    <div className="flex-1 flex flex-col bg-background p-6 overflow-hidden">
      <header className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="text-accent-ai" /> {t('time_tracking')}
        </h2>
      </header>

      <div className="flex-1 overflow-auto bg-surface border border-border rounded-2xl shadow-sm">
        {timeEntries.length === 0 ? (
          <div className="p-12 text-center text-text-muted font-medium">{t('no_entries')}</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-background/50 border-b border-border sticky top-0">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">{t('date')}</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">{t('project_internal')}</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">{t('hours')}</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">{t('desc')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {timeEntries.map(entry => {
                const proj = projects?.find((p:any) => p.id === entry.projectId);
                const isInternal = entry.projectId?.startsWith('internal_');
                return (
                  <tr key={entry.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{new Date(entry.date).toLocaleDateString(currentLang === 'de' ? 'de-CH' : 'en-US')}</td>
                    <td className="px-6 py-4 font-bold">{isInternal ? internalProjectsMap[entry.projectId] : (proj?.name || entry.projectName || 'Unbekannt')}</td>
                    <td className="px-6 py-4 font-mono font-bold text-accent-ai">{parseFloat(entry.hours).toFixed(1)}h</td>
                    <td className="px-6 py-4 text-text-muted">{entry.description}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}