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
    save_20: 'Save 20%',
    get_started: 'Get Started',
    popular: 'Most Popular',
    secure_stripe: 'Secure 256-bit SSL payment via Stripe',
    back: 'Back',
    plan_starter: 'Starter',
    desc_starter: 'For freelancers managing simple 2D projects.',
    plan_pro: 'Pro',
    desc_pro: 'For site managers needing 3D BIM and AI power.',
    plan_expert: 'Expert',
    desc_expert: 'For power users needing invoicing and API automation.',
    f_proj_3: '3 Active Projects',
    f_proj_unlimited: 'Unlimited Projects',
    f_2d_defects: '2D CAD Viewer & Defects',
    f_3d: '3D BIM Viewer (IFC)',
    f_ai: 'AI Concierge & Pitch-Deck',
    f_mobile: 'Mobile Defect App (Live-Sync)',
    f_budget: 'Project Budgets & Tracking',
    f_invoice: 'PDF Quotes & Invoicing',
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
    b2b_title: 'Project Control Systems (Kreativ-Desk OS)',
    b2b_subtitle: 'Infrastructure for studios, agencies, and enterprises managing complex productions at scale.',
    sys1_title: 'Studio OS',
    sys1_desc: 'Focus: Establishing a central data architecture, tenant-isolated environment, and executive master dashboard.',
    sys1_price: 'from CHF 15,000',
    sys1_renewal: 'SETUP INCL. 1ST YR. FROM YR 2: CHF 7,500/YR',
    sys1_seats: 'Incl. 5 Governance Seats (+ CHF 780/yr per extra seat)',
    sys2_title: 'Agency OS',
    sys2_desc: 'Focus: Full resource controlling (target vs. actual), dedicated team workspaces, and automated on-/offboarding for maximum data security.',
    sys2_price: 'CHF 25,000',
    sys2_renewal: 'SETUP INCL. 1ST YR. FROM YR 2: CHF 19,500/YR',
    sys2_seats: 'Incl. 10 Governance Seats (+ CHF 780/yr per extra seat)',
    sys3_title: 'Enterprise OS',
    sys3_desc: 'Focus: Custom API pipelines, Single Sign-On (SSO), strategic onboarding, and unlimited system resources.',
    sys3_price: 'from CHF 50,000',
    sys3_renewal: 'SETUP INCL. 1ST YR. FROM YR 2: FROM CHF 35,000/YR',
    sys3_seats: 'Incl. 20 Governance Seats (+ CHF 780/yr per extra seat)',
    sys_vat: 'excl. VAT',
    b2b_cta: 'Request Setup'
  },
  de: {
    pricing_title: 'Einfache, transparente Preise',
    pricing_subtitle: 'Wähle den Plan, der am besten zu deinen Workflows passt.',
    monthly: 'Monatlich',
    yearly: 'Jährlich',
    save_20: 'Spare 20%',
    get_started: 'Jetzt starten',
    popular: 'Beliebtester Plan',
    secure_stripe: 'Sichere 256-bit SSL verschlüsselte Zahlung via Stripe',
    back: 'Zurück',
    plan_starter: 'Starter',
    desc_starter: 'Für Freelancer zur simplen 2D-Planorganisation.',
    plan_pro: 'Pro',
    desc_pro: 'Für Bauleiter, die 3D BIM und KI-Power benötigen.',
    plan_expert: 'Expert',
    desc_expert: 'Für Power-User, die Finanzen & API-Automatisierung suchen.',
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
    f_controlling: 'Zentrales Firmen-Dashboard (Controlling)',
    f_rbac: 'Rollenbasierte Zugriffsrechte (RBAC)',
    f_staff: 'Mitarbeiter-Verwaltung & Datenhoheit',
    f_tenant: 'Mandantenisolierte Serverstruktur',
    b2b_title: 'Projekt-Steuerungssysteme (Kreativ-Desk OS)',
    b2b_subtitle: 'Infrastruktur für Studios, Agenturen und Unternehmen, die komplexe Produktionen skalierbar steuern müssen.',
    sys1_title: 'Studio OS',
    sys1_desc: 'Fokus: Etablierung einer zentralen Datenstruktur, mandantenisolierte Umgebung und Master-Dashboard für die Geschäftsleitung.',
    sys1_price: 'ab CHF 15’000',
    sys1_renewal: 'SETUP INKL. 1. JAHR. AB JAHR 2: CHF 7’500/JAHR',
    sys1_seats: 'Inkl. 5 Governance-Lizenzen (+ CHF 780/Jahr pro Zusatzlizenz)',
    sys2_title: 'Agency OS',
    sys2_desc: 'Fokus: Volles Ressourcen-Controlling (Soll vs. Ist), dedizierte Team-Workspaces und automatisches On-/Offboarding für maximale Datensicherheit.',
    sys2_price: 'CHF 25’000',
    sys2_renewal: 'SETUP INKL. 1. JAHR. AB JAHR 2: CHF 19’500/JAHR',
    sys2_seats: 'Inkl. 10 Governance-Lizenzen (+ CHF 780/Jahr pro Zusatzlizenz)',
    sys3_title: 'Enterprise OS',
    sys3_desc: 'Fokus: Custom API-Pipelines, Single Sign-On (SSO), strategisches Onboarding und unlimitierte Systemressourcen.',
    sys3_price: 'ab CHF 50’000',
    sys3_renewal: 'SETUP INKL. 1. JAHR. AB JAHR 2: AB CHF 35’000/JAHR',
    sys3_seats: 'Inkl. 20 Governance-Lizenzen (+ CHF 780/Jahr pro Zusatzlizenz)',
    sys_vat: 'exkl. MwSt.',
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
      price: billingCycle === 'yearly' ? 35 : 39,
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
      price: billingCycle === 'yearly' ? 65 : 79,
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
      price: billingCycle === 'yearly' ? 159 : 189, 
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
    <div className="min-h-screen bg-black text-white py-20 px-4 selection:bg-blue-500/30 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-12 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> {t('back')}
        </Link>

        {/* --- TIER 1: SELF-SERVICE (B2C) --- */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">{t('pricing_title')}</h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-10">{t('pricing_subtitle')}</p>

          <div className="flex items-center justify-center gap-4">
            <span className={cn("text-sm font-bold transition-colors", billingCycle === 'monthly' ? "text-white" : "text-zinc-500")}>{t('monthly')}</span>
            <button onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')} className="w-14 h-7 bg-zinc-800 rounded-full p-1 relative transition-colors">
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
              <div className="mb-8">
                <div className="mb-4">{plan.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-zinc-500 text-sm h-10">{plan.description}</p>
              </div>
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">CHF {plan.price}</span>
                  <span className="text-zinc-500">/mo</span>
                </div>
              </div>
              <div className="space-y-3 mb-10 flex-1">
                {plan.features.map((f, j) => (
                  <div className="flex items-start gap-3 text-sm" key={`feat-${j}`}><Check className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> <span>{f}</span></div>
                ))}
                {plan.notIncluded.map((f, j) => (
                  <div className="flex items-start gap-3 text-xs opacity-40" key={`not-${j}`}><X className="w-4 h-4 shrink-0 mt-0.5" /> <span className="line-through">{f}</span></div>
                ))}
              </div>
              <button onClick={() => navigate('/signup')} className={cn(
                "w-full py-4 rounded-2xl font-bold transition-all active:scale-95",
                plan.popular ? "bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20" : "bg-white text-black hover:bg-zinc-200"
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
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">{t('b2b_title')}</h2>
              <p className="text-zinc-400 max-w-2xl mx-auto text-lg">{t('b2b_subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              {/* Studio */}
              <div className="p-8 sm:p-10 bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-900 rounded-[2.5rem] transition-colors flex flex-col group">
                  <Briefcase className="w-10 h-10 text-zinc-500 mb-8 group-hover:text-blue-500 transition-colors" />
                  <h3 className="text-2xl md:text-3xl font-black mb-3">{t('sys1_title')}</h3>
                  <div className="flex items-baseline gap-2 mb-3">
                      <div className="text-xl md:text-2xl font-black leading-tight">{t('sys1_price')}</div>
                      <div className="text-xs font-bold text-zinc-500 whitespace-nowrap">{t('sys_vat')}</div>
                  </div>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 p-1.5 bg-zinc-900 rounded border border-zinc-800 self-start">{t('sys1_renewal')}</div>
                  <div className="text-xs font-semibold text-blue-400 mb-8">{t('sys1_seats')}</div>
                  <p className="text-zinc-400 font-medium mb-10 leading-relaxed flex-1">{t('sys1_desc')}</p>
                  <button onClick={() => navigate('/lead-form')} className="block w-full py-4 bg-zinc-800 text-white border border-zinc-700 text-center rounded-2xl font-bold hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
                    {t('b2b_cta')} <ArrowRight size={18} />
                  </button>
              </div>

              {/* Agency */}
              <div className="p-8 sm:p-10 bg-zinc-900 border border-blue-500/50 shadow-2xl md:scale-105 rounded-[2.5rem] relative flex flex-col group z-10">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">{t('sys2_title') === 'Agency OS' ? 'EXECUTION BOOSTER' : 'Execution Booster'}</div>
                  <Zap className="w-10 h-10 text-blue-500 mb-8" />
                  <h3 className="text-2xl md:text-3xl font-black mb-3">{t('sys2_title')}</h3>
                  <div className="flex items-baseline gap-2 mb-3">
                      <div className="text-xl md:text-2xl font-black leading-tight">{t('sys2_price')}</div>
                      <div className="text-xs font-bold text-zinc-500 whitespace-nowrap">{t('sys_vat')}</div>
                  </div>
                  <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3 p-1.5 bg-blue-500/10 rounded border border-blue-500/20 self-start">{t('sys2_renewal')}</div>
                  <div className="text-xs font-semibold text-blue-400 mb-8">{t('sys2_seats')}</div>
                  <p className="text-zinc-400 font-medium mb-10 leading-relaxed flex-1">{t('sys2_desc')}</p>
                  <button onClick={() => navigate('/lead-form')} className="block w-full py-4 bg-blue-600 text-white text-center rounded-2xl font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                    {t('b2b_cta')} <ArrowRight size={18} />
                  </button>
              </div>

              {/* Enterprise */}
              <div className="p-8 sm:p-10 bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-900 rounded-[2.5rem] transition-colors flex flex-col group">
                  <Shield className="w-10 h-10 text-emerald-500 mb-8 group-hover:text-blue-500 transition-colors" />
                  <h3 className="text-2xl md:text-3xl font-black mb-3">{t('sys3_title')}</h3>
                  <div className="flex items-baseline gap-2 mb-3">
                      <div className="text-xl md:text-2xl font-black leading-tight">{t('sys3_price')}</div>
                      <div className="text-xs font-bold text-zinc-500 whitespace-nowrap">{t('sys_vat')}</div>
                  </div>
                  <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-3 p-1.5 bg-emerald-500/10 rounded border border-emerald-500/20 self-start">{t('sys3_renewal')}</div>
                  <div className="text-xs font-semibold text-emerald-400 mb-8">{t('sys3_seats')}</div>
                  <p className="text-zinc-400 font-medium mb-10 leading-relaxed flex-1">{t('sys3_desc')}</p>
                  <button onClick={() => navigate('/lead-form')} className="block w-full py-4 bg-zinc-800 text-white border border-zinc-700 text-center rounded-2xl font-bold hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
                    {t('b2b_cta')} <ArrowRight size={18} />
                  </button>
              </div>
          </div>
        </div>

      </div>
    </div>
  );
}