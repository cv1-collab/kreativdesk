/**
 * Kreativ Desk OS - Master Template & Contract Catalog
 * Comprehensive bilingual (DE / EN) templates for Architecture, Scenography,
 * 3D Visualization, Execution Management, and SIA/BKP Workflows.
 */

export interface MasterTemplate {
  id: string;
  code: string;
  category: 'contracts' | 'fees' | 'execution' | 'rights_ai' | 'protocols';
  tags: string[];
  estimatedMinutes: number;
  title: {
    de: string;
    en: string;
  };
  description: {
    de: string;
    en: string;
  };
  content: {
    de: string;
    en: string;
  };
  recommendedSettings?: {
    showSignatures?: boolean;
    clientSignatoryLabel?: { de: string; en: string };
    contractorSignatoryLabel?: { de: string; en: string };
  };
}

export const MASTER_TEMPLATES: MasterTemplate[] = [
  // ==========================================================================
  // A01: Planer- & Architekturvertrag (SIA 102/118 orientiert)
  // ==========================================================================
  {
    id: 'tpl-a01-planervertrag',
    code: 'A01',
    category: 'contracts',
    tags: ['SIA 102', 'Architektur', 'Generalplanung', 'OR 394'],
    estimatedMinutes: 15,
    title: {
      de: 'A01 Planer- & Architekturvertrag (SIA 102)',
      en: 'A01 Planning & Architectural Agreement (SIA 102)'
    },
    description: {
      de: 'Rechtskonformer Planer- und Architekturvertrag nach SIA 102 und Schweizer OR für Neu-, Umbau- und Sanierungsprojekte.',
      en: 'Legally compliant architectural and engineering contract aligned with SIA 102 and Swiss Code of Obligations.'
    },
    recommendedSettings: {
      showSignatures: true,
      clientSignatoryLabel: {
        de: 'Auftraggeber (Bauherrschaft)',
        en: 'Client (Building Owner / Principal)'
      },
      contractorSignatoryLabel: {
        de: 'Planer / Architekt',
        en: 'Planner / Architect (Contractor)'
      }
    },
    content: {
      de: `VERTRAG FÜR PLANER- UND ARCHITEKTURLEISTUNGEN (SIA 102)
Ref-Nr.: {{project.number}} | Projekt: {{project.name}}

PARTEIEN

Auftragnehmer (Planer):
{{company.name}}
{{company.address}}, {{company.zipCity}}
E-Mail: {{company.email}} | Tel: {{company.phone}}
UID/MWST: {{company.vatNumber}}

und

Auftraggeber (Bauherrschaft):
{{client.company}}
z. Hd. {{client.name}}
{{client.address}}, {{client.zipCity}}

1. VERTRAGSGEGENSTAND & PROJEKT
Gegenstand dieses Vertrages ist die Erbringung von Planungs-, Projektierungs- und Bauleitungsleistungen für folgendes Vorhaben:
Projekt: {{project.name}}
Projektstandort / Liegenschaft: {{project.siteLocation}}

2. RECHTLICHE GRUNDLAGEN
Soweit in dieser Vereinbarung keine abweichenden schriftlichen Regelungen getroffen wurden, gelten die Bestimmungen der SIA-Ordnung 102 (Ordnung für Leistungen und Honorare der Architektinnen und Architekten, Ausgabe 2014) sowie subsidiär das Schweizerische Obligationenrecht (OR Art. 394 ff. über den einfachen Auftrag) als integrierende Vertragsbestandteile.

3. LEISTUNGSUMFANG & PHASEN (GEMÄSS SIA 102)
Der Planer erbringt die vereinbarten Teilleistungen in folgenden Phasen:
• Phase 31: Vorprojekt (Machbarkeitsanalyse, Grobkostenschätzung ±20 %)
• Phase 32: Bauprojekt & Bewilligungsverfahren (Kostenvoranschlag ±10 %)
• Phase 41: Ausschreibung, Offertvergleich & Vergabeanträge (BKP-Gliederung)
• Phase 51: Ausführungsplanung (Werkpläne Mst. 1:50 / 1:20, Details)
• Phase 52: Ausführung & Bauführung (Terminüberwachung, Kostenkontrolle, SIA 118 Abnahme)
• Phase 53: Inbetriebnahme & Abschluss (Schlussabrechnung, Revisionsakten)

4. HONORAR & NEBENKOSTEN
Das Gesamthonorar wird vereinbart auf Basis von:
Gesamtbudget / Kostendach: {{currency}} {{project.budget}}
Nebenkosten (Plots, behördliche Gebühren, Reisespesen ausserhalb des Einsatzgebiets) werden nach effektivem Aufwand oder vereinbarter Spesenpauschale abgerechnet. Rechnungsstellung erfolgt rein netto innert 30 Tagen.

5. TERMINE & MEILENSTEINE
Die Planungsarbeiten beginnen per vereinbartem Projektstart. Die Meilensteine richten sich nach dem jeweils genehmigten Terminprogramm.

6. SCHLUSSBESTIMMUNGEN & GERICHTSSTAND
Änderungen und Ergänzungen bedürfen der Schriftform. Es gilt ausschliesslich Schweizer Recht. Gerichtsstand ist der Geschäftssitz des Planers in {{jurisdiction}}.`,
      en: `ARCHITECTURAL & PLANNING SERVICES AGREEMENT (SIA 102 ALIGNED)
Ref No.: {{project.number}} | Project: {{project.name}}

PARTIES

Contractor (Planner / Architect):
{{company.name}}
{{company.address}}, {{company.zipCity}}
Email: {{company.email}} | Phone: {{company.phone}}
VAT/UID: {{company.vatNumber}}

and

Client (Building Owner / Principal):
{{client.company}}
Attn: {{client.name}}
{{client.address}}, {{client.zipCity}}

1. SCOPE OF PROJECT & OBJECT
The object of this agreement comprises planning, design development, and construction supervision services for:
Project Name: {{project.name}}
Project Site / Property: {{project.siteLocation}}

2. GOVERNING STANDARDS & JURISDICTION
Unless explicitly stipulated otherwise in writing, the provisions of the SIA Regulation 102 (Standards for Architectural and Engineering Services and Fees) and subsidiarily the Swiss Code of Obligations (Art. 394 et seq. Swiss CO) form an integral part of this contract.

3. SCOPE OF SERVICES (PHASES ACCORDING TO SIA 102)
The Planner shall render services across the agreed standard phases:
• Phase 31: Schematic Design (Feasibility, rough budget estimate ±20%)
• Phase 32: Design Development & Permitting (Cost estimate ±10%)
• Phase 41: Tendering, Procurement & Contractor Award Proposals
• Phase 51: Construction Documentation (Detailed working drawings 1:50 / 1:20)
• Phase 52: Construction Administration & Site Supervision (Quality control, SIA 118 handovers)
• Phase 53: Closeout & Commissioning (Final accounts, as-built documentation)

4. REMUNERATION & DISBURSEMENTS
The total fee cap is set based on:
Total Project Budget / Cap: {{currency}} {{project.budget}}
Ancillary disbursements (blueprints, regulatory application fees, long-distance travel) are invoiced at net cost. Payments are due net within 30 days of receipt.

5. SCHEDULE & MILESTONES
Work shall commence upon signature. Delivery milestones shall adhere to the project timeline approved by the Client.

6. APPLICABLE LAW & ARBITRATION
Amendments require written mutual consent. This contract is governed solely by Swiss law. Exclusive place of jurisdiction is {{jurisdiction}}.`
    }
  },

  // ==========================================================================
  // A02: Szenografie- & Ausstellungsdesignvertrag
  // ==========================================================================
  {
    id: 'tpl-a02-szenografie',
    code: 'A02',
    category: 'contracts',
    tags: ['Szenografie', 'Ausstellung', 'Museum', 'Interaktion', '3D'],
    estimatedMinutes: 12,
    title: {
      de: 'A02 Szenografie- & Ausstellungsdesignvertrag',
      en: 'A02 Scenography & Exhibition Design Contract'
    },
    description: {
      de: 'Spezieller Vertrag für Szenografie, räumliche Markenauftritte, Ausstellungen, Museumsgestaltung und interaktive Medien.',
      en: 'Dedicated contract for scenography, spatial brand experiences, museums, exhibitions, and interactive media design.'
    },
    recommendedSettings: {
      showSignatures: true,
      clientSignatoryLabel: {
        de: 'Auftraggeber (Museum / Kurator / Kunde)',
        en: 'Client (Museum / Curator / Client)'
      },
      contractorSignatoryLabel: {
        de: 'Auftragnehmer (Szenograf / Designer)',
        en: 'Contractor (Scenographer / Designer)'
      }
    },
    content: {
      de: `VERTRAG FÜR SZENOGRAFIE, AUSSTELLUNGSGESTALTUNG & RÄUMLICHE INSZENIERUNG
Ref-Nr.: {{project.number}} | Projekt: {{project.name}}

PARTEIEN

Auftragnehmer (Szenografie / Gestaltung):
{{company.name}}
{{company.address}}, {{company.zipCity}}
E-Mail: {{company.email}} | UID: {{company.vatNumber}}

und

Auftraggeber:
{{client.company}}
z. Hd. {{client.name}}
{{client.address}}, {{client.zipCity}}

1. VORHABEN & LEISTUNGSGEGENSTAND
Der Auftragnehmer übernimmt die szenografische Konzeption, das Ausstellungsdesign und die gestalterische Oberbauleitung für:
Vorhaben: {{project.name}}
Ausstellungsort / Location: {{project.siteLocation}}

2. LEISTUNGSPHASEN
Die Umsetzung erfolgt in folgenden Teilschritten:
• Phase 1 – Kuratorisches Leitkonzept & Dramaturgie (Narrative Struktur, Raumchoreografie, Moodboards)
• Phase 2 – Detailkonzept & Räumliche Ausarbeitung (3D-Layouts, Materialisierung, Farb- und Lichtkonzept)
• Phase 3 – Ausführungsplanung & Medienintegration (Detailpläne für Messe-/Möbelbau, Interfaces, AV-Hardware)
• Phase 4 – Ausschreibung & Vergabe (Herstellerbegleitung, Bemusterung, Prototyping)
• Phase 5 – Aufbauleitung, Kuration & Feinjustierung (Lichteinleuchtung, Exponaten-Installation, Sound-Check)

3. DIGITALE MEDIEN & INTERAKTIVE STATIONEN
Soweit interaktive Medienstationen, LED-Wände oder Screen-Präsentationen Bestandteil sind, liefert der Auftragnehmer die Screen-Designs und Interface-Konzepte in den vereinbarten nativen Auflösungen gemäss technischem Anforderungsblatt.

4. URHEBERRECHT & NUTZUNGSRECHTE
Die Urheberrechte verbleiben beim Auftragnehmer. Der Auftraggeber erhält mit vollständiger Bezahlung des Honorars das ausschliessliche, zweckgebundene Recht zur Aufführung/Nutzung der Szenografie für die vereinbarte Ausstellungsdauer am vereinbarten Ausstellungsort. Der Auftragnehmer ist berechtigt, Bild- und Videomaterial der realisierten Ausstellung für eigene Portfolio- und Kommunikationszwecke unentgeltlich zu nutzen.

5. VERGÜTUNG & ZAHLUNGSPLAN
Das Honorar beträgt pauschal {{currency}} {{project.budget}} zzgl. gesetzlicher MWST.
Zahlungsmeilensteine:
• 35 % bei Vertragsunterzeichnung / Kick-off
• 35 % nach Freigabe des Detailkonzepts (Phase 2)
• 30 % nach erfolgreicher Eröffnung / Vernissage

6. ANWENDBARES RECHT & GERICHTSSTAND
Es gilt Schweizer Recht. Gerichtsstand ist {{jurisdiction}}.`,
      en: `SCENOGRAPHY, EXHIBITION DESIGN & SPATIAL EXPERIENCE CONTRACT
Ref No.: {{project.number}} | Project: {{project.name}}

PARTIES

Contractor (Scenography / Spatial Design):
{{company.name}}
{{company.address}}, {{company.zipCity}}
Email: {{company.email}} | VAT: {{company.vatNumber}}

and

Client (Principal):
{{client.company}}
Attn: {{client.name}}
{{client.address}}, {{client.zipCity}}

1. PROJECT SCOPE & PURPOSE
The Contractor shall provide comprehensive scenographic conceptualization, exhibition spatial design, and artistic supervision for:
Exhibition / Project: {{project.name}}
Exhibition Venue / Location: {{project.siteLocation}}

2. PHASES OF WORK
• Phase 1 – Curatorial Narrative & Spatial Storytelling (Atmospheric choreography, moodboards, flow charts)
• Phase 2 – Spatial Design & Materialization (3D layouts, lighting design, material specifications)
• Phase 3 – Construction & Media Documentation (Cabinetry detailing, AV/Hardware interface plans)
• Phase 4 – Procurement & Prototype Verification (Tender evaluation, sampling, mock-up approvals)
• Phase 5 – On-Site Installation Supervision & Commissioning (Lighting focusing, display fitting, acoustic calibration)

3. INTERACTIVE STATIONS & DIGITAL MEDIA
Where interactive installations, media walls, or digital displays are included, the Contractor shall deliver wireframes, visual assets, and specifications according to the technical data sheet.

4. INTELLECTUAL PROPERTY & USAGE RIGHTS
Moral and copyright ownership remains with the Contractor. Upon complete remuneration, the Client is granted the exclusive, earmarked right to utilize the spatial design for the agreed duration at the designated venue. The Contractor reserves the right to publish project photographs and media documentation for portfolio and self-promotional purposes.

5. REMUNERATION & MILESTONES
The agreed lump-sum fee is {{currency}} {{project.budget}} plus statutory VAT.
Payment Schedule:
• 35% upon agreement signing / Kick-off
• 35% upon formal approval of Spatial Design (Phase 2)
• 30% upon exhibition public vernissage / opening

6. GOVERNING LAW & JURISDICTION
This contract is subject to Swiss law. Exclusive venue of jurisdiction is {{jurisdiction}}.`
    }
  },

  // ==========================================================================
  // A03: 3D-Visualisierungs- & Renderingvertrag
  // ==========================================================================
  {
    id: 'tpl-a03-visualisierung',
    code: 'A03',
    category: 'contracts',
    tags: ['3D', 'CGI', 'Rendering', 'Animation', 'Korrekturschleifen'],
    estimatedMinutes: 10,
    title: {
      de: 'A03 3D-Visualisierungs- & Renderingvertrag',
      en: 'A03 3D Visualization & CGI Rendering Contract'
    },
    description: {
      de: 'Vertrag für fotorealistische Architektur-Renderings, 3D-Animationen, Perspektiven und digitale Modelle inklusive Korrekturschleifen.',
      en: 'Agreement for photorealistic architectural renderings, 3D CGI animations, camera angles, and digital assets.'
    },
    recommendedSettings: {
      showSignatures: true,
      clientSignatoryLabel: {
        de: 'Auftraggeber (Kunde)',
        en: 'Client (Principal)'
      },
      contractorSignatoryLabel: {
        de: 'Auftragnehmer (3D Studio)',
        en: 'Contractor (3D CGI Studio)'
      }
    },
    content: {
      de: `VERTRAG FÜR 3D-VISUALISIERUNGEN & DIGITALE RENDERINGS
Ref-Nr.: {{project.number}} | Projekt: {{project.name}}

PARTEIEN

Auftragnehmer (3D Studio / Visualisierung):
{{company.name}}
{{company.address}}, {{company.zipCity}}
E-Mail: {{company.email}} | UID: {{company.vatNumber}}

und

Auftraggeber:
{{client.company}}
z. Hd. {{client.name}}
{{client.address}}, {{client.zipCity}}

1. LEISTUNGSGEGENSTAND & LIEFERUMFANG
Der Auftragnehmer erstellt auf Basis der überlassenen CAD-/BIM-Plandaten fotorealistische 3D-Visualisierungen für:
Projekt: {{project.name}}
Lieferbestandteile:
• Hochauflösende Still-Renderings (Auflösung mind. 4K / 3840×2160 px, Print-tauglich 300 DPI)
• Festlegung von Kamerapositionen, Tageslichtstimmung, Staffage (Möblierung, Personen, Bepflanzung)
• Ausgabeformate: TIFF / PNG (16-Bit) sowie weboptimierte Formate (JPEG/WebP)

2. KORREKTURSCHLEIFEN & ABNAHMEPROZESS
Im vereinbarten Pauschalhonorar sind pro Perspektive genau ZWEI (2) iterative Korrekturschleifen enthalten:
• Korrekturlauf 1 (Clay/White-Model): Freigabe von Blickwinkel, Geometrie und Brennweite.
• Korrekturlauf 2 (Farbe/Material/Licht): Freigabe von Texturen, Lichtstimmung und Staffage.
Nachträgliche architektonische Umplanungen nach bereits erfolgter Geometriefreigabe werden nach vorheriger Mitteilung nach Aufwand verrechnet.

3. DATENÜBERGABE & NATIVE DATEN
Der Auftraggeber erhält die finalen gerenderten Bilddateien. Ein Anspruch auf Herausgabe der nativen Quelldaten (3D-Szenendateien, Shader-Netzwerke, Roh-Texturen) besteht nicht, sofern dies nicht gesondert schriftlich vereinbart und vergütet wurde.

4. VERGÜTUNG
Das vereinbarte Honorar beträgt pauschal {{currency}} {{project.budget}} zzgl. MWST. Zahlbar netto innert 14 Tagen nach Auslieferung der finalen Bilddaten.

5. GERICHTSSTAND
Ausschliesslicher Gerichtsstand für alle Streitigkeiten ist {{jurisdiction}}.`,
      en: `3D ARCHITECTURAL VISUALIZATION & CGI SERVICES CONTRACT
Ref No.: {{project.number}} | Project: {{project.name}}

PARTIES

Contractor (3D CGI Studio):
{{company.name}}
{{company.address}}, {{company.zipCity}}
Email: {{company.email}} | VAT: {{company.vatNumber}}

and

Client (Principal):
{{client.company}}
Attn: {{client.name}}
{{client.address}}, {{client.zipCity}}

1. SCOPE OF SERVICES & DELIVERABLES
Based on provided CAD/BIM data, the Contractor shall produce photorealistic 3D architectural imagery for:
Project Name: {{project.name}}
Deliverables:
• High-resolution still renderings (minimum 4K / 3840×2160 px, print-ready 300 DPI)
• Composition of camera angles, sunlight orientation, materials, and digital entourage
• File delivery formats: Master TIFF / PNG (16-Bit) plus optimized web assets (JPEG/WebP)

2. REVISION ROUNDS & APPROVAL PROCESS
Each camera viewpoint includes exactly TWO (2) revision stages:
• Revision Stage 1 (Clay / Wireframe Preview): Approval of camera view, field of view, and architecture model.
• Revision Stage 2 (Color, Lighting & Entourage): Approval of materials, reflections, greenery, and lighting mood.
Architectural design alterations requested after geometry lock shall be billed separately at standard hourly rates upon notification.

3. SOURCE FILES & ASSET DELIVERY
The Client receives the final rendered image files. There is no entitlement to native 3D source scenes, lighting setups, or proprietary shader graphs unless explicitly agreed upon in writing for a buyout fee.

4. REMUNERATION
The agreed fee is {{currency}} {{project.budget}} net plus statutory VAT. Invoices are payable within 14 days of final image transmission.

5. JURISDICTION
Exclusive legal jurisdiction for all disputes shall be {{jurisdiction}}.`
    }
  },

  // ==========================================================================
  // A06: Werkvertrag & Bauleistungen (SIA 118)
  // ==========================================================================
  {
    id: 'tpl-a06-werkvertrag',
    code: 'A06',
    category: 'contracts',
    tags: ['Werkvertrag', 'SIA 118', 'Handwerker', 'Unternehmer', 'OR 363'],
    estimatedMinutes: 15,
    title: {
      de: 'A06 Werkvertrag für Bau- & Montageleistungen (SIA 118)',
      en: 'A06 Construction Works & Installation Agreement (SIA 118)'
    },
    description: {
      de: 'Klassischer Schweizer Werkvertrag nach SIA 118 und OR 363 für Bauhandwerker, Messebauer, Schreinereien und Unternehmer.',
      en: 'Standard Swiss construction works contract compliant with SIA 118 and Swiss CO 363 for contractors and trades.'
    },
    recommendedSettings: {
      showSignatures: true,
      clientSignatoryLabel: {
        de: 'Bauherr / Auftraggeber',
        en: 'Principal / Client'
      },
      contractorSignatoryLabel: {
        de: 'Unternehmer / Handwerker',
        en: 'Contractor / Fabricator'
      }
    },
    content: {
      de: `WERKVERTRAG FÜR BAU-, AUSBAU- & MONTAGELEISTUNGEN (SIA 118)
Ref-Nr.: {{project.number}} | Projekt: {{project.name}}

PARTEIEN

Auftraggeber (Bauherrschaft / Bauleitung):
{{company.name}} (handelnd im Auftrag der Bauherrschaft)
{{company.address}}, {{company.zipCity}}

und

Unternehmer (Werkauftragnehmer):
{{client.company}}
z. Hd. {{client.name}}
{{client.address}}, {{client.zipCity}}

1. WERKVERTRAGSGEGENSTAND
Der Unternehmer verpflichtet sich zur fachgerechten, mangelfreien und termingetreuen Erstellung des folgenden Werkes:
Projekt: {{project.name}}
Ausführungsort: {{project.siteLocation}}
Gewerke / Leistungen: Ausführung gemäss Leistungsverzeichnis, Werkplänen und beiliegendem Angebot.

2. RECHTSGRUNDLAGEN (SIA 118)
Für diesen Werkvertrag gelten als verbindliche Vertragsbestandteile in folgender Rangfolge:
1. Dieser Werkvertrags-Haupttext
2. Die Baubeschriebe, Pläne und Leistungsverzeichnisse
3. Die SIA-Norm 118 „Allgemeine Bedingungen für Bauarbeiten“ (Ausgabe 2013)
4. Die einschlägigen fachtechnischen SIA-Normen für das betreffende Gewerk
5. Die Bestimmungen des Schweizerischen Obligationenrechts (OR Art. 363 ff.)

3. VERTRAGSSUMME & PREISBASIS
Als Werklohn wird vereinbart:
Werkvertragssumme netto: {{currency}} {{project.budget}}
MWST: Gesetzlicher Satz
Werkvertragssumme brutto: Inkl. MWST
Die vereinbarten Preise sind Festpreise bis zur vollständigen Fertigstellung und formellen Abnahme des Werkes. Teuerungen sind ausgeschlossen.

4. AUSFÜHRUNGSFRISTEN & VERZUG
Baubeginn: Gemäss Freigabe der Bauleitung
Fertigstellung / Abnahmebereit: Gemäss verbindlichem Bauprogramm
Gerät der Unternehmer in Verzug, hat die Bauleitung das Recht, nach schriftlicher Mahnung und Fristansetzung Ersatzvornahmen auf Kosten des Unternehmers zu veranlassen.

5. ABNAHME, MÄNGELRÜGE & GARANTIEFRISTEN
• Die Abnahme erfolgt nach Fertigstellung formell mittels gemeinsamem Abnahmeprotokoll (SIA 118 Art. 157 ff.).
• Rügefrist für offene Mängel: 2 Jahre ab Datum der formellen Abnahme (Art. 172 SIA 118). Während dieser Zeit können Mängel jederzeit gerügt werden.
• Verjährungsfrist für verdeckte Mängel: 5 Jahre (Art. 180 SIA 118).
• Sicherheitsleistung: Der Unternehmer stellt bei Schlussrechnung eine 10 %ige Bank- oder Versicherungsgarantie für die 2-jährige Rügefrist.

6. GERICHTSSTAND
Ausschliesslicher Gerichtsstand ist {{jurisdiction}}.`,
      en: `CONSTRUCTION & INSTALLATION WORKS CONTRACT (SIA 118)
Ref No.: {{project.number}} | Project: {{project.name}}

PARTIES

Principal / Client:
{{company.name}}
{{company.address}}, {{company.zipCity}}

and

Contractor (Works Fabricator):
{{client.company}}
Attn: {{client.name}}
{{client.address}}, {{client.zipCity}}

1. SCOPE OF WORKS
The Contractor undertakes to construct, deliver, and install the specified trade works defect-free and on schedule:
Project: {{project.name}}
Construction Site: {{project.siteLocation}}
Trade Scope: Execution in accordance with specifications, detail drawings, and verified bid.

2. HIERARCHY OF GOVERNING STANDARDS (SIA 118)
The following documents constitute the contract in descending order of precedence:
1. This main contract text
2. Trade specifications and construction drawings
3. SIA Standard 118 "General Conditions for Construction"
4. Applicable SIA technical standards for the specific trade
5. Swiss Code of Obligations (Art. 363 et seq. Swiss CO)

3. CONTRACT PRICE
Agreed contract sum net: {{currency}} {{project.budget}}
Statutory VAT: Added at standard Swiss rate
The agreed prices are fixed lump sums until final formal handover and acceptance. Inflation adjustments are excluded.

4. SCHEDULE & LIQUIDATED DAMAGES
Commencement: Upon notice to proceed from Site Supervision
Completion: According to approved general construction schedule
Should the Contractor fall behind schedule without justifiable hindrance, the Principal reserves the right to commission third-party execution at the Contractor's expense.

5. ACCEPTANCE, NOTICE OF DEFECTS & WARRANTY (SIA 118)
• Handover shall be formalized via a joint SIA 118 Acceptance Protocol.
• 2-Year Open Defects Warranty Period: Defects can be notified at any point during the 2 years following handover.
• 5-Year Latent Defects Statute of Limitations.
• Warranty Retention / Bond: 10% performance bond covering the initial 2-year warranty period.

6. PLACE OF JURISDICTION
Exclusive legal jurisdiction is {{jurisdiction}}.`
    }
  },

  // ==========================================================================
  // A11: Nutzungsrechte- & Buyout-Vereinbarung
  // ==========================================================================
  {
    id: 'tpl-a11-buyout',
    code: 'A11',
    category: 'rights_ai',
    tags: ['Urheberrecht', 'Buyout', 'Lizenzen', 'Medienrechte'],
    estimatedMinutes: 8,
    title: {
      de: 'A11 Nutzungsrechte- & Buyout-Vereinbarung',
      en: 'A11 Copyright, Licensing & Buyout Agreement'
    },
    description: {
      de: 'Präzise Festlegung von räumlichen, zeitlichen und medialen Nutzungsrechten sowie Full Buyout Konditionen.',
      en: 'Defines precise territorial, temporal, and media usage licenses, as well as full buyout terms.'
    },
    recommendedSettings: {
      showSignatures: true
    },
    content: {
      de: `ZUSATZVEREINBARUNG: NUTZUNGSRECHTE, LIZENZEN & BUYOUT
Ref-Nr.: {{project.number}} | Projekt: {{project.name}}

PARTEIEN
Lizenzgeber (Urheber / Designer): {{company.name}}, {{company.zipCity}}
Lizenznehmer (Auftraggeber): {{client.company}}, {{client.zipCity}}

1. GEGENSTAND DER LIZENZIERUNG
Gegenstand dieser Vereinbarung sind die im Rahmen des Projekts „{{project.name}}“ geschaffenen Entwürfe, Pläne, 3D-Modelle, Renderings und Grafiken (nachfolgend „Werke“).

2. GEWÄHRTER NUTZUNGSUMFANG
Der Lizenzgeber räumt dem Lizenznehmer folgende Nutzungsrechte ein:
• Räumlicher Geltungsbereich: Weltweit (alternativ: DACH-Region)
• Zeitlicher Geltungsbereich: Zeitlich unbeschränkt ab vollständiger Honorarbezahlung
• Mediale Nutzung: Print, Website, Social Media, PR, Ausstellungsbegleitmedien und Messepräsenz
• Bearbeitungsrechte: Der Lizenznehmer darf die Werke für den vereinbarten Zweck im Rahmen des Projektes nutzen; eine Entstellung oder Weitergabe von bearbeitbaren Rohdaten an Dritte bedarf der schriftlichen Zustimmung.

3. FULL BUYOUT (OPTIONAL)
Wurde ein vollumfänglicher Buyout vereinbart, erwirbt der Lizenznehmer das ausschliessliche, weltweite und zeitlich unbegrenzte Recht, das Werk in allen Medien und Sprachen uneingeschränkt kommerziell zu nutzen und weiterzuentwickeln.

4. URHEBERBEZEICHNUNG & EIGENWERBUNG
Der Lizenzgeber hat das Recht, bei Veröffentlichungen namentlich als Urheber genannt zu werden („Design/Konzept: {{company.name}}“). Der Lizenzgeber darf die fertigen Werke zeitlich unbeschränkt für die eigene Firmen-Dokumentation, Website, Social Media und Kundenpräsentationen nutzen.

5. GERICHTSSTAND
Gerichtsstand ist {{jurisdiction}}.`,
      en: `ADDENDUM: INTELLECTUAL PROPERTY, LICENSING & BUYOUT
Ref No.: {{project.number}} | Project: {{project.name}}

PARTIES
Licensor (Creator / Designer): {{company.name}}, {{company.zipCity}}
Licensee (Client): {{client.company}}, {{client.zipCity}}

1. LICENSED ASSETS
This addendum governs the usage rights for all designs, concepts, drawings, 3D models, and visual media created under project "{{project.name}}".

2. SCOPE OF LICENSE
Upon full settlement of all associated invoices, the Licensor grants the Licensee:
• Territorial Scope: Worldwide (or DACH region)
• Temporal Scope: Perpetual from the date of final payment
• Permitted Channels: Digital (web, social), print media, event displays, PR publications
• Modifications: Adaptation rights are limited to the designated project scope; distributing editable master project files to third parties requires prior written authorization.

3. FULL BUYOUT OPTION
Where a full buyout is formally contracted, the Licensee secures exclusive, unrestricted worldwide rights to exploit and adapt the creative assets across all commercial channels.

4. CREDITS & SELF-PROMOTION
The Licensor retains the right to be credited in publications ("Design & Architecture: {{company.name}}") and may utilize documentation of the completed work for portfolio, social, and marketing purposes.

5. JURISDICTION
Governed by Swiss law, exclusive place of jurisdiction is {{jurisdiction}}.`
    }
  },

  // ==========================================================================
  // A12: KI- & Digital-Workflow-Zusatzvereinbarung
  // ==========================================================================
  {
    id: 'tpl-a12-ai-clause',
    code: 'A12',
    category: 'rights_ai',
    tags: ['Künstliche Intelligenz', 'AI', 'Generativ', 'Datenschutz', 'Urheberrecht'],
    estimatedMinutes: 6,
    title: {
      de: 'A12 KI- & Generative-Tools-Zusatzvereinbarung',
      en: 'A12 AI & Generative Workflows Addendum'
    },
    description: {
      de: 'Transparente Regelung über den Einsatz generativer KI-Tools (Gemini, Midjourney, Fal.ai etc.) im Entwurfsprozess.',
      en: 'Transparent terms governing the deployment of generative AI tools in creative and design workflows.'
    },
    recommendedSettings: {
      showSignatures: true
    },
    content: {
      de: `ZUSATZVEREINBARUNG: EINSATZ GENERATIVER KÜNSTLICHER INTELLIGENZ (KI)
Ref-Nr.: {{project.number}} | Projekt: {{project.name}}

PARTEIEN
Auftragnehmer: {{company.name}}, {{company.zipCity}}
Auftraggeber: {{client.company}}, {{client.zipCity}}

1. PRÄAMBEL & TRANSPARENZ
Die Parteien vereinbaren moderne, transparente Leitplanken für den produktiven Einsatz moderner KI-gestützter Werkzeuge im Rahmen des Projektes „{{project.name}}“.

2. ZULÄSSIGER EINSATZBEREICH
Der Auftragnehmer ist berechtigt, KI-Systeme (z. B. für Moodboarding, Konzept-Ideation, Bildoptimierung, Code-Generierung oder Textstrukturierung) als unterstützendes Assistenzwerkzeug einzusetzen. 
Sämtliche KI-generierten Entwürfe und Berechnungen werden vor Weiterleitung an den Auftraggeber einer qualifizierten menschlichen Fachprüfung („Human-in-the-Loop“) unterzogen.

3. DATENSCHUTZ & VERTRAULICHKEIT
Der Auftragnehmer stellt sicher, dass keine vertraulichen Kundendaten, Geschäftsgeheimnisse oder personenbezogene Daten in offene, öffentlich lernende KI-Modelle eingespeist werden. Es kommen ausschliesslich sichere Unternehmens-APIs mit vertraglich zugesichertem Opt-out für KI-Modelltraining zur Anwendung.

4. URHEBERRECHTLICHE EINSTUFUNG & HAFTUNG
Beide Parteien sind sich bewusst, dass rein maschinell ohne menschliche Schöpfungshöhe generierte Einzelteile nach aktuellem Recht gemeinfrei sein können. Der Auftragnehmer gewährleistet, dass das finale Gesamtwerk durch menschliche gestalterische Selektion, Überarbeitung und Komposition die erforderliche Schöpfungshöhe aufweist.

5. GERICHTSSTAND
Es gilt Schweizer Recht. Gerichtsstand ist {{jurisdiction}}.`,
      en: `ADDENDUM: DEPLOYMENT OF GENERATIVE ARTIFICIAL INTELLIGENCE (AI)
Ref No.: {{project.number}} | Project: {{project.name}}

PARTIES
Contractor: {{company.name}}, {{company.zipCity}}
Client: {{client.company}}, {{client.zipCity}}

1. PREAMBLE & PRINCIPLES
The parties agree on professional standards regarding the deployment of generative artificial intelligence tools for project "{{project.name}}".

2. PERMISSIBLE SCOPE OF DEPLOYMENT
The Contractor is authorized to utilize AI tools for exploratory ideation, atmospheric moodboards, image enhancement, and computational structuring. 
All AI-assisted deliverables are subject to rigorous human review and engineering verification ("Human-in-the-Loop") prior to submission.

3. DATA PRIVACY & CONFIDENTIALITY
The Contractor guarantees that proprietary Client data, trade secrets, and personally identifiable information (PII) will not be uploaded to public AI training datasets. Exclusively enterprise-grade APIs with data retention opt-outs are utilized.

4. COPYRIGHT & LIABILITY DISCLAIMER
The parties acknowledge evolving legal frameworks regarding computer-generated outputs. The Contractor ensures that final deliverables represent human creative direction, synthesis, and artistic curation, qualifying for standard intellectual property protections.

5. JURISDICTION
Governed by Swiss law, exclusive place of jurisdiction is {{jurisdiction}}.`
    }
  },

  // ==========================================================================
  // B01: Honorar- & Meilensteinvereinbarung (SIA 102)
  // ==========================================================================
  {
    id: 'tpl-b01-honorar',
    code: 'B01',
    category: 'fees',
    tags: ['Honorar', 'SIA 102', 'Zahlungsplan', 'Meilensteine', 'BKP 29'],
    estimatedMinutes: 10,
    title: {
      de: 'B01 Honorar- & Zahlungsplan-Vereinbarung (SIA 102)',
      en: 'B01 Fee Schedule & Milestone Payment Agreement (SIA 102)'
    },
    description: {
      de: 'Strukturierte Honorarvereinbarung gegliedert nach SIA-Phasen mit verbindlichem Meilenstein-Zahlungsplan.',
      en: 'Structured architectural fee agreement organized by SIA phases with milestone-based invoicing terms.'
    },
    recommendedSettings: {
      showSignatures: true
    },
    content: {
      de: `HONORARVEREINBARUNG & MEILENSTEIN-ZAHLUNGSPLAN (SIA 102)
Ref-Nr.: {{project.number}} | Projekt: {{project.name}}

PARTEIEN
Planer / Auftragnehmer: {{company.name}}, {{company.zipCity}}
Bauherr / Auftraggeber: {{client.company}}, {{client.zipCity}}

1. HONORARBASIS
Für die Erbringung der vereinbarten Architektur- und Planerleistungen wird ein Honorar vereinbart von:
Gesamthonorar netto: {{currency}} {{project.budget}}
MWST (aktueller Satz): Gesetzlich geschuldet
Zahlungsziel: Rein netto innert 30 Tagen ab Rechnungsdatum.

2. PHASENGLIEDERUNG & TEILHONORARE (SIA 102)
Das Honorar verteilt sich prozentual wie folgt auf die Leistungsphasen:
• Phase 31 Vorprojekt: 15 %
• Phase 32 Bauprojekt & Bewilligungsverfahren: 20 %
• Phase 41 Ausschreibung & Vergabe: 15 %
• Phase 51 Ausführungsplanung: 25 %
• Phase 52 Ausführung & Bauleitung: 20 %
• Phase 53 Abschluss & Garantieabnahme: 5 %

3. ZAHLUNGSPLAN NACH MEILENSTEINEN
Die Rechnungsstellung erfolgt in Tranchen nach Erreichen folgender überprüfbarer Meilensteine:
1. Akonto bei Arbeitsbeginn: 20 %
2. Nach Einreichung des Baugesuchs / Bewilligung: 20 %
3. Nach Abschluss der Ausschreibungen und Vergaben: 20 %
4. Nach Rohbauvollendung: 20 %
5. Nach Bezug / Abnahme der Ausführung: 15 %
6. Schlussrechnung nach Revisionsaktenübergabe: 5 %

4. ZUSATZLEISTUNGEN & REGIEANSÄTZE
Leistungen infolge von Projektänderungen auf Wunsch des Auftraggebers werden nach folgenden Stundenansätzen abgerechnet:
• Projektleitung / Senior Architekt: CHF 190.00 / h
• Architekt / Fachplaner: CHF 160.00 / h
• Zeichner / BIM-Konstrukteur: CHF 130.00 / h

5. GERICHTSSTAND
Gerichtsstand ist {{jurisdiction}}.`,
      en: `FEE SCHEDULE & MILESTONE PAYMENT TERMS (SIA 102)
Ref No.: {{project.number}} | Project: {{project.name}}

PARTIES
Planner: {{company.name}}, {{company.zipCity}}
Client: {{client.company}}, {{client.zipCity}}

1. REMUNERATION SUMMARY
Total net planning fee: {{currency}} {{project.budget}}
Statutory VAT: Added at standard rate
Payment Terms: Net 30 days from invoice date.

2. ALLOCATION ACROSS SIA 102 STANDARD PHASES
• Phase 31 Schematic Design: 15%
• Phase 32 Permitting & Design Development: 20%
• Phase 41 Tendering & Contractor Selection: 15%
• Phase 51 Working Drawings & Documentation: 25%
• Phase 52 Construction Administration: 20%
• Phase 53 Closeout & Final Commissioning: 5%

3. MILESTONE INVOICING SCHEDULE
Invoicing occurs progressively upon achieving verified project stages:
1. Mobilization / Retainer: 20%
2. Permit submission approval: 20%
3. Completion of trade procurement: 20%
4. Structural completion (topping out): 20%
5. Formal occupancy handover: 15%
6. Final reconciliation & documentation: 5%

4. HOURLY RATES FOR EXTRA SCOPE
Additional services requested outside the agreed scope are billed at:
• Project Director / Principal: CHF 190.00 / h
• Architect / Lead Planner: CHF 160.00 / h
• BIM Modeler / Draftsperson: CHF 130.00 / h

5. JURISDICTION
Exclusive place of jurisdiction is {{jurisdiction}}.`
    }
  },

  // ==========================================================================
  // E02: Formelles Abnahmeprotokoll (SIA 118)
  // ==========================================================================
  {
    id: 'tpl-e02-abnahme',
    code: 'E02',
    category: 'execution',
    tags: ['Abnahme', 'SIA 118', 'Mängel', 'Übergabe', 'Garantie'],
    estimatedMinutes: 12,
    title: {
      de: 'E02 Formelles Abnahmeprotokoll (SIA 118)',
      en: 'E02 Formal Acceptance & Handover Protocol (SIA 118)'
    },
    description: {
      de: 'Rechtsverbindliches Abnahmeprotokoll nach Art. 157 ff. SIA 118 mit Einstufung mängelfrei / mit Mängeln / verweigert.',
      en: 'Legally binding acceptance protocol pursuant to SIA 118 Art. 157 et seq. with clear defect classification.'
    },
    recommendedSettings: {
      showSignatures: true,
      clientSignatoryLabel: {
        de: 'Bauherrschaft / Auftraggeber',
        en: 'Client / Building Owner'
      },
      contractorSignatoryLabel: {
        de: 'Bauleitung / Unternehmer',
        en: 'Site Supervisor / Contractor'
      }
    },
    content: {
      de: `FORMELLES ABNAHMEPROTOKOLL GEMÄSS SIA 118 (ART. 157 FF.)
Ref-Nr.: {{project.number}} | Datum der Begehung: {{date}}

PROJEKTDATEN & ORT
Projekt: {{project.name}}
Objektstandort: {{project.siteLocation}}
Abzunehmendes Gewerk / Bereich: Gesamtabnahme / Gewerke gemäss Vergabe

ANWESENDE BEI DER BEGEHUNG
Für die Bauherrschaft: {{client.name}} ({{client.company}})
Für die Bauleitung: {{company.name}}
Für den Unternehmer / Handwerker: _______________________________

1. BEFUND DER GEMEINSAMEN PRÜFUNG
Die Parteien haben das Werk am heutigen Tag gemeinsam begangen und geprüft. Der Zustand wird wie folgt formell festgestellt:

[  ] VARIANTE A: MÄNGELFREIE ABNAHME
Das Werk wird als vertragsgemäss und vollständig mängelfrei abgenommen. Die 2-jährige Rügefrist (Art. 172 SIA 118) beginnt mit dem heutigen Datum.

[ X ] VARIANTE B: ABNAHME MIT VORBEHALT / MÄNGELN (REGELFALL)
Das Werk ist im Wesentlichen vertragsgemäss und gebrauchstauglich. Es wird abgenommen unter dem Vorbehalt der Behebung der im Mängelverzeichnis aufgelisteten Mängel.

[  ] VARIANTE C: ABNAHME VERWEIGERT (WESENTLICHE MÄNGEL)
Wegen wesentlicher, die Gebrauchstauglichkeit beeinträchtigender Mängel wird die Abnahme verweigert. Ein neuer Abnahmetermin wird nach Mängelbeseitigung vereinbart.

2. MÄNGELPROTOKOLL & BESEITIGUNGSFRISTEN
Folgende Mängel sind bis spätestens zu den genannten Fristen durch den Unternehmer kostenlos zu beheben:
Pos. 1: _________________________________________ Frist: ______________
Pos. 2: _________________________________________ Frist: ______________
Pos. 3: _________________________________________ Frist: ______________

3. GARANTIEFRISTEN & SICHERHEITSLEISTUNG
• 2-jährige Rügefrist (SIA 118 Art. 172): Läuft ab dem heutigen Datum bis zum: {{date}} + 2 Jahre
• 5-jährige Verjährungsfrist für verdeckte Mängel (Art. 180 SIA 118): Läuft bis zum: {{date}} + 5 Jahre
• Die Schlusszahlung wird erst nach schriftlicher Bestätigung der Mängelfreistellung fällig.

Ort, Datum: {{company.city}}, den {{date}}`,
      en: `FORMAL CONSTRUCTION ACCEPTANCE PROTOCOL (SIA 118, ART. 157 ET SEQ.)
Ref No.: {{project.number}} | Inspection Date: {{date}}

PROJECT IDENTIFICATION & VENUE
Project Name: {{project.name}}
Site Location: {{project.siteLocation}}
Scope / Trades to be accepted: Comprehensive Handover according to specs

PARTICIPANTS PRESENT AT INSPECTION
For the Client / Owner: {{client.name}} ({{client.company}})
For Site Supervision: {{company.name}}
For the Contractor / Trade: _______________________________

1. FORMAL INSPECTION FINDINGS
The parties inspected the works jointly today. The legal status is determined as follows:

[  ] OPTION A: ACCEPTANCE WITHOUT DEFECTS
The works are accepted in full conformity with specifications. The 2-year warranty notification period commences as of today.

[ X ] OPTION B: ACCEPTANCE WITH DEFECTS (STANDARD)
The works are substantially completed and fit for purpose. Acceptance is granted subject to prompt rectification of items noted below.

[  ] OPTION C: ACCEPTANCE REJECTED (MATERIAL DEFECTS)
Due to substantial defects, formal acceptance is rejected. A secondary inspection date shall be set following remediation.

2. PUNCH LIST & RECTIFICATION DEADLINES
The Contractor shall remedy the following items free of charge by the specified deadlines:
Item 1: _________________________________________ Deadline: ______________
Item 2: _________________________________________ Deadline: ______________
Item 3: _________________________________________ Deadline: ______________

3. WARRANTY TIMELINES & RETENTION
• 2-Year Open Defects Period: Effective from inspection date until: {{date}} + 2 years
• 5-Year Latent Defects Statute of Limitations: Effective until: {{date}} + 5 years
• Final retention release is conditioned upon written sign-off of defect rectification.

Location & Date: {{company.city}}, {{date}}`
    }
  },

  // ==========================================================================
  // E03: Mängelrüge mit Fristansetzung
  // ==========================================================================
  {
    id: 'tpl-e03-maengelruege',
    code: 'E03',
    category: 'execution',
    tags: ['Mängelrüge', 'SIA 118', 'Fristansetzung', 'Nachbesserung'],
    estimatedMinutes: 6,
    title: {
      de: 'E03 Formelle Mängelrüge mit Fristansetzung (SIA 118)',
      en: 'E03 Formal Notice of Defects & Rectification Notice (SIA 118)'
    },
    description: {
      de: 'Rechtssichere Mängelrüge an Handwerker mit Nachbesserungsfrist und Androhung von Ersatzvornahme gemäss SIA 118.',
      en: 'Formal notice of defects to contractors demanding rectification with statutory deadline under SIA 118.'
    },
    recommendedSettings: {
      showSignatures: true
    },
    content: {
      de: `FORMELLE MÄNGELRÜGE GEMÄSS ART. 160 FF. SIA 118
Einschreiben / Elektronische Zustellung

An Unternehmer:
{{client.company}}
z. Hd. {{client.name}}
{{client.address}}, {{client.zipCity}}

Absender / Bauleitung:
{{company.name}}
{{company.address}}, {{company.zipCity}}

Datum: {{date}}
Betrifft: Mängelrüge & Nachbesserungsaufforderung | Projekt: {{project.name}}
Liegenschaft: {{project.siteLocation}}

Sehr geehrte Damen und Herren,

bei der laufenden Bauüberwachung / im Rahmen der zweijährigen Rügefrist gemäss SIA 118 wurden an den von Ihnen ausgeführten Arbeiten folgende Mängel festgestellt:

MÄNGELBESCHREIBUNG:
1. [Genaue Bezeichnung des Mangels und Raum/Achse]
2. [Soll-Zustand gemäss Werkvertrag und Plandaten]
3. [Fotodokumentation / Verweis auf Mängelticket Nr. ...]

AUFFORDERUNG ZUR NACHBESSERUNG MIT FRIST:
Wir fordern Sie hiermit formell auf, die gerügten Mängel fachgerecht und für den Auftraggeber kostenlos zu beheben. 

Als verbindliche Frist für die Mängelbeseitigung setzen wir fest:
Fristtermin: ____________________ (spätestens 10 Arbeitstage ab Erhalt)

RECHTLICHE HINWEISE:
Sollte die Nachbesserung bis zum Ablauf dieser Frist nicht oder nicht fachgerecht erfolgt sein, behält sich die Bauherrschaft ausdrücklich vor, ohne weitere Mahnung gemäss Art. 169 SIA 118 auf Ihre Kosten eine Ersatzvornahme durch ein Drittunternehmen zu veranlassen oder den Werklohn entsprechend zu mindern.

Freundliche Grüsse,

{{company.name}}
Bauleitung & Architektur`,
      en: `FORMAL NOTICE OF DEFECTS ACCORDING TO SIA 118 (ART. 160 ET SEQ.)
Registered Mail / Electronic Delivery

To Contractor:
{{client.company}}
Attn: {{client.name}}
{{client.address}}, {{client.zipCity}}

From (Site Supervision):
{{company.name}}
{{company.address}}, {{company.zipCity}}

Date: {{date}}
Subject: Formal Notice of Defects & Demand for Rectification | Project: {{project.name}}
Site: {{project.siteLocation}}

Dear Sir or Madam,

During ongoing construction quality control / within the 2-year warranty notification period pursuant to SIA 118, the following deficiencies have been identified in your executed works:

DEFECT PARTICULARS:
1. [Specific description of defect, room, axis or location]
2. [Deviations from contracted architectural specifications]
3. [Reference to photo evidence / defect ticket #...]

DEMAND FOR REMEDIATION & DEADLINE:
We hereby formally demand that you rectify the above deficiencies in a workmanlike manner and without expense to the Client.

The mandatory deadline for complete rectification is set as:
Final Deadline: ____________________ (within 10 business days of receipt)

LEGAL ADVICE:
Should rectification not be completed satisfactorily by the designated deadline, the Principal reserves the right under SIA 118 Art. 169 to commission third-party execution at your expense or deduct damages from outstanding payments.

Sincerely,

{{company.name}}
Site Architecture & Project Management`
    }
  },

  // ==========================================================================
  // A14: Geheimhaltungsvereinbarung (NDA)
  // ==========================================================================
  {
    id: 'tpl-a14-nda',
    code: 'A14',
    category: 'rights_ai',
    tags: ['NDA', 'Geheimhaltung', 'Datenschutz', 'Vertraulichkeit'],
    estimatedMinutes: 6,
    title: {
      de: 'A14 Geheimhaltungsvereinbarung (NDA)',
      en: 'A14 Non-Disclosure Agreement (NDA)'
    },
    description: {
      de: 'Schutz von vertraulichen Entwürfen, Konzepten, Budgets und Plänen vor Angebotsabgabe und Projektstart.',
      en: 'Protects confidential architectural designs, concepts, budgets, and proprietary data prior to project kickoff.'
    },
    recommendedSettings: {
      showSignatures: true
    },
    content: {
      de: `GEHEIMHALTUNGSVEREINBARUNG (NON-DISCLOSURE AGREEMENT)
Ref-Nr.: {{project.number}} | Projekt: {{project.name}}

PARTEIEN
Partei 1 (Offenlegende Partei): {{company.name}}, {{company.address}}, {{company.zipCity}}
Partei 2 (Empfangende Partei): {{client.company}}, {{client.address}}, {{client.zipCity}}

1. ZWECK DER ZUSAMMENARBEIT
Die Parteien beabsichtigen eine Zusammenarbeit im Rahmen des Projektes „{{project.name}}“. Hierzu ist der Austausch vertraulicher geschäftlicher, technischer, gestalterischer und kalkulatorischer Informationen erforderlich.

2. VERTRAULICHE INFORMATIONEN
Als vertraulich gelten sämtliche mündlich, schriftlich oder digital übermittelten Daten, insbesondere Pläne, 3D-Modelle, Moodboards, Budgetkalkulationen, Kundenlisten und Betriebskonzepte.

3. GEHEIMHALTUNGSPFLICHTEN
Die empfangende Partei verpflichtet sich:
• Die Informationen streng vertraulich zu behandeln und ausschliesslich für den vereinbarten Zweck zu verwenden.
• Vertrauliche Informationen nicht ohne vorherige schriftliche Zustimmung an Dritte weiterzugeben.
• Geeignete technische und organisatorische Sicherheitsmassnahmen gegen unbefugten Zugriff zu treffen.

4. DAUER DER GEHEIMHALTUNG
Die Geheimhaltungspflicht beginnt mit Unterzeichnung und gilt für die Dauer von DREI (3) Jahren über die Beendigung der Zusammenarbeit hinaus.

5. GERICHTSSTAND
Es gilt Schweizer Recht. Gerichtsstand ist {{jurisdiction}}.`,
      en: `MUTUAL NON-DISCLOSURE AGREEMENT (NDA)
Ref No.: {{project.number}} | Project: {{project.name}}

PARTIES
Disclosing Party: {{company.name}}, {{company.address}}, {{company.zipCity}}
Receiving Party: {{client.company}}, {{client.address}}, {{client.zipCity}}

1. PURPOSE
The parties are exploring business cooperation in connection with "{{project.name}}", requiring the exchange of sensitive commercial, architectural, and financial information.

2. CONFIDENTIAL INFORMATION
Confidential information encompasses all plans, 3D assets, cost budgets, contractor bids, and strategic concept data communicated directly or digitally.

3. OBLIGATIONS OF CONFIDENTIALITY
The Receiving Party agrees to:
• Treat all proprietary disclosures with strict confidentiality.
• Restrict disclosure exclusively to employees and advisers with a strict need-to-know.
• Refrain from reproducing or reverse-engineering proprietary design assets without prior written authorization.

4. TERM
This obligation shall remain binding for a period of THREE (3) years following the conclusion of project discussions.

5. GOVERNING LAW & VENUE
Governed by Swiss law, exclusive place of jurisdiction is {{jurisdiction}}.`
    }
  }
];

export const TEMPLATE_CATEGORIES = [
  { id: 'all', labelDe: 'Alle Vorlagen', labelEn: 'All Templates' },
  { id: 'contracts', labelDe: 'Verträge (A-Reihe)', labelEn: 'Contracts (A-Series)' },
  { id: 'fees', labelDe: 'Honorare & Finanzen (B)', labelEn: 'Fees & Finance (B)' },
  { id: 'execution', labelDe: 'Bauleitung & Abnahme (E)', labelEn: 'Execution & Handover (E)' },
  { id: 'rights_ai', labelDe: 'Rechte & KI (A11/A12)', labelEn: 'Rights, IP & AI' }
];
