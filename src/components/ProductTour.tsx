import React, { useEffect, useState } from 'react';
import { Joyride, Step } from 'react-joyride';
import { useTour } from '../contexts/TourContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { cn } from '../utils';
import { 
  Sparkles, Shield, DollarSign, Calendar, Target, LayoutDashboard, 
  Settings, Megaphone, Users, Folder, LayoutTemplate, Briefcase, 
  Camera, Video, MonitorPlay, Box, Layers
} from 'lucide-react';

export default function ProductTour() {
  const { isTourRunning, stopTour } = useTour();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [steps, setSteps] = useState<Step[]>([]);

  const isGerman = language === 'de';
  const isDark = theme === 'dark';

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
      <div className={cn("flex flex-col gap-3 p-1 text-left max-w-sm", isDark ? "text-white" : "text-slate-900")}>
        <div className={cn("flex items-center justify-between border-b pb-3 mb-1", isDark ? "border-slate-800" : "border-slate-200")}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md",
              isDark 
                ? "bg-blue-500/20 border border-blue-500/40 text-blue-400" 
                : "bg-blue-50 border border-blue-200 text-blue-600"
            )}>
              <IconComponent size={20} />
            </div>
            <div>
              <span className={cn("font-extrabold text-base leading-tight block", isDark ? "text-white" : "text-slate-900")}>{title}</span>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-500">
                {isGerman ? `Schritt ${stepNum} von ${total}` : `Step ${stepNum} of ${total}`}
              </span>
            </div>
          </div>
        </div>
        <p className={cn("text-xs leading-relaxed font-medium", isDark ? "text-slate-200" : "text-slate-700")}>{content}</p>
        {proTip && (
          <div className={cn(
            "mt-2 rounded-xl p-3 flex gap-2.5 items-start border shadow-sm",
            isDark 
              ? "bg-blue-950/60 border-blue-500/30 text-slate-200" 
              : "bg-blue-50/80 border-blue-200 text-slate-800"
          )}>
            <Sparkles size={16} className={cn("shrink-0 mt-0.5", isDark ? "text-blue-400" : "text-blue-600")} />
            <div className="text-[11px] font-medium leading-relaxed">
              <strong className={cn("block mb-0.5 font-bold", isDark ? "text-blue-300" : "text-blue-700")}>{isGerman ? 'Pro-Tipp:' : 'Pro Tip:'}</strong>
              {proTip}
            </div>
          </div>
        )}
      </div>
    );

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    interface RawStepDef {
      target: string;
      title: string;
      content: string;
      IconComponent: any;
      proTip?: string;
      placement?: any;
      disableBeacon?: boolean;
    }

    let candidateDefs: RawStepDef[] = [];

    if (location.pathname.includes('/project/')) {
      candidateDefs = [
        { target: 'body', title: isGerman ? 'Projekt-Workspace' : 'Project Workspace', content: isGerman ? 'Willkommen in deiner zentralen Baustellen- & Projektzentrale! Hier fließen Architektur, Termine, Budgets und Team-Kollaboration nahtlos zusammen.' : 'Welcome to your central project workspace! Architecture, schedules, budgets, and collaboration converge here.', IconComponent: Briefcase, proTip: isGerman ? 'Nutze die Tabs links zur schnellen Navigation zwischen den Fachbereichen.' : 'Use the left sidebar tabs for rapid navigation.', placement: 'center', disableBeacon: true },
        { target: '.tour-proj-dashboard', title: isGerman ? 'Kommandozentrale' : 'Dashboard', content: isGerman ? 'Generiere per Knopfdruck PDF-Reportings, die Live-Daten aus Budgets, Mängeln und Timelines automatisch vereinen.' : 'Generate live PDF reports combining budgets, defects, and timelines instantly.', IconComponent: LayoutDashboard, proTip: isGerman ? 'Exportiere druckreife Bautagebücher direkt im Universal PDF Studio.' : 'Export print-ready reports in the Universal PDF Studio.', placement: 'right' },
        { target: '.tour-proj-finance', title: isGerman ? 'Integriertes Projekt-Ledger' : 'Finance Ledger', content: isGerman ? 'Erfasse Baustellen-Spesen und Rechnungen direkt hier. Alles synchronisiert sich vollautomatisch mit den BKP-Kosten-Gruppen.' : 'Integrated Ledger. Syncs automatically with cost groups and global company budget.', IconComponent: DollarSign, proTip: isGerman ? 'Demo-Projekte laden automatisch realistische BKP 1-9 Budgetgruppen.' : 'Demo projects load realistic BKP budget structures automatically.', placement: 'right' },
        { target: '.tour-proj-calendar', title: isGerman ? 'Smart Calendar & Gantt' : 'Smart Calendar', content: isGerman ? 'Plane Meilensteine, Bauphasen und verknüpfe Deadlines direkt mit Aufgaben. Keine isolierten Termine mehr.' : 'Plan milestones and link deadlines directly to tasks.', IconComponent: Calendar, proTip: isGerman ? 'Wechsle zwischen Gantt-Chart und Kalenderansicht.' : 'Switch effortlessly between Gantt chart and calendar view.', placement: 'right' },
        { target: '.tour-proj-bim', title: isGerman ? '3D BIM Viewer im Browser' : 'Web 3D BIM Viewer', content: isGerman ? 'Lade IFC-Modelle hoch und betrachte die 3D-Architektur interaktiv direkt im Browser – ohne teure CAD-Software.' : 'Upload IFC models and view 3D architecture directly in your browser.', IconComponent: Box, proTip: isGerman ? 'Klicke auf 3D-Bauteile, um sofort Geometrie- & Materialdaten einzusehen.' : 'Click 3D elements to inspect geometry & material parameters.', placement: 'right' },
        { target: '.tour-proj-cad', title: isGerman ? '2D Pläne & Ausführung' : '2D CAD Plans', content: isGerman ? 'Verwalte hochauflösende 2D-Grundrisse und vektorbasierte Schnittzeichnungen für Bauleiter und Handwerker.' : 'Manage high-res 2D floor plans and vector cuts.', IconComponent: Folder, proTip: isGerman ? 'Mängel lassen sich zentimetergenau als PIN auf dem Plan platzieren.' : 'Drop pinpoint defects directly on 2D floor plans.', placement: 'right' },
        { target: '.tour-proj-defects', title: isGerman ? 'Mängel- & Ticket-Tracking' : 'Defect Tracking', content: isGerman ? 'Erfasse Baumängel inklusive Fotos. Das PWA-System speichert Daten auf der Baustelle auch offline und synchronisiert bei Verbindung.' : 'Record defect tickets with photos. Offline sync handles field data seamlessly.', IconComponent: Target, proTip: isGerman ? 'Mängel lassen sich auf dem Smartphone oder iPad offline aufnehmen.' : 'Record defects on mobile/iPad even without active internet connection.', placement: 'right' },
        { target: '.tour-proj-camera', title: isGerman ? 'Bau-Kamera & Zeitraffer' : 'Site Camera', content: isGerman ? 'Verfolge den realen Baufortschritt oder Messeaufbau über Live-Feeds und Zeitraffer-Aufnahmen.' : 'Monitor site progress via live feeds and time-lapse snapshots.', IconComponent: Camera, proTip: isGerman ? 'Dokumentiere den Fortschritt stündlich für Bauherren.' : 'Document hourly construction milestones for stakeholders.', placement: 'right' },
        { target: '.tour-proj-whiteboard', title: isGerman ? 'AI-Whiteboard' : 'AI Whiteboard', content: isGerman ? 'Skizziere Layouts in Echtzeit mit dem Team und nutze die Gemini-KI, um visuelle Konzepte direkt per Prompt zu generieren.' : 'Real-time whiteboard with integrated AI concept generation.', IconComponent: Sparkles, proTip: isGerman ? 'Generiere Moodboards per KI-Prompt direkt auf dem Board.' : 'Generate visual moodboards via AI prompts directly on canvas.', placement: 'right' },
        { target: '.tour-proj-meet', title: isGerman ? 'Nahtlose Kommunikation' : 'Video Meetings', content: isGerman ? 'Starte Video-Calls und Bau-Besprechungen direkt im System. Externe Partner betreten den Raum simpel per Einladungs-Link.' : 'Start video calls instantly. External partners join via simple magic links.', IconComponent: Video, proTip: isGerman ? 'Integriertes Chat & Filesharing während des Calls.' : 'Integrated chat and document sharing during video calls.', placement: 'right' },
        { target: '.tour-proj-docs', title: isGerman ? 'Digitale Bauakte' : 'Project Docs', content: isGerman ? 'Ein hochsicherer, verschlüsselter Datenraum für Verträge, Pläne und Baufein-Protokolle.' : 'Secure data room for contracts and construction assets.', IconComponent: Folder, proTip: isGerman ? 'Mit integrierter Volltext-Suche und Vorschau-Funktion.' : 'Built-in full-text search and instant file previews.', placement: 'right' },
        { target: '.tour-proj-pitch', title: isGerman ? 'Pitch Deck Studio' : 'Pitch Deck Studio', content: isGerman ? 'Nutze die Live-Projektdaten, um hochprofessionelle, visuelle Präsentationen für deine Kunden zu rendern.' : 'Create highly professional visual presentations for clients.', IconComponent: MonitorPlay, proTip: isGerman ? 'Interaktive Slides für Investoren und Bauherren.' : 'Interactive slide decks for investors and clients.', placement: 'right' },
        { target: '.tour-proj-team', title: isGerman ? 'Granulare Rechteverwaltung' : 'Granular Access', content: isGerman ? 'Bestimme exakt, welche Bauleiter, Subunternehmer oder Bauherren welche Daten sehen und bearbeiten dürfen.' : 'Control exact permissions for contractors and partners.', IconComponent: Users, proTip: isGerman ? 'Setze Rollen auf Owner, Admin, Editor oder Viewer.' : 'Assign explicit Owner, Admin, Editor, or Viewer roles.', placement: 'right' }
      ];
    } else if (location.pathname.startsWith('/admin')) {
      candidateDefs = [
        { target: 'body', title: isGerman ? 'Systemsteuerung (Root Access)' : 'System Control', content: isGerman ? 'Willkommen im Maschinenraum von Kreativ Desk. Hier verwaltest du die globale SaaS-Plattform, Mandanten und System-Logs.' : 'Welcome to the system machine room. Manage your global SaaS platform, tenants, and system logs.', IconComponent: Shield, proTip: isGerman ? 'Root-Zugriff ist nur für autorisierte Super-Admins freigeschaltet.' : 'Root access is restricted to authorized super administrators.', placement: 'center', disableBeacon: true },
        { target: '.tour-admin-metrics', title: isGerman ? 'Echtzeit-Metriken' : 'Live Metrics', content: isGerman ? 'Überwache aktiven Nutzerzuwachs, System-Umsatz und Datenbank-Auslastung auf einen Blick.' : 'Monitor user growth, system revenue, and database health in real time.', IconComponent: Target, proTip: isGerman ? 'Zeigt Live-Transaktionen aus dem Stripe Ledger an.' : 'Displays live transactions from your Stripe ledger.', placement: 'right' },
        { target: '.tour-admin-leads', title: isGerman ? 'B2B Leads & Anfragen' : 'Lead Engine', content: isGerman ? 'Verwalte eingehende B2B-Anfragen von der Landingpage in Echtzeit.' : 'Manage incoming B2B requests from the landing page in real time.', IconComponent: Megaphone, proTip: isGerman ? 'Erhalte automatische Push-Signale bei neuen Leads.' : 'Receive live push signals when new leads arrive.', placement: 'right' },
        { target: '.tour-admin-tenants', title: isGerman ? 'Mandanten- & Nutzer-Hub' : 'Tenant Hub', content: isGerman ? 'Steuere Lizenzen, Seat-Limits (`max_seats`) und Abo-Tarife aller registrierten Unternehmen.' : 'Control licenses, seat limits, and subscriptions for all companies.', IconComponent: Users, proTip: isGerman ? 'Passe Seat-Limits für Enterprise-Kunden manuell an.' : 'Adjust seat limits for enterprise clients on the fly.', placement: 'right' },
        { target: '.tour-admin-sales', title: isGerman ? 'Stripe & Abrechnung' : 'Stripe Integration', content: isGerman ? 'Verwalte globale Abonnements, Zahlungsströme und manuelle Rechnungen.' : 'Manage global subscriptions, cashflows, and manual invoicing.', IconComponent: DollarSign, proTip: isGerman ? 'Direkter Sprung ins Stripe Customer Portal.' : 'Direct shortcut to Stripe Customer Portal.', placement: 'right' },
        { target: '.tour-admin-brand', title: isGerman ? 'White-Label Branding' : 'White-Labeling', content: isGerman ? 'Passe Firmenname, Master-Logos und Stammdaten deiner Instanz an.' : 'Customize master logos and corporate identity for your instance.', IconComponent: Sparkles, proTip: isGerman ? 'Passe das White-Label Erscheinungsbild individuell an.' : 'Tailor the white-label branding as needed.', placement: 'right' },
        { target: '.tour-admin-support', title: isGerman ? 'Central Support Desk' : 'Support Desk', content: isGerman ? 'Alle Kundentickets fließen zentral hier zusammen und lassen sich priorisieren.' : 'Manage and resolve all customer support tickets centrally.', IconComponent: Target, proTip: isGerman ? 'Schneller Überblick über offene und gelöste Tickets.' : 'Clear overview of open vs resolved user tickets.', placement: 'right' },
        { target: '.tour-admin-api', title: isGerman ? 'API-Keys & Webhooks' : 'API & Webhooks', content: isGerman ? 'Generiere API-Schlüssel für externe Systemintegrationen und Schnittstellen.' : 'Generate API keys and webhooks for external integrations.', IconComponent: Settings, proTip: isGerman ? 'API Keys lassen sich per Klick kopieren oder widerrufen.' : 'API keys can be copied or revoked in one click.', placement: 'right' }
      ];
    } else {
      candidateDefs = [
        { target: 'body', title: isGerman ? 'Kreativ-Desk OS' : 'Kreativ-Desk OS', content: isGerman ? 'Willkommen bei Kreativ-Desk OS! Deine ganzheitliche Plattform für Spatial Design, Baustellen-Management und Unternehmens-Steuerung.' : 'Welcome to Kreativ-Desk OS! Your holistic platform for spatial design, site management, and business control.', IconComponent: Sparkles, proTip: isGerman ? 'In wenigen Schritten entdeckst du die wichtigsten Funktionen.' : 'Discover all core capabilities in just a few quick steps.', placement: 'center', disableBeacon: true },
        { target: '.tour-dashboard', title: isGerman ? 'Der globale Puls' : 'Global Pulse', content: isGerman ? 'Hier fließen Projektstatus, offene Leads und Finanz-KPIs deines Unternehmens in einer Live-Übersicht zusammen.' : 'The global pulse: Project status, leads, and financial KPIs in one live view.', IconComponent: LayoutDashboard, proTip: isGerman ? 'Klicke auf die KPI-Karten, um direkt in die Details zu springen.' : 'Click KPI cards to jump directly into detailed views.', placement: 'right' },
        { target: '.tour-projects', title: isGerman ? 'Portfolio-Management' : 'Portfolio Management', content: isGerman ? 'Verwalte all deine Bau- & Designprojekte. Ein Klick bringt dich tief in die 3D- und Kollaborations-Tools.' : 'Manage all projects. One click dives into specific 3D and collaboration tools.', IconComponent: Briefcase, proTip: isGerman ? 'Hier siehst du den Status und Fortschritt aller aktiven Projekte.' : 'View status and progress for all active project environments.', placement: 'right' },
        { target: '.tour-finance', title: isGerman ? 'Globales Finanz-Cockpit' : 'Finance Cockpit', content: isGerman ? 'Überwache den gesamten Firmen-Cashflow, Betriebskosten (OpEx) und BKP-Kostenstellen.' : 'Monitor global cashflow, operating expenses, and budgets.', IconComponent: DollarSign, proTip: isGerman ? 'Erstelle professionelle Offerten und Rechnungen als PDF.' : 'Generate professional quotes and invoices as PDFs.', placement: 'right' },
        { target: '.tour-documents', title: isGerman ? 'Firmen-Archiv & Assets' : 'Company Archive', content: isGerman ? 'Ein sicherer Cloud-Ordnerbaum für deine HR-Dokumente, Verträge und Branding-Assets.' : 'Secure cloud folder structure for HR docs, contracts, and branding assets.', IconComponent: Folder, proTip: isGerman ? 'Dokumente lassen sich kategorisieren und verschlüsselt speichern.' : 'Store and categorize assets with end-to-end cloud encryption.', placement: 'right' },
        { target: '.tour-templates', title: isGerman ? 'Workflow-Booster' : 'Workflow Booster', content: isGerman ? 'Speichere intelligente Bausteine und Layout-Vorlagen, um Routineaufgaben zu automatisieren.' : 'Save templates and reusable blocks to automate routine work.', IconComponent: LayoutTemplate, proTip: isGerman ? 'Spare wertvolle Zeit bei wiederkehrenden Angeboten.' : 'Save time on recurring client offers and site protocols.', placement: 'right' },
        { target: '.tour-leads', title: isGerman ? 'Leads & Kundenanfragen' : 'Lead Engine', content: isGerman ? 'Erfasse und verwalte Kundendaten und eingehende Projekt-Anfragen direkt im Workspace.' : 'Capture and manage inbound customer leads directly in your workspace.', IconComponent: Megaphone, proTip: isGerman ? 'Neue Leads lassen sich direkt in aktive Projekte umwandeln.' : 'Convert new leads into active project environments.', placement: 'right' },
        { target: '.tour-crm', title: isGerman ? 'Team & Partner-Netzwerk' : 'Team Network', content: isGerman ? 'Das Zentrum deines Netzwerks. Lade Mitarbeiter und externe Partner per E-Mail in dein Ökosystem ein.' : 'The core of your network. Invite team members via magic links.', IconComponent: Users, proTip: isGerman ? 'Behalte den Überblick über verfügbare Lizenzen und Rollen.' : 'Keep track of available licenses and company roles.', placement: 'right' },
        { target: '.tour-settings', title: isGerman ? 'System-Einstellungen & Abos' : 'System Settings', content: isGerman ? 'Konfiguriere dein Firmenprofil, MWST-Stammdaten und verwalte deine aktiven Stripe-Lizenzen.' : 'Configure company profiles, VAT, and active SaaS licenses.', IconComponent: Settings, proTip: isGerman ? 'Hier kannst du jederzeit dein Abo upgraden oder verwalten.' : 'Upgrade or manage your subscription plan anytime.', placement: 'right' }
      ];
    }

    const getVisibleTargetElement = (selector: string): HTMLElement | string | null => {
      if (selector === 'body') return 'body';
      const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        const isVisible = el.offsetParent !== null || (rect.width > 0 && rect.height > 0);
        if (isVisible) return el;
      }
      return null;
    };

    // Filter to only step candidates that actually have a visible DOM element
    const resolvedCandidates = candidateDefs
      .map(def => {
        const visibleTarget = getVisibleTargetElement(def.target);
        return visibleTarget ? { ...def, resolvedTarget: visibleTarget } : null;
      })
      .filter((item): item is (RawStepDef & { resolvedTarget: HTMLElement | string }) => item !== null);

    const totalSteps = resolvedCandidates.length;

    const validSteps: Step[] = resolvedCandidates.map((c, index) => {
      const stepNum = index + 1;
      const effectivePlacement = isMobile && c.placement !== 'center' ? 'auto' : (c.placement || 'right');
      return {
        target: c.resolvedTarget as any,
        content: buildStepContent(stepNum, totalSteps, c.title, c.content, c.IconComponent, c.proTip),
        placement: effectivePlacement,
        disableBeacon: !!c.disableBeacon,
        disableScrolling: isMobile ? false : true,
        disableScrollParentFix: true,
        floaterProps: { disableAnimation: true }
      } as any;
    });

    setSteps(validSteps);
  }, [isTourRunning, location.pathname, language, theme, isDark]);

  const handleJoyrideCallback = async (data: any) => {
    const { status, action, type } = data;
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
    } else if (type === 'error:target_not_found') {
      console.warn('[ProductTour] Target not found in DOM, graceful fallback:', data);
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
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
            textColor: isDark ? '#ffffff' : '#0f172a',
            arrowColor: isDark ? '#0f172a' : '#ffffff',
            overlayColor: isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(15, 23, 42, 0.45)',
            zIndex: 100000,
            beaconSize: 36,
          },
          tooltip: {
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
            color: isDark ? '#ffffff' : '#0f172a',
            borderRadius: '1.25rem',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.10)',
            padding: '1.25rem',
            boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.9)' : '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
          },
          tooltipContainer: {
            textAlign: 'left',
            color: isDark ? '#ffffff' : '#0f172a',
          },
          tooltipContent: {
            color: isDark ? '#ffffff' : '#0f172a',
            padding: 0,
          },
          buttonPrimary: {
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
            color: isDark ? '#94a3b8' : '#64748b',
            fontSize: '0.875rem',
            fontWeight: '600',
          },
          buttonSkip: {
            color: isDark ? '#94a3b8' : '#64748b',
            fontSize: '0.875rem',
            fontWeight: '600',
          },
          beaconInner: {
            backgroundColor: '#3b82f6'
          },
          beaconOuter: {
            backgroundColor: 'rgba(59, 130, 246, 0.4)',
            borderColor: '#3b82f6'
          }
        }
      } as any)}
    />
  );
}