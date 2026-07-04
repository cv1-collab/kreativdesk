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
    }
  },
  interior: {
    project: {
      name: 'Showroom ZH Umbau',
      description: 'Komplette Neugestaltung und Innenausbau des Zürcher Showrooms. Fokus auf Lichtdesign und edle Materialien.',
      status: 'active',
      siteLocation: 'Zürich',
      imageUrl: '/demo-assets/interior_kamera.jpg',
      planUrl: '/demo-assets/interior_kamera.jpg'
    },
    bim: { useDefaultModel: true, url: '' },
    camera: { url: '/demo-assets/interior_kamera.jpg' },
    documents: [
      { name: 'Lichtkonzept_V2.pdf', category: 'plans', url: '/demo-assets/bau_statik_bericht.pdf' },
      { name: 'Materialboard.jpg', category: 'contracts', url: '/demo-assets/bau_grundriss_eg.jpg' }
    ],
    members: [
      { name: 'Lara Becker', role: 'Interior Designer', email: 'lara@kreativ-desk.ch', phone: '+41 79 111 22 33', photoURL: '/demo-assets/avatar_sarah.jpg' },
      { name: 'Max Weber', role: 'Projektleiter', email: 'max@kreativ-desk.ch', phone: '+41 78 444 55 66', photoURL: '/demo-assets/avatar_michael.jpg' }
    ],
    defects: [
      { title: 'Kratzer im Parkett', description: 'Tiefer Kratzer im Eingangsbereich.', priority: 'Hoch', status: 'Offen', trade: 'Bodenleger', location: 'Eingang', imageUrl: '/demo-assets/mangel_betonriss.jpg' }
    ],
    financeGroups: [
      {
        pos: '100', title: '100 Konzept & Planung',
        items: [
          { pos: '111', title: 'Designentwurf', description: 'Moodboards und 3D Visualisierungen', unit: 'Pausch.', qty: 1, unitPrice: 8500, type: 'cost' }
        ]
      },
      {
        pos: '200', title: '200 Material & Möbel',
        items: [
          { pos: '211', title: 'Eichenparkett', description: 'Hochwertiges Eichenparkett inkl. Verlegen', unit: 'm2', qty: 150, unitPrice: 180, type: 'cost' },
          { pos: '212', title: 'Lichtinstallation', description: 'LED-Spots und Pendelleuchten', unit: 'Stk.', qty: 24, unitPrice: 350, type: 'cost' }
        ]
      }
    ],
    tasks: [
      { id: 't1', title: '1. Konzeptphase', daysOffsetStart: 0, daysOffsetEnd: 15, progress: 100, status: 'Erledigt', color: '#3b82f6' },
      { id: 't2', title: '2. Materialbestellung', daysOffsetStart: 15, daysOffsetEnd: 25, progress: 50, status: 'Aktiv', color: '#10b981' },
      { id: 't3', title: '3. Innenausbau', daysOffsetStart: 25, daysOffsetEnd: 45, progress: 0, status: 'Geplant', color: '#f59e0b' },
      { id: 't4', title: '4. Möblierung & Deko', daysOffsetStart: 45, daysOffsetEnd: 60, progress: 0, status: 'Geplant', color: '#8b5cf6' }
    ],
    smartMarkers: [
      { id: 'm1', title: 'Design freigegeben', daysOffset: 15, color: '#3b82f6' },
      { id: 'm2', title: 'Einbau abgeschlossen', daysOffset: 45, color: '#f59e0b' },
      { id: 'm3', title: 'Eröffnung', daysOffset: 60, color: '#ef4444' }
    ],
    pitchDeck: {
      title: 'Showroom Konzept',
      slides: [
        { id: 'slide-1', order_index: 0, title: 'Vision', content: 'Ein moderner Showroom, der die Markenidentität durch exklusive Materialien widerspiegelt.', layout: 'image-focus', imageUrl: '/demo-assets/interior_kamera.jpg' },
        { id: 'slide-2', order_index: 1, title: 'Materialisierung', content: 'Fokus auf warme Holztöne kombiniert mit kühlem Edelstahl.', layout: 'split', imageUrl: '/demo-assets/bau_grundriss_eg.jpg' }
      ]
    }
  },

  agency: {
    project: {
      name: 'Brand Launch Kampagne',
      description: 'Entwicklung und Rollout der neuen 360-Grad Marketingkampagne.',
      status: 'active',
      siteLocation: 'München',
      imageUrl: '/demo-assets/agency_kamera.jpg',
      planUrl: '/demo-assets/agency_kamera.jpg'
    },
    bim: { useDefaultModel: true, url: '' },
    camera: { url: '/demo-assets/agency_kamera.jpg' },
    documents: [
      { name: 'Kampagnen_Strategie.pdf', category: 'plans', url: '/demo-assets/bau_statik_bericht.pdf' },
      { name: 'Social_Media_Guidelines.pdf', category: 'contracts', url: '/demo-assets/bau_statik_bericht.pdf' }
    ],
    members: [
      { name: 'Julia Sommer', role: 'Art Director', email: 'julia@kreativ-desk.ch', phone: '+41 79 333 44 55', photoURL: '/demo-assets/avatar_elena.jpg' },
      { name: 'Tim Bauer', role: 'Copywriter', email: 'tim@kreativ-desk.ch', phone: '+41 78 222 33 44', photoURL: '/demo-assets/avatar_michael.jpg' },
      { name: 'Sara Demir', role: 'Media Planner', email: 'sara@kreativ-desk.ch', phone: '+41 76 111 22 33', photoURL: '/demo-assets/avatar_sarah.jpg' }
    ],
    defects: [
      { title: 'Typo im Billboard', description: 'Rechtschreibfehler im Main Slogan entdeckt', priority: 'Hoch', status: 'Offen', trade: 'Copywriting', location: 'OOH Plakat', imageUrl: '/demo-assets/mangel_betonriss.jpg' },
      { title: 'Video Export fehlerhaft', description: 'Falsches Farbprofil im finalen Render', priority: 'Mittel', status: 'In Arbeit', trade: 'Video Production', location: 'Social Ads', imageUrl: '' }
    ],
    financeGroups: [
      {
        pos: '100', title: '100 Strategie & Kreation',
        items: [
          { pos: '111', title: 'Konzeption', description: 'Kampagnenidee und Storytelling', unit: 'Std.', qty: 80, unitPrice: 150, type: 'cost' },
          { pos: '112', title: 'Design & Art Direction', description: 'Visuelle Leitlinie', unit: 'Std.', qty: 120, unitPrice: 160, type: 'cost' }
        ]
      },
      {
        pos: '200', title: '200 Media Spend',
        items: [
          { pos: '211', title: 'Social Media Ads', description: 'Budget für IG/FB/LinkedIn', unit: 'Pausch.', qty: 1, unitPrice: 50000, type: 'cost' },
          { pos: '212', title: 'OOH Plakate', description: 'Buchung Werbeflächen München', unit: 'Pausch.', qty: 1, unitPrice: 35000, type: 'cost' }
        ]
      }
    ],
    tasks: [
      { id: 't1', title: '1. Strategie', daysOffsetStart: 0, daysOffsetEnd: 14, progress: 100, status: 'Erledigt', color: '#3b82f6' },
      { id: 't2', title: '2. Asset Produktion', daysOffsetStart: 14, daysOffsetEnd: 40, progress: 20, status: 'Aktiv', color: '#10b981' },
      { id: 't3', title: '3. Rollout', daysOffsetStart: 40, daysOffsetEnd: 90, progress: 0, status: 'Geplant', color: '#f59e0b' }
    ],
    smartMarkers: [
      { id: 'm1', title: 'Strategie approved', daysOffset: 14, color: '#3b82f6' },
      { id: 'm2', title: 'Go-Live', daysOffset: 40, color: '#ef4444' }
    ],
    pitchDeck: {
      title: 'Kampagnen Vorstellung',
      slides: [
        { id: 'slide-1', order_index: 0, title: 'Kampagnenziel', content: 'Steigerung der Brand Awareness um 25% im Q3.', layout: 'image-focus', imageUrl: '/demo-assets/agency_kamera.jpg' },
        { id: 'slide-2', order_index: 1, title: 'Zielgruppe', content: 'Fokus auf Millennials im urbanen Umfeld.', layout: 'split', imageUrl: '/demo-assets/bau_grundriss_eg.jpg' },
        { id: 'slide-3', order_index: 2, title: 'Visuals', content: 'Dynamische, farbenfrohe Assets für Social Media.', layout: 'image-focus', imageUrl: '/demo-assets/agency_kamera.jpg' }
      ]
    }
  },

  tour: {
    project: {
      name: 'Europa-Tournee – Main Stage',
      description: 'Planung und Durchführung der Bühnenproduktion für die 25-Städte Tour.',
      status: 'active',
      siteLocation: 'Berlin',
      imageUrl: '/demo-assets/tour_kamera.jpg',
      planUrl: '/demo-assets/tour_kamera.jpg'
    },
    bim: { useDefaultModel: true, url: '' },
    camera: { url: '/demo-assets/tour_kamera.jpg' },
    documents: [
      { name: 'Stage_Plan_V3.pdf', category: 'plans', url: '/demo-assets/bau_statik_bericht.pdf' },
      { name: 'Technical_Rider.pdf', category: 'contracts', url: '/demo-assets/bau_statik_bericht.pdf' }
    ],
    members: [
      { name: 'Tom Hiller', role: 'Production Manager', email: 'tom@kreativ-desk.ch', phone: '+41 79 555 66 77', photoURL: '/demo-assets/avatar_michael.jpg' },
      { name: 'Lisa Vane', role: 'Lighting Designer', email: 'lisa@kreativ-desk.ch', phone: '+41 78 888 99 00', photoURL: '/demo-assets/avatar_sarah.jpg' },
      { name: 'Ben Stark', role: 'Audio Engineer', email: 'ben@kreativ-desk.ch', phone: '+41 76 333 22 11', photoURL: '/demo-assets/avatar_elena.jpg' }
    ],
    defects: [
      { title: 'Toter Pixel in Center-LED', description: 'Ein Panel in der Mitte der Wand hat einen Ausfall', priority: 'Mittel', status: 'In Arbeit', trade: 'Video', location: 'Main Stage', imageUrl: '/demo-assets/mangel_betonriss.jpg' },
      { title: 'Brummen auf Line-Array L', description: 'Interferenz auf dem linken Main-Hang', priority: 'Hoch', status: 'Offen', trade: 'Audio', location: 'Stage Left', imageUrl: '' }
    ],
    financeGroups: [
      {
        pos: '100', title: '100 Technik',
        items: [
          { pos: '111', title: 'Bühnenbild', description: 'Custom Stage Design & LEDs', unit: 'Pausch.', qty: 1, unitPrice: 120000, type: 'cost' },
          { pos: '112', title: 'Audio System', description: 'PA & Monitoring Miete', unit: 'Wochen', qty: 6, unitPrice: 15000, type: 'cost' }
        ]
      },
      {
        pos: '200', title: '200 Logistik',
        items: [
          { pos: '211', title: 'Trucking', description: '5x 40t Trucks Europaweit', unit: 'Km', qty: 12000, unitPrice: 3.5, type: 'cost' },
          { pos: '212', title: 'Nightliner', description: 'Tourbus für Crew', unit: 'Tage', qty: 45, unitPrice: 800, type: 'cost' }
        ]
      }
    ],
    tasks: [
      { id: 't1', title: '1. Stage Design', daysOffsetStart: 0, daysOffsetEnd: 30, progress: 100, status: 'Erledigt', color: '#3b82f6' },
      { id: 't2', title: '2. Proben', daysOffsetStart: 30, daysOffsetEnd: 50, progress: 50, status: 'Aktiv', color: '#10b981' },
      { id: 't3', title: '3. Tournee', daysOffsetStart: 50, daysOffsetEnd: 150, progress: 0, status: 'Geplant', color: '#ef4444' }
    ],
    smartMarkers: [
      { id: 'm1', title: 'Tourstart', daysOffset: 50, color: '#ef4444' }
    ],
    pitchDeck: {
      title: 'Tour Production',
      slides: [
        { id: 'slide-1', order_index: 0, title: 'Stage Design', content: 'Innovatives LED-Konzept für maximale visuelle Wirkung.', layout: 'image-focus', imageUrl: '/demo-assets/tour_kamera.jpg' },
        { id: 'slide-2', order_index: 1, title: 'Audio Setup', content: 'Immersives 360-Grad Sounderlebnis.', layout: 'split', imageUrl: '/demo-assets/bau_grundriss_eg.jpg' },
        { id: 'slide-3', order_index: 2, title: 'Logistik Plan', content: 'Effizientes Routing durch 25 Metropolen.', layout: 'image-focus', imageUrl: '/demo-assets/tour_kamera.jpg' }
      ]
    }
  },

  museum: {
    project: {
      name: 'Vernissage "Moderne Kunst"',
      description: 'Kuratierung und Eventplanung für die neue Ausstellung.',
      status: 'planning',
      siteLocation: 'Genf',
      imageUrl: '/demo-assets/museum_kamera.jpg',
      planUrl: '/demo-assets/museum_kamera.jpg'
    },
    bim: { useDefaultModel: true, url: '' },
    camera: { url: '/demo-assets/museum_kamera.jpg' },
    documents: [
      { name: 'Katalog_Entwurf.pdf', category: 'plans', url: '/demo-assets/bau_statik_bericht.pdf' },
      { name: 'Versicherungspolice_Exponate.pdf', category: 'contracts', url: '/demo-assets/bau_statik_bericht.pdf' }
    ],
    members: [
      { name: 'Anna Frey', role: 'Kuratorin', email: 'anna@kreativ-desk.ch', phone: '+41 79 777 88 99', photoURL: '/demo-assets/avatar_sarah.jpg' },
      { name: 'Louis Mettler', role: 'Restaurator', email: 'louis@kreativ-desk.ch', phone: '+41 78 112 23 34', photoURL: '/demo-assets/avatar_michael.jpg' },
      { name: 'Claire Dubois', role: 'Szenografin', email: 'claire@kreativ-desk.ch', phone: '+41 76 998 87 76', photoURL: '/demo-assets/avatar_elena.jpg' }
    ],
    defects: [
      { title: 'Spot defekt in Vitrine 3', description: 'Beleuchtung fällt sporadisch aus', priority: 'Mittel', status: 'Offen', trade: 'Elektro', location: 'Saal 1', imageUrl: '/demo-assets/mangel_betonriss.jpg' },
      { title: 'Klimasteuerung schwankt', description: 'Luftfeuchtigkeit über Grenzwert', priority: 'Hoch', status: 'In Arbeit', trade: 'Haustechnik', location: 'Archiv', imageUrl: '' }
    ],
    financeGroups: [
      {
        pos: '100', title: '100 Exponate',
        items: [
          { pos: '111', title: 'Transport & Versicherung', description: 'Kunsttransport international', unit: 'Pausch.', qty: 1, unitPrice: 35000, type: 'cost' },
          { pos: '112', title: 'Leihgebühren', description: 'Gebühren für externe Werke', unit: 'Pausch.', qty: 1, unitPrice: 120000, type: 'cost' }
        ]
      },
      {
        pos: '200', title: '200 Szenografie',
        items: [
          { pos: '211', title: 'Vitrinenbau', description: 'Massanfertigung Sicherheitsglas', unit: 'Stk.', qty: 12, unitPrice: 4500, type: 'cost' },
          { pos: '212', title: 'Lichtkonzept', description: 'Erweiterung der Bestandsbeleuchtung', unit: 'Pausch.', qty: 1, unitPrice: 18000, type: 'cost' }
        ]
      }
    ],
    tasks: [
      { id: 't1', title: '1. Exponat-Auswahl', daysOffsetStart: 0, daysOffsetEnd: 45, progress: 100, status: 'Erledigt', color: '#3b82f6' },
      { id: 't2', title: '2. Szenografie', daysOffsetStart: 45, daysOffsetEnd: 75, progress: 10, status: 'Aktiv', color: '#10b981' }
    ],
    smartMarkers: [
      { id: 'm1', title: 'Vernissage', daysOffset: 75, color: '#ef4444' }
    ],
    pitchDeck: {
      title: 'Ausstellungskonzept',
      slides: [
        { id: 'slide-1', order_index: 0, title: 'Thema', content: 'Ein Dialog zwischen zeitgenössischer Skulptur und digitaler Kunst.', layout: 'image-focus', imageUrl: '/demo-assets/museum_kamera.jpg' },
        { id: 'slide-2', order_index: 1, title: 'Raumkonzept', content: 'Offene Sichtachsen und gezielte Lichtsetzung.', layout: 'split', imageUrl: '/demo-assets/bau_grundriss_eg.jpg' },
        { id: 'slide-3', order_index: 2, title: 'Marketing', content: 'Begleitende AR-App für interaktive Führungen.', layout: 'image-focus', imageUrl: '/demo-assets/museum_kamera.jpg' }
      ]
    }
  },

  gastro: {
    project: {
      name: 'Sommer Pop-Up Restaurant',
      description: 'Planung und Aufbau eines temporären Restaurants am See.',
      status: 'active',
      siteLocation: 'Basel',
      imageUrl: '/demo-assets/gastro_kamera.jpg',
      planUrl: '/demo-assets/gastro_kamera.jpg'
    },
    bim: { useDefaultModel: true, url: '' },
    camera: { url: '/demo-assets/gastro_kamera.jpg' },
    documents: [
      { name: 'Menu_Draft_Sommer.pdf', category: 'plans', url: '/demo-assets/bau_statik_bericht.pdf' },
      { name: 'Hygienekonzept.pdf', category: 'contracts', url: '/demo-assets/bau_statik_bericht.pdf' }
    ],
    members: [
      { name: 'Marco Blanc', role: 'Event Manager', email: 'marco@kreativ-desk.ch', phone: '+41 79 999 00 11', photoURL: '/demo-assets/avatar_michael.jpg' },
      { name: 'Elena Koch', role: 'Chef de Cuisine', email: 'elena.k@kreativ-desk.ch', phone: '+41 78 555 44 33', photoURL: '/demo-assets/avatar_elena.jpg' },
      { name: 'Kevin Roth', role: 'Sommelier', email: 'kevin@kreativ-desk.ch', phone: '+41 76 222 11 00', photoURL: '/demo-assets/avatar_sarah.jpg' }
    ],
    defects: [
      { title: 'Kühlzelle kühlt nicht richtig', description: 'Temperatur bleibt bei 8°C statt 4°C', priority: 'Hoch', status: 'Offen', trade: 'Küchenbau', location: 'Back of House', imageUrl: '/demo-assets/mangel_betonriss.jpg' },
      { title: 'Zeltdach undicht', description: 'Bei starkem Regen tropft es beim Eingang', priority: 'Mittel', status: 'In Arbeit', trade: 'Zeltbau', location: 'Eingang', imageUrl: '' }
    ],
    financeGroups: [
      {
        pos: '100', title: '100 Infrastruktur',
        items: [
          { pos: '111', title: 'Zelt & Möbel', description: 'Miete für 3 Monate', unit: 'Mt.', qty: 3, unitPrice: 15000, type: 'cost' },
          { pos: '112', title: 'Küchencontainer', description: 'Voll ausgestattete Gastroküche', unit: 'Mt.', qty: 3, unitPrice: 8500, type: 'cost' }
        ]
      },
      {
        pos: '200', title: '200 Personal & Betrieb',
        items: [
          { pos: '211', title: 'Service Personal', description: 'Kalkulierte Lohnkosten', unit: 'Std.', qty: 1500, unitPrice: 35, type: 'cost' },
          { pos: '212', title: 'Marketing', description: 'Social Media & PR Kampagne', unit: 'Pausch.', qty: 1, unitPrice: 12000, type: 'cost' }
        ]
      }
    ],
    tasks: [
      { id: 't1', title: '1. Bewilligungen', daysOffsetStart: 0, daysOffsetEnd: 30, progress: 100, status: 'Erledigt', color: '#3b82f6' },
      { id: 't2', title: '2. Aufbau', daysOffsetStart: 30, daysOffsetEnd: 45, progress: 80, status: 'Aktiv', color: '#10b981' },
      { id: 't3', title: '3. Betrieb', daysOffsetStart: 45, daysOffsetEnd: 135, progress: 0, status: 'Geplant', color: '#f59e0b' }
    ],
    smartMarkers: [
      { id: 'm1', title: 'Grand Opening', daysOffset: 45, color: '#ef4444' }
    ],
    pitchDeck: {
      title: 'Pop-Up Konzept',
      slides: [
        { id: 'slide-1', order_index: 0, title: 'Kulinarik', content: 'Fokus auf regionale Zutaten und mediterranes Flair.', layout: 'image-focus', imageUrl: '/demo-assets/gastro_kamera.jpg' },
        { id: 'slide-2', order_index: 1, title: 'Location', content: 'Direkt am Seeufer mit Sonnenuntergangs-Garantie.', layout: 'split', imageUrl: '/demo-assets/bau_grundriss_eg.jpg' },
        { id: 'slide-3', order_index: 2, title: 'Wirtschaftlichkeit', content: 'Break-Even bereits nach 4 Wochen Laufzeit erwartet.', layout: 'image-focus', imageUrl: '/demo-assets/gastro_kamera.jpg' }
      ]
    }
  }
};