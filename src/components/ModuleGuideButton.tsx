import React from 'react';
import { HelpCircle } from 'lucide-react';
import { useTour } from '../contexts/TourContext';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../utils';

interface ModuleGuideButtonProps {
  moduleId: 'bim' | 'finance' | 'plans' | 'defects' | 'calendar' | 'pitch' | string;
  className?: string;
  label?: string;
  compact?: boolean;
}

export const ModuleGuideButton: React.FC<ModuleGuideButtonProps> = ({
  moduleId,
  className,
  label,
  compact = false
}) => {
  const { startTour } = useTour();
  const { language } = useLanguage();
  const isGerman = language === 'de';

  const defaultLabel = isGerman ? 'Modul-Guide' : 'Module Guide';
  const displayLabel = label || defaultLabel;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        startTour(moduleId);
      }}
      className={cn(
        "tour-btn-module-guide inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 active:bg-blue-500/30 text-blue-600 dark:text-blue-400 border border-blue-500/30 hover:border-blue-500/50 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap",
        compact && "px-2 py-1.5 text-xs rounded-lg gap-1",
        className
      )}
      title={isGerman ? `${displayLabel}: 2–3 Praxistipps für dieses Werkzeug anzeigen` : `${displayLabel}: 2–3 pro tips for this tool`}
      aria-label={displayLabel}
    >
      <HelpCircle size={compact ? 13 : 15} className="shrink-0 text-blue-500 dark:text-blue-400" />
      <span>{displayLabel}</span>
    </button>
  );
};

export default ModuleGuideButton;
