import React, { useState, useMemo } from 'react';
import {
  Search,
  Book,
  PlayCircle,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Briefcase,
  X,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Layers,
  Wrench,
  CheckCircle2,
  Send,
  Clock
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useTour } from '../contexts/TourContext';
import { supabase } from '../lib/supabase';
import { cn } from '../utils';
import { callGeminiAPI } from '../utils/geminiClient';
import { getAllModulesKnowledge, ModuleKnowledgeEntry } from '../data/moduleKnowledgeBase';
import { ModuleHandbookDrawer } from './ModuleGuideButton';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    help_center: 'Kreativ Desk OS Academy & Help Center',
    help_subtitle:
      'Complete module encyclopedia, step-by-step workflows, SIA/BKP guides, and instant AI support.',
    search_placeholder:
      'Search across all 14 modules, workflows, tools, BKP, QR-Bill, CAD, BIM, or FAQs...',
    faq_title: 'Frequently Asked Questions (Praxis & B2B)',
    faq_q1: 'What is the difference between the Company Hub (Tier 1) and Project Cockpit (Tier 2)?',
    faq_a1:
      'Tier 1 (Company Hub) manages your entire organization: project portfolio, global financial ledger, CRM contacts, sales leads, templates, and licenses. Clicking any project opens Tier 2 (Project Cockpit) with all 12 project-specific tools (3D BIM, 2D CAD, Site Camera, Defects, Gantt Schedule, Project Vault).',
    faq_q2: 'Do external clients, architects, or contractors consume a paid license seat?',
    faq_a2:
      'No! External guests (roles: Guest, Client/Bauherr, Contractor/Handwerker, Subcontractor) are 100% free and unlimited across all plans. Moreover, financial modules and internal margins are automatically hidden from external guests.',
    faq_q3: 'How does the 5-Pillar Financial Ledger separate Quotes from Revenue?',
    faq_a3:
      'Saved Quotes ("Offerten") are tracked exclusively under "Open Quotes" and never inflate your revenue. Only actual outgoing invoices ("Debitorenrechnungen") count toward revenue. External creditor bills (BKP), team expenses, and billable internal time entries ("Rapporte") are deducted to calculate your true net project profit.',
    faq_q4: 'How do I calibrate the exact scale in the 2D CAD Plan Editor?',
    faq_a4:
      'Open any PDF or image floor plan, click the Ruler icon ("Calibrate Scale"), click the start and end point of a known wall or door width on the plan, and enter the real length in meters. All distance and area (m²) tools are immediately calibrated.',
    faq_q5: 'How does the Mobile QR Live Upload work on the construction site?',
    faq_a5:
      'In Defects, Expenses, Site Monitoring, Documents, or Pitch Deck Studio, click "Mobile QR Upload" and scan the QR code with your smartphone camera. Any photo you snap is transferred via Supabase Realtime into your open desktop form in under 2 seconds — without installing an app.',
    faq_q6: 'How do Smart Proposals work for my clients?',
    faq_a6:
      'Publish a presentation or quote as a Smart Proposal to get a shareable link (/p/...). Your client can view 3D/video content, toggle optional add-on packages with live price calculation, and sign digitally in the browser. You receive an instant notification and can auto-sync the signed deal to Bexio.',
    faq_q7: 'How can I upgrade, downgrade, or manage my subscription and invoices?',
    faq_a7:
      'Go to "Settings → Admin & Billing" and click "Open Stripe Portal". There you can download all subscription invoices, update payment methods, or adjust your plan at any time.',
    faq_q8: 'What are the differences and Year-2 renewal rates for Studio, Agency, and Enterprise?',
    faq_a8:
      'Studio (5 seats), Agency (15 seats), and Enterprise (25+ seats) include a one-time implementation & onboarding package in Year 1. From Year 2 onwards, the setup fee drops completely and you only pay the annual software license (CHF 6,800/yr for Studio, CHF 16,800/yr for Agency, from CHF 45,000/yr for Enterprise, all excl. VAT).',
    still_need_help: 'Need personal assistance or have a technical request?',
    support_desc:
      'Submit a direct support ticket to our engineering & onboarding team or ask the AI Concierge.',
    contact_support: 'Open Support Ticket',
    ask_ai: 'Ask AI Concierge',
    clear_search: 'Clear search'
  },
  de: {
    help_center: 'Kreativ Desk OS Academy & Hilfe-Zentrum',
    help_subtitle:
      'Komplette Modul-Enzyklopädie, Schritt-für-Schritt Praxisanleitungen, SIA/BKP-Workflows und direkte KI-Hilfe.',
    search_placeholder:
      'Suche nach Modulen, Anleitungen, QR-Rechnung, CAD-Massstab, BIM, Mängel, BKP oder FAQs...',
    faq_title: 'Häufig gestellte Praxis- & B2B-Fragen (FAQ)',
    faq_q1: 'Was ist der Unterschied zwischen Firmenzentrale (Ebene 1) und Projekt-Cockpit (Ebene 2)?',
    faq_a1:
      'Ebene 1 (Firmenzentrale) steuert dein gesamtes Büro: Projekt-Portfolio, globales Finanzbuch, CRM-Stammkontakte, Verkaufspipeline (Leads), Master-Vorlagen und Lizenzen. Sobald du ein Projekt anklickst, wechselst du auf Ebene 2 (Projekt-Cockpit) mit allen projektbezogenen Spezialwerkzeugen (3D-BIM, 2D-CAD, Baustellen-Kamera, Mängelliste, Gantt-Bauprogramm, Projekt-Tresor).',
    faq_q2: 'Kosten externe Bauherren, Fachplaner oder Handwerker eine Lizenz (Seat)?',
    faq_a2:
      'Nein! Externe Gäste (Rollen: Gast, Bauherr, Handwerker, Subunternehmer, Externer Planer) sind auf Kreativ Desk OS immer 100 % kostenlos und unbegrenzt einladbar. Zudem sind sämtliche Finanzmodule, Budgets und interne Margen für externe Gäste technisch komplett gesperrt.',
    faq_q3: 'Wie trennt das Finanzmodul zwischen Offerten, Umsatz und internen Stunden?',
    faq_a3:
      'Gespeicherte Offerten (Kategorie «Offerte») werden ausschliesslich unter «Offene Offerten» geführt und verfälschen niemals deinen Umsatz. Erst echte Debitorenrechnungen zählen zum Umsatz. Davon zieht der Financial Ledger automatisch Kreditorenrechnungen (BKP), Team-Spesen und verrechenbare Mitarbeiter-Rapporte («Interne Stunden») ab, sodass du jederzeit deinen echten Netto-Projektertrag siehst.',
    faq_q4: 'Wie kalibriere ich den Massstab im 2D CAD-Plan-Editor exakt?',
    faq_a4:
      'Öffne deinen hochgeladenen Grundriss (PDF oder Bild), wähle in der Werkzeugleiste das Lineal-Icon («Massstab kalibrieren»), klicke auf Anfangs- und Endpunkt einer bekannten Strecke (z. B. Türbreite 1.00 m oder vermasste Wand) und gib das reale Mass in Metern ein. Sofort messen alle Distanz- und Flächenwerkzeuge (m²) massstabsgetreu.',
    faq_q5: 'Wie funktioniert der Handy-QR-Live-Upload auf der Baustelle oder für Quittungen?',
    faq_a5:
      'Klicke bei Mängeln, Spesen, Baustellen-Überwachung, Dokumenten oder im Pitch Deck auf «QR Handy-Upload» und scanne den QR-Code mit deiner Smartphone-Kamera. Jedes aufgenommene Foto landet ohne App-Installation in unter 2 Sekunden exakt einmal direkt in deinem geöffneten Formular am Computer.',
    faq_q6: 'Wie funktionieren interaktive Kunden-Offerten (Smart Proposals)?',
    faq_a6:
      'Veröffentliche eine Präsentation oder Offerte als Smart Proposal, um einen sicheren Kunden-Link (/p/...) zu erhalten. Dein Kunde kann 3D-/Video-Inhalte ansehen, optionale Zusatzpakete live an- oder abwählen und direkt im Browser rechtsgültig digital unterschreiben – inklusive automatischer Team-Benachrichtigung und optionalem Bexio-Sync.',
    faq_q7: 'Wie kann ich mein Abonnement anpassen, Rechnungen abrufen oder kündigen?',
    faq_a7:
      'Unter «Einstellungen → Admin & Abrechnung» gelangst du mit einem Klick auf «Stripe Portal öffnen» in dein verifiziertes Stripe-Kundenkonto. Dort kannst du jederzeit Zahlungsmittel ändern, alle bisherigen Abo-Rechnungen als PDF herunterladen oder dein Paket anpassen.',
    faq_q8: 'Wie sehen die Folgekosten für B2B-Systeme (Studio / Agency / Enterprise) ab dem 2. Jahr aus?',
    faq_a8:
      'Im ersten Jahr enthalten die B2B-Pakete neben der Jahreslizenz das einmalige Implementation & Onboarding Package. Ab dem 2. Jahr entfällt das Setup-Paket komplett – du zahlst nur noch die reine Software-Jahreslizenz (CHF 6’800/Jahr für Studio mit 5 Seats, CHF 16’800/Jahr für Agency mit 15 Seats, ab CHF 45’000/Jahr für Enterprise mit 25+ Seats, jeweils exkl. MwSt.).',
    still_need_help: 'Persönliche Unterstützung oder technisches Anliegen?',
    support_desc:
      'Erstelle direkt hier ein Support-Ticket an unser Engineering- & Onboarding-Team oder frage den KI-Concierge.',
    contact_support: 'Support-Ticket senden',
    ask_ai: 'KI-Concierge öffnen',
    clear_search: 'Suche leeren'
  }
};

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeDrawerModuleId, setActiveDrawerModuleId] = useState<string | null>(null);

  const [aiAnswer, setAiAnswer] = useState('');
  const [isAskingAI, setIsAskingAI] = useState(false);

  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketPriority, setTicketPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  const { language, t: globalT } = useLanguage();
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { startTour } = useTour();

  const currentLang: 'de' | 'en' =
    typeof language === 'string' && language.toLowerCase().startsWith('en') ? 'en' : 'de';
  const isGerman = currentLang === 'de';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const allModules = useMemo(() => getAllModulesKnowledge(currentLang), [currentLang]);

  const categoryTabs = useMemo(
    () => [
      { id: 'all', label: isGerman ? 'Alle 14 Module' : 'All 14 Modules' },
      { id: 'company_hub', label: isGerman ? 'Firmenzentrale (Ebene 1)' : 'Company Hub (Tier 1)' },
      { id: 'project_cockpit', label: isGerman ? 'Projekt-Cockpit (Ebene 2)' : 'Project Cockpit (Tier 2)' },
      { id: 'studios_ai', label: isGerman ? 'Studios, CAD, BIM & KI' : 'Studios, CAD, BIM & AI' },
      { id: 'finance_legal', label: isGerman ? 'Finanzen, QR & Offerten' : 'Finance, QR & Proposals' }
    ],
    [isGerman]
  );

  const filteredModules = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allModules.filter((m) => {
      if (selectedCategory !== 'all' && m.category !== selectedCategory) return false;
      if (!q) return true;
      const haystack = [
        m.title,
        m.subtitle,
        m.summary,
        m.categoryLabel,
        ...m.dataFlow,
        ...m.workflows.map((w) => `${w.title} ${w.steps.join(' ')} ${w.proTip}`),
        ...m.tools.map((tl) => `${tl.name} ${tl.badge} ${tl.description}`),
        ...m.faqs.map((fq) => `${fq.q} ${fq.a}`)
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [allModules, selectedCategory, searchQuery]);

  const faqs = useMemo(
    () => [
      { question: t('faq_q1'), answer: t('faq_a1') },
      { question: t('faq_q2'), answer: t('faq_a2') },
      { question: t('faq_q3'), answer: t('faq_a3') },
      { question: t('faq_q4'), answer: t('faq_a4') },
      { question: t('faq_q5'), answer: t('faq_a5') },
      { question: t('faq_q6'), answer: t('faq_a6') },
      { question: t('faq_q7'), answer: t('faq_a7') },
      { question: t('faq_q8'), answer: t('faq_a8') }
    ],
    [currentLang]
  );

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(
      (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
    );
  }, [faqs, searchQuery]);

  const handleSubmitSupportTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    setIsSubmittingTicket(true);
    try {
      const companyId = currentUser?.companyId || currentUser?.uid || 'system';
      await supabase.from('support_tickets').insert({
        company_id: companyId,
        user_email: currentUser?.email || 'user@kreativdesk.ch',
        email: currentUser?.email || 'user@kreativdesk.ch',
        subject: ticketSubject.trim(),
        message: ticketMessage.trim(),
        priority: ticketPriority,
        status: 'open',
        created_at: new Date().toISOString()
      });
      addToast(
        isGerman
          ? 'Support-Ticket erfolgreich übermittelt! Wir melden uns umgehend.'
          : 'Support ticket submitted successfully!',
        'success'
      );
      setTicketSubject('');
      setTicketMessage('');
      setIsSupportModalOpen(false);
    } catch {
      addToast(
        isGerman
          ? 'Ticket lokal vermerkt – du erreichst uns auch direkt unter support@kreativdesk.ch.'
          : 'Ticket noted — you can also reach us at support@kreativdesk.ch.',
        'info'
      );
      setIsSupportModalOpen(false);
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background animate-in fade-in duration-500">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Header & Search */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-500 text-xs font-extrabold uppercase tracking-wider">
              <Book size={13} />
              <span>{isGerman ? 'Interaktives Wissens- & Schulungszentrum' : 'Interactive Knowledge Base'}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
              {t('help_center')}
            </h1>
            <p className="text-sm sm:text-base text-text-muted max-w-2xl mx-auto">
              {t('help_subtitle')}
            </p>
            <div className="max-w-2xl mx-auto relative flex items-center pt-2">
              <Search className="absolute left-4 text-text-muted" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_placeholder')}
                className="w-full bg-surface border border-border rounded-2xl pl-12 pr-12 py-3.5 text-sm sm:text-base focus:outline-none focus:border-blue-500 transition-colors text-text-primary shadow-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 p-1.5 bg-border rounded-full hover:bg-white/10 transition-colors text-text-muted hover:text-text-primary cursor-pointer"
                  title={t('clear_search')}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* 📘 OFFIZIELLES MASTER-SYSTEM-HANDBUCH & TOUR BANNER */}
          {!searchQuery && (
            <div className="relative overflow-hidden rounded-3xl border-2 border-blue-500/40 bg-gradient-to-br from-blue-500/15 via-surface to-background p-6 sm:p-7 shadow-xl shadow-blue-500/10">
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2.5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-500 text-xs font-bold uppercase tracking-wider">
                    <Sparkles size={13} />
                    <span>
                      {isGerman ? 'Offizielles Referenzhandbuch 2026' : 'Official Reference Guide 2026'}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                    {isGerman
                      ? 'Kreativ Desk OS – Master-System-Handbuch (14 Seiten PDF) & Geführte Tour'
                      : 'Kreativ Desk OS – Master System Handbook (14-Page PDF) & Guided Tour'}
                  </h2>
                  <p className="text-xs sm:text-sm text-text-muted max-w-2xl leading-relaxed font-medium">
                    {isGerman
                      ? 'Erklärt das 2-Ebenen-Prinzip (Firmenzentrale vs. Projekt-Cockpit), 3D BIM (IFC), 2D CAD-Pläne, Schweizer BKP 1–9 Kostenkontrolle, SIA 102/118, Handy-QR-Sync, KI-Whiteboard, Pitch Deck und die Schweizer QR-Rechnung.'
                      : 'Explains the 2-tier architecture (Company Hub vs. Project Cockpit), 3D BIM (IFC), 2D CAD plans, Swiss BKP 1–9 cost control, SIA 102/118, mobile QR sync, AI whiteboard, pitch decks, and Swiss QR-bills.'}
                  </p>
                </div>
                <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={() => startTour()}
                    className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-surface hover:bg-white/10 text-text-primary border border-border font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                  >
                    <PlayCircle size={18} className="text-blue-500" />
                    <span>{isGerman ? 'Interaktive System-Tour starten' : 'Start Interactive System Tour'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-system-handbook'))}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all cursor-pointer active:scale-95 group"
                  >
                    <BookOpen size={18} className="text-blue-200" />
                    <span>{isGerman ? 'PDF-Handbuch öffnen' : 'Open PDF Handbook'}</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 🏛️ ARCHITEKTUR & SICHERHEITS-KURZÜBERSICHT */}
          {!searchQuery && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-surface border border-border space-y-2">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blue-500">
                  <Layers size={15} />
                  <span>{isGerman ? 'Ebene 1: Firmenzentrale' : 'Tier 1: Company Hub'}</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  {isGerman
                    ? 'Unternehmensweite Steuerung: Projekt-Portfolio, CRM-Adressbuch, Verkaufs-Pipeline (Leads), globales Finanzbuch, Vorlagen und Lizenzen.'
                    : 'Company-wide command center: Project portfolio, CRM directory, sales pipeline, global ledger, templates, and licenses.'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface border border-border space-y-2">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-indigo-500">
                  <Briefcase size={15} />
                  <span>{isGerman ? 'Ebene 2: Projekt-Cockpit' : 'Tier 2: Project Cockpit'}</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  {isGerman
                    ? 'Öffnet sich bei Klick auf ein Projekt: 2D CAD-Pläne, 3D BIM-Viewer, Mängelliste, Baustellen-Kamera, Gantt-Bauprogramm und Projekt-Tresor (01–09).'
                    : 'Opens when clicking a project: 2D CAD plans, 3D BIM viewer, defects list, site camera, Gantt schedule, and project vault (01–09).'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-500">
                  <ShieldCheck size={15} />
                  <span>{isGerman ? 'Gäste- & Finanz-Garantie' : 'Guest & Finance Isolation'}</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  {isGerman
                    ? 'Externe Bauherren, Fachplaner und Handwerker sind unbegrenzt kostenlos einladbar und haben technisch 0 % Zugriff auf deine Finanzen & Margen.'
                    : 'External clients and contractors are free and unlimited, with 0% access to your internal finances and margins.'}
                </p>
              </div>
            </div>
          )}

          {/* 📚 INTERAKTIVE 14-MODULE ENZYKLOPÄDIE */}
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                  {isGerman
                    ? 'Alle Module & Studios im Detail (Klicken für Schritt-für-Schritt Guide)'
                    : 'All Modules & Studios in Detail (Click for Step-by-Step Playbook)'}
                </h2>
                <p className="text-xs sm:text-sm text-text-muted">
                  {isGerman
                    ? 'Wähle ein Modul aus, um Datenfluss, Praxisanleitungen, Werkzeuge und Berechtigungen zu öffnen.'
                    : 'Select any module to inspect its data flow, step-by-step playbooks, tools, and role permissions.'}
                </p>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {categoryTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={cn(
                    'px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border',
                    selectedCategory === tab.id
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-surface text-text-muted border-border hover:text-text-primary'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Module Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredModules.map((mod: ModuleKnowledgeEntry) => (
                <div
                  key={mod.id}
                  onClick={() => setActiveDrawerModuleId(mod.id)}
                  className="p-5 rounded-2xl bg-surface border border-border hover:border-blue-500/50 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/25">
                        {mod.categoryLabel}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-text-muted">
                        <Clock size={12} className="text-blue-500" />
                        {mod.workflows.length} {isGerman ? 'Anleitungen' : 'Playbooks'} · {mod.tools.length}{' '}
                        {isGerman ? 'Werkzeuge' : 'Tools'}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-text-primary group-hover:text-blue-500 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed line-clamp-2">
                      {mod.summary}
                    </p>

                    {/* Tool preview pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {mod.tools.slice(0, 3).map((tl, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background border border-border text-[11px] font-semibold text-text-primary"
                        >
                          <Wrench size={10} className="text-blue-500" />
                          {tl.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-500 group-hover:translate-x-0.5 transition-transform">
                      <CheckCircle2 size={14} />
                      {isGerman ? 'Detail-Anleitung & Workflows öffnen' : 'Open Playbook & Workflows'}
                      <ArrowRight size={13} />
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        startTour(mod.id);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/30 text-[11px] font-bold cursor-pointer"
                    >
                      {isGerman ? '🎯 Klick-Tour' : '🎯 Click-Tour'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ❓ FAQ LISTE & KI-SUCHE */}
          <div className="space-y-5 pt-4">
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
              {searchQuery ? (isGerman ? 'Gefundene FAQs' : 'Matching FAQs') : t('faq_title')}
            </h2>
            <div className="space-y-3">
              {filteredFaqs.map((faq, i) => (
                <div key={i} className="p-5 bg-surface border border-border rounded-2xl">
                  <h4 className="font-bold text-sm sm:text-base text-text-primary mb-2 flex items-start gap-3">
                    <HelpCircle className="text-blue-500 shrink-0 mt-0.5" size={18} />
                    <span>{faq.question}</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-text-muted leading-relaxed ml-7">{faq.answer}</p>
                </div>
              ))}

              {searchQuery && filteredFaqs.length === 0 && filteredModules.length === 0 && (
                <div className="text-center p-8 border border-dashed border-border rounded-2xl text-text-muted space-y-4">
                  <p className="text-sm font-medium">
                    {isGerman
                      ? `Keine direkten Treffer für «${searchQuery}» gefunden.`
                      : `No direct matches found for "${searchQuery}".`}
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsAskingAI(true);
                      try {
                        const prompt = isGerman
                          ? `Du bist der offizielle Support-Experte für Kreativ Desk OS (Schweizer Architektur-, Bau- und Projektsoftware). Verwende immer Schweizer Rechtschreibung ("ss" statt "ß"). Beantworte präzise und schrittweise: "${searchQuery}"`
                          : `You are the official support expert for Kreativ Desk OS. Answer clearly and step-by-step: "${searchQuery}"`;
                        const res = await callGeminiAPI('gemini-2.5-flash', [{ text: prompt }]);
                        const text =
                          typeof res === 'string'
                            ? res
                            : res?.text || res?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                        setAiAnswer(text || 'Keine Antwort generiert.');
                      } catch {
                        setAiAnswer('Die KI-Antwort konnte momentan nicht geladen werden.');
                      } finally {
                        setIsAskingAI(false);
                      }
                    }}
                    disabled={isAskingAI}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-2 mx-auto shadow-lg transition-all disabled:opacity-50 cursor-pointer text-xs sm:text-sm"
                  >
                    <Sparkles size={16} />
                    <span>
                      {isAskingAI
                        ? isGerman
                          ? 'KI analysiert deine Frage...'
                          : 'AI is generating answer...'
                        : isGerman
                          ? 'KI-Expertenantwort zu dieser Frage generieren'
                          : 'Generate AI Expert Answer'}
                    </span>
                  </button>

                  {aiAnswer && (
                    <div className="mt-4 p-5 bg-blue-500/5 border border-blue-500/25 rounded-2xl text-left font-medium text-text-primary">
                      <div className="flex items-center gap-2 font-bold text-blue-500 mb-2 text-xs uppercase tracking-wider">
                        <Sparkles size={15} /> KI-Concierge Antwort:
                      </div>
                      <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">{aiAnswer}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 💬 SUPPORT FOOTER */}
          <div className="mt-8 p-6 sm:p-8 bg-surface border border-border rounded-2xl text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center mx-auto mb-1 shadow-inner">
              <MessageSquare size={22} className="text-blue-500" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-text-primary">{t('still_need_help')}</h3>
            <p className="text-text-muted text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              {t('support_desc')}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsSupportModalOpen(true)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-colors cursor-pointer"
              >
                {t('contact_support')}
              </button>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-ai-concierge'))}
                className="px-6 py-2.5 bg-background text-text-primary border border-border hover:bg-white/5 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Sparkles size={15} className="text-blue-500" />
                <span>{t('ask_ai')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Deep-Dive Module Handbook Drawer */}
      <ModuleHandbookDrawer
        isOpen={Boolean(activeDrawerModuleId)}
        onClose={() => setActiveDrawerModuleId(null)}
        initialModuleId={activeDrawerModuleId || 'projects'}
      />

      {/* Support Ticket Modal */}
      {isSupportModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-hidden overscroll-contain"
          onClick={() => setIsSupportModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-surface border border-border shadow-2xl p-6 space-y-4 overflow-y-auto overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-text-primary">
                {isGerman ? 'Support-Ticket übermitteln' : 'Submit Support Ticket'}
              </h3>
              <button
                type="button"
                onClick={() => setIsSupportModalOpen(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitSupportTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1">
                  {isGerman ? 'Betreff / Modul' : 'Subject / Module'}
                </label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder={
                    isGerman
                      ? 'z. B. Frage zu Schweizer QR-Rechnung oder CAD-Massstab'
                      : 'e.g., Question regarding Swiss QR-Bill or CAD scale'
                  }
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1">
                  {isGerman ? 'Priorität' : 'Priority'}
                </label>
                <select
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value as any)}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-blue-500"
                >
                  <option value="normal">{isGerman ? 'Normal (Anfrage / Feedback)' : 'Normal'}</option>
                  <option value="high">{isGerman ? 'Hoch (Laufendes Projekt)' : 'High'}</option>
                  <option value="urgent">{isGerman ? 'Dringend (Technischer Blocker)' : 'Urgent'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1">
                  {isGerman ? 'Nachricht & Details' : 'Message & Details'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder={
                    isGerman
                      ? 'Beschreibe kurz dein Anliegen...'
                      : 'Briefly describe how we can help...'
                  }
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSupportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-background border border-border text-xs font-bold text-text-muted hover:text-text-primary cursor-pointer"
                >
                  {isGerman ? 'Abbrechen' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTicket}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send size={13} />
                  <span>
                    {isSubmittingTicket
                      ? isGerman
                        ? 'Wird gesendet...'
                        : 'Sending...'
                      : isGerman
                        ? 'Ticket absenden'
                        : 'Submit Ticket'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}