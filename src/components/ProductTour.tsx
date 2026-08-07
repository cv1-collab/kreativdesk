import React, { useEffect, useState } from 'react';
import { Joyride, Step } from 'react-joyride';
import { useTour } from '../contexts/TourContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { 
  Sparkles, Shield, DollarSign, Calendar, Target, LayoutDashboard, 
  Settings, Megaphone, Users, Folder, LayoutTemplate, Briefcase, 
  Camera, Video, MonitorPlay, Box, Layers
} from 'lucide-react';

export default function ProductTour() {
  const { isTourRunning, stopTour } = useTour();
  const { language } = useLanguage();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [steps, setSteps] = useState<Step[]>([]);

  const isGerman = language === 'de';

  useEffect(() => {
    if (!isTourRunning) {
      setSteps([]);
      return;
    }

    const buildStepContent = (
      stepNum: number, 
      total: number, 
      title: string, 
      content: string, 
      IconComponent: any, 
      proTip?: string
    ) => (
      <div className="flex flex-col gap-3 p-1 text-left max-w-sm text-white">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 shadow-md text-blue-400">
              <IconComponent size={20} />
            </div>
            <div>
              <span className="font-extrabold text-base text-white leading-tight block">{title}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                {isGerman ? `Schritt ${stepNum} von ${total}` : `Step ${stepNum} of ${total}`}
              </span>
            </div>
          </div>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed font-normal">{content}</p>
        {proTip && (
          <div className="mt-2 bg-blue-950/60 border border-blue-500/30 rounded-xl p-3 flex gap-2.5 items-start">
            <Sparkles size={16} className="text-blue-400 shrink-0 mt-0.5" />
            <div className="text-[11px] font-medium leading-relaxed text-zinc-300">
              <strong className="block mb-0.5 text-blue-300 font-bold">{isGerman ? 'Pro-Tipp:' : 'Pro Tip:'}</strong>
              {proTip}
            </div>
          </div>
        )}
      </div>
    );

    const createStep = (
      target: string, 
      stepNum: number, 
      total: number, 
      title: string, 
      content: string, 
      IconComponent: any, 
      proTip?: string,
      placement: any = 'right', 
      disableBeacon = true
    ): Step => ({
      target, 
      content: buildStepContent(stepNum, total, title, content, IconComponent, proTip),
      placement, 
      disableBeacon,
      disableScrolling: true,
      disableScrollParentFix: true,
      floaterProps: { disableAnimation: true }
    } as any);

    let newSteps: Step[] = [];

    if (location.pathname.includes('/project/')) {
      const total = 13;
      newSteps = [
        createStep('body', 1, total, isGerman ? 'Projekt-Workspace' : 'Project Workspace', isGerman ? 'Willkommen in deiner zentralen Baustellen- & Projektzentrale! Hier fließen Architektur, Termine, Budgets und Team-Kollaboration nahtlos zusammen.' : 'Welcome to your central project workspace! Architecture, schedules, budgets, and collaboration converge here.', Briefcase, isGerman ? 'Nutze die Tabs links zur schnellen Navigation zwischen den Fachbereichen.' : 'Use the left sidebar tabs for rapid navigation.', 'center', true),
        createStep('.tour-proj-dashboard', 2, total, isGerman ? 'Kommandozentrale' : 'Dashboard', isGerman ? 'Generiere per Knopfdruck PDF-Reportings, die Live-Daten aus Budgets, Mängeln und Timelines automatisch vereinen.' : 'Generate live PDF reports combining budgets, defects, and timelines instantly.', LayoutDashboard, isGerman ? 'Exportiere druckreife Bautagebücher direkt im Universal PDF Studio.' : 'Export print-ready reports in the Universal PDF Studio.', 'right'),
        createStep('.tour-proj-finance', 3, total, isGerman ? 'Integriertes Projekt-Ledger' : 'Finance Ledger', isGerman ? 'Erfasse Baustellen-Spesen und Rechnungen direkt hier. Alles synchronisiert sich vollautomatisch mit den BKP-Kosten-Gruppen.' : 'Integrated Ledger. Syncs automatically with cost groups and global company budget.', DollarSign, isGerman ? 'Demo-Projekte laden automatisch realistische BKP 1-9 Budgetgruppen.' : 'Demo projects load realistic BKP budget structures automatically.', 'right'),
        createStep('.tour-proj-calendar', 4, total, isGerman ? 'Smart Calendar & Gantt' : 'Smart Calendar', isGerman ? 'Plane Meilensteine, Bauphasen und verknüpfe Deadlines direkt mit Aufgaben. Keine isolierten Termine mehr.' : 'Plan milestones and link deadlines directly to tasks.', Calendar, isGerman ? 'Wechsle zwischen Gantt-Chart und Kalenderansicht.' : 'Switch effortlessly between Gantt chart and calendar view.', 'right'),
        createStep('.tour-proj-bim', 5, total, isGerman ? '3D BIM Viewer im Browser' : 'Web 3D BIM Viewer', isGerman ? 'Lade IFC-Modelle hoch und betrachte die 3D-Architektur interaktiv direkt im Browser – ohne teure CAD-Software.' : 'Upload IFC models and view 3D architecture directly in your browser.', Box, isGerman ? 'Klicke auf 3D-Bauteile, um sofort Geometrie- & Materialdaten einzusehen.' : 'Click 3D elements to inspect geometry & material parameters.', 'right'),
        createStep('.tour-proj-cad', 6, total, isGerman ? '2D Pläne & Ausführung' : '2D CAD Plans', isGerman ? 'Verwalte hochauflösende 2D-Grundrisse und vektorbasierte Schnittzeichnungen für Bauleiter und Handwerker.' : 'Manage high-res 2D floor plans and vector cuts.', Folder, isGerman ? 'Mängel lassen sich zentimetergenau als PIN auf dem Plan platzieren.' : 'Drop pinpoint defects directly on 2D floor plans.', 'right'),
        createStep('.tour-proj-defects', 7, total, isGerman ? 'Mängel- & Ticket-Tracking' : 'Defect Tracking', isGerman ? 'Erfasse Baumängel inklusive Fotos. Das PWA-System speichert Daten auf der Baustelle auch offline und synchronisiert bei Verbindung.' : 'Record defect tickets with photos. Offline sync handles field data seamlessly.', Target, isGerman ? 'Mängel lassen sich auf dem Smartphone oder iPad offline aufnehmen.' : 'Record defects on mobile/iPad even without active internet connection.', 'right'),
        createStep('.tour-proj-camera', 8, total, isGerman ? 'Bau-Kamera & Zeitraffer' : 'Site Camera', isGerman ? 'Verfolge den realen Baufortschritt oder Messeaufbau über Live-Feeds und Zeitraffer-Aufnahmen.' : 'Monitor site progress via live feeds and time-lapse snapshots.', Camera, isGerman ? 'Dokumentiere den Fortschritt stündlich für Bauherren.' : 'Document hourly construction milestones for stakeholders.', 'right'),
        createStep('.tour-proj-whiteboard', 9, total, isGerman ? 'AI-Whiteboard' : 'AI Whiteboard', isGerman ? 'Skizziere Layouts in Echtzeit mit dem Team und nutze die Gemini-KI, um visuelle Konzepte direkt per Prompt zu generieren.' : 'Real-time whiteboard with integrated AI concept generation.', Sparkles, isGerman ? 'Generiere Moodboards per KI-Prompt direkt auf dem Board.' : 'Generate visual moodboards via AI prompts directly on canvas.', 'right'),
        createStep('.tour-proj-meet', 10, total, isGerman ? 'Nahtlose Kommunikation' : 'Video Meetings', isGerman ? 'Starte Video-Calls und Bau-Besprechungen direkt im System. Externe Partner betreten den Raum simpel per Einladungs-Link.' : 'Start video calls instantly. External partners join via simple magic links.', Video, isGerman ? 'Integriertes Chat & Filesharing während des Calls.' : 'Integrated chat and document sharing during video calls.', 'right'),
        createStep('.tour-proj-docs', 11, total, isGerman ? 'Digitale Bauakte' : 'Project Docs', isGerman ? 'Ein hochsicherer, verschlüsselter Datenraum für Verträge, Pläne und Baufein-Protokolle.' : 'Secure data room for contracts and construction assets.', Folder, isGerman ? 'Mit integrierter Volltext-Suche und Vorschau-Funktion.' : 'Built-in full-text search and instant file previews.', 'right'),
        createStep('.tour-proj-pitch', 12, total, isGerman ? 'Pitch Deck Studio' : 'Pitch Deck Studio', isGerman ? 'Nutze die Live-Projektdaten, um hochprofessionelle, visuelle Präsentationen für deine Kunden zu rendern.' : 'Create highly professional visual presentations for clients.', MonitorPlay, isGerman ? 'Interaktive Slides für Investoren und Bauherren.' : 'Interactive slide decks for investors and clients.', 'right'),
        createStep('.tour-proj-team', 13, total, isGerman ? 'Granulare Rechteverwaltung' : 'Granular Access', isGerman ? 'Bestimme exakt, welche Bauleiter, Subunternehmer oder Bauherren welche Daten sehen und bearbeiten dürfen.' : 'Control exact permissions for contractors and partners.', Users, isGerman ? 'Setze Rollen auf Owner, Admin, Editor oder Viewer.' : 'Assign explicit Owner, Admin, Editor, or Viewer roles.', 'right')
      ];
    } else if (location.pathname.startsWith('/admin')) {
      const total = 8;
      newSteps = [
        createStep('body', 1, total, isGerman ? 'Systemsteuerung (Root Access)' : 'System Control', isGerman ? 'Willkommen im Maschinenraum von Kreativ Desk. Hier verwaltest du die globale SaaS-Plattform, Mandanten und System-Logs.' : 'Welcome to the system machine room. Manage your global SaaS platform, tenants, and system logs.', Shield, isGerman ? 'Root-Zugriff ist nur für autorisierte Super-Admins freigeschaltet.' : 'Root access is restricted to authorized super administrators.', 'center', true),
        createStep('.tour-admin-metrics', 2, total, isGerman ? 'Echtzeit-Metriken' : 'Live Metrics', isGerman ? 'Überwache aktiven Nutzerzuwachs, System-Umsatz und Datenbank-Auslastung auf einen Blick.' : 'Monitor user growth, system revenue, and database health in real time.', Target, isGerman ? 'Zeigt Live-Transaktionen aus dem Stripe Ledger an.' : 'Displays live transactions from your Stripe ledger.', 'right'),
        createStep('.tour-admin-leads', 3, total, isGerman ? 'B2B Leads & Anfragen' : 'Lead Engine', isGerman ? 'Verwalte eingehende B2B-Anfragen von der Landingpage in Echtzeit.' : 'Manage incoming B2B requests from the landing page in real time.', Megaphone, isGerman ? 'Erhalte automatische Push-Signale bei neuen Leads.' : 'Receive live push signals when new leads arrive.', 'right'),
        createStep('.tour-admin-tenants', 4, total, isGerman ? 'Mandanten- & Nutzer-Hub' : 'Tenant Hub', isGerman ? 'Steuere Lizenzen, Seat-Limits (`max_seats`) und Abo-Tarife aller registrierten Unternehmen.' : 'Control licenses, seat limits, and subscriptions for all companies.', Users, isGerman ? 'Passe Seat-Limits für Enterprise-Kunden manuell an.' : 'Adjust seat limits for enterprise clients on the fly.', 'right'),
        createStep('.tour-admin-sales', 5, total, isGerman ? 'Stripe & Abrechnung' : 'Stripe Integration', isGerman ? 'Verwalte globale Abonnements, Zahlungsströme und manuelle Rechnungen.' : 'Manage global subscriptions, cashflows, and manual invoicing.', DollarSign, isGerman ? 'Direkter Sprung ins Stripe Customer Portal.' : 'Direct shortcut to Stripe Customer Portal.', 'right'),
        createStep('.tour-admin-brand', 6, total, isGerman ? 'White-Label Branding' : 'White-Labeling', isGerman ? 'Passe Logos, Stammdaten und den globalen Wartungsmodus an.' : 'Customize master logos, corporate identity, and maintenance mode.', Sparkles, isGerman ? 'Wartungsmodus sperrt bei Wartungen reguläre Zugänge.' : 'Maintenance mode locks regular user sessions during updates.', 'right'),
        createStep('.tour-admin-support', 7, total, isGerman ? 'Central Support Desk' : 'Support Desk', isGerman ? 'Alle Kundentickets fließen zentral hier zusammen und lassen sich priorisieren.' : 'Manage and resolve all customer support tickets centrally.', Target, isGerman ? 'Schneller Überblick über offene und gelöste Tickets.' : 'Clear overview of open vs resolved user tickets.', 'right'),
        createStep('.tour-admin-api', 8, total, isGerman ? 'API-Keys & Webhooks' : 'API & Webhooks', isGerman ? 'Generiere API-Schlüssel für externe Systemintegrationen und Schnittstellen.' : 'Generate API keys and webhooks for external integrations.', Settings, isGerman ? 'API Keys lassen sich per Klick kopieren oder widerrufen.' : 'API keys can be copied or revoked in one click.', 'right')
      ];
    } else {
      const total = 9;
      newSteps = [
        createStep('body', 1, total, isGerman ? 'Kreativ-Desk OS' : 'Kreativ-Desk OS', isGerman ? 'Willkommen bei Kreativ-Desk OS! Deine ganzheitliche Plattform für Spatial Design, Baustellen-Management und Unternehmens-Steuerung.' : 'Welcome to Kreativ-Desk OS! Your holistic platform for spatial design, site management, and business control.', Sparkles, isGerman ? 'In wenigen Schritten entdeckst du die wichtigsten Funktionen.' : 'Discover all core capabilities in just a few quick steps.', 'center', true),
        createStep('.tour-dashboard', 2, total, isGerman ? 'Der globale Puls' : 'Global Pulse', isGerman ? 'Hier fließen Projektstatus, offene Leads und Finanz-KPIs deines Unternehmens in einer Live-Übersicht zusammen.' : 'The global pulse: Project status, leads, and financial KPIs in one live view.', LayoutDashboard, isGerman ? 'Klicke auf die KPI-Karten, um direkt in die Details zu springen.' : 'Click KPI cards to jump directly into detailed views.', 'right'),
        createStep('.tour-projects', 3, total, isGerman ? 'Portfolio-Management' : 'Portfolio Management', isGerman ? 'Verwalte all deine Bau- & Designprojekte. Ein Klick bringt dich tief in die 3D- und Kollaborations-Tools.' : 'Manage all projects. One click dives into specific 3D and collaboration tools.', Briefcase, isGerman ? 'Hier siehst du den Status und Fortschritt aller aktiven Projekte.' : 'View status and progress for all active project environments.', 'right'),
        createStep('.tour-finance', 4, total, isGerman ? 'Globales Finanz-Cockpit' : 'Finance Cockpit', isGerman ? 'Überwache den gesamten Firmen-Cashflow, Betriebskosten (OpEx) und BKP-Kostenstellen.' : 'Monitor global cashflow, operating expenses, and budgets.', DollarSign, isGerman ? 'Erstelle professionelle Offerten und Rechnungen als PDF.' : 'Generate professional quotes and invoices as PDFs.', 'right'),
        createStep('.tour-documents', 5, total, isGerman ? 'Firmen-Archiv & Assets' : 'Company Archive', isGerman ? 'Ein sicherer Cloud-Ordnerbaum für deine HR-Dokumente, Verträge und Branding-Assets.' : 'Secure cloud folder structure for HR docs, contracts, and branding assets.', Folder, isGerman ? 'Dokumente lassen sich kategorisieren und verschlüsselt speichern.' : 'Store and categorize assets with end-to-end cloud encryption.', 'right'),
        createStep('.tour-templates', 6, total, isGerman ? 'Workflow-Booster' : 'Workflow Booster', isGerman ? 'Speichere intelligente Bausteine und Layout-Vorlagen, um Routineaufgaben zu automatisieren.' : 'Save templates and reusable blocks to automate routine work.', LayoutTemplate, isGerman ? 'Spare wertvolle Zeit bei wiederkehrenden Angeboten.' : 'Save time on recurring client offers and site protocols.', 'right'),
        createStep('.tour-leads', 7, total, isGerman ? 'Leads & Kundenanfragen' : 'Lead Engine', isGerman ? 'Erfasse und verwalte Kundendaten und eingehende Projekt-Anfragen direkt im Workspace.' : 'Capture and manage inbound customer leads directly in your workspace.', Megaphone, isGerman ? 'Neue Leads lassen sich direkt in aktive Projekte umwandeln.' : 'Convert new leads into active project environments.', 'right'),
        createStep('.tour-crm', 8, total, isGerman ? 'Team & Partner-Netzwerk' : 'Team Network', isGerman ? 'Das Zentrum deines Netzwerks. Lade Mitarbeiter und externe Partner per E-Mail in dein Ökosystem ein.' : 'The core of your network. Invite team members via magic links.', Users, isGerman ? 'Behalte den Überblick über verfügbare Lizenzen und Rollen.' : 'Keep track of available licenses and company roles.', 'right'),
        createStep('.tour-settings', 9, total, isGerman ? 'System-Einstellungen & Abos' : 'System Settings', isGerman ? 'Konfiguriere dein Firmenprofil, MWST-Stammdaten und verwalte deine aktiven Stripe-Lizenzen.' : 'Configure company profiles, VAT, and active SaaS licenses.', Settings, isGerman ? 'Hier kannst du jederzeit dein Abo upgraden oder verwalten.' : 'Upgrade or manage your subscription plan anytime.', 'right')
      ];
    }

    const validSteps = newSteps.filter(step => {
      if (typeof step.target === 'string') {
        if (step.target === 'body') return true;
        return !!document.querySelector(step.target);
      }
      return true;
    });

    setSteps(validSteps);
  }, [isTourRunning, location.pathname, language]);

  const handleJoyrideCallback = async (data: any) => {
    const { status, action } = data;
    if (['finished', 'skipped'].includes(status) || action === 'close') {
      stopTour();
      setSteps([]);
      
      if (currentUser?.uid) {
        localStorage.setItem(`tour_${currentUser.uid}`, 'true');
        localStorage.setItem(`tour_completed_${currentUser.uid}`, 'true');
        try {
          await supabase.from('profiles').update({ has_seen_tour: true }).eq('id', currentUser.uid);
        } catch (e) {
          console.error('Error saving tour completion:', e);
        }
      }
    }
  };

  if (!isTourRunning || steps.length === 0) return null;

  return (
    <Joyride
      {...({
        run: isTourRunning && steps.length > 0,
        steps,
        continuous: true,
        showSkipButton: true,
        showProgress: true,
        locale: {
          back: isGerman ? 'Zurück' : 'Back',
          close: isGerman ? 'Schließen' : 'Close',
          last: isGerman ? 'Tour Beenden' : 'Finish Tour',
          next: isGerman ? 'Weiter' : 'Next',
          skip: isGerman ? 'Überspringen' : 'Skip',
        },
        callback: handleJoyrideCallback,
        styles: {
          options: {
            primaryColor: '#3b82f6',
            backgroundColor: '#18181b',
            textColor: '#f4f4f5',
            arrowColor: '#18181b',
            overlayColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 100000,
          },
          tooltip: {
            borderRadius: '1.25rem',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '1.25rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          },
          tooltipContainer: {
            textAlign: 'left',
          },
          buttonNext: {
            backgroundColor: '#3b82f6',
            borderRadius: '0.75rem',
            padding: '0.5rem 1.25rem',
            fontSize: '0.875rem',
            fontWeight: '700',
            color: '#ffffff',
            boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
          },
          buttonBack: {
            marginRight: '0.5rem',
            color: '#a1a1aa',
            fontSize: '0.875rem',
            fontWeight: '600',
          },
          buttonSkip: {
            color: '#a1a1aa',
            fontSize: '0.875rem',
            fontWeight: '600',
          }
        }
      } as any)}
    />
  );
}