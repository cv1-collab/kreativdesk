import React, { useEffect, useState } from 'react';
import * as JoyrideModule from 'react-joyride';
import type { Step } from 'react-joyride';
import { useTour } from '../contexts/TourContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';
import { Sparkles, Shield, DollarSign, Calendar, Target, LayoutDashboard, Settings, Megaphone, Users, Folder, LayoutTemplate, Briefcase, Camera, Video, MonitorPlay } from 'lucide-react';

// VITE ESM Kompatibilität
let JoyrideComponent: any = JoyrideModule;
if (typeof JoyrideModule !== 'function') {
  JoyrideComponent = (JoyrideModule as any)['default'] || (JoyrideModule as any).Joyride;
}
if (typeof JoyrideComponent === 'object' && !JoyrideComponent.$$typeof) {
  JoyrideComponent = Object.values(JoyrideModule).find(val => typeof val === 'function') || (() => null);
}

export default function ProductTour() {
  const { isTourRunning, stopTour } = useTour();
  const { language } = useLanguage();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [steps, setSteps] = useState<Step[]>([]);

  useEffect(() => {
    if (isTourRunning) {
      stopTour();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (!isTourRunning) {
      setSteps([]);
      return;
    }

    const isGerman = language === 'de';
    let potentialSteps: Step[] = [];

    const create = (target: string, title: string, content: string, IconComponent: any, placement: any = 'right', disableBeacon = false): any => ({
      target, 
      content: (
        <div className="flex flex-col gap-3 p-1 text-left">
          <div className="flex items-center gap-3 border-b border-border/50 pb-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-accent-ai/10 border border-accent-ai/20 flex items-center justify-center shrink-0">
              <IconComponent size={20} className="text-accent-ai" />
            </div>
            <span className="font-bold text-lg text-text-primary leading-tight">{title}</span>
          </div>
          <p className="text-sm text-text-muted leading-relaxed font-medium">{content}</p>
          {target !== 'body' && (
            <div className="mt-2 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex gap-3 items-start">
              <Sparkles size={16} className="text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-300/90 font-medium leading-relaxed">
                {isGerman ? 'Interaktives Modul: Klicke auf dieses Element, um tiefere Funktionen und Automatisierungen freizuschalten.' : 'Interactive Module: Click this element to unlock deeper features and automations.'}
              </p>
            </div>
          )}
        </div>
      ),
      placement, disableBeacon,
      disableScrolling: true,
      disableScrollParentFix: true,
      floaterProps: { disableAnimation: true }
    });

    if (location.pathname.includes('/project/')) {
      // === PROJEKT-EBENE (Deep Dive in die Features) ===
      potentialSteps = [
        create('body', isGerman ? 'Projekt-Workspace' : 'Project Workspace', isGerman ? 'Willkommen im Projekt-Workspace! Hier brechen wir Datensilos auf: Architektur, Kommunikation und Finanzen fließen nahtlos ineinander.' : 'Welcome to the project workspace! All your data converges here seamlessly.', Briefcase, 'center', true),
        create('.tour-proj-dashboard', isGerman ? 'Kommandozentrale' : 'Dashboard', isGerman ? 'Generiere per Knopfdruck PDF-Reportings, die Live-Daten aus Budgets, Mängeln und Timelines automatisch vereinen.' : 'Generate live PDF reports combining budgets, defects, and timelines instantly.', LayoutDashboard),
        create('.tour-proj-finance', isGerman ? 'Integriertes Ledger' : 'Finance Ledger', isGerman ? 'Erfasse Spesen und Rechnungen direkt hier. Alles synchronisiert sich vollautomatisch mit dem globalen Firmenbudget.' : 'Integrated Ledger. Syncs automatically with your global company budget.', DollarSign),
        create('.tour-proj-calendar', isGerman ? 'Smart Calendar' : 'Smart Calendar', isGerman ? 'Plane Meilensteine und verknüpfe Deadlines direkt mit Aufgaben. Keine isolierten Termine mehr.' : 'Plan milestones and link deadlines directly to tasks.', Calendar),
        create('.tour-proj-bim', isGerman ? 'Spatial Design im Web' : 'Web Spatial Design', isGerman ? 'Lade IFC-Modelle hoch und betrachte die 3D-Architektur interaktiv direkt im Browser – ohne externe Software.' : 'Upload IFC models and view 3D architecture directly in your browser.', Target),
        create('.tour-proj-cad', isGerman ? 'Ausführungsplanung' : 'CAD Planning', isGerman ? 'Verwalte hochauflösende 2D-Grundrisse und vektorbasierte Schnitte für dein Team.' : 'Manage high-res 2D floor plans and vector cuts.', Folder),
        create('.tour-proj-defects', isGerman ? 'Mängel-Tracking' : 'Defect Tracking', isGerman ? 'Setze Pins direkt auf deine Pläne. Das System erstellt automatisch Tickets und delegiert sie an Partner.' : 'Drop pins on plans to automatically create and delegate defect tickets.', Target),
        create('.tour-proj-camera', isGerman ? 'Bau-Kamera' : 'Site Camera', isGerman ? 'Verfolge den realen Baufortschritt oder Messeaufbau über Live-Feeds und Zeitraffer-Aufnahmen.' : 'Monitor site progress via live feeds and time-lapse.', Camera),
        create('.tour-proj-whiteboard', isGerman ? 'AI-Whiteboard' : 'AI Whiteboard', isGerman ? 'Skizziere Layouts in Echtzeit mit dem Team und nutze die Gemini-KI, um visuelle Konzepte direkt per Prompt zu generieren.' : 'Real-time whiteboard with integrated AI concept generation.', Sparkles),
        create('.tour-proj-meet', isGerman ? 'Seamless Communication' : 'Video Meetings', isGerman ? 'Starte Video-Calls direkt im System. Externe Partner betreten den Raum simpel per Link.' : 'Start video calls instantly. External partners join via simple links.', Video),
        create('.tour-proj-docs', isGerman ? 'Bauakte' : 'Project Docs', isGerman ? 'Ein hochsicherer, verschlüsselter Datenraum für Verträge und Assets. Logisch und chronologisch verknüpft.' : 'Secure data room for contracts and assets.', Folder),
        create('.tour-proj-pitch', isGerman ? 'Pitch Deck Studio' : 'Pitch Deck Studio', isGerman ? 'Nutze die Projektdaten, um hochprofessionelle, visuelle Präsentationen für deine Kunden zu rendern.' : 'Create highly professional visual presentations for clients.', MonitorPlay),
        create('.tour-proj-team', isGerman ? 'Granulare Zugriffe' : 'Granular Access', isGerman ? 'Bestimme exakt, welche Freelancer oder Agenturen welche Daten sehen und bearbeiten dürfen.' : 'Control exact permissions for freelancers and agencies.', Users)
      ];
    } else if (location.pathname.startsWith('/admin')) {
      // === ADMIN-EBENE (Systemsteuerung) ===
      potentialSteps = [
        create('body', isGerman ? 'Systemsteuerung' : 'System Control', isGerman ? 'Willkommen im Maschinenraum (Root Access). Hier steuerst du die globale SaaS-Architektur.' : 'Welcome to the system machine room (Root Access).', Shield, 'center', true),
        create('.tour-admin-metrics', isGerman ? 'Echtzeit-Metriken' : 'Live Metrics', isGerman ? 'Überwache Server-Auslastungen, AI-Token-Verbrauch und globale Umsätze auf einen Blick.' : 'Monitor server loads, AI tokens, and global revenue in real-time.', Target),
        create('.tour-admin-tenants', isGerman ? 'Mandanten-Hub' : 'Tenant Hub', isGerman ? 'Steuere Lizenzen, Limits und Sicherheitsfreigaben aller registrierten Firmen in deinem Ökosystem.' : 'Control licenses and security for all registered companies.', Users),
        create('.tour-admin-sales', isGerman ? 'Stripe-Integration' : 'Stripe Integration', isGerman ? 'Verwalte globale Abonnements, Zahlungsströme und das gesamte System-Cashflow-Ledger.' : 'Manage global subscriptions and the system cashflow ledger.', DollarSign),
        create('.tour-admin-brand', isGerman ? 'White-Labeling' : 'White-Labeling', isGerman ? 'Passe Logos, Typografie und Farb-Themes an die Corporate Identity deiner Kunden an.' : 'Customize logos and color themes for white-label clients.', Sparkles),
        create('.tour-admin-support', isGerman ? 'Support-Desk' : 'Support Desk', isGerman ? 'Alle User-Tickets fließen hier zusammen. Priorisiere und löse Probleme direkt im System.' : 'Manage and resolve all user support tickets centrally.', Target),
        create('.tour-admin-api', isGerman ? 'Webhook-Control' : 'Webhook Control', isGerman ? 'Konfiguriere API-Keys und Zapier-Schnittstellen für externe Systemintegrationen.' : 'Configure API keys and webhooks for external integrations.', Settings),
        create('.tour-admin-system', isGerman ? 'Live-Terminal' : 'Live Terminal', isGerman ? 'Verfolge Datenbank-Transaktionen und System-Logs in Echtzeit.' : 'Track database transactions and system logs in real-time.', LayoutDashboard)
      ];
    } else {
      // === COMPANY DASHBOARD (Das Big Picture) ===
      potentialSteps = [
        create('body', isGerman ? 'Kreativ-Desk OS' : 'Kreativ-Desk OS', isGerman ? 'Das ist deine ganzheitliche Plattform für Spatial Design und Business-Management.' : 'Welcome to Kreativ-Desk OS! Your holistic platform for design and business.', Sparkles, 'center', true),
        create('.tour-dashboard', isGerman ? 'Der globale Puls' : 'Global Pulse', isGerman ? 'Hier fließen Projektstatus, Leads und Finanz-KPIs deines Unternehmens in einer Live-Übersicht zusammen.' : 'The global pulse: Project status, leads, and financial KPIs in one live view.', LayoutDashboard),
        create('.tour-projects', isGerman ? 'Portfolio-Management' : 'Portfolio Management', isGerman ? 'Verwalte all deine Projekte. Ein Klick bringt dich tief in die spezifischen 3D- und Kollaborations-Tools.' : 'Manage all projects. One click dives into specific 3D and collaboration tools.', Briefcase),
        create('.tour-finance', isGerman ? 'Globales Finanz-Cockpit' : 'Finance Cockpit', isGerman ? 'Überwache den gesamten Cashflow, Betriebskosten (OpEx) und globale Budgets.' : 'Monitor global cashflow, operating expenses, and budgets.', DollarSign),
        create('.tour-documents', isGerman ? 'Zentrales Firmen-Archiv' : 'Company Archive', isGerman ? 'Ein sicherer Cloud-Ordnerbaum für deine HR-Dokumente, Verträge und Branding-Assets.' : 'Secure cloud structure for HR docs, contracts, and assets.', Folder),
        create('.tour-templates', isGerman ? 'Workflow-Booster' : 'Workflow Booster', isGerman ? 'Speichere intelligente Textbausteine und Layout-Vorlagen, um Routineaufgaben zu automatisieren.' : 'Save text blocks and templates to automate routine tasks.', LayoutTemplate),
        create('.tour-leads', isGerman ? 'Lead-Engine' : 'Lead Engine', isGerman ? 'Eingehende Kundenanfragen landen strukturiert und bearbeitbar direkt hier im System.' : 'Incoming client requests land here structured and ready to process.', Megaphone),
        create('.tour-crm', isGerman ? 'Smart CRM' : 'Smart CRM', isGerman ? 'Das Zentrum deines Netzwerks. Lade Mitarbeiter und Partner per Magic Link direkt in dein Ökosystem ein.' : 'The core of your network. Invite team members via magic links.', Users),
        create('.tour-agenda', isGerman ? 'Unternehmens-Timeline' : 'Company Timeline', isGerman ? 'Behalte Tagesrapporte, Verfügbarkeiten und die globale Agenda deines Teams im Blick.' : 'Track daily reports, availabilities, and the global team agenda.', Calendar),
        create('.tour-settings', isGerman ? 'System-Steuerung' : 'System Control', isGerman ? 'Konfiguriere dein Firmenprofil, die MWST-Nummer und verwalte deine aktiven SaaS-Lizenzen.' : 'Configure company profiles, VAT, and active SaaS licenses.', Settings)
      ];
    }

    const validSteps = potentialSteps.filter(s => {
      if (s.target === 'body') return true;
      const el = document.querySelector(s.target as string) as HTMLElement;
      return el && el.offsetWidth > 0; 
    });

    setSteps(validSteps);
  }, [isTourRunning, location.pathname, language]);

  const handleJoyrideCallback = async (data: any) => {
    const { status, action } = data;
    if (['finished', 'skipped'].includes(status) || action === 'close') {
      stopTour();
      setSteps([]);
      
      if (currentUser?.uid) {
        // Fallback to localStorage to ensure the tour doesn't aggressively restart
        localStorage.setItem(`tour_${currentUser.uid}`, 'true');
        if (db) {
          try {
            await updateDoc(doc(db, 'users', currentUser.uid), { hasSeenTour: true });
          } catch (error) {
            console.error("Fehler beim Speichern des Tour-Status:", error);
          }
        }
      }
    }
  };

  if (typeof JoyrideComponent !== 'function' && typeof JoyrideComponent !== 'object') return null;

  return (
    <JoyrideComponent
      run={isTourRunning && steps.length > 0}
      steps={steps}
      callback={handleJoyrideCallback}
      continuous
      showSkipButton
      scrollToFirstStep={false}
      locale={{
        back: language === 'de' ? 'Zurück' : 'Back',
        close: language === 'de' ? 'Schließen' : 'Close',
        last: language === 'de' ? 'Fertig' : 'Finish',
        next: language === 'de' ? 'Weiter' : 'Next',
        skip: language === 'de' ? 'Tour beenden' : 'Skip',
      }}
      styles={{ 
        options: { 
          zIndex: 100000, 
          primaryColor: '#3b82f6', 
          backgroundColor: '#18181b', 
          textColor: '#f4f4f5',
          overlayColor: 'rgba(0, 0, 0, 0.75)',
          arrowColor: '#18181b',
        },
        tooltip: {
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.02)',
          padding: '24px',
        },
        tooltipContainer: {
          textAlign: 'left',
          fontSize: '14px',
          lineHeight: '1.6',
          letterSpacing: '-0.01em',
        },
        buttonNext: {
          backgroundColor: '#3b82f6',
          borderRadius: '10px',
          fontWeight: '700',
          padding: '10px 20px',
          boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
          transition: 'all 0.2s ease',
          outline: 'none',
        },
        buttonBack: {
          color: '#a1a1aa',
          marginRight: '14px',
          fontWeight: '600',
        },
        buttonSkip: {
          color: '#ef4444',
          fontWeight: '600',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          padding: '8px 16px',
          borderRadius: '8px',
        }
      }}
    />
  );
}