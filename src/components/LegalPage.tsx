import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

export default function LegalPage() {
  const { language } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  
  const [legalDocs, setLegalDocs] = useState<any>({});

  useEffect(() => {
    const fetchLegalDocs = async () => {
      try {
        const { data } = await supabase
          .from('system_config')
          .select('*')
          .eq('id', 'legal_documents')
          .maybeSingle();

        const config = (data as any)?.data || data;
        if (config) {
          setLegalDocs(config);
        }
      } catch (e) {}
    };
    fetchLegalDocs();
  }, []);

  const renderDownloadButton = (docType: string, label: string) => {
    const fileUrl = legalDocs[docType]?.url;
    if (!fileUrl) return null;
    return (
      <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-sm font-bold transition-all w-fit">
        <Download size={16} /> {label} (PDF)
      </a>
    );
  };

  const t = {
    de: {
      title: 'Impressum & Rechtliche Informationen',
      desc: 'Angaben gemäß den gesetzlichen Informationspflichten der Schweiz.',
      agb: 'AGB herunterladen',
      privacy: 'Datenschutzerklärung herunterladen'
    },
    en: {
      title: 'Legal Notice & Statutory Information',
      desc: 'Information in accordance with Swiss statutory legal requirements.',
      agb: 'Download Terms of Service',
      privacy: 'Download Privacy Policy'
    }
  }[currentLang];

  return (
    <div className="min-h-screen bg-[#09090b] text-[#a1a1aa] py-12 px-4 sm:px-6 lg:px-8 selection:bg-brand-500/30">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-[#fafafa] transition-colors mb-10 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          {currentLang === 'de' ? 'Zurück zur Startseite' : 'Back to Homepage'}
        </Link>
        <div className="space-y-12">
          <section className="bg-surface border border-border p-8 rounded-3xl">
            <h1 className="text-3xl font-black text-white mb-4">{t.title}</h1>
            <p className="text-sm text-text-muted leading-relaxed">
              {t.desc}
            </p>
            {renderDownloadButton('agb', t.agb)}
            {renderDownloadButton('privacy', t.privacy)}
          </section>
        </div>
      </div>
    </div>
  );
}