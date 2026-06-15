import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    cookie_title: 'We use cookies',
    cookie_desc: 'We use cookies to ensure you get the best experience on our website and to analyze traffic securely.',
    cookie_accept: 'Accept all',
    cookie_decline: 'Decline essential',
    footer_privacy: 'Privacy Policy'
  },
  de: {
    cookie_title: 'Wir nutzen Cookies',
    cookie_desc: 'Diese Website verwendet Cookies, um eine bestmögliche Erfahrung zu bieten und den Traffic sicher zu analysieren.',
    cookie_accept: 'Alle akzeptieren',
    cookie_decline: 'Nur essenzielle',
    footer_privacy: 'Datenschutz'
  }
};

export default function CookieBanner() {
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const { language, t: globalT } = useLanguage();
  
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  useEffect(() => {
    const consent = localStorage.getItem('kreativ_cookie_consent');
    if (!consent) {
      setTimeout(() => setShowCookieBanner(true), 1500);
    }
  }, []);

  const handleCookieConsent = (type: 'all' | 'essential') => {
    localStorage.setItem('kreativ_cookie_consent', type);
    setShowCookieBanner(false);
    
    // ZUKÜNFTIGER ANKER: Hier wird Google Analytics / Tracking aktiviert
    if (type === 'all') {
      window.dispatchEvent(new CustomEvent('cookieConsentGranted'));
    }
  };

  return (
    <AnimatePresence>
      {showCookieBanner && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          exit={{ y: 100, opacity: 0 }} 
          className="fixed bottom-0 left-0 right-0 z-[99999] p-4 md:p-6 pointer-events-none"
        >
          <div className="max-w-4xl mx-auto bg-surface/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 pointer-events-auto">
            <div className="flex-1">
              <h4 className="font-bold text-lg mb-2 text-text-primary">{t('cookie_title')}</h4>
              <p className="text-sm text-text-muted font-medium">
                {t('cookie_desc')} <Link to="/privacy" className="text-accent-ai hover:underline">{t('footer_privacy')}</Link>.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
              <button onClick={() => handleCookieConsent('essential')} className="flex-1 md:flex-none px-6 py-3 bg-background border border-border hover:bg-white/5 text-text-primary rounded-xl text-sm font-bold transition-colors">
                {t('cookie_decline')}
              </button>
              <button onClick={() => handleCookieConsent('all')} className="flex-1 md:flex-none px-6 py-3 bg-accent-ai hover:bg-accent-ai/90 text-white rounded-xl text-sm font-bold shadow-lg transition-all">
                {t('cookie_accept')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}