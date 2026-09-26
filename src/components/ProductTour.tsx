import React, { useEffect, useState } from 'react';
import { Joyride, Step } from 'react-joyride';
import { useTour } from '../contexts/TourContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { cn } from '../utils';
import { safeStorage } from '../utils/safeStorage';
import { 
  Sparkles, Shield, DollarSign, Calendar, Target, LayoutDashboard, 
  Settings, Megaphone, Users, Folder, LayoutTemplate, Briefcase, 
  Camera, Video, MonitorPlay, Box, Layers, Globe, CalendarDays, FileText,
  BookOpen, X, PenTool, Search
} from 'lucide-react';

export default function ProductTour() {
  const { isTourRunning, activeModuleTour, stopTour } = useTour();
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
      proTip?: string,
      submodules?: string[]
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
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              stopTour();
            }}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ml-3",
              isDark
                ? "text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700"
                : "text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-200"
            )}
            title={isGerman ? "Tour beenden" : "Close tour"}
            aria-label={isGerman ? "Tour beenden" : "Close tour"}
          >
            <X size={16} />
          </button>
        </div>
        {submodules && submodules.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {submodules.map((sm, idx) => (
              <span 
                key={idx} 
                className={cn(
                  "px-2 py-0.5 text-[10px] font-bold rounded-md border tracking-tight",
                  isDark 
                    ? "bg-blue-500/10 border-blue-500/30 text-blue-300" 
                    : "bg-blue-50 border-blue-200 text-blue-700"
                )}
              >
                {sm}
              </span>
            ))}
          </div>
        )}
        <p className={cn("text-xs leading-relaxed font-medium", isDark ? "text-slate-200" : "text-slate-700")}>{content}</p>
        {proTip && (
          <div className={cn(
            "mt-1 rounded-xl p-2.5 flex gap-2.5 items-start border shadow-sm",
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

        <div className={cn("pt-2 mt-0.5 border-t flex items-center justify-between text-[11px]", isDark ? "border-slate-800" : "border-slate-200")}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.dispatchEvent(new CustomEvent('open-system-handbook'));
            }}
            className="inline-flex items-center gap-1.5 font-bold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
            title={isGerman ? 'Offizielles System-Handbuch (PDF) im Universal PDF Studio öffnen' : 'Open Official System Handbook (PDF) in Universal PDF Studio'}
          >
            <BookOpen size={12} />
            <span>{isGerman ? 'Master-Handbuch (PDF)' : 'Master Handbook (PDF)'}</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/10 border border-blue-500/20 font-black">14 S.</span>
          </button>
        </div>
      </div>
    );

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    interface RawStepDef {
      target: string;
      title: string;
      content: string;
      IconComponent: any;
      proTip?: string;
      submodules?: string[];
      placement?: any;
      disableBeacon?: boolean;
    }

    let candidateDefs: RawStepDef[] = [];

    if (activeModuleTour) {
      if (activeModuleTour === 'bim') {
        candidateDefs = [
          {
            target: '.tour-bim-viewport, canvas, .tour-btn-module-guide, body',
            title: isGerman ? '3D BIM Viewer & Navigation' : '3D BIM Viewer & Navigation',
            content: isGerman
              ? 'Interagiere direkt mit dem 3D-BIM-Modell: Linksklick gedrückt halten zum Rotieren (Orbit), Rechtsklick zum Verschieben (Pan) und Scrollrad zum Zoomen. Oben rechts kannst du zwischen Perspektive, Draufsicht und Schnitten umschalten.'
              : 'Interact directly with the 3D BIM model: Left click & drag to orbit, right click to pan, mouse wheel to zoom. Use camera buttons to switch between perspective, top view, and sections.',
            IconComponent: Box,
            submodules: isGerman ? ['IFC 2x3 & IFC4', '3D Orbit & Pan', 'Schnittebenen'] : ['IFC 2x3 & IFC4', '3D Orbit & Pan', 'Section Planes'],
            proTip: isGerman ? 'Klicke auf "Snapshot", um hochauflösende 3D-Bildausschnitte direkt ins Universal PDF Studio zu übertragen.' : 'Click "Snapshot" to export high-res 3D views into the Universal PDF Studio.',
            placement: 'bottom'
          },
          {
            target: '.tour-bim-sidebar, .tour-bim-tools, .tour-btn-module-guide, body',
            title: isGerman ? 'Bauteil-Inspektor & IFC-Parameter' : 'Component Inspector & IFC Parameters',
            content: isGerman
              ? 'Wähle ein beliebiges Bauteil (z.B. Decke, Wand, Fenster) im 3D-Modell an, um exakte Geometriedaten, Volumen, BKP-Kostenzuordnung und IFC-Properties (Psets) im Inspektor einzusehen.'
              : 'Select any 3D element (e.g. slab, column, window) to inspect dimensions, volume, BKP cost mappings, and IFC property sets (Psets).',
            IconComponent: Layers,
            submodules: isGerman ? ['IFC Psets', 'BKP-Verknüpfung', 'Mengen & Volumen'] : ['IFC Psets', 'BKP Mapping', 'Quantities & Volumes'],
            proTip: isGerman ? 'Über das Modell-Menü kannst du mehrere IFC-Fachmodelle (Architektur, Statik, Haustechnik) parallel laden.' : 'Use the model dropdown to switch between architectural, structural, and MEP models.',
            placement: 'left'
          },
          {
            target: '.tour-btn-module-guide, header, body',
            title: isGerman ? '3D-Mängel-Pins & KI-Audit' : '3D Defect Pins & AI Audit',
            content: isGerman
              ? 'Platziere Mängel als Pins direkt auf der 3D-Oberfläche oder starte den KI-Audit, um das Modell automatisch auf Normenkonformität und Kollisionen zu prüfen.'
              : 'Pinpoint defects directly in 3D space or run the AI Audit to automatically check model compliance and clashes.',
            IconComponent: Sparkles,
            submodules: isGerman ? ['3D Mängel-Pins', 'KI-Modell-Audit', 'Universal PDF Export'] : ['3D Defect Pins', 'AI Model Audit', 'Universal PDF Export'],
            proTip: isGerman ? 'Alle 3D-Mängel synchronisieren sich in Echtzeit mit der Baustellen-Mängelliste und dem 2D-Grundriss.' : 'All 3D defects sync in real time with the mobile defect list and 2D floor plans.',
            placement: 'bottom'
          }
        ];
      } else if (activeModuleTour === 'finance') {
        candidateDefs = [
          {
            target: '.tour-finance-invoices, .tour-btn-module-guide, header, body',
            title: isGerman ? 'Schweizer BKP 1–9 Kostenstruktur' : 'Swiss BKP 1–9 Cost Structure',
            content: isGerman
              ? 'Deine Baukosten sind nach standardisierter Schweizer BKP-Systematik (BKP 1–9) gegliedert: Vorbereitung, Rohbau, Hülle, Ausbau, Betriebseinrichtungen, Umgebung und SIA 102/108 Baunebenkosten.'
              : 'Construction costs are structured according to the Swiss BKP standard (BKP 1–9): Site Prep, Structure, Facade, Interior, MEP Equipment, Landscaping, and Incidental Fees (SIA 102/108).',
            IconComponent: DollarSign,
            submodules: isGerman ? ['BKP 1 bis BKP 9', 'SIA 102 Honorare', 'Versionen & Historie'] : ['BKP 1 to BKP 9', 'SIA 102 Fees', 'Versions & History'],
            proTip: isGerman ? 'Du kannst jederzeit neue Budget-Versionen (z.B. KV ±10% vs. Abrechnung) für lückenlose Historisierung anlegen.' : 'Create new budget versions anytime (e.g., Cost Estimate vs. Final Accounting) for full audit history.',
            placement: 'bottom'
          },
          {
            target: 'table, div.overflow-x-auto, .tour-btn-module-guide, body',
            title: isGerman ? '3-Spaltiger Soll/Ist-Vergleich & Prognose' : '3-Column Plan/Actual Comparison',
            content: isGerman
              ? 'Behalte bewilligtes Budget, vergebene Werkverträge und bezahlte Handwerker-Rechnungen in Echtzeit im Blick. Über- oder Unterschreitungen werden sofort farblich signalisiert.'
              : 'Compare approved budget, awarded contracts, and paid invoices in real time. Colored indicators highlight cost variances instantly.',
            IconComponent: Target,
            submodules: isGerman ? ['Budget vs. Ist', 'Vergabe-Stand', 'Kostenprognose'] : ['Budget vs. Actual', 'Contract Status', 'Cost Forecast'],
            proTip: isGerman ? 'Klicke auf eine BKP-Position, um alle verknüpften Handwerker-Teilrechnungen aufzuschlüsseln.' : 'Click any cost line to expand all linked contractor invoices and expenses.',
            placement: 'top'
          },
          {
            target: '.tour-btn-module-guide, header, body',
            title: isGerman ? 'ISO 20022 Schweizer QR-Rechnung & Export' : 'Swiss QR-Bill & PDF Export',
            content: isGerman
              ? 'Generiere gesetzeskonforme Schweizer QR-Rechnungen mit QR-IBAN und strukturierter Referenznummer oder exportiere den gesamten Kostenstand per Klick ins Universal PDF Studio.'
              : 'Issue compliant Swiss QR-bills with QR-IBAN and reference codes, or export complete cost dossiers to the Universal PDF Studio.',
            IconComponent: FileText,
            submodules: isGerman ? ['Swiss QR-Bill ISO 20022', 'Universal PDF Studio', 'Bexio / CSV Export'] : ['Swiss QR-Bill ISO 20022', 'Universal PDF Studio', 'Bexio / CSV Export'],
            proTip: isGerman ? 'Banken und Bauherren erhalten druckreife, revisionssichere Baukostenberichte.' : 'Banks and clients receive print-ready, audit-proof cost reports.',
            placement: 'bottom'
          }
        ];
      } else if (activeModuleTour === 'plans' || activeModuleTour === 'cad') {
        candidateDefs = [
          {
            target: 'aside, .tour-btn-module-guide, header, body',
            title: isGerman ? 'TrueScale 2D-Grundrisse & Massstab 1:50' : 'TrueScale 2D Plans & 1:50 Scale',
            content: isGerman
              ? 'Prüfe 2D-Architekturpläne in echten SIA-Massstäben (1:50, 1:100). Nutze das Messwerkzeug in der linken Werkzeugleiste zur zentimetergenauen Distanz- und Wandstärkenprüfung.'
              : 'Inspect 2D architectural plans at real SIA scales (1:50, 1:100). Use the measurement tool to verify distances and wall thicknesses with centimeter accuracy.',
            IconComponent: Folder,
            submodules: isGerman ? ['TrueScale 1:50', 'CAD-Ebenen / Layer', 'Mess-Werkzeug'] : ['TrueScale 1:50', 'CAD Layers', 'Measurement Tool'],
            proTip: isGerman ? 'Halte die Leertaste oder das Mausrad gedrückt, um blitzschnell im Plan zu navigieren.' : 'Hold spacebar or mouse wheel to pan rapidly across large plans.',
            placement: 'right'
          },
          {
            target: '.tour-btn-module-guide, header, body',
            title: isGerman ? 'Farbcodierte Mängel-Pins (SIA 118)' : 'Color-coded Defect Pins (SIA 118)',
            content: isGerman
              ? 'Platziere Mängel zentimetergenau mit farbcodierten Pins: Rot (Offen), Gelb (In Arbeit), Blau (Zur Abnahme) und Grün (Behoben). Jeder Pin speichert Gewerk, Frist und Fotos.'
              : 'Place defect pins directly onto floor plans: Red (Open), Amber (In Progress), Blue (Review), and Green (Resolved). Each pin stores trade, priority, deadline, and photos.',
            IconComponent: Target,
            submodules: isGerman ? ['Rot: Offen', 'Gelb: In Bearbeitung', 'Blau: Abnahme', 'Grün: Behoben'] : ['Red: Open', 'Amber: In Progress', 'Blue: Review', 'Green: Resolved'],
            proTip: isGerman ? 'Klicke auf einen Pin, um Details und Behebungs-Status sofort anzupassen.' : 'Click any pin to edit its status, trade, or photos.',
            placement: 'bottom'
          },
          {
            target: 'header, button, .tour-btn-module-guide, body',
            title: isGerman ? 'Plankopf, Freigabe & PDF-Druck' : 'Title Block, Approval & PDF Print',
            content: isGerman
              ? 'Füge SIA-konforme Planköpfe, Nordpfeile und Massstabsleisten ein. Exportiere druckreife Ausführungspläne in A3 oder A4 für die Handwerker auf der Baustelle.'
              : 'Insert SIA title blocks, north arrows, and scale bars. Export print-ready construction plans in A3 or A4 format for site contractors.',
            IconComponent: FileText,
            submodules: isGerman ? ['SIA-Plankopf', 'A3/A4 Drucklayout', 'Universal PDF Studio'] : ['SIA Title Block', 'A3/A4 Print Layout', 'Universal PDF Studio'],
            proTip: isGerman ? 'Im Universal PDF Studio bleiben alle Vektoren und Pins gestochen scharf erhalten.' : 'Vector lines and pins stay ultra-sharp in the Universal PDF Studio.',
            placement: 'bottom'
          }
        ];
      } else if (activeModuleTour === 'defects') {
        candidateDefs = [
          {
            target: '.tour-btn-module-guide, header, button, body',
            title: isGerman ? 'Mobile Mängelerfassung & PWA Offline' : 'Mobile Defect Logging & Offline PWA',
            content: isGerman
              ? 'Erfasse Baumängel in Sekunden mit Smartphone oder Tablet: Schiesse Fotos, diktiere Sprachnotizen und weise den Mangel sofort dem zuständigen Handwerker zu.'
              : 'Record defects in seconds via smartphone or tablet: Take photos, record voice memos, and assign tickets directly to contractors.',
            IconComponent: Target,
            submodules: isGerman ? ['Smartphone-Kamera', 'Offline PWA-Sync', 'Sprachnotizen'] : ['Smartphone Camera', 'Offline PWA Sync', 'Voice Memos'],
            proTip: isGerman ? 'Dank Offline-PWA werden Mängel auch im Tiefbau oder Keller ohne Mobilfunkempfang lokal gesichert.' : 'Offline PWA ensures defects recorded in basements without signal are safely preserved.',
            placement: 'bottom'
          },
          {
            target: 'header, div, .tour-btn-module-guide, body',
            title: isGerman ? 'SIA 118 Rügefristen & Statusverfolgung' : 'SIA 118 Deadlines & Status Tracking',
            content: isGerman
              ? 'Verfolge Tickets auf dem Board von Offen über In Arbeit bis zur mängelfreien Abnahme. Gesetzliche Rügefristen nach Schweizer SIA 118 werden automatisch überwacht.'
              : 'Track tickets across Kanban columns from Open to Resolved. Statutory SIA 118 notification periods are tracked automatically.',
            IconComponent: Calendar,
            submodules: isGerman ? ['SIA 118 2-Jahresfrist', 'Kanban Drag & Drop', 'Gewerke-Filter'] : ['SIA 118 Warranty Period', 'Kanban Drag & Drop', 'Trade Filters'],
            proTip: isGerman ? 'Filtere nach Unternehmer, um zielgerichtete Pendenzenlisten für Bauleitungssitzungen zu erstellen.' : 'Filter by trade to generate focused task lists for site coordinator meetings.',
            placement: 'bottom'
          },
          {
            target: '.tour-btn-module-guide, header, body',
            title: isGerman ? 'Offizielles Mängelprotokoll (PDF)' : 'Official Defect Protocol (PDF)',
            content: isGerman
              ? 'Erstelle mit einem Klick das rechtssichere Abnahme- und Rügeprotokoll inklusive Vorher/Nachher-Fotos, Unterschriftenfeldern und BKP-Zuordnung für Bauherr und Unternehmer.'
              : 'Generate legally binding defect and inspection protocols with before/after photos, signature fields, and BKP cost allocations.',
            IconComponent: FileText,
            submodules: isGerman ? ['Rechtssichere Rüge', 'Vorher/Nachher-Fotos', 'Universal PDF Studio'] : ['Legal Notice', 'Before/After Photos', 'Universal PDF Studio'],
            proTip: isGerman ? 'Versende Mängelrügen per Mail direkt aus dem System an die ausführenden Betriebe.' : 'Send defect notices directly via email to responsible contractors.',
            placement: 'bottom'
          }
        ];
      } else if (activeModuleTour === 'calendar') {
        candidateDefs = [
          {
            target: '.tour-calendar-gantt, .tour-btn-module-guide, header, body',
            title: isGerman ? 'SIA-Bauphasen & Gantt-Masterplan' : 'SIA Phases & Gantt Masterplan',
            content: isGerman
              ? 'Strukturiere deine Bauphasen nach SIA 112 (Vorprojekt, Bewilligung, Rohbau, Ausbau, Übergabe) im interaktiven Gantt-Balkenplan mit Meilensteinen und Deadlines.'
              : 'Structure construction phases following SIA 112 in the interactive Gantt chart with milestones and critical deadlines.',
            IconComponent: Calendar,
            submodules: isGerman ? ['SIA 112 Phasen', 'Gantt-Timeline', 'Meilenstein-Marker'] : ['SIA 112 Phases', 'Gantt Timeline', 'Milestone Markers'],
            proTip: isGerman ? 'Passe Termine per Drag & Drop an – alle abhängigen Termine synchronisieren sich mit.' : 'Drag & drop task bars to dynamically shift timelines.',
            placement: 'bottom'
          },
          {
            target: '.tour-btn-module-guide, header, body',
            title: isGerman ? 'Bautagebuch, Wetter & PDF-Journal' : 'Site Journal, Weather & PDF Export',
            content: isGerman
              ? 'Dokumentiere tägliche Baustellenfortschritte, anwesende Handwerker und Wetterdaten. Exportiere den gesamten Bauzeitenplan als grossformatiges A3-Gantt-PDF.'
              : 'Document daily progress, active workers, and weather. Export the full project schedule as high-res A3 Gantt PDF.',
            IconComponent: FileText,
            submodules: isGerman ? ['Bautagebuch', 'Wettererfassung', 'A3 Gantt-PDF'] : ['Site Journal', 'Weather Tracking', 'A3 Gantt PDF'],
            proTip: isGerman ? 'Perfekt für Bauherrensitzungen und Baustellenbesprechungen.' : 'Ideal for site coordination and client progress reviews.',
            placement: 'bottom'
          }
        ];
      } else if (activeModuleTour === 'pitch') {
        candidateDefs = [
          {
            target: '.tour-btn-module-guide, header, body',
            title: isGerman ? '16:9 Cinema-Präsentation für Bauherren' : '16:9 Cinema Presentation for Clients',
            content: isGerman
              ? 'Präsentiere dein Architekturprojekt im modernen 16:9 Kino-Vollbildmodus. Zeige fotorealistische Renderings, 3D-BIM-Schnitte, Grundrisse und das interdisziplinäre Planungsteam.'
              : 'Present your architectural project in cinematic 16:9 fullscreen. Showcase photorealistic renderings, 3D BIM views, plans, and team profiles.',
            IconComponent: MonitorPlay,
            submodules: isGerman ? ['16:9 Vollbild', 'Kino-Präsentation', 'Live-Projektdaten'] : ['16:9 Fullscreen', 'Cinema Slides', 'Live Project Data'],
            proTip: isGerman ? 'Drücke F11 oder klicke den Präsentations-Button für ablenkungsfreie Meetings.' : 'Press F11 or click presentation mode for distraction-free client meetings.',
            placement: 'bottom'
          },
          {
            target: '.tour-btn-module-guide, header, body',
            title: isGerman ? 'Live-Kostensync & Dual-Export (PDF & PPTX)' : 'Live Cost Sync & Dual Export (PDF & PPTX)',
            content: isGerman
              ? 'Alle Baukostenzahlen, Meilensteine und Termine aktualisieren sich automatisch aus deinen BKP-Finanzen. Exportiere das Deck wahlweise als druckreifes PDF oder editierbare PowerPoint/Keynote.'
              : 'All cost figures and milestone dates automatically sync from your BKP ledger. Export as print-ready PDF or editable PowerPoint/Keynote slides.',
            IconComponent: Sparkles,
            submodules: isGerman ? ['BKP-Zahlensync', 'Keynote & PowerPoint', 'Universal PDF Studio'] : ['BKP Cost Sync', 'Keynote & PowerPoint', 'Universal PDF Studio'],
            proTip: isGerman ? 'Erstelle individuelle Versionen für Investoren, Baubehörden oder Käufer.' : 'Generate customized decks for investors, authorities, or buyers.',
            placement: 'bottom'
          }
        ];
      } else if (activeModuleTour === 'overview' || activeModuleTour === 'dashboard') {
        candidateDefs = [
          {
            target: '.tour-btn-module-guide, header, body',
            title: isGerman ? 'Projekt-Cockpit & AI Briefing' : 'Project Cockpit & AI Briefing',
            content: isGerman
              ? 'Auf einen Blick siehst du den operativen Zustand deines Projekts. Mit dem Button "AI Briefing generieren" analysiert Google Gemini deine Projektdaten in Echtzeit und warnt dich vor Budget- oder Terminüberschreitungen.'
              : 'Get a real-time pulse of your project. Click "Generate AI Briefing" to let Gemini analyze project health, identifying risks and schedule deviations.',
            IconComponent: LayoutDashboard,
            submodules: isGerman ? ['AI Briefing', 'Echtzeit-KPIs', 'Meilenstein-Radar'] : ['AI Briefing', 'Live KPIs', 'Milestone Radar'],
            proTip: isGerman ? 'Das AI Briefing aggregiert Daten aus Finanzen, Mängeln und Terminen vollautomatisch.' : 'AI briefing aggregates finance, defects, and calendar data seamlessly.',
            placement: 'bottom'
          },
          {
            target: '.recharts-wrapper, header, body',
            title: isGerman ? 'Budget-Auslastung & Kosten-Monitoring' : 'Budget Utilization & Cost Monitoring',
            content: isGerman
              ? 'Behalte die Baukosten im Griff: Das Diagramm visualisiert BKP-Baukosten, externe Handwerker und interne Stunden. Verfolge Kostenabweichungen proaktiv.'
              : 'Keep construction expenses under control: Visualizes BKP budgets, contractor invoices, and team hours to prevent cost overruns.',
            IconComponent: DollarSign,
            submodules: isGerman ? ['BKP-Budget Soll/Ist', 'Kosten-Split', 'Interne Stunden'] : ['BKP Plan/Actual', 'Cost Split', 'Internal Hours'],
            proTip: isGerman ? 'Klicke auf "Budget prüfen", um direkt in die Schweizer BKP 1–9 Kostenplanung zu springen.' : 'Click "Review Budget" to jump directly into the Swiss BKP ledger.',
            placement: 'top'
          },
          {
            target: '.tour-btn-module-guide, header, body',
            title: isGerman ? 'Executive Summary Report (PDF)' : 'Executive Summary Report (PDF)',
            content: isGerman
              ? 'Erstelle mit einem Klick auf "Report erstellen" ein druckreifes Status-Dossier im Universal PDF Studio – perfekt für Bauherrensitzungen und Bauleitungsprotokolle.'
              : 'Generate an executive summary status dossier with one click in the Universal PDF Studio – ideal for client meetings and reviews.',
            IconComponent: FileText,
            submodules: isGerman ? ['Universal PDF Studio', 'Status-Dossier', 'Bauherren-Update'] : ['Universal PDF Studio', 'Status Dossier', 'Client Update'],
            proTip: isGerman ? 'Alle KPIs und Diagramme werden gestochen scharf als Vektorgrafiken gerendert.' : 'All charts and metrics are rendered as crisp vector graphics.',
            placement: 'bottom'
          }
        ];
      } else if (activeModuleTour === 'camera' || activeModuleTour === 'site') {
        candidateDefs = [
          {
            target: '.tour-btn-module-guide, header, body',
            title: isGerman ? 'Live-Baustellenkamera & Zeitraffer' : 'Site Camera & Timelapse',
            content: isGerman
              ? 'Verfolge den Baufortschritt oder den Eventaufbau live im Browser. Schalte zwischen mehreren Kameras um, erstelle Zeitraffer-Sequenzen und archiviere Schlüsselmomente.'
              : 'Monitor construction or installation live in your browser. Switch cameras, generate time-lapse sequences, and archive key milestones.',
            IconComponent: Camera,
            submodules: isGerman ? ['Live-Kamera', 'Zeitraffer (Timelapse)', 'Multi-Kamera'] : ['Live Camera', 'Timelapse', 'Multi-Camera'],
            proTip: isGerman ? 'Automatische Schnappschüsse werden stündlich im Bautagebuch und der Bauakte hinterlegt.' : 'Snapshots are automatically archived hourly in the site journal.',
            placement: 'bottom'
          },
          {
            target: 'header, div, body',
            title: isGerman ? 'Live-Wetter & SIA-Sensorik' : 'Live Weather & SIA Sensors',
            content: isGerman
              ? 'Echtzeit-Wetterdaten direkt vom Baustellenstandort: Temperatur, Niederschlag und Wind helfen bei der Freigabe von Betonier-, Kran- und Fassadenarbeiten.'
              : 'Live weather from your job site: Temperature, rain, and wind assist in clearing concrete pours, crane operations, and facade work.',
            IconComponent: CalendarDays,
            submodules: isGerman ? ['Betonier-Freigabe', 'Windwarnung', 'Regen-Prognose'] : ['Concrete Clearance', 'Wind Alert', 'Rain Forecast'],
            proTip: isGerman ? 'Klicke auf "Standort ändern", um den GPS-Standort deiner Baustelle exakt zu kalibrieren.' : 'Click "Change Location" to calibrate site coordinates.',
            placement: 'bottom'
          },
          {
            target: '.tour-btn-module-guide, header, body',
            title: isGerman ? 'KI-Sicherheitsaudit (SUVA & Helmpflicht)' : 'AI Safety Audit (SUVA & PPE)',
            content: isGerman
              ? 'Die integrierte KI analysiert Kamerabilder auf Einhaltung der SUVA-Arbeitssicherheitsrichtlinien (z.B. Helmpflicht, Schutzwesten, Absperrungen) und protokolliert Auffälligkeiten.'
              : 'Integrated AI inspects video feeds for SUVA safety compliance (hard hats, high-vis vests, restricted zones) and logs incidents.',
            IconComponent: Shield,
            submodules: isGerman ? ['SUVA-Richtlinien', 'PSA-Erkennung', 'Sicherheits-Log'] : ['SUVA Standards', 'PPE Detection', 'Safety Log'],
            proTip: isGerman ? 'Sicherheitsberichte lassen sich direkt als PDF für die Sicherheitsbeauftragten exportieren.' : 'Safety incident reports export directly to PDF.',
            placement: 'bottom'
          }
        ];
      } else if (activeModuleTour === 'whiteboard') {
        candidateDefs = [
          {
            target: '.tour-btn-module-guide, header, body',
            title: isGerman ? 'Unendliche Skizzen-Leinwand & Ebenen' : 'Infinite Canvas & Vector Layers',
            content: isGerman
              ? 'Entwirf Skizzen, Grundrisse und Raumkonzepte auf einer zoom- und schwenkbaren Vektorebene. Nutze Stifte, geometrische Formen und Multi-Layer wie in CAD-Systemen.'
              : 'Sketch floor plans and spatial concepts on a high-precision zoomable canvas. Use pens, shapes, and multiple layers just like in CAD software.',
            IconComponent: LayoutTemplate,
            submodules: isGerman ? ['Multi-Layer Ebenen', 'Vektor-Werkzeuge', 'Zoom & Pan'] : ['Multi-Layer', 'Vector Tools', 'Zoom & Pan'],
            proTip: isGerman ? 'Halte die Leertaste oder das Mausrad gedrückt, um mit dem Hand-Werkzeug frei über das Board zu gleiten.' : 'Hold spacebar or mouse wheel to pan freely across the canvas.',
            placement: 'bottom'
          },
          {
            target: 'header, button, body',
            title: isGerman ? 'KI-Visualisierung & Moodboard-Studio' : 'AI Visualization & Moodboards',
            content: isGerman
              ? 'Verwandle Handskizzen per Prompt in fotorealistische Architektur-Renderings mit integrierter Gemini- und Fal.ai-Technologie – ideal für frühe Kundenpräsentationen.'
              : 'Turn rough sketches into photorealistic architectural renders via AI prompts with Gemini and Fal.ai integration.',
            IconComponent: Sparkles,
            submodules: isGerman ? ['Sketch-to-Render', 'Gemini KI-Prompt', 'Fotorealismus'] : ['Sketch-to-Render', 'Gemini AI', 'Photorealism'],
            proTip: isGerman ? 'Wähle Voreinstellungen wie "Fotorealistisch" oder "Minimalistischer Pavillon" für schnelle Entwürfe.' : 'Pick style presets for rapid client design alternatives.',
            placement: 'bottom'
          },
          {
            target: '.tour-btn-module-guide, header, body',
            title: isGerman ? 'Audio-Notizen & Universal PDF Export' : 'Audio Memos & PDF Studio',
            content: isGerman
              ? 'Nimm Sprachmemos während Baubesprechungen auf: Die KI transkribiert und fasst Beschlüsse zusammen. Exportiere das fertige Board direkt als Folie ins Pitch Deck oder als A3-PDF.'
              : 'Record voice memos during site meetings: AI transcribes and summarizes decisions. Export to Pitch Deck or high-res A3 PDF.',
            IconComponent: FileText,
            submodules: isGerman ? ['KI-Transkription', 'Pitch Deck Sync', 'Universal PDF Studio'] : ['AI Transcription', 'Pitch Deck Sync', 'Universal PDF Studio'],
            proTip: isGerman ? 'Über "Medien & PDF" im Menü generierst du gestochen scharfe A3-Präsentationspläne.' : 'Export crisp A3 layout plans via the Media & PDF menu.',
            placement: 'bottom'
          }
        ];
      } else if (activeModuleTour === 'meet') {
        candidateDefs = [
          {
            target: '.tour-btn-module-guide, header, body',
            title: isGerman ? 'Integrierte HD-Videokonferenzen' : 'Integrated HD Video Meetings',
            content: isGerman
              ? 'Führe Bau- und Planungsbesprechungen direkt im Web-Browser durch – ohne Software-Download. Externe Fachplaner und Bauherren treten per Einladungs-Link sofort bei.'
              : 'Host coordination and client meetings directly in your browser – no software install. External partners join instantly via invite link.',
            IconComponent: Video,
            submodules: isGerman ? ['HD-Video & Audio', 'Screen-Sharing', 'Zero Download'] : ['HD Video & Audio', 'Screen Sharing', 'Zero Download'],
            proTip: isGerman ? 'Kopiere den Einladungslink mit einem Klick und versende ihn an Handwerker oder Bauherren.' : 'Copy meeting invite link in one click to share with clients.',
            placement: 'bottom'
          },
          {
            target: '.tour-meet-modes, header, body',
            title: isGerman ? 'Kollaboratives Live-Whiteboard' : 'Collaborative Live Whiteboard',
            content: isGerman
              ? 'Schalte während des Gesprächs nahtlos auf das interaktive Whiteboard um, um 2D-Pläne und 3D-Bildausschnitte gemeinsam live zu annotieren und Details abzustimmen.'
              : 'Switch seamlessly to the interactive whiteboard during calls to annotate plans and resolve architectural details collaboratively.',
            IconComponent: PenTool,
            submodules: isGerman ? ['Live-Annotation', 'Gemeinsam Skizzieren', 'Split-Screen'] : ['Live Annotation', 'Co-sketching', 'Split Screen'],
            proTip: isGerman ? 'Alle Skizzen aus dem Anruf werden automatisch in der Projektakte archiviert.' : 'Sketches drawn during calls are automatically archived in project documents.',
            placement: 'bottom'
          },
          {
            target: '.tour-btn-module-guide, header, body',
            title: isGerman ? 'Sitzungsprotokoll & Historie' : 'Meeting Log & History',
            content: isGerman
              ? 'Dokumentiere Beschlüsse im Live-Chat. Nach dem Anruf bleibt das Protokoll mit Teilnehmerliste und Zeitstempel in der Historie revisionssicher nach SIA 102/118 erhalten.'
              : 'Record agreements in live chat. After the call, transcripts and attendee lists remain securely logged according to SIA 102/118.',
            IconComponent: FileText,
            submodules: isGerman ? ['Chat-Protokoll', 'Teilnehmer-Nachweis', 'SIA 102 Konform'] : ['Chat Log', 'Attendance Record', 'SIA 102 Compliant'],
            proTip: isGerman ? 'Ideal für wöchentliche Bauleitungssitzungen und Unternehmersprachen.' : 'Ideal for weekly site coordinator meetings and contractor logs.',
            placement: 'bottom'
          }
        ];
      } else if (activeModuleTour === 'documents' || activeModuleTour === 'bauakte') {
        candidateDefs = [
          {
            target: '.tour-btn-module-guide, header, body',
            title: isGerman ? 'Strukturierte Digitale Bauakte' : 'Structured Digital Project Records',
            content: isGerman
              ? 'Organisiere Verträge, Baugenehmigungen, Pläne und Handwerker-Rapporte in einer Schweizer Standard-Ordnerstruktur. Alle Dateien sind revisionssicher verschlüsselt.'
              : 'Organize contracts, permits, CAD plans, and site reports in a Swiss standard folder structure with encrypted cloud storage.',
            IconComponent: Folder,
            submodules: isGerman ? ['Verschlüsselter Cloud-Storage', 'SIA-Ordnerstruktur', 'Revisionssicher'] : ['Encrypted Storage', 'SIA Folders', 'Audit-Proof'],
            proTip: isGerman ? 'Lege separate Unterordner für jedes BKP-Gewerk an, um Dokumente übersichtlich zu trennen.' : 'Create subfolders per BKP trade for clear contractor separation.',
            placement: 'bottom'
          },
          {
            target: 'header, input, div, body',
            title: isGerman ? 'Volltextsuche & OCR-Erkennung' : 'Full-Text Search & OCR',
            content: isGerman
              ? 'Finde Bauakten sekundenschnell über die integrierte Volltextsuche. Hochgeladene PDFs, Rechnungen und Fotos werden automatisch per OCR indiziert.'
              : 'Find files in seconds via full-text search. Uploaded PDFs, invoices, and photos are indexed automatically via OCR.',
            IconComponent: Search,
            submodules: isGerman ? ['OCR-Texterkennung', 'Metadaten-Filter', 'Sofort-Suche'] : ['OCR Text Recognition', 'Metadata Filter', 'Instant Search'],
            proTip: isGerman ? 'Suche nach Rechnungsnummern, BKP-Codes oder Handwerkernamen für Sofort-Treffer.' : 'Search by invoice number, BKP code, or contractor name for instant matches.',
            placement: 'bottom'
          },
          {
            target: '.tour-btn-module-guide, header, body',
            title: isGerman ? 'Smartphone-Scan & BKP-Sync' : 'Smartphone Scanning & BKP Sync',
            content: isGerman
              ? 'Scanne Lieferscheine und Handwerker-Rapporte direkt auf der Baustelle mit dem Smartphone – sie synchronisieren sich in Echtzeit in die Bauakte und das Finanzmodul.'
              : 'Scan delivery notes and time sheets directly on site with your phone – syncing instantly to documents and finance.',
            IconComponent: FileText,
            submodules: isGerman ? ['Smartphone QR-Scan', 'PWA-Sync', 'Finanz-Verknüpfung'] : ['Phone QR Scan', 'PWA Sync', 'Finance Link'],
            proTip: isGerman ? 'Gescannte Handwerkerbelege lassen sich direkt den BKP-Kostenstellen zuweisen.' : 'Scanned receipts link directly to BKP cost items in Finance.',
            placement: 'bottom'
          }
        ];
      } else if (activeModuleTour === 'team' || activeModuleTour === 'access') {
        candidateDefs = [
          {
            target: '.tour-btn-module-guide, header, body',
            title: isGerman ? 'Granulare Schweizer Rollenverwaltung' : 'Granular Swiss Role Permissions',
            content: isGerman
              ? 'Steuere exakt, wer Zugriff auf dein Projekt hat: Bauherren (nur Lesezugriff), Fachplaner (Editor) oder Bauleiter (Admin). Schütze vertrauliche Baukosten und Margen.'
              : 'Control exact permissions: Clients (Read-only), Planners (Editor), or Site Managers (Admin). Protect confidential cost data and profit margins.',
            IconComponent: Users,
            submodules: isGerman ? ['Owner & Admins', 'Fachplaner (Editor)', 'Bauherren (Viewer)'] : ['Owner & Admins', 'Planner (Editor)', 'Client (Viewer)'],
            proTip: isGerman ? 'Bauherren erhalten automatisch eine vereinfachte Sicht ohne interne Firmenmargen.' : 'Clients automatically receive a clean view without internal contractor margins.',
            placement: 'bottom'
          },
          {
            target: 'header, button, body',
            title: isGerman ? 'Smarte Einladungs-Links & Externe Partner' : 'Smart Magic Invites & Contractors',
            content: isGerman
              ? 'Lade Handwerker und Planer per E-Mail oder Magic Invite Link ein. Externe Partner erhalten sofort Zugang zu ihren spezifischen Aufgaben und Mängeln.'
              : 'Invite contractors and engineers via email or magic links. External partners gain instant access to their assigned tickets and plans.',
            IconComponent: Sparkles,
            submodules: isGerman ? ['Magic Invite Link', 'Gewerke-Zuordnung', 'Schnelleinladung'] : ['Magic Invite Link', 'Trade Mapping', 'Fast Onboarding'],
            proTip: isGerman ? 'Subunternehmer sehen nur die für sie relevanten Mängel und Pläne.' : 'Subcontractors only see defects and plans relevant to their trade.',
            placement: 'bottom'
          },
          {
            target: '.tour-btn-module-guide, table, header, body',
            title: isGerman ? 'Revisionssichere Zugriffs-Protokollierung' : 'Audit Logs & DSG Compliance',
            content: isGerman
              ? 'Jeder Zugriff und jede Rollenänderung wird im Audit-Trail dokumentiert – konform mit dem Schweizer Datenschutzgesetz (DSG) und der SIA-Norm.'
              : 'Every access and role modification is recorded in the audit trail – compliant with Swiss Data Protection (DSG) and SIA standards.',
            IconComponent: Shield,
            submodules: isGerman ? ['Schweizer DSG konform', 'Audit-Trail', 'Rollenhistorie'] : ['Swiss DSG Compliant', 'Audit Trail', 'Role History'],
            proTip: isGerman ? 'Passe Rollen jederzeit per Dropdown an – Änderungen werden sofort aktiv.' : 'Adjust roles anytime via dropdown – changes take effect immediately.',
            placement: 'bottom'
          }
        ];
      }
    } else if (location.pathname.includes('/project/')) {
      candidateDefs = [
        { target: 'body', title: isGerman ? 'Projekt-Workspace' : 'Project Workspace', content: isGerman ? 'Willkommen in deiner zentralen Baustellen- & Projektzentrale! Hier fließen Architektur, Termine, Budgets und Team-Kollaboration nahtlos zusammen.' : 'Welcome to your central project workspace! Architecture, schedules, budgets, and collaboration converge here.', IconComponent: Briefcase, submodules: isGerman ? ['360° Übersicht', 'BIM & CAD', 'Timeline', 'Budget-Sync'] : ['360° Overview', 'BIM & CAD', 'Timeline', 'Budget-Sync'], proTip: isGerman ? 'Nutze die Tabs links zur schnellen Navigation zwischen den Fachbereichen.' : 'Use the left sidebar tabs for rapid navigation.', placement: 'center', disableBeacon: true },
        { target: '.tour-proj-dashboard', title: isGerman ? 'Kommandozentrale' : 'Dashboard', content: isGerman ? 'Generiere per Knopfdruck PDF-Reportings, die Live-Daten aus Budgets, Mängeln und Timelines automatisch vereinen.' : 'Generate live PDF reports combining budgets, defects, and timelines instantly.', IconComponent: LayoutDashboard, submodules: isGerman ? ['Live-Status', 'Universal PDF-Studio', 'Meilensteine'] : ['Live Status', 'Universal PDF Studio', 'Milestones'], proTip: isGerman ? 'Exportiere druckreife Bautagebücher direkt im Universal PDF Studio.' : 'Export print-ready reports in the Universal PDF Studio.', placement: 'right' },
        { target: '.tour-proj-finance', title: isGerman ? 'Integriertes Projekt-Ledger' : 'Finance Ledger', content: isGerman ? 'Erfasse Baustellen-Spesen und Rechnungen direkt hier. Alles synchronisiert sich vollautomatisch mit den BKP-Kosten-Gruppen.' : 'Integrated Ledger. Syncs automatically with cost groups and global company budget.', IconComponent: DollarSign, submodules: isGerman ? ['BKP 1–9 Soll/Ist', 'Handwerker-Rechnungen', 'Spesen-Scan'] : ['BKP 1–9 Actual/Plan', 'Contractor Invoices', 'Expense Scan'], proTip: isGerman ? 'Demo-Projekte laden automatisch realistische BKP 1-9 Budgetgruppen.' : 'Demo projects load realistic BKP budget structures automatically.', placement: 'right' },
        { target: '.tour-proj-calendar', title: isGerman ? 'Smart Calendar & Gantt' : 'Smart Calendar', content: isGerman ? 'Plane Meilensteine, Bauphasen und verknüpfe Deadlines direkt mit Aufgaben. Keine isolierten Termine mehr.' : 'Plan milestones and link deadlines directly to tasks.', IconComponent: Calendar, submodules: isGerman ? ['Gantt-Timeline', 'Kritischer Pfad', 'Baujournal-Sync'] : ['Gantt Timeline', 'Critical Path', 'Site Journal Sync'], proTip: isGerman ? 'Wechsle zwischen Gantt-Chart und Kalenderansicht.' : 'Switch effortlessly between Gantt chart and calendar view.', placement: 'right' },
        { target: '.tour-proj-bim', title: isGerman ? '3D BIM Viewer im Browser' : 'Web 3D BIM Viewer', content: isGerman ? 'Lade IFC-Modelle hoch und betrachte die 3D-Architektur interaktiv direkt im Browser – ohne teure CAD-Software.' : 'Upload IFC models and view 3D architecture directly in your browser.', IconComponent: Box, submodules: isGerman ? ['IFC 3D-Modelle', 'Kollisionsprüfung', 'Bauteil-Inspektor'] : ['IFC 3D Models', 'Clash Detection', 'Component Inspector'], proTip: isGerman ? 'Klicke auf 3D-Bauteile, um sofort Geometrie- & Materialdaten einzusehen.' : 'Click 3D elements to inspect geometry & material parameters.', placement: 'right' },
        { target: '.tour-proj-cad', title: isGerman ? '2D Pläne & Ausführung' : '2D CAD Plans', content: isGerman ? 'Verwalte hochauflösende 2D-Grundrisse und vektorbasierte Schnittzeichnungen für Bauleiter und Handwerker.' : 'Manage high-res 2D floor plans and vector cuts.', IconComponent: Folder, submodules: isGerman ? ['Grundrisse & Schnitte', 'PIN-Mängelmarker', 'Plan-Archiv'] : ['Floorplans & Cuts', 'Pinpoint Defect Pins', 'Plan Archive'], proTip: isGerman ? 'Mängel lassen sich zentimetergenau als PIN auf dem Plan platzieren.' : 'Drop pinpoint defects directly on 2D floor plans.', placement: 'right' },
        { target: '.tour-proj-defects', title: isGerman ? 'Mängel- & Ticket-Tracking' : 'Defect Tracking', content: isGerman ? 'Erfasse Baumängel inklusive Fotos. Das PWA-System speichert Daten auf der Baustelle auch offline und synchronisiert bei Verbindung.' : 'Record defect tickets with photos. Offline sync handles field data seamlessly.', IconComponent: Target, submodules: isGerman ? ['PWA Offline-Modus', 'Fotodokumentation', 'Fristen & Mahnwesen'] : ['PWA Offline Mode', 'Photo Documentation', 'Deadlines & Reminders'], proTip: isGerman ? 'Mängel lassen sich auf dem Smartphone oder iPad offline aufnehmen.' : 'Record defects on mobile/iPad even without active internet connection.', placement: 'right' },
        { target: '.tour-proj-camera', title: isGerman ? 'Bau-Kamera & Zeitraffer' : 'Site Camera', content: isGerman ? 'Verfolge den realen Baufortschritt oder Messeaufbau über Live-Feeds und Zeitraffer-Aufnahmen.' : 'Monitor site progress via live feeds and time-lapse snapshots.', IconComponent: Camera, submodules: isGerman ? ['Live-Kamerabild', 'Zeitraffer-Video', 'Bautagebuch-Sync'] : ['Live Camera Feed', 'Timelapse Video', 'Site Journal Sync'], proTip: isGerman ? 'Dokumentiere den Fortschritt stündlich für Bauherren.' : 'Document hourly construction milestones for stakeholders.', placement: 'right' },
        { target: '.tour-proj-whiteboard', title: isGerman ? 'AI-Whiteboard' : 'AI Whiteboard', content: isGerman ? 'Skizziere Layouts in Echtzeit mit dem Team und nutze die Gemini-KI, um visuelle Konzepte direkt per Prompt zu generieren.' : 'Real-time whiteboard with integrated AI concept generation.', IconComponent: Sparkles, submodules: isGerman ? ['Echtzeit-Skizzen', 'Gemini KI-Prompt', 'Moodboard-Export'] : ['Real-time Canvas', 'Gemini AI Prompts', 'Moodboard Export'], proTip: isGerman ? 'Generiere Moodboards per KI-Prompt direkt auf dem Board.' : 'Generate visual moodboards via AI prompts directly on canvas.', placement: 'right' },
        { target: '.tour-proj-meet', title: isGerman ? 'Nahtlose Kommunikation' : 'Video Meetings', content: isGerman ? 'Starte Video-Calls und Bau-Besprechungen direkt im System. Externe Partner betreten den Raum simpel per Einladungs-Link.' : 'Start video calls instantly. External partners join via simple magic links.', IconComponent: Video, submodules: isGerman ? ['HD Video-Call', 'Screen-Sharing', 'Gäste-Einladung'] : ['HD Video Call', 'Screen Sharing', 'Guest Invitations'], proTip: isGerman ? 'Integriertes Chat & Filesharing während des Calls.' : 'Integrated chat and document sharing during video calls.', placement: 'right' },
        { target: '.tour-proj-docs', title: isGerman ? 'Digitale Bauakte' : 'Project Docs', content: isGerman ? 'Ein hochsicherer, verschlüsselter Datenraum für Verträge, Pläne und Baufein-Protokolle.' : 'Secure data room for contracts and construction assets.', IconComponent: Folder, submodules: isGerman ? ['Volltext-Suche', 'Verschlüsselter Cloud-Storage', 'Versionierung'] : ['Full-text Search', 'Encrypted Storage', 'Versioning'], proTip: isGerman ? 'Mit integrierter Volltext-Suche und Vorschau-Funktion.' : 'Built-in full-text search and instant file previews.', placement: 'right' },
        { target: '.tour-proj-pitch', title: isGerman ? 'Pitch Deck Studio' : 'Pitch Deck Studio', content: isGerman ? 'Nutze die Live-Projektdaten, um hochprofessionelle, visuelle Präsentationen für deine Kunden zu rendern.' : 'Create highly professional visual presentations for clients.', IconComponent: MonitorPlay, submodules: isGerman ? ['Live-Slides', 'Keynote & PPTX Export', 'Bauherren-Präsentation'] : ['Live Slides', 'Keynote & PPTX Export', 'Client Pitch'], proTip: isGerman ? 'Interaktive Slides für Investoren und Bauherren.' : 'Interactive slide decks for investors and clients.', placement: 'right' },
        { target: '.tour-proj-team', title: isGerman ? 'Granulare Rechteverwaltung' : 'Granular Access', content: isGerman ? 'Bestimme exakt, welche Bauleiter, Subunternehmer oder Bauherren welche Daten sehen und bearbeiten dürfen.' : 'Control exact permissions for contractors and partners.', IconComponent: Users, submodules: isGerman ? ['Owner & Admins', 'Bauleiter (Editor)', 'Subunternehmer / Viewer'] : ['Owner & Admins', 'Site Manager (Editor)', 'Contractor / Viewer'], proTip: isGerman ? 'Setze Rollen auf Owner, Admin, Editor oder Viewer.' : 'Assign explicit Owner, Admin, Editor, or Viewer roles.', placement: 'right' }
      ];
    } else if (location.pathname.startsWith('/admin')) {
      candidateDefs = [
        { target: 'body', title: isGerman ? 'Systemsteuerung (Root Access)' : 'System Control', content: isGerman ? 'Willkommen im Maschinenraum von Kreativ Desk. Hier verwaltest du die globale SaaS-Plattform, Mandanten und System-Logs.' : 'Welcome to the system machine room. Manage your global SaaS platform, tenants, and system logs.', IconComponent: Shield, submodules: isGerman ? ['Super-Admin', 'Multi-Tenant', 'Plattform-Status'] : ['Super Admin', 'Multi-Tenant', 'Platform Status'], proTip: isGerman ? 'Root-Zugriff ist nur für autorisierte Super-Admins freigeschaltet.' : 'Root access is restricted to authorized super administrators.', placement: 'center', disableBeacon: true },
        { target: '.tour-admin-metrics', title: isGerman ? 'Echtzeit-Metriken' : 'Live Metrics', content: isGerman ? 'Überwache aktiven Nutzerzuwachs, System-Umsatz und Datenbank-Auslastung auf einen Blick.' : 'Monitor user growth, system revenue, and database health in real time.', IconComponent: Target, submodules: isGerman ? ['MRR / ARR', 'Aktive Tenants', 'DB-Auslastung'] : ['MRR / ARR', 'Active Tenants', 'DB Health'], proTip: isGerman ? 'Zeigt Live-Transaktionen aus dem Stripe Ledger an.' : 'Displays live transactions from your Stripe ledger.', placement: 'right' },
        { target: '.tour-admin-leads', title: isGerman ? 'B2B Leads & Anfragen' : 'Lead Engine', content: isGerman ? 'Verwalte eingehende B2B-Anfragen von der Landingpage in Echtzeit.' : 'Manage incoming B2B requests from the landing page in real time.', IconComponent: Megaphone, submodules: isGerman ? ['Inbound Anfragen', 'Qualifizierung', 'Push-Notifikation'] : ['Inbound Inquiries', 'Qualification', 'Push Notification'], proTip: isGerman ? 'Erhalte automatische Push-Signale bei neuen Leads.' : 'Receive live push signals when new leads arrive.', placement: 'right' },
        { target: '.tour-admin-tenants', title: isGerman ? 'Mandanten- & Nutzer-Hub' : 'Tenant Hub', content: isGerman ? 'Steuere Lizenzen, Seat-Limits (`max_seats`) und Abo-Tarife aller registrierten Unternehmen.' : 'Control licenses, seat limits, and subscriptions for all companies.', IconComponent: Users, submodules: isGerman ? ['Unternehmen & Rollen', 'Seat-Limits', 'Abo-Stufen'] : ['Companies & Roles', 'Seat Limits', 'Tier Management'], proTip: isGerman ? 'Passe Seat-Limits für Enterprise-Kunden manuell an.' : 'Adjust seat limits for enterprise clients on the fly.', placement: 'right' },
        { target: '.tour-admin-sales', title: isGerman ? 'Stripe & Abrechnung' : 'Stripe Integration', content: isGerman ? 'Verwalte globale Abonnements, Zahlungsströme und manuelle Rechnungen.' : 'Manage global subscriptions, cashflows, and manual invoicing.', IconComponent: DollarSign, submodules: isGerman ? ['Stripe Portal', 'Invoicing', 'Transaktionshistorie'] : ['Stripe Portal', 'Invoicing', 'Transaction History'], proTip: isGerman ? 'Direkter Sprung ins Stripe Customer Portal.' : 'Direct shortcut to Stripe Customer Portal.', placement: 'right' },
        { target: '.tour-admin-brand', title: isGerman ? 'White-Label Branding' : 'White-Labeling', content: isGerman ? 'Passe Firmenname, Master-Logos und Stammdaten deiner Instanz an.' : 'Customize master logos and corporate identity for your instance.', IconComponent: Sparkles, submodules: isGerman ? ['Eigenes Logo', 'Domain & CI', 'E-Mail Vorlagen'] : ['Custom Logo', 'Domain & CI', 'Email Templates'], proTip: isGerman ? 'Passe das White-Label Erscheinungsbild individuell an.' : 'Tailor the white-label branding as needed.', placement: 'right' },
        { target: '.tour-admin-support', title: isGerman ? 'Central Support Desk' : 'Support Desk', content: isGerman ? 'Alle Kundentickets fließen zentral hier zusammen und lassen sich priorisieren.' : 'Manage and resolve all customer support tickets centrally.', IconComponent: Target, submodules: isGerman ? ['Ticket-Eingang', 'Prioritäten', 'Status-Tracking'] : ['Ticket Inbox', 'Priorities', 'Status Tracking'], proTip: isGerman ? 'Schneller Überblick über offene und gelöste Tickets.' : 'Clear overview of open vs resolved user tickets.', placement: 'right' },
        { target: '.tour-admin-api', title: isGerman ? 'API-Keys & Webhooks' : 'API & Webhooks', content: isGerman ? 'Generiere API-Schlüssel für externe Systemintegrationen und Schnittstellen.' : 'Generate API keys and webhooks for external integrations.', IconComponent: Settings, submodules: isGerman ? ['REST API Keys', 'Webhooks', 'ERP-Anbindung'] : ['REST API Keys', 'Webhooks', 'ERP Integration'], proTip: isGerman ? 'API Keys lassen sich per Klick kopieren oder widerrufen.' : 'API keys can be copied or revoked in one click.', placement: 'right' }
      ];
    } else {
      candidateDefs = [
        { 
          target: 'body', 
          title: isGerman ? 'Firmenzentrale vs. Projekt-Cockpit' : 'Company Hub vs. Project Cockpit', 
          content: isGerman 
            ? 'Willkommen bei Kreativ-Desk OS! Das System basiert auf zwei Ebenen: Hier in deiner Firmenzentrale verwaltest du firmenweite Master-Vorlagen, globale Finanzen und das Team. Um ein konkretes Projekt von A bis Z mit BKP-Budget, 3D BIM, CAD-Plänen und Pitch Deck zu steuern, erstellst oder öffnest du ein Projekt.'
            : 'Welcome to Kreativ-Desk OS! The system is built on two tiers: Here in your Company Hub, you manage firm-wide master templates, global finance, and team settings. To execute an actual project from A to Z with BKP budgets, 3D BIM, CAD, and pitch decks, you open or create a project.', 
          IconComponent: Sparkles, 
          submodules: isGerman ? ['Ebene 1: Firmenzentrale', 'Ebene 2: Projekt-Cockpit', 'Schweizer SIA-Standards'] : ['Tier 1: Company Hub', 'Tier 2: Project Cockpit', 'Swiss SIA Standards'],
          proTip: isGerman ? 'Master-Vorlagen werden firmenweit definiert und in jedem Projekt automatisch für den jeweiligen Bauherren übernommen.' : 'Master templates are defined firm-wide and inherited into each project automatically.', 
          placement: 'center', 
          disableBeacon: true 
        },
        { 
          target: '.tour-dashboard', 
          title: isGerman ? 'Der globale Puls' : 'Global Pulse', 
          content: isGerman ? 'Hier fließen Projektstatus, offene Leads und Finanz-KPIs deines Unternehmens in einer Live-Übersicht zusammen.' : 'The global pulse: Project status, leads, and financial KPIs in one live view.', 
          IconComponent: LayoutDashboard, 
          submodules: isGerman ? ['Echtzeit-KPIs', 'Umsatz & Cashflow', 'Aktive Projekte', 'Schnellzugriff'] : ['Live KPIs', 'Revenue & Cashflow', 'Active Projects', 'Quick Actions'],
          proTip: isGerman ? 'Klicke auf die KPI-Karten, um direkt in die Details zu springen.' : 'Click KPI cards to jump directly into detailed views.', 
          placement: 'right' 
        },
        { 
          target: '.tour-projects', 
          title: isGerman ? 'Projekt-Portfolio (Operative Cockpits)' : 'Project Portfolio (Operational Cockpits)', 
          content: isGerman 
            ? 'Das Herzstück der Projektausführung: Ein Klick auf ein Projekt öffnet dein operatives Cockpit von A bis Z mit 3D-BIM-Viewer (IFC), BKP 1–9 Baukosten, 2D-Plänen mit Mängel-Pins, Bau-Kamera und Pitch Deck Studio.' 
            : 'The core of project execution: Clicking a project opens your 360° workspace from A to Z with 3D BIM (IFC), BKP 1–9 budgets, 2D CAD plans with defect pins, site cameras, and pitch deck studio.', 
          IconComponent: Briefcase, 
          submodules: isGerman ? ['Projekt von A bis Z', '3D BIM (IFC)', 'BKP 1–9 Baukosten', 'Mängel & Termine', 'Pitch Deck Studio'] : ['Project from A to Z', '3D BIM & CAD', 'BKP Cost Plans', 'Defects & Schedule', 'Pitch Deck Studio'],
          proTip: isGerman ? 'Erstelle hier dein erstes Projekt oder öffne das Musterprojekt, um alle operativen Werkzeuge live zu erleben.' : 'Create your first project here or open the sample project to experience all tools live.', 
          placement: 'right' 
        },
        { 
          target: '.tour-proposals', 
          title: isGerman ? 'Offerten & Verträge' : 'Smart Proposals & Contracts', 
          content: isGerman ? 'Erstelle interaktive Web-Offerten mit digitaler E-Signatur, dynamischer Varianten-Auswahl und automatischem PDF-Export.' : 'Create interactive web proposals with digital signatures, dynamic option selection, and PDF export.', 
          IconComponent: Globe, 
          submodules: isGerman ? ['Smarte Web-Offerten', 'Digitale E-Signatur', 'Vertragsumwandlung', 'Universal PDF Studio'] : ['Smart Web Proposals', 'Digital E-Sign', 'Contract Conversion', 'Universal PDF Studio'],
          proTip: isGerman ? 'Kunden können Offerten direkt im Browser digital unterschreiben und annehmen.' : 'Clients can sign and accept proposals directly in their web browser.', 
          placement: 'right' 
        },
        { 
          target: '.tour-finance', 
          title: isGerman ? 'Globales Finanz-Cockpit' : 'Finance Cockpit', 
          content: isGerman ? 'Überwache den gesamten Firmen-Cashflow, Betriebskosten (OpEx), Schweizer QR-Rechnungen und BKP-Kostenstellen.' : 'Monitor global cashflow, operating expenses (OpEx), Swiss QR-bills, and construction budgets.', 
          IconComponent: DollarSign, 
          submodules: isGerman ? ['BKP 1–9 Baukosten', 'CH QR-Rechnung', 'OpCost Studio (OpEx)', 'Bexio ERP Sync'] : ['BKP 1–9 Cost Plan', 'Swiss QR-Bill', 'OpCost Studio (OpEx)', 'Bexio ERP Sync'],
          proTip: isGerman ? 'Verbuche Spesen und Rechnungen direkt mit automatischem QR-Code-Generator.' : 'Book expenses and invoices directly with automated Swiss QR-bill rendering.', 
          placement: 'right' 
        },
        { 
          target: '.tour-documents', 
          title: isGerman ? 'Firmen-Archiv & Beleg-Scan' : 'Company Archive & Scanning', 
          content: isGerman ? 'Ein sicherer Cloud-Ordnerbaum für Bauakten, Verträge und Pläne inklusive Smartphone Beleg-Scan per QR-Code.' : 'Secure cloud folder structure for site archives, contracts, and QR mobile receipt scanning.', 
          IconComponent: FileText, 
          submodules: isGerman ? ['Digitale Bauakten', 'QR Smartphone-Scan', 'Pläne & CAD-Archive', 'OCR Volltextsuche'] : ['Digital Site Records', 'QR Mobile Scan', 'CAD & Plan Archives', 'OCR Full-Text Search'],
          proTip: isGerman ? 'Scanne Belege auf der Baustelle mit dem Smartphone – sie landen sofort im richtigen Ordner.' : 'Scan receipts on site with your phone – they sync instantly to the cloud folder.', 
          placement: 'right' 
        },
        { 
          target: '.tour-templates', 
          title: isGerman ? 'Workflow-Booster' : 'Workflow Booster', 
          content: isGerman ? 'Speichere intelligente Bausteine, BKP-Vorlagen und Leistungsbeschriebe, um Routineaufgaben zu automatisieren.' : 'Save templates, BKP structures, and reusable blocks to automate routine work.', 
          IconComponent: LayoutTemplate, 
          submodules: isGerman ? ['BKP-Vorlagen', 'Leistungsbeschriebe', 'Muster-Offerten', 'Baustein-Bibliothek'] : ['BKP Templates', 'Scope of Work', 'Template Quotes', 'Component Library'],
          proTip: isGerman ? 'Spare wertvolle Zeit bei wiederkehrenden Angeboten und Bauleiter-Protokollen.' : 'Save time on recurring client offers and site protocols.', 
          placement: 'right' 
        },
        { 
          target: '.tour-leads', 
          title: isGerman ? 'Leads & Kundenanfragen' : 'Lead Engine', 
          content: isGerman ? 'Erfasse und verwalte Interessenten und eingehende Projekt-Anfragen direkt im Workspace mit Pipeline-Tracking.' : 'Capture and manage inbound customer leads directly in your workspace with pipeline tracking.', 
          IconComponent: Megaphone, 
          submodules: isGerman ? ['Lead-Pipeline', 'Projekt-Umwandlung', 'Echtzeit-Push', 'Kontakt-Dossier'] : ['Lead Pipeline', 'Project Conversion', 'Realtime Alerts', 'Contact Dossier'],
          proTip: isGerman ? 'Neue Leads lassen sich mit einem Klick in aktive Projekt-Workspaces umwandeln.' : 'Convert new leads into active project environments with a single click.', 
          placement: 'right' 
        },
        { 
          target: '.tour-crm', 
          title: isGerman ? 'Team & Partner-Netzwerk' : 'Team Network', 
          content: isGerman ? 'Das Zentrum deines Netzwerks. Verwalte Mitarbeiter, Subunternehmer und scanne Visitenkarten per KI.' : 'The core of your network. Manage staff, subcontractors, and scan business cards via AI.', 
          IconComponent: Users, 
          submodules: isGerman ? ['KI-Visitenkarten-Scan', 'Rollen & Rechte', 'Magic Invite-Links', 'Stundensätze'] : ['AI Business Card Scan', 'Roles & Permissions', 'Magic Invite Links', 'Hourly Rates'],
          proTip: isGerman ? 'Lade externe Handwerker und Planer per Magic Link mit begrenzten Rechten ein.' : 'Invite external subcontractors and planners via magic links with restricted rights.', 
          placement: 'right' 
        },
        { 
          target: '.tour-meet', 
          title: isGerman ? 'Meet & Live-Chat' : 'Meet & Live Chat', 
          content: isGerman ? 'Integrierte HD-Videokonferenzen und Team-Chats direkt im Browser – ohne externe Tools oder Software-Downloads.' : 'Integrated HD video calls and team chats directly in the browser – no downloads needed.', 
          IconComponent: Video, 
          submodules: isGerman ? ['HD Video-Konferenzen', 'Kein Software-Download', 'Screen-Sharing', 'Chat-Protokoll'] : ['HD Video Calls', 'Zero Software Download', 'Screen Sharing', 'Chat Transcripts'],
          proTip: isGerman ? 'Kunden und Partner können ohne Login oder Registrierung sofort per Link beitreten.' : 'Clients and partners can join immediately via link without registration.', 
          placement: 'right' 
        },
        { 
          target: '.tour-agenda', 
          title: isGerman ? 'Agenda & Rapporte' : 'Agenda & Time Reports', 
          content: isGerman ? 'Zentraler Kalender für Baustellenbesuche, Meetings und digitale Zeiterfassung mit automatischem Rapport-PDF-Export.' : 'Central calendar for site visits, meetings, and digital time tracking with PDF report exports.', 
          IconComponent: CalendarDays, 
          submodules: isGerman ? ['Tages- & Monatskalender', 'Regiebericht & Rapport', 'iCal-Synchronisation', 'KI-Tagesbericht'] : ['Day & Month Calendar', 'Time Tracking & Rapport', 'iCal Sync', 'AI Site Summary'],
          proTip: isGerman ? 'Exportiere Arbeits-Rapporte und Stundenabrechnungen direkt als druckreife PDFs.' : 'Export labor reports and time billings directly as print-ready PDF dossiers.', 
          placement: 'right' 
        },
        { 
          target: '.tour-settings', 
          title: isGerman ? 'System-Einstellungen & Abos' : 'System Settings', 
          content: isGerman ? 'Konfiguriere dein Firmenprofil, Schweizer MWST-Stammdaten und verwalte deine aktiven Stripe-Lizenzen.' : 'Configure company profiles, Swiss VAT, and active SaaS licenses.', 
          IconComponent: Settings, 
          submodules: isGerman ? ['Firmendaten & Logo', 'MWST-Sätze (CH)', 'Stripe Billing & Seats', 'Zentrale Rechte'] : ['Company Data & Logo', 'Swiss VAT Rates', 'Stripe Billing & Seats', 'Central Permissions'],
          proTip: isGerman ? 'Hier kannst du jederzeit dein Abo upgraden oder neue Mitarbeiter-Seats buchen.' : 'Upgrade or manage your subscription plan and add seats anytime.', 
          placement: 'right' 
        },
        { 
          target: '.tour-audit', 
          title: isGerman ? 'Revisionssichere Audit-Logs' : 'Audit Logs & Compliance', 
          content: isGerman ? 'Lückenlose Nachverfolgung aller System-Änderungen für Schweizer Datenschutz (DSG) und DSGVO Compliance.' : 'Comprehensive audit logs for Swiss data protection (DSG) and GDPR compliance.', 
          IconComponent: Shield, 
          submodules: isGerman ? ['DSG & DSGVO konform', 'Revisionssichere Logs', 'Sicherheits-Audit', 'Filter & Export'] : ['DSG & GDPR Compliant', 'Tamper-evident Logs', 'Security Audit', 'Filter & Export'],
          proTip: isGerman ? 'Geschäftsleitung und Auditoren können historische Transaktionen sekundengenau einsehen.' : 'Executive managers and auditors can inspect historical logs with second-level precision.', 
          placement: 'right' 
        }
      ];
    }

    interface ResolvedTargetResult {
      target: HTMLElement | string;
      isBody: boolean;
    }

    const getVisibleTargetElement = (selectorString: string): ResolvedTargetResult | null => {
      if (selectorString === 'body') return { target: 'body', isBody: true };
      
      // Comma-separated selectors in candidateDefs specify priority from left to right:
      // e.g. '.tour-finance-invoices, .tour-btn-module-guide, header, body'
      const selectors = selectorString.split(',').map(s => s.trim()).filter(Boolean);
      for (const sel of selectors) {
        if (sel === 'body') {
          return { target: 'body', isBody: true };
        }
        try {
          const elements = Array.from(document.querySelectorAll(sel)) as HTMLElement[];
          for (const el of elements) {
            const rect = el.getBoundingClientRect();
            const isVisible = el.offsetParent !== null || (rect.width > 0 && rect.height > 0);
            if (isVisible) return { target: el, isBody: false };
          }
        } catch {
          // invalid selector syntax, continue
        }
      }
      return { target: 'body', isBody: true };
    };

    // Filter to only step candidates that actually have a visible DOM element
    const resolvedCandidates = candidateDefs
      .map(def => {
        const resolved = getVisibleTargetElement(def.target);
        return resolved ? { ...def, resolvedTarget: resolved.target, isBodyTarget: resolved.isBody } : null;
      })
      .filter((item): item is (RawStepDef & { resolvedTarget: HTMLElement | string; isBodyTarget: boolean }) => item !== null);

    const totalSteps = resolvedCandidates.length;

    const validSteps: Step[] = resolvedCandidates.map((c, index) => {
      const stepNum = index + 1;
      const isCenter = c.isBodyTarget || c.placement === 'center';
      const effectivePlacement = isCenter
        ? 'center'
        : (isMobile && c.placement !== 'center' ? 'auto' : (c.placement || 'bottom'));

      return {
        target: c.resolvedTarget as any,
        content: buildStepContent(stepNum, totalSteps, c.title, c.content, c.IconComponent, c.proTip, c.submodules),
        placement: effectivePlacement,
        skipBeacon: true, // ✅ CRUCIAL: Eliminates the red pulsing beacon dot in React-Joyride v3
        disableBeacon: true, // backwards compatibility
        disableScrolling: isCenter ? true : (isMobile ? false : true),
        disableScrollParentFix: true,
        floaterProps: { disableAnimation: true }
      } as any;
    });

    setSteps(validSteps);
  }, [isTourRunning, activeModuleTour, location.pathname, language, theme, isDark, isGerman, stopTour]);

  const handleJoyrideCallback = async (data: any) => {
    const { status, action, type } = data;
    if (['finished', 'skipped'].includes(status) || action === 'close') {
      stopTour();
      setSteps([]);
      
      if (!activeModuleTour && currentUser?.uid) {
        safeStorage.setItem(`tour_${currentUser.uid}`, 'true');
        safeStorage.setItem(`tour_completed_${currentUser.uid}`, 'true');
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
        hideCloseButton: false,
        disableOverlayClose: false,
        spotlightClicks: false,
        options: {
          skipBeacon: true,
          overlayClickAction: 'close',
        },
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
          buttonClose: {
            display: 'none',
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