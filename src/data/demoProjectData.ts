// ============================================================================
// KREATIV DESK – ZENTRALES DEMO-TESTBAUPROJEKT & SMART OFFERTE
// Vollständiges Schweizer Architektur- & Bauleitungsprojekt (BKP & SIA-Konform)
// ============================================================================

export interface DemoTeamMember {
  id: string;
  name: string;
  role: string;          // Firmenrolle (z. B. 'Internal Employee', 'External Planner')
  projectRole: string;   // Projektrolle ('Owner', 'Admin', 'Editor', 'Viewer')
  department: string;
  email: string;
  phone: string;
  photoURL: string;
  avatar: string;
}

export const demoTeamMembers: DemoTeamMember[] = [
  {
    id: 'usr-sarah-meier',
    name: 'Sarah Meier',
    role: 'Internal',
    projectRole: 'Owner',
    department: 'Lead Architecture & BIM',
    email: 'sarah.meier@kreativ-desk.ch',
    phone: '+41 79 123 45 67',
    photoURL: '/demo-assets/avatar_sarah.jpg',
    avatar: '/demo-assets/avatar_sarah.jpg'
  },
  {
    id: 'usr-michael-chen',
    name: 'Michael Chen',
    role: 'Internal',
    projectRole: 'Admin',
    department: 'Bauleitung & Devisierung',
    email: 'michael.chen@kreativ-desk.ch',
    phone: '+41 78 987 65 43',
    photoURL: '/demo-assets/avatar_michael.jpg',
    avatar: '/demo-assets/avatar_michael.jpg'
  },
  {
    id: 'usr-elena-rossi',
    name: 'Elena Rossi',
    role: 'External Planner',
    projectRole: 'Editor',
    department: 'Bauingenieurin & Statik ETH',
    email: 'elena.rossi@kreativ-desk.ch',
    phone: '+41 76 543 21 09',
    photoURL: '/demo-assets/avatar_elena.jpg',
    avatar: '/demo-assets/avatar_elena.jpg'
  },
  {
    id: 'usr-thomas-keller',
    name: 'Dr. Thomas Keller',
    role: 'Client',
    projectRole: 'Viewer',
    department: 'Bauherr / Eigentümervertreter',
    email: 't.keller@keller-holding.ch',
    phone: '+41 44 800 90 00',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
  }
];

// Hochwertige, zuverlässige Architektur-Medien für Showreel & Präsentationen (Lokal & CDN-Ready)
export const demoMediaAssets = {
  heroVideo: '/media/portal_expanding.mp4',
  bimVideo: '/media/ink_transforms_building.mp4',
  materialsVideo: '/media/physical_materials.mp4',
  codeVideo: '/media/ink_morphs_code.mp4',
  dataStreamVideo: '/media/data_stream.mp4',
  heroPoster: '/media/architect_flatlay_blueprints.jpg',
  flatlayPoster: '/media/architect_flatlay_blueprints.jpg',
  modelCloseup: '/media/architectural_model_closeup.jpg',
  sarahStudio: '/media/sarah_architect_studio.jpg',
  michaelWorkbench: '/media/michael_engineer_workbench.jpg',
  workshopModel: '/media/studio_model_workshop.jpg',
  renderExterior1: '/media/architectural_model_closeup.jpg',
  renderInterior1: '/media/sarah_architect_studio.jpg',
  renderDetail: '/media/studio_model_workshop.jpg',
  siteConstruction: '/demo-assets/bau_kamera.jpg',
  sitePitch: '/media/michael_engineer_workbench.jpg',
  siteDefect: '/demo-assets/mangel_betonriss.jpg',
  groundPlanPdf: '/demo-assets/bau_grundriss_eg.pdf'
};

// ============================================================================
// VOLLSTÄNDIGE 30-TAGE SMART OFFERTE (SIA-KONFORM)
// ============================================================================
export const demoSmartProposal = {
  id: 'prop-neubau-sued-2026',
  projectId: 'demo-1',
  companyId: 'demo-company',
  ownerId: 'demo-owner',
  shareToken: 'demo-proposal',
  title: 'Architektur- & Ausführungsplanung Neubau Residenz am Park',
  clientName: 'Herr Dr. Thomas Keller',
  clientCompany: 'Keller Immobilien Holding AG',
  clientEmail: 't.keller@keller-holding.ch',
  clientPhone: '+41 44 800 90 00',
  introText: 'Sehr geehrter Herr Dr. Keller, herzlichen Dank für das fundierte Vorgespräch. Wir freuen uns, Ihnen nachfolgend unser detailliertes Gesamtangebot für Konzeption, Werkplanung, Devisierung und örtliche Bauleitung (SIA Phasen 31 bis 53) vorzulegen.',
  heroVideoUrl: demoMediaAssets.heroVideo,
  heroImageUrl: demoMediaAssets.heroPoster,
  basePrice: 148000,
  currency: 'CHF',
  options: [
    {
      id: 'opt-1',
      title: '3D-Echtzeit BIM-Visualisierung & VR-Begehung',
      description: 'Fotorealistisches 3D-BIM-Modell mit interaktiver Virtual-Reality-Begehung für Bauherren und Käufer auf Tablet & VR-Headset.',
      price: 6500,
      selectedByDefault: true
    },
    {
      id: 'opt-2',
      title: 'Monatliche Drohnen-Baufortschrittsdokumentation (4K)',
      description: 'Hochauflösende Luftbildaufnahmen, 3D-Fotogrammetrie-Messungen und monatliches Zeitraffervideo für die Bauherrschaft.',
      price: 4200,
      selectedByDefault: true
    },
    {
      id: 'opt-3',
      title: 'Minergie-P-ECO Fachbegleitung & Nachhaltigkeitsnachweis',
      description: 'Zertifizierungsbegleitung, ökologische Baustoffberatung und Energienachweise nach kantonalem MuKEn-Standard.',
      price: 5800,
      selectedByDefault: false
    },
    {
      id: 'opt-4',
      title: 'Express-Baubewilligungsverfahren & behördliche Sonderverhandlung',
      description: 'Prioritäre Bearbeitung der Baueingabe mit proaktiver Denkmalpflege- und Umweltämter-Koordination.',
      price: 3400,
      selectedByDefault: false
    }
  ],
  attachments: [
    { id: 'att-1', name: 'Baubeschrieb_SIA102_Neubau_Sued.pdf', url: demoMediaAssets.groundPlanPdf, size: '2.8 MB', type: 'pdf' as const },
    { id: 'att-2', name: 'Grundriss_EG_Schnitt_1_100.pdf', url: demoMediaAssets.groundPlanPdf, size: '778 KB', type: 'plan' as const },
    { id: 'att-3', name: 'AGB_Planervertrag_SIA_2026.pdf', url: demoMediaAssets.groundPlanPdf, size: '420 KB', type: 'doc' as const }
  ],
  legalDocuments: [
    { id: 'doc-1', name: 'SIA 118 Allgemeine Bedingungen für Bauarbeiten', type: 'werkvertrag' as const, url: demoMediaAssets.groundPlanPdf, isRequired: true, uploadedAt: new Date().toISOString() },
    { id: 'doc-2', name: 'Kreativ Desk AGB Planungsverträge & SIA 102 Honorarordnung', type: 'agb' as const, url: demoMediaAssets.groundPlanPdf, isRequired: true, uploadedAt: new Date().toISOString() },
    { id: 'doc-3', name: 'Schweizer DSGVO & Bauherren-Vertraulichkeitsvereinbarung (NDA)', type: 'nda' as const, url: demoMediaAssets.groundPlanPdf, isRequired: false, uploadedAt: new Date().toISOString() }
  ],
  paymentMilestones: [
    { id: 'm-1', phase: '1. Phase: Projektierung, Vorprojekt & Baubewilligung (30%)', percentage: 30, description: 'Fällig bei digitaler Freigabe und Auftragsbestätigung (Swiss QR-Rechnung).' },
    { id: 'm-2', phase: '2. Phase: Ausführungsplanung, Devisierung & Vergabe (40%)', percentage: 40, description: 'Fällig nach Freigabe der Werkpläne vor Aushub und Baumeisterstart.' },
    { id: 'm-3', phase: '3. Phase: Bauleitung, Realisierung & schlüsselfertige Übergabe (30%)', percentage: 30, description: 'Fällig nach mängelfreier Bauabnahme und Bezug der Liegenschaft.' }
  ],
  themeStyle: 'architecture' as const,
  themeColor: '#3b82f6',
  colorMode: 'auto' as const,
  slides: [
    {
      id: 'slide-1',
      title: 'Vision & Architekturkonzept',
      content: 'Das Projekt Quartier Neubau Süd verbindet skandinavische Schlichtheit mit Schweizer Präzision:\n\n• Holz-Hybridbauweise mit minimalem CO₂-Footprint\n• Lichtdurchflutete Räume durch bodentiefe Dreifach-Panoramafenster\n• Höchste Schall- und Wärmedämmwerte nach Minergie-P-Standard',
      layout: 'split',
      imageUrl: demoMediaAssets.heroPoster
    },
    {
      id: 'slide-2',
      title: '3D-Showreel & BIM-Modellierung',
      content: 'Vollständige digitale Modellierung aller Gewerke (Architektur, Statik, HLKS):\n\n• Kollisionsfreie Schnittstellenplanung vor Baubeginn\n• Automatische Mengenauszüge für exakte BKP-Kostensicherheit\n• 4K-Walkthrough für Bauherren und Behörden',
      layout: 'video-focus',
      videoUrl: demoMediaAssets.heroVideo,
      imageUrl: demoMediaAssets.renderExterior1
    },
    {
      id: 'slide-3',
      title: 'Materialisierung & Ausbau-Standard',
      content: 'Exklusive Materialien mit langlebiger Patina und Werthaltigkeit:\n\n• Handverlesenes Schweizer Eichenparkett (geölt)\n• Fein geglätteter Sichtbeton im Treppenhaus und Entrée\n• Grossformatiges Feinsteinzeug und hochwertige Sanitärapparate',
      layout: 'image-focus',
      imageUrl: demoMediaAssets.renderInterior1
    },
    {
      id: 'slide-4',
      title: 'Investitions- & BKP-Gliederung',
      layout: 'data-budget',
      dataPayload: {
        totalBudget: 148000,
        budgetGroups: [
          { pos: 'SIA 31-33', title: 'Vorprojekt & Bewilligungsverfahren', total: 44400 },
          { pos: 'SIA 41-51', title: 'Ausschreibung & Ausführungsplanung', total: 59200 },
          { pos: 'SIA 52-53', title: 'Bauleitung, QS & Inbetriebnahme', total: 44400 }
        ]
      }
    },
    {
      id: 'slide-5',
      title: 'Ihr interdisziplinäres Planungsteam',
      layout: 'team-grid',
      dataPayload: {
        members: [
          { name: 'Sarah Meier', role: 'Lead Architecture & BIM', photoURL: '/demo-assets/avatar_sarah.jpg' },
          { name: 'Michael Chen', role: 'Bauleiter SIA / Devisierung', photoURL: '/demo-assets/avatar_michael.jpg' },
          { name: 'Elena Rossi', role: 'Bauingenieurin & Statik ETH', photoURL: '/demo-assets/avatar_elena.jpg' }
        ]
      }
    }
  ],
  status: 'active' as const,
  // 30 Tage Gültigkeitsgarantie ab aktuellem Datum
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  viewsCount: 12,
  createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  updatedAt: new Date().toISOString()
};

// ============================================================================
// GESAMT-TEMPLATES FÜR DEMO-APP, SEED-SERVICE & KOMPONENTEN
// ============================================================================
export const demoConstructionProject = {
  project: {
    name: 'Quartier Neubau Süd - Residenz am Park',
    description: 'Zentrale Bauleitung, Mängelmanagement, SIA-Terminüberwachung und Budgetkontrolle für das Wohnquartier mit Minergie-P-ECO Zertifizierung.',
    status: 'active',
    siteLocation: 'Zürich (Enge)',
    imageUrl: demoMediaAssets.siteConstruction,
    planUrl: demoMediaAssets.sitePitch
  },

  bim: {
    useDefaultModel: true,
    url: ''
  },

  camera: {
    url: demoMediaAssets.siteConstruction
  },

  documents: [
    { name: 'Grundriss_EG_Freigabe.pdf', category: 'projects', url: demoMediaAssets.groundPlanPdf, size: '778 KB' },
    { name: 'Visualisierung_Projekt.jpg', category: 'projects', url: demoMediaAssets.sitePitch, size: '81 KB' },
    { name: 'Baukamera_Snapshot.jpg', category: 'projects', url: demoMediaAssets.siteConstruction, size: '804 KB' },
    { name: 'Mangelprotokoll_Betonriss.jpg', category: 'projects', url: demoMediaAssets.siteDefect, size: '490 KB' }
  ],

  members: demoTeamMembers,

  defects: [
    {
      id: 'def-1',
      title: 'Riss im Sichtbeton Achse B (Treppenhaus)',
      description: 'Haarriss im Treppenhaus EG-1.OG, statisch gemäss Statikerin Elena Rossi unbedenklich, jedoch optischer Mangel. Feinmörtel-Spachtelung erforderlich.',
      priority: 'Hoch',
      status: 'In Bearbeitung',
      trade: 'Baumeister (Gebr. Keller Bau AG)',
      location: 'EG, Haus A',
      imageUrl: demoMediaAssets.siteDefect
    },
    {
      id: 'def-2',
      title: 'Fensterdichtung beschädigt Nordfassade',
      description: 'Dichtungsprofil im 1. OG an der Wetterseite leicht eingedrückt. Vor Montage der Leibungsverkleidung ersetzen.',
      priority: 'Mittel',
      status: 'Offen',
      trade: 'Fensterbau (SwissWindows AG)',
      location: '1. OG, Raum 104',
      imageUrl: ''
    },
    {
      id: 'def-3',
      title: 'Schutzabdeckung Bodenheizung fehlt',
      description: 'Im 2. OG müssen die Heizrohre vor Einbringen des Unterlagsbodens mit Trittschutz versehen werden.',
      priority: 'Niedrig',
      status: 'Behoben',
      trade: 'Heizung / Sanitär',
      location: '2. OG, Korridor',
      imageUrl: ''
    }
  ],

  financeGroups: [
    {
      id: 'g100',
      pos: '100',
      title: '100 Vorbereitungsarbeiten',
      items: [
        { id: 'i111', pos: '111', title: 'Terrainfreilegung', description: 'Terrainfreilegung: Rodung und Abtransport von Sträuchern', unit: 'Pausch.', qty: 1, unitPrice: 15000, option: 0, total: 15000, type: 'cost' },
        { id: 'i112', pos: '112', title: 'Abbruch Gartenmauer', description: 'Abbruch Gartenmauer: Baggerarbeiten inkl. Entsorgung und Transport', unit: 'Std.', qty: 120, unitPrice: 150, option: 0, total: 18000, type: 'cost' }
      ]
    },
    {
      id: 'g200',
      pos: '200',
      title: '200 Gebäude (Rohbau)',
      items: [
        { id: 'i211', pos: '211', title: 'Aushub & Fundament', description: 'Aushub & Fundament: Aushubarbeiten 1500m3 inkl. Betonbodenplatte', unit: 'm3', qty: 1500, unitPrice: 120, option: 0, total: 180000, type: 'cost' },
        { id: 'i212', pos: '212', title: 'Betonwände & Decken', description: 'Betonwände & Decken: Sichtbetonwände giessen (EG bis 3. Obergeschoss)', unit: 'm3', qty: 850, unitPrice: 450, option: 0, total: 382500, type: 'cost' }
      ]
    },
    {
      id: 'g220',
      pos: '220',
      title: '220 Gebäudehülle (Fassade)',
      items: [
        { id: 'i221', pos: '221', title: 'Einbau Fenster', description: 'Einbau Fenster: Holz-Metall-Fenster 3-fach verglast nach Mass', unit: 'Stk.', qty: 48, unitPrice: 1250, option: 0, total: 60000, type: 'cost' },
        { id: 'i222', pos: '222', title: 'Einbau Aussentüren', description: 'Einbau Aussentüren: Sicherheitstüren Eingang (Aluminium/Glas)', unit: 'Stk.', qty: 3, unitPrice: 3800, option: 0, total: 11400, type: 'cost' }
      ]
    },
    {
      id: 'g270',
      pos: '270',
      title: '270 Ausbau (Innen)',
      items: [
        { id: 'i271', pos: '271', title: 'Gipserarbeiten', description: 'Gipserarbeiten: Wände verputzen und glätten (Qualität Q3)', unit: 'm2', qty: 2400, unitPrice: 45, option: 0, total: 108000, type: 'cost' },
        { id: 'i272', pos: '272', title: 'Malerarbeiten', description: 'Malerarbeiten: Wände und Decken 2-fach gestrichen (RAL 9010)', unit: 'm2', qty: 2400, unitPrice: 28, option: 0, total: 67200, type: 'cost' },
        { id: 'i281', pos: '281', title: 'Unterlagsboden', description: 'Unterlagsboden: Zementunterlagsboden inkl. Trittschalldämmung', unit: 'm2', qty: 1200, unitPrice: 85, option: 0, total: 102000, type: 'cost' },
        { id: 'i282', pos: '282', title: 'Parkettboden', description: 'Parkettboden: Eichenparkett Landhausdiele verlegen, geölt', unit: 'm2', qty: 1200, unitPrice: 110, option: 0, total: 132000, type: 'cost' },
        { id: 'i283', pos: '283', title: 'Einbau Innentüren', description: 'Einbau Innentüren: Holztüren stumpfeinschlagend, weiss lackiert', unit: 'Stk.', qty: 35, unitPrice: 850, option: 0, total: 29750, type: 'cost' }
      ]
    }
  ],

  tasks: [
    { id: 't1', title: '1. Vorprojekt & Baueingabe (SIA 31-33)', daysOffsetStart: 0, daysOffsetEnd: 25, progress: 100, status: 'Erledigt', color: '#3b82f6' },
    { id: 't2', title: '2. Aushub & Fundamentarbeiten', daysOffsetStart: 25, daysOffsetEnd: 50, progress: 90, status: 'Aktiv', color: '#10b981' },
    { id: 't3', title: '3. Rohbau EG bis 3. OG (Betonbau)', daysOffsetStart: 50, daysOffsetEnd: 95, progress: 25, status: 'Aktiv', color: '#f59e0b' },
    { id: 't4', title: '4. Gebäudehülle & Fensterdichtheit', daysOffsetStart: 95, daysOffsetEnd: 125, progress: 0, status: 'Geplant', color: '#8b5cf6' },
    { id: 't5', title: '5. Innenausbau (HLKS, Gipser, Parkett)', daysOffsetStart: 125, daysOffsetEnd: 165, progress: 0, status: 'Geplant', color: '#ec4899' },
    { id: 't6', title: '6. Umgebungs- & Gartenarbeiten', daysOffsetStart: 165, daysOffsetEnd: 180, progress: 0, status: 'Geplant', color: '#06b6d4' },
    { id: 't7', title: '7. Bauabnahme & Schlüsselübergabe', daysOffsetStart: 180, daysOffsetEnd: 190, progress: 0, status: 'Geplant', color: '#ef4444' }
  ],

  smartMarkers: [
    { id: 'm1', title: 'Baubewilligung rechtskräftig erteilt', daysOffset: 25, color: '#3b82f6' },
    { id: 'm2', title: 'Meilenstein: Rohbau vollendet', daysOffset: 95, color: '#f59e0b' },
    { id: 'm3', title: 'Fassade dicht (Winterfest gemäss SIA)', daysOffset: 125, color: '#8b5cf6' },
    { id: 'm4', title: 'Schlüsselübergabe & Bauherreneinzug', daysOffset: 190, color: '#ef4444' }
  ],

  pitchDeck: {
    title: 'Bauprojekt Statusbericht & Meilensteine',
    slides: [
      { id: 'slide-c1', order_index: 0, title: 'Projekt Status Overview', content: 'Der Rohbau verläuft nach Terminplan. Die Aushubarbeiten wurden mängelfrei abgenommen und das Fundament betoniert.', layout: 'image-focus', imageUrl: demoMediaAssets.heroPoster },
      { id: 'slide-c2', order_index: 1, title: 'Interdisziplinäres Projekt-Team', content: 'Die Zusammenarbeit zwischen Lead-Architektur, Statik ETH und den externen Baufirmen sichert höchste Bauqualität.', layout: 'team-grid' },
      { id: 'slide-c3', order_index: 2, title: 'Aktueller Baufortschritt', content: 'Aktuell wird die Decke über dem 1. Obergeschoss geschalt und betoniert. Parallel laufen die Detailabstimmungen der Fensterbänke.', layout: 'split', imageUrl: demoMediaAssets.siteConstruction },
      { id: 'slide-c4', order_index: 3, title: 'Architektur & Materialisierung', content: 'Sichtbeton, grossflächige Dreifach-Panoramafenster und Schweizer Holzwerkstoffe prägen das zukunftssichere Quartier.', layout: 'image-focus', imageUrl: demoMediaAssets.renderInterior1 },
      { id: 'slide-c5', order_index: 4, title: 'Digitales Mängelmanagement', content: 'Tickets werden via Smartphone direkt auf der Baustelle erfasst und Unternehmern mit Fristsetzung zugewiesen.', layout: 'split', imageUrl: demoMediaAssets.siteDefect }
    ]
  },

  transactions: [
    {
      id: 'tx1',
      category: 'Kreditorenrechnung (Handwerker / Material)',
      type: 'expense',
      amount: -15000,
      date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
      description: 'Rodung und Abtransport von Sträuchern (Terrainfreilegung)',
      title: 'Rechnung Gartenbau AG',
      status: 'Bezahlt',
      budgetPosId: 'i111'
    },
    {
      id: 'tx2',
      category: 'Kreditorenrechnung (Handwerker / Material)',
      type: 'expense',
      amount: -18000,
      date: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0],
      description: 'Baggerarbeiten inkl. Entsorgung und Transport (Abbruch Gartenmauer)',
      title: 'Abbruch & Erdbau Keller',
      status: 'Bezahlt',
      budgetPosId: 'i112'
    },
    {
      id: 'tx3',
      category: 'Honorar / Planerleistung',
      type: 'expense',
      amount: -24500,
      date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      description: 'Statische Berechnungen Fundament & Erdbebennachweis',
      title: 'Ingenieurbüro Rossi ETH',
      status: 'Bezahlt',
      budgetPosId: 'i211'
    },
    {
      id: 'tx4',
      category: 'Debitorenrechnung',
      type: 'income',
      amount: 148000,
      date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
      description: '30% Anzahlung gemäss SIA-Zahlungsplan (Auftragserteilung Dr. Thomas Keller)',
      title: 'Akontozahlung Bauherr Phase 1',
      status: 'Bezahlt'
    }
  ],

  timeEntries: [
    {
      id: 'time1',
      description: 'Örtliche Bauleitung: Bewehrungsabnahme Fundamentplatte',
      hours: 4.5,
      hourlyRate: 165,
      isBillable: true,
      userName: 'Michael Chen',
      date: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: 'time2',
      description: 'BIM-Fachkoordination & Statiksitzung mit Ingenieurbüro',
      hours: 3.0,
      hourlyRate: 165,
      isBillable: true,
      userName: 'Sarah Meier',
      date: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
      id: 'time3',
      description: 'Detailberechnung Rissbreitenbeschränkung Treppenhaus',
      hours: 2.5,
      hourlyRate: 180,
      isBillable: true,
      userName: 'Elena Rossi',
      date: new Date(Date.now() - 6 * 86400000).toISOString()
    }
  ],

  proposal: demoSmartProposal
};
