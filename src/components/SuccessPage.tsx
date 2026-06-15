import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Rocket, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import confetti from 'canvas-confetti';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    welcome_club: 'Welcome to the {plan} Club! 🎉',
    hey_visionary: 'Hey {name}, your payment was successful. Your account has been activated.',
    go_to_dashboard: 'Go to Dashboard',
    tip_title: 'Pro Tip:',
    tip_content: 'Start by inviting your team members in the "Project Team" settings to collaborate instantly on your BIM models.'
  },
  de: {
    welcome_club: 'Willkommen im {plan}-Club! 🎉',
    hey_visionary: 'Hey {name}, deine Zahlung war erfolgreich. Dein Account wurde soeben freigeschaltet.',
    go_to_dashboard: 'Direkt zum Dashboard',
    tip_title: 'Profi-Tipp:',
    tip_content: 'Lade als Erstes deine Teammitglieder in den "Projekt-Team" Einstellungen ein, um sofort gemeinsam an deinen BIM-Modellen zu arbeiten.'
  }
};

const SuccessPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { language, t: globalT } = useLanguage();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan') || 'Pro';

  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full">
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-[#fafafa] mb-2">
          {t('welcome_club').replace('{plan}', plan)}
        </h1>
        <p className="text-[#a1a1aa] mb-8 font-medium">
          {t('hey_visionary').replace('{name}', currentUser?.displayName || 'Visionary')}
        </p>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/app')}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
          >
            {t('go_to_dashboard')} <LayoutDashboard className="w-5 h-5" />
          </button>
          
          <div className="p-4 bg-[#18181b] rounded-xl border border-[#27272a] flex items-start gap-3 text-left">
            <Rocket className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-[#a1a1aa] leading-relaxed font-medium">
              <strong className="text-[#fafafa]">{t('tip_title')}</strong> {t('tip_content')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;