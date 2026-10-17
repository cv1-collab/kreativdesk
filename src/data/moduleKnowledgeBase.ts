export interface ModuleWorkflow {
  title: string;
  duration: string;
  steps: string[];
  proTip: string;
}

export interface ModuleToolFeature {
  name: string;
  badge: string;
  description: string;
}

export interface ModuleFaqItem {
  q: string;
  a: string;
}

export interface ModuleKnowledgeEntry {
  id: string;
  category: 'company_hub' | 'project_cockpit' | 'studios_ai' | 'finance_legal';
  categoryLabel: string;
  title: string;
  subtitle: string;
  summary: string;
  dataFlow: string[];
  workflows: ModuleWorkflow[];
  tools: ModuleToolFeature[];
  roleAccess: {
    ownerAdmin: string;
    employee: string;
    externalGuest: string;
  };
  faqs: ModuleFaqItem[];
}

export const MODULE_KNOWLEDGE_BASE_DE: Record<string, ModuleKnowledgeEntry> = {
  projects: {
    id: 'projects',
    category: 'company_hub',
    categoryLabel: 'Firmenzentrale (Ebene 1)',
    title: 'Firmenzentrale & Projekt-Portfolio',
    subtitle: 'Strategische Gesamtsteuerung über alle laufenden Bau-, Architektur- und Agenturprojekte.',
    summary:
      'Die Firmenzentrale ist deine Kommandozentrale auf Unternehmensebene (Ebene 1). Hier überblickst du sämtliche aktiven Projekte, unternehmensweite Umsätze, offene Offerten, Team-Auslastungen und gelangst mit einem Klick in jedes einzelne Projekt-Cockpit (Ebene 2).',
    dataFlow: [
      'Neues Projekt anlegen (inkl. Budget & SIA-Phase)',
      'Automatische Erstellung der Schweizer Standard-Ordnerstruktur (01–09)',
      'Echtzeit-Aggregation aller Projekt-Finanzen & Stunden in der Firmenzentrale',
      '1-Klick Wechsel in das dedizierte Projekt-Cockpit'
    ],
    workflows: [
      {
        title: 'Neues Kundenprojekt mit Ordnerstruktur starten',
        duration: '45 Sek.',
        steps: [
          'Klicke oben rechts in der Firmenzentrale auf «+ Neues Projekt».',
          'Vergib Projektnamen, Kunden, Standort, Budgetrahmen in CHF und die aktuelle SIA-Phase.',
          'Optional: Lade direkt ein Titelbild hoch oder wähle ein KI-generiertes Architektur-Vorschaubild.',
          'Mit «Projekt erstellen» legt das System im Hintergrund automatisch den kompletten Datenraum (Ordner 01 bis 09) und den Finanz-Ledger an.'
        ],
        proTip: 'Du kannst bestehende Projekte jederzeit nach Status (Aktiv, In Planung, Abgeschlossen) oder über die Schnellsuche filtern.'
      },
      {
        title: 'Zwischen Firmenzentrale (Ebene 1) und Projekt-Cockpit (Ebene 2) wechseln',
        duration: '10 Sek.',
        steps: [
          'In der linken Seitenleiste siehst du oben immer, ob du dich in der «Firmenzentrale» oder in einem spezifischen «Projekt» befindest.',
          'Klicke auf eine Projektkarte in der Übersicht, um in das Projekt-Cockpit mit allen 12 Spezialwerkzeugen (CAD, BIM, Mängel, Baustelle) einzutauchen.',
          'Über den Button «Zurück zur Firmenzentrale» oben links kehrst du jederzeit zur globalen Unternehmenssicht zurück.'
        ],
        proTip: 'Externe Gäste (Bauherren/Handwerker) sehen niemals die Firmenzentrale, sondern ausschliesslich die Projekte, für die sie explizit freigeschaltet wurden.'
      }
    ],
    tools: [
      { name: 'Projekt-Karten & Status-Badges', badge: 'Portfolio', description: 'Zeigt Fortschritt, SIA-Phase, Budget-Auslastung und zugewiesene Teammitglieder auf einen Blick.' },
      { name: 'Globale KPI-Leiste', badge: 'Echtzeit-Finanzen', description: 'Konsolidiert bezahlte/offene Rechnungen, Offerten-Volumen und Netto-Ertrag über alle Projekte.' },
      { name: 'Schnellfilter & Suche', badge: 'Navigation', description: 'Filtert Projekte sofort nach Projektname, Bauherr, Ort oder Projektstatus.' },
      { name: 'System-Handbuch (PDF Studio)', badge: '14 Seiten PDF', description: 'Öffnet das offizielle Referenzhandbuch als druckfertiges Vektor-PDF zum Speichern im Datenraum.' }
    ],
    roleAccess: {
      ownerAdmin: 'Voller Zugriff auf alle Projekte, globale Unternehmensfinanzen, Einstellungen und Lizenzen.',
      employee: 'Sieht alle freigegebenen Firmenprojekte, Aufgaben und Zeiten (Finanz-Kennzahlen nur bei aktivierter Berechtigung «Finanzen sehen»).',
      externalGuest: 'Kein Zugriff auf die Firmenzentrale. Sieht ausschliesslich das ihm explizit zugewiesene Einzelprojekt.'
    },
    faqs: [
      {
        q: 'Was ist der Unterschied zwischen Firmenzentrale und Projekt-Cockpit?',
        a: 'Die Firmenzentrale bündelt alles, was das gesamte Unternehmen betrifft (alle Projekte, CRM-Stammkontakte, Verkaufs-Leads, globales Finanzbuch, Mitarbeiter-Lizenzen). Das Projekt-Cockpit öffnet sich, sobald du ein einzelnes Projekt anklickst, und enthält die projektbezogenen Werkzeuge wie 3D-BIM, 2D-CAD, Baustellen-Kamera und Mängelliste.'
      },
      {
        q: 'Zählen Projekte gegen ein Limit?',
        a: 'Im Pro-, Studio-, Agency- und Enterprise-Plan kannst du unbegrenzt viele Projekte anlegen. Die Lizenzierung richtet sich fair nach internen Team-Seats.'
      }
    ]
  },

  overview: {
    id: 'overview',
    category: 'project_cockpit',
    categoryLabel: 'Projekt-Cockpit (Ebene 2)',
    title: 'Projekt-Cockpit & Gesamtübersicht',
    subtitle: 'Alle Projekt-Kennzahlen, Meilensteine, Schnellzugriffe und das Projektteam auf einem Bildschirm.',
    summary:
      'Das Projekt-Cockpit ist der Startbildschirm jedes einzelnen Projekts. Es verbindet Budgetstatus, offene Mängel, anstehende Termine, letzte Dokumente und direkte Schnellaktionen zu allen 12 Projektmodulen.',
    dataFlow: [
      'Echtzeit-Synchronisation aus Finanzen, Zeiterfassung, Mängeln & Kalender',
      'Berechnung von Budget-Verbrauch (Soll/Ist) & Projekt-Gesundheit',
      'Direkt-Absprung in CAD-Pläne, 3D-BIM, Mängel, Dokumente & Pitch Deck'
    ],
    workflows: [
      {
        title: 'Projekt-Status und Budget-Gesundheit prüfen',
        duration: '30 Sek.',
        steps: [
          'Öffne das gewünschte Projekt aus der Firmenzentrale.',
          'Prüfe oben die KPI-Kacheln: Vereinbartes Projektbudget vs. bereits verbuchte Kosten (Kreditoren + Spesen + interne Stunden).',
          'Kontrolliere offene Mängel-Pendenzen und die nächsten Meilensteine aus dem Bauprogramm.'
        ],
        proTip: 'Über «Projekt bearbeiten» kannst du jederzeit Projektbudget, SIA-Phase, Adresse oder das Projekt-Titelbild aktualisieren.'
      },
      {
        title: 'Externe Projektbeteiligte (Bauherr / Fachplaner) zum Projekt hinzufügen',
        duration: '60 Sek.',
        steps: [
          'Klicke im Projekt-Cockpit auf den Bereich «Projekt-Team» oder öffne das Team-Modul.',
          'Wähle einen bestehenden Kontakt aus dem CRM oder gib Name, E-Mail und Rolle (z. B. Bauherr, Handwerker, Fachplaner) ein.',
          'Das System versendet auf Wunsch direkt eine Einladung – externe Gäste belegen keinen kostenpflichtigen Lizenz-Seat.'
        ],
        proTip: 'Du kannst für jedes Teammitglied exakt steuern, ob es nur Lesezugriff hat oder aktiv Mängel und Dokumente hochladen darf.'
      }
    ],
    tools: [
      { name: 'Budget- & Margen-Radar', badge: 'Controlling', description: 'Vergleicht das Projektbudget in Echtzeit mit den erfassten Rechnungen, Kreditoren und Rapporten.' },
      { name: 'SIA-Phasen-Indikator', badge: 'SIA 102 / 118', description: 'Zeigt die aktuelle Projektphase (z. B. Vorprojekt, Bauprojekt, Ausschreibung, Ausführung, Abschluss).' },
      { name: 'Modul-Schnellstart', badge: 'Quick-Links', description: 'Direkter Einstieg in Pläne, 3D-BIM, Mängel, Finanzen, Bautagebuch und Whiteboard.' },
      { name: 'KI-Projekt-Briefing', badge: 'Gemini AI', description: 'Fasst auf Knopfdruck den aktuellen Projektstand, Risiken und offene Punkte zusammen.' }
    ],
    roleAccess: {
      ownerAdmin: 'Voller Lese- und Schreibzugriff inkl. Budget-, Margen- und Projekteinstellungen.',
      employee: 'Sieht alle operativen Projektdaten, Termine, Pläne und Aufgaben (Finanzkacheln gemäss Berechtigung).',
      externalGuest: 'Sieht den Projektfortschritt, freigegebene Termine und Dokumente – sämtliche internen Budgets und Margen sind automatisch ausgeblendet.'
    },
    faqs: [
      {
        q: 'Wie wird der Budget-Fortschritt im Projekt-Cockpit berechnet?',
        a: 'Das System addiert alle diesem Projekt zugewiesenen Fremdkosten (Kreditoren), Team-Spesen sowie die verrechenbaren internen Stundenrapporte und stellt sie dem hinterlegten Projektbudget sowie den gestellten Debitorenrechnungen gegenüber.'
      }
    ]
  },

  finance: {
    id: 'finance',
    category: 'finance_legal',
    categoryLabel: 'Finanzen & Recht',
    title: 'Finanzen, BKP 1–9, QR-Rechnungen & Controlling',
    subtitle: 'Schweizer Projektbuchhaltung mit QR-Rechnungs-Studio, KI-Belegscanner, Spesen und Stundensatz-Ledger.',
    summary:
      'Das Finanzmodul trennt glasklar zwischen offenen Offerten (Quotes), tatsächlichem Umsatz (Debitorenrechnungen), Fremdkosten (Kreditoren/BKP), Mitarbeiter-Spesen und internen Projektstunden. Integriert ist das Schweizer QR-Rechnungs-Studio nach SIX-Standard sowie die BKP 1–9 Kostenkontrolle.',
    dataFlow: [
      'Beleg/Rechnung erstellen (Invoice Studio) oder per KI/QR-Handy scannen',
      'Automatische Klassifizierung (Offerte vs. Debitorenrechnung vs. Kreditor vs. Spesen)',
      'Echtzeit-Verbuchung im Financial Ledger inkl. 8.1 % Schweizer MwSt.-Ausweis',
      'Automatischer PDF-Export & Ablage im Dokumenten-Tresor (04_FINANZEN)'
    ],
    workflows: [
      {
        title: 'Schweizer QR-Rechnung oder Offerte im Invoice Studio erstellen',
        duration: '90 Sek.',
        steps: [
          'Klicke im Finanzmodul oben auf «Rechnung / Offerte erstellen» (öffnet das Invoice Studio).',
          'Wähle oben den Dokumenttyp: «Rechnung» (fliesst in den Umsatz) oder «Offerte» (fliesst in offene Offerten, noch nicht in den Umsatz!).',
          'Wähle den Kunden aus dem CRM, erfasse die Positionen (oder nutze den KI-Positions-Generator) und prüfe MwSt.-Satz (8.1 % Normalsatz oder 0 % Export/befreit) sowie deine QR-IBAN.',
          'Klicke auf «Im Tresor speichern & buchen» – das PDF wird mit offiziellem Schweizer QR-Zahlteil generiert, im Ordner 04_FINANZEN abgelegt und sofort im Finanz-Ledger verbucht.'
        ],
        proTip: 'Unter «Einstellungen → Firmenprofil & Bank» kannst du deine eigene QR-IBAN und dein Firmenlogo hinterlegen – beides erscheint automatisch auf jeder Rechnung.'
      },
      {
        title: 'Kreditorenrechnung oder Spesenbeleg per Handy-QR oder KI scannen',
        duration: '30 Sek.',
        steps: [
          'Wechsle auf den Reiter «Spesen & Belege» oder «Betriebskosten / Kreditoren».',
          'Klicke auf «QR Handy-Upload» und scanne den QR-Code mit deinem Smartphone – fotografiere die Quittung oder Rechnung direkt ab.',
          'Die KI liest Betrag, Datum, Lieferant und MwSt. automatisch aus und schlägt die passende BKP-Kategorie vor.',
          'Mit «Speichern» ist der Beleg revisionssicher samt Foto-Nachweis am Buchungssatz verknüpft.'
        ],
        proTip: 'Stornierte Rechnungen (Status «Storniert») bleiben zur Nachvollziehbarkeit in der Liste sichtbar, werden aber automatisch aus allen Umsatz- und Gewinn-Summen herausgerechnet.'
      },
      {
        title: 'Excel/CSV-Budget per KI importieren (BKP 1–9)',
        duration: '60 Sek.',
        steps: [
          'Klicke im Finanzmodul auf «KI Budget-Import (CSV/Excel)».',
          'Lade eine bestehende Kostenaufstellung oder Excel-Tabelle hoch.',
          'Die KI ordnet alle Zeilen automatisch den Schweizer Baukostenplan-Gruppen (BKP 1–9) zu und importiert sie nach deiner Bestätigung ins Projekt.'
        ],
        proTip: 'Zeiteinträge aus den Mitarbeiter-Rapporten fliessen automatisch als «Interne Stunden» in die Gesamtkosten-Rechnung ein, ohne dass du sie doppelt erfassen musst.'
      }
    ],
    tools: [
      { name: 'Schweizer QR-Rechnungs-Studio', badge: 'SIX Standard', description: 'Erstellt normkonforme Schweizer QR-Rechnungen, Akontorechnungen und Offerten als Vektor-PDF.' },
      { name: '5-Säulen Financial Ledger', badge: 'Präzisions-Logik', description: 'Trennt strikt: 1. Offene Offerten, 2. Debitoren-Umsatz, 3. Kreditoren/Fremdkosten, 4. Team-Spesen, 5. Interne Stunden.' },
      { name: 'Spesen- & Quittungs-Scanner', badge: 'KI OCR + QR', description: 'Fotografiere Tank-, Material- oder Verpflegungsbelege per Smartphone und ordne sie direkt dem Projekt zu.' },
      { name: 'Bexio & CSV-Export', badge: 'Treuhand-Ready', description: 'Exportiere alle Buchungen inkl. Beleglinks für deinen Treuhänder oder synchronisiere mit Bexio.' }
    ],
    roleAccess: {
      ownerAdmin: 'Voller Zugriff auf alle Umsätze, Margen, Rechnungen, BKP-Budgets und Stundensätze.',
      employee: 'Standardmässig gesperrt (ausser der Inhaber schaltet für den Mitarbeiter explizit die Berechtigung «Finanzen einsehen» frei).',
      externalGuest: '100 % gesperrt. Externe Gäste, Bauherren und Handwerker haben keinerlei Zugriff auf das Finanzmodul.'
    },
    faqs: [
      {
        q: 'Zählen gespeicherte Offerten bereits zum Umsatz?',
        a: 'Nein! Offerten (Kategorie «Offerte» / Typ «quote») werden sauber im eigenen KPI-Feld «Offene Offerten» ausgewiesen. Erst wenn eine Debitorenrechnung gestellt wird, zählt der Betrag zum effektiven Umsatz und Netto-Ertrag.'
      },
      {
        q: 'Wie werden Mitarbeiter-Stunden in den Finanzen berücksichtigt?',
        a: 'Jeder verrechenbare Stundeneintrag aus dem Rapport-Modul wird mit dem hinterlegten Stundensatz (oder 0 CHF bei Kulanz) multipliziert und unter «Interne Stunden» ausgewiesen. So siehst du deine echte Projektmarge nach Abzug der eigenen Arbeitszeit.'
      }
    ]
  },

  plans: {
    id: 'plans',
    category: 'studios_ai',
    categoryLabel: 'Studios & Baustelle',
    title: '2D CAD-Pläne, Massstab-Messung & Pin-Verortung',
    subtitle: 'Interaktiver Bauplan-Viewer für PDF/CAD-Grundrisse mit Kalibrierung, Flächenmessung und Mängel-Pins.',
    summary:
      'Im 2D Plan-Editor lädst du Grundrisse, Schnitte und Werkpläne (PDF oder hochauflösende Pläne) hoch, kalibrierst mit zwei Klicks den exakten Massstab und misst Distanzen sowie Raumflächen direkt im Browser. Über ortsfeste Pins verknüpfst du Mängel, Fotos und Aufgaben millimetergenau auf dem Grundriss.',
    dataFlow: [
      'Grundriss (PDF/Bild) hochladen oder per QR vom Gerät senden',
      'Massstab mit 1 bekannten Referenzstrecke kalibrieren (z. B. Türbreite 1.00 m)',
      'Strecken, Raumflächen (m²) messen oder Mängel-Pins direkt auf dem Plan setzen',
      'Export als kommentiertes Plan-PDF oder direkte Synchronisation mit der Mängelliste'
    ],
    workflows: [
      {
        title: 'Plan-Massstab in 3 Klicks exakt kalibrieren',
        duration: '25 Sek.',
        steps: [
          'Öffne deinen hochgeladenen Grundriss im Plan-Editor.',
          'Wähle in der Werkzeugleiste das Werkzeug «Massstab kalibrieren» (Lineal-Icon).',
          'Klicke auf den Start- und Endpunkt einer bekannten Strecke auf dem Plan (z. B. ein vermasstes Wandstück von 5.00 m).',
          'Gib das reale Mass in Metern ein – ab sofort berechnen das Distanz- und Flächenwerkzeug alle Masse und Quadratmeter (m²) massstabsgetreu.'
        ],
        proTip: 'Die Kalibrierung wird pro Plan dauerhaft gespeichert, sodass auch deine Teamkollegen sofort im richtigen Massstab messen können.'
      },
      {
        title: 'Mangel oder Notiz als Pin direkt auf dem Grundriss verorten',
        duration: '30 Sek.',
        steps: [
          'Wähle in der Werkzeugleiste das «Pin setzen»-Werkzeug.',
          'Klicke exakt auf die Stelle im Grundriss, an der das Problem oder die Aufgabe liegt.',
          'Gib Titel, Priorität, Verantwortlichen (Handwerker) ein und hänge optional ein Baustellenfoto per Handy-QR-Code an.',
          'Der Pin erscheint sofort nummeriert auf dem Plan und ist gleichzeitig mit dem Mängelmanagement synchronisiert.'
        ],
        proTip: 'Über die Layer-Steuerung kannst du erledigte Pins jederzeit ausblenden, um auf der Baustelle nur die offenen Punkte zu sehen.'
      }
    ],
    tools: [
      { name: 'Massstabs-Kalibrierung', badge: 'Präzision', description: 'Eicht den digitalen Plan anhand einer Referenzstrecke für exakte Meter- und Quadratmeter-Messungen.' },
      { name: 'Distanz- & Polygon-Flächenmessung', badge: 'm / m²', description: 'Misst Wandlängen, Raumflächen und Umfänge direkt im Grundriss.' },
      { name: 'Smart Pins (Mängel & Notizen)', badge: 'Baustellen-Sync', description: 'Verortet Aufgaben, Mängel und Fotos punktgenau auf dem Plan.' },
      { name: 'Freihand-Markup & Bemaßung', badge: 'Rotstift', description: 'Zeichne Korrekturen, Pfeile, Texthinweise und Markierungen direkt auf den Plan und exportiere ihn als PDF.' }
    ],
    roleAccess: {
      ownerAdmin: 'Pläne hochladen, löschen, kalibrieren, messen, Pins setzen und als PDF exportieren.',
      employee: 'Pläne hochladen, kalibrieren, messen und Pins bearbeiten.',
      externalGuest: 'Freigegebene Pläne einsehen, hineinzoomen und zugewiesene Mängel-Pins prüfen.'
    },
    faqs: [
      {
        q: 'Welche Dateiformate unterstützt der Plan-Editor?',
        a: 'Du kannst mehrseitige PDF-Baupläne sowie hochauflösende PNG/JPG-Pläne bis 250 MB hochladen. PDF-Pläne werden automatisch gestochen scharf für die Canvas-Vermessung aufbereitet.'
      }
    ]
  },

  bim: {
    id: 'bim',
    category: 'studios_ai',
    categoryLabel: 'Studios & Baustelle',
    title: '3D BIM & IFC-Modell Viewer',
    subtitle: 'Hochperformante 3D-Architektur- und IFC-Inspektion mit Schnittebenen, Geschoss-Filter und Bauteil-Daten.',
    summary:
      'Der 3D BIM Viewer lädt IFC-, GLB/GLTF- und 3D-Architekturmodelle flüssig direkt im Browser – ohne teure Zusatzsoftware. Untersuche Geschosse, lege Echtzeit-Schnittebenen (Clipping Planes) durch das Gebäude, miss 3D-Abstände und lies sämtliche IFC-Bauteilattribute (Material, Masse, Klassifizierung) per Klick aus.',
    dataFlow: [
      'IFC- oder 3D-Modell aus dem Projekttresor laden oder direkt hochladen',
      'Geschosse, Gewerke (Rohbau, HLKS, Fassade, Innenausbau) ein-/ausblenden',
      'X/Y/Z-Schnittebenen setzen & Bauteil-Eigenschaften inspizieren',
      '3D-Kameraperspektive als hochauflösenden Snapshot für Berichte oder KI-Rendering speichern'
    ],
    workflows: [
      {
        title: 'Gebäude mit der 3D-Schnittebene (Section Cut) öffnen',
        duration: '20 Sek.',
        steps: [
          'Lade dein IFC- oder 3D-Modell im BIM Viewer.',
          'Aktiviere in der unteren Werkzeugleiste das Werkzeug «Schnittebene (Clipping)».',
          'Verschiebe den Regler für die X-, Y- oder Z-Achse, um stufenlos durch Decken oder Wände in das Gebäudeinnere zu blicken.',
          'Klicke auf ein beliebiges Bauteil (z. B. Stütze, Fenster, Lüftungsrohr), um rechts im Inspektor alle IFC-Metadaten zu sehen.'
        ],
        proTip: 'Mit einem Klick auf «Snapshot» speicherst du die aktuelle 3D-Ansicht direkt als Bild in den Projekt-Datenraum oder übernimmst sie ins Pitch Deck.'
      }
    ],
    tools: [
      { name: 'IFC Bauteil-Inspektor', badge: 'BIM Daten', description: 'Zeigt bei Klick auf ein 3D-Element sofort Bauteil-ID, Material, Abmessungen und IFC-Eigenschaften.' },
      { name: 'Drei-Achsen-Schnittebenen', badge: 'X / Y / Z Cut', description: 'Schneidet das 3D-Modell in Echtzeit auf jeder beliebigen Höhe oder Achse auf.' },
      { name: 'Modellbaum & Layer-Steuerung', badge: 'Geschosse', description: 'Blendet einzelne Stockwerke, Wände, Dächer oder Haustechnik-Stränge gezielt ein und aus.' },
      { name: 'First-Person & Orbit-Kamera', badge: 'Navigation', description: 'Wechsle zwischen Vogelperspektive (Orbit) und virtuellem Gebäuderundgang.' }
    ],
    roleAccess: {
      ownerAdmin: 'Modelle hochladen, verwalten, Schnitte & Bauteil-Analysen durchführen.',
      employee: 'Volle 3D-Navigation, Messung, Schnittebenen und Snapshot-Export.',
      externalGuest: 'Kann das 3D-Modell interaktiv im Browser drehen und begehen – ideal für Bauherren-Präsentationen.'
    },
    faqs: [
      {
        q: 'Braucht mein Bauherr ein spezielles CAD-Programm, um das 3D-Modell zu sehen?',
        a: 'Nein. Der gesamte 3D-BIM-Viewer läuft zu 100 % im Webbrowser auf Mac, Windows, iPad und Smartphone.'
      }
    ]
  },

  defects: {
    id: 'defects',
    category: 'project_cockpit',
    categoryLabel: 'Projekt-Cockpit (Ebene 2)',
    title: 'Mängelmanagement & SIA-Abnahmeprotokolle',
    subtitle: 'Rechtssichere Mängelerfassung mit Vorher/Nachher-Beweisfotos, Fristen, Handwerker-Zuweisung & PDF-Protokoll.',
    summary:
      'Erfasse Baumängel und Pendenzen direkt auf der Baustelle oder im Büro. Jeder Mangel dokumentiert Status (Offen, In Arbeit, Behoben), Priorität, Frist, verantwortliches Gewerk sowie Vorher- und Nachher-Beweisfotos. Mit einem Klick generierst du ein unterschriftsreifes SIA-Mängelprotokoll als PDF.',
    dataFlow: [
      'Mangel erfassen + Beweisfoto per Handy-QR-Code aufnehmen',
      'Frist & verantwortlichen Handwerker / Unternehmer zuweisen',
      'Nach Behebung: «Nachher-Foto» hochladen & Status auf «Behoben» setzen',
      '1-Klick Export als offizielles PDF-Mängelprotokoll in den Dokumenten-Tresor'
    ],
    workflows: [
      {
        title: 'Mangel auf der Baustelle mit Handy-Foto erfassen',
        duration: '40 Sek.',
        steps: [
          'Klicke auf «+ Neuer Mangel».',
          'Beschreibe den Mangel kurz (oder nutze die Spracheingabe) und wähle Priorität, Ort/Raum sowie Frist.',
          'Klicke auf «Foto per Handy-QR» (oder wähle direkt auf dem Smartphone die Kamera) – das Vorher-Foto erscheint sofort live im Formular.',
          'Speichere den Mangel – er ist sofort für das Team und den zugewiesenen Unternehmer sichtbar.'
        ],
        proTip: 'Sobald der Handwerker den Mangel behoben hat, kannst du im selben Eintrag das «Nachher-Foto» ergänzen. Auf dem PDF-Protokoll werden Vorher und Nachher sauber nebeneinander dokumentiert.'
      },
      {
        title: 'Offizielles SIA-Mängelprotokoll als PDF exportieren',
        duration: '15 Sek.',
        steps: [
          'Filtere die Mängelliste bei Bedarf nach Status (z. B. «Nur Offene») oder nach Gewerk.',
          'Klicke oben rechts auf «PDF-Protokoll erstellen».',
          'Das Universal PDF Studio öffnet das fertig gelayoutete Mängelprotokoll inkl. Fotodokumentation, Fristen und Unterschriftenfeld zum Download oder direkten Speichern im Tresor.'
        ],
        proTip: 'Über den QR-Code auf dem Protokoll gelangt man jederzeit direkt zurück zum digitalen Mängeleintrag.'
      }
    ],
    tools: [
      { name: 'Vorher / Nachher Foto-Beweis', badge: 'Beweissicherung', description: 'Gegenüberstellung des ursprünglichen Mangels und der fachgerechten Behebung.' },
      { name: 'Handy-QR Live-Kamera', badge: 'Zero-App Upload', description: 'Fotos mit dem Smartphone aufnehmen, ohne sich auf dem Handy erst einloggen zu müssen.' },
      { name: 'Fristen- & Prioritäten-Ampel', badge: 'Controlling', description: 'Markiert kritische oder überfällige Mängel sofort farblich.' },
      { name: 'PDF-Mängelbericht Generator', badge: 'SIA-konform', description: 'Erstellt auf Knopfdruck ein druckfertiges Abnahme- und Mängelprotokoll.' }
    ],
    roleAccess: {
      ownerAdmin: 'Mängel anlegen, zuweisen, freigeben, löschen und PDF-Protokolle versenden.',
      employee: 'Mängel erfassen, Fotos anhängen, Status aktualisieren und Protokolle erstellen.',
      externalGuest: 'Handwerker sehen die ihnen zugewiesenen Mängel und können Nachher-Fotos zur Erledigungsmeldung hochladen.'
    },
    faqs: [
      {
        q: 'Erscheinen Fotos vom Handy-QR-Upload automatisch im Mangel?',
        a: 'Ja, sobald du den QR-Code scannst und auf dem Smartphone ein Foto aufnimmst, wird es über Supabase Realtime in unter 2 Sekunden exakt einmal in deinen offenen Mangel übertragen.'
      }
    ]
  },

  camera: {
    id: 'camera',
    category: 'project_cockpit',
    categoryLabel: 'Projekt-Cockpit (Ebene 2)',
    title: 'Baustellen-Überwachung & Digitales Bautagebuch',
    subtitle: 'Fotodokumentation, tägliche Wetterdaten, Gewerke-Präsenz und KI-Bautagebuch-Berichte.',
    summary:
      'Dokumentiere den täglichen Baufortschritt lückenlos mit Zeitstempel, Wetterbedingungen, anwesenden Gewerken auf der Baustelle und Fotogalerien. Die integrierte KI erstellt aus deinen Stichworten und Fotos auf Knopfdruck einen professionellen Bautagesbericht.',
    dataFlow: [
      'Baustellenfotos per Kamera/QR hochladen + Wetter & Personenstärke erfassen',
      'KI-Bautagesbericht generieren lassen',
      'Als PDF-Bautagebuch im Dokumenten-Tresor (05_BAUSTELLE) archivieren'
    ],
    workflows: [
      {
        title: 'Tägliches Bautagebuch mit Fotos & Wetter erstellen',
        duration: '60 Sek.',
        steps: [
          'Öffne im Projekt das Modul «Baustelle & Kamera».',
          'Lade die aktuellen Baustellenfotos hoch (oder scanne den Handy-QR-Code für Live-Fotos direkt vom Rundgang).',
          'Erfasse kurz die ausgeführten Arbeiten, anwesende Firmen/Personenanzahl und besondere Vorkommnisse.',
          'Klicke auf «KI-Tagesbericht generieren» und speichere das fertige PDF-Protokoll direkt im Projekttresor.'
        ],
        proTip: 'Über den Zeitstrahl-Slider kannst du den Baufortschritt über Wochen und Monate hinweg visuell vergleichen.'
      }
    ],
    tools: [
      { name: 'Chronologische Foto-Timeline', badge: 'Baufortschritt', description: 'Alle Baustellenfotos automatisch nach Aufnahmedatum und Bauphase geordnet.' },
      { name: 'Wetter- & Präsenz-Protokoll', badge: 'SIA Dokumentation', description: 'Hält Temperatur, Witterung und anwesende Arbeitskräfte rechtssicher fest.' },
      { name: 'KI-Bautagesbericht', badge: 'Auto-Protokoll', description: 'Formuliert aus kurzen Baustellen-Notizen einen vollständigen, formellen Tagesrapport.' },
      { name: 'Handy-QR Foto-Sync', badge: 'Echtzeit', description: 'Überträgt Baustellenfotos direkt vom Smartphone in die Projekt-Chronik.' }
    ],
    roleAccess: {
      ownerAdmin: 'Voller Zugriff auf alle Kameras, Foto-Archive und Bautagebücher.',
      employee: 'Fotos hochladen, Bautagesberichte verfassen und exportieren.',
      externalGuest: 'Lesezugriff auf freigegebene Baufortschrittsfotos.'
    },
    faqs: [
      {
        q: 'Wo werden die PDF-Bautagebücher gespeichert?',
        a: 'Jeder gespeicherte Bericht wird automatisch im Projekt-Dokumententresor im passenden Baustellen-/Protokoll-Ordner abgelegt und ist dort jederzeit abrufbar.'
      }
    ]
  },

  calendar: {
    id: 'calendar',
    category: 'project_cockpit',
    categoryLabel: 'Projekt-Cockpit (Ebene 2)',
    title: 'Bauprogramm, Gantt-Zeitplan & Meilensteine',
    subtitle: 'Visuelle Terminplanung mit Gantt-Balkenplan, Monatskalender, SIA-Phasen und PDF-Bauprogramm-Export.',
    summary:
      'Plane und steuere sämtliche Projektphasen, Gewerke-Einsätze und Abnahme-Meilensteine. Du kannst jederzeit nahtlos zwischen dem klassischen Gantt-Balkenplan (für komplexe Abhängigkeiten und Bauphasen) und der Monats-Kalenderansicht wechseln sowie mehrere Terminpläne (z. B. Masterplan vs. Detailprogramm Innenausbau) verwalten.',
    dataFlow: [
      'Phasen & Meilensteine im Gantt-Plan anlegen oder per KI-Generator vorschlagen lassen',
      'Zeitachsen per Drag & Drop anpassen & Status (Geplant / In Arbeit / Erledigt) pflegen',
      'Export als grossformatiges PDF-Bauprogramm oder iCal-Kalenderdatei (.ics)'
    ],
    workflows: [
      {
        title: 'Komplettes Bauprogramm per KI-Assistent generieren',
        duration: '45 Sek.',
        steps: [
          'Öffne im Projekt das Modul «Kalender & Bauprogramm».',
          'Klicke oben auf das Zauberstab-Icon («KI-Zeitplan generieren»).',
          'Gib Projektstart, gewünschtes Enddatum und die Art des Vorhabens ein (z. B. «Umbau Einfamilienhaus nach SIA-Phasen»).',
          'Die KI erstellt automatisch alle Phasen und Meilensteine im Gantt-Diagramm, die du anschliessend beliebig verschieben kannst.'
        ],
        proTip: 'Auf Mobilgeräten kannst du das Gantt-Diagramm über den Button «Drehen (Querformat)» im vollen Breitbild betrachten.'
      },
      {
        title: 'Mehrere Terminpläne (Masterplan vs. Detailplan) anlegen',
        duration: '20 Sek.',
        steps: [
          'Klicke oben rechts auf das Dropdown «Zeitplan-Bibliothek».',
          'Wähle «+ Neuer Zeitplan», um z. B. neben dem Gesamt-Masterplan einen separaten Detailplan für den Rohbau oder einen Kunden-Terminplan anzulegen.'
        ],
        proTip: 'Mit dem PDF-Button exportierst du den aktuellen Gantt-Plan als übersichtliches Bauprogramm für die Baubesprechung.'
      }
    ],
    tools: [
      { name: 'Interaktiver Gantt-Balkenplan', badge: 'Bauprogramm', description: 'Visualisiert Start, Dauer, Überlappungen und Fortschritt aller Bauphasen.' },
      { name: 'Meilenstein-Marker', badge: 'Deadlines', description: 'Hebt wichtige Stichtage wie Baueingabe, Aufrichte oder Schlüsselübergabe hervor.' },
      { name: 'Zeitplan-Bibliothek', badge: 'Multi-Plan', description: 'Verwaltet beliebig viele Terminpläne pro Projekt.' },
      { name: 'KI-Terminplan-Generator & PDF-Export', badge: 'Automatisierung', description: 'Erstellt realistische Phasenpläne auf Knopfdruck und druckt sie als PDF.' }
    ],
    roleAccess: {
      ownerAdmin: 'Zeitpläne erstellen, bearbeiten, löschen und exportieren.',
      employee: 'Phasen und Termine aktualisieren sowie Fortschritte pflegen.',
      externalGuest: 'Sieht das freigegebene Bauprogramm und die Meilensteine zur Terminabstimmung.'
    },
    faqs: [
      {
        q: 'Kann ich das Bauprogramm in meinen Apple- oder Outlook-Kalender übernehmen?',
        a: 'Ja, über die Export-Funktion kannst du eine standardisierte .ics-Kalenderdatei herunterladen oder Termine direkt mit deinem Kalender synchronisieren.'
      }
    ]
  },

  agenda: {
    id: 'agenda',
    category: 'company_hub',
    categoryLabel: 'Firmenzentrale & Projekt',
    title: 'Agenda, Aufgaben & Stundenerfassung (Rapporte)',
    subtitle: 'Tagesplanung, Pendenzen, Arbeitszeit-Rapportierung mit Stundensatz und automatischer Finanz-Verbuchung.',
    summary:
      'Das Agenda- und Rapport-Modul verbindet deine tägliche Termin- und Aufgabenplanung mit der sekundengenauen Zeiterfassung (Stoppuhr oder manuelle Eingabe). Jeder gebuchte Stundenrapport wird automatisch mit dem Projekt und dem Finanz-Ledger synchronisiert.',
    dataFlow: [
      'Arbeitszeit per Live-Timer oder Formular auf ein Projekt rapportieren',
      'Automatische Speicherung in time_entries (inkl. Stundensatz & Verrechenbarkeit)',
      'Sofortige Aktualisierung der internen Projektkosten im Finanz-Cockpit',
      'Export als druckfertiger PDF-Arbeitsrapport mit Unterschriftenfeld'
    ],
    workflows: [
      {
        title: 'Projektstunden rapportieren & PDF-Arbeitsrapport erstellen',
        duration: '30 Sek.',
        steps: [
          'Wechsle in der Agenda auf den Reiter «Rapporte / Zeiterfassung».',
          'Wähle das Projekt, das Datum, die geleisteten Stunden, den Stundensatz in CHF (z. B. 140 CHF/h) und beschreibe die ausgeführte Tätigkeit.',
          'Klicke auf «Rapport buchen» – der Eintrag erscheint sofort in der Liste und aktualisiert live das Finanz-Cockpit.',
          'Über «PDF-Rapport exportieren» generierst du jederzeit einen unterschriftsreifen Leistungsnachweis für den Bauherrn.'
        ],
        proTip: 'Für Kulanzarbeiten oder interne Vorleistungen kannst du das Häkchen «Verrechenbar» deaktivieren oder den Stundensatz auf 0 CHF setzen.'
      },
      {
        title: 'Termine mit Google Calendar oder Apple Kalender synchronisieren',
        duration: '30 Sek.',
        steps: [
          'Klicke in der Agenda oben auf «Kalender-Sync (.ics / Google)».',
          'Verbinde deinen Google-Kalender oder exportiere Termine mit einem Klick inkl. automatischer E-Mail-Erinnerung.'
        ],
        proTip: 'Mit dem Tagesziele-Widget behältst du deine 3 wichtigsten Prioritäten des Tages immer im Fokus.'
      }
    ],
    tools: [
      { name: 'Stunden-Rapport & Live-Stoppuhr', badge: 'Zeiterfassung', description: 'Erfasst geleistete Projektstunden samt Tätigkeit und Stundensatz in Echtzeit.' },
      { name: 'Automatische Finanz-Kopplung', badge: 'Ledger-Sync', description: 'Überträgt verrechenbare Stunden ohne Doppelerfassung direkt in die Projekt-Nachkalkulation.' },
      { name: 'PDF-Regierapport Generator', badge: 'Kunden-Beleg', description: 'Erzeugt saubere Stunden- und Regierapporte als PDF zur Freigabe durch den Auftraggeber.' },
      { name: 'Termine & Erinnerungen', badge: 'Kalender', description: 'Verwaltet Besprechungen, Baustellentermine und automatische E-Mail-Reminder.' }
    ],
    roleAccess: {
      ownerAdmin: 'Sieht alle Team-Rapporte, Stundensätze und Auswertungen über alle Projekte.',
      employee: 'Erfasst eigene Stundenrapporte, Aufgaben und Termine.',
      externalGuest: 'Sieht nur explizit geteilte Besprechungstermine (keine Einsicht in interne Stundensätze).'
    },
    faqs: [
      {
        q: 'Erscheinen meine gebuchten Stunden sofort im Finanzmodul?',
        a: 'Ja! Sobald du einen Rapport speicherst, wird der Finanz-Cache invalidiert und die Stunden sind ohne Seiten-Reload unter «Interne Stunden» im Finanz-Cockpit sichtbar.'
      }
    ]
  },

  documents: {
    id: 'documents',
    category: 'project_cockpit',
    categoryLabel: 'Projekt-Cockpit (Ebene 2)',
    title: 'Dokumenten-Tresor & KI-Dokumentenstudio',
    subtitle: 'Strukturierter Schweizer Bau-Datenraum (Ordner 01–09) bis 250 MB pro Datei mit KI-Vertrags- & Briefgenerator.',
    summary:
      'Der Dokumenten-Tresor ist dein zentrales, revisionssicheres Cloud-Archiv. Jedes Projekt verfügt automatisch über die bewährte Schweizer 9-Ordner-Architektur (01_PROJEKTINFO bis 09_ARCHIV). Integriert ist das KI-Dokumentenstudio, mit dem du Verträge, Protokolle, Regierapporte und Geschäftsbriefe auf deinem eigenen Firmenbriefpapier erstellst.',
    dataFlow: [
      'Dateien per Drag & Drop, Handy-QR-Scan oder direkt aus den Studios speichern',
      'Automatische Einordnung in die Ordnerstruktur 01 bis 09',
      'Direkte Vorschau für PDFs, Bilder, CAD-Pläne und Office-Dokumente im Browser'
    ],
    workflows: [
      {
        title: 'Vertrag, Protokoll oder Brief mit dem KI-Dokumentenstudio erstellen',
        duration: '60 Sek.',
        steps: [
          'Klicke im Dokumenten-Modul oben auf «Dokument erstellen (KI Studio)».',
          'Wähle eine Vorlage (z. B. Werkvertrag nach SIA, Baubesprechungsprotokoll, Aktennotiz oder Mahnung) oder beschreibe dein Wunschdokument per KI-Prompt.',
          'Bearbeite den Text im Editor – dein Firmenlogo, deine Adresse und Fusszeile werden automatisch eingebettet.',
          'Klicke auf «Als PDF im Tresor speichern» – das Dokument liegt sofort im gewählten Zielordner.'
        ],
        proTip: 'Alle Rechnungen aus dem Invoice Studio und alle Berichte aus Mängel/Baustelle landen ebenfalls vollautomatisch im passenden Tresor-Ordner.'
      }
    ],
    tools: [
      { name: 'Schweizer 01–09 Standard-Ordnerbaum', badge: 'Struktur', description: 'Vorkonfigurierte Ordner für Verträge, Pläne, Finanzen, Baustelle, Behörden und Korrespondenz.' },
      { name: '250 MB Grossdatei-Support', badge: 'CAD / IFC Ready', description: 'Speichert auch grosse CAD-Pläne, 3D-Modelle und hochauflösende PDF-Dossiers mühelos.' },
      { name: 'KI-Dokumentenstudio', badge: 'Schriftverkehr', description: 'Generiert rechtssichere Schreiben, Protokolle und Verträge auf eigenem Briefpapier.' },
      { name: 'Handy-QR Dokumentenscanner', badge: 'Mobile Scan', description: 'Papierdokumente unterwegs abfotografieren und direkt in den richtigen Projektordner übertragen.' }
    ],
    roleAccess: {
      ownerAdmin: 'Voller Zugriff auf alle Ordner, Upload, Löschen und Freigaben.',
      employee: 'Dokumente hochladen, Ordner nutzen und KI-Dokumente erstellen.',
      externalGuest: 'Sieht ausschliesslich projektbezogene Dokumente (streng isoliert von internen System- und Finanzkonfigurationen).'
    },
    faqs: [
      {
        q: 'Wie gross darf eine einzelne Datei beim Upload sein?',
        a: 'Das System und der Cloud-Storage unterstützen Dateien bis zu 250 MB pro Upload (ideal für umfangreiche PDF-Dossiers, IFC-Modelle und Videos).'
      }
    ]
  },

  whiteboard: {
    id: 'whiteboard',
    category: 'studios_ai',
    categoryLabel: 'Studios & KI',
    title: 'Unendliches KI-Whiteboard & Architektur-Rendering',
    subtitle: 'Visuelles Brainstorming, Moodboards, Grundriss-Skizzen und fotorealistische KI-Visualisierungen.',
    summary:
      'Das KI-Whiteboard ist deine kreative Arbeitsfläche für Entwurf, Innenarchitektur, Szenografie und Konzeptentwicklung. Kombiniere Skizzen, Grundrisse, Materialmuster und Notizen auf einer unendlichen Leinwand und verwandle grobe Handskizzen oder 3D-Screenshots per KI in fotorealistische Architektur-Renderings.',
    dataFlow: [
      'Skizze zeichnen oder Referenzbild / 3D-Snapshot auf das Whiteboard legen',
      'Stil & Prompt im KI-Rendering-Studio wählen (z. B. Schweizer Chalet-Moderne, Sichtbeton, Lichtstimmung)',
      'Generiertes 4K-Rendering direkt auf dem Board vergleichen, ins Pitch Deck übernehmen oder im Tresor speichern'
    ],
    workflows: [
      {
        title: 'Aus einer Skizze oder einem Raumfoto ein KI-Architektur-Rendering erzeugen',
        duration: '45 Sek.',
        steps: [
          'Lade ein Foto des Rohbaus, einen 3D-BIM-Screenshot oder eine Handskizze auf das Whiteboard.',
          'Wähle das Bild aus und öffne das «KI-Visualisierungs-Panel».',
          'Beschreibe die gewünschte Materialisierung und Lichtstimmung (z. B. «Eichenparkett, bodentiefe Fenster, warme Abendsonne»).',
          'Die KI generiert innert Sekunden eine fotorealistische Visualisierung, die du direkt ins Pitch Deck für den Bauherrn senden kannst.'
        ],
        proTip: 'Mit der Vorher/Nachher-Historie (Undo/Redo) kannst du verschiedene Materialvarianten live während der Kundenbesprechung durchspielen.'
      }
    ],
    tools: [
      { name: 'KI-Rendering & Material-Engine', badge: 'Gemini Vision', description: 'Verwandelt Skizzen und Raumfotos in hochwertige Architektur- und Interior-Visualisierungen.' },
      { name: 'Unendliche Canvas & Sticky Notes', badge: 'Moodboard', description: 'Freies Platzieren von Bildern, Farbpaletten, Skizzen, Formen und Textkarten.' },
      { name: 'Handy-QR Bild-Import', badge: 'Materialmuster', description: 'Fotografiere Materialmuster (Holz, Fliesen, Stoffe) im Showroom und wirf sie live aufs Whiteboard.' },
      { name: '1-Klick Pitch-Deck & PDF-Export', badge: 'Präsentation', description: 'Exportiert das gesamte Moodboard als PDF oder übergibt Bilder direkt an das Pitch Deck Studio.' }
    ],
    roleAccess: {
      ownerAdmin: 'Boards erstellen, KI-Renderings generieren, teilen und exportieren.',
      employee: 'Voller Zugriff auf Whiteboard-Werkzeuge und KI-Visualisierungen.',
      externalGuest: 'Kann freigegebene Konzept-Boards im Präsentationsmodus betrachten.'
    },
    faqs: [
      {
        q: 'Werden meine Whiteboard-Stände automatisch gespeichert?',
        a: 'Ja, das Whiteboard verfügt über einen intelligenten Auto-Save in die Cloud sowie einen manuellen Export als hochauflösendes PDF in den Dokumenten-Tresor.'
      }
    ]
  },

  pitch: {
    id: 'pitch',
    category: 'studios_ai',
    categoryLabel: 'Studios & KI',
    title: 'Pitch Deck Studio & Kunden-Präsentationen',
    subtitle: 'Interaktiver Folien-Baukasten mit Bento-Layouts, KI-Texterstellung, PDF-Export & direkter Offerten-Publikation.',
    summary:
      'Im Pitch Deck Studio gestaltest du hochästhetische Architektur-, Projekt- und Agenturpräsentationen im 16:9-Breitbildformat. Nutze fertige Schweizer Design-Layouts (Vollbild, Split-Screen, Bento-Grid, Budget-Übersicht), binde Renderings aus dem Projekttresor ein und veröffentliche die Präsentation auf Wunsch mit einem Klick als interaktive Online-Offerte (Smart Proposal).',
    dataFlow: [
      'Folien im Pitch Deck Studio gestalten (manuell oder per KI-Deck-Generator)',
      'Projektbilder, Renderings & Kostenaufstellungen per Klick einbinden',
      'Als gestochen scharfes 16:9 Vektor-PDF exportieren ODER als interaktiven Kunden-Link (Smart Proposal) publizieren'
    ],
    workflows: [
      {
        title: 'Komplette Kundenpräsentation in 60 Sekunden per KI aufbauen',
        duration: '60 Sek.',
        steps: [
          'Öffne das «Pitch Deck Studio» und klicke auf «KI-Präsentation generieren».',
          'Gib das Projektthema und die Zielgruppe ein – die KI erstellt automatisch Gliederung, Folientexte und passende Layout-Blöcke.',
          'Ziehe deine eigenen Projektfotos oder Grundrisse (auch per Handy-QR) in die Bild-Container (Vollbild, 2er-, 3er- oder Bento-Raster).',
          'Exportiere das Deck als PDF oder klicke auf «Als Smart Proposal veröffentlichen», um dem Kunden einen interaktiven Freigabe-Link zu senden.'
        ],
        proTip: 'Jeder Bild-Slot im Pitch Deck besitzt Regler für Zoom und Bildausschnitt (Pan), damit deine Renderings ohne Anschnitt perfekt sitzen.'
      }
    ],
    tools: [
      { name: 'Architektur- & Bento-Layouts', badge: '16:9 Studio', description: 'Professionelle Folien-Templates für Cover, Vision, Grundrisse, Fotogalerien, Zeitplan und Kosten.' },
      { name: 'KI-Folien- & Textgenerator', badge: 'Copywriting', description: 'Schreibt überzeugende Projekttexte und übersetzt Folien auf Wunsch in DE, EN oder FR.' },
      { name: 'Live-Präsentationsmodus', badge: 'Fullscreen', description: 'Präsentiere direkt aus dem Browser im Vollbildmodus beim Kunden.' },
      { name: 'Smart-Proposal Publisher', badge: '1-Klick Offerte', description: 'Verwandelt deine Präsentation in eine interaktive Web-Offerte mit digitaler Unterschrift.' }
    ],
    roleAccess: {
      ownerAdmin: 'Decks erstellen, präsentieren, als PDF speichern und als Kunden-Offerte publizieren.',
      employee: 'Folien gestalten, Bilder einfügen und PDF-Präsentationen exportieren.',
      externalGuest: 'Sieht nur den publizierten Präsentations-Link (kein Zugriff auf den internen Studio-Editor).'
    },
    faqs: [
      {
        q: 'Kann ich mehrere Bilder auf einer einzigen Folie anordnen?',
        a: 'Ja, du kannst bei jeder Folie flexibel zwischen Einzelbild, Dual-Split, 3er-Galerie und modernem Bento-Grid wechseln.'
      }
    ]
  },

  proposals: {
    id: 'proposals',
    category: 'finance_legal',
    categoryLabel: 'Finanzen & Recht',
    title: 'Smart Proposals (Interaktive Kunden-Offerten & Tresor)',
    subtitle: 'Digitale Web-Offerten mit 3D/Video-Erlebnis, wählbaren Zusatzoptionen, PIN-Schutz & rechtsgültiger Signatur.',
    summary:
      'Mit Smart Proposals versendest du keine trockenen Papier-Offerten mehr, sondern einen exklusiven, auf Wunsch PIN-geschützten Web-Link (`/p/...`). Dein Kunde erlebt deine Präsentation interaktiv, kann optionale Leistungsbausteine per Klick zu- oder abwählen, Fragen stellen und das Angebot digital rechtsgültig unterzeichnen – inklusive automatischer Team-Benachrichtigung, E-Mail-Bestätigung und optionalem Bexio-Sync.',
    dataFlow: [
      'Smart Proposal aus dem Pitch Deck oder Offerten-Manager veröffentlichen',
      'Kunden-Link (Hell- oder Dunkel-Design, optional mit PIN) kopieren & versenden',
      'Echtzeit-Tracking: Sehen, wann und wie oft der Kunde die Offerte geöffnet hat',
      'Bei digitaler Unterschrift: Sofortige In-App-Glocke, Bestätigungs-Mail & Bexio-Auftragsanlage'
    ],
    workflows: [
      {
        title: 'Interaktive Kunden-Offerte versenden & Freigabe überwachen',
        duration: '40 Sek.',
        steps: [
          'Öffne in der Seitenleiste «Offerten-Tresor (Smart Proposals)».',
          'Prüfe deine veröffentlichten Angebote: Du siehst sofort die Aufrufzahlen (Views), das Ablaufdatum und den Status (Aktiv, Angenommen, Abgelaufen).',
          'Wähle mit dem Sonnen-/Mond-Icon, ob der Kunde das Angebot im edlen Dunkel-Modus oder im klassischen Hell-Modus öffnet, und klicke auf «Link kopieren».',
          'Sobald der Kunde digital unterschreibt, springt der Status auf «Angenommen» und die gewählten Optionen sowie der Endpreis sind manipulationssicher gespeichert.'
        ],
        proTip: 'Ist eine Offerte abgelaufen, kannst du ihre Gültigkeit im Dashboard mit einem einzigen Klick auf «+30 Tage verlängern» reaktivieren.'
      }
    ],
    tools: [
      { name: 'Interaktive Leistungs-Optionen', badge: 'Upselling', description: 'Kunden können optionale Pakete selbst anklicken – der Gesamtpreis aktualisiert sich live.' },
      { name: 'Digitale Rechts-Signatur', badge: 'E-Signatur', description: 'Dokumentiert Name, E-Mail, Zeitstempel, gewählte Optionen und Freigabevermerk.' },
      { name: 'Öffnungs- & Lese-Tracking', badge: 'Live-Analytics', description: 'Zeigt dir genau, wie oft und wann dein Angebot vom Kunden geöffnet wurde.' },
      { name: 'Automatischer Bexio-Sync', badge: 'ERP-Brücke', description: 'Erstellt bei Annahme auf Wunsch automatisch Kontakt, Offerte und 50 %-Akontorechnung in Bexio.' }
    ],
    roleAccess: {
      ownerAdmin: 'Voller Zugriff auf alle Offerten, Preisvolumen, Verlängerungen und Löschungen.',
      employee: 'Offerten vorbereiten, Vorschau prüfen und Links teilen.',
      externalGuest: 'Sieht über seinen persönlichen Share-Link ausschliesslich die für ihn bestimmte Kunden-Offerte.'
    },
    faqs: [
      {
        q: 'Braucht mein Kunde einen Login, um die Offerte anzusehen und zu unterschreiben?',
        a: 'Nein! Dein Kunde öffnet einfach den verschlüsselten Link auf seinem Computer, Tablet oder Smartphone und kann (nach optionaler PIN-Eingabe) sofort unterschreiben.'
      }
    ]
  },

  team: {
    id: 'team',
    category: 'company_hub',
    categoryLabel: 'Firmenzentrale & Projekt',
    title: 'Team, CRM-Kontakte, Visitenkarten-Scanner & Gäste-Rechte',
    subtitle: 'Zentrale Kontaktverwaltung, KI-Visitenkarten-OCR, Mitarbeiter-Einladungen und kostenlose Gäste-Zugänge.',
    summary:
      'Hier verwaltest du einerseits dein internes Team (inkl. Rollen und Finanz-Sichtbarkeit) und andererseits dein gesamtes Firmen-CRM (Bauherren, Fachplaner, Handwerker, Lieferanten). Mit dem integrierten KI-Visitenkarten-Scanner fotografierst du Papier-Visitenkarten ab und speicherst sie in 3 Sekunden als vollständigen CRM-Kontakt.',
    dataFlow: [
      'Kontakt manuell oder per KI-Visitenkarten-Foto (Kamera / QR-Handy) anlegen',
      'Rolle festlegen: Internes Teammitglied (Seat) vs. Externer Gast/Partner (kostenlos)',
      'Einladungs-E-Mail mit Registrierungs-Link versenden',
      'Automatische Verknüpfung beim Login durch den Datenbank-Auth-Trigger'
    ],
    workflows: [
      {
        title: 'Visitenkarte abfotografieren & automatisch im CRM speichern',
        duration: '15 Sek.',
        steps: [
          'Klicke im Team/CRM-Modul oben auf «Visitenkarte scannen (KI)».',
          'Fotografiere die Visitenkarte direkt mit dem Smartphone ab oder nutze den QR-Handy-Upload am Desktop.',
          'Die KI extrahiert Name, Firma, Position, E-Mail, Telefonnummer und Adresse automatisch in die richtigen Felder.',
          'Prüfe kurz die Vorschau und klicke auf «Kontakt speichern».'
        ],
        proTip: 'Gespeicherte CRM-Kontakte stehen sofort im Invoice Studio (für Rechnungen) und in der Projekt-Teamzuweisung zur Verfügung.'
      },
      {
        title: 'Mitarbeiter oder externen Gast (Bauherr / Handwerker) einladen',
        duration: '30 Sek.',
        steps: [
          'Klicke auf «Mitglied / Kontakt hinzufügen».',
          'Wähle bei internen Mitarbeitern die Rolle (z. B. Projektleiter, Mitarbeiter) und lege fest, ob die Person Finanzen sehen darf.',
          'Wähle bei externen Partnern (Bauherr, Handwerker, Subunternehmer) den Status «Extern / Gast» – diese verbrauchen keinen Lizenz-Seat und haben automatisch keinen Zugriff auf interne Finanzen.',
          'Mit «Einladung senden» erhält die Person eine persönliche E-Mail mit direktem Zugangslink.'
        ],
        proTip: 'Wenn ein Mitarbeiter das Unternehmen verlässt, kannst du ihn über «Offboarding / Entfernen» mit einem Klick sicher von allen Projekten entkoppeln.'
      }
    ],
    tools: [
      { name: 'KI-Visitenkarten-Scanner (OCR)', badge: 'Gemini Vision', description: 'Erkennt alle Kontaktdaten abfotografierter Visitenkarten auf Deutsch, Französisch und Englisch.' },
      { name: 'Rollen- & Finanz-Berechtigung', badge: 'Security', description: 'Steuert pro Person präzise, ob das Finanzmodul sichtbar oder gesperrt ist.' },
      { name: 'Kostenlose Gäste-Lizenzen', badge: 'Unbegrenzt', description: 'Lade Bauherren, Architekten und Handwerker ohne zusätzliche Seat-Kosten in Projekte ein.' },
      { name: 'Gewerk- & Kategorien-Filter', badge: 'CRM', description: 'Filtere dein Adressbuch nach Gewerken (Elektro, Sanitär, Holzbau, Bauherrschaft etc.).' }
    ],
    roleAccess: {
      ownerAdmin: 'Mitglieder einladen, Rollen und Finanzrechte vergeben, Kontakte bearbeiten und offboarden.',
      employee: 'CRM-Kontakte einsehen, anlegen und Visitenkarten scannen.',
      externalGuest: 'Sieht nur die Kontaktliste der am selben Projekt beteiligten Ansprechpartner.'
    },
    faqs: [
      {
        q: 'Verbrauchen externe Handwerker oder Bauherren einen kostenpflichtigen Lizenz-Platz (Seat)?',
        a: 'Nein! Externe Gäste (Rollen: Gast, Bauherr, Handwerker, Subunternehmer, Externer Planer) sind auf Kreativ Desk OS immer kostenlos und unbegrenzt einladbar.'
      }
    ]
  },

  leads: {
    id: 'leads',
    category: 'company_hub',
    categoryLabel: 'Firmenzentrale (Ebene 1)',
    title: 'Verkaufs-Pipeline & Lead-Management',
    subtitle: 'Akquise-Kanban von der Erstanfrage über die Offerte bis zum gewonnenen Projektabschluss.',
    summary:
      'Im Lead-Modul steuerst du deine gesamte Neukunden-Akquise. Erfasse Anfragen manuell, per Visitenkarten-Scan oder vollautomatisch über dein öffentliches Web-Anfrageformular (`/lead-form`). Verschiebe Leads durch die Pipeline-Stufen (Neu, Kontaktiert, Offerte gesendet, Verhandlung, Gewonnen) und wandle gewonnene Leads direkt in ein aktives Projekt um.',
    dataFlow: [
      'Anfrage geht über öffentliches Lead-Formular oder manuell ein',
      'Qualifizierung & Offerten-Versand in der Kanban-Pipeline',
      'Status «Gewonnen» → 1-Klick Konvertierung in ein vollwertiges Projekt + CRM-Kontakt'
    ],
    workflows: [
      {
        title: 'Öffentliches Lead-Formular auf deiner eigenen Website einbinden',
        duration: '30 Sek.',
        steps: [
          'Klicke im Lead-Modul oben auf «Web-Formular Link / Einbetten».',
          'Kopiere deinen individuellen Firmen-Link (enthält deine companyId) und verlinke ihn auf deiner Website unter «Projekt anfragen».',
          'Jede Kundenanfrage landet ab sofort inklusive Budgetwunsch und Beschreibung automatisch in deiner Pipeline.'
        ],
        proTip: 'Mit dem KI-E-Mail-Assistenten im Lead-Detail kannst du dem Interessenten in 10 Sekunden eine massgeschneiderte Erstantwort senden.'
      }
    ],
    tools: [
      { name: 'Visuelles Akquise-Kanban', badge: 'Pipeline', description: 'Zeigt alle offenen Verkaufschancen, Abschlusswahrscheinlichkeiten und Auftragswerte.' },
      { name: 'Öffentliches Anfrage-Formular', badge: 'Lead-Magnet', description: 'Fertiges Online-Formular für deine Website, das Anfragen direkt in dein OS speist.' },
      { name: 'KI-Follow-Up Generator', badge: 'Sales AI', description: 'Verfasst professionelle Nachfass-E-Mails und Offerten-Anschreiben auf Knopfdruck.' },
      { name: 'Bexio Lead-Synchronisation', badge: 'CRM Sync', description: 'Überträgt qualifizierte Leads auf Wunsch direkt als Kontakte nach Bexio.' }
    ],
    roleAccess: {
      ownerAdmin: 'Voller Zugriff auf die gesamte Verkaufspipeline, Auftragswerte und Konvertierungen.',
      employee: 'Leads bearbeiten, Kontaktnotizen pflegen und Angebote vorbereiten.',
      externalGuest: 'Kein Zugriff auf die Verkaufspipeline.'
    },
    faqs: [
      {
        q: 'Werden Leads aus dem öffentlichen Web-Formular automatisch meiner Firma zugeordnet?',
        a: 'Ja, der Formular-Link trägt deine eindeutige Firmen-ID, sodass jede Anfrage sicher und exklusiv in deinem Mandanten-Workspace landet.'
      }
    ]
  },

  templates: {
    id: 'templates',
    category: 'company_hub',
    categoryLabel: 'Firmenzentrale & Recht',
    title: 'Schweizer SIA/BKP Master-Vorlagen & Dokumenten-Templates',
    subtitle: 'Sofort einsetzbare Schweizer Bau-, Architektur- und Agenturvorlagen sowie eigene Firmen-Templates.',
    summary:
      'Greife auf eine kuratierte Bibliothek geprüfter Schweizer Vorlagen zu: SIA-Werkverträge, Abnahmeprotokolle, Regierapporte, Mängelrügen, BKP-Kostenvoranschläge und Projekt-Checklisten. Zusätzlich kannst du deine eigenen Word-, Excel- oder PDF-Firmenvorlagen hochladen, damit dein ganzes Team immer mit denselben aktuellen Standards arbeitet.',
    dataFlow: [
      'Master-Vorlage auswählen oder eigene Firmenvorlage hochladen',
      'Direkt im KI-Dokumentenstudio öffnen, mit Projektdaten befüllen & anpassen',
      'Fertiges Dokument als PDF exportieren oder im Projekt-Tresor ablegen'
    ],
    workflows: [
      {
        title: 'SIA-Vorlage öffnen und für ein Projekt personalisieren',
        duration: '30 Sek.',
        steps: [
          'Wähle in der Vorlagen-Bibliothek die gewünschte Kategorie (z. B. «Verträge & Recht» oder «Baustelle & Protokolle»).',
          'Klicke bei der Vorlage auf «Im Studio verwenden».',
          'Ergänze Projektnamen und Bauherrschaft – dein Firmenbriefkopf wird automatisch eingefügt – und speichere das fertige PDF.'
        ],
        proTip: 'Unter «Eigene Firmenvorlagen» kannst du bestehende Vorlagen deines Büros hochladen, sodass sie für alle Mitarbeitenden zentral abrufbar sind.'
      }
    ],
    tools: [
      { name: 'Schweizer SIA & BKP Bibliothek', badge: 'Kuratierte Standards', description: 'Praxiserprobte Vorlagen für Planung, Ausschreibung, Bauleitung und Projektabschluss.' },
      { name: 'Eigene Firmen-Templates', badge: 'Custom Upload', description: 'Speichert büroeigene Vorlagen mandantensicher für das gesamte Team.' },
      { name: 'Direkt-Übergabe ans Dokumentenstudio', badge: '1-Klick Edit', description: 'Öffnet jede Textvorlage sofort bearbeitbar im integrierten Editor.' }
    ],
    roleAccess: {
      ownerAdmin: 'Alle Master-Vorlagen nutzen sowie eigene Firmenvorlagen hochladen und löschen.',
      employee: 'Vorlagen nutzen, für Projekte ausfüllen und eigene Vorlagen beisteuern.',
      externalGuest: 'Kein Zugriff auf die interne Vorlagen-Bibliothek.'
    },
    faqs: [
      {
        q: 'Sind meine hochgeladenen eigenen Vorlagen für andere Firmen sichtbar?',
        a: 'Nein, alle hochgeladenen Vorlagen sind über deine company_id streng auf deinen eigenen Firmen-Workspace isoliert.'
      }
    ]
  },

  meet: {
    id: 'meet',
    category: 'company_hub',
    categoryLabel: 'Kommunikation & KI',
    title: 'Team-Chat, Video-Konferenz & @ai Projektassistent',
    subtitle: 'Echtzeit-Projektkanäle, HD-Videocalls mit Gäste-Link, Sprachnotizen und kontextbezogene KI-Hilfe.',
    summary:
      'Bündle die gesamte Projektkommunikation an einem Ort statt in verstreuten WhatsApp-Gruppen. Erstelle Kanäle pro Projekt, starte mit einem Klick eine Video-Konferenz (inkl. kostenlosem Gäste-Einladungslink ohne Login-Zwang für externe Teilnehmer), teile Sprachnotizen und rufe mit `@ai` jederzeit den intelligenten Projektassistenten direkt im Chat auf.',
    dataFlow: [
      'Nachricht, Datei oder Sprachnotiz im Projekt-Kanal senden',
      'Mit @ai Fragen zum aktuellen Projektstand, Aufgaben oder Mängeln stellen',
      'Optional: Video-Konferenz starten & Einladungslink an Bauherrn senden'
    ],
    workflows: [
      {
        title: 'Video-Besprechung mit externem Bauherrn oder Fachplaner starten',
        duration: '20 Sek.',
        steps: [
          'Öffne das Modul «Meet & Chat» und klicke auf «Video-Call starten».',
          'Klicke im Call-Fenster auf «Gäste-Link kopieren» und sende den Link per E-Mail oder Nachricht an deinen Gesprächspartner.',
          'Externe Gäste können über den Browser direkt mit Kamera, Mikrofon und Bildschirmfreigabe teilnehmen – ohne Account.'
        ],
        proTip: 'Schreibe im Chat einfach `@ai Welche Mängel sind in diesem Projekt noch offen?` – die KI antwortet dir sofort anhand der echten Projektdaten.'
      }
    ],
    tools: [
      { name: 'Projektbezogene Chat-Kanäle', badge: 'Realtime', description: 'Strukturierte Kommunikation getrennt nach Projekten und Themen.' },
      { name: 'HD Video-Calls & Screen-Sharing', badge: 'In-Browser', description: 'Direkte Videokonferenzen inklusive Bildschirmübertragung für Planbesprechungen.' },
      { name: 'Externer Gäste-Konferenzlink', badge: 'Ohne Login', description: 'Ermöglicht Bauherren und Partnern den Beitritt per Klick im Browser.' },
      { name: '@ai Chat-Assistent & Sprachnotizen', badge: 'Smart Chat', description: 'Beantwortet Fragen aus der Projektdatenbank und verschickt Audio-Memos.' }
    ],
    roleAccess: {
      ownerAdmin: 'Voller Zugriff auf alle Kanäle, Video-Räume und Chat-Funktionen.',
      employee: 'Voller Zugriff auf Projekt-Chats, Video-Calls und @ai-Assistent.',
      externalGuest: 'Kann über einen Gäste-Konferenzlink (`/guest-meet/...`) gezielt an einer Video-Besprechung teilnehmen.'
    },
    faqs: [
      {
        q: 'Hat der @ai-Assistent im Chat Zugriff auf vertrauliche System-Schlüssel?',
        a: 'Nein, der @ai-Assistent liest ausschliesslich operative Projektdaten deiner eigenen Firma. Systemkonfigurationen und API-Tokens sind technisch strikt ausgefiltert.'
      }
    ]
  },

  audit: {
    id: 'audit',
    category: 'company_hub',
    categoryLabel: 'Sicherheit & Compliance',
    title: 'Revisionssicheres Audit-Log & Aktivitätsprotokoll',
    subtitle: 'Lückenlose Nachvollziehbarkeit aller sicherheitsrelevanten Aktionen, Freigaben und Änderungen.',
    summary:
      'Das Audit-Log protokolliert automatisch alle kritischen Vorgänge in deinem Unternehmens-Workspace: Logins, Einladungen, Rechteänderungen, unterzeichnete Kunden-Offerten, gelöschte Datensätze sowie Abo- und Einstellungsänderungen. Ideal für interne Qualitätskontrolle und SIA-/DSG-Compliance.',
    dataFlow: [
      'Aktion im System wird ausgeführt (z. B. Offerte signiert, Mitglied eingeladen, Datei gelöscht)',
      'Automatischer, unveränderbarer Zeitstempel-Eintrag in audit_logs',
      'Filterung & Export im Audit-Cockpit nach Zeitraum, Nutzer oder Ereignistyp'
    ],
    workflows: [
      {
        title: 'Sicherheits- und Freigabe-Historie überprüfen',
        duration: '20 Sek.',
        steps: [
          'Öffne in der Firmenzentrale den Reiter «Audit-Log».',
          'Filtere nach Kategorien (z. B. «Offerten-Freigaben», «Team & Rechte» oder «System-Einstellungen») oder suche nach einer E-Mail-Adresse.',
          'Exportiere das Protokoll bei Bedarf für interne Revisionen.'
        ],
        proTip: 'Wenn ein Kunde eine Smart Proposal online unterzeichnet, siehst du im Audit-Log auf die Sekunde genau den Zeitstempel, den Unterzeichner und den freigegebenen Betrag.'
      }
    ],
    tools: [
      { name: 'Echtzeit-Ereignis-Stream', badge: 'Compliance', description: 'Zeigt wer wann welche Aktion im Workspace ausgeführt hat.' },
      { name: 'Kategorien- & Personen-Filter', badge: 'Forensik', description: 'Schnelles Eingrenzen auf Sicherheits-, Finanz- oder Kunden-Events.' }
    ],
    roleAccess: {
      ownerAdmin: 'Voller Lesezugriff auf das gesamte Firmen-Audit-Log.',
      employee: 'Nur für Administratoren und berechtigte Führungsrollen einsehbar.',
      externalGuest: '100 % gesperrt.'
    },
    faqs: [
      {
        q: 'Können Einträge im Audit-Log nachträglich manipuliert werden?',
        a: 'Nein, Audit-Log-Einträge werden als reine Append-Only-Protokolle mit Server-Zeitstempel geschrieben.'
      }
    ]
  },

  settings: {
    id: 'settings',
    category: 'company_hub',
    categoryLabel: 'Firmenzentrale & System',
    title: 'System-Einstellungen, Branding, Stripe-Abo & Integrationen',
    subtitle: 'Firmenlogo, Markenfarbe, QR-IBAN, Bexio-Anbindung, E-Mail-Versand (Resend), Webhooks & REST-API.',
    summary:
      'In den Einstellungen passt du Kreativ Desk OS komplett an dein Corporate Design an: Lade dein eigenes Firmenlogo hoch, wähle deine Markenfarbe, hinterlege deine Bankdaten (QR-IBAN) für das Rechnungs-Studio, verwalte dein Abonnement über das Stripe-Kundenportal und verbinde Drittsysteme wie Bexio, Zapier/Make-Webhooks oder die REST-API.',
    dataFlow: [
      'Firmenlogo, Adresse & QR-IBAN einmalig in den Einstellungen speichern',
      'Automatische Übernahme auf alle PDF-Rechnungen, Offerten, Berichte & Briefköpfe',
      'Optional: Bexio-Token oder Webhook-URL hinterlegen für automatische Synchronisation'
    ],
    workflows: [
      {
        title: 'Eigenes Firmen-Branding & QR-IBAN für alle PDFs einrichten',
        duration: '60 Sek.',
        steps: [
          'Öffne «Einstellungen → Firmenprofil & Branding».',
          'Lade dein Firmenlogo hoch und trage Firmenname, Adresse, UID/MwSt.-Nummer sowie deine Schweizer IBAN / QR-IBAN ein.',
          'Wähle deine primäre Markenfarbe – alle generierten PDFs (Rechnungen, Offerten, Mängelprotokolle, Briefe) nutzen ab sofort dein eigenes Erscheinungsbild.'
        ],
        proTip: 'Unter «Admin & Abrechnung» kannst du jederzeit mit einem Klick auf «Stripe Portal öffnen» deine Rechnungsbelege herunterladen oder dein Lizenzpaket anpassen.'
      }
    ],
    tools: [
      { name: 'White-Label PDF-Branding', badge: 'Corporate Design', description: 'Überträgt dein Logo, deine Akzentfarbe und Fusszeile automatisch in alle PDF-Studios.' },
      { name: 'Stripe Billing & Lizenz-Manager', badge: 'Self-Service', description: 'Transparente Übersicht über belegte Team-Seats, aktuelles Paket und Rechnungsarchiv.' },
      { name: 'Bexio & Resend Integration', badge: 'Schnittstellen', description: 'Verbindet dein Treuhand-/ERP-System und deinen E-Mail-Versand.' },
      { name: 'Webhooks & SHA-256 REST-API Keys', badge: 'Automation', description: 'Erstelle sichere API-Schlüssel für eigene Schnittstellen zu `/api/v1`.' }
    ],
    roleAccess: {
      ownerAdmin: 'Voller Zugriff auf Firmen-Branding, Abrechnung, Integrationen und API-Schlüssel.',
      employee: 'Kann persönliche Profileinstellungen (Passwort, Sprache, Darstellung Hell/Dunkel) anpassen.',
      externalGuest: 'Kann nur eigene Kontodaten (Name/Passwort) verwalten.'
    },
    faqs: [
      {
        q: 'Wie sicher sind meine hinterlegten API-Keys (z. B. Bexio) gespeichert?',
        a: 'Alle System-Konfigurationen sind mandantenisoliert gespeichert, vor externen Zugriffen und KI-Abfragen geschützt, und REST-API-Schlüssel werden kryptografisch per SHA-256 gehasht.'
      }
    ]
  }
};

export const MODULE_KNOWLEDGE_BASE_EN: Record<string, ModuleKnowledgeEntry> = {
  projects: {
    id: 'projects',
    category: 'company_hub',
    categoryLabel: 'Company Hub (Tier 1)',
    title: 'Company Hub & Project Portfolio',
    subtitle: 'Strategic executive command center across all active construction, architecture, and agency projects.',
    summary:
      'The Company Hub is your Tier-1 headquarters. Monitor all active projects, company-wide revenue, open proposals, and team utilization at a glance, and jump into any individual Project Cockpit (Tier 2) with a single click.',
    dataFlow: [
      'Create a new project (including budget & SIA phase)',
      'Automatic provisioning of the Swiss 01–09 standard folder structure',
      'Real-time aggregation of project finances & time entries into the Company Hub',
      '1-click switch into the dedicated Project Cockpit'
    ],
    workflows: [
      {
        title: 'Launch a new client project with automated folder structure',
        duration: '45 sec',
        steps: [
          'Click "+ New Project" in the top right of the Company Hub.',
          'Enter project name, client, location, target budget in CHF, and current SIA phase.',
          'Optionally upload a cover image or generate an AI architectural preview.',
          'Click "Create Project" — the system automatically sets up the 01–09 data room and financial ledger.'
        ],
        proTip: 'Filter your portfolio anytime by status (Active, Planning, Completed) or via instant search.'
      }
    ],
    tools: [
      { name: 'Project Cards & Status Badges', badge: 'Portfolio', description: 'Displays progress, SIA phase, budget utilization, and assigned team members.' },
      { name: 'Global KPI Bar', badge: 'Live Finance', description: 'Consolidates paid/open invoices, quote volume, and net profit across all projects.' },
      { name: 'Master System Handbook (PDF)', badge: '14-Page PDF', description: 'Opens the official vector PDF operations manual ready to save or print.' }
    ],
    roleAccess: {
      ownerAdmin: 'Full access to all projects, company finances, settings, and seats.',
      employee: 'Access to assigned company projects, tasks, and time tracking (financials based on permission).',
      externalGuest: 'No access to Company Hub. Only sees the specific project they were invited to.'
    },
    faqs: [
      {
        q: 'What is the difference between Company Hub and Project Cockpit?',
        a: 'The Company Hub manages company-wide operations (all projects, CRM contacts, sales leads, global ledger, seats). Clicking a project opens the Project Cockpit with all 12 project-specific tools (3D BIM, 2D CAD, site camera, defects).'
      }
    ]
  },

  overview: {
    id: 'overview',
    category: 'project_cockpit',
    categoryLabel: 'Project Cockpit (Tier 2)',
    title: 'Project Cockpit & Executive Overview',
    subtitle: 'All project KPIs, milestones, quick launchers, and project team members on one screen.',
    summary:
      'The Project Cockpit is the home screen of each individual project, connecting budget status, open defects, upcoming milestones, recent documents, and direct shortcuts to all 12 project tools.',
    dataFlow: [
      'Real-time sync from Finance, Time Tracking, Defects & Calendar',
      'Live calculation of budget consumption & project health',
      'Direct jump into CAD Plans, 3D BIM, Defects, Documents & Pitch Deck'
    ],
    workflows: [
      {
        title: 'Check project health and budget consumption',
        duration: '30 sec',
        steps: [
          'Open the project from the Company Hub.',
          'Review the top KPI cards: target budget vs. booked costs (creditors + expenses + internal hours).',
          'Check open defect items and upcoming schedule milestones.'
        ],
        proTip: 'Invite external clients or contractors via the Project Team panel — external guests never consume paid seats.'
      }
    ],
    tools: [
      { name: 'Budget & Margin Radar', badge: 'Controlling', description: 'Compares project budget in real time against invoices, external costs, and time entries.' },
      { name: 'SIA Phase Indicator', badge: 'SIA 102 / 118', description: 'Shows the current project phase from concept to handover.' },
      { name: 'AI Project Briefing', badge: 'Gemini AI', description: 'Summarizes project status, risks, and open action items on demand.' }
    ],
    roleAccess: {
      ownerAdmin: 'Full read/write access including budgets, margins, and project settings.',
      employee: 'Full operational access to plans, tasks, and schedules.',
      externalGuest: 'Views project progress and shared files — internal budgets and margins are automatically hidden.'
    },
    faqs: [
      {
        q: 'How is budget progress calculated?',
        a: 'The system sums all external creditor costs, team expenses, and billable internal time entries assigned to the project and compares them against the target budget and outgoing invoices.'
      }
    ]
  },

  finance: {
    id: 'finance',
    category: 'finance_legal',
    categoryLabel: 'Finance & Legal',
    title: 'Finance, BKP 1–9, Swiss QR-Bills & Controlling',
    subtitle: 'Swiss project accounting with QR-Bill Studio, AI receipt scanner, expenses, and hourly ledger.',
    summary:
      'The Finance module strictly separates open quotes, actual revenue (outgoing invoices), external creditor costs (BKP), employee expenses, and internal project hours. Includes the SIX-compliant Swiss QR-Bill Studio and BKP 1–9 cost control.',
    dataFlow: [
      'Create invoice/quote in Invoice Studio or scan receipt via AI / mobile QR',
      'Automatic ledger classification (Quote vs. Outgoing Invoice vs. External Cost vs. Expense)',
      'Real-time booking in the Financial Ledger including 8.1% Swiss VAT',
      'Automatic PDF export & filing in the Document Vault (04_FINANZEN)'
    ],
    workflows: [
      {
        title: 'Create a Swiss QR-Bill or Quote in Invoice Studio',
        duration: '90 sec',
        steps: [
          'Click "Create Invoice / Quote" in the Finance module to open Invoice Studio.',
          'Select document type: "Invoice" (counts toward revenue) or "Quote" (tracked under Open Quotes).',
          'Choose a client from CRM, add line items, and verify VAT rate (8.1% or 0%) and QR-IBAN.',
          'Click "Save to Vault & Book" — the vector PDF with Swiss QR payment slip is saved to 04_FINANZEN and booked into the ledger.'
        ],
        proTip: 'Canceled invoices ("Storniert") remain visible for audit purposes but are automatically excluded from revenue and profit totals.'
      }
    ],
    tools: [
      { name: 'Swiss QR-Bill Studio', badge: 'SIX Standard', description: 'Generates compliant Swiss QR-invoices, deposit invoices, and quotes as vector PDFs.' },
      { name: '5-Pillar Financial Ledger', badge: 'Precision Logic', description: 'Strictly separates Quotes, Outgoing Invoices, External Costs, Team Expenses, and Internal Hours.' },
      { name: 'AI Receipt & Expense Scanner', badge: 'OCR + QR', description: 'Snap receipts with your phone and auto-extract amounts, dates, and BKP categories.' }
    ],
    roleAccess: {
      ownerAdmin: 'Full access to revenue, margins, invoices, BKP budgets, and hourly rates.',
      employee: 'Hidden by default unless granted "View Finance" permission by an admin.',
      externalGuest: '100% blocked. External guests and contractors never see financial data.'
    },
    faqs: [
      {
        q: 'Do saved quotes count toward revenue?',
        a: 'No. Quotes are tracked separately under "Open Quotes" and only affect revenue once converted or booked as an outgoing invoice.'
      }
    ]
  },

  plans: {
    id: 'plans',
    category: 'studios_ai',
    categoryLabel: 'Studios & Field',
    title: '2D CAD Plans, Scale Calibration & Smart Pins',
    subtitle: 'Interactive floor plan viewer for PDF/CAD drawings with scale calibration, area measurement, and defect pins.',
    summary:
      'Upload floor plans and technical drawings, calibrate the exact scale in two clicks, measure distances and polygon room areas (m²), and place location-bound pins for defects, photos, and tasks directly on the drawing.',
    dataFlow: [
      'Upload PDF/CAD floor plan',
      'Calibrate scale using a known reference dimension',
      'Measure distances/areas (m²) or drop defect pins on the plan',
      'Export annotated PDF plan or sync pins with the Defects list'
    ],
    workflows: [
      {
        title: 'Calibrate plan scale in 3 clicks',
        duration: '25 sec',
        steps: [
          'Open your floor plan in the Plan Editor.',
          'Select the "Calibrate Scale" ruler tool.',
          'Click the start and end point of a known wall or doorway on the drawing.',
          'Enter the real-world length in meters — all distance and area (m²) tools are now calibrated.'
        ],
        proTip: 'Scale calibration is saved persistently per plan for your entire team.'
      }
    ],
    tools: [
      { name: 'Scale Calibration', badge: 'Precision', description: 'Calibrates the drawing using a reference length for accurate m and m² measurements.' },
      { name: 'Distance & Area Measurement', badge: 'm / m²', description: 'Measures wall lengths and room polygons directly in the browser.' },
      { name: 'Smart Location Pins', badge: 'Field Sync', description: 'Anchors defects, tasks, and site photos to exact coordinates on the floor plan.' }
    ],
    roleAccess: {
      ownerAdmin: 'Upload, delete, calibrate, measure, pin, and export PDF plans.',
      employee: 'Upload, calibrate, measure, and manage pins.',
      externalGuest: 'View shared plans, zoom in, and inspect assigned pins.'
    },
    faqs: [
      {
        q: 'What file formats are supported?',
        a: 'Multi-page PDF construction drawings as well as high-resolution PNG/JPG plans up to 250 MB.'
      }
    ]
  },

  bim: {
    id: 'bim',
    category: 'studios_ai',
    categoryLabel: 'Studios & Field',
    title: '3D BIM & IFC Model Viewer',
    subtitle: 'High-performance 3D architecture and IFC inspection with section cuts, storey filters, and element data.',
    summary:
      'Load IFC and 3D architectural models directly in your browser. Inspect storeys, slice through buildings with real-time X/Y/Z clipping planes, and read IFC element attributes with a single click.',
    dataFlow: [
      'Load IFC or 3D model from project vault',
      'Toggle storeys and building layers',
      'Apply X/Y/Z section cuts & inspect element metadata',
      'Capture high-res 3D snapshots for reports or AI rendering'
    ],
    workflows: [
      {
        title: 'Inspect building interiors with 3D Section Cuts',
        duration: '20 sec',
        steps: [
          'Open your model in the 3D BIM Viewer.',
          'Enable the "Section Cut (Clipping)" tool in the toolbar.',
          'Drag the X, Y, or Z slider to slice smoothly into the building and click any element to inspect its IFC properties.'
        ],
        proTip: 'Use the Snapshot button to save the current 3D view directly to your project vault.'
      }
    ],
    tools: [
      { name: 'IFC Property Inspector', badge: 'BIM Data', description: 'Shows element ID, material, dimensions, and IFC metadata on click.' },
      { name: '3-Axis Section Planes', badge: 'X / Y / Z Cut', description: 'Slices the 3D model in real time along any axis.' }
    ],
    roleAccess: {
      ownerAdmin: 'Upload, manage, and inspect 3D models.',
      employee: 'Full 3D navigation, section cuts, and snapshots.',
      externalGuest: 'Interactive 3D viewing in the browser for client presentations.'
    },
    faqs: [
      {
        q: 'Does my client need external CAD software to view 3D models?',
        a: 'No, the 3D BIM Viewer runs 100% natively in the browser on desktop, tablet, and mobile.'
      }
    ]
  },

  defects: {
    id: 'defects',
    category: 'project_cockpit',
    categoryLabel: 'Project Cockpit (Tier 2)',
    title: 'Defect Management & SIA Inspection Reports',
    subtitle: 'Legally compliant defect tracking with before/after photo proof, deadlines, contractor assignment & PDF reports.',
    summary:
      'Capture construction defects on-site or in the office with status, priority, due date, responsible contractor, and before/after photo documentation. Generate formal PDF inspection protocols in one click.',
    dataFlow: [
      'Create defect + snap proof photo via mobile QR code',
      'Assign deadline & responsible contractor',
      'Upload "After" photo once resolved & export PDF protocol to Vault'
    ],
    workflows: [
      {
        title: 'Capture a site defect with mobile QR photo sync',
        duration: '40 sec',
        steps: [
          'Click "+ New Defect".',
          'Enter title, severity, room/location, and due date.',
          'Click "Mobile QR Upload" and snap the photo with your smartphone — it syncs live into the defect form.',
          'Save the defect or export the complete PDF Defect Report.'
        ],
        proTip: 'Attach an "After" photo once fixed to document before/after proof side-by-side on the PDF report.'
      }
    ],
    tools: [
      { name: 'Before / After Photo Proof', badge: 'Evidence', description: 'Documents both the initial defect and the completed repair.' },
      { name: 'Mobile QR Live Camera', badge: 'Zero-App Sync', description: 'Snap photos from your phone directly into the open defect record.' },
      { name: 'PDF Defect Protocol Generator', badge: 'SIA Ready', description: 'Exports formal inspection reports with photos and signature blocks.' }
    ],
    roleAccess: {
      ownerAdmin: 'Create, assign, approve, delete defects, and export PDF protocols.',
      employee: 'Create defects, attach photos, update status, and export protocols.',
      externalGuest: 'Contractors see assigned defects and can upload completion photos.'
    },
    faqs: [
      {
        q: 'How fast do mobile QR photos appear?',
        a: 'Photos taken via the QR code appear in under 2 seconds via Supabase Realtime.'
      }
    ]
  },

  camera: {
    id: 'camera',
    category: 'project_cockpit',
    categoryLabel: 'Project Cockpit (Tier 2)',
    title: 'Site Monitoring & Digital Construction Diary',
    subtitle: 'Photo documentation, daily weather logs, trade attendance, and AI construction diary reports.',
    summary:
      'Document daily site progress with timestamps, weather conditions, on-site headcount, and photo galleries, and generate formal AI construction diary PDFs.',
    dataFlow: [
      'Upload site photos via camera/QR + log weather & headcount',
      'Generate AI daily site report & archive PDF in Document Vault'
    ],
    workflows: [
      {
        title: 'Create a daily construction diary report',
        duration: '60 sec',
        steps: [
          'Open "Site Monitoring" in your project.',
          'Upload site photos or scan the mobile QR code during your site walk.',
          'Log weather, active trades, and key notes, then click "Generate AI Daily Report" and save as PDF.'
        ],
        proTip: 'Use the timeline slider to visually compare construction progress over time.'
      }
    ],
    tools: [
      { name: 'Chronological Photo Timeline', badge: 'Progress', description: 'Organizes all site photos by date and construction phase.' },
      { name: 'AI Construction Diary', badge: 'Auto-Report', description: 'Turns brief site notes into formal daily inspection reports.' }
    ],
    roleAccess: {
      ownerAdmin: 'Full access to site logs and photo archives.',
      employee: 'Upload photos and create daily site reports.',
      externalGuest: 'View shared site progress photos.'
    },
    faqs: []
  },

  calendar: {
    id: 'calendar',
    category: 'project_cockpit',
    categoryLabel: 'Project Cockpit (Tier 2)',
    title: 'Construction Schedule, Gantt Chart & Milestones',
    subtitle: 'Visual scheduling with Gantt timeline, monthly calendar, SIA phases, and PDF schedule export.',
    summary:
      'Plan project phases, trade schedules, and handover milestones. Switch seamlessly between the interactive Gantt chart and monthly calendar view, or auto-generate schedules with AI.',
    dataFlow: [
      'Create phases & milestones in Gantt view or via AI generator',
      'Adjust dates and track status (Planned / In Progress / Done)',
      'Export as PDF schedule or .ics calendar file'
    ],
    workflows: [
      {
        title: 'Generate a complete project schedule with AI',
        duration: '45 sec',
        steps: [
          'Open the Calendar module and click the AI wand icon.',
          'Enter start date, target completion, and project type.',
          'Review and customize the generated phases in the Gantt chart and export as PDF.'
        ],
        proTip: 'Use the Schedule Library dropdown to maintain multiple schedules per project (e.g., Master Plan vs. Interior Fit-Out).'
      }
    ],
    tools: [
      { name: 'Interactive Gantt Chart', badge: 'Timeline', description: 'Visualizes phase durations, overlaps, and progress.' },
      { name: 'AI Schedule Generator & PDF Export', badge: 'Automation', description: 'Builds realistic phase schedules and exports printable PDFs.' }
    ],
    roleAccess: {
      ownerAdmin: 'Create, edit, delete, and export schedules.',
      employee: 'Update phases, milestones, and progress.',
      externalGuest: 'View shared project schedules and milestones.'
    },
    faqs: []
  },

  agenda: {
    id: 'agenda',
    category: 'company_hub',
    categoryLabel: 'Company Hub & Project',
    title: 'Agenda, Tasks & Time Tracking (Rapporte)',
    subtitle: 'Daily scheduling, action items, billable time tracking with hourly rates, and automatic ledger sync.',
    summary:
      'Combines daily task and appointment scheduling with precise project time tracking. Every logged time entry automatically updates the project financial ledger.',
    dataFlow: [
      'Log project hours via live timer or manual form',
      'Automatic sync to time_entries and Financial Ledger',
      'Export printable PDF time reports for client sign-off'
    ],
    workflows: [
      {
        title: 'Log project hours & export PDF time report',
        duration: '30 sec',
        steps: [
          'Open the "Time Tracking / Rapporte" tab in Agenda.',
          'Select project, date, hours, hourly rate in CHF, and activity description.',
          'Click "Save Entry" — it immediately updates the Financial Ledger and can be exported as a PDF report.'
        ],
        proTip: 'Uncheck "Billable" or set rate to 0 CHF for non-billable goodwill hours.'
      }
    ],
    tools: [
      { name: 'Time Tracker & Live Timer', badge: 'Rapporte', description: 'Logs project hours, descriptions, and hourly rates.' },
      { name: 'Automatic Financial Ledger Sync', badge: 'Controlling', description: 'Feeds billable hours directly into project cost calculation.' }
    ],
    roleAccess: {
      ownerAdmin: 'View all team time entries, rates, and reports.',
      employee: 'Log personal time entries, tasks, and appointments.',
      externalGuest: 'Views shared appointments only.'
    },
    faqs: []
  },

  documents: {
    id: 'documents',
    category: 'project_cockpit',
    categoryLabel: 'Project Cockpit (Tier 2)',
    title: 'Document Vault & AI Document Studio',
    subtitle: 'Structured Swiss data room (folders 01–09) up to 250 MB per file with AI contract & letter generator.',
    summary:
      'Central cloud archive with automatic 01–09 folder structure, browser preview for PDFs/images/CAD, and the integrated AI Document Studio for contracts, protocols, and letters on your company letterhead.',
    dataFlow: [
      'Upload files up to 250 MB or create documents in AI Studio',
      'Organize inside folders 01 to 09 with instant cloud preview'
    ],
    workflows: [
      {
        title: 'Generate a contract or protocol in AI Document Studio',
        duration: '60 sec',
        steps: [
          'Click "Create Document (AI Studio)" in the Documents module.',
          'Choose a template or enter an AI prompt, customize the text, and save directly as a branded PDF in the Vault.'
        ],
        proTip: 'All invoices from Invoice Studio and reports from Defects/Site Monitoring are automatically filed here too.'
      }
    ],
    tools: [
      { name: 'Swiss 01–09 Standard Folder Tree', badge: 'Structure', description: 'Pre-configured folders for contracts, plans, finances, site logs, and permits.' },
      { name: '250 MB Large File Support', badge: 'CAD / IFC Ready', description: 'Handles large CAD drawings, 3D models, and high-resolution PDF dossiers.' }
    ],
    roleAccess: {
      ownerAdmin: 'Full access to all folders, uploads, and deletions.',
      employee: 'Upload files and create documents in AI Studio.',
      externalGuest: 'Views shared project documents only.'
    },
    faqs: []
  },

  whiteboard: {
    id: 'whiteboard',
    category: 'studios_ai',
    categoryLabel: 'Studios & AI',
    title: 'Infinite AI Whiteboard & Architectural Rendering',
    subtitle: 'Visual brainstorming, moodboards, floor plan sketches, and photorealistic AI visualizations.',
    summary:
      'Combine sketches, plans, material samples, and notes on an infinite canvas and transform rough sketches or 3D snapshots into photorealistic architectural renderings.',
    dataFlow: [
      'Place sketch or reference photo on the canvas',
      'Run AI Rendering Studio with style & material prompt',
      'Send 4K visualization to Pitch Deck or Document Vault'
    ],
    workflows: [
      {
        title: 'Turn a sketch or 3D screenshot into a photorealistic AI rendering',
        duration: '45 sec',
        steps: [
          'Upload a sketch or 3D BIM snapshot to the Whiteboard.',
          'Open the AI Visualization panel, describe materials and lighting, and generate a high-res rendering.'
        ],
        proTip: 'Export the moodboard as a PDF or send renderings directly to Pitch Deck Studio.'
      }
    ],
    tools: [
      { name: 'AI Rendering Engine', badge: 'Gemini Vision', description: 'Transforms sketches and room photos into architectural visualizations.' },
      { name: 'Infinite Canvas & Sticky Notes', badge: 'Moodboard', description: 'Arrange images, color swatches, sketches, and notes freely.' }
    ],
    roleAccess: {
      ownerAdmin: 'Full access to boards and AI rendering.',
      employee: 'Full access to Whiteboard tools and AI visualizations.',
      externalGuest: 'View shared concept boards in presentation mode.'
    },
    faqs: []
  },

  pitch: {
    id: 'pitch',
    category: 'studios_ai',
    categoryLabel: 'Studios & AI',
    title: 'Pitch Deck Studio & Client Presentations',
    subtitle: 'Interactive 16:9 slide builder with Bento layouts, AI copywriting, PDF export & Smart Proposal publishing.',
    summary:
      'Design widescreen architectural and agency presentations using Swiss Bento layouts, project renderings, and AI copywriting. Export as a vector PDF or publish in one click as an interactive Smart Proposal.',
    dataFlow: [
      'Build slides manually or via AI Deck Generator',
      'Insert project photos, floor plans, and budget slides',
      'Export 16:9 vector PDF or publish as interactive Smart Proposal link'
    ],
    workflows: [
      {
        title: 'Build a client presentation and publish as Smart Proposal',
        duration: '60 sec',
        steps: [
          'Open Pitch Deck Studio and generate or customize your slides.',
          'Add project images (with individual zoom & pan controls).',
          'Click "Export PDF" or "Publish as Smart Proposal" to generate an interactive client link.'
        ],
        proTip: 'Switch any slide layout between full-bleed, split-screen, 3-image gallery, and Bento grid.'
      }
    ],
    tools: [
      { name: 'Architectural & Bento Layouts', badge: '16:9 Studio', description: 'Professional templates for cover, vision, floor plans, galleries, and budgets.' },
      { name: 'Smart Proposal Publisher', badge: '1-Click Quote', description: 'Turns your presentation into an interactive web proposal with e-signature.' }
    ],
    roleAccess: {
      ownerAdmin: 'Create, present, export PDF, and publish Smart Proposals.',
      employee: 'Design slides and export PDFs.',
      externalGuest: 'Views published presentation links only.'
    },
    faqs: []
  },

  proposals: {
    id: 'proposals',
    category: 'finance_legal',
    categoryLabel: 'Finance & Legal',
    title: 'Smart Proposals (Interactive Client Quotes & Vault)',
    subtitle: 'Digital web proposals with selectable options, PIN protection, view analytics & legally binding e-signature.',
    summary:
      'Send interactive, optionally PIN-protected web proposals (`/p/...`). Clients can toggle optional packages, ask questions, and sign digitally — triggering instant team notifications, confirmation emails, and optional Bexio sync.',
    dataFlow: [
      'Publish Smart Proposal from Pitch Deck or Proposal Manager',
      'Share link (Light or Dark theme, optional PIN) with client',
      'Track live view counts & receive instant notification upon digital signature'
    ],
    workflows: [
      {
        title: 'Share an interactive proposal and track client acceptance',
        duration: '40 sec',
        steps: [
          'Open "Smart Proposals" in the sidebar.',
          'Choose default Light or Dark mode, copy the share link, and send it to your client.',
          'Track live views and see signed acceptances immediately in your dashboard.'
        ],
        proTip: 'Extend expired proposals by +30 days anytime with a single click.'
      }
    ],
    tools: [
      { name: 'Interactive Upsell Options', badge: 'Dynamic Pricing', description: 'Clients can select optional add-ons with live total calculation.' },
      { name: 'Digital E-Signature & Bexio Sync', badge: 'Legal Proof', description: 'Records signer, timestamp, and final price and syncs with Bexio.' }
    ],
    roleAccess: {
      ownerAdmin: 'Full access to all proposals, revenue volume, extensions, and deletions.',
      employee: 'Prepare proposals, preview, and copy share links.',
      externalGuest: 'Accesses only their dedicated proposal link.'
    },
    faqs: []
  },

  team: {
    id: 'team',
    category: 'company_hub',
    categoryLabel: 'Company Hub & Project',
    title: 'Team, CRM Contacts, Business Card Scanner & Guest Permissions',
    subtitle: 'Central contact management, AI business card OCR, staff invitations, and free external guest access.',
    summary:
      'Manage internal staff roles (including finance visibility) and your company CRM (clients, engineers, contractors). Includes an AI business card scanner that extracts contact details from photos in seconds.',
    dataFlow: [
      'Add contact manually or via AI Business Card Scanner',
      'Assign role: Internal Team Member (Seat) vs. External Guest (Free)',
      'Send invitation email with automatic workspace linking'
    ],
    workflows: [
      {
        title: 'Scan a business card with AI and save to CRM',
        duration: '15 sec',
        steps: [
          'Click "Scan Business Card (AI)" in the Team/CRM module.',
          'Upload or snap a photo via mobile QR — AI fills in name, company, email, phone, and address automatically.'
        ],
        proTip: 'External guests (clients, contractors) never consume a paid license seat and are automatically blocked from financial data.'
      }
    ],
    tools: [
      { name: 'AI Business Card Scanner (OCR)', badge: 'Gemini Vision', description: 'Extracts contact details in German, French, and English.' },
      { name: 'Granular Finance Permissions', badge: 'Security', description: 'Control per team member whether financial modules are visible.' }
    ],
    roleAccess: {
      ownerAdmin: 'Invite members, manage roles and finance permissions, offboard users.',
      employee: 'View/add CRM contacts and scan business cards.',
      externalGuest: 'Views project team directory only.'
    },
    faqs: []
  },

  leads: {
    id: 'leads',
    category: 'company_hub',
    categoryLabel: 'Company Hub (Tier 1)',
    title: 'Sales Pipeline & Lead Management',
    subtitle: 'Kanban acquisition board from initial inquiry to signed proposal and project conversion.',
    summary:
      'Manage your sales pipeline via Kanban, capture website inquiries automatically via your public Lead Form (`/lead-form`), and convert won deals directly into projects.',
    dataFlow: [
      'Capture inquiry via public web form or manually',
      'Move deal through Kanban stages & convert won lead into an active project'
    ],
    workflows: [
      {
        title: 'Share your public Lead Capture Form',
        duration: '30 sec',
        steps: [
          'Click "Web Form Link" in the Leads module to copy your tenant-bound inquiry form URL.',
          'Every submitted inquiry lands automatically in your company pipeline.'
        ],
        proTip: 'Use the AI Follow-Up generator to draft personalized replies in seconds.'
      }
    ],
    tools: [
      { name: 'Kanban Sales Pipeline', badge: 'CRM', description: 'Tracks deal value, probability, and stage.' },
      { name: 'Public Lead Capture Form', badge: 'Inbound', description: 'Feeds website inquiries directly into your workspace.' }
    ],
    roleAccess: {
      ownerAdmin: 'Full access to pipeline, deal values, and conversions.',
      employee: 'Manage leads and follow-ups.',
      externalGuest: 'No access.'
    },
    faqs: []
  },

  templates: {
    id: 'templates',
    category: 'company_hub',
    categoryLabel: 'Company Hub & Legal',
    title: 'Swiss SIA/BKP Master Templates & Custom Documents',
    subtitle: 'Ready-to-use Swiss construction, architecture, and agency templates plus custom company templates.',
    summary:
      'Access curated Swiss SIA contracts, inspection protocols, cost estimates, and checklists, or upload your own company templates for team-wide use.',
    dataFlow: [
      'Pick a master template or upload a custom template',
      'Open in AI Document Studio, customize, and export branded PDF'
    ],
    workflows: [
      {
        title: 'Use a Swiss SIA template in AI Document Studio',
        duration: '30 sec',
        steps: [
          'Select a template in the Templates library and click "Use in Studio".',
          'Customize project details and save the branded PDF to your project vault.'
        ],
        proTip: 'Uploaded custom templates are strictly isolated to your company workspace.'
      }
    ],
    tools: [
      { name: 'Swiss SIA & BKP Template Library', badge: 'Standards', description: 'Pre-built templates for contracts, site protocols, and handovers.' }
    ],
    roleAccess: {
      ownerAdmin: 'Use all templates and upload/delete custom templates.',
      employee: 'Use templates and upload custom templates.',
      externalGuest: 'No access.'
    },
    faqs: []
  },

  meet: {
    id: 'meet',
    category: 'company_hub',
    categoryLabel: 'Communication & AI',
    title: 'Team Chat, Video Conferencing & @ai Project Assistant',
    subtitle: 'Real-time project channels, HD video calls with guest links, voice notes, and context-aware AI help.',
    summary:
      'Centralize project communication with dedicated project channels, in-browser HD video calls (with login-free guest links), voice notes, and the `@ai` project assistant.',
    dataFlow: [
      'Post messages, files, or voice notes in project channels',
      'Mention @ai to query live project tasks and defects',
      'Launch HD video call and share guest link with external partners'
    ],
    workflows: [
      {
        title: 'Start a video call with an external client or contractor',
        duration: '20 sec',
        steps: [
          'Open Meet & Chat and click "Start Video Call".',
          'Copy the Guest Link and send it to your client — they can join directly in their browser without an account.'
        ],
        proTip: 'Type `@ai` in any channel to ask questions about open tasks or defects.'
      }
    ],
    tools: [
      { name: 'Project Chat Channels', badge: 'Realtime', description: 'Organized team communication per project.' },
      { name: 'Guest Video Call Links', badge: 'No Login Needed', description: 'Invite clients to video calls with screen sharing via a browser link.' }
    ],
    roleAccess: {
      ownerAdmin: 'Full access to channels, video calls, and @ai.',
      employee: 'Full access to project channels, video calls, and @ai.',
      externalGuest: 'Can join video calls via a shared `/guest-meet/...` link.'
    },
    faqs: []
  },

  audit: {
    id: 'audit',
    category: 'company_hub',
    categoryLabel: 'Security & Compliance',
    title: 'Tamper-Evident Audit Log & Activity Stream',
    subtitle: 'Complete traceability of security-relevant actions, proposal signatures, and permission changes.',
    summary:
      'Automatically logs logins, invitations, permission updates, digital proposal signatures, and configuration changes for compliance and quality assurance.',
    dataFlow: [
      'System action occurs (e.g., proposal signed, user invited)',
      'Immutable timestamped record written to audit_logs'
    ],
    workflows: [
      {
        title: 'Review security and proposal acceptance logs',
        duration: '20 sec',
        steps: [
          'Open the "Audit Log" tab in the Company Hub and filter by event type or user email.'
        ],
        proTip: 'Every signed Smart Proposal logs the exact timestamp, signer name, and approved amount.'
      }
    ],
    tools: [
      { name: 'Real-Time Compliance Stream', badge: 'Security', description: 'Tracks who performed which action and when.' }
    ],
    roleAccess: {
      ownerAdmin: 'Full read access to company audit logs.',
      employee: 'Restricted to admins and management.',
      externalGuest: '100% blocked.'
    },
    faqs: []
  },

  settings: {
    id: 'settings',
    category: 'company_hub',
    categoryLabel: 'Company Hub & System',
    title: 'System Settings, Branding, Stripe Billing & Integrations',
    subtitle: 'Company logo, brand color, QR-IBAN, Bexio sync, email delivery, webhooks & REST API keys.',
    summary:
      'Customize Kreativ Desk OS with your company logo, brand accent color, and Swiss QR-IBAN, manage your Stripe subscription, and connect Bexio, webhooks, and `/api/v1` REST API keys.',
    dataFlow: [
      'Save company logo, address & QR-IBAN in Settings',
      'Automatically applied to all PDF invoices, quotes, reports & letterheads'
    ],
    workflows: [
      {
        title: 'Configure White-Label PDF Branding & Swiss QR-IBAN',
        duration: '60 sec',
        steps: [
          'Open "Settings → Company Profile & Branding".',
          'Upload your logo, enter your address, VAT ID, and QR-IBAN, and pick your brand color.'
        ],
        proTip: 'Manage seats and download subscription invoices anytime via "Open Stripe Portal".'
      }
    ],
    tools: [
      { name: 'White-Label PDF Branding', badge: 'Corporate Identity', description: 'Applies your logo and brand color across all PDF studios.' },
      { name: 'Stripe Billing & SHA-256 API Keys', badge: 'Enterprise', description: 'Self-service seat management and secure REST API keys.' }
    ],
    roleAccess: {
      ownerAdmin: 'Full access to branding, billing, integrations, and API keys.',
      employee: 'Personal profile settings (password, language, theme).',
      externalGuest: 'Personal account settings only.'
    },
    faqs: []
  }
};

export function getModuleKnowledge(moduleId: string, lang: string = 'de'): ModuleKnowledgeEntry {
  const isEn = lang === 'en';
  const dict = isEn ? MODULE_KNOWLEDGE_BASE_EN : MODULE_KNOWLEDGE_BASE_DE;
  const normalized = (moduleId || 'projects').toLowerCase().trim();
  return dict[normalized] || dict['projects'];
}

export function getAllModulesKnowledge(lang: string = 'de'): ModuleKnowledgeEntry[] {
  const isEn = lang === 'en';
  const dict = isEn ? MODULE_KNOWLEDGE_BASE_EN : MODULE_KNOWLEDGE_BASE_DE;
  return Object.values(dict);
}
