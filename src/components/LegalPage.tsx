import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, ShieldCheck, Building2, Mail, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchSystemConfigJSON } from '../utils/configHelper';

export default function LegalPage() {
  const { language } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  
  const [legalDocs, setLegalDocs] = useState<any>({});

  useEffect(() => {
    const fetchLegalDocs = async () => {
      try {
        const config = await fetchSystemConfigJSON<any>('legal_documents');
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
      <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 mr-3 px-4 py-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-sm font-bold transition-all w-fit">
        <Download size={16} /> {label} (PDF)
      </a>
    );
  };

  const t = {
    de: {
      title: 'Impressum & Rechtliche Informationen',
      desc: 'Angaben gemäss Art. 3 Abs. 1 lit. s UWG sowie dem Schweizer Datenschutzgesetz (revDSG / DSGVO).',
      agb: 'AGB herunterladen',
      privacy: 'Datenschutzerklärung herunterladen',
      operatorTitle: 'Betreiberin & Vertragspartnerin',
      hostingTitle: 'Datenhaltung & Sicherheit (Swiss Cloud)',
      hostingDesc: 'Sämtliche Projekt-, CAD-, BIM- und Finanzdaten werden verschlüsselt nach ISO-27001 Standard verarbeitet. Es gilt ausschliesslich Schweizerisches Recht (Gerichtsstand Zürich).'
    },
    en: {
      title: 'Legal Notice & Statutory Information',
      desc: 'Information in accordance with Art. 3 Para. 1 lit. s UCA and the Swiss Federal Act on Data Protection (FADP / GDPR).',
      agb: 'Download Terms of Service',
      privacy: 'Download Privacy Policy',
      operatorTitle: 'Operator & Contracting Entity',
      hostingTitle: 'Data Hosting & Security (Swiss Cloud)',
      hostingDesc: 'All project, CAD, BIM, and financial data is processed and encrypted in accordance with ISO-27001 standards. Governed exclusively by Swiss law (Place of jurisdiction: Zurich).'
    }
  }[currentLang];

  return (
    <div className="min-h-screen bg-[#09090b] text-[#a1a1aa] py-12 px-4 sm:px-6 lg:px-8 selection:bg-brand-500/30">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-[#fafafa] transition-colors mb-10 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          {currentLang === 'de' ? 'Zurück zur Startseite' : 'Back to Homepage'}
        </Link>
        <div className="space-y-8">
          <section className="bg-surface border border-border p-8 rounded-3xl space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white mb-2">{t.title}</h1>
              <p className="text-sm text-text-muted leading-relaxed">
                {t.desc}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/60">
              <div className="space-y-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Building2 size={16} className="text-blue-500" /> {t.operatorTitle}
                </h2>
                <p className="text-sm text-zinc-300 font-semibold">Kreativ Desk OS — Vescio Design</p>
                <p className="text-xs text-text-muted leading-relaxed">
                  Schweiz / Switzerland<br />
                  <span className="inline-flex items-center gap-1.5 mt-1"><Mail size={12} /> info@kreativdesk.ch</span><br />
                  <span className="inline-flex items-center gap-1.5 mt-0.5"><Globe size={12} /> www.kreativdesk.ch</span>
                </p>
              </div>

              <div className="space-y-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-500" /> {t.hostingTitle}
                </h2>
                <p className="text-xs text-text-muted leading-relaxed">
                  {t.hostingDesc}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center pt-2">
              {renderDownloadButton('agb', t.agb)}
              {renderDownloadButton('privacy', t.privacy)}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}