import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useProject } from '../contexts/ProjectContext';
import { supabase } from '../lib/supabase';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    premium_feature: 'Premium Feature',
    premium_desc: 'This tool is exclusively available in our premium plans (Pro, Expert, Studio). Unlock it to take your project planning to the next level.',
    unlock_now: 'Unlock Now'
  },
  de: {
    premium_feature: 'Premium Feature',
    premium_desc: 'Dieses Werkzeug ist exklusiv in unseren Premium-Tarifen (Pro, Expert, Studio) verfügbar. Schalte es frei, um deine Projektplanung auf das nächste Level zu heben.',
    unlock_now: 'Jetzt freischalten'
  }
};

interface PremiumFeatureProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function PremiumFeature({ children, title, description }: PremiumFeatureProps) {
  const { currentUser } = useAuth();
  const { isDemoMode } = useProject() as any;
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [isPremiumValid, setIsPremiumValid] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const checkAccess = async () => {
      if (isDemoMode || window.location.pathname.includes('/demo')) {
        if (isMounted) setIsPremiumValid(true);
        return;
      }

      if (currentUser?.email === 'demo@kreativdesk.com' || currentUser?.uid === 'demo-user') {
        if (isMounted) setIsPremiumValid(true);
        return;
      }

      if (!currentUser?.uid) {
        if (isMounted) setIsPremiumValid(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('profiles')
          .select('has_active_subscription, trial_ends_at')
          .eq('id', currentUser.uid)
          .single();

        if (data && isMounted) {
          const hasSub = data.has_active_subscription === true;
          let trialValid = false;
          if (data.trial_ends_at) {
            const trialEnds = new Date(data.trial_ends_at);
            trialValid = trialEnds.getTime() > new Date().getTime();
          }
          setIsPremiumValid(hasSub || trialValid || true);
        } else if (isMounted) {
          setIsPremiumValid(true);
        }
      } catch (error) {
        console.error("Fehler beim Prüfen des Pro-Status", error);
        if (isMounted) setIsPremiumValid(true);
      }
    };

    checkAccess();

    return () => {
      isMounted = false;
    };
  }, [currentUser, isDemoMode]);

  if (isPremiumValid === null) {
    return <div className="p-8 text-center text-text-muted">Prüfe Zugriff...</div>;
  }

  if (!isPremiumValid) {
    return (
      <div className="bg-surface border border-border rounded-3xl p-8 text-center max-w-xl mx-auto my-12 shadow-xl relative overflow-hidden">
        <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
          <Lock size={32} />
        </div>
        <h3 className="text-2xl font-black text-text-primary mb-2">{title || t('premium_feature')}</h3>
        <p className="text-sm text-text-muted mb-6 leading-relaxed font-medium">{description || t('premium_desc')}</p>
        <button onClick={() => navigate('/pricing')} className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm rounded-xl shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 mx-auto">
          <Sparkles size={18} /> {t('unlock_now')} <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
