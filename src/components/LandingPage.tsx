import React, { useState, useEffect } from 'react';
import { 
  Moon, Sun, Video, CheckCircle2, Calendar, Sparkles, 
  ArrowRight, Shield, Menu, X, Briefcase, Zap, Building2, 
  Rocket, Layers, Check, ChevronDown, ChevronUp, Lock,
  Calculator, Box, ShieldAlert, Presentation, Play, Loader2, MonitorPlay
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import DemoLayout from '../components/DemoLayout'; 
import { cn } from '../utils';
import { motion, AnimatePresence } from 'motion/react';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    nav_systems: 'Project Systems', nav_selfservice: 'Pricing', nav_roi: 'ROI Calculator', nav_faq: 'FAQ', nav_login: 'Login', nav_start: 'Get Started',
    hero_badge: 'Real Software. No Fake Images.', 
    beta_badge: 'Public Beta / Early Access',
    hero_title1: 'The Operating System', hero_title2: 'for complex projects.',
    hero_subtitle: 'Plan, budget, and execute demanding projects with clear structure, AI-driven control, and one central workspace.',
    hero_beta_disclaimer: 'We are currently in the Public Beta phase. Join now to shape the future of project management and secure early-adopter conditions.',
    cta_primary: 'Try it live', cta_secondary: 'Request Enterprise Setup',
    demo_title: 'Experience the real system.', demo_subtitle: 'No dummy graphics. No fake interfaces. Click through the actual Kreativ-Desk dashboard right here.',
    demo_subtitle_mobile: 'Swipe through the interactive highlights of our core features.',
    mobile_demo_cta: 'Are you on a desktop? Experience the entire operating system live!',
    card1_title: 'Smart Budgeting', card1_desc: 'Live Calculation & Variants', card1_label: 'Material Quality', card1_total: 'Live Budget',
    card2_title: '3D AI-Audit', card2_desc: 'Collision check in seconds', card2_btn_scan: 'Run AI Audit', card2_scanning: 'Scanning BIM...', card2_safe: 'No escape route conflicts',
    card3_title: 'Site App', card3_desc: 'Check off defects offline', card3_t1: 'Crack in wall (Ground Floor)', card3_t2: 'Window jams (Room 3)', card3_t3: 'Paint touch-up',
    card4_title: 'Auto Pitch-Deck', card4_desc: 'From data to 12 slides', card4_btn: 'Generate PDF', card4_generating: 'Designing Slides...', card4_done: '12 Slides Ready',
    card5_title: 'Full Experience', card5_desc: 'Switch to Desktop', card5_cta: 'Start Free Trial',
    systems_title: 'Project Control Systems', systems_subtitle: 'Infrastructure for studios and companies that need to steer complex productions scalably.',
    sys1_title: 'Kreativ Desk Studio', sys1_desc: 'Focus: Control for a single large-scale project. (Includes 5 Team Seats)', sys1_price: 'from CHF 15,000', sys1_renewal: 'Setup incl. 1st yr. From yr 2: CHF 7,500 / yr.',
    sys2_title: 'Kreativ Desk Agency', sys2_desc: 'Focus: Multiple parallel productions. (Includes 15 Team Seats)', sys2_price: 'CHF 25,000', sys2_renewal: 'Setup incl. 1st yr. From yr 2: CHF 19,500 / yr.',
    sys3_title: 'Kreativ Desk Enterprise', sys3_desc: 'Focus: Deep integration and strategic guidance. (Includes 30 Team Seats)', sys3_price: 'from CHF 40,000', sys3_renewal: 'Setup incl. 1st yr. From yr 2: from CHF 35,000 / yr.',
    sys_vat: 'excl. VAT', b2b_cta: 'Request Setup',
    roi_title: 'What are unstructured projects really costing you?', roi_subtitle: 'Decentralized tools, manual reporting, and lack of oversight cost time and money every week.',
    roi_label_projects: 'Active Projects / Year', roi_label_hours: 'Hours lost per project / week', roi_label_rate: 'Internal Hourly Rate (CHF)', roi_result_title: 'Annual Savings Potential', roi_disclaimer: '*Based on efficiency gains through structured workflows and automation.', roi_cta: 'Centralize Now',
    saas_title: 'Start small. Scale structured.', saas_subtitle: 'Introduction to the system logic for smaller teams and freelancers.', saas_monthly: 'Monthly', saas_yearly: 'Yearly', saas_billed_yearly: 'billed annually', saas_vat: 'All prices excl. VAT',
    plan_starter: 'Starter', desc_starter: 'For freelancers managing simple 2D projects.',
    plan_pro: 'Pro', desc_pro: 'For site managers needing 3D BIM and AI power.',
    plan_expert: 'Expert', desc_expert: 'For power users needing invoicing and API automation.',
    f_proj_3: '3 Active Projects',
    f_proj_unlimited: 'Unlimited Projects',
    f_2d_defects: '2D CAD Viewer & Defects',
    f_3d: '3D BIM Viewer (IFC)',
    f_ai: 'AI Concierge & Pitch Deck',
    f_mobile: 'Mobile Defect App (Live Sync)',
    f_budget: 'Project Budgets & Tracking',
    f_invoice: 'PDF Quotes & Invoicing',
    f_api: 'API & Webhooks (Zapier/Make)',
    f_brand: 'Custom Branding & Domain',
    f_storage_5: '5 GB Cloud Storage',
    f_storage_50: '50 GB Cloud Storage',
    f_storage_250: '250 GB Cloud Storage',
    all_pro_features: 'All features from Pro plan',
    saas_cta_start: 'Start Trial', saas_cta_free: 'Get Started',
    faq_title: 'Frequently Asked Questions', faq_subtitle: 'Everything you need to know about Kreativ-Desk.',
    faq_1_q: 'How secure is my data?', faq_1_a: 'We use enterprise-grade end-to-end encryption. Your data is stored on secure European servers and strictly isolated per tenant.',
    faq_2_q: 'Does the AI train on my project data?', faq_2_a: 'No. Our AI models process your receipts, plans, and documents in a strictly isolated environment. Your data is never used to train global models.',
    faq_3_q: 'How does the 3D BIM Viewer work?', faq_3_a: 'Upload your IFC or CAD model and navigate fluidly through the 3D architecture directly in your browser. Perform visual checks with your team without needing external software.',
    faq_4_q: 'Can I manage quotes and invoices directly in the system?', faq_4_a: 'Yes. The Expert plan includes the full Finance Studio. You can generate professional quotes and PDF invoices, track your income, and monitor your project budget in real-time.',
    faq_5_q: 'Can I use the app on the construction site?', faq_5_a: 'Yes. The platform is fully responsive and optimized for mobile devices. You can capture defects and photos directly on-site using your mobile browser (internet connection required).',
    faq_6_q: 'How does the Pitch-Deck Studio work?', faq_6_a: 'The Pitch Deck Studio helps you export project data, milestones, and financial overviews into professional PDFs. Create clean client presentations in no time.',
    faq_7_q: 'Can Kreativ-Desk connect to my existing CRM or tools like Zapier?', faq_7_a: 'Yes. Kreativ Desk has a built-in CRM for your team and leads. Additionally, Expert users can configure Webhook URLs in the settings to route events to external tools via Zapier or Make.',
    faq_8_q: 'How can I upgrade, downgrade, or cancel my subscription?', faq_8_a: 'You can manage your subscription at any time in the system settings under "Admin & Billing". Clicking "Open Stripe Portal" takes you securely to Stripe, where you can easily upgrade, downgrade, or cancel your plan.',
    faq_9_q: 'What is the exact difference between Studio, Agency, and Enterprise?',
    faq_9_a: 'Studio (5 seats) is designed perfectly for controlling a single large-scale project. Agency (15 seats) acts as an execution booster for teams steering multiple parallel productions. Enterprise (30 seats) offers deep system integration and custom SLAs. All three tiers include comprehensive onboarding in the first year.',
    faq_10_q: 'What are the costs for B2B Systems (Studio / Agency / Enterprise) from year 2 onwards?',
    faq_10_a: 'The initial cost in the first year covers setup, workflow onboarding, and custom engineering, including all team licenses for 12 months. From the second year onwards, the one-time setup fee drops completely. You only pay a heavily discounted flat-rate license fee: CHF 7,500/year for Studio (5 seats), CHF 19,500/year for Agency (15 seats), or from CHF 35,000/year for Enterprise (30 seats), all excl. VAT.',
    faq_11_q: 'Are all prices listed inclusive or exclusive of VAT?',
    faq_11_a: 'All prices across our SaaS plans and B2B systems are explicitly stated exclusive of VAT (excl. VAT) and are billed accordingly.',
    footer_desc: 'The operating system for projects that must succeed.', footer_made: 'Designed in Switzerland.', footer_product: 'Product', footer_legal: 'Legal', footer_privacy: 'Privacy', footer_imprint: 'Imprint', footer_tos: 'Terms of Service', footer_admin: 'Admin'
  },
  de: {
    nav_systems: 'Projekt-Systeme', nav_selfservice: 'Preise', nav_roi: 'ROI Rechner', nav_faq: 'FAQ', nav_login: 'Login', nav_start: 'Kostenlos starten',
    hero_badge: 'Real Software. Keine Fake-Bilder.', 
    beta_badge: 'Public Beta / Early Access',
    hero_title1: 'Das Operating System', hero_title2: 'für komplexe Projekte.',
    hero_subtitle: 'Plane, budgetiere und realisiere anspruchsvolle Projekte mit klarer Struktur, KI-gestützter Kontrolle und einem zentralen Workspace.',
    hero_beta_disclaimer: 'Wir befinden uns aktuell in der Public Beta. Sei von Anfang an dabei, gestalte die Zukunft der Projektsteuerung mit und sichere dir exklusive Early-Adopter Konditionen.',
    cta_primary: 'Try it live', cta_secondary: 'Request Enterprise Setup',
    demo_title: 'Erlebe das echte System.', demo_subtitle: 'Keine Dummy-Grafiken. Keine Fake-Interfaces. Klick dich direkt hier durch die echte Kreativ-Desk Oberfläche.',
    demo_subtitle_mobile: 'Wische dich durch die interaktiven Highlights unserer Kernfunktionen.',
    mobile_demo_cta: 'Bist du am Desktop? Erlebe das gesamte Betriebssystem live!',
    card1_title: 'Smart Budgeting', card1_desc: 'Live Kalkulation & Varianten', card1_label: 'Material-Qualität', card1_total: 'Live Budget',
    card2_title: '3D AI-Audit', card2_desc: 'Kollisionsprüfung in Sekunden', card2_btn_scan: 'KI Audit starten', card2_scanning: 'BIM wird gescannt...', card2_safe: 'Keine Fluchtweg-Konflikte',
    card3_title: 'Baustellen-App', card3_desc: 'Mängel offline abhaken', card3_t1: 'Riss in Wand (EG)', card3_t2: 'Fenster klemmt (Zimmer 3)', card3_t3: 'Malerarbeiten ausbessern',
    card4_title: 'Auto Pitch-Deck', card4_desc: 'Von Daten zu 12 Slides', card4_btn: 'PDF generieren', card4_generating: 'Gestalte Slides...', card4_done: '12 Slides fertig',
    card5_title: 'Volles Erlebnis', card5_desc: 'Wechsle zum Desktop', card5_cta: 'Jetzt kostenlos testen',
    systems_title: 'Projekt-Steuerungssysteme', systems_subtitle: 'Infrastruktur für Studios und Firmen, die komplexe Produktionen skalierbar steuern müssen.',
    sys1_title: 'Kreativ Desk Studio', sys1_desc: 'Fokus: Kontrolle für ein einzelnes Großprojekt. (inklusive 5 Team-Lizenzen)', sys1_price: 'ab CHF 15’000', sys1_renewal: 'Setup inkl. 1. Jahr. Ab Jahr 2: CHF 7’500 / Jahr.',
    sys2_title: 'Kreativ Desk Agency', sys2_desc: 'Fokus: Mehrere parallele Produktionen. (inklusive 15 Team-Lizenzen)', sys2_price: 'CHF 25’000', sys2_renewal: 'Setup inkl. 1. Jahr. Ab Jahr 2: CHF 19’500 / Jahr.',
    sys3_title: 'Kreativ Desk Enterprise', sys3_desc: 'Fokus: Tiefe Integration und strategische Begleitung. (inklusive 30 Team-Lizenzen)', sys3_price: 'ab CHF 40’000', sys3_renewal: 'Setup inkl. 1. Jahr. Ab Jahr 2: ab CHF 35’000 / Jahr.',
    sys_vat: 'exkl. MwSt.', b2b_cta: 'Setup anfragen',
    roi_title: 'Was kosten dich unstrukturierte Projekte wirklich?', roi_subtitle: 'Dezentrale Tools, manuelles Reporting und fehlende Übersicht kosten jede Woche Zeit und Geld.',
    roi_label_projects: 'Aktive Projekte / Jahr', roi_label_hours: 'Zeitverlust pro Projekt / Woche', roi_label_rate: 'Interner Stundensatz (CHF)', roi_result_title: 'Jährliches Sparpotenzial', roi_disclaimer: '*Basierend auf Effizienzsteigerungen durch strukturierte Workflows und Automatisierung.', roi_cta: 'Jetzt zentralisieren',
    saas_title: 'Starte klein. Skaliere strukturiert.', saas_subtitle: 'Einführung in die Systemlogik für kleinere Teams und Freelancer.', saas_monthly: 'Monatlich', saas_yearly: 'Jährlich', saas_billed_yearly: 'jährlich abgerechnet', saas_vat: 'Alle Preise exkl. MwSt.',
    plan_starter: 'Starter', desc_starter: 'Für Freelancer zur simplen 2D-Planorganisation.',
    plan_pro: 'Pro', desc_pro: 'Für Bauleiter, die 3D BIM und KI-Power benötigen.',
    plan_expert: 'Expert', desc_expert: 'Für Power-User, die Finanzen & API-Automatisierung suchen.',
    f_proj_3: '3 Aktive Projekte',
    f_proj_unlimited: 'Unbegrenzte Projekte',
    f_2d_defects: '2D CAD Viewer & Mängel',
    f_3d: '3D BIM Viewer (IFC)',
    f_ai: 'KI-Concierge & Pitch-Deck',
    f_mobile: 'Mobile Mängel-App (Live-Sync)',
    f_budget: 'Projekt-Budgets & Tracking',
    f_invoice: 'PDF-Offerten & Rechnungen',
    f_api: 'API & Webhooks (Zapier/Make)',
    f_brand: 'Eigenes Branding & Domain',
    f_storage_5: '5 GB Cloud Speicher',
    f_storage_50: '50 GB Cloud Speicher',
    f_storage_250: '250 GB Cloud Speicher',
    all_pro_features: 'Alles aus dem Pro-Plan',
    saas_cta_start: 'Jetzt starten', saas_cta_free: 'Jetzt starten',
    faq_title: 'Häufig gestellte Fragen (FAQ)', faq_subtitle: 'Alles, was du über Kreativ-Desk wissen musst.',
    faq_1_q: 'Wie sicher sind meine Daten?', faq_1_a: 'Wir nutzen Enterprise-Grade Verschlüsselung. Deine Daten liegen auf sicheren europäischen Servern und sind strikt mandantenisoliert.',
    faq_2_q: 'Trainiert die KI mit meinen Projektdaten?', faq_2_a: 'Nein. Unsere KI-Modelle verarbeiten deine Belege, Pläne und Dokumente strikt isoliert. Deine Daten werden niemals genutzt, um globale Modelle zu trainieren.',
    faq_3_q: 'Wie funktioniert der 3D BIM Viewer?', faq_3_a: 'Lade dein IFC- oder CAD-Modell hoch und navigiere flüssig im Browser durch die 3D-Architektur. Du kannst visuelle Prüfungen direkt im Team durchführen, ohne externe Software installieren zu müssen.',
    faq_4_q: 'Kann ich Offerten und Rechnungen direkt im System verwalten?', faq_4_a: 'Ja. Ab dem Expert-Plan erhältst du das volle Finanz-Studio. Erstelle mit wenigen Klicks professionelle Offerten und Rechnungen als PDF, behalte deine Einnahmen im Blick und verfolge dein Projektbudget in Echtzeit.',
    faq_5_q: 'Kann ich die App auf der Baustelle nutzen?', faq_5_a: 'Ja. Die Plattform ist voll responsiv und für mobile Geräte optimiert. Du kannst Mängel inklusive Fotos direkt auf der Baustelle in deinem mobilen Browser erfassen (Internetverbindung vorausgesetzt).',
    faq_6_q: 'Wie funktioniert das Pitch-Deck Studio?', faq_6_a: 'Das Pitch Deck Studio hilft dir, Projektdaten, Meilensteine und Finanz-Übersichten in professionelle PDFs zu exportieren. Erstelle im Handumdrehen saubere Kundenpräsentationen.',
    faq_7_q: 'Lässt sich Kreativ-Desk mit anderen Tools (Zapier) verbinden?', faq_7_a: 'Ja. Kreativ Desk verfügt über ein integriertes Smart CRM. Zudem kannst du als Expert-Nutzer Webhook-URLs (z.B. Zapier/Make) in den Einstellungen hinterlegen, um Daten an externe Tools weiterzuleiten.',
    faq_8_q: 'Wie kann ich mein Abo anpassen oder kündigen?', faq_8_a: 'Du kannst dein Abonnement jederzeit in den Einstellungen unter "Admin & Abrechnung" verwalten. Klicke auf "Stripe Portal öffnen", um dein Abo sicher über Stripe upzugraden, downzugraden oder zum Ende der Laufzeit zu kündigen.',
    faq_9_q: 'Was ist der genaue Unterschied zwischen Studio, Agency und Enterprise?',
    faq_9_a: 'Das Studio-Paket (5 Lizenzen) eignet sich perfekt für die detaillierte Kontrolle eines einzelnen Großprojekts. Die Agency-Lösung (15 Lizenzen) ist ein Execution Booster für Teams, die mehrere Produktionen parallel steuern müssen. Enterprise (30 Lizenzen) bietet zudem tiefe API-Integrationen in bestehende Systeme und individuelle SLAs. Das umfassende Onboarding ist bei allen drei Modellen im ersten Jahr inklusive.',
    faq_10_q: 'Wie sehen die Folgekosten für die B2B-Systeme (Studio / Agency / Enterprise) ab dem 2. Jahr aus?',
    faq_10_a: 'Der Preis im ersten Jahr beinhaltet das gesamte technische Setup, die Struktur-Kalkulation sowie alle Team-Lizenzen für 12 Monate. Ab dem zweiten Jahr entfällt die Setup-Gebühr komplett. Du zahlst nur noch eine vergünstigte Lizenz-Flatrate von CHF 7’500 / Jahr beim Studio (5 Lizenzen), CHF 19’500 / Jahr bei der Agency (15 Lizenzen) bzw. ab CHF 35’000 / Jahr beim Enterprise-Paket (30 Lizenzen), jeweils exkl. MwSt.',
    faq_11_q: 'Verstehen sich die Preise inklusive oder exklusive Mehrwertsteuer?',
    faq_11_a: 'Alle auf der Plattform ausgewiesenen Preise – sowohl für die monatlichen Abos als auch für die großen B2B-Systeme – verstehen sich rein netto exklusive gesetzlicher Mehrwertsteuer (exkl. MwSt.).',
    footer_desc: 'Das Betriebssystem für Projekte, die funktionieren müssen.', footer_made: 'Entwickelt in der Schweiz.', footer_product: 'Produkt', footer_legal: 'Rechtliches', footer_privacy: 'Datenschutz', footer_imprint: 'Impressum', footer_tos: 'AGB', footer_admin: 'Admin'
  }
};

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isYearly, setIsYearly] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const languageContext = useLanguage() as any;
  const language = languageContext?.language || 'de';
  const globalT = languageContext?.t;
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT?.(key) || key;

  const handleLanguageToggle = () => {
    const nextLang = currentLang === 'de' ? 'en' : 'de';
    if (typeof languageContext?.setLanguage === 'function') languageContext.setLanguage(nextLang);
    else if (typeof languageContext?.changeLanguage === 'function') languageContext.changeLanguage(nextLang);
    else if (typeof languageContext?.toggleLanguage === 'function') languageContext.toggleLanguage();
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ROI Rechner States
  const [projectsCount, setProjectsCount] = useState(2);
  const [hoursLost, setHoursLost] = useState(1); 
  const [hourlyRate, setHourlyRate] = useState(120);

  // === MIKRO-INTERAKTIONEN (MOBILE CARDS) ===
  const [budgetSlider, setBudgetSlider] = useState(50);
  const [auditState, setAuditState] = useState<'idle'|'scanning'|'done'>('idle');
  const [defects, setDefects] = useState([{id:1, text: 'card3_t1', done: false}, {id:2, text: 'card3_t2', done: true}, {id:3, text: 'card3_t3', done: false}]);
  const [pitchProgress, setPitchProgress] = useState(0);

  const annualSavings = (projectsCount * hoursLost * 52 * hourlyRate) * 0.7;

  const runAIAudit = () => {
    setAuditState('scanning');
    setTimeout(() => setAuditState('done'), 2000);
  };

  const toggleDefect = (id: number) => {
    setDefects(defects.map(d => d.id === id ? { ...d, done: !d.done } : d));
  };

  const runPitchDeck = () => {
    if (pitchProgress > 0) return;
    setPitchProgress(1);
    const interval = setInterval(() => {
      setPitchProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 10;
      });
    }, 200);
  };

  const faqs = [
    { q: t('faq_1_q'), a: t('faq_1_a') },
    { q: t('faq_2_q'), a: t('faq_2_a') },
    { q: t('faq_3_q'), a: t('faq_3_a') },
    { q: t('faq_4_q'), a: t('faq_4_a') },
    { q: t('faq_5_q'), a: t('faq_5_a') },
    { q: t('faq_6_q'), a: t('faq_6_a') },
    { q: t('faq_7_q'), a: t('faq_7_a') },
    { q: t('faq_8_q'), a: t('faq_8_a') },
    { q: t('faq_9_q'), a: t('faq_9_a') },
    { q: t('faq_10_q'), a: t('faq_10_a') },
    { q: t('faq_11_q'), a: t('faq_11_a') }
  ];

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const saasPlans = [
    {
      name: t('plan_starter'),
      price: isYearly ? 35 : 39,
      icon: <Building2 className="w-6 h-6 text-zinc-400" />,
      description: t('desc_starter'),
      features: [t('f_proj_3'), t('f_2d_defects'), t('f_budget'), t('f_storage_5')],
      notIncluded: [t('f_3d'), t('f_ai'), t('f_mobile'), t('f_invoice'), t('f_api')],
      popular: false
    },
    {
      name: t('plan_pro'),
      price: isYearly ? 65 : 79,
      icon: <Zap className="w-6 h-6 text-blue-500" />,
      description: t('desc_pro'),
      features: [t('f_proj_unlimited'), t('f_3d'), t('f_ai'), t('f_mobile'), t('f_budget'), t('f_storage_50')],
      notIncluded: [t('f_invoice'), t('f_api'), t('f_brand')],
      popular: true
    },
    {
      name: t('plan_expert'),
      price: isYearly ? 159 : 189,
      icon: <Layers className="w-6 h-6 text-emerald-500" />,
      description: t('desc_expert'),
      features: [t('f_proj_unlimited'), t('all_pro_features'), t('f_invoice'), t('f_api'), t('f_brand'), t('f_storage_250')],
      notIncluded: [],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-blue-500/30 overflow-x-hidden">
      
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/15 blur-[120px] rounded-full z-0 pointer-events-none"></div>

      <header className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b",
        scrolled ? "bg-background/80 backdrop-blur-md border-border py-4 shadow-sm" : "bg-transparent border-transparent py-6"
      )}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">K</div>
            <span className="font-extrabold text-xl tracking-tighter">Kreativ Desk</span>
          </div>

          <nav className="hidden lg:flex items-center gap-8">
            <button onClick={() => scrollTo('systems')} className="text-sm font-bold text-text-muted hover:text-text-primary transition-colors">{t('nav_systems')}</button>
            <button onClick={() => scrollTo('pricing')} className="text-sm font-bold text-text-muted hover:text-text-primary transition-colors">{t('nav_selfservice')}</button>
            <button onClick={() => scrollTo('roi')} className="text-sm font-bold text-text-muted hover:text-text-primary transition-colors">{t('nav_roi')}</button>
            <button onClick={() => scrollTo('faq')} className="text-sm font-bold text-text-muted hover:text-text-primary transition-colors">{t('nav_faq')}</button>
            
            <div className="h-4 w-px bg-border"></div>
            
            <div className="flex items-center gap-1">
               <button onClick={handleLanguageToggle} className="w-8 h-8 flex items-center justify-center text-xs font-bold text-text-muted hover:text-text-primary hover:bg-white/5 rounded-md transition-colors uppercase">
                 {currentLang === 'de' ? 'EN' : 'DE'}
               </button>
               <button onClick={toggleTheme} className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/5 rounded-md transition-colors">
                 {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
               </button>
            </div>

            <button onClick={() => navigate('/login')} className="text-sm font-bold text-text-muted hover:text-text-primary transition-colors">{t('nav_login')}</button>
            <button onClick={() => scrollTo('systems')} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-blue-700 transition-all">
              {t('nav_start')}
            </button>
          </nav>

          <button className="lg:hidden p-2 text-text-primary" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="fixed inset-0 z-[90] bg-background pt-24 px-6 lg:hidden border-b border-border shadow-2xl pb-6 h-fit">
            <div className="flex flex-col gap-4">
               <button onClick={() => scrollTo('systems')} className="text-left text-lg font-bold p-2 border-b border-border/50">{t('nav_systems')}</button>
               <button onClick={() => scrollTo('pricing')} className="text-left text-lg font-bold p-2 border-b border-border/50">{t('nav_selfservice')}</button>
               <button onClick={() => scrollTo('roi')} className="text-left text-lg font-bold p-2 border-b border-border/50">{t('nav_roi')}</button>
               
               <div className="flex items-center justify-between p-2 border-b border-border/50">
                 <span className="font-bold">Language</span>
                 <button onClick={handleLanguageToggle} className="font-bold text-blue-500 uppercase">{currentLang === 'de' ? 'EN' : 'DE'}</button>
               </div>
               <div className="flex items-center justify-between p-2 border-b border-border/50">
                 <span className="font-bold">Design</span>
                 <button onClick={toggleTheme} className="font-bold text-blue-500">
                   {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                 </button>
               </div>

               <button onClick={() => navigate('/login')} className="text-left text-lg font-bold text-text-primary p-2">{t('nav_login')}</button>
               <button onClick={() => navigate('/login')} className="py-3 bg-blue-600 text-white text-center rounded-xl font-bold mt-2">{t('nav_start')}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* HERO */}
        <section className="pt-48 pb-24 px-6 text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                <Sparkles size={12} /> {t('hero_badge')}
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-bold uppercase tracking-[0.2em] relative overflow-hidden">
                <span className="absolute inset-0 bg-orange-500/20 animate-pulse"></span>
                <span className="relative flex h-2 w-2 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                <span className="relative z-10">{t('beta_badge')}</span>
              </motion.div>
            </div>
            
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[1.1] bg-gradient-to-b from-text-primary to-text-muted bg-clip-text text-transparent">
              {t('hero_title1')}<br/>{t('hero_title2')}
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl xl:text-2xl text-text-muted mb-4 max-w-3xl mx-auto leading-relaxed">
              {t('hero_subtitle')}
            </motion.p>
            
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-sm font-medium text-orange-500/80 mb-12 max-w-2xl mx-auto border border-orange-500/20 bg-orange-500/5 px-4 py-3 rounded-xl">
              {t('hero_beta_disclaimer')}
            </motion.p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => scrollTo('live-demo')} className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 transition-all">
                {t('cta_primary')} <ArrowRight size={20} />
              </button>
              <button onClick={() => scrollTo('systems')} className="w-full sm:w-auto px-8 py-4 bg-surface border border-border text-text-primary rounded-2xl font-bold text-lg hover:bg-white/5 transition-all">
                {t('cta_secondary')}
              </button>
            </div>
          </div>
        </section>

        {/* DEMO SECTION */}
        <section id="live-demo" className="py-20 px-6 overflow-hidden">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">{t('demo_title')}</h2>
              <p className="text-xl text-text-muted font-medium max-w-2xl mx-auto">{t('demo_subtitle')}</p>
            </div>

            <div className="hidden lg:block bg-surface border border-border rounded-[2rem] shadow-2xl overflow-hidden ring-1 ring-white/5 relative">
              <div className="h-14 bg-background/80 backdrop-blur-md border-b border-border flex items-center px-6 gap-4">
                <div className="flex gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
                </div>
                <div className="flex-1 max-w-2xl mx-auto bg-surface border border-border h-8 rounded-lg flex items-center justify-center gap-2 text-xs font-medium text-text-muted">
                  <Lock size={12} /> app.kreativ-desk.com
                </div>
              </div>
              <div className="w-full bg-background overflow-x-auto overflow-y-hidden custom-scrollbar relative">
                 <div className="w-[1280px] xl:w-full h-[700px] md:h-[800px] xl:h-[850px] relative origin-top-left">
                   <DemoLayout isDemoMode={true} />
                 </div>
              </div>
            </div>

            <div className="block lg:hidden mt-8">
              <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 px-6 -mx-6 custom-scrollbar">
                
                <div className="min-w-[85vw] sm:min-w-[320px] snap-center bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-3xl p-6 shadow-xl flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-emerald-500/20 text-emerald-500 rounded-xl"><Calculator size={24}/></div>
                    <div><h3 className="font-bold text-lg">{t('card1_title')}</h3><p className="text-xs text-text-muted">{t('card1_desc')}</p></div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center bg-background/50 backdrop-blur-sm rounded-xl p-5 border border-border/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-text-muted uppercase">{t('card1_label')}</span>
                      <span className="text-emerald-500 font-bold">{budgetSlider}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={budgetSlider} onChange={(e) => setBudgetSlider(Number(e.target.value))} className="w-full accent-emerald-500 mb-6" />
                    <div className="text-center">
                      <div className="text-xs font-bold text-text-muted uppercase mb-1">{t('card1_total')}</div>
                      <div className="text-3xl font-black text-text-primary">
                        CHF {(120000 + (budgetSlider * 1500)).toLocaleString('de-CH')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="min-w-[85vw] sm:min-w-[320px] snap-center bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-3xl p-6 shadow-xl flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-500/20 text-blue-500 rounded-xl"><Box size={24}/></div>
                    <div><h3 className="font-bold text-lg">{t('card2_title')}</h3><p className="text-xs text-text-muted">{t('card2_desc')}</p></div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center items-center bg-background/50 backdrop-blur-sm rounded-xl p-5 border border-border/50 relative overflow-hidden">
                    {auditState === 'idle' && (
                      <button onClick={runAIAudit} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg flex items-center gap-2">
                        <Sparkles size={18}/> {t('card2_btn_scan')}
                      </button>
                    )}
                    {auditState === 'scanning' && (
                      <div className="flex flex-col items-center text-blue-500">
                        <Loader2 className="animate-spin mb-3" size={32} />
                        <span className="text-sm font-bold animate-pulse">{t('card2_scanning')}</span>
                      </div>
                    )}
                    {auditState === 'done' && (
                      <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} className="flex flex-col items-center text-emerald-500">
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-3"><CheckCircle2 size={32} /></div>
                        <span className="text-sm font-bold text-center">{t('card2_safe')}</span>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="min-w-[85vw] sm:min-w-[320px] snap-center bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-3xl p-6 shadow-xl flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-red-500/20 text-red-500 rounded-xl"><ShieldAlert size={24}/></div>
                    <div><h3 className="font-bold text-lg">{t('card3_title')}</h3><p className="text-xs text-text-muted">{t('card3_desc')}</p></div>
                  </div>
                  <div className="flex-1 flex flex-col gap-3 bg-background/50 backdrop-blur-sm rounded-xl p-5 border border-border/50">
                    {defects.map(d => (
                      <div key={d.id} onClick={() => toggleDefect(d.id)} className="flex items-center gap-3 p-3 bg-surface border border-border rounded-lg cursor-pointer">
                        <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center transition-colors", d.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-text-muted")}>
                          {d.done && <Check size={12} />}
                        </div>
                        <span className={cn("text-sm font-medium transition-all", d.done ? "text-text-muted line-through" : "text-text-primary")}>{t(d.text)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="min-w-[85vw] sm:min-w-[320px] snap-center bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-3xl p-6 shadow-xl flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-purple-500/20 text-purple-500 rounded-xl"><Presentation size={24}/></div>
                    <div><h3 className="font-bold text-lg">{t('card4_title')}</h3><p className="text-xs text-text-muted">{t('card4_desc')}</p></div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center items-center bg-background/50 backdrop-blur-sm rounded-xl p-5 border border-border/50">
                    {pitchProgress === 0 ? (
                      <button onClick={runPitchDeck} className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg flex items-center gap-2">
                        <Play size={18}/> {t('card4_btn')}
                      </button>
                    ) : pitchProgress < 100 ? (
                      <div className="w-full">
                        <div className="flex justify-between text-xs font-bold text-purple-500 mb-2"><span>{t('card4_generating')}</span><span>{pitchProgress}%</span></div>
                        <div className="w-full h-2 bg-background rounded-full overflow-hidden border border-border"><div className="h-full bg-purple-500 transition-all duration-200" style={{width:`${pitchProgress}%`}}></div></div>
                      </div>
                    ) : (
                      <motion.div initial={{y:10, opacity:0}} animate={{y:0, opacity:1}} className="px-6 py-3 bg-surface border border-purple-500/30 text-purple-400 rounded-xl font-bold flex items-center gap-2">
                        <CheckCircle2 size={18}/> {t('card4_done')}
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Card 5 - CTA */}
                <div className="min-w-[85vw] sm:min-w-[320px] snap-center bg-gradient-to-br from-zinc-800 to-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col justify-center items-center text-center">
                  <div className="w-16 h-16 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
                    <MonitorPlay size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">{t('card5_title')}</h3>
                  <p className="text-zinc-400 mb-8">{t('card5_desc')}</p>
                  <Link to="/register" className="w-full py-4 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-zinc-200 shadow-xl">
                    {t('card5_cta')} <ArrowRight size={18} />
                  </Link>
                </div>

              </div>
              
              <div className="text-center px-6">
                <div className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl text-sm font-bold text-blue-400 shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-500/5 animate-pulse"></div>
                  <MonitorPlay size={18} className="text-blue-500"/> {t('mobile_demo_cta')}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ROI CALCULATOR */}
        <section id="roi" className="py-24 px-6 bg-surface/30 relative border-y border-border">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">{t('roi_title')}</h2>
              <p className="text-lg text-text-muted font-medium">{t('roi_subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 bg-surface p-10 rounded-[2.5rem] border border-border shadow-lg">
                <div className="space-y-4">
                  <div className="flex justify-between font-bold text-sm text-text-primary">
                    <label>{t('roi_label_projects')}</label>
                    <span className="text-blue-500 text-lg">{projectsCount}</span>
                  </div>
                  <input type="range" min="1" max="50" value={projectsCount} onChange={(e) => setProjectsCount(parseInt(e.target.value))} className="w-full accent-blue-500" />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between font-bold text-sm text-text-primary">
                    <label>{t('roi_label_hours')}</label>
                    <span className="text-blue-500 text-lg">{hoursLost}h</span>
                  </div>
                  <input type="range" min="1" max="50" value={hoursLost} onChange={(e) => setHoursLost(parseInt(e.target.value))} className="w-full accent-blue-500" />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between font-bold text-sm text-text-primary">
                    <label>{t('roi_label_rate')}</label>
                    <span className="text-blue-500 text-lg">{hourlyRate} CHF</span>
                  </div>
                  <input type="range" min="80" max="300" step="10" value={hourlyRate} onChange={(e) => setHourlyRate(parseInt(e.target.value))} className="w-full accent-blue-500" />
                </div>
              </div>

              <div className="bg-blue-600 p-12 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/70 mb-4">{t('roi_result_title')}</h3>
                <div className="text-6xl md:text-7xl font-black tracking-tight mb-4">
                  CHF {Math.round(annualSavings).toLocaleString('de-CH')}
                </div>
                <p className="text-sm font-medium text-white/70 leading-relaxed mb-10">{t('roi_disclaimer')}</p>
                <button onClick={() => scrollTo('systems')} className="w-full py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl">
                  {t('roi_cta')}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* PROJECT SYSTEMS (B2B) */}
        <section id="systems" className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">{t('systems_title')}</h2>
                <p className="text-xl text-text-muted max-w-2xl mx-auto">{t('systems_subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Studio */}
                <div className="p-10 bg-background border border-border hover:bg-surface/50 rounded-[2.5rem] transition-colors flex flex-col group">
                    <Briefcase className="w-10 h-10 text-neutral-400 mb-8 group-hover:text-blue-500 transition-colors" />
                    <h3 className="text-3xl font-black mb-3">{t('sys1_title')}</h3>
                    <div className="flex items-baseline gap-2 mb-4">
                        <div className="text-2xl font-black text-text-primary leading-tight">{t('sys1_price')}</div>
                        <div className="text-xs font-bold text-text-muted whitespace-nowrap">{t('sys_vat')}</div>
                    </div>
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-8 p-1.5 bg-surface rounded border border-border self-start">{t('sys1_renewal')}</div>
                    <p className="text-text-muted font-medium mb-10 leading-relaxed flex-1">{t('sys1_desc')}</p>
                    <button onClick={() => navigate('/lead-form')} className="block w-full py-4 bg-surface border border-border text-center rounded-2xl font-bold hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                      {t('b2b_cta')} <ArrowRight size={18} />
                    </button>
                </div>

                {/* Agency */}
                <div className="p-10 bg-surface border border-blue-500/50 shadow-2xl md:scale-105 rounded-[2.5rem] relative flex flex-col group z-10">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md shadow-blue-500/20">Execution Booster</div>
                    <Zap className="w-10 h-10 text-blue-500 mb-8" />
                    <h3 className="text-3xl font-black mb-3">{t('sys2_title')}</h3>
                    <div className="flex items-baseline gap-2 mb-4">
                        <div className="text-2xl font-black text-text-primary leading-tight">{t('sys2_price')}</div>
                        <div className="text-xs font-bold text-text-muted whitespace-nowrap">{t('sys_vat')}</div>
                    </div>
                    <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-8 p-1.5 bg-blue-500/10 rounded border border-blue-500/20 self-start">{t('sys2_renewal')}</div>
                    <p className="text-text-muted font-medium mb-10 leading-relaxed flex-1">{t('sys2_desc')}</p>
                    <button onClick={() => navigate('/lead-form')} className="block w-full py-4 bg-blue-600 text-white text-center rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                      {t('b2b_cta')} <ArrowRight size={18} />
                    </button>
                </div>

                {/* Enterprise */}
                <div className="p-10 bg-background border border-border hover:bg-surface/50 rounded-[2.5rem] transition-colors flex flex-col group">
                    <Shield className="w-10 h-10 text-emerald-500 mb-8 group-hover:text-blue-500 transition-colors" />
                    <h3 className="text-3xl font-black mb-3">{t('sys3_title')}</h3>
                    <div className="flex items-baseline gap-2 mb-4">
                        <div className="text-2xl font-black text-text-primary leading-tight">{t('sys3_price')}</div>
                        <div className="text-xs font-bold text-text-muted whitespace-nowrap">{t('sys_vat')}</div>
                    </div>
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-8 p-1.5 bg-surface rounded border border-border self-start">{t('sys3_renewal')}</div>
                    <p className="text-text-muted font-medium mb-10 leading-relaxed flex-1">{t('sys3_desc')}</p>
                    <button onClick={() => navigate('/lead-form')} className="block w-full py-4 bg-surface border border-border text-center rounded-2xl font-bold hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                      {t('b2b_cta')} <ArrowRight size={18} />
                    </button>
                </div>
            </div>
          </div>
        </section>

        {/* SAAS PRICING (B2C) */}
        <section id="pricing" className="py-32 px-6 bg-surface/30 border-t border-border">
          <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">{t('saas_title')}</h2>
                  <p className="text-text-muted mb-8 text-lg">{t('saas_subtitle')}</p>
                  
                  <div className="inline-flex bg-background p-1.5 rounded-2xl border border-border shadow-sm">
                    <button onClick={() => setIsYearly(true)} className={cn("px-6 py-2.5 rounded-xl text-sm font-bold transition-all", isYearly ? "bg-blue-600 text-white" : "text-text-muted")}>{t('saas_yearly')}</button>
                    <button onClick={() => setIsYearly(false)} className={cn("px-6 py-2.5 rounded-xl text-sm font-bold transition-all", !isYearly ? "bg-surface text-text-primary border border-border" : "text-text-muted")}>{t('saas_monthly')}</button>
                  </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-20">
                  {saasPlans.map((plan, i) => (
                    <div key={i} className={cn(
                      "relative p-8 rounded-[2rem] border transition-all duration-300 flex flex-col",
                      plan.popular ? "bg-surface border-2 border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.15)] scale-105 z-10" : "bg-background border border-border hover:border-border/80"
                    )}>
                      {plan.popular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase rounded-full shadow-md shadow-blue-500/20">Popular</div>
                      )}
                      <div className="flex items-center gap-3 mb-4 font-bold text-text-primary">
                        {plan.icon} {plan.name}
                      </div>
                      <div className="text-5xl font-black mb-2">CHF {plan.price}</div>
                      <div className="text-sm text-text-muted font-bold mb-6">
                        / {t('saas_monthly').toLowerCase()} {isYearly && <span className="text-blue-500 ml-1">({t('saas_billed_yearly')})</span>}
                      </div>
                      <p className="text-xs text-text-muted mb-6 h-8 leading-relaxed">{plan.description}</p>
                      
                      <div className="space-y-4 mb-10 flex-1">
                        {plan.features.map((f, j) => (
                          <div className="flex items-start gap-3 text-sm font-bold" key={`f-${j}`}>
                            <Check className="w-5 h-5 text-blue-500 shrink-0" /> <span>{f}</span>
                          </div>
                        ))}
                        {plan.notIncluded.map((f, j) => (
                          <div className="flex items-start gap-3 text-sm opacity-40 font-medium" key={`n-${j}`}>
                            <X className="w-5 h-5 shrink-0" /> <span className="line-through">{f}</span>
                          </div>
                        ))}
                      </div>
                      
                      <button onClick={() => navigate('/signup')} className={cn(
                        "w-full py-4 rounded-xl font-bold transition-all active:scale-95 text-center",
                        plan.popular ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20" : "bg-surface border border-border hover:bg-white/5 text-text-primary"
                      )}>
                        {t('saas_cta_start')}
                      </button>
                    </div>
                  ))}
              </div>
              <p className="text-center mt-12 text-text-muted text-xs font-bold uppercase tracking-widest">{t('saas_vat')}</p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24 px-6 bg-background border-t border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-16 text-center">{t('faq_title')}</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-surface border border-border rounded-2xl overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="w-full px-6 py-5 flex items-center justify-between font-bold text-left hover:bg-white/5 transition-colors">
                    {faq.q}
                    {openFaq === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  <AnimatePresence>
                    {openFaq === index && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-5 text-text-muted font-medium leading-relaxed">
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-surface py-12 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black text-sm">K</div>
                <span className="font-bold text-lg">Kreativ Desk</span>
              </div>
              <p className="text-text-muted text-xs max-w-xs mb-4 leading-relaxed font-medium">
                {t('footer_desc')}<br />
                <strong className="text-blue-500">{t('footer_made')}</strong>
              </p>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest mb-4">{t('footer_product')}</h4>
              <ul className="space-y-2 text-xs font-medium text-text-muted">
                <li><button onClick={() => scrollTo('systems')} className="hover:text-blue-500 transition-colors">{t('nav_systems')}</button></li>
                <li><button onClick={() => scrollTo('pricing')} className="hover:text-blue-500 transition-colors">{t('nav_selfservice')}</button></li>
                <li><button onClick={() => scrollTo('roi')} className="hover:text-blue-500 transition-colors">{t('nav_roi')}</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest mb-4">{t('footer_legal')}</h4>
              <ul className="space-y-2 text-xs font-medium text-text-muted">
                <li><Link to="/privacy" className="hover:text-blue-500 transition-colors">{t('footer_privacy')}</Link></li>
                <li><Link to="/terms" className="hover:text-blue-500 transition-colors">{t('footer_tos')}</Link></li>
                <li><Link to="/imprint" className="hover:text-blue-500 transition-colors">{t('footer_imprint')}</Link></li>
                <li><Link to="/admin" className="hover:text-red-500 transition-colors mt-2 block">{t('footer_admin')}</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}