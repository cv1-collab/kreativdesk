import React, { useState } from 'react';
import { Check, X, Building2, Zap, Shield, Lock, ArrowLeft, ArrowRight, Briefcase, Layers } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../utils';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    pricing_title: 'Simple, transparent pricing',
    pricing_subtitle: 'Choose the plan that fits your workflows best.',
    monthly: 'Monthly',
    yearly: 'Yearly',
    save_20: 'Save up to 20%',
    get_started: 'Get Started',
    popular: 'Most Popular',
    secure_stripe: 'Secure 256-bit SSL payment via Stripe',
    back: 'Back',
    trust_badge: '🇨🇭 Contract under Swiss law (Zurich) • FADP & GDPR compliant • Swiss server location',
    billed_annually: 'billed annually',
    plan_starter: 'Starter',
    desc_starter: 'For freelancers managing simple 2D projects.',
    plan_pro: 'Pro',
    desc_pro: 'For site managers needing 3D BIM, AI power & defect app.',
    plan_team_starter: 'Team Starter',
    desc_team_starter: 'For growing studios & teams needing controlling, RBAC & invoicing.',
    f_seats_1: '1 Internal Seat included',
    f_seats_3: '3 Internal Seats included (+ CHF 75/mo extra seat)',
    f_proj_3: '3 Active Projects',
    f_proj_unlimited: 'Unlimited Projects',
    f_2d_defects: '2D CAD Viewer & Defects',
    f_3d: '3D BIM Viewer (IFC)',
    f_ai: 'AI Concierge & Pitch-Deck Studio',
    f_mobile: 'Mobile Defect App (Live-Sync)',
    f_budget: 'Project Budgets & Tracking',
    f_qr_invoicing: 'PDF Quotes & Swiss QR-Invoicing',
    f_api: 'API & Webhooks (Zapier/Make)',
    f_brand: 'Custom Branding & Domain',
    f_storage_15: '15 GB Cloud Storage',
    f_storage_100: '100 GB Cloud Storage',
    f_storage_250: '250 GB Cloud Storage',
    f_unlimited_guests: '✓ Unlimited free contractor & client guest seats',
    all_pro_features: 'All features from Pro plan',
    f_controlling: 'Central Company Dashboard (Controlling)',
    f_rbac: 'Role-Based Access Control (RBAC)',
    f_staff: 'Staff Management & Data Sovereignty',
    f_tenant: 'Tenant-Isolated Server Infrastructure',
    b2b_title: 'Project Control Systems (Kreativ-Desk OS)',
    b2b_subtitle: 'Turnkey infrastructure for studios, agencies, and enterprises managing complex productions at scale.',
    b2b_total_first_year_label: 'Total Year 1 (All-in)',
    b2b_followup_label: 'From Year 2 onwards (recurring):',
    b2b_zero_setup: '0 CHF Setup',
    sys1_title: 'Studio OS',
    sys1_total_y1: 'CHF 10,300',
    sys1_price: 'CHF 6,800 / yr',
    sys1_setup: '+ One-time Implementation Package CHF 3,500',
    sys1_followup: 'CHF 6,800 / yr',
    sys1_seats: 'Incl. 5 Governance Seats',
    sys1_f1: '5 Internal Governance Seats included',
    sys1_f2: '500 GB dedicated Swiss Cloud Storage',
    sys1_f3: 'Unlimited Projects & BKP 100–900 Budgets',
    sys1_f4: '✓ Unlimited free contractor & client guest seats',
    sys1_f5: '2D/3D BIM Viewer & Mobile Defects App',
    sys1_f6: 'Company Controlling, RBAC & QR Invoicing',
    sys1_f7: 'Kickoff workshop & data migration (Year 1)',
    sys1_f8: '2h Admin & team onboarding (Year 1)',

    sys2_title: 'Agency OS',
    sys2_total_y1: 'CHF 23,300',
    sys2_price: 'CHF 16,800 / yr',
    sys2_setup: '+ One-time Implementation Package CHF 6,500',
    sys2_followup: 'CHF 16,800 / yr',
    sys2_seats: 'Incl. 15 Governance Seats',
    sys2_f1: '15 Internal Governance Seats included',
    sys2_f2: '2,000 GB (2 TB) High-Speed Swiss Cloud Storage',
    sys2_f3: 'All features from Studio OS plan',
    sys2_f4: 'In-browser 3D BIM collision & clash check',
    sys2_f5: 'Full whitelabeling & custom domain',
    sys2_f6: 'B2B REST API & Webhooks (Zapier/Make)',
    sys2_f7: 'Workflow audit & interface setup (Year 1)',
    sys2_f8: 'Comprehensive team training & priority support',

    sys3_title: 'Enterprise OS',
    sys3_total_y1: 'from CHF 60,000',
    sys3_price: 'from CHF 45,000 / yr',
    sys3_setup: '+ Custom Engineering from CHF 15,000',
    sys3_followup: 'from CHF 45,000 / yr',
    sys3_seats: 'Incl. 25+ Governance Seats',
    sys3_f1: '25+ Internal Governance Seats (scalable)',
    sys3_f2: 'Unlimited Swiss Cloud Storage',
    sys3_f3: 'All features from Agency OS plan',
    sys3_f4: 'Single Sign-On (SSO / SAML 2.0 & AD)',
    sys3_f5: 'Deep ERP integration (Abacus, BauBit, SAP)',
    sys3_f6: 'Dedicated Swiss isolated instance & 99.9% SLA',
    sys3_f7: 'Custom engineering & compliance audit (Year 1)',
    sys3_f8: 'Dedicated Swiss Account Executive & 24/7 SLA',

    sys_vat: 'excl. statutory VAT',
    b2b_cta: 'Request Setup'
  },
  de: {
    pricing_title: 'Einfache, transparente Preise',
    pricing_subtitle: 'Wähle den Plan, der am besten zu deinen Workflows passt.',
    monthly: 'Monatlich',
    yearly: 'Jährlich',
    save_20: 'Spare bis zu 20%',
    get_started: 'Jetzt starten',
    popular: 'Beliebtester Plan',
    secure_stripe: 'Sichere 256-bit SSL verschlüsselte Zahlung via Stripe',
    back: 'Zurück',
    trust_badge: '🇨🇭 Vertrag nach Schweizer Recht (Zürich) • DSG- & DSGVO-konform • Serverstandort Schweiz',
    billed_annually: 'jährlich abgerechnet',
    plan_starter: 'Starter',
    desc_starter: 'Für Freelancer zur simplen 2D-Planorganisation.',
    plan_pro: 'Pro',
    desc_pro: 'Für Bauleiter, die 3D BIM, KI & mobile Mängel-App benötigen.',
    plan_team_starter: 'Team Starter',
    desc_team_starter: 'Für wachsende Büros & Teams mit Controlling, Rollen & Finanzen.',
    f_seats_1: '1 Interner Seat inklusive',
    f_seats_3: '3 Interne Seats inklusive (+ CHF 75/Mt. pro Zusatz-Seat)',
    f_proj_3: '3 Aktive Projekte',
    f_proj_unlimited: 'Unbegrenzte Projekte',
    f_2d_defects: '2D CAD Viewer & Mängel',
    f_3d: '3D BIM Viewer (IFC)',
    f_ai: 'KI-Concierge & Pitch-Deck Studio',
    f_mobile: 'Mobile Mängel-App (Live-Sync)',
    f_budget: 'Projekt-Budgets & Tracking',
    f_qr_invoicing: 'PDF-Offerten & Schweizer QR-Rechnungen',
    f_api: 'API & Webhooks (Zapier/Make)',
    f_brand: 'Eigenes Branding & Domain',
    f_storage_15: '15 GB Cloud Speicher',
    f_storage_100: '100 GB Cloud Speicher',
    f_storage_250: '250 GB Cloud Speicher',
    f_unlimited_guests: '✓ Unbegrenzte kostenlose Handwerker- & Bauherren-Zugänge',
    all_pro_features: 'Alles aus dem Pro-Plan',
    f_controlling: 'Zentrales Firmen-Dashboard (Controlling)',
    f_rbac: 'Rollenbasierte Zugriffsrechte (RBAC)',
    f_staff: 'Mitarbeiter-Verwaltung & Datenhoheit',
    f_tenant: 'Mandantenisolierte Serverstruktur',
    b2b_title: 'Projekt-Steuerungssysteme (Kreativ-Desk OS)',
    b2b_subtitle: 'Schlüsselfertige Infrastruktur für Studios, Agenturen und Unternehmen, die komplexe Produktionen skalierbar steuern müssen.',
    b2b_total_first_year_label: 'Gesamtpreis 1. Jahr (All-in)',
    b2b_followup_label: 'Folgejahre (ab 2. Jahr wiederkehrend):',
    b2b_zero_setup: '0 CHF Setup',
    sys1_title: 'Studio OS',
    sys1_total_y1: 'CHF 10’300',
    sys1_price: 'CHF 6’800 / Jahr',
    sys1_setup: '+ Einmaliges Implementation Package CHF 3’500',
    sys1_followup: 'CHF 6’800 / Jahr',
    sys1_seats: 'Inkl. 5 Governance-Lizenzen',
    sys1_f1: '5 Interne Governance-Seats inklusive',
    sys1_f2: '500 GB dedizierter Schweizer Cloud-Speicher',
    sys1_f3: 'Unbegrenzte Projekte & BKP 100–900 Budgets',
    sys1_f4: '✓ Unbegrenzte kostenlose Handwerker- & Bauherren-Zugänge',
    sys1_f5: '2D/3D BIM Viewer & mobile Mängel-App',
    sys1_f6: 'Firmen-Controlling, RBAC & QR-Rechnungen',
    sys1_f7: 'Kickoff-Workshop & Datenimport (im 1. Jahr inkl.)',
    sys1_f8: '2h Admin- & Teamschulung (im 1. Jahr inkl.)',

    sys2_title: 'Agency OS',
    sys2_total_y1: 'CHF 23’300',
    sys2_price: 'CHF 16’800 / Jahr',
    sys2_setup: '+ Einmaliges Implementation Package CHF 6’500',
    sys2_followup: 'CHF 16’800 / Jahr',
    sys2_seats: 'Inkl. 15 Governance-Lizenzen',
    sys2_f1: '15 Interne Governance-Seats inklusive',
    sys2_f2: '2’000 GB (2 TB) High-Speed Schweizer Cloud',
    sys2_f3: 'Alle Features aus dem Studio OS Plan',
    sys2_f4: 'Browserbasierte 3D BIM Kollisionsprüfung',
    sys2_f5: 'Vollständiges Whitelabeling (eigene Domain & Logo)',
    sys2_f6: 'B2B REST API & Webhooks (Zapier/Make)',
    sys2_f7: 'Workflow-Audit & Schnittstellen-Setup (im 1. J. inkl.)',
    sys2_f8: 'Umfassende Teamschulung & Priority Support',

    sys3_title: 'Enterprise OS',
    sys3_total_y1: 'ab CHF 60’000',
    sys3_price: 'ab CHF 45’000 / Jahr',
    sys3_setup: '+ Custom Engineering ab CHF 15’000',
    sys3_followup: 'ab CHF 45’000 / Jahr',
    sys3_seats: 'Inkl. 25+ Governance-Lizenzen',
    sys3_f1: '25+ Interne Governance-Seats (skalierbar)',
    sys3_f2: 'Unbegrenzter Schweizer Cloud-Speicher',
    sys3_f3: 'Alle Features aus dem Agency OS Plan',
    sys3_f4: 'Single Sign-On (SSO / SAML 2.0 & AD)',
    sys3_f5: 'ERP-Tiefenintegration (Abacus, BauBit, SAP)',
    sys3_f6: 'Dedizierte Schweizer Server-Instanz & 99.9% SLA',
    sys3_f7: 'Custom Engineering & Revisions-Audit (im 1. J. inkl.)',
    sys3_f8: 'Schweizer Account Executive & 24/7 SLA Support',

    sys_vat: 'rein netto exkl. gesetzlicher MwSt.',
    b2b_cta: 'Setup anfragen'
  }
};

export default function PricingPage() {
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const navigate = useNavigate();

  const b2bSystems = [
    {
      id: 'Studio OS',
      name: t('sys1_title'),
      icon: <Briefcase className="w-10 h-10 text-zinc-400 group-hover:text-blue-500 transition-colors" />,
      badge: null,
      totalFirstYear: t('sys1_total_y1'),
      annualSoftware: t('sys1_price'),
      setupFee: t('sys1_setup'),
      renewalYear2: t('sys1_followup'),
      seats: t('sys1_seats'),
      features: [
        t('sys1_f1'),
        t('sys1_f2'),
        t('sys1_f3'),
        t('sys1_f4'),
        t('sys1_f5'),
        t('sys1_f6'),
        t('sys1_f7'),
        t('sys1_f8'),
      ],
      popular: false,
      leadPlan: 'Studio OS'
    },
    {
      id: 'Agency OS',
      name: t('sys2_title'),
      icon: <Zap className="w-10 h-10 text-blue-500" />,
      badge: 'EXECUTION BOOSTER',
      totalFirstYear: t('sys2_total_y1'),
      annualSoftware: t('sys2_price'),
      setupFee: t('sys2_setup'),
      renewalYear2: t('sys2_followup'),
      seats: t('sys2_seats'),
      features: [
        t('sys2_f1'),
        t('sys2_f2'),
        t('sys2_f3'),
        t('sys2_f4'),
        t('sys2_f5'),
        t('sys2_f6'),
        t('sys2_f7'),
        t('sys2_f8'),
      ],
      popular: true,
      leadPlan: 'Agency OS'
    },
    {
      id: 'Enterprise OS',
      name: t('sys3_title'),
      icon: <Shield className="w-10 h-10 text-emerald-500" />,
      badge: null,
      totalFirstYear: t('sys3_total_y1'),
      annualSoftware: t('sys3_price'),
      setupFee: t('sys3_setup'),
      renewalYear2: t('sys3_followup'),
      seats: t('sys3_seats'),
      features: [
        t('sys3_f1'),
        t('sys3_f2'),
        t('sys3_f3'),
        t('sys3_f4'),
        t('sys3_f5'),
        t('sys3_f6'),
        t('sys3_f7'),
        t('sys3_f8'),
      ],
      popular: false,
      leadPlan: 'Enterprise OS'
    }
  ];

  const plans = [
    {
      name: t('plan_starter'),
      price: billingCycle === 'yearly' ? 49 : 59,
      annualTotal: 'CHF 588 / J.',
      icon: <Building2 className="w-6 h-6 text-zinc-400" />,
      description: t('desc_starter'),
      features: [t('f_seats_1'), t('f_proj_3'), t('f_2d_defects'), t('f_budget'), t('f_storage_15'), t('f_unlimited_guests')],
      notIncluded: [
        t('f_3d'), t('f_ai'), t('f_mobile'), t('f_qr_invoicing'), t('f_api'),
        t('f_controlling'), t('f_rbac'), t('f_staff'), t('f_tenant')
      ],
      popular: false
    },
    {
      name: t('plan_pro'),
      price: billingCycle === 'yearly' ? 89 : 109,
      annualTotal: "CHF 1'068 / J.",
      icon: <Zap className="w-6 h-6 text-blue-500" />,
      description: t('desc_pro'),
      features: [t('f_seats_1'), t('f_proj_unlimited'), t('f_3d'), t('f_ai'), t('f_mobile'), t('f_budget'), t('f_storage_100'), t('f_unlimited_guests')],
      notIncluded: [
        t('f_qr_invoicing'), t('f_api'), t('f_brand'),
        t('f_controlling'), t('f_rbac'), t('f_staff'), t('f_tenant')
      ],
      popular: true
    },
    {
      name: t('plan_team_starter'),
      price: billingCycle === 'yearly' ? 240 : 290,
      annualTotal: "CHF 2'880 / J.",
      icon: <Layers className="w-6 h-6 text-emerald-500" />,
      description: t('desc_team_starter'),
      features: [t('f_seats_3'), t('f_proj_unlimited'), t('all_pro_features'), t('f_controlling'), t('f_rbac'), t('f_qr_invoicing'), t('f_api'), t('f_brand'), t('f_storage_250'), t('f_unlimited_guests')],
      notIncluded: [
        t('f_tenant')
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4 selection:bg-blue-500/30 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-12 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> {t('back')}
        </Link>

        {/* TRUST BADGE HEADER */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold shadow-sm text-center">
            {t('trust_badge')}
          </div>
        </div>

        {/* --- TIER 1: SELF-SERVICE (B2C) --- */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6">{t('pricing_title')}</h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-10">{t('pricing_subtitle')}</p>

          <div className="flex items-center justify-center gap-4">
            <span className={cn("text-sm font-bold transition-colors", billingCycle === 'monthly' ? "text-white" : "text-zinc-500")}>{t('monthly')}</span>
            <button onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')} className="w-14 h-7 bg-zinc-800 rounded-full p-1 relative transition-colors cursor-pointer">
              <div className={cn("w-5 h-5 bg-blue-500 rounded-full transition-transform duration-300", billingCycle === 'yearly' ? "translate-x-7" : "translate-x-0")} />
            </button>
            <div className="flex items-center gap-2">
               <span className={cn("text-sm font-bold transition-colors", billingCycle === 'yearly' ? "text-white" : "text-zinc-500")}>{t('yearly')}</span>
               <span className="bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/20">{t('save_20')}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-20">
          {plans.map((plan, i) => (
            <div key={i} className={cn(
              "relative p-8 rounded-[2rem] border transition-all duration-300 flex flex-col",
              plan.popular ? "bg-zinc-900 border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.1)] scale-105 z-10" : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
            )}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest">
                  {t('popular')}
                </div>
              )}
              <div className="mb-6">
                <div className="mb-4">{plan.icon}</div>
                <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-zinc-500 text-sm h-10">{plan.description}</p>
              </div>
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">CHF {plan.price}</span>
                  <span className="text-zinc-500">/mo</span>
                </div>
                {billingCycle === 'yearly' && (
                  <div className="text-xs text-blue-400 font-semibold mt-1">
                    {plan.annualTotal} ({t('billed_annually')})
                  </div>
                )}
              </div>
              <div className="space-y-3 mb-10 flex-1">
                {plan.features.map((f, j) => (
                  <div className="flex items-start gap-3 text-sm" key={`feat-${j}`}>
                    <Check className={cn("w-4 h-4 shrink-0 mt-0.5", f.startsWith('✓') ? "text-emerald-400 font-bold" : "text-blue-500")} /> 
                    <span className={cn(f.startsWith('✓') ? "text-emerald-400 font-semibold" : "")}>{f}</span>
                  </div>
                ))}
                {plan.notIncluded.map((f, j) => (
                  <div className="flex items-start gap-3 text-xs opacity-40" key={`not-${j}`}><X className="w-4 h-4 shrink-0 mt-0.5" /> <span className="line-through">{f}</span></div>
                ))}
              </div>
              <button onClick={() => navigate('/signup')} className={cn(
                "w-full py-4 rounded-2xl font-bold transition-all active:scale-95 cursor-pointer",
                plan.popular ? "bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 text-white" : "bg-white text-black hover:bg-zinc-200"
              )}>
                {t('get_started')}
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 text-zinc-500 text-sm mb-32">
          <Lock className="w-4 h-4" /> {t('secure_stripe')}
        </div>

        {/* --- TIER 2: COMPANY SYSTEMS (B2B) --- */}
        <div className="border-t border-zinc-800 pt-32 pb-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full z-0 pointer-events-none"></div>
          
          <div className="text-center mb-16 relative z-10">
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">{t('b2b_title')}</h2>
              <p className="text-zinc-400 max-w-2xl mx-auto text-lg">{t('b2b_subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              {b2bSystems.map((sys, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "p-8 sm:p-10 rounded-[2.5rem] transition-all flex flex-col justify-between group",
                    sys.popular 
                      ? "bg-zinc-900 border-2 border-blue-500 shadow-2xl relative md:scale-105 z-10" 
                      : "bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 shadow-lg"
                  )}
                >
                  {sys.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                      {sys.badge}
                    </div>
                  )}
                  
                  <div>
                    <div className="mb-6">{sys.icon}</div>
                    <h3 className="text-2xl md:text-3xl font-semibold mb-3">{sys.name}</h3>

                    {/* GESAMTZAHL 1. JAHR */}
                    <div className="mb-4 p-4 rounded-2xl bg-black/60 border border-zinc-800">
                      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        {t('b2b_total_first_year_label')}
                      </div>
                      <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                        {sys.totalFirstYear}
                      </div>
                      <div className="text-xs text-zinc-400 font-medium mt-1">
                        {sys.annualSoftware} + {sys.setupFee}
                      </div>
                    </div>

                    {/* FOLGEJAHRE AB 2. JAHR */}
                    <div className="mb-5 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-0.5">
                        {t('b2b_followup_label')}
                      </div>
                      <div className="text-sm font-bold text-white flex items-center justify-between">
                        <span>{sys.renewalYear2}</span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          {t('b2b_zero_setup')}
                        </span>
                      </div>
                    </div>

                    {/* SEATS BADGE */}
                    <div className="text-xs font-bold text-blue-400 mb-6 flex items-center gap-1.5">
                      <Shield size={14} /> {sys.seats}
                    </div>

                    {/* FEATURES DETAIL LISTE MIT HÄKCHEN */}
                    <div className="space-y-3 mb-8">
                      {sys.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                          <Check className={cn("w-4 h-4 shrink-0 mt-0.5", feat.startsWith('✓') ? "text-emerald-400" : "text-blue-500")} />
                          <span className={cn(feat.startsWith('✓') ? "text-emerald-400 font-semibold" : "text-zinc-300 font-medium")}>
                            {feat}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA BUTTON */}
                  <button 
                    onClick={() => navigate(`/lead-form?plan=${encodeURIComponent(sys.leadPlan)}`)} 
                    className={cn(
                      "w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer mt-auto",
                      sys.popular 
                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20" 
                        : "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white"
                    )}
                  >
                    {t('b2b_cta')} <ArrowRight size={18} />
                  </button>
                </div>
              ))}
          </div>
        </div>

      </div>
    </div>
  );
}