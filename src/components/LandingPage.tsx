import React, { useState, useEffect, Suspense, lazy } from 'react';
import { 
  Moon, Sun, Video, CheckCircle2, Calendar, Sparkles, 
  ArrowRight, Shield, Menu, X, Briefcase, Zap, Building2, 
  Rocket, Layers, Check, ChevronDown, ChevronUp, Lock,
  Calculator, Box, ShieldAlert, Presentation, Play, Loader2, MonitorPlay,
  Database, Search, MessageSquare, HelpCircle, Server, Users, FileSpreadsheet,
  AlertTriangle, Bot, Send, Copy, CheckCheck, ChevronLeft, ChevronRight,
  Wifi, Battery, Smartphone
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { callGeminiAPI } from '../utils/geminiClient';
const DemoLayout = lazy(() => import('../components/DemoLayout'));
import { cn } from '../utils';
import { motion, AnimatePresence } from 'motion/react';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    nav_systems: 'Project Systems', nav_selfservice: 'Pricing', nav_roi: 'ROI Calculator', nav_faq: 'FAQ', nav_help: 'Help Center', nav_login: 'Login', nav_start: 'Get Started',
    hero_badge: 'Real Software. No Fake Images.', 
    beta_badge: 'Public Beta / Early Access',
    hero_title1: 'The Operating System', hero_title2: 'for complex projects.',
    hero_subtitle: 'Plan, budget, and execute demanding projects with clear structure, AI-driven control, and one central workspace.',
    hero_beta_disclaimer: 'We are currently in the Public Beta phase. Join now to shape the future of project management and secure early-adopter conditions.',
    cta_primary: 'Get Started', cta_secondary: 'Request Setup',
    
    // Status Quo vs Single Source of Truth
    chaos_badge: 'Tool Chaos & Margin Loss',
    chaos_title: 'Status Quo: Chaos & Tool Sprawl',
    chaos_desc: 'Fragmented point solutions, outdated spreadsheets, and scattered communication across emails, WhatsApp, and Dropbox: When contractors work on outdated blueprints, budget overruns remain hidden until invoices arrive, and critical project know-how is lost during team turnover, profit margins erode and teams waste hours every day on duplicate work.',
    chaos_b1: 'Excel Silos & Outdated Blueprints',
    chaos_b1_tag: 'Costly Rework',
    chaos_b2: '10+ Disconnected Vendors & Wasted Seats',
    chaos_b2_tag: 'Zero Visibility',
    chaos_b3: 'WhatsApp, Email & Slack Ping-Pong',
    chaos_b3_tag: 'Information Loss',
    ssot_title: 'Kreativ-Desk: Single Source of Truth',
    ssot_desc: 'End data silos and software fragmentation once and for all: Kreativ-Desk OS unifies your entire project lifecycle into a single, audit-proof Swiss operating system. From native 3D BIM models and live target-actual budgets to on-site defect tracking and invoicing, all teams access the exact same authoritative data in real-time.',
    ssot_badge: 'Tenant-Isolated & Encrypted',
    ssot_p1: '100% Swiss Data Sovereignty & Audit Trail',
    ssot_p1_tag: 'Tenant-Isolated',
    ssot_p2: 'Real-Time Sync: Job Site to Executive Board',
    ssot_p2_tag: 'Zero Friction',
    ssot_p3: 'Authoritative State for BIM, Budgets & Defects',
    ssot_p3_tag: 'Zero Version Clashes',

    demo_title: 'Experience the real system.', demo_subtitle: 'No dummy graphics. No fake interfaces. Click through the actual Kreativ-Desk dashboard right here.',
    demo_subtitle_mobile: 'Swipe through the interactive highlights of our core features.',
    mobile_demo_cta: 'Are you on a desktop? Experience the entire operating system live!',
    mobile_tab_budget: 'Budget',
    mobile_tab_bim: '3D BIM',
    mobile_tab_defects: 'Defects',
    mobile_tab_pitch: 'Pitch Deck',
    mobile_swipe_hint: 'Swipe left/right or tap tabs to explore',
    mobile_prev: 'Prev',
    mobile_next: 'Next',
    mobile_bkp_raw: 'Structural Works',
    mobile_bkp_finish: 'Interior Fit-Out',
    mobile_tolerance_ok: 'Within Target (±1.4%)',
    mobile_sync_active: 'Offline Sync Active',
    mobile_defects_done: 'defects resolved',
    card1_title: 'Smart Budgeting', card1_desc: 'Live Calculation & Variants', card1_label: 'Material Quality', card1_total: 'Live Budget',
    card2_title: '3D AI-Audit', card2_desc: 'Collision check in seconds', card2_btn_scan: 'Run AI Audit', card2_scanning: 'Scanning BIM...', card2_safe: 'No escape route conflicts',
    card3_title: 'Site App', card3_desc: 'Check off defects offline', card3_t1: 'Crack in wall (Ground Floor)', card3_t2: 'Window jams (Room 3)', card3_t3: 'Paint touch-up',
    card4_title: 'Auto Pitch-Deck', card4_desc: 'From data to 12 slides', card4_btn: 'Generate PDF', card4_generating: 'Designing Slides...', card4_done: '12 Slides Ready',
    card5_title: 'Full Experience', card5_desc: 'Switch to Desktop', card5_cta: 'Start Free Trial',

    // 4 Pillars OS Infrastructure
    infra_badge: 'Enterprise Architecture',
    infra_title: 'Why OS Infrastructure?',
    infra_subtitle: 'The 4 executive pillars that distinguish Kreativ-Desk from simple standalone tools.',
    infra_p1_title: 'Central Macro Controlling',
    infra_p1_desc: 'Live target vs. actual comparison across budgets, timelines, and milestones. Direct visibility into cost drivers before deviations occur.',
    infra_p2_title: 'Granular Access Management (RBAC)',
    infra_p2_desc: 'Dedicated permissions for management, project leads, and external contractors. Sensitive financials remain strictly confidential.',
    infra_p3_title: '100% Data Sovereignty & 1-Click Onboarding',
    infra_p3_desc: 'Employee turnover poses zero risk. Data and knowledge remain with the company; permissions can be revoked or reassigned with a single click.',
    infra_p4_title: 'Native 3D & BIM Pipelines (In-House)',
    infra_p4_desc: 'Direct browser-based IFC and CAD processing. Run collision tests and design checks without slow third-party viewers.',

    // B2B Project Systems
    b2b_badge: 'Strategic Corporate Architecture',
    b2b_title: 'B2B Project Systems (Kreativ-Desk OS)',
    b2b_subtitle: 'Custom infrastructure for studios, agencies, and enterprises managing complex productions at scale.',
    b2b_sys1_title: 'Studio OS',
    b2b_sys1_desc: 'Focus: Establishing a central data architecture, tenant-isolated environment, and executive master dashboard.',
    b2b_sys1_price: 'from CHF 15,000',
    b2b_sys1_renewal: 'SETUP INCL. 1ST YR. FROM YR 2: CHF 7,500/YR',
    b2b_sys1_seats: 'Incl. 5 Governance Seats (+ CHF 780/yr per extra seat)',
    b2b_sys2_title: 'Agency OS',
    b2b_sys2_desc: 'Focus: Full resource controlling (target vs. actual), dedicated team workspaces, and automated on-/offboarding for maximum data security.',
    b2b_sys2_price: 'CHF 25,000',
    b2b_sys2_renewal: 'SETUP INCL. 1ST YR. FROM YR 2: CHF 19,500/YR',
    b2b_sys2_seats: 'Incl. 10 Governance Seats (+ CHF 780/yr per extra seat)',
    b2b_sys3_title: 'Enterprise OS',
    b2b_sys3_desc: 'Focus: Custom API pipelines, Single Sign-On (SSO), strategic onboarding, and unlimited system resources.',
    b2b_sys3_price: 'from CHF 50,000',
    b2b_sys3_renewal: 'SETUP INCL. 1ST YR. FROM YR 2: FROM CHF 35,000/YR',
    b2b_sys3_seats: 'Incl. 20 Governance Seats (+ CHF 780/yr per extra seat)',
    b2b_cta_request: 'Request Setup',
    b2b_vat: 'All B2B prices excl. statutory VAT',

    // ROI Calculator
    roi_title: 'Calculate your savings potential',
    roi_subtitle: 'See how many hours and budget Kreativ-Desk saves your company every month.',
    roi_label_projects: 'Active Projects per Year',
    roi_label_hours: 'Hours lost per project/week due to scattered tools',
    roi_label_rate: 'Hourly Rate (CHF)',
    roi_result_title: 'Estimated Annual Cost Savings',
    roi_disclaimer: 'Based on automated reporting, centralized plan distribution, and eliminated license silos.',
    roi_cta: 'Request System Demo',

    // SaaS Pricing
    saas_badge: 'Self-Service Plans',
    saas_title: 'Individual Plans for Specialists',
    saas_subtitle: 'Start small and scale flexibly. Cancel anytime.',
    saas_monthly: 'Monthly',
    saas_yearly: 'Yearly',
    saas_save_20: 'Save 20%',
    saas_billed_yearly: 'billed yearly',
    saas_vat: 'All SaaS prices excl. VAT',
    plan_starter: 'Starter', desc_starter: 'For freelancers managing simple 2D plan workflows.',
    plan_pro: 'Pro', desc_pro: 'For site managers needing 3D BIM, AI Pitch Deck & defects.',
    plan_expert: 'Expert', desc_expert: 'For power users needing invoices, QR billing & API webhooks.',
    f_proj_3: '3 Active Projects',
    f_proj_unlimited: 'Unlimited Projects',
    f_2d_defects: '2D CAD Viewer & Defects',
    f_3d: '3D BIM Viewer (IFC)',
    f_ai: 'AI Concierge & Pitch-Deck Studio',
    f_mobile: 'Mobile Defect App (Live-Sync)',
    f_budget: 'Project Budgets & Tracking',
    f_invoice: 'PDF Quotes & Invoicing Studio',
    f_api: 'API & Webhooks (Zapier/Make)',
    f_brand: 'Custom Branding & Domain',
    f_storage_5: '5 GB Cloud Storage',
    f_storage_50: '50 GB Cloud Storage',
    f_storage_250: '250 GB Cloud Storage',
    all_pro_features: 'All features from Pro plan',
    f_controlling: 'Central Company Dashboard (Controlling)',
    f_rbac: 'Role-Based Access Control (RBAC)',
    f_staff: 'Staff Management & Data Sovereignty',
    f_tenant: 'Tenant-Isolated Server Infrastructure',
    saas_cta_start: 'Get Started',

    // FAQ (11 questions)
    faq_title: 'Frequently Asked Questions', faq_subtitle: 'Everything you need to know about Kreativ-Desk.',
    faq_1_q: 'How secure is my data?', faq_1_a: 'We use enterprise-grade encryption. Your data is stored on secure Swiss servers and strictly isolated per tenant.',
    faq_2_q: 'Does the AI train on my project data?', faq_2_a: 'No. Our AI models process your receipts, plans, and documents in a strictly isolated environment. Your data is never used to train global models.',
    faq_3_q: 'How does the 3D BIM Viewer work?', faq_3_a: 'Upload your IFC or CAD model and navigate fluidly through the 3D architecture directly in your browser. Perform visual checks with your team without needing external software.',
    faq_4_q: 'Can I manage quotes and invoices directly in the system?', faq_4_a: 'Yes. The Expert plan includes the full Finance Studio. You can generate professional quotes and PDF invoices, track your income, and monitor your project budget in real-time.',
    faq_5_q: 'Can I use the app on the construction site?', faq_5_a: 'Yes. The platform is fully responsive and optimized for mobile devices. You can capture defects and photos directly on-site using your mobile browser (internet connection required).',
    faq_6_q: 'How does the Pitch-Deck Studio work?', faq_6_a: 'The Pitch Deck Studio helps you export project data, milestones, and financial overviews into professional PDFs. Create clean client presentations in no time.',
    faq_7_q: 'Can Kreativ-Desk connect to my existing CRM or tools like Zapier?', faq_7_a: 'Yes. Kreativ Desk has a built-in CRM for your team and leads. Additionally, Expert users can configure Webhook URLs in the settings to route events to external tools via Zapier or Make.',
    faq_8_q: 'How can I upgrade, downgrade, or cancel my subscription?', faq_8_a: 'You can manage your subscription at any time in the settings under "Admin & Billing". Clicking "Open Stripe Portal" takes you securely to Stripe, where you can easily upgrade, downgrade, or cancel your plan at the end of the billing cycle.',
    faq_9_q: 'What is the exact difference between Studio, Agency, and Enterprise?', faq_9_a: 'The Studio package is designed for single large-scale project control. Agency steers multiple parallel productions with full resource controlling. Enterprise provides custom API pipelines, SSO, and dedicated SLAs. All B2B models feature tenant-isolated servers and dedicated onboarding.',
    faq_10_q: 'What are the costs for B2B Systems (Studio / Agency / Enterprise) from year 2 onwards?', faq_10_a: 'The first-year price includes full setup, technical onboarding, and team licenses. From the second year onwards, the setup fee is completely eliminated. You only pay a reduced flat rate: CHF 7,500/yr for Studio, CHF 19,500/yr for Agency, and from CHF 35,000/yr for Enterprise. Additional licenses can be booked anytime for CHF 780/year per user.',
    faq_11_q: 'Are all prices listed inclusive or exclusive of VAT?', faq_11_a: 'All prices across our SaaS plans and B2B systems are explicitly stated exclusive of statutory VAT (excl. VAT).',

    // Help Center
    help_title: 'Help Center & Support',
    help_subtitle: 'Have questions about implementation, B2B models, or technical integrations? Our Swiss engineering team and AI Concierge are here for you.',
    help_search_placeholder: 'Search topics or ask a question (e.g. BIM, renewal, RBAC, licenses)...',
    help_t1_title: 'Licenses & Billing',
    help_t1_desc: 'Understand how setup fees convert into an attractive flat rate in year 2, license administration, and VAT handling.',
    help_t1_cta: 'View Pricing',
    help_t2_title: 'BIM & 3D Viewer',
    help_t2_desc: 'Learn how to upload IFC models, run automated AI collision audits, and ensure data integrity in the browser.',
    help_t2_cta: 'Discover Features',
    help_t3_title: 'Roles & RBAC',
    help_t3_desc: 'Configure individual workspaces, tenant-isolated servers, and granular permissions for sensitive financial data.',
    help_t3_cta: 'Read Security Guide',
    help_t4_title: 'Personal Support',
    help_t4_desc: 'Direct line to Swiss software engineers for custom Webhooks (Zapier/Make), API pipelines, and team workshops.',
    help_t4_cta: 'Contact Support',
    help_no_results: 'No static topics match your search. Ask our AI Concierge below!',

    // AI Concierge
    ai_ask_btn: 'Ask AI Concierge',
    ai_suggested_label: 'Suggested questions:',
    ai_q1: 'What are the renewal costs from year 2?',
    ai_q2: 'How much is an additional license for 7 users?',
    ai_q3: 'Which 3D BIM formats (IFC) are supported?',
    ai_q4: 'How does Swiss data sovereignty work?',
    ai_generating: 'AI Concierge is analyzing and generating answer...',
    ai_badge: 'Official Swiss AI Concierge (Gemini 2.5)',
    ai_copy: 'Copy',
    ai_copied: 'Copied!',
    ai_clear: 'Clear',

    footer_desc: 'The operating system for projects that must succeed.', footer_made: 'Designed in Switzerland.', footer_product: 'Product', footer_legal: 'Legal', footer_privacy: 'Privacy', footer_imprint: 'Imprint', footer_tos: 'Terms of Service'
  },
  de: {
    nav_systems: 'Projekt-Systeme', nav_selfservice: 'Preise', nav_roi: 'ROI Rechner', nav_faq: 'FAQ', nav_help: 'Hilfe-Center', nav_login: 'Login', nav_start: 'Kostenlos starten',
    hero_badge: 'Real Software. Keine Fake-Bilder.', 
    beta_badge: 'Public Beta / Early Access',
    hero_title1: 'Das Operating System', hero_title2: 'für komplexe Projekte.',
    hero_subtitle: 'Plane, budgetiere und realisiere anspruchsvolle Projekte mit klarer Struktur, KI-gestützter Kontrolle und einem zentralen Workspace.',
    hero_beta_disclaimer: 'Wir befinden uns aktuell in der Public Beta. Sei von Anfang an dabei, gestalte die Zukunft der Projektsteuerung mit und sichere dir exklusive Early-Adopter Konditionen.',
    cta_primary: 'Jetzt starten', cta_secondary: 'Setup anfragen',

    // Status Quo vs Single Source of Truth
    chaos_badge: 'Tool-Chaos & Margenverlust',
    chaos_title: 'Status Quo: Chaos & Tool-Wildwuchs',
    chaos_desc: 'Zersplitterte Insellösungen, veraltete Tabellen und unkoordinierte Kommunikation über E-Mail, WhatsApp und Dropbox: Wenn auf der Baustelle nach alten Planständen gearbeitet wird, Budgets erst beim Rechnungseingang platzen und wichtiges Know-how bei Mitarbeiterwechseln verloren geht, schmelzen wertvolle Margen dahin und das Team verliert täglich Stunden mit Doppelspurigkeiten.',
    chaos_b1: 'Excel-Silos & veraltete Planstände',
    chaos_b1_tag: 'Teure Baufehler',
    chaos_b2: '10+ Accounts, Insellösungen & Lizenzfresser',
    chaos_b2_tag: 'Keine Kontrolle',
    chaos_b3: 'WhatsApp, E-Mail & Slack Ping-Pong',
    chaos_b3_tag: 'Informationsverlust',
    ssot_title: 'Kreativ-Desk: Single Source of Truth',
    ssot_desc: 'Schluss mit Datensilos und Software-Fragmentierung: Kreativ-Desk OS vereint deine gesamte Projekt-Wertschöpfungskette in einer zentralen, revisionssicheren Schweizer Plattform. Von 3D-BIM-Modellen und Live-Soll-Ist-Budgets über Mängelprotokolle bis zur Abrechnung greifen alle Teams in Echtzeit auf denselben verbindlichen Datenstand zu.',
    ssot_badge: 'Mandantenisoliert & Verschlüsselt',
    ssot_p1: '100% Schweizer Datenhoheit & Revisionssicherheit',
    ssot_p1_tag: 'Mandantenisoliert',
    ssot_p2: 'Echtzeit-Sync: Von Baustelle bis Chef-Etage',
    ssot_p2_tag: 'Null Medienbrüche',
    ssot_p3: 'Verbindlicher Datenstand für Pläne, Budgets & Mängel',
    ssot_p3_tag: 'Kein Versionschaos',

    demo_title: 'Erlebe das echte System.', demo_subtitle: 'Keine Dummy-Grafiken. Keine Fake-Oberflächen. Klicke dich direkt hier durch das reale Kreativ-Desk Dashboard.',
    demo_subtitle_mobile: 'Wische durch die interaktiven Highlights unserer Kernfunktionen.',
    mobile_demo_cta: 'Bist du am Desktop? Erlebe das gesamte Betriebssystem live!',
    mobile_tab_budget: 'Budget',
    mobile_tab_bim: '3D BIM',
    mobile_tab_defects: 'Mängel',
    mobile_tab_pitch: 'Pitch Deck',
    mobile_swipe_hint: 'Wische oder tippe oben zum Wechseln',
    mobile_prev: 'Zurück',
    mobile_next: 'Weiter',
    mobile_bkp_raw: 'BKP 200 Rohbau',
    mobile_bkp_finish: 'BKP 270 Ausbau',
    mobile_tolerance_ok: 'Im Kostenrahmen (±1.4%)',
    mobile_sync_active: 'Offline-Sync aktiv',
    mobile_defects_done: 'Mängel behoben',
    card1_title: 'Smartes Budgeting', card1_desc: 'Live-Kalkulation & Varianten', card1_label: 'Materialqualität', card1_total: 'Live Budget',
    card2_title: '3D KI-Audit', card2_desc: 'Kollisionsprüfung in Sekunden', card2_btn_scan: 'KI-Prüfung starten', card2_scanning: 'Scanne BIM...', card2_safe: 'Keine Fluchtweg-Konflikte',
    card3_title: 'Baustellen-App', card3_desc: 'Mängel offline abhaken', card3_t1: 'Riss in Wand (EG)', card3_t2: 'Fenster klemmt (Raum 3)', card3_t3: 'Farbausbesserung',
    card4_title: 'Auto Pitch-Deck', card4_desc: 'Aus Daten werden 12 Folien', card4_btn: 'PDF generieren', card4_generating: 'Designe Folien...', card4_done: '12 Folien bereit',
    card5_title: 'Vollständiges Erlebnis', card5_desc: 'Wechsle zum Desktop', card5_cta: 'Kostenlos testen',

    // 4 Säulen OS-Infrastruktur
    infra_badge: 'Enterprise Architektur',
    infra_title: 'Warum OS-Infrastruktur?',
    infra_subtitle: 'Die 4 Säulen für die Geschäftsleitung, die Kreativ-Desk von einfachen Insellösungen unterscheiden.',
    infra_p1_title: 'Zentrales Makro-Controlling',
    infra_p1_desc: 'Live-Soll-Ist-Abgleich über Budgets, Termine und Meilensteine. Volle Transparenz über Kostentreiber, bevor Abweichungen entstehen.',
    infra_p2_title: 'Granulares Access Management (RBAC)',
    infra_p2_desc: 'Dedizierte Berechtigungen für Geschäftsleitung, Projektleiter und externe Partner. Sensible Finanzdaten bleiben streng vertraulich.',
    infra_p3_title: '100% Datenhoheit & 1-Klick Onboarding',
    infra_p3_desc: 'Mitarbeiterwechsel stellen kein Risiko dar. Daten und Know-how verbleiben im Unternehmen; Zugriffe sind mit 1 Klick entzogen.',
    infra_p4_title: 'Native 3D- & BIM-Pipelines (In-House)',
    infra_p4_desc: 'Direkte browserbasierte IFC- und CAD-Verarbeitung. Kollisionsprüfungen und Planabgleiche laufen ohne langsame Fremd-Viewer.',

    // B2B Projekt-Systeme
    b2b_badge: 'Strategische Unternehmens-Architektur',
    b2b_title: 'B2B Projekt-Systeme (Kreativ-Desk OS)',
    b2b_subtitle: 'Infrastruktur für Studios, Agenturen und Unternehmen, die komplexe Produktionen skalierbar steuern müssen.',
    b2b_sys1_title: 'Studio OS',
    b2b_sys1_desc: 'Fokus: Etablierung einer zentralen Datenstruktur, mandantenisolierte Umgebung und Master-Dashboard für die Geschäftsleitung.',
    b2b_sys1_price: 'ab CHF 15’000',
    b2b_sys1_renewal: 'SETUP INKL. 1. JAHR. AB JAHR 2: CHF 7’500/JAHR',
    b2b_sys1_seats: 'Inkl. 5 Governance-Lizenzen (+ CHF 780/Jahr pro Zusatzlizenz)',
    b2b_sys2_title: 'Agency OS',
    b2b_sys2_desc: 'Fokus: Volles Ressourcen-Controlling (Soll vs. Ist), dedizierte Team-Workspaces und automatisches On-/Offboarding für maximale Datensicherheit.',
    b2b_sys2_price: 'CHF 25’000',
    b2b_sys2_renewal: 'SETUP INKL. 1. JAHR. AB JAHR 2: CHF 19’500/JAHR',
    b2b_sys2_seats: 'Inkl. 10 Governance-Lizenzen (+ CHF 780/Jahr pro Zusatzlizenz)',
    b2b_sys3_title: 'Enterprise OS',
    b2b_sys3_desc: 'Fokus: Custom API-Pipelines, Single Sign-On (SSO), strategisches Onboarding und unlimitierte Systemressourcen.',
    b2b_sys3_price: 'ab CHF 50’000',
    b2b_sys3_renewal: 'SETUP INKL. 1. JAHR. AB JAHR 2: AB CHF 35’000/JAHR',
    b2b_sys3_seats: 'Inkl. 20 Governance-Lizenzen (+ CHF 780/Jahr pro Zusatzlizenz)',
    b2b_cta_request: 'Setup anfragen',
    b2b_vat: 'Alle B2B-Preise verstehen sich rein netto exkl. gesetzlicher MwSt.',

    // ROI Rechner
    roi_title: 'Berechne dein Sparpotenzial',
    roi_subtitle: 'Finde heraus, wie viele Arbeitsstunden und Budget Kreativ-Desk deinem Unternehmen jeden Monat spart.',
    roi_label_projects: 'Aktive Projekte pro Jahr',
    roi_label_hours: 'Verlorene Stunden pro Projekt/Woche durch Tool-Chaos',
    roi_label_rate: 'Stundensatz (CHF)',
    roi_result_title: 'Geschätzte jährliche Kostenersparnis',
    roi_disclaimer: 'Basierend auf automatisiertem Reporting, zentraler Planverteilung und wegfallenden Lizenz-Silos.',
    roi_cta: 'System-Demo anfragen',

    // SaaS Pricing
    saas_badge: 'Self-Service Tarife',
    saas_title: 'Einzellizenz-Abos für Spezialisten',
    saas_subtitle: 'Starte klein und skaliere flexibel nach Bedarf. Jederzeit monatlich kündbar.',
    saas_monthly: 'Monatlich',
    saas_yearly: 'Jährlich',
    saas_save_20: 'Spare 20%',
    saas_billed_yearly: 'jährlich abgerechnet',
    saas_vat: 'Alle SaaS-Preise exkl. gesetzlicher MwSt.',
    plan_starter: 'Starter', desc_starter: 'Für Freelancer zur simplen 2D-Planorganisation.',
    plan_pro: 'Pro', desc_pro: 'Für Bauleiter, die 3D BIM, KI-Pitch-Deck & Mängel benötigen.',
    plan_expert: 'Expert', desc_expert: 'Für Power-User, die Finanzen, QR-Rechnungen & APIs suchen.',
    f_proj_3: '3 Aktive Projekte',
    f_proj_unlimited: 'Unbegrenzte Projekte',
    f_2d_defects: '2D CAD Viewer & Mängel',
    f_3d: '3D BIM Viewer (IFC)',
    f_ai: 'KI-Concierge & Pitch-Deck Studio',
    f_mobile: 'Mobile Mängel-App (Live-Sync)',
    f_budget: 'Projekt-Budgets & Tracking',
    f_invoice: 'PDF-Offerten & Rechnungs-Studio',
    f_api: 'API & Webhooks (Zapier/Make)',
    f_brand: 'Eigenes Branding & Domain',
    f_storage_5: '5 GB Cloud Speicher',
    f_storage_50: '50 GB Cloud Speicher',
    f_storage_250: '250 GB Cloud Speicher',
    all_pro_features: 'Alles aus dem Pro-Plan',
    f_controlling: 'Zentrales Firmen-Dashboard (Controlling)',
    f_rbac: 'Rollenbasierte Zugriffsrechte (RBAC)',
    f_staff: 'Mitarbeiter-Verwaltung & Datenhoheit',
    f_tenant: 'Mandantenisolierte Serverstruktur',
    saas_cta_start: 'Jetzt starten',

    // FAQ (11 questions)
    faq_title: 'Häufig gestellte Fragen (FAQ)', faq_subtitle: 'Alles, was du über Kreativ-Desk wissen musst.',
    faq_1_q: 'Wie sicher sind meine Daten?', faq_1_a: 'Wir nutzen Enterprise-Grade Verschlüsselung. Deine Daten liegen auf sicheren Schweizer Servern und sind strikt mandantenisoliert.',
    faq_2_q: 'Trainiert die KI mit meinen Projektdaten?', faq_2_a: 'Nein. Unsere KI-Modelle verarbeiten deine Belege, Pläne und Dokumente strikt isoliert. Deine Daten werden niemals genutzt, um globale Modelle zu trainieren.',
    faq_3_q: 'Wie funktioniert der 3D BIM Viewer?', faq_3_a: 'Lade dein IFC- oder CAD-Modell hoch und navigiere flüssig im Browser durch die 3D-Architektur. Du kannst visuelle Prüfungen direkt im Team durchführen, ohne externe Software installieren zu müssen.',
    faq_4_q: 'Kann ich Offerten und Rechnungen direkt im System verwalten?', faq_4_a: 'Ja. Ab dem Expert-Plan erhältst du das volle Finanz-Studio. Erstelle mit wenigen Klicks professionelle Offerten und Rechnungen als PDF, behalte deine Einnahmen im Blick und verfolge dein Projektbudget in Echtzeit.',
    faq_5_q: 'Kann ich die App auf der Baustelle nutzen?', faq_5_a: 'Ja. Die Plattform ist voll responsiv und für mobile Geräte optimiert. Du kannst Mängel inklusive Fotos direkt auf der Baustelle in deinem mobilen Browser erfassen (Internetverbindung vorausgesetzt).',
    faq_6_q: 'Wie funktioniert das Pitch-Deck Studio?', faq_6_a: 'Das Pitch Deck Studio hilft dir, Projektdaten, Meilensteine und Finanz-Übersichten in professionelle PDFs zu exportieren. Erstelle im Handumdrehen saubere Kundenpräsentationen.',
    faq_7_q: 'Lässt sich Kreativ-Desk mit anderen Tools (Zapier) verbinden?', faq_7_a: 'Ja. Kreativ Desk verfügt über ein integriertes Smart CRM. Zudem kannst du als Expert-Nutzer Webhook-URLs (z.B. Zapier/Make) in den Einstellungen hinterlegen, um Daten an externe Tools weiterzuleiten.',
    faq_8_q: 'Wie kann ich mein Abo anpassen oder kündigen?', faq_8_a: 'Du kannst dein Abonnement jederzeit in den Einstellungen unter "Admin & Abrechnung" verwalten. Klicke auf "Stripe Portal öffnen", um dein Abo sicher über Stripe upzugraden, downzugraden oder zum Ende der Laufzeit zu kündigen.',
    faq_9_q: 'Was ist der genaue Unterschied zwischen Studio, Agency und Enterprise?', faq_9_a: 'Das Studio-Paket ist perfekt für Einzelprojekte, Agency steuert parallele Produktionen, Enterprise bietet tiefe Systemintegrationen. Alle B2B-Modelle beinhalten mandantenisolierte Server, garantierte SLAs und dedizierten Support, um sich klar von den Standard-SaaS-Plänen abzuheben.',
    faq_10_q: 'Wie sehen die Folgekosten für die B2B-Systeme (Studio / Agency / Enterprise) ab dem 2. Jahr aus?', faq_10_a: 'Der Preis im ersten Jahr beinhaltet das gesamte Setup und alle Team-Lizenzen. Ab dem zweiten Jahr entfällt die Setup-Gebühr komplett. Du zahlst nur noch eine reduzierte Flatrate: CHF 7’500/Jahr für Studio, CHF 19’500/Jahr für Agency bzw. ab CHF 35’000/Jahr für Enterprise. Bei Bedarf können jederzeit flexible Zusatzlizenzen für CHF 780 / Jahr pro Nutzer hinzugebucht werden.',
    faq_11_q: 'Verstehen sich die Preise inklusive oder exklusive Mehrwertsteuer?', faq_11_a: 'Alle auf der Plattform ausgewiesenen Preise – sowohl für die monatlichen Abos als auch für die großen B2B-Systeme – verstehen sich rein netto exklusive gesetzlicher Mehrwertsteuer (exkl. MwSt.).',

    // Help Center
    help_title: 'Hilfe-Center & Support',
    help_subtitle: 'Hast du Fragen zur Implementierung, unseren B2B-Modellen oder technischen Integrationen? Unser Schweizer Entwicklerteam und der KI-Concierge sind für dich da.',
    help_search_placeholder: 'Themen suchen oder Frage stellen (z.B. BIM, Folgejahr, RBAC, Lizenzen)...',
    help_t1_title: 'Lizenzen & Abrechnung',
    help_t1_desc: 'Verstehe, wie die Setup-Kosten im 2. Jahr zu einer Flatrate schmelzen, Lizenzen verwaltet werden und MwSt. abgerechnet wird.',
    help_t1_cta: 'Preise ansehen',
    help_t2_title: 'BIM & 3D-Viewer',
    help_t2_desc: 'Erfahre, wie du IFC-Modelle hochlädst, automatische KI-Kollisionstests durchführst und deine Datenhoheit sicherst.',
    help_t2_cta: 'Features entdecken',
    help_t3_title: 'Rollen & RBAC',
    help_t3_desc: 'Richte individuelle Workspaces, mandantenisolierte Server und granulare Berechtigungen für sensible Daten ein.',
    help_t3_cta: 'Sicherheits-Guide lesen',
    help_t4_title: 'Persönlicher Support',
    help_t4_desc: 'Direkter Draht zu Schweizer Software-Engineers für individuelle Webhooks (Zapier/Make) und Workshops.',
    help_t4_cta: 'Support kontaktieren',
    help_no_results: 'Keine statischen Themen gefunden. Frage direkt unseren intelligenten KI-Concierge unten!',

    // AI Concierge
    ai_ask_btn: 'KI-Concierge fragen',
    ai_suggested_label: 'Häufige Fragen an die KI:',
    ai_q1: 'Wie hoch sind die Folgekosten ab Jahr 2?',
    ai_q2: 'Was kostet eine Zusatzlizenz bei z.B. 7 Nutzern?',
    ai_q3: 'Welche 3D-BIM Formate (IFC) werden unterstützt?',
    ai_q4: 'Wie funktioniert die Schweizer Datenhoheit?',
    ai_generating: 'KI-Concierge analysiert & formuliert Antwort...',
    ai_badge: 'Offizieller Schweizer KI-Concierge (Gemini 2.5)',
    ai_copy: 'Kopieren',
    ai_copied: 'Kopiert!',
    ai_clear: 'Schliessen',

    footer_desc: 'Das Betriebssystem für Projekte, die funktionieren müssen.', footer_made: 'Entwickelt in der Schweiz.', footer_product: 'Produkt', footer_legal: 'Rechtliches', footer_privacy: 'Datenschutz', footer_imprint: 'Impressum', footer_tos: 'AGB'
  }
};

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery')) {
      navigate('/reset-password' + window.location.hash + window.location.search);
    }
  }, [navigate]);

  const [isYearly, setIsYearly] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [helpSearch, setHelpSearch] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // AI Concierge States
  const [aiAnswer, setAiAnswer] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiCopied, setAiCopied] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

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

  // Mobile Carousel Slide & Swipe Gestures
  const [mobileSlide, setMobileSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 40;
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      setMobileSlide(prev => (prev < 3 ? prev + 1 : 0));
    } else if (distance < -minSwipeDistance) {
      setMobileSlide(prev => (prev > 0 ? prev - 1 : 3));
    }
  };

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

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  // AI Concierge Question Handler
  const handleAskAI = async (customQuery?: string) => {
    const query = (customQuery || helpSearch).trim();
    if (!query) return;
    
    setIsAiLoading(true);
    setAiAnswer('');
    
    try {
      const prompt = `Du bist der offizielle KI-Assistent von Kreativ-Desk OS (kreativdesk.ch), dem Schweizer Projekt- und Betriebssystem für Architektur, Bau, Agenturen und Generalplanung.

Offizielle Fakten & Wirtschaftliche Logik von Kreativ-Desk:
- SaaS Einzelabos: 
  * Starter: CHF 35/Mo (jährlich abgerechnet) / CHF 39/Mo (monatlich) - 3 Projekte, 2D CAD & Mängel, Budgets, 5 GB Speicher.
  * Pro: CHF 65/Mo (jährlich abgerechnet) / CHF 79/Mo (monatlich) - Unbegrenzte Projekte, 3D BIM Viewer (IFC), KI-Concierge, Mobile Mängel-App, 50 GB Speicher.
  * Expert: CHF 159/Mo (jährlich abgerechnet) / CHF 189/Mo (monatlich) - Alles aus Pro + PDF-Offerten & Rechnungs-Studio, API & Webhooks, Eigenes Branding, 250 GB Speicher.
- B2B Projekt-Systeme (Kreativ-Desk OS):
  * Studio OS: ab CHF 15'000 im 1. Jahr (Setup-Gebühr inkl. 1. Jahr) | Ab Jahr 2: CHF 7'500 / Jahr Flatrate | Inkl. 5 Governance-Lizenzen.
  * Agency OS (Execution Booster): CHF 25'000 im 1. Jahr (Setup-Gebühr inkl. 1. Jahr) | Ab Jahr 2: CHF 19'500 / Jahr Flatrate | Inkl. 10 Governance-Lizenzen.
  * Enterprise OS: ab CHF 50'000 im 1. Jahr (Setup-Gebühr inkl. 1. Jahr) | Ab Jahr 2: ab CHF 35'000 / Jahr Flatrate | Inkl. 20 Governance-Lizenzen.
- Zusatzlizenzen: Jede zusätzliche Governance-Lizenz kostet exakt CHF 780 / Jahr (CHF 65 / Monat). (Beispiel: 7 Lizenzen im Studio OS = CHF 15'000 + 2 × CHF 780 = CHF 16'560 im 1. Jahr; ab Jahr 2 CHF 7'500 + CHF 1'560 = CHF 9'060/Jahr).
- Alle Preise sind exkl. MwSt. (netto).
- Architektur & Sicherheit: 100% mandantenisoliert, sichere Schweizer Server (Datenhaltung & Infrastruktur in der Schweiz), Schweizer Entwicklerteam, Revisionssicherheit, RBAC-Rollenmanagement (Owner, GL, Projektleiter, Mitarbeiter), DSGVO & Schweizer Datenschutz (DSG). Kundendaten werden niemals für KI-Training verwendet.
- Technische Features: Nativer 3D IFC Viewer direkt im Browser (kein Plugin), automatische KI-Kollisionsprüfung, Live-Sync Baustellen-App, QR-Rechnungen, Whiteboard & Pitch Deck Studio.

Frage des Interessenten: "${query}"

Beantworte die Frage präzise, professionell, klar formuliert, strukturiert und freundlich. Formatiere wichtige Zahlen und Begriffe fett. Antworte in der Sprache der Anfrage (${currentLang === 'de' ? 'Deutsch' : 'Englisch'}).`;

      const res = await callGeminiAPI('gemini-2.5-flash', [{ text: prompt }]);
      const text = typeof res === 'string' ? res : (res?.text || res?.candidates?.[0]?.content?.parts?.[0]?.text || 'Keine Antwort erhalten.');
      setAiAnswer(text);
    } catch (err: any) {
      console.error("AI Concierge error:", err);
      setAiAnswer(currentLang === 'de' 
        ? "Entschuldigung, der KI-Concierge ist im Moment kurz ausgelastet. Bitte stelle deine Frage erneut oder wähle eines der Themen oben."
        : "Sorry, the AI Concierge is temporarily busy. Please ask again or select one of the topics above.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCopyAnswer = () => {
    if (!aiAnswer) return;
    navigator.clipboard.writeText(aiAnswer);
    setAiCopied(true);
    setTimeout(() => setAiCopied(false), 2000);
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

  const helpTopics = [
    {
      id: 'licenses',
      title: t('help_t1_title'),
      desc: t('help_t1_desc'),
      cta: t('help_t1_cta'),
      icon: <Briefcase className="w-6 h-6 text-blue-500" />,
      action: () => scrollTo('pricing')
    },
    {
      id: 'bim',
      title: t('help_t2_title'),
      desc: t('help_t2_desc'),
      cta: t('help_t2_cta'),
      icon: <Layers className="w-6 h-6 text-blue-500" />,
      action: () => scrollTo('live-demo')
    },
    {
      id: 'rbac',
      title: t('help_t3_title'),
      desc: t('help_t3_desc'),
      cta: t('help_t3_cta'),
      icon: <Shield className="w-6 h-6 text-blue-500" />,
      action: () => scrollTo('infrastructure')
    }
  ];

  const filteredHelpTopics = helpTopics.filter(topic => 
    topic.title.toLowerCase().includes(helpSearch.toLowerCase()) ||
    topic.desc.toLowerCase().includes(helpSearch.toLowerCase())
  );

  const saasPlans = [
    {
      name: t('plan_starter'),
      price: isYearly ? 35 : 39,
      icon: <Building2 className="w-6 h-6 text-zinc-400" />,
      description: t('desc_starter'),
      features: [t('f_proj_3'), t('f_2d_defects'), t('f_budget'), t('f_storage_5')],
      notIncluded: [
        t('f_3d'), t('f_ai'), t('f_mobile'), t('f_invoice'), t('f_api'),
        t('f_controlling'), t('f_rbac'), t('f_staff'), t('f_tenant')
      ],
      popular: false
    },
    {
      name: t('plan_pro'),
      price: isYearly ? 65 : 79,
      icon: <Zap className="w-6 h-6 text-blue-500" />,
      description: t('desc_pro'),
      features: [t('f_proj_unlimited'), t('f_3d'), t('f_ai'), t('f_mobile'), t('f_budget'), t('f_storage_50')],
      notIncluded: [
        t('f_invoice'), t('f_api'), t('f_brand'),
        t('f_controlling'), t('f_rbac'), t('f_staff'), t('f_tenant')
      ],
      popular: true
    },
    {
      name: t('plan_expert'),
      price: isYearly ? 159 : 189, 
      icon: <Layers className="w-6 h-6 text-emerald-500" />,
      description: t('desc_expert'),
      features: [t('f_proj_unlimited'), t('all_pro_features'), t('f_invoice'), t('f_api'), t('f_brand'), t('f_storage_250')],
      notIncluded: [
        t('f_controlling'), t('f_rbac'), t('f_staff'), t('f_tenant')
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-blue-500/30 overflow-x-hidden font-sans">
      
      {/* HEADER */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-6 py-3 sm:py-4",
        scrolled ? "bg-surface/80 backdrop-blur-md border-b border-border shadow-sm" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white text-base sm:text-lg shadow-lg shadow-blue-500/20 shrink-0">
              K
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-text-primary to-text-muted bg-clip-text text-transparent whitespace-nowrap select-none">
              Kreativ Desk
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-text-muted">
            <button onClick={() => scrollTo('infrastructure')} className="hover:text-blue-500 transition-colors">Infrastruktur</button>
            <button onClick={() => scrollTo('systems')} className="hover:text-blue-500 transition-colors">{t('nav_systems')}</button>
            <button onClick={() => scrollTo('pricing')} className="hover:text-blue-500 transition-colors">{t('nav_selfservice')}</button>
            <button onClick={() => scrollTo('roi')} className="hover:text-blue-500 transition-colors">{t('nav_roi')}</button>
            <button onClick={() => scrollTo('faq')} className="hover:text-blue-500 transition-colors">{t('nav_faq')}</button>
            <button onClick={() => scrollTo('help-center')} className="hover:text-blue-500 transition-colors">{t('nav_help')}</button>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button 
              onClick={handleLanguageToggle} 
              className="px-2 sm:px-2.5 py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-surface transition-colors"
            >
              {currentLang.toUpperCase()}
            </button>
            <button 
              onClick={toggleTheme} 
              className="p-1.5 sm:p-2 rounded-lg border border-border text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {deferredPrompt && (
              <button 
                onClick={handleInstallClick} 
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600/10 border border-blue-500/30 text-blue-500 text-xs font-bold rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
              >
                App installieren
              </button>
            )}
            <button 
              onClick={() => navigate('/login')} 
              className="hidden sm:block text-sm font-bold text-text-muted hover:text-text-primary px-3 py-2 transition-colors"
            >
              {t('nav_login')}
            </button>
            <button 
              onClick={() => navigate('/signup')} 
              className="hidden sm:inline-flex px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-600/20 transition-all active:scale-95 whitespace-nowrap"
            >
              {t('nav_start')}
            </button>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="md:hidden p-1.5 sm:p-2 text-text-muted hover:text-text-primary rounded-lg border border-border sm:border-transparent hover:bg-surface transition-colors"
              aria-label="Menü öffnen"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[56px] sm:top-[68px] bg-surface/98 backdrop-blur-xl border-b border-border p-5 sm:p-6 z-40 md:hidden shadow-2xl max-h-[calc(100dvh-56px)] overflow-y-auto"
          >
             <div className="flex flex-col gap-3 text-base font-semibold">
                <button onClick={() => scrollTo('infrastructure')} className="text-left py-2 hover:text-blue-500 transition-colors">Infrastruktur</button>
                <button onClick={() => scrollTo('systems')} className="text-left py-2 hover:text-blue-500 transition-colors">{t('nav_systems')}</button>
                <button onClick={() => scrollTo('pricing')} className="text-left py-2 hover:text-blue-500 transition-colors">{t('nav_selfservice')}</button>
                <button onClick={() => scrollTo('roi')} className="text-left py-2 hover:text-blue-500 transition-colors">{t('nav_roi')}</button>
                <button onClick={() => scrollTo('faq')} className="text-left py-2 hover:text-blue-500 transition-colors">{t('nav_faq')}</button>
                <button onClick={() => scrollTo('help-center')} className="text-left py-2 hover:text-blue-500 transition-colors">{t('nav_help')}</button>
                <hr className="border-border my-1" />
                <button onClick={() => { setIsMenuOpen(false); navigate('/login'); }} className="py-2.5 bg-surface border border-border text-center rounded-xl font-bold hover:bg-white/5 transition-colors">{t('nav_login')}</button>
                <button onClick={() => { setIsMenuOpen(false); navigate('/signup'); }} className="py-3 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all">{t('nav_start')}</button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* HERO */}
        <section className="pt-48 pb-20 px-6 text-center relative z-10">
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
            
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[1.1] text-slate-900 dark:text-white">
              {t('hero_title1')}<br/>{t('hero_title2')}
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl xl:text-2xl text-slate-600 dark:text-zinc-300 font-medium mb-4 max-w-3xl mx-auto leading-relaxed">
              {t('hero_subtitle')}
            </motion.p>
            
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-sm font-semibold text-amber-700 dark:text-orange-400 mb-12 max-w-2xl mx-auto border border-amber-500/30 dark:border-orange-500/20 bg-amber-500/10 dark:bg-orange-500/5 px-4 py-3 rounded-xl">
              {t('hero_beta_disclaimer')}
            </motion.p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => scrollTo('live-demo')} className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer">
                {t('cta_primary')} <ArrowRight size={20} />
              </button>
              <button onClick={() => scrollTo('systems')} className="w-full sm:w-auto px-8 py-4 bg-surface border border-border text-text-primary rounded-2xl font-bold text-lg hover:bg-white/5 transition-all cursor-pointer">
                {t('cta_secondary')}
              </button>
            </div>
          </div>
        </section>

        {/* 1. STATUS QUO VS SINGLE SOURCE OF TRUTH */}
        <section className="py-16 px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              
              {/* Links: Chaos / Tool-Wildwuchs */}
              <div className="p-6 sm:p-8 md:p-10 bg-gradient-to-br from-red-950/20 via-surface to-background border border-red-500/30 rounded-3xl sm:rounded-[2.5rem] shadow-xl flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-wider mb-6">
                    <AlertTriangle size={14} /> {t('chaos_badge')}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-red-500 mb-4 tracking-tight">
                    {t('chaos_title')}
                  </h3>
                  <p className="text-text-muted text-sm sm:text-base leading-relaxed mb-6">
                    {t('chaos_desc')}
                  </p>

                  {/* 3 Pain-Points Badges */}
                  <div className="space-y-3 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-surface border border-red-500/20 rounded-xl text-xs font-semibold text-text-muted shadow-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileSpreadsheet className="text-red-400 shrink-0" size={16} />
                        <span className="truncate">{t('chaos_b1')}</span>
                      </div>
                      <span className="text-[10px] bg-red-500/15 text-red-400 px-2 py-0.5 rounded font-bold shrink-0 self-start sm:self-auto">{t('chaos_b1_tag')}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-surface border border-red-500/20 rounded-xl text-xs font-semibold text-text-muted shadow-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <Server className="text-orange-400 shrink-0" size={16} />
                        <span className="truncate">{t('chaos_b2')}</span>
                      </div>
                      <span className="text-[10px] bg-orange-500/15 text-orange-400 px-2 py-0.5 rounded font-bold shrink-0 self-start sm:self-auto">{t('chaos_b2_tag')}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-surface border border-red-500/20 rounded-xl text-xs font-semibold text-text-muted shadow-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <MessageSquare className="text-purple-400 shrink-0" size={16} />
                        <span className="truncate">{t('chaos_b3')}</span>
                      </div>
                      <span className="text-[10px] bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded font-bold shrink-0 self-start sm:self-auto">{t('chaos_b3_tag')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rechts: Single Source of Truth */}
              <div className="p-6 sm:p-8 md:p-10 bg-gradient-to-br from-blue-950/20 via-surface to-background border border-blue-500/40 rounded-3xl sm:rounded-[2.5rem] shadow-2xl flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
                    <Database size={14} /> Revisionssicher
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-text-primary mb-4 tracking-tight">
                    {t('ssot_title')}
                  </h3>
                  <p className="text-text-muted text-sm sm:text-base leading-relaxed mb-6">
                    {t('ssot_desc')}
                  </p>

                  {/* 3 High-Impact USP Badges */}
                  <div className="space-y-3 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl text-xs font-semibold text-text-primary shadow-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <Shield className="text-blue-400 shrink-0" size={16} />
                        <span className="truncate">{t('ssot_p1')}</span>
                      </div>
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-bold shrink-0 self-start sm:self-auto">{t('ssot_p1_tag')}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl text-xs font-semibold text-text-primary shadow-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <Zap className="text-amber-400 shrink-0" size={16} />
                        <span className="truncate">{t('ssot_p2')}</span>
                      </div>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold shrink-0 self-start sm:self-auto">{t('ssot_p2_tag')}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl text-xs font-semibold text-text-primary shadow-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <Layers className="text-emerald-400 shrink-0" size={16} />
                        <span className="truncate">{t('ssot_p3')}</span>
                      </div>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold shrink-0 self-start sm:self-auto">{t('ssot_p3_tag')}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center gap-4 sm:gap-5">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30 animate-pulse">
                    <Database size={24} className="sm:w-7 sm:h-7" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-sm sm:text-base text-text-primary mb-0.5 truncate">
                      100% Single Source of Truth
                    </div>
                    <div className="text-xs text-blue-400 font-semibold truncate">
                      {t('ssot_badge')}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 2. WARUM OS-INFRASTRUKTUR (4 SÄULEN) */}
        <section id="infrastructure" className="py-24 px-6 bg-surface/30 border-y border-border">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold uppercase tracking-wider mb-4">
                <Shield size={14} /> {t('infra_badge')}
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">{t('infra_title')}</h2>
              <p className="text-lg text-text-muted font-medium max-w-2xl mx-auto">{t('infra_subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Säule 1 */}
              <div className="p-8 bg-surface border border-border hover:border-blue-500/40 rounded-3xl transition-all group shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Calculator size={24} />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3">{t('infra_p1_title')}</h3>
                <p className="text-text-muted text-sm sm:text-base leading-relaxed">{t('infra_p1_desc')}</p>
              </div>

              {/* Säule 2 */}
              <div className="p-8 bg-surface border border-border hover:border-blue-500/40 rounded-3xl transition-all group shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield size={24} />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3">{t('infra_p2_title')}</h3>
                <p className="text-text-muted text-sm sm:text-base leading-relaxed">{t('infra_p2_desc')}</p>
              </div>

              {/* Säule 3 */}
              <div className="p-8 bg-surface border border-border hover:border-blue-500/40 rounded-3xl transition-all group shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users size={24} />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3">{t('infra_p3_title')}</h3>
                <p className="text-text-muted text-sm sm:text-base leading-relaxed">{t('infra_p3_desc')}</p>
              </div>

              {/* Säule 4 */}
              <div className="p-8 bg-surface border border-border hover:border-blue-500/40 rounded-3xl transition-all group shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Box size={24} />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3">{t('infra_p4_title')}</h3>
                <p className="text-text-muted text-sm sm:text-base leading-relaxed">{t('infra_p4_desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* LIVE DEMO (MACBOOK PRO & IPHONE SHOWCASE) */}
        <section id="live-demo" className="py-20 px-4 sm:px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            
            {/* Desktop MacBook Pro Presentation Frame */}
            <div className="hidden lg:block">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold uppercase tracking-wider mb-4">
                  <MonitorPlay size={14} /> Interactive Live Environment
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">{t('demo_title')}</h2>
                <p className="text-text-muted text-lg max-w-2xl mx-auto">{t('demo_subtitle')}</p>
              </div>

              {/* MacBook Pro Casing */}
              <div className="relative max-w-6xl mx-auto">
                {/* Glow behind screen */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-96 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl pointer-events-none -z-10" />

                {/* Display Lid Frame (CNC Aluminum & Dark Bezel) */}
                <div className="relative bg-[#090a0d] rounded-t-[30px] border-[4px] border-b-0 border-[#23242c] ring-1 ring-white/20 dark:ring-white/10 shadow-[0_-25px_60px_-15px_rgba(0,0,0,0.6)] pt-3.5 px-3.5 sm:pt-4 sm:px-4">
                  
                  {/* Apple Notch & FaceTime HD Camera */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-36 bg-[#090a0d] rounded-b-xl flex items-center justify-center gap-2.5 border-b border-x border-white/5 z-30 shadow-md">
                    {/* Camera Lens */}
                    <div className="w-2.5 h-2.5 rounded-full bg-[#050608] ring-1 ring-zinc-700/80 flex items-center justify-center shadow-inner">
                      <div className="w-1 h-1 rounded-full bg-blue-500/80 shadow-[0_0_4px_rgba(59,130,246,0.8)]" />
                    </div>
                    {/* Green Camera Indicator LED */}
                    <div className="w-1 h-1 rounded-full bg-emerald-400/90 shadow-[0_0_3px_rgba(52,211,153,0.9)] animate-pulse" />
                    {/* Ambient Light Sensor */}
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 ring-1 ring-zinc-800" />
                  </div>

                  {/* Inner Screen Display (Liquid Retina XDR) */}
                  <div className="h-[730px] w-full rounded-t-[18px] overflow-hidden bg-background relative border border-border/30 shadow-inner group">
                    <Suspense fallback={
                      <div className="h-full w-full flex items-center justify-center bg-background">
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                      </div>
                    }>
                      <DemoLayout isDemoMode={true} />
                    </Suspense>

                    {/* Subtle Anti-Reflective Glass Sheen (Subtle Diagonal Gloss) */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/[0.03] z-20" />
                  </div>
                </div>

                {/* MacBook Hinge Assembly & Base Chassis */}
                <div className="relative z-20">
                  {/* Cylindrical Pivot Hinge with Engraved Model Name */}
                  <div className="h-3.5 bg-gradient-to-b from-[#0a0b0e] via-[#1a1b22] to-[#0e0f13] border-t border-white/10 border-b border-black flex items-center justify-center">
                    <span className="text-[9px] font-semibold tracking-[0.28em] text-zinc-500 uppercase select-none opacity-80 scale-90">
                      MacBook Pro
                    </span>
                  </div>
                  
                  {/* Anodized Aluminum Keyboard Deck / Lower Chassis */}
                  <div className="w-[104%] -ml-[2%] h-5 sm:h-5.5 bg-gradient-to-b from-[#3a3c48] via-[#282933] to-[#15161c] dark:from-[#2c2d38] dark:via-[#1e1f28] dark:to-[#101116] rounded-b-[20px] sm:rounded-b-[26px] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.65)] border-t border-white/35 relative flex items-start justify-center overflow-hidden">
                    {/* Precision CNC Machined Thumb Recess */}
                    <div className="w-32 sm:w-44 h-2.5 sm:h-3 bg-[#08090c] rounded-b-xl border-t border-black/90 shadow-inner flex items-center justify-center">
                      <div className="w-20 sm:w-28 h-0.5 bg-zinc-800/60 rounded-full" />
                    </div>
                  </div>

                  {/* Rubber Feet under the left & right corners */}
                  <div className="w-[96%] -ml-[-2%] flex justify-between px-6 -mt-1 pointer-events-none">
                    <div className="w-10 h-1 bg-black/80 rounded-full shadow" />
                    <div className="w-10 h-1 bg-black/80 rounded-full shadow" />
                  </div>
                  
                  {/* Realistic Multi-Layer Desk Shadows */}
                  <div className="w-[94%] mx-auto h-2 bg-black/50 blur-sm rounded-full -mt-0.5" />
                  <div className="w-[88%] mx-auto h-5 bg-black/25 dark:bg-black/50 blur-xl rounded-full" />
                </div>
              </div>
            </div>

            {/* Mobile iPhone Showcase */}
            <div className="lg:hidden">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold uppercase tracking-wider mb-3">
                  <Sparkles size={14} /> Mobile Experience
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">{t('demo_title')}</h2>
                <p className="text-text-muted text-xs sm:text-sm max-w-sm mx-auto">{t('demo_subtitle_mobile')}</p>
              </div>

              {/* iPhone 16 Pro Device Frame Container */}
              <div className="relative max-w-[340px] xs:max-w-[360px] mx-auto select-none">
                
                {/* Subtle Ambient Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

                {/* Outer Titanium Chassis */}
                <div className="relative bg-[#16171d] dark:bg-[#0b0c10] rounded-[48px] sm:rounded-[52px] p-[10px] sm:p-[11px] border-[3.5px] border-[#363842] dark:border-[#1f2129] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6),0_0_35px_rgba(59,130,246,0.12)] ring-1 ring-white/20 dark:ring-white/10">
                  
                  {/* Left Hardware Buttons (Action Button & Volume Keys) */}
                  <div className="absolute -left-[6px] top-24 w-[3.5px] h-7 bg-[#484a58] dark:bg-[#282a35] rounded-l-sm shadow-sm" />
                  <div className="absolute -left-[6px] top-36 w-[3.5px] h-12 bg-[#484a58] dark:bg-[#282a35] rounded-l-sm shadow-sm" />
                  <div className="absolute -left-[6px] top-52 w-[3.5px] h-12 bg-[#484a58] dark:bg-[#282a35] rounded-l-sm shadow-sm" />

                  {/* Right Hardware Button (Power Key) */}
                  <div className="absolute -right-[6px] top-32 w-[3.5px] h-16 bg-[#484a58] dark:bg-[#282a35] rounded-r-sm shadow-sm" />

                  {/* Inner Screen Display (Fixed Proportions) */}
                  <div 
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className="relative w-full h-[580px] xs:h-[610px] rounded-[38px] sm:rounded-[42px] overflow-hidden bg-background border border-border/40 flex flex-col justify-between shadow-inner"
                  >
                    
                    {/* iOS Status Bar & Dynamic Island */}
                    <div className="pt-2.5 px-6 pb-1 flex items-center justify-between z-30 shrink-0 bg-background/80 backdrop-blur-md border-b border-border/20">
                      {/* Left: Clock */}
                      <span className="text-[11px] font-bold text-text-primary tracking-tight font-mono">09:41</span>

                      {/* Center: Dynamic Island */}
                      <div className="w-24 xs:w-26 h-5.5 bg-black rounded-full flex items-center justify-between px-2.5 border border-zinc-800/80 shadow-md">
                        {/* Camera Lens */}
                        <div className="w-2.5 h-2.5 rounded-full bg-[#050608] ring-1 ring-zinc-700/80 flex items-center justify-center shadow-inner">
                          <div className="w-1 h-1 rounded-full bg-blue-900 shadow-[0_0_2px_rgba(59,130,246,0.8)]" />
                        </div>
                        {/* Status Green LED */}
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      </div>

                      {/* Right: Icons (Signal, WiFi, Battery) */}
                      <div className="flex items-center gap-1.5 text-text-primary">
                        <div className="flex items-end gap-[1px] h-2.5">
                          <div className="w-[2px] h-1 bg-current rounded-xs" />
                          <div className="w-[2px] h-1.5 bg-current rounded-xs" />
                          <div className="w-[2px] h-2 bg-current rounded-xs" />
                          <div className="w-[2px] h-2.5 bg-current rounded-xs" />
                        </div>
                        <Wifi size={11} className="stroke-[2.5]" />
                        <div className="w-4.5 h-2.5 border border-current rounded-[3px] p-[1px] flex items-center">
                          <div className="w-full h-full bg-current rounded-[1px]" />
                        </div>
                      </div>
                    </div>

                    {/* App Internal Segmented Tabs Header */}
                    <div className="px-3 pt-2 pb-1.5 bg-surface/60 border-b border-border/40 shrink-0">
                      <div className="flex items-center justify-between gap-1 bg-background/80 p-1 rounded-xl border border-border/60">
                        {[
                          { id: 0, label: t('mobile_tab_budget'), icon: Calculator },
                          { id: 1, label: t('mobile_tab_bim'), icon: Box },
                          { id: 2, label: t('mobile_tab_defects'), icon: CheckCircle2 },
                          { id: 3, label: t('mobile_tab_pitch'), icon: Presentation }
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setMobileSlide(tab.id)}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer",
                              mobileSlide === tab.id
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-text-muted hover:text-text-primary hover:bg-surface"
                            )}
                          >
                            <tab.icon size={11} />
                            <span className="truncate">{tab.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Carousel Slides Container */}
                    <div className="flex-1 overflow-hidden p-3.5 flex flex-col justify-center relative">
                      <AnimatePresence mode="wait">
                        
                        {/* SLIDE 0: SMARTES BUDGETING */}
                        {mobileSlide === 0 && (
                          <motion.div
                            key="slide-budget"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="h-full flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                    <Calculator size={14} />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-xs leading-tight">{t('card1_title')}</h3>
                                    <p className="text-[10px] text-text-muted">{t('card1_desc')}</p>
                                  </div>
                                </div>
                                <span className="text-[9px] font-bold px-2 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full">
                                  {t('mobile_tolerance_ok')}
                                </span>
                              </div>

                              {/* Big KPI Box */}
                              <div className="p-3 bg-surface border border-border rounded-xl shadow-xs mb-3 text-center">
                                <span className="text-[10px] font-medium text-text-muted block">{t('card1_total')}</span>
                                <div className="text-xl font-black text-blue-500 tracking-tight my-0.5">
                                  CHF {(budgetSlider * 4500).toLocaleString('de-CH')}
                                </div>
                                <div className="flex items-center justify-center gap-1.5 text-[9px] text-emerald-500 font-bold">
                                  <Check size={10} /> 100% SIA 102/112 Soll-Ist
                                </div>
                              </div>

                              {/* Interactive Slider */}
                              <div className="space-y-1.5 bg-surface/50 p-2.5 rounded-xl border border-border/70 mb-3">
                                <div className="flex justify-between text-[11px] font-bold">
                                  <span className="text-text-primary">{t('card1_label')}</span>
                                  <span className="text-blue-500 bg-blue-500/10 px-1.5 py-0.2 rounded font-mono">{budgetSlider}%</span>
                                </div>
                                <input 
                                  type="range" 
                                  min="10" 
                                  max="100" 
                                  value={budgetSlider} 
                                  onChange={(e) => setBudgetSlider(Number(e.target.value))} 
                                  className="w-full accent-blue-500 h-1.5 cursor-pointer" 
                                />
                              </div>

                              {/* Mini BKP Breakdown */}
                              <div className="space-y-1.5 text-[10px]">
                                <div className="flex items-center justify-between text-text-muted">
                                  <span>{t('mobile_bkp_raw')} (45%)</span>
                                  <span className="font-semibold text-text-primary">CHF {((budgetSlider * 4500) * 0.45).toLocaleString('de-CH', { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }} />
                                </div>

                                <div className="flex items-center justify-between text-text-muted pt-0.5">
                                  <span>{t('mobile_bkp_finish')} (35%)</span>
                                  <span className="font-semibold text-text-primary">CHF {((budgetSlider * 4500) * 0.35).toLocaleString('de-CH', { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '35%' }} />
                                </div>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[9px] text-text-muted">
                              <span>Revisionssicher synchronisiert</span>
                              <span className="text-blue-500 font-bold">Live DB</span>
                            </div>
                          </motion.div>
                        )}

                        {/* SLIDE 1: 3D BIM & KI-AUDIT */}
                        {mobileSlide === 1 && (
                          <motion.div
                            key="slide-bim"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="h-full flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                                    <Box size={14} />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-xs leading-tight">{t('card2_title')}</h3>
                                    <p className="text-[10px] text-text-muted">{t('card2_desc')}</p>
                                  </div>
                                </div>
                                <span className="text-[9px] font-bold px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full">
                                  IFC 4.3
                                </span>
                              </div>

                              {/* 3D Wireframe Simulation Box */}
                              <div className="relative h-28 bg-[#090a0f] border border-purple-500/30 rounded-xl overflow-hidden mb-2.5 flex items-center justify-center p-2 group shadow-inner">
                                {/* Grid lines background */}
                                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:12px_12px]" />
                                
                                {/* Simulated Isometric Building Mesh */}
                                <div className="relative z-10 flex flex-col items-center">
                                  <div className="w-14 h-11 border-2 border-purple-400/60 rounded-md bg-purple-500/10 transform rotate-[-8deg] flex items-center justify-center shadow-lg shadow-purple-500/20">
                                    <Layers size={18} className="text-purple-400 animate-pulse" />
                                  </div>
                                  <span className="text-[8px] font-mono text-purple-300 mt-1 font-bold">BIM_MODEL_Q3.IFC</span>
                                </div>

                                {/* Laser Scan Beam Animation */}
                                {auditState === 'scanning' && (
                                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_12px_#a855f7] animate-[bounce_1.5s_infinite] z-20" />
                                )}

                                <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-black/70 rounded text-[8px] font-mono text-purple-400 border border-purple-500/30">
                                  {auditState === 'scanning' ? 'AUDIT RUNNING' : (auditState === 'done' ? 'AUDIT PASSED' : 'READY')}
                                </div>
                              </div>

                              {/* Action Button */}
                              <button 
                                onClick={runAIAudit} 
                                disabled={auditState === 'scanning'} 
                                className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer mb-2 active:scale-98"
                              >
                                {auditState === 'scanning' ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                                {auditState === 'scanning' ? t('card2_scanning') : t('card2_btn_scan')}
                              </button>

                              {/* Audit Output Result Details */}
                              <div className="space-y-1 bg-surface/50 p-2 rounded-xl border border-border/70 text-[10px]">
                                {auditState === 'done' ? (
                                  <>
                                    <div className="text-emerald-500 font-bold flex items-center gap-1">
                                      <CheckCircle2 size={12} /> {t('card2_safe')}
                                    </div>
                                    <div className="text-text-muted flex items-center gap-1 text-[9px]">
                                      <Check size={10} className="text-emerald-500" /> Brandschutz T30 & Fluchtwege verifiziert
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-text-muted flex items-center gap-1 text-[9px]">
                                    <Sparkles size={10} className="text-purple-400" /> Erkennt Geometrie- & Leitungs-Kollisionen
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[9px] text-text-muted">
                              <span>Native WebGL/WebGPU Engine</span>
                              <span className="text-purple-400 font-bold">Zero Plugins</span>
                            </div>
                          </motion.div>
                        )}

                        {/* SLIDE 2: BAUSTELLEN-APP */}
                        {mobileSlide === 2 && (
                          <motion.div
                            key="slide-defects"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="h-full flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                    <CheckCircle2 size={14} />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-xs leading-tight">{t('card3_title')}</h3>
                                    <p className="text-[10px] text-text-muted">{t('card3_desc')}</p>
                                  </div>
                                </div>
                                <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  {t('mobile_sync_active')}
                                </span>
                              </div>

                              {/* Interactive Defect List */}
                              <div className="space-y-1.5 mb-2.5">
                                {defects.map(d => (
                                  <div 
                                    key={d.id} 
                                    onClick={() => toggleDefect(d.id)} 
                                    className={cn(
                                      "flex items-center justify-between p-2 rounded-xl text-[11px] cursor-pointer transition-all border",
                                      d.done 
                                        ? "bg-emerald-500/5 border-emerald-500/30 text-text-muted" 
                                        : "bg-surface border-border hover:border-text-muted text-text-primary shadow-xs"
                                    )}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className={cn(
                                        "w-4 h-4 rounded-md flex items-center justify-center border transition-all shrink-0", 
                                        d.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-border bg-background"
                                      )}>
                                        {d.done && <Check size={11} />}
                                      </div>
                                      <span className={cn("truncate font-medium", d.done && "line-through opacity-70")}>
                                        {t(d.text)}
                                      </span>
                                    </div>
                                    <span className="text-[9px] text-text-muted px-1.5 py-0.5 bg-background rounded font-mono shrink-0 ml-1">
                                      {d.id === 1 ? 'Foto' : (d.id === 2 ? 'Plan' : 'Text')}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              {/* Defect Summary Card */}
                              <div className="p-2 bg-surface/60 border border-border/70 rounded-xl text-center">
                                <div className="text-[10px] text-text-muted mb-1">
                                  <strong className="text-emerald-500">{defects.filter(d => d.done).length}</strong> von <strong>{defects.length}</strong> {t('mobile_defects_done')}
                                </div>
                                <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-emerald-500 transition-all duration-300"
                                    style={{ width: `${(defects.filter(d => d.done).length / defects.length) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[9px] text-text-muted">
                              <span>PWA mit IndexedDB Offline-Speicher</span>
                              <span className="text-emerald-500 font-bold">100% Offline</span>
                            </div>
                          </motion.div>
                        )}

                        {/* SLIDE 3: AUTO PITCH-DECK */}
                        {mobileSlide === 3 && (
                          <motion.div
                            key="slide-pitch"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="h-full flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                    <Presentation size={14} />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-xs leading-tight">{t('card4_title')}</h3>
                                    <p className="text-[10px] text-text-muted">{t('card4_desc')}</p>
                                  </div>
                                </div>
                                <span className="text-[9px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full">
                                  PPTX / PDF
                                </span>
                              </div>

                              {/* Pitch Deck Preview Container */}
                              <div className="bg-surface border border-border/80 rounded-xl p-2 mb-2.5 shadow-xs">
                                <div className="flex items-center justify-between text-[10px] font-bold mb-1.5">
                                  <span className="truncate">Bauherren_Report_Q3.pdf</span>
                                  <span className="text-amber-500 shrink-0 ml-1">12 Slides</span>
                                </div>

                                <div className="grid grid-cols-3 gap-1.5 mb-1.5">
                                  {[
                                    { title: 'Status', color: 'bg-blue-500/20 text-blue-400' },
                                    { title: 'Kosten', color: 'bg-emerald-500/20 text-emerald-400' },
                                    { title: 'Meilensteine', color: 'bg-purple-500/20 text-purple-400' }
                                  ].map((slide, idx) => (
                                    <div key={idx} className={cn("h-11 rounded-lg border border-border flex flex-col items-center justify-center p-1 text-center", slide.color)}>
                                      <span className="text-[7px] font-mono text-text-muted">Slide 0{idx+1}</span>
                                      <span className="text-[8.5px] font-bold truncate w-full">{slide.title}</span>
                                    </div>
                                  ))}
                                </div>

                                {pitchProgress > 0 && pitchProgress < 100 && (
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[9px] text-text-muted">
                                      <span>{t('card4_generating')}</span>
                                      <span className="font-bold text-amber-500">{pitchProgress}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                                      <div className="h-full bg-amber-500 transition-all duration-200" style={{ width: `${pitchProgress}%` }} />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Generate Button */}
                              <button 
                                onClick={runPitchDeck} 
                                disabled={pitchProgress > 0 && pitchProgress < 100} 
                                className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                              >
                                {pitchProgress > 0 && pitchProgress < 100 ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <Play size={13} />
                                )}
                                {pitchProgress === 100 ? t('card4_done') : (pitchProgress > 0 ? `${pitchProgress}%` : t('card4_btn'))}
                              </button>
                            </div>

                            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[9px] text-text-muted">
                              <span>Vollautomatische CI/CD Folien</span>
                              <span className="text-amber-500 font-bold">1-Klick Export</span>
                            </div>
                          </motion.div>
                        )}

                      </AnimatePresence>
                    </div>

                    {/* iOS Tab Navigation Bar at Bottom of Phone */}
                    <div className="px-4 py-1.5 bg-surface/90 backdrop-blur-md border-t border-border/40 flex items-center justify-around shrink-0 z-30">
                      {[
                        { id: 0, label: 'Budget', icon: Calculator },
                        { id: 1, label: '3D BIM', icon: Box },
                        { id: 2, label: 'Mängel', icon: CheckCircle2 },
                        { id: 3, label: 'Pitch', icon: Presentation }
                      ].map(item => (
                        <button
                          key={item.id}
                          onClick={() => setMobileSlide(item.id)}
                          className={cn(
                            "flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors cursor-pointer",
                            mobileSlide === item.id ? "text-blue-500 font-bold" : "text-text-muted hover:text-text-primary"
                          )}
                        >
                          <item.icon size={13} />
                          <span className="text-[8px] leading-none">{item.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* iPhone Home Indicator Bar */}
                    <div className="pt-1 pb-1.5 bg-background flex justify-center shrink-0 z-30">
                      <div className="w-28 h-1 bg-zinc-400/40 dark:bg-white/40 rounded-full" />
                    </div>

                  </div>
                </div>

                {/* External Carousel Controls & Indicator Dots Below Device */}
                <div className="mt-5 flex items-center justify-between px-2">
                  <button
                    onClick={() => setMobileSlide(prev => (prev > 0 ? prev - 1 : 3))}
                    className="p-2 rounded-xl bg-surface border border-border text-text-muted hover:text-text-primary hover:bg-white/5 transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft size={16} /> {t('mobile_prev')}
                  </button>

                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2, 3].map(idx => (
                      <button
                        key={idx}
                        onClick={() => setMobileSlide(idx)}
                        className={cn(
                          "h-2 rounded-full transition-all duration-300 cursor-pointer",
                          mobileSlide === idx ? "w-6 bg-blue-500" : "w-2 bg-border hover:bg-text-muted"
                        )}
                        aria-label={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setMobileSlide(prev => (prev < 3 ? prev + 1 : 0))}
                    className="p-2 rounded-xl bg-surface border border-border text-text-muted hover:text-text-primary hover:bg-white/5 transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {t('mobile_next')} <ChevronRight size={16} />
                  </button>
                </div>

                <div className="text-center mt-2 text-[11px] text-text-muted flex items-center justify-center gap-1">
                  <span>{t('mobile_swipe_hint')}</span>
                </div>
              </div>

              {/* Call to Action Box under iPhone */}
              <div className="mt-8 text-center bg-blue-500/5 border border-blue-500/20 p-5 rounded-2xl max-w-sm mx-auto">
                <p className="text-xs text-text-muted mb-3">{t('mobile_demo_cta')}</p>
                <button onClick={() => navigate('/signup')} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 transition-all cursor-pointer">
                  {t('cta_primary')}
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* 3. B2B PROJEKT-SYSTEME (Wirtschaftliche Logik) */}
        <section id="systems" className="py-24 px-6 bg-surface/30 relative border-t border-border">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold uppercase tracking-wider mb-4">
                <Briefcase size={14} /> {t('b2b_badge')}
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">{t('b2b_title')}</h2>
              <p className="text-lg text-text-muted font-medium max-w-2xl mx-auto">{t('b2b_subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              
              {/* Studio OS */}
              <div className="p-8 sm:p-10 bg-surface border border-border hover:border-border/80 rounded-[2.5rem] transition-all flex flex-col justify-between shadow-lg group">
                <div>
                  <Briefcase className="w-10 h-10 text-text-muted mb-6 group-hover:text-blue-500 transition-colors" />
                  <h3 className="text-2xl font-black mb-2">{t('b2b_sys1_title')}</h3>
                  <div className="text-3xl font-black text-text-primary mb-2">{t('b2b_sys1_price')}</div>
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3 p-1.5 bg-background rounded-md border border-border inline-block">
                    {t('b2b_sys1_renewal')}
                  </div>
                  <div className="text-xs font-semibold text-blue-500 mb-6">
                    {t('b2b_sys1_seats')}
                  </div>
                  <p className="text-text-muted text-sm leading-relaxed mb-8">{t('b2b_sys1_desc')}</p>
                </div>
                <button onClick={() => navigate('/lead-form')} className="w-full py-4 bg-background hover:bg-surface border border-border text-text-primary rounded-2xl font-bold transition-all flex items-center justify-center gap-2">
                  {t('b2b_cta_request')} <ArrowRight size={18} />
                </button>
              </div>

              {/* Agency OS (Execution Booster) */}
              <div className="p-8 sm:p-10 bg-surface border-2 border-blue-500 rounded-[2.5rem] transition-all flex flex-col justify-between shadow-2xl relative md:scale-105 z-10 group">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                  EXECUTION BOOSTER
                </div>
                <div>
                  <Zap className="w-10 h-10 text-blue-500 mb-6" />
                  <h3 className="text-2xl font-black mb-2">{t('b2b_sys2_title')}</h3>
                  <div className="text-3xl font-black text-text-primary mb-2">{t('b2b_sys2_price')}</div>
                  <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-3 p-1.5 bg-blue-500/10 rounded-md border border-blue-500/20 inline-block">
                    {t('b2b_sys2_renewal')}
                  </div>
                  <div className="text-xs font-semibold text-blue-500 mb-6">
                    {t('b2b_sys2_seats')}
                  </div>
                  <p className="text-text-muted text-sm leading-relaxed mb-8">{t('b2b_sys2_desc')}</p>
                </div>
                <button onClick={() => navigate('/lead-form')} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2">
                  {t('b2b_cta_request')} <ArrowRight size={18} />
                </button>
              </div>

              {/* Enterprise OS */}
              <div className="p-8 sm:p-10 bg-surface border border-border hover:border-border/80 rounded-[2.5rem] transition-all flex flex-col justify-between shadow-lg group">
                <div>
                  <Shield className="w-10 h-10 text-emerald-500 mb-6 group-hover:text-blue-500 transition-colors" />
                  <h3 className="text-2xl font-black mb-2">{t('b2b_sys3_title')}</h3>
                  <div className="text-3xl font-black text-text-primary mb-2">{t('b2b_sys3_price')}</div>
                  <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-3 p-1.5 bg-emerald-500/10 rounded-md border border-emerald-500/20 inline-block">
                    {t('b2b_sys3_renewal')}
                  </div>
                  <div className="text-xs font-semibold text-emerald-500 mb-6">
                    {t('b2b_sys3_seats')}
                  </div>
                  <p className="text-text-muted text-sm leading-relaxed mb-8">{t('b2b_sys3_desc')}</p>
                </div>
                <button onClick={() => navigate('/lead-form')} className="w-full py-4 bg-background hover:bg-surface border border-border text-text-primary rounded-2xl font-bold transition-all flex items-center justify-center gap-2">
                  {t('b2b_cta_request')} <ArrowRight size={18} />
                </button>
              </div>

            </div>

            <p className="text-center text-text-muted text-xs font-bold uppercase tracking-widest mt-12">{t('b2b_vat')}</p>
          </div>
        </section>

        {/* 4. SAAS PRICING (STARTER, PRO, EXPERT) */}
        <section id="pricing" className="py-24 px-6 bg-background">
          <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold uppercase tracking-wider mb-4">
                  <Rocket size={14} /> {t('saas_badge')}
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">{t('saas_title')}</h2>
                <p className="text-lg text-text-muted font-medium max-w-2xl mx-auto mb-8">{t('saas_subtitle')}</p>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsYearly(false)} 
                    className={cn("text-sm font-bold transition-colors cursor-pointer", !isYearly ? "text-text-primary" : "text-text-muted hover:text-text-primary")}
                  >
                    {t('saas_monthly')}
                  </button>
                  <button 
                    type="button"
                    aria-label="Billing Cycle Toggle"
                    onClick={() => setIsYearly(!isYearly)} 
                    className="w-14 h-7 bg-surface border border-border rounded-full p-1 relative transition-colors"
                  >
                    <div className={cn("w-5 h-5 bg-blue-600 rounded-full transition-transform duration-300", isYearly ? "translate-x-7" : "translate-x-0")} />
                  </button>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => setIsYearly(true)} 
                      className={cn("text-sm font-bold transition-colors cursor-pointer", isYearly ? "text-text-primary" : "text-text-muted hover:text-text-primary")}
                    >
                      {t('saas_yearly')}
                    </button>
                    <span className="bg-blue-500/10 text-blue-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/20">{t('saas_save_20')}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-12">
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
                      
                      <div className="space-y-3 mb-10 flex-1">
                        {plan.features.map((f, j) => (
                          <div className="flex items-start gap-3 text-sm font-bold" key={`f-${j}`}>
                            <Check className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> <span>{f}</span>
                          </div>
                        ))}
                        {plan.notIncluded.map((f, j) => (
                          <div className="flex items-start gap-3 text-xs opacity-40 font-medium" key={`n-${j}`}>
                            <X className="w-4 h-4 shrink-0 mt-0.5" /> <span className="line-through">{f}</span>
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
              <p className="text-center text-text-muted text-xs font-bold uppercase tracking-widest">{t('saas_vat')}</p>
          </div>
        </section>

        {/* 5. ROI CALCULATOR */}
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

        {/* 6. FAQ (11 Fragen) */}
        <section id="faq" className="py-24 px-6 bg-background">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4 text-center">{t('faq_title')}</h2>
            <p className="text-text-muted font-medium text-center mb-16">{t('faq_subtitle')}</p>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
                  <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="w-full px-6 py-5 flex items-center justify-between font-bold text-left hover:bg-white/5 transition-colors">
                    <span className="pr-4">{faq.q}</span>
                    {openFaq === index ? <ChevronUp size={20} className="shrink-0 text-blue-500" /> : <ChevronDown size={20} className="shrink-0 text-text-muted" />}
                  </button>
                  <AnimatePresence>
                    {openFaq === index && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-5 text-text-muted font-medium leading-relaxed border-t border-border/40 pt-3 text-sm sm:text-base">
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. HILFE-CENTER & INTELLIGENTER KI-CONCIERGE */}
        <section id="help-center" className="py-24 px-6 bg-surface/30 border-t border-border">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold uppercase tracking-wider mb-4">
                <Bot size={14} /> Knowledge Hub & AI Concierge
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">{t('help_title')}</h2>
              <p className="text-lg text-text-muted font-medium max-w-2xl mx-auto">{t('help_subtitle')}</p>
            </div>

            {/* Suchleiste mit KI-Button */}
            <div className="max-w-3xl mx-auto mb-8 relative">
              <form onSubmit={(e) => { e.preventDefault(); handleAskAI(); }} className="relative flex items-center gap-2">
                <div className="relative flex-1 flex items-center">
                  <Search className="absolute left-5 text-text-muted" size={20} />
                  <input 
                    type="text" 
                    value={helpSearch} 
                    onChange={(e) => setHelpSearch(e.target.value)} 
                    placeholder={t('help_search_placeholder')} 
                    className="w-full pl-14 pr-12 py-4 bg-background border border-border rounded-2xl font-medium text-sm sm:text-base focus:outline-none focus:border-blue-500 shadow-lg transition-all"
                  />
                  {helpSearch && (
                    <button type="button" onClick={() => setHelpSearch('')} className="absolute right-4 p-1.5 text-text-muted hover:text-text-primary rounded-lg">
                      <X size={16} />
                    </button>
                  )}
                </div>
                <button 
                  type="submit"
                  disabled={isAiLoading || !helpSearch.trim()}
                  className="px-6 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 flex items-center gap-2 shrink-0 transition-all active:scale-95 text-sm sm:text-base"
                >
                  {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  <span>{t('ai_ask_btn')}</span>
                </button>
              </form>

              {/* Quick Questions Pills */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-text-muted mr-1">{t('ai_suggested_label')}</span>
                {[t('ai_q1'), t('ai_q2'), t('ai_q3'), t('ai_q4')].map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setHelpSearch(q);
                      handleAskAI(q);
                    }}
                    className="text-xs bg-surface hover:bg-blue-500/10 border border-border hover:border-blue-500/30 text-text-muted hover:text-blue-500 font-medium px-3 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Sparkles size={12} className="text-blue-500" />
                    <span>{q}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Response Glassmorphic Card */}
            <AnimatePresence>
              {(isAiLoading || aiAnswer) && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: 15 }} 
                  className="max-w-3xl mx-auto mb-16 p-6 sm:p-8 bg-gradient-to-br from-blue-950/30 via-surface to-background border-2 border-blue-500/40 rounded-3xl shadow-2xl relative overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
                    <div className="flex items-center gap-2.5 font-bold text-sm text-blue-400">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                        <Bot size={18} />
                      </div>
                      <span>{t('ai_badge')}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {aiAnswer && (
                        <button 
                          onClick={handleCopyAnswer} 
                          className="px-3 py-1.5 bg-surface hover:bg-white/10 border border-border text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                          {aiCopied ? <CheckCheck size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          <span>{aiCopied ? t('ai_copied') : t('ai_copy')}</span>
                        </button>
                      )}
                      <button 
                        onClick={() => { setAiAnswer(''); setHelpSearch(''); }} 
                        className="p-1.5 text-text-muted hover:text-text-primary rounded-lg"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {isAiLoading ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-3 text-text-muted">
                      <Loader2 size={28} className="animate-spin text-blue-500" />
                      <p className="text-sm font-medium animate-pulse">{t('ai_generating')}</p>
                    </div>
                  ) : (
                    <div className="text-sm sm:text-base leading-relaxed text-text-primary font-medium whitespace-pre-wrap">
                      {aiAnswer}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 3 Standard Themenkarten */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredHelpTopics.map((topic) => (
                <div key={topic.id} className="p-6 bg-background border border-border hover:border-blue-500/40 rounded-3xl transition-all flex flex-col justify-between group shadow-sm">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                      {topic.icon}
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-text-primary">{topic.title}</h3>
                    <p className="text-xs sm:text-sm text-text-muted font-medium leading-relaxed mb-6">
                      {topic.desc}
                    </p>
                  </div>
                  <button onClick={topic.action} className="w-full py-2.5 px-4 bg-surface hover:bg-blue-600 hover:text-white border border-border hover:border-blue-600 text-text-primary rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all">
                    {topic.cta} <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>

            {filteredHelpTopics.length === 0 && !aiAnswer && !isAiLoading && (
              <div className="text-center py-12 text-text-muted font-medium">
                {t('help_no_results')}
              </div>
            )}
          </div>
        </section>

      </main>

      {/* FLOATING AI CONCIERGE BUTTON */}
      <button 
        data-testid="floating-ai-concierge"
        aria-label="KI-Concierge"
        onClick={() => {
          scrollTo('help-center');
          const input = document.querySelector('#help-center input') as HTMLInputElement;
          if (input) input.focus();
        }}
        className="fixed bottom-6 right-6 z-40 px-4 py-2.5 sm:px-5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xl shadow-blue-600/30 flex items-center gap-2.5 font-bold text-xs sm:text-sm border border-blue-400/30 transition-all hover:scale-105 active:scale-95 group backdrop-blur-md cursor-pointer"
        title="Kreativ-Desk KI-Concierge fragen"
      >
        <Sparkles size={16} className="text-yellow-300 animate-pulse shrink-0" />
        <span>KI-Concierge</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
      </button>

      {/* FOOTER */}
      <footer className="bg-surface py-16 px-6 border-t border-border">
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
                <li><button onClick={() => scrollTo('help-center')} className="hover:text-blue-500 transition-colors">{t('nav_help')}</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest mb-4">{t('footer_legal')}</h4>
              <ul className="space-y-2 text-xs font-medium text-text-muted">
                <li><Link to="/privacy" className="hover:text-blue-500 transition-colors">{t('footer_privacy')}</Link></li>
                <li><Link to="/terms" className="hover:text-blue-500 transition-colors">{t('footer_tos')}</Link></li>
                <li><Link to="/imprint" className="hover:text-blue-500 transition-colors">{t('footer_imprint')}</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}