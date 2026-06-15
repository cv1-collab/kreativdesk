export const demoTemplates: Record<string, any> = {
  // ==========================================
  // 1. ARCHITEKTUR & BAU (Fokus für Launch)
  // ==========================================
  construction: {
    project: {
      name: 'Quartier Neubau Süd',
      description: 'Zentrale Bauleitung, Mängelmanagement und Budgetkontrolle für das Wohnquartier.',
      status: 'active',
      siteLocation: 'Zürich',
      imageUrl: '/demo-assets/bau_kamera.jpg',
      // 🔥 CAD-Plan direkt hier verknüpft, damit der Plan-Viewer ihn sofort erkennt
      planUrl: '/demo-assets/bau_grundriss_eg.jpg'
    },
    bim: { useDefaultModel: true }, 
    camera: { url: '/demo-assets/bau_kamera.jpg' },
    
    documents: [
      { name: 'Grundriss_EG_Freigabe.jpg', category: 'plans', url: '/demo-assets/bau_grundriss_eg.jpg' },
      { name: 'Statik_Bericht_Phase2.pdf', category: 'contracts', url: '/demo-assets/bau_statik_bericht.pdf' }
    ],

    // 🔥 Projektzugriffe gefüllt mit internen Mitarbeitern & externen Baufirmen
    members: [
      // INTERNES PROJEKT-TEAM
      { name: 'Sarah Meier', role: 'Lead Architect (Intern)', email: 'sarah@kreativ-desk.ch', phone: '+41 79 123 45 67', photoURL: '/demo-assets/avatar_sarah.jpg' },
      { name: 'Michael Chen', role: 'Bauleiter (Intern)', email: 'michael@kreativ-desk.ch', phone: '+41 78 987 65 43', photoURL: '/demo-assets/avatar_michael.jpg' },
      { name: 'Elena Rossi', role: 'Bauingenieurin (Intern)', email: 'elena@kreativ-desk.ch', phone: '+41 76 543 21 09', photoURL: '/demo-assets/avatar_elena.jpg' },
      
      // EXTERNE BAUFIRMEN / PARTNER
      { name: 'Urs Brunner', role: 'Projektleiter / Brunner Bau AG (Extern)', email: 'u.brunner@brunner-bau.ch', phone: '+41 79 444 55 66', photoURL: '/demo-assets/avatar_michael.jpg' },
      { name: 'Christian Steiner', role: 'Bauleiter Fassade / Steiner Fenster AG (Extern)', email: 'c.steiner@steiner-fenster.ch', phone: '+41 78 222 33 44', photoURL: '/demo-assets/avatar_michael.jpg' },
      { name: 'Thomas Lüthi', role: 'Chef-Elektriker / VoltZürich AG (Extern)', email: 't.luethi@voltzuerich.ch', phone: '+41 76 888 99 11', photoURL: '/demo-assets/avatar_elena.jpg' }
    ],

    defects: [
      { title: 'Riss im Sichtbeton Achse B', description: 'Haarriss im Treppenhaus, statisch unbedenklich aber optischer Mangel.', priority: 'High', status: 'Offen', trade: 'Baumeister', location: 'EG, Haus A', imageUrl: '/demo-assets/mangel_betonriss.jpg' },
      { title: 'Fensterdichtung beschädigt', description: 'Feuchtigkeitseintritt an Nordfassade.', priority: 'Medium', status: 'In Arbeit', trade: 'Fensterbau', location: '1. OG, Raum 104', imageUrl: '' }
    ],
    financeGroups: [
      {
        pos: '200',
        title: 'Vorbereitungsarbeiten & Rohbau',
        items: [
          { pos: '211', title: 'Baumeisterarbeiten', amount: 450000, actualAmount: 435000, type: 'cost' },
          { pos: '214', title: 'Aushub & Fundation', amount: 120000, actualAmount: 128000, type: 'cost' }
        ]
      },
      {
        pos: '220',
        title: 'Gebäudehülle & Ausbau',
        items: [
          { pos: '221', title: 'Fenster & Fassadenbau', amount: 280000, actualAmount: 0, type: 'cost' },
          { pos: '271', title: 'Gipserarbeiten', amount: 85000, actualAmount: 12000, type: 'cost' }
        ]
      }
    ],
    tasks: [
      { id: 'c1', title: 'Aushub & Fundamente', daysOffsetStart: -20, daysOffsetEnd: -2, progress: 100, status: 'Erledigt' },
      { id: 'c2', title: 'Rohbau EG bis 2. OG', daysOffsetStart: -1, daysOffsetEnd: 25, progress: 35, status: 'Aktiv' },
      { id: 'c3', title: 'Fassadenmontage', daysOffsetStart: 20, daysOffsetEnd: 45, progress: 0, status: 'Geplant' },
      { id: 'c4', title: 'Innenausbau Phase 1', daysOffsetStart: 40, daysOffsetEnd: 75, progress: 0, status: 'Geplant' }
    ],

    // 🔥 Das erweiterte Pitch-Deck mit exakt 7 Seiten
    pitchDeck: {
      title: 'Bauprojekt Statusbericht',
      slides: [
        { id: 'slide-c1', order_index: 0, title: 'Projekt Status Overview', content: 'Der Rohbau verläuft absolut nach Plan. Die Aushubarbeiten wurden erfolgreich, termingerecht und mängelfrei abgeschlossen.', layout: 'image-focus', imageUrl: '/demo-assets/bau_pitch_render.jpg' },
        { id: 'slide-c2', order_index: 1, title: 'Interdisziplinäres Projekt-Team', content: 'Die nahtlose Zusammenarbeit zwischen interner Architektur, Statik und den externen Baufirmen sichert die Einhaltung der Meilensteine.', layout: 'team-grid' },
        { id: 'slide-c3', order_index: 2, title: 'Aktueller Baufortschritt', content: 'Der Fokus liegt aktuell auf dem Betonieren der Decke über dem 1. Obergeschoss sowie der Vorbereitung für die Fassadenelemente.', layout: 'split', imageUrl: '/demo-assets/bau_kamera.jpg' },
        { id: 'slide-c4', order_index: 3, title: 'Architektur & Materialisierung', content: 'Das visuelle Konzept setzt auf reduzierten Sichtbeton, kombiniert mit grossflächigen Glasfronten für eine moderne, zeitlose Raumwirkung.', layout: 'image-focus', imageUrl: '/demo-assets/bau_pitch_render.jpg' },
        { id: 'slide-c5', order_index: 4, title: 'Wirtschaftlichkeit & Budget-Soll', content: 'Die Rohbaukosten bewegen sich stabil innerhalb der Kostentoleranz von +/- 3%. Engpässe in der Lieferkette wurden frühzeitig abgefangen.', layout: 'split', imageUrl: '/demo-assets/bau_kamera.jpg' },
        { id: 'slide-c6', order_index: 5, title: 'Qualitätssicherung & Mängel', content: 'Das digitale Mängelmanagement erlaubt die Echtzeit-Zuweisung von Abweichungen direkt an die verantwortlichen Unternehmer auf Platz.', layout: 'split', imageUrl: '/demo-assets/mangel_betonriss.jpg' },
        { id: 'slide-c7', order_index: 6, title: 'Nächste Meilensteine', content: 'Aufrichten des Dachstuhls im kommenden Monat, gefolgt vom planmässigen Start der Rohbauinstallationen für Heizung, Lüftung und Sanitär.', layout: 'image-focus', imageUrl: '/demo-assets/bau_pitch_render.jpg' }
      ]
    }
  },

  // ==========================================
  // PENDENZENLISTE (FÜR PHASE 2 NACH DEM LAUNCH)
  // ==========================================
  tour: { project: { name: 'Europa-Tournee – Main Stage', status: 'active', siteLocation: 'Berlin', imageUrl: '/demo-assets/tour_kamera.jpg' } },
  interior: { project: { name: 'Showroom ZH Umbau', status: 'active', siteLocation: 'Zürich', imageUrl: '/demo-assets/interior_kamera.jpg' } },
  agency: { project: { name: 'Brand Launch Kampagne', status: 'active', siteLocation: 'München', imageUrl: '/demo-assets/agency_kamera.jpg' } },
  museum: { project: { name: 'Vernissage "Moderne Kunst"', status: 'planning', siteLocation: 'Genf', imageUrl: '/demo-assets/museum_kamera.jpg' } },
  gastro: { project: { name: 'Sommer Pop-Up Restaurant', status: 'active', siteLocation: 'Basel', imageUrl: '/demo-assets/gastro_kamera.jpg' } }
};