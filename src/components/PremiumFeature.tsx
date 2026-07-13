import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useProject } from '../contexts/ProjectContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
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
      // 1. If we are in demo mode or on the demo route, ALWAYS allow premium features
      if (isDemoMode || window.location.pathname.includes('/demo')) {
        if (isMounted) setIsPremiumValid(true);
        return;
      }

      // VIP BYPASS FÜR DEN DEMO USER
      if (currentUser?.email === 'demo@kreativdesk.com' || currentUser?.uid === 'demo-user') {
        if (isMounted) setIsPremiumValid(true);
        return;
      }

      if (!currentUser || !db) {
        if (isMounted) setIsPremiumValid(false);
        return;
      }

      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const snap = await getDoc(docRef);
        
        if (snap.exists() && isMounted) {
          const data = snap.data();
          const hasSub = data.hasActiveSubscription === true;
          
          let trialValid = false;
          if (data.trialEndsAt) {
            const trialEnds = new Date(data.trialEndsAt);
            trialValid = trialEnds.getTime() > new Date().getTime();
          }
          
          setIsPremiumValid(hasSub || trialValid);
        } else if (isMounted) {
          setIsPremiumValid(false);
        }
      } catch (error) {
        console.error("Fehler beim Prüfen des Pro-Status", error);
        if (isMounted) setIsPremiumValid(false);
      }
    };
    checkAccess();
    
    return () => { isMounted = false; };
  }, [currentUser, isDemoMode]);

  if (isPremiumValid === null) {
    return <div className="w-full h-[60vh] bg-surface border border-border rounded-xl animate-pulse"></div>;
  }

  if (isPremiumValid) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full min-h-[60vh] rounded-xl border border-border overflow-hidden bg-background">
      <div className="absolute inset-0 opacity-20 blur-md pointer-events-none select-none overflow-hidden">
        {children}
      </div>
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm p-6 text-center">
        <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-blue-500/10">
          <Lock className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-3 flex items-center justify-center gap-2">
          {title || t('premium_feature')} <Sparkles className="w-6 h-6 text-blue-400" />
        </h2>
        <p className="text-text-muted max-w-md mb-8 text-sm md:text-base leading-relaxed">
          {description || t('premium_desc')}
        </p>
        <button 
          onClick={() => navigate('/pricing')}
          className="px-8 py-3.5 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all flex items-center gap-3 shadow-lg shadow-blue-500/20 hover:-translate-y-1"
        >
          {t('unlock_now')} <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
