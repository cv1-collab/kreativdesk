import React, { useState } from 'react';
import { Search, Book, PlayCircle, HelpCircle, MessageSquare, ChevronRight, FileText, ArrowLeft, Sparkles, Briefcase, X, BookOpen, ArrowRight, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../utils';
import { callGeminiAPI } from '../utils/geminiClient';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    help_center: 'Help Center',
    help_subtitle: 'How can we help you today?',
    search_placeholder: 'Search for articles, guides, and FAQs...',
    getting_started: 'Getting Started',
    getting_started_desc: 'Learn the basics of Kreativ-Desk OS.',
    bim_viewer: '3D Viewer (BIM)',
    bim_viewer_desc: 'Navigate models and perform visual checks.',
    finance: 'Finance & Budgets',
    finance_desc: 'Track project budgets and export PDF invoices.',
    ai_concierge: 'AI Concierge',
    ai_concierge_desc: 'How to use AI for assistance and pitch decks.',
    enterprise_b2b: 'Enterprise & B2B',
    enterprise_b2b_desc: 'Learn about Studio, Agency, and Enterprise plans.',
    faq_title: 'Frequently Asked Questions',
    faq_q1: 'How does the 3D BIM Viewer work?',
    faq_a1: 'Upload your IFC or CAD model and navigate fluidly through the 3D architecture directly in your browser. Perform visual checks with your team without needing external software.',
    faq_q2: 'Can I connect my bank account to the Finance module?',
    faq_a2: 'Yes, you can import CSV bank ledgers or use our Webhooks and API integrations to sync transactions with your existing tools.',
    faq_q3: 'How does the Pitch Deck Studio work?',
    faq_a3: 'The Pitch Deck Studio helps you export project data, milestones, and financial overviews into professional PDFs. Create clean client presentations in no time.',
    faq_q4: 'Can I use the app on the construction site?',
    faq_a4: 'Yes. The platform is fully responsive and optimized for mobile devices. You can capture defects and photos directly on-site using your mobile browser (internet connection required for live-sync).',
    faq_q5: 'How can I upgrade, downgrade, or cancel my subscription?',
    faq_a5: 'You can manage your subscription at any time in the system settings under "Admin & Billing". Clicking "Open Stripe Portal" takes you securely to Stripe, where you can easily upgrade, downgrade, or cancel your plan at the end of the billing cycle.',
    faq_q6: 'What is the exact difference between Studio, Agency, and Enterprise?',
    faq_a6: 'Studio (5 seats) is designed perfectly for controlling a single large-scale project. Agency (15 seats) acts as an execution booster for teams steering multiple parallel productions. Enterprise (25 seats) offers deep system integration and custom SLAs. All three tiers include comprehensive onboarding in the first year.',
    faq_q7: 'What are the costs for B2B Systems (Studio / Agency / Enterprise) from year 2 onwards?',
    faq_a7: 'The initial cost in the first year covers the software annual license and the one-time implementation package (setup, workflow onboarding, data architecture). From the second year onwards, the implementation fee drops completely. You only pay the software annual license: CHF 6,800/year for Studio (5 seats), CHF 16,800/year for Agency (15 seats), or from CHF 45,000/year for Enterprise (25+ seats), all excl. VAT. External guests and contractors are always free and unlimited.',
    faq_q8: 'Are all prices listed inclusive or exclusive of VAT?',
    faq_a8: 'All prices across our SaaS plans and B2B systems are explicitly stated exclusive of VAT (excl. VAT) and are billed accordingly.',
    still_need_help: 'Still need help?',
    support_desc: 'Our support team is available 24/7 to help you with any technical issues or questions about your projects.',
    contact_support: 'Contact Support',
    ask_ai: 'Ask AI Concierge',
    back: 'Back',
    clear_search: 'Clear search'
  },
  de: {
    help_center: 'Hilfe-Center',
    help_subtitle: 'Wie können wir dir heute helfen?',
    search_placeholder: 'Suche nach Artikeln, Anleitungen und FAQs...',
    getting_started: 'Erste Schritte',
    getting_started_desc: 'Lerne die Grundlagen von Kreativ-Desk OS.',
    bim_viewer: '3D Viewer (BIM)',
    bim_viewer_desc: 'Modelle navigieren und visuelle Prüfungen durchführen.',
    finance: 'Finanzen & Budgets',
    finance_desc: 'Projekt-Budgets tracken und PDF-Offerten exportieren.',
    ai_concierge: 'KI-Concierge',
    ai_concierge_desc: 'Wie man KI für Assistenz und Pitch-Decks nutzt.',
    enterprise_b2b: 'Enterprise & B2B',
    enterprise_b2b_desc: 'Infos zu Studio, Agency und Enterprise Plänen.',
    faq_title: 'Häufig gestellte Fragen',
    faq_q1: 'Wie funktioniert der 3D BIM Viewer?',
    faq_a1: 'Lade dein IFC- oder CAD-Modell hoch und navigiere flüssig im Browser durch die 3D-Architektur. Du kannst visuelle Prüfungen direkt im Team durchführen, ohne externe Software installieren zu müssen.',
    faq_q2: 'Kann ich mein Bankkonto mit dem Finanzmodul verbinden?',
    faq_a2: 'Ja, du kannst CSV-Exporte deiner Bank hochladen oder unsere Webhooks und API-Integrationen nutzen, um Transaktionen mit deinen bestehenden Tools zu synchronisieren.',
    faq_q3: 'Wie funktioniert das Pitch-Deck Studio?',
    faq_a3: 'Das Pitch Deck Studio hilft dir, Projektdaten, Meilensteine und Finanz-Übersichten in professionelle PDFs zu exportieren. Erstelle im Handumdrehen saubere Kundenpräsentationen.',
    faq_q4: 'Kann ich die App auf der Baustelle nutzen?',
    faq_a4: 'Ja. Die Plattform ist voll responsiv und für mobile Geräte optimiert. Du kannst Mängel inklusive Fotos direkt auf der Baustelle in deinem mobilen Browser erfassen (Internetverbindung für den Live-Sync vorausgesetzt).',
    faq_q5: 'Wie kann ich mein Abo anpassen oder kündigen?',
    faq_a5: 'Du kannst dein Abonnement jederzeit in den Einstellungen unter "Admin & Abrechnung" verwalten. Klicke auf "Stripe Portal öffnen", um dein Abo sicher über Stripe upzugraden, downzugraden oder zum Ende der Laufzeit zu kündigen.',
    faq_q6: 'Was ist der genaue Unterschied zwischen Studio, Agency und Enterprise?',
    faq_a6: 'Das Studio-Paket (5 Lizenzen) eignet sich perfekt für die detaillierte Kontrolle eines einzelnen Großprojekts. Die Agency-Lösung (15 Lizenzen) ist ein Execution Booster für Teams, die mehrere Produktionen parallel steuern müssen. Enterprise (25 Lizenzen) bietet zudem tiefe API-Integrationen in bestehende Systeme und individuelle SLAs. Das umfassende Onboarding ist bei allen drei Modellen im ersten Jahr inklusive.',
    faq_q7: 'Wie sehen die Folgekosten für die B2B-Systeme (Studio / Agency / Enterprise) ab dem 2. Jahr aus?',
    faq_a7: 'Der Preis im ersten Jahr beinhaltet die Software-Jahreslizenz und das einmalige Implementation Package (technisches Setup, Struktur-Kalkulation, Schulung). Ab dem zweiten Jahr entfällt das Implementation Package komplett. Du zahlst nur noch die reine Software-Jahreslizenz: CHF 6’800 / Jahr beim Studio (5 Lizenzen), CHF 16’800 / Jahr bei der Agency (15 Lizenzen) bzw. ab CHF 45’000 / Jahr beim Enterprise-Paket (25+ Lizenzen), jeweils exkl. MwSt. Externe Handwerker und Gäste sind stets unbegrenzt kostenlos.',
    faq_q8: 'Verstehen sich die Preise inklusive oder exklusive Mehrwertsteuer?',
    faq_a8: 'Alle auf der Plattform ausgewiesenen Preise – sowohl für die monatlichen Abos als auch für die großen B2B-Systeme – verstehen sich rein netto exklusive gesetzlicher Mehrwertsteuer (exkl. MwSt.).',
    still_need_help: 'Noch Fragen?',
    support_desc: 'Unser Support-Team ist rund um die Uhr verfügbar, um dir bei technischen Problemen oder Fragen zu Projekten zu helfen.',
    contact_support: 'Support kontaktieren',
    ask_ai: 'KI fragen',
    back: 'Zurück',
    clear_search: 'Suche leeren'
  }
};

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [isAskingAI, setIsAskingAI] = useState(false);
  const navigate = useNavigate();
  const { language, t: globalT } = useLanguage();
  
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const categories = [
    { id: 'getting-started', title: t('getting_started'), icon: Book, description: t('getting_started_desc'), searchTerm: 'Kreativ-Desk' },
    { id: 'bim-viewer', title: t('bim_viewer'), icon: PlayCircle, description: t('bim_viewer_desc'), searchTerm: 'BIM' },
    { id: 'finance', title: t('finance'), icon: FileText, description: t('finance_desc'), searchTerm: 'Abo' },
    { id: 'enterprise-b2b', title: t('enterprise_b2b'), icon: Briefcase, description: t('enterprise_b2b_desc'), searchTerm: 'Studio' },
  ];

  const faqs = [
    { question: t('faq_q1'), answer: t('faq_a1') },
    { question: t('faq_q2'), answer: t('faq_a2') },
    { question: t('faq_q3'), answer: t('faq_a3') },
    { question: t('faq_q4'), answer: t('faq_a4') },
    { question: t('faq_q5'), answer: t('faq_a5') },
    { question: t('faq_q6'), answer: t('faq_a6') },
    { question: t('faq_q7'), answer: t('faq_a7') },
    { question: t('faq_q8'), answer: t('faq_a8') },
  ];

  return (
    <div className="h-full flex flex-col bg-background animate-in fade-in duration-500">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Header & Search */}
          <div className="text-center space-y-6">
            <h1 className="text-3xl md:text-5xl font-bold text-text-primary tracking-tight">
              {t('help_center')}
            </h1>
            <p className="text-lg text-text-muted">
              {t('help_subtitle')}
            </p>
            <div className="max-w-2xl mx-auto relative flex items-center">
              <Search className="absolute left-4 text-text-muted" size={20} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_placeholder')}
                className="w-full bg-surface border border-border rounded-xl pl-12 pr-12 py-4 text-base focus:outline-none focus:border-accent-ai transition-colors text-text-primary shadow-sm"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="absolute right-4 p-1 bg-border rounded-full hover:bg-white/10 transition-colors text-text-muted hover:text-text-primary"
                  title={t('clear_search')}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* 📘 OFFIZIELLES MASTER-SYSTEM-HANDBUCH BANNER */}
          {!searchQuery && (
            <div className="relative overflow-hidden rounded-3xl border-2 border-blue-500/40 bg-gradient-to-br from-blue-500/15 via-surface to-background p-6 sm:p-7 shadow-xl shadow-blue-500/10 animate-in fade-in duration-300">
              <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl pointer-events-none -z-0" />
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2.5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-500 text-xs font-bold uppercase tracking-wider">
                    <Sparkles size={13} />
                    <span>{currentLang === 'de' ? 'Offizielles Referenzhandbuch 2026' : 'Official Reference Guide 2026'}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                    {currentLang === 'de' ? 'Kreativ Desk OS – Master-System-Handbuch (PDF)' : 'Kreativ Desk OS – Master System Handbook (PDF)'}
                  </h2>
                  <p className="text-sm text-text-muted max-w-2xl leading-relaxed font-medium">
                    {currentLang === 'de'
                      ? 'Das umfassende 14-seitige Praxishandbuch für Planer, Bauleiter und Generalunternehmer: Erklärt das 2-Ebenen-Prinzip (Firmenzentrale vs. Projekt-Cockpit), 3D BIM (IFC), CAD-Pläne, Schweizer BKP 1–9 Kostenkontrolle, SIA 102/118, Offline PWA Baustellen-Sync, Whiteboard, Pitch Deck und die Schweizer QR-Rechnung. Jederzeit im Universal PDF Studio als Vektor-PDF ansehen und herunterladen.'
                      : 'The comprehensive 14-page operations manual for architects, engineers, and general contractors: Explains the 2-tier architecture (Company Hub vs. Project Cockpit), 3D BIM (IFC), CAD floor plans, Swiss BKP 1–9 cost control, SIA 102/118, offline PWA field sync, AI whiteboard, pitch decks, and Swiss QR-bills. Preview and download directly in Universal PDF Studio.'}
                  </p>
                </div>
                <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('open-system-handbook'))}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all cursor-pointer active:scale-95 group"
                  >
                    <BookOpen size={18} className="group-hover:scale-110 transition-transform text-blue-200" />
                    <span>{currentLang === 'de' ? 'Handbuch öffnen (PDF Studio)' : 'Open Handbook (PDF Studio)'}</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Kategorien */}
          {!searchQuery && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <button 
                  key={cat.id} 
                  onClick={() => setSearchQuery(cat.searchTerm)}
                  className="text-left p-6 bg-surface border border-border hover:border-accent-ai/50 rounded-xl transition-all group shadow-sm hover:-translate-y-1"
                >
                  <cat.icon size={24} className="text-accent-ai mb-4" />
                  <h3 className="font-bold text-lg text-text-primary mb-2 group-hover:text-accent-ai transition-colors">{cat.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{cat.description}</p>
                </button>
              ))}
            </div>
          )}

          {/* FAQ Liste */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-text-primary">{searchQuery ? 'Search Results' : t('faq_title')}</h2>
            <div className="space-y-4">
              {faqs.filter(faq => faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || faq.answer.toLowerCase().includes(searchQuery.toLowerCase())).map((faq, i) => (
                <div key={i} className="p-6 bg-surface border border-border rounded-xl">
                  <h4 className="font-bold text-text-primary mb-2 flex items-start gap-3">
                    <HelpCircle className="text-accent-ai shrink-0 mt-0.5" size={20} />
                    {faq.question}
                  </h4>
                  <p className="text-sm text-text-muted leading-relaxed ml-8">{faq.answer}</p>
                </div>
              ))}
              
              {searchQuery && faqs.filter(faq => faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || faq.answer.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <div className="text-center p-8 border border-dashed border-border rounded-xl text-text-muted space-y-4">
                  <p>Keine statischen FAQ-Ergebnisse für "{searchQuery}" gefunden.</p>
                  <button
                    onClick={async () => {
                      setIsAskingAI(true);
                      try {
                        const prompt = `Du bist der Kundensupport-Assistent für Kreativ-Desk OS (Schweizer Projekt- und Bausoftware). Beantworte präzise auf Deutsch: "${searchQuery}"`;
                        const res = await callGeminiAPI('gemini-2.5-flash', [{ text: prompt }]);
                        const text = typeof res === 'string' ? res : (res?.text || res?.candidates?.[0]?.content?.parts?.[0]?.text || '');
                        setAiAnswer(text || "Entschuldigung, keine Antwort generiert.");
                      } catch (err) {
                        setAiAnswer("Entschuldigung, die KI-Antwort konnte nicht generiert werden.");
                      } finally {
                        setIsAskingAI(false);
                      }
                    }}
                    disabled={isAskingAI}
                    className="px-6 py-3 bg-accent-ai hover:bg-accent-ai/90 text-white font-bold rounded-xl flex items-center gap-2 mx-auto shadow-lg transition-all disabled:opacity-50"
                  >
                    <Sparkles size={18} />
                    {isAskingAI ? 'KI antwortet...' : 'KI-Antwort für diese Frage generieren'}
                  </button>

                  {aiAnswer && (
                    <div className="mt-4 p-6 bg-accent-ai/5 border border-accent-ai/20 rounded-xl text-left font-medium text-text-primary">
                      <div className="flex items-center gap-2 font-bold text-accent-ai mb-2">
                        <Sparkles size={16} /> KI-Concierge Antwort:
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{aiAnswer}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Support Footer */}
          {!searchQuery && (
            <div className="mt-12 p-8 bg-surface border border-border rounded-xl text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center mx-auto mb-2 shadow-inner">
                <MessageSquare size={24} className="text-accent-ai" />
              </div>
              <h3 className="text-xl font-bold text-text-primary">{t('still_need_help')}</h3>
              <p className="text-text-muted text-sm max-w-md mx-auto leading-relaxed">
                {t('support_desc')}
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="px-6 py-2.5 bg-text-primary text-background rounded-xl text-sm font-bold shadow-lg transition-colors">
                  {t('contact_support')}
                </button>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('open-ai-concierge'))}
                  className="px-6 py-2.5 bg-surface text-text-primary border border-border hover:bg-white/5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                >
                  <Sparkles size={16} className="text-accent-ai" />
                  {t('ask_ai')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}