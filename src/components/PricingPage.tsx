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
    sys1_title: 'Studio OS',
    sys1_desc: 'Focus: Establishing a central data architecture, kickoff workshop, data import & 2h admin training.',
    sys1_price: 'CHF 6,800 / yr',
    sys1_setup: '+ One-time Implementation Package CHF 3,500',
    sys1_seats: 'Incl. 5 Governance Seats',
    sys2_title: 'Agency OS',
    sys2_desc: 'Focus: In-browser collision check, whitelabeling, workflow audit, interface setup & team training.',
    sys2_price: 'CHF 16,800 / yr',
    sys2_setup: '+ One-time Implementation Package CHF 6,500',
    sys2_seats: 'Incl. 15 Governance Seats',
    sys3_title: 'Enterprise OS',
    sys3_desc: 'Focus: Single Sign-On (SSO/SAML), deep ERP integration (Abacus/BauBit), dedicated Swiss instance & 99.9% SLA.',
    sys3_price: 'from CHF 45,000 / yr',
    sys3_setup: '+ Custom Engineering from CHF 15,000',
    sys3_seats: 'Incl. 25+ Governance Seats',
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
    sys1_title: 'Studio OS',
    sys1_desc: 'Fokus: Etablierung zentraler Datenstruktur, Kickoff-Workshop, Datenimport & 2h Admin-Schulung.',
    sys1_price: 'CHF 6’800 / Jahr',
    sys1_setup: '+ Einmaliges Implementation Package CHF 3’500',
    sys1_seats: 'Inkl. 5 Governance-Lizenzen',
    sys2_title: 'Agency OS',
    sys2_desc: 'Fokus: Kollisionsprüfung im Browser, Whitelabeling, Workflow-Audit, Schnittstellen-Setup & Teamschulung.',
    sys2_price: 'CHF 16’800 / Jahr',
    sys2_setup: '+ Einmaliges Implementation Package CHF 6’500',
    sys2_seats: 'Inkl. 15 Governance-Lizenzen',
    sys3_title: 'Enterprise OS',
    sys3_desc: 'Fokus: Single Sign-On (SSO/SAML), ERP-Tiefenintegration (Abacus/BauBit), dedizierte Schweizer Instanz & 99.9% SLA.',
    sys3_price: 'ab CHF 45’000 / Jahr',
    sys3_setup: '+ Custom Engineering ab CHF 15’000',
    sys3_seats: 'Inkl. 25+ Governance-Lizenzen',
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
              {/* Studio */}
              <div className="p-8 sm:p-10 bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-900 rounded-[2.5rem] transition-colors flex flex-col group">
                  <Briefcase className="w-10 h-10 text-zinc-500 mb-8 group-hover:text-blue-500 transition-colors" />
                  <h3 className="text-2xl md:text-3xl font-semibold mb-3">{t('sys1_title')}</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                      <div className="text-xl md:text-2xl font-black leading-tight">{t('sys1_price')}</div>
                      <div className="text-xs font-bold text-zinc-500 whitespace-nowrap">{t('sys_vat')}</div>
                  </div>
                  <div className="text-[11px] font-semibold text-blue-400 mb-2 p-1.5 bg-blue-500/10 rounded-md border border-blue-500/20 self-start">
                    {t('sys1_setup')}
                  </div>
                  <div className="text-xs font-semibold text-zinc-300 mb-6">{t('sys1_seats')}</div>
                  <p className="text-zinc-400 font-medium mb-10 leading-relaxed flex-1 text-sm">{t('sys1_desc')}</p>
                  <button onClick={() => navigate('/lead-form?plan=Studio%20OS')} className="block w-full py-4 bg-zinc-800 text-white border border-zinc-700 text-center rounded-2xl font-bold hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                    {t('b2b_cta')} <ArrowRight size={18} />
                  </button>
              </div>

              {/* Agency */}
              <div className="p-8 sm:p-10 bg-zinc-900 border border-blue-500/50 shadow-2xl md:scale-105 rounded-[2.5rem] relative flex flex-col group z-10">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">EXECUTION BOOSTER</div>
                  <Zap className="w-10 h-10 text-blue-500 mb-8" />
                  <h3 className="text-2xl md:text-3xl font-semibold mb-3">{t('sys2_title')}</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                      <div className="text-xl md:text-2xl font-black leading-tight">{t('sys2_price')}</div>
                      <div className="text-xs font-bold text-zinc-500 whitespace-nowrap">{t('sys_vat')}</div>
                  </div>
                  <div className="text-[11px] font-semibold text-blue-400 mb-2 p-1.5 bg-blue-500/10 rounded-md border border-blue-500/20 self-start">
                    {t('sys2_setup')}
                  </div>
                  <div className="text-xs font-semibold text-zinc-300 mb-6">{t('sys2_seats')}</div>
                  <p className="text-zinc-400 font-medium mb-10 leading-relaxed flex-1 text-sm">{t('sys2_desc')}</p>
                  <button onClick={() => navigate('/lead-form?plan=Agency%20OS')} className="block w-full py-4 bg-blue-600 text-white text-center rounded-2xl font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer">
                    {t('b2b_cta')} <ArrowRight size={18} />
                  </button>
              </div>

              {/* Enterprise */}
              <div className="p-8 sm:p-10 bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-900 rounded-[2.5rem] transition-colors flex flex-col group">
                  <Shield className="w-10 h-10 text-emerald-500 mb-8 group-hover:text-blue-500 transition-colors" />
                  <h3 className="text-2xl md:text-3xl font-semibold mb-3">{t('sys3_title')}</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                      <div className="text-xl md:text-2xl font-black leading-tight">{t('sys3_price')}</div>
                      <div className="text-xs font-bold text-zinc-500 whitespace-nowrap">{t('sys_vat')}</div>
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-400 mb-2 p-1.5 bg-emerald-500/10 rounded-md border border-emerald-500/20 self-start">
                    {t('sys3_setup')}
                  </div>
                  <div className="text-xs font-semibold text-zinc-300 mb-6">{t('sys3_seats')}</div>
                  <p className="text-zinc-400 font-medium mb-10 leading-relaxed flex-1 text-sm">{t('sys3_desc')}</p>
                  <button onClick={() => navigate('/lead-form?plan=Enterprise%20OS')} className="block w-full py-4 bg-zinc-800 text-white border border-zinc-700 text-center rounded-2xl font-bold hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                    {t('b2b_cta')} <ArrowRight size={18} />
                  </button>
              </div>
          </div>
        </div>

      </div>
    </div>
  );
}