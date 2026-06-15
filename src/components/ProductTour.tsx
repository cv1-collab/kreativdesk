import React, { useEffect, useState } from 'react';
import * as JoyrideModule from 'react-joyride';
import type { CallBackProps, Step } from 'react-joyride';
import { useTour } from '../contexts/TourContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useLocation } from 'react-router-dom';

// VITE ESM Kompatibilität
let JoyrideComponent: any = JoyrideModule;
if (typeof JoyrideModule !== 'function') {
  JoyrideComponent = (JoyrideModule as any).default || (JoyrideModule as any).Joyride;
}
if (typeof JoyrideComponent === 'object' && !JoyrideComponent.$$typeof) {
  JoyrideComponent = Object.values(JoyrideModule).find(val => typeof val === 'function') || (() => null);
}

export default function ProductTour() {
  const { isTourRunning, stopTour } = useTour();
  const { language } = useLanguage();
  const location = useLocation();
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

    const create = (target: string, content: string, placement: any = 'right', disableBeacon = false): Step => ({
      target, content, placement, disableBeacon,
      disableScrolling: true,
      disableScrollParentFix: true,
      floaterProps: { disableAnimation: true }
    });

    if (location.pathname.includes('/project/')) {
      // === PROJEKT-EBENE (Deep Dive in die Features) ===
      potentialSteps = [
        create('body', isGerman ? 'Willkommen im Projekt-Workspace! Hier brechen wir Datensilos auf: Architektur, Kommunikation und Finanzen fließen nahtlos ineinander.' : 'Welcome to the project workspace! All your data converges here seamlessly.', 'center', true),
        create('.tour-proj-dashboard', isGerman ? 'Die Kommandozentrale: Generiere per Knopfdruck PDF-Reportings, die Live-Daten aus Budgets, Mängeln und Timelines automatisch vereinen.' : 'Generate live PDF reports combining budgets, defects, and timelines instantly.'),
        create('.tour-proj-finance', isGerman ? 'Integriertes Ledger: Erfasse Spesen und Rechnungen direkt hier. Alles synchronisiert sich vollautomatisch mit dem globalen Firmenbudget.' : 'Integrated Ledger. Syncs automatically with your global company budget.'),
        create('.tour-proj-calendar', isGerman ? 'Smart Calendar: Plane Meilensteine und verknüpfe Deadlines direkt mit Aufgaben. Keine isolierten Termine mehr.' : 'Plan milestones and link deadlines directly to tasks.'),
        create('.tour-proj-bim', isGerman ? 'Spatial Design im Web: Lade IFC-Modelle hoch und betrachte die 3D-Architektur interaktiv direkt im Browser – ohne externe Software.' : 'Upload IFC models and view 3D architecture directly in your browser.'),
        create('.tour-proj-cad', isGerman ? 'Ausführungsplanung: Verwalte hochauflösende 2D-Grundrisse und vektorbasierte Schnitte für dein Team.' : 'Manage high-res 2D floor plans and vector cuts.'),
        create('.tour-proj-defects', isGerman ? 'Mängel-Tracking: Setze Pins direkt auf deine Pläne. Das System erstellt automatisch Tickets und delegiert sie an Partner.' : 'Drop pins on plans to automatically create and delegate defect tickets.'),
        create('.tour-proj-camera', isGerman ? 'Bau-Kamera: Verfolge den realen Baufortschritt oder Messeaufbau über Live-Feeds und Zeitraffer-Aufnahmen.' : 'Monitor site progress via live feeds and time-lapse.'),
        create('.tour-proj-whiteboard', isGerman ? 'AI-Whiteboard: Skizziere Layouts in Echtzeit mit dem Team und nutze die Gemini-KI, um visuelle Konzepte direkt per Prompt zu generieren.' : 'Real-time whiteboard with integrated AI concept generation.'),
        create('.tour-proj-meet', isGerman ? 'Seamless Communication: Starte Video-Calls direkt im System. Externe Partner betreten den Raum simpel per Link.' : 'Start video calls instantly. External partners join via simple links.'),
        create('.tour-proj-docs', isGerman ? 'Bauakte: Ein hochsicherer, verschlüsselter Datenraum für Verträge und Assets. Logisch und chronologisch verknüpft.' : 'Secure data room for contracts and assets.'),
        create('.tour-proj-pitch', isGerman ? 'Pitch Deck Studio: Nutze die Projektdaten, um hochprofessionelle, visuelle Präsentationen für deine Kunden zu rendern.' : 'Create highly professional visual presentations for clients.'),
        create('.tour-proj-team', isGerman ? 'Granulare Zugriffe: Bestimme exakt, welche Freelancer oder Agenturen welche Daten sehen und bearbeiten dürfen.' : 'Control exact permissions for freelancers and agencies.')
      ];
    } else if (location.pathname.startsWith('/admin')) {
      // === ADMIN-EBENE (Systemsteuerung) ===
      potentialSteps = [
        create('body', isGerman ? 'Willkommen im Maschinenraum (Root Access). Hier steuerst du die globale SaaS-Architektur.' : 'Welcome to the system machine room (Root Access).', 'center', true),
        create('.tour-admin-metrics', isGerman ? 'Echtzeit-Metriken: Überwache Server-Auslastungen, AI-Token-Verbrauch und globale Umsätze auf einen Blick.' : 'Monitor server loads, AI tokens, and global revenue in real-time.'),
        create('.tour-admin-tenants', isGerman ? 'Mandanten-Hub: Steuere Lizenzen, Limits und Sicherheitsfreigaben aller registrierten Firmen in deinem Ökosystem.' : 'Control licenses and security for all registered companies.'),
        create('.tour-admin-sales', isGerman ? 'Stripe-Integration: Verwalte globale Abonnements, Zahlungsströme und das gesamte System-Cashflow-Ledger.' : 'Manage global subscriptions and the system cashflow ledger.'),
        create('.tour-admin-brand', isGerman ? 'White-Labeling: Passe Logos, Typografie und Farb-Themes an die Corporate Identity deiner Kunden an.' : 'Customize logos and color themes for white-label clients.'),
        create('.tour-admin-support', isGerman ? 'Support-Desk: Alle User-Tickets fließen hier zusammen. Priorisiere und löse Probleme direkt im System.' : 'Manage and resolve all user support tickets centrally.'),
        create('.tour-admin-api', isGerman ? 'Webhook-Control: Konfiguriere API-Keys und Zapier-Schnittstellen für externe Systemintegrationen.' : 'Configure API keys and webhooks for external integrations.'),
        create('.tour-admin-system', isGerman ? 'Live-Terminal: Verfolge Datenbank-Transaktionen und System-Logs in Echtzeit.' : 'Track database transactions and system logs in real-time.')
      ];
    } else {
      // === COMPANY DASHBOARD (Das Big Picture) ===
      potentialSteps = [
        create('body', isGerman ? 'Willkommen im Kreativ-Desk OS! Das ist deine ganzheitliche Plattform für Spatial Design und Business-Management.' : 'Welcome to Kreativ-Desk OS! Your holistic platform for design and business.', 'center', true),
        create('.tour-dashboard', isGerman ? 'Der globale Puls: Hier fließen Projektstatus, Leads und Finanz-KPIs deines Unternehmens in einer Live-Übersicht zusammen.' : 'The global pulse: Project status, leads, and financial KPIs in one live view.'),
        create('.tour-projects', isGerman ? 'Portfolio-Management: Verwalte all deine Projekte. Ein Klick bringt dich tief in die spezifischen 3D- und Kollaborations-Tools.' : 'Manage all projects. One click dives into specific 3D and collaboration tools.'),
        create('.tour-finance', isGerman ? 'Globales Finanz-Cockpit: Überwache den gesamten Cashflow, Betriebskosten (OpEx) und globale Budgets.' : 'Monitor global cashflow, operating expenses, and budgets.'),
        create('.tour-documents', isGerman ? 'Zentrales Firmen-Archiv: Ein sicherer Cloud-Ordnerbaum für deine HR-Dokumente, Verträge und Branding-Assets.' : 'Secure cloud structure for HR docs, contracts, and assets.'),
        create('.tour-templates', isGerman ? 'Workflow-Booster: Speichere intelligente Textbausteine und Layout-Vorlagen, um Routineaufgaben zu automatisieren.' : 'Save text blocks and templates to automate routine tasks.'),
        create('.tour-leads', isGerman ? 'Lead-Engine: Eingehende Kundenanfragen (z.B. über deine Web-Formulare) landen strukturiert und bearbeitbar hier.' : 'Incoming client requests land here structured and ready to process.'),
        create('.tour-crm', isGerman ? 'Smart CRM: Das Zentrum deines Netzwerks. Lade Mitarbeiter und Partner per Magic Link direkt in dein Ökosystem ein.' : 'The core of your network. Invite team members via magic links.'),
        create('.tour-agenda', isGerman ? 'Unternehmens-Timeline: Behalte Tagesrapporte, Verfügbarkeiten und die globale Agenda deines Teams im Blick.' : 'Track daily reports, availabilities, and the global team agenda.'),
        create('.tour-settings', isGerman ? 'System-Steuerung: Konfiguriere dein Firmenprofil, die MWST-Nummer und verwalte deine aktiven SaaS-Lizenzen.' : 'Configure company profiles, VAT, and active SaaS licenses.')
      ];
    }

    const validSteps = potentialSteps.filter(s => {
      if (s.target === 'body') return true;
      const el = document.querySelector(s.target as string) as HTMLElement;
      return el && el.offsetWidth > 0; 
    });

    setSteps(validSteps);
  }, [isTourRunning, location.pathname, language]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action } = data;
    if (['finished', 'skipped'].includes(status) || action === 'close') {
      stopTour();
      setSteps([]);
    }
  };

  if (typeof JoyrideComponent !== 'function' && typeof JoyrideComponent !== 'object') return null;

  return (
    <JoyrideComponent
      run={isTourRunning && steps.length > 0}
      steps={steps}
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