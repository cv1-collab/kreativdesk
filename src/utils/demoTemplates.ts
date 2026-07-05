export const demoTemplates: Record<string, any> = {
  // ==========================================
  // 1. ARCHITEKTUR & BAU (Fokus für Launch)
  // ==========================================
  construction: {
    project: {
      name: 'Quartier Neubau Süd',
      description: 'Zentrale Bauleitung, Mängelmanagement und Budgetkontrolle für das Wohnquartier. Fokus auf Termin- und Kostentreue.',
      status: 'active',
      siteLocation: 'Zürich',
      imageUrl: '/demo-assets/bau_kamera.jpg',
      planUrl: '/demo-assets/bau_grundriss_eg.jpg'
    },
    bim: { useDefaultModel: true, url: '' }, 
    camera: { url: '/demo-assets/bau_kamera.jpg' },
    
    documents: [
      { name: 'Grundriss_EG_Freigabe.jpg', category: 'plans', url: '/demo-assets/bau_grundriss_eg.jpg' },
      { name: 'Statik_Bericht_Phase2.pdf', category: 'contracts', url: '/demo-assets/bau_statik_bericht.pdf' }
    ],

    members: [
      { name: 'Sarah Meier', role: 'Lead Architect (Intern)', email: 'sarah@kreativ-desk.ch', phone: '+41 79 123 45 67', photoURL: '/demo-assets/avatar_sarah.jpg' },
      { name: 'Michael Chen', role: 'Bauleiter (Intern)', email: 'michael@kreativ-desk.ch', phone: '+41 78 987 65 43', photoURL: '/demo-assets/avatar_michael.jpg' },
      { name: 'Elena Rossi', role: 'Bauingenieurin (Intern)', email: 'elena@kreativ-desk.ch', phone: '+41 76 543 21 09', photoURL: '/demo-assets/avatar_elena.jpg' },
    ],

    defects: [
      { title: 'Riss im Sichtbeton Achse B', description: 'Haarriss im Treppenhaus, statisch unbedenklich aber optischer Mangel.', priority: 'Hoch', status: 'Offen', trade: 'Baumeister', location: 'EG, Haus A', imageUrl: '/demo-assets/mangel_betonriss.jpg' },
      { title: 'Fensterdichtung beschädigt', description: 'Feuchtigkeitseintritt an Nordfassade.', priority: 'Mittel', status: 'In Arbeit', trade: 'Fensterbau', location: '1. OG, Raum 104', imageUrl: '' }
    ],
    
    // 🔥 PERFEKTIONIERTE FINANZEN MIT MENGEN UND EINHEITEN
    financeGroups: [
      {
        pos: '100', title: '100 Vorbereitungsarbeiten',
        items: [
          { pos: '111', title: 'Terrainfreilegung', description: 'Rodung und Abtransport von Sträuchern', unit: 'Pausch.', qty: 1, unitPrice: 15000, type: 'cost' },
          { pos: '112', title: 'Abbruch Gartenmauer', description: 'Baggerarbeiten inkl. Entsorgung und Transport', unit: 'Std.', qty: 120, unitPrice: 150, type: 'cost' }
        ]
      },
      {
        pos: '200', title: '200 Gebäude (Rohbau)',
        items: [
          { pos: '211', title: 'Aushub & Fundament', description: 'Aushubarbeiten 1500m3 inkl. Betonbodenplatte', unit: 'm3', qty: 1500, unitPrice: 120, type: 'cost' },
          { pos: '212', title: 'Betonwände & Decken', description: 'Sichtbetonwände giessen (EG bis 3. Obergeschoss)', unit: 'm3', qty: 850, unitPrice: 450, type: 'cost' }
        ]
      },
      {
        pos: '220', title: '220 Gebäudehülle (Fassade)',
        items: [
          { pos: '221', title: 'Einbau Fenster', description: 'Holz-Metall-Fenster 3-fach verglast nach Mass', unit: 'Stk.', qty: 48, unitPrice: 1250, type: 'cost' },
          { pos: '222', title: 'Einbau Aussentüren', description: 'Sicherheitstüren Eingang (Aluminium/Glas)', unit: 'Stk.', qty: 3, unitPrice: 3800, type: 'cost' }
        ]
      },
      {
        pos: '270', title: '270 Ausbau (Innen)',
        items: [
          { pos: '271', title: 'Gipserarbeiten', description: 'Wände verputzen und glätten (Qualität Q3)', unit: 'm2', qty: 2400, unitPrice: 45, type: 'cost' },
          { pos: '272', title: 'Malerarbeiten', description: 'Wände und Decken 2-fach gestrichen (RAL 9010)', unit: 'm2', qty: 2400, unitPrice: 28, type: 'cost' },
          { pos: '281', title: 'Unterlagsboden', description: 'Zementunterlagsboden inkl. Trittschalldämmung', unit: 'm2', qty: 1200, unitPrice: 85, type: 'cost' },
          { pos: '282', title: 'Parkettboden', description: 'Eichenparkett Landhausdiele verlegen, geölt', unit: 'm2', qty: 1200, unitPrice: 110, type: 'cost' },
          { pos: '283', title: 'Einbau Innentüren', description: 'Holztüren stumpfeinschlagend, weiss lackiert', unit: 'Stk.', qty: 35, unitPrice: 850, type: 'cost' }
        ]
      }
    ],

    // 🔥 SMART CALENDAR (Zeitachse)
    tasks: [
      { id: 't1', title: '1. Vorprojekt & Baueingabe', daysOffsetStart: 0, daysOffsetEnd: 20, progress: 100, status: 'Erledigt', color: '#3b82f6' },
      { id: 't2', title: '2. Aushub & Fundament', daysOffsetStart: 20, daysOffsetEnd: 40, progress: 85, status: 'Aktiv', color: '#10b981' },
      { id: 't3', title: '3. Rohbau EG bis 3. OG', daysOffsetStart: 40, daysOffsetEnd: 80, progress: 0, status: 'Geplant', color: '#f59e0b' },
      { id: 't4', title: '4. Fenster & Fassadenmontage', daysOffsetStart: 80, daysOffsetEnd: 110, progress: 0, status: 'Geplant', color: '#8b5cf6' },
      { id: 't5', title: '5. Innenausbau (Gipser, Maler, Boden)', daysOffsetStart: 110, daysOffsetEnd: 150, progress: 0, status: 'Geplant', color: '#ec4899' },
      { id: 't6', title: '6. Umgebungsarbeiten', daysOffsetStart: 150, daysOffsetEnd: 170, progress: 0, status: 'Geplant', color: '#06b6d4' },
      { id: 't7', title: '7. Bauabnahme & Übergabe', daysOffsetStart: 170, daysOffsetEnd: 180, progress: 0, status: 'Geplant', color: '#ef4444' }
    ],

    // 🔥 SMART MARKERS (Exakt ans Ende der Phasen geheftet)
    smartMarkers: [
      { id: 'm1', title: 'Baubewilligung erteilt', daysOffset: 20, color: '#3b82f6' },
      { id: 'm2', title: 'Meilenstein: Rohbau vollendet', daysOffset: 80, color: '#f59e0b' },
      { id: 'm3', title: 'Fassade dicht (Winterfest)', daysOffset: 110, color: '#8b5cf6' },
      { id: 'm4', title: 'Schlüsselübergabe & Einzug', daysOffset: 180, color: '#ef4444' }
    ],

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
    },
    
    // 🔥 FINANCIAL DATA & TRANSACTIONS
    transactions: [
      { id: 'tx1', category: 'Kreditorenrechnung', amount: -15000, date: new Date(Date.now() - 5*86400000).toISOString(), description: 'Rodung und Abtransport von Sträuchern', title: 'Rechnung Baumeister', status: 'Bezahlt' },
      { id: 'tx2', category: 'Kreditorenrechnung', amount: -18000, date: new Date(Date.now() - 12*86400000).toISOString(), description: 'Baggerarbeiten inkl. Entsorgung und Transport', title: 'Abbruch', status: 'Bezahlt' },
      { id: 'tx3', category: 'Debitorenrechnung', amount: 80000, date: new Date(Date.now() - 2*86400000).toISOString(), description: 'Akontozahlung Bauherr Phase 1', title: 'Akonto Phase 1', status: 'Bezahlt' }
    ],

    // 🔥 TIME ENTRIES
    timeEntries: [
      { id: 'time1', description: 'Baustellenbesichtigung & Rapport', hours: 4, date: new Date(Date.now() - 1*86400000).toISOString() },
      { id: 'time2', description: 'Planungssitzung Statik', hours: 2.5, date: new Date(Date.now() - 3*86400000).toISOString() },
      { id: 'time3', description: 'Abnahme Aushub', hours: 3, date: new Date(Date.now() - 6*86400000).toISOString() }
    ]
  }
};