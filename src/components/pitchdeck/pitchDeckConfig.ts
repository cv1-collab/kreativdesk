import type { ProposalConfigOption } from '../../services/proposalService';

export interface DeckSettings {
  logoUrl: string;
  footerText: string;
  themeColor: string;
  themeStyle:
    | 'keynote'
    | 'architecture'
    | 'photography'
    | 'scenography'
    | 'swiss'
    | 'neo-brutalism'
    | 'glassmorphism'
    | 'cyberpunk'
    | 'minimal-tech'
    | 'notebooklm';
  colorMode: 'dark' | 'light';
  transitionEffect?: 'fade' | 'slide' | 'zoom';
}

export const PITCH_DECK_TRANSLATIONS: Record<'en' | 'de', Record<string, string>> = {
  en: {
    new_slide: 'New Slide', type_text_here: 'Insert content here...', budget_plan: 'Project Budget',
    project_team: 'Project Team', api_roadmap: 'Smart Calendar', defects_report: 'Defects & Tickets Report',
    click_for_image: 'Click to select image', pos: 'Pos', text: 'Description', no_media_found: 'No media found in this project.',
    add_as_slide: 'Add as Slide', deck_engine: 'Deck Engine', master_templates: 'Master Templates',
    keynote: 'Executive (Kreativ Desk)', architecture: 'Architecture (Blueprint)', photography: 'Editorial Gallery', scenography: 'Stage Spotlight',
    swiss: 'Swiss Minimal (SIA)', neo_brutalism: 'Neo-Brutalism (Bold)', glassmorphism: 'Glassmorphism (Luxury)', cyberpunk: 'BIM Cyberpunk', minimal_tech: 'Eco Timber (Warm)', master_logo: 'Master Logo', change_logo: 'Change Logo', upload_logo: 'Upload Logo',
    delete_logo: 'Remove Logo', font_weight: 'Font Weight', weight_bold: 'Bold', weight_regular: 'Regular', title_weight: 'Title Style', text_weight: 'Text Style',
    accent_color: 'Accent Color', footer_text: 'Footer Text', import_app_data: 'Project Reporting',
    load_budget: 'Project Budget (Table & Chart)', load_team: 'Import Project Team', generate_roadmap: 'Import Smart Calendar',
    import_cad: 'Import CAD Plans', import_bim: 'Import 3D BIM', import_renderings: 'Import Renderings',
    import_defects: 'Import Defects & Tickets', import_whiteboard: 'Import Whiteboard Sketches', slides_count: 'Slides',
    standard_layouts: 'Standard Layouts', title_slide: 'Title Slide', text_and_image: 'Text & Image',
    two_images_slide: '2-Image Comparison', three_images_slide: '3-Image Gallery',
    image_slide: 'Image Focus', full_image_slide: 'Full-Bleed Cover', full_image_clean_slide: 'Full-Bleed Image (Clean / No Text)', image_tools: 'Image & Scaling', upload_image: 'Upload Image', text_block: 'Text Only', slide: 'Slide', preview_active: 'Preview Active',
    editor_mode: 'Editor Mode', typo_size: 'Font Size', export_pdf_native: 'PDF Export',
    no_slide_selected: 'No slide selected.', select_project: 'Please select a project first.',
    budget_imported: 'Budget imported!', team_imported: 'Team imported!', roadmap_imported: 'Calendar imported!',
    defects_imported: 'Defects imported!', error_load: 'Error loading data.', error_create: 'Error creating slide.',
    delete_slide_confirm: 'Delete slide?', delete_all_confirm: 'Delete all slides in this project?',
    slide_deleted: 'Slide deleted.', reset_deck: 'Reset Deck', close_studio: 'Exit Studio', pdf_generated: 'PDF generated successfully!',
    undo_action: 'Undo (Cmd+Z)', redo_action: 'Redo (Cmd+Shift+Z)', delete_current_slide: 'Delete current slide',
    action_undone: 'Action undone', action_redone: 'Action redone', slide_deleted_undoable: 'Slide deleted (can be restored with Undo)',
    error_pdf: 'Error generating PDF.', all_selected: 'Select All', new_vision: 'The Vision',
    new_topic: 'New Topic', total_budget: 'Total Project Budget', timeline: 'Timeline',
    deck_cleared: 'Deck cleared.', error_delete: 'Error deleting.', location: 'Location:',
    priority: 'Prio:', choose_image: 'Choose Image', import: 'Import', pdf_preview: 'PDF Preview',
    save_cloud: 'Save to Cloud', download_desktop: 'Download Local', upload_success: 'Saved to Documents!',
    design: 'Design', export_pdf_title: 'PDF Studio', company_logo: 'Company Logo', logo_loaded: 'Logo loaded.',
    color: 'Accent Color', format: 'Format', scale_preview: 'Scale Preview', saving_cloud: 'Saving to Cloud...', generating_pdf: 'Generating PDF...',
    refresh_preview: 'Refresh Preview',
    loading: 'Loading Studio...', no_slides: 'No slides found', empty_deck: 'This Pitch Deck is empty or does not exist.',
    content: 'Content', title_size: 'Title Size', text_size: 'Text Size', light_mode: 'Light', dark_mode: 'Dark',
    ready_to_use_master_decks: 'Ready-to-Use Master-Decks', master_templates_header: 'Master Templates',
    slide_animation_header: 'Slide Animation', project_reporting_header: 'Project Reporting',
    title_label: 'Title:', text_label: 'Text:', stamp_label: 'Stamp', select_stamp: 'Select Stamp',
    remove_stamp: 'Remove Stamp', notes_label: 'Notes', duplicate_slide: 'Duplicate Slide',
    image_label: 'Image', ai_create_deck: 'Create AI Deck', presenter_mode: 'Presenter Mode',
    client_link_proposal_btn: 'Client Link / Proposal', client_link_tooltip: 'Create interactive client landing page & proposal',
    landing_page_live: 'Client Landing Page is Live!',
    landing_page_live_sub: 'The interactive presentation for {client} has been published to the cloud.',
    copy: 'Copy', copied: 'Copied', link_copied_toast: 'Client link copied to clipboard!',
    send_whatsapp: 'Send via WhatsApp', send_email: 'Send via Email',
    view_as_client: 'View as Client (Live Preview)', close_done: 'Close / Done',
    tab_basic: '1. Basic & Client', tab_finance: '2. Finances & SIA Payment Plan', tab_legal: '3. Attach GTC & Contracts',
    client_name_label: 'Client Name / Contact Person *', client_company_label: 'Client Company / Organization',
    client_email_label: 'Email for Inquiries', client_phone_label: 'Phone Number for WhatsApp / Callback',
    hero_video_label: 'Hero Video (MP4 / Showreel)', upload_file: 'Upload File', uploading: 'Uploading...',
    validity_duration: 'Proposal Validity Duration', pin_protection: 'PIN Code Protection (Optional)',
    pin_placeholder: 'e.g. 8005 (Leave blank = Public)', intro_text_label: 'Personal Introduction for Client',
    base_price_label: 'Base Proposal Amount *', currency_label: 'Currency',
    configurable_options: 'Configurable Add-on Options', configurable_options_sub: 'Client can select/deselect these',
    new_option_placeholder: 'New package (e.g. 4K Drone Flight)', price_placeholder: 'Price', add_btn: '+ Add',
    sia_milestones_heading: 'SIA 102/118 Payment Plan & Milestones', legal_docs_heading: 'Upload Contract Documents & Terms',
    legal_docs_sub: 'Upload your GTC, works contracts (SIA 118) or NDAs as PDF. The client can view and bindingly accept them on the landing page.',
    pdf_uploaded: '✅ Uploaded', pdf_none: '⚠️ No PDF attached yet', upload_pdf: 'Upload PDF',
    select_from_documents: 'Choose from Documents', select_doc_modal_title: 'Select Document from Kreativ Desk',
    select_doc_modal_sub: 'Choose a contract or GTC from your project files or standard Swiss SIA templates',
    search_docs_placeholder: 'Search documents...', sia_templates_heading: 'Official Swiss SIA Templates & Standards',
    kd_docs_heading: 'Files & Documents in Kreativ Desk', no_kd_docs_found: 'No documents found matching your search.',
    use_template: 'Use Template', attach_doc: 'Select Document',
    clear_doc: 'Remove link', preview_doc: 'Preview document',
    cancel: 'Cancel', publish_landingpage: 'Publish Smart Landing Page', proposal_created_success: 'Client landing page created successfully!',
    insert: 'Insert', insert_tooltip: 'Insert elements, media, notes & stamps',
    present_btn: 'Present', present_tooltip: 'Start fullscreen presentation mode',
    share_export: 'Share & Export', share_export_tooltip: 'Sharing, client link & export',
    exit_studio_tooltip: 'Exit Studio',
    comparison_3variant: '3-Variant Comparison',
    construction_cost_chart: 'Construction Cost Chart',
    table_of_contents_agenda: 'Table of Contents & Agenda',
    badge_table: 'Table', badge_template: 'Template', badge_sketch: 'Sketch', badge_media: 'Media',
    whiteboard_sketch_btn: 'Whiteboard Sketch',
    export_presentation_dropdown: 'Export Presentation',
    export_presentation_sub: 'PDF Studio, Keynote & PPTX',
    client_link_sub: '3D Web Link & E-Signature',
    proposal_title_label: 'Title of Proposal / Landing Page',
    proposal_title_placeholder: 'e.g. Project Presentation or Residential Park'
  },
  de: {
    new_slide: 'Neue Folie', type_text_here: 'Inhalt hier einfügen...', budget_plan: 'Projekt-Budget',
    project_team: 'Das Projekt-Team', api_roadmap: 'Smart Calendar', defects_report: 'Mängel & Ticket Report',
    click_for_image: 'Klicken für Bildauswahl', pos: 'Pos', text: 'Beschreibung', no_media_found: 'Keine Medien in diesem Projekt gefunden.',
    add_as_slide: 'Als Folie hinzufügen', deck_engine: 'Deck Engine', master_templates: 'Master-Vorlagen',
    keynote: 'Executive (Kreativ Desk)', architecture: 'Architektur (Blueprint)', photography: 'Editorial Galerie', scenography: 'Stage Spotlight',
    swiss: 'Swiss Minimal (SIA)', neo_brutalism: 'Neo-Brutalism (Bold)', glassmorphism: 'Glassmorphism (Luxury)', cyberpunk: 'BIM Cyberpunk', minimal_tech: 'Eco Timber (Holzbau)', master_logo: 'Master Logo', change_logo: 'Logo ändern', upload_logo: 'Logo hochladen',
    delete_logo: 'Logo entfernen', font_weight: 'Schriftschnitt', weight_bold: 'Fett (Bold)', weight_regular: 'Normal (Regular)', title_weight: 'Titel-Schriftschnitt', text_weight: 'Text-Schriftschnitt',
    accent_color: 'Akzentfarbe', footer_text: 'Fusszeile', import_app_data: 'Projekt-Berichterstattung',
    load_budget: 'Projekt-Budget (Tabelle & Chart)', load_team: 'Projekt-Team', generate_roadmap: 'Smart Calendar',
    import_cad: 'CAD & Pläne', import_bim: '3D BIM Modelle', import_renderings: '3D Renderings',
    import_defects: 'Mängel & Tickets', import_whiteboard: 'Whiteboard Skizzen', slides_count: 'Folien',
    standard_layouts: 'Standard Layouts', title_slide: 'Titel-Folie', text_and_image: 'Text & Bild',
    two_images_slide: '2-Bilder-Vergleich', three_images_slide: '3-Bilder-Galerie',
    image_slide: 'Bild-Fokus', full_image_slide: 'Vollbild-Cover', full_image_clean_slide: 'Ganzseitiges Bild (Clean / Ohne Text)', image_tools: 'Bild & Skalierung', upload_image: 'Bild hochladen', text_block: 'Nur Text', slide: 'Folie', preview_active: 'Vorschau Aktiv',
    editor_mode: 'Editor Modus', typo_size: 'Schriftgrösse', export_pdf_native: 'PDF Export',
    no_slide_selected: 'Keine Folie ausgewählt.', select_project: 'Bitte wähle zuerst ein Projekt.',
    budget_imported: 'Budget importiert!', team_imported: 'Team importiert!', roadmap_imported: 'Terminplan importiert!',
    defects_imported: 'Mängel importiert!', error_load: 'Fehler beim Laden.', error_create: 'Fehler beim Erstellen.',
    delete_slide_confirm: 'Folie löschen?', delete_all_confirm: 'Alle Folien löschen?',
    slide_deleted: 'Folie gelöscht.', reset_deck: 'Deck leeren', close_studio: 'Studio verlassen', pdf_generated: 'PDF erfolgreich exportiert!',
    undo_action: 'Rückgängig (Cmd+Z)', redo_action: 'Wiederholen (Cmd+Shift+Z)', delete_current_slide: 'Aktuelle Folie löschen',
    action_undone: 'Aktion rückgängig gemacht', action_redone: 'Aktion wiederhergestellt', slide_deleted_undoable: 'Folie gelöscht (mit Rückgängig wiederherstellbar)',
    error_pdf: 'Fehler bei der PDF-Generierung.', all_selected: 'Alle anwählen', new_vision: 'Die Vision',
    new_topic: 'Neues Thema', total_budget: 'Gesamtbudget Projekt', timeline: 'Terminplan',
    deck_cleared: 'Deck wurde geleert.', error_delete: 'Fehler beim Löschen.', location: 'Ort:',
    priority: 'Prio:', choose_image: 'Bild wählen', import: 'Importieren', pdf_preview: 'PDF Vorschau',
    save_cloud: 'In Cloud speichern', download_desktop: 'Lokal herunterladen', upload_success: 'In Bauakte gespeichert!',
    design: 'Design', export_pdf_title: 'PDF Studio', company_logo: 'Firmenlogo', logo_loaded: 'Logo geladen.',
    color: 'Akzentfarbe', format: 'Format', scale_preview: 'Zoom Vorschau', saving_cloud: 'Speichert...', generating_pdf: 'Wird erstellt...',
    refresh_preview: 'Vorschau aktualisieren',
    loading: 'Lade Studio...', no_slides: 'Keine Folien vorhanden', empty_deck: 'Dieses Pitch Deck ist leer.',
    content: 'Inhalt', title_size: 'Titel-Grösse', text_size: 'Text-Grösse', light_mode: 'Hell', dark_mode: 'Dunkel',
    ready_to_use_master_decks: 'Fertige Master-Decks', master_templates_header: 'Master-Vorlagen',
    slide_animation_header: 'Folien-Animation', project_reporting_header: 'Projekt-Berichterstattung',
    title_label: 'Titel:', text_label: 'Text:', stamp_label: 'Stempel', select_stamp: 'Stempel wählen',
    remove_stamp: 'Stempel entfernen', notes_label: 'Notizen', duplicate_slide: 'Folie duplizieren',
    image_label: 'Bild', ai_create_deck: 'KI Deck erstellen', presenter_mode: 'Präsentationsmodus',
    client_link_proposal_btn: 'Kunden-Link / Offerte', client_link_tooltip: 'Interaktive Kunden-Landingpage & Offerte erstellen',
    landing_page_live: 'Kunden-Landingpage ist Live!',
    landing_page_live_sub: 'Die interaktive Präsentation für {client} wurde in der Cloud veröffentlicht.',
    copy: 'Kopieren', copied: 'Kopiert', link_copied_toast: 'Kunden-Link in Zwischenablage kopiert!',
    send_whatsapp: 'Per WhatsApp senden', send_email: 'Per E-Mail versenden',
    view_as_client: 'Als Kunde ansehen (Live-Vorschau)', close_done: 'Schliessen / Fertig',
    tab_basic: '1. Basis & Kunde', tab_finance: '2. Finanzen & SIA-Zahlungsplan', tab_legal: '3. AGB & Verträge anhängen',
    client_name_label: 'Kunden-Name / Ansprechpartner *', client_company_label: 'Kunden-Firma / Organisation',
    client_email_label: 'E-Mail für Rückfragen', client_phone_label: 'Telefonnummer für WhatsApp / Rückruf',
    hero_video_label: 'Hero Video (MP4 / Showreel)', upload_file: 'Datei hochladen', uploading: 'Lädt hoch...',
    validity_duration: 'Gültigkeitsdauer der Offerte', pin_protection: 'PIN-Code Schutz (Optional)',
    pin_placeholder: 'z. B. 8005 (Leerlassen = Öffentlich)', intro_text_label: 'Persönliche Einleitung für den Kunden',
    base_price_label: 'Basis-Angebotssumme *', currency_label: 'Währung',
    configurable_options: 'Konfigurierbare Zusatzoptionen', configurable_options_sub: 'Kunde kann diese an/abwählen',
    new_option_placeholder: 'Neues Paket (z.B. 4K Drohnenflug)', price_placeholder: 'Preis', add_btn: '+ Hinzufügen',
    sia_milestones_heading: 'SIA 102/118 Zahlungsplan & Meilensteine', legal_docs_heading: 'Vertragsdokumente & AGBs hochladen',
    legal_docs_sub: 'Laden Sie Ihre AGB, Werkverträge (SIA 118) oder NDAs als PDF hoch. Der Kunde kann diese auf der Landingpage einsehen und verbindlich akzeptieren.',
    upload_pdf: 'PDF hochladen', pdf_uploaded: '✅ Verknüpft', pdf_none: '⚠️ Noch kein Dokument',
    select_from_documents: 'Aus Dokumente wählen', select_doc_modal_title: 'Dokument aus Kreativ Desk auswählen',
    select_doc_modal_sub: 'Wählen Sie einen Vertrag oder AGB aus Ihren Projektdaten oder Schweizer SIA-Vorlagen',
    search_docs_placeholder: 'Dokumente durchsuchen...', sia_templates_heading: 'Offizielle Schweizer SIA-Vorlagen & Standards',
    kd_docs_heading: 'Dateien & Dokumente in Kreativ Desk', no_kd_docs_found: 'Keine Dokumente gefunden.',
    use_template: 'Vorlage verwenden', attach_doc: 'Dokument wählen',
    clear_doc: 'Verknüpfung aufheben', preview_doc: 'Dokument ansehen',
    cancel: 'Abbrechen', publish_landingpage: 'Smart Landingpage Veröffentlichen', proposal_created_success: 'Kunden-Landingpage erfolgreich erstellt!',
    insert: 'Einfügen', insert_tooltip: 'Elemente, Medien, Notizen & Stempel einfügen',
    present_btn: 'Präsentieren', present_tooltip: 'Vollbild-Präsentationsmodus starten',
    share_export: 'Freigabe & Export', share_export_tooltip: 'Freigabe, Kunden-Link & Exportieren',
    exit_studio_tooltip: 'Studio verlassen',
    comparison_3variant: '3-Varianten-Vergleich',
    construction_cost_chart: 'Baukosten-Diagramm',
    table_of_contents_agenda: 'Inhaltsverzeichnis & Agenda',
    badge_table: 'Tabelle', badge_template: 'Vorlage', badge_sketch: 'Skizze', badge_media: 'Medien',
    whiteboard_sketch_btn: 'Whiteboard-Skizze',
    export_presentation_dropdown: 'Präsentation exportieren',
    export_presentation_sub: 'PDF Studio, Keynote & PPTX',
    client_link_sub: '3D Web-Link & E-Signatur',
    proposal_title_label: 'Titel der Offerte / Landingpage',
    proposal_title_placeholder: 'z. B. Projekt-Präsentation oder Neubau Wohnpark'
  }
};

export const STANDARD_SIA_LEGAL_TEMPLATES = [
  {
    name: 'SIA 102 – Ordnung für Leistungen und Honorare der Architektinnen und Architekten (AGB)',
    category: 'SIA Normen',
    size: '185 KB',
    url: 'https://images.unsplash.com/legal/sia-102-architekten.pdf'
  },
  {
    name: 'SIA 118 – Allgemeine Bedingungen für Bauarbeiten & Werkvertrag',
    category: 'SIA Normen',
    size: '220 KB',
    url: 'https://images.unsplash.com/legal/sia-118-werkvertrag.pdf'
  },
  {
    name: 'Kooperationsvertrag Planergemeinschaft & Subplaner-Vereinbarung',
    category: 'Verträge',
    size: '140 KB',
    url: 'https://images.unsplash.com/legal/sia-planervertrag.pdf'
  },
  {
    name: 'Vertraulichkeitsvereinbarung / NDA (Schweizer OR Art. 1 ff.)',
    category: 'Recht',
    size: '95 KB',
    url: 'https://images.unsplash.com/legal/nda-schweiz-template.pdf'
  }
];

export const DEFAULT_PROPOSAL_OPTIONS: ProposalConfigOption[] = [
  { id: 'opt-1', title: '3D-Echtzeit BIM-Visualisierung & VR Begehung', description: 'Interaktiver 3D-Rundgang für Bauherren & Kunden', price: 3500, selectedByDefault: true },
  { id: 'opt-2', title: 'Drohnen-Baufortschritts-Dokumentation (4K)', description: 'Regelmässige 4K Drohnenflüge & Fotogrammetrie', price: 2800, selectedByDefault: false },
  { id: 'opt-3', title: 'Premium SIA-Termingarantie & 24/7 Hotline', description: 'Prioritäre Bauleiterbegleitung & Express-Termine', price: 4900, selectedByDefault: false }
];

export const createDefaultProposalLegalDocs = () => [
  { id: 'doc-agb', name: 'Allgemeine Geschäftsbedingungen (AGB)', type: 'agb', url: '', isRequired: true, uploadedAt: new Date().toISOString() },
  { id: 'doc-werk', name: 'Werkvertrag & SIA 118 Konditionen', type: 'werkvertrag', url: '', isRequired: true, uploadedAt: new Date().toISOString() },
  { id: 'doc-koop', name: 'Kooperationsvertrag & Subplaner-Vereinbarung', type: 'kooperation', url: '', isRequired: false, uploadedAt: new Date().toISOString() }
];

export const DEFAULT_PROPOSAL_MILESTONES = [
  { id: 'ms-1', phase: 'Phase 1: Vorprojekt & Machbarkeitsanalyse', percentage: 20, description: 'Grundlagenanalyse, Vorkonzept & Kostenschätzung (SIA 102)' },
  { id: 'ms-2', phase: 'Phase 2: Bauprojekt & Baueingabe', percentage: 30, description: 'Bewilligungsfähige Projektpläne & Baueingabe bei Behörden' },
  { id: 'ms-3', phase: 'Phase 3: Ausführungsplanung & Ausschreibung', percentage: 25, description: 'Detailpläne, Devisierung & Vergabe an Handwerker' },
  { id: 'ms-4', phase: 'Phase 4: Realisierung & Bauleitung', percentage: 20, description: 'Örtliche Bauleitung, Qualitäts- & Kostenkontrolle' },
  { id: 'ms-5', phase: 'Phase 5: Abschluss & Garantieabnahme', percentage: 5, description: 'Schlussabrechnung, Mängelbehebung & Übergabe' }
];

export function getMasterDeckBundle(bundleType: 'architecture' | 'luxury' | 'eco' | 'tech'): {
  themeStyle: DeckSettings['themeStyle'];
  bundleSlides: any[];
} {
  if (bundleType === 'architecture') {
    return {
      themeStyle: 'architecture',
      bundleSlides: [
        { title: "Wohnüberbauung Alpenblick", content: "Architektur-Wettbewerb & Ausführungsplanung\n\nStandort: Chur, Schweiz\nBGF: 4'200 m² | Bauvolumen: 14'500 m³", layout: "title-only", notes: "Begrüssung des Gremiums, Vorstellung des Wettbewerbsareals und Einbettung im Ortsbild." },
        { title: "Städtebau & Fassadenkonzept", content: "Das Entwurfskonzept basiert auf einer harmonischen Einbettung in die alpine Topografie. Die Fassade kombiniert heimisches Lerchenholz mit vertikalen Betonstrukturen.", layout: "split", imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", notes: "Betonen, dass das Lerchenholz aus regionalem Anbau Graubünden stammt." },
        { title: "Baukosten-Verteilung (BKP Share)", content: "", layout: "chart-donut", dataPayload: { totalAmount: 910000, chartSegments: [
          { label: 'BKP 1 Vorbereitung & Honorare', value: 65000, color: '#3b82f6' },
          { label: 'BKP 2 Gebäude & Rohbau', value: 520000, color: '#8b5cf6' },
          { label: 'BKP 3 Haustechnik & Elektro', value: 185000, color: '#ec4899' },
          { label: 'BKP 4 Innenausbau & Umgebung', value: 140000, color: '#10b981' }
        ] }, notes: "Puffer von 5% in BKP 2 Rohbau ist bereits einkalkuliert." },
        { title: "Termin- & Meilensteinplanung", content: "", layout: "smart-calendar", dataPayload: { milestones: [
          { start: '2026-01-01', end: '2026-04-01', title: 'Phase 1: Baueingabe & Bewilligung', status: 'Abgeschlossen' },
          { start: '2026-04-01', end: '2026-10-01', title: 'Phase 2: Aushub & Rohbauarbeiten', status: 'In Ausführung' },
          { start: '2026-10-01', end: '2027-03-01', title: 'Phase 3: Innenausbau & Übergabe', status: 'Geplant' }
        ] }, notes: "Baueingabe wurde fristgerecht ohne Einsprachen eingereicht." },
        { title: "Das Architektur- & Fachplanungsteam", content: "", layout: "team-grid", dataPayload: { members: [
          { name: 'Dipl. Arch. ETH / SIA', role: 'Entwurf & Gesamtleitung', photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80' },
          { name: 'Bauingenieur FH / SIA', role: 'Tragwerksplanung & Statik', photoURL: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80' }
        ] }, notes: "Team hat bereits 3 gemeinsame Referenzprojekte in der Region realisiert." }
      ]
    };
  }
  if (bundleType === 'luxury') {
    return {
      themeStyle: 'glassmorphism',
      bundleSlides: [
        { title: "Residences Bellevue Zurich", content: "Exclusive Modern Living & Panoramic Views", layout: "title-only" },
        { title: "Architectural Elegance", content: "Floor-to-ceiling glass facades, premium Italian interior finishes, integrated smart home automation and private spa.", layout: "split", imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80" },
        { title: "Financial Investment Breakdown", content: "", layout: "chart-donut", dataPayload: { totalAmount: 4800000, chartSegments: [
          { label: 'Land Acquisition', value: 1800000, color: '#3b82f6' },
          { label: 'Construction & Interior', value: 2200000, color: '#8b5cf6' },
          { label: 'Finishing & Amenities', value: 800000, color: '#ec4899' }
        ] } },
        { title: "Execution Schedule", content: "", layout: "smart-calendar", dataPayload: { milestones: [
          { start: '2026-02-01', end: '2026-06-01', title: 'Foundation & Shell', status: 'In Progress' },
          { start: '2026-06-01', end: '2026-12-01', title: 'Luxury Fitting & Interior', status: 'Planned' }
        ] } },
        { title: "Exclusive Development Team", content: "", layout: "team-grid", dataPayload: { members: [
          { name: 'Lead Architect ETH', role: 'Concept Design', photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80' },
          { name: 'Project Director', role: 'Real Estate Dev', photoURL: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80' }
        ] } }
      ]
    };
  }
  if (bundleType === 'eco') {
    return {
      themeStyle: 'minimal-tech',
      bundleSlides: [
        { title: "Green Office & Eco Timber", content: "Nachhaltiger Holzsystembau mit Netto-Null CO₂ Bilanz", layout: "title-only" },
        { title: "Ökologische Materialisierung", content: "Zertifiziertes Schweizer Fichtenholz, Lehmputzinnenwände und Photovoltaik-Fassadenelemente sorgen für ein optimales Raumklima.", layout: "split", imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80" },
        { title: "Nachhaltigkeit & Baukosten Share", content: "", layout: "chart-donut", dataPayload: { totalAmount: 1450000, chartSegments: [
          { label: 'Holzbau & Tragwerk', value: 650000, color: '#10b981' },
          { label: 'Solar & Energie (PV)', value: 350000, color: '#f59e0b' },
          { label: 'Öko-Ausbau & Dämmung', value: 450000, color: '#06b6d4' }
        ] } },
        { title: "Projektphasen", content: "", layout: "smart-calendar", dataPayload: { milestones: [
          { start: '2026-03-01', end: '2026-07-01', title: 'Holzbau-Vorfertigung', status: 'Aktiv' },
          { start: '2026-07-01', end: '2026-10-01', title: 'Montage Vor-Ort', status: 'Geplant' }
        ] } }
      ]
    };
  }
  return {
    themeStyle: 'cyberpunk',
    bundleSlides: [
      { title: "BIM 5D Digital Twin Masterplan", content: "Smart Building & Integrated Construction Engineering", layout: "title-only" },
      { title: "3D BIM Modellierung & IoT", content: "Echtzeit-Kollisionsprüfung und automatisierte Massenermittlung aus dem 3D-BIM-Modell.", layout: "split", imageUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80" },
      { title: "BIM Kostengliederung", content: "", layout: "chart-donut", dataPayload: { totalAmount: 3200000, chartSegments: [
        { label: 'BIM Modellierung 3D', value: 400000, color: '#38bdf8' },
        { label: 'Digitale Haustechnik', value: 1600000, color: '#a855f7' },
        { label: 'Automatisiertes Reporting', value: 1200000, color: '#f43f5e' }
      ] } },
      { title: "Digital Twin Roadmap", content: "", layout: "smart-calendar", dataPayload: { milestones: [
        { start: '2026-01-15', end: '2026-05-15', title: 'BIM Level 3 Modellierung', status: 'Abgeschlossen' },
        { start: '2026-05-15', end: '2026-11-15', title: 'IoT Sensorik & Inbetriebnahme', status: 'Aktiv' }
      ] } }
    ]
  };
}
