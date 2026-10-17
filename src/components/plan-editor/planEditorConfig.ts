export const PLAN_EDITOR_TRANSLATIONS: Record<'en' | 'de', Record<string, string>> = {
  en: {
    save: 'Save', upload_success: 'Upload successful!', upload_failed: 'Upload failed.',
    polygon_click_corners: 'Click corners.', close_shape: 'Close shape', upload_cad_plan: 'Upload Main Plan',
    upload_cad_desc: 'Drop a file (JPG, PNG, PDF) here.', true_scale_engine: 'TrueScale™ Engine',
    no_plan_loaded: 'No plan loaded', landscape: 'Landscape', portrait: 'Portrait', upload_plan: 'Upload Plan',
    pdf_export: 'PDF Export', save_cloud: 'Save to Cloud', properties: 'Properties', length_meters: 'Length in meters',
    color: 'Color', line_thickness: 'Line thickness', text_size: 'Text size', scale: 'Scale', project: 'Project',
    client: 'Client', planner: 'Planner', content: 'Content', phase: 'Phase', format: 'Format', date: 'Date',
    drawn_by: 'Drawn by', plan_no: 'Plan No.', line_style: 'Line style', opacity: 'Opacity', delete_element: 'Delete Element',
    describe_defect: 'Describe Defect', create_ticket: 'Create Ticket', cancel: 'Cancel', defect_saved: 'Defect saved!',
    error_saving_defect: 'Error saving defect.', save_to_data_room: 'Save to Data Room', export_and_save: 'Export & Save',
    download_pdf_local: 'Download PDF locally', error_saving: 'Error saving.', pdf_exported: 'PDF exported!',
    export_error: 'Export error', defect: 'Defect', change_image: 'Change Image', upload_or_take_photo: 'Upload or take a photo',
    defect_placeholder: 'e.g. Crack in wall', photo_evidence_optional: 'Photo / Evidence (Optional)',
    switch_plan: 'Switch Plan', new_plan: '+ Upload New Plan', take_photo: 'Take Photo', upload_gallery: 'Gallery',
    layers: 'Layers', delete_plan: 'Delete Plan', confirm_delete_plan: 'Are you sure you want to delete this plan?',
    only_images_allowed: 'Please upload JPG/PNG for the editor.',
    rasterizing_pdf: 'Processing PDF...',
    calibrate_truescale: 'Calibrate TrueScale™',
    truescale_calibrate_short: 'Calibrate',
    truescale_demo_info: 'TrueScale™ calibration is active in demo preview (1:50 standard).',
    upload_plan_btn: 'Upload Plan',
    upload_btn_short: 'Upload',
    upload_plan_tooltip: 'Upload CAD drawing or PDF blueprint to project workspace',
    export_pdf_tooltip: 'Export plan as high-resolution PDF',
    export_pdf_tooltip_disabled: 'Upload a plan first to export',
    save_layers_tooltip: 'Save drawings and layers',
    default_layer: 'Default Layer',
    add_layer: 'Add Layer',
    layer_prefix: 'Layer',
    truescale_modal_title: 'TrueScale™ Scale Calibration',
    truescale_modal_desc: 'Draw a reference line over a known distance (e.g. a wall) and enter the exact value in meters. The CAD system calculates the scale automatically (1:50, 1:100 etc.).',
    known_real_length: 'Known real length in meters (m)',
    apply_calibration_btn: 'Apply Scale Calibration',
    calibrate_truescale_tooltip: 'Calibrate plan scale with known reference distance (TrueScale™)',
    export_dropdown: 'Export',
    export_pdf_title: 'Export PDF Plan',
    export_pdf_sub: 'Print-ready plan with SIA title block in Universal PDF Studio',
    export_pitch_title: 'Pitch Deck Slide',
    export_pitch_sub: 'Send current plan snapshot to presentation deck',
    plan_layout: 'Layout',
    cad_title: 'CAD Plans',
    cad_subtitle: '2D blueprints, TrueScale™ calibration & SIA-118 defect pins'
  },
  de: {
    cad_title: 'CAD Pläne',
    cad_subtitle: '2D-Baupläne, TrueScale™ Vermessung & SIA-118 Mängel-Pins',
    save: 'Speichern', upload_success: 'Upload erfolgreich!', upload_failed: 'Upload fehlgeschlagen.',
    polygon_click_corners: 'Ecken klicken.', close_shape: 'Schliessen', upload_cad_plan: 'Plan hochladen',
    upload_cad_desc: 'Ziehe eine Datei (JPG, PNG, PDF) herein.', true_scale_engine: 'TrueScale™ Engine',
    no_plan_loaded: 'Kein Plan geladen', landscape: 'Querformat', portrait: 'Hochformat', upload_plan: 'Plan hochladen',
    pdf_export: 'PDF Export', save_cloud: 'In Cloud speichern', properties: 'Eigenschaften', length_meters: 'Länge in Metern',
    color: 'Farbe', line_thickness: 'Linienstärke', text_size: 'Textgrösse', scale: 'Massstab', project: 'Projekt',
    client: 'Bauherrschaft', planner: 'Planverfasser', content: 'Planinhalt', phase: 'Phase', format: 'Format', date: 'Datum',
    drawn_by: 'Gezeichnet', plan_no: 'Plannummer', line_style: 'Linienstil', opacity: 'Deckkraft', delete_element: 'Element löschen',
    describe_defect: 'Mangel beschreiben', create_ticket: 'Ticket erstellen', cancel: 'Abbrechen', defect_saved: 'Mangel gespeichert!',
    error_saving_defect: 'Fehler beim Speichern.', save_to_data_room: 'In Bau-Akte speichern', export_and_save: 'Exportieren & Speichern',
    download_pdf_local: 'Lokal als PDF herunterladen', error_saving: 'Fehler beim Speichern.', pdf_exported: 'PDF exportiert!',
    export_error: 'Export-Fehler', defect: 'Mangel', change_image: 'Bild ändern', upload_or_take_photo: 'Bild hochladen / aufnehmen',
    defect_placeholder: 'z.B. Riss in der Wand', photo_evidence_optional: 'Foto / Beweisbild (Optional)',
    switch_plan: 'Plan wechseln', new_plan: '+ Neuen Plan hochladen', take_photo: 'Foto aufnehmen', upload_gallery: 'Aus Galerie',
    layers: 'Ebenen', delete_plan: 'Plan löschen', confirm_delete_plan: 'Möchtest du diesen Plan unwiderruflich löschen?',
    only_images_allowed: 'Bitte JPG/PNG für Editor nutzen.',
    rasterizing_pdf: 'PDF wird verarbeitet...',
    calibrate_truescale: 'TrueScale™ Kalibrieren',
    truescale_calibrate_short: 'Kalibrieren',
    truescale_demo_info: 'TrueScale™ Kalibrierung ist in der Demo-Vorschau aktiv (1:50 Standard).',
    upload_plan_btn: 'Plan hochladen',
    upload_btn_short: 'Hochladen',
    upload_plan_tooltip: 'CAD-Plan oder PDF-Bauplan in den Projekt-Workspace hochladen',
    export_pdf_tooltip: 'Plan als hochauflösendes PDF exportieren',
    export_pdf_tooltip_disabled: 'Erst Plan hochladen zum Exportieren',
    save_layers_tooltip: 'Zeichnungen und Ebenen speichern',
    default_layer: 'Standard-Ebene',
    add_layer: 'Zeichenebene hinzufügen',
    layer_prefix: 'Ebene',
    truescale_modal_title: 'TrueScale™ Massstabs-Kalibrierung',
    truescale_modal_desc: 'Zeichne eine Referenzlinie über eine bekannte Distanz (z.B. eine Wand) und gib den exakten Wert in Metern ein. Das CAD-System berechnet automatisch den Massstab (1:50, 1:100 etc.).',
    known_real_length: 'Bekannte Reallänge in Metern (m)',
    apply_calibration_btn: 'Massstab Kalibrieren',
    calibrate_truescale_tooltip: 'Plan-Massstab anhand Referenzlinie kalibrieren (TrueScale™)',
    export_dropdown: 'Export',
    export_pdf_title: 'PDF Plan exportieren',
    export_pdf_sub: 'Druckfertiger Plan mit SIA-Plankopf im Universal PDF Studio',
    export_pitch_title: 'Pitch Deck Folie',
    export_pitch_sub: 'Aktuellen Plan-Snapshot direkt an Pitch Deck senden',
    plan_layout: 'Format'
  }
};

export const TOOL_LABELS: Record<string, { de: string; en: string }> = {
  pan: { de: 'Auswählen & Verschieben', en: 'Select & Pan' },
  calibrate: { de: 'TrueScale™ Kalibrieren', en: 'TrueScale™ Calibrate' },
  measure: { de: 'Messen / Massstab (Distanz)', en: 'Measure (Distance)' },
  scalebar: { de: 'Grafischer Massstabsbalken', en: 'Graphic Scale Bar' },
  polygon: { de: 'Polygon / Raumfläche (m²)', en: 'Polygon / Room Area (m²)' },
  rect: { de: 'Rechteck / Fläche (m²)', en: 'Rectangle / Area (m²)' },
  circle: { de: 'Kreis', en: 'Circle' },
  arrow: { de: 'Hinweispfeil / Zeiger', en: 'Arrow / Callout' },
  pen: { de: 'Stift / Freihandzeichnung', en: 'Freehand Pen' },
  text: { de: 'Text einfügen', en: 'Insert Text' },
  defect: { de: 'SIA 118 Mangel-Pin', en: 'SIA 118 Defect Pin' },
  titleblock: { de: 'SIA Plankopf einfügen', en: 'SIA Title Block' },
  image: { de: 'Bild / Plan überlagern', en: 'Overlay Image' },
};

export type ToolType = 'pan' | 'defect' | 'zone' | 'text' | 'pen' | 'measure' | 'polygon' | 'titleblock' | 'rect' | 'circle' | 'scalebar' | 'image' | 'arrow';
export type LineStyle = 'solid' | 'dashed' | 'dotted';

export const SWISS_TRADES = [
  'Baumeister',
  'Gipser / Maler',
  'Elektro',
  'Sanitär / Heizung',
  'Lüftung / Klima',
  'Fensterbau / Fassade',
  'Schreiner / Innenausbau',
  'Bodenleger / Parkett',
  'Dachdecker / Spengler',
  'Metallbau',
  'Gartenbau / Umgebung',
  'Planung / Bauleitung'
];

export interface BaseElement { id: string; type: ToolType; x: number; y: number; layerId?: string; opacity?: number; rotation?: number; locked?: boolean; }
export interface DefectMarker extends BaseElement { 
  type: 'defect'; 
  title: string; 
  description: string; 
  priority?: 'Critical' | 'High' | 'Medium' | 'Low' | string; 
  trade?: string; 
  status: 'To Do' | 'In Progress' | 'In Review' | 'Done' | 'open' | 'in_progress' | 'review' | 'closed' | 'resolved' | string; 
  isSynced?: boolean; 
  color?: string; 
  strokeColor?: string;
  imageUrl?: string | null;
}
export interface TextMarkup extends BaseElement { type: 'text'; text: string; color: string; size: number; }
export interface FreehandLine extends BaseElement { type: 'pen'; points: {x: number, y: number}[]; color: string; thickness: number; }
export interface Measurement extends BaseElement { type: 'measure'; start: {x: number, y: number}; end: {x: number, y: number}; color: string; textScale?: number; }
export interface PolygonMarkup extends BaseElement { type: 'polygon'; points: {x: number, y: number}[]; color: string; strokeColor: string; borderStyle: LineStyle; strokeWidth?: number; showArea?: boolean; roomName?: string; textScale?: number; }
export interface RectMarkup extends BaseElement { type: 'rect'; w: number; h: number; color: string; strokeColor: string; borderStyle: LineStyle; strokeWidth?: number; rotation?: number; showArea?: boolean; roomName?: string; textScale?: number; }
export interface CircleMarkup extends BaseElement { type: 'circle'; r: number; color: string; strokeColor: string; borderStyle: LineStyle; strokeWidth?: number; showArea?: boolean; roomName?: string; textScale?: number; }
export interface ArrowMarkup extends BaseElement { type: 'arrow'; start: {x: number, y: number}; end: {x: number, y: number}; color: string; strokeWidth?: number; borderStyle?: LineStyle; }
export interface ScaleBarMarkup extends BaseElement { type: 'scalebar'; lengthMeters: number; color: string; thickness: number; textSize: number; }
export interface TitleBlockMarkup extends BaseElement { 
  type: 'titleblock'; scale: number; textColor: string;
  data: { projekt: string; adresse: string; bauherrschaft: string; planverfasser: string; phase: string; planinhalt: string; planNummer: string; datum: string; gez: string; logoUrl?: string; brandText?: string; }
}
export interface ImageMarkup extends BaseElement { type: 'image'; url: string; scale: number; color?: string; }

export type PlanElement = DefectMarker | TextMarkup | FreehandLine | Measurement | PolygonMarkup | TitleBlockMarkup | RectMarkup | CircleMarkup | ScaleBarMarkup | ImageMarkup | ArrowMarkup;

export interface Layer { id: string; name: string; visible: boolean; locked: boolean; opacity: number; }

export const PAPER_DIMENSIONS: Record<string, {w: number, h: number}> = { 'A3': { w: 420, h: 297 }, 'A4': { w: 297, h: 210 } };
export const MM_TO_PX = 3; 

export const formatBytes = (bytes: number) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const sessionImageCache: Record<string, string> = {};
export const cadMemoryCache: Record<string, any> = {};

export const defaultDemoDefectPins: DefectMarker[] = [
  { id: 'el1', type: 'defect', x: 0.28, y: 0.35, title: 'Riss im Sichtbeton Achse B (Treppenhaus)', description: 'Haarriss Treppenhaus EG-1.OG. SIA 118 Rügefrist läuft. Spachtelung erforderlich.', status: 'To Do', priority: 'High', trade: 'Baumeister (Gebr. Keller Bau AG)', layerId: 'default' },
  { id: 'el2', type: 'defect', x: 0.65, y: 0.22, title: 'Fensterdichtung beschädigt Nordfassade', description: 'Dichtungsprofil Wetterseite 1. OG eingedrückt. Vor Montage der Leibung ersetzen.', status: 'In Progress', priority: 'Medium', trade: 'Fensterbau (SwissWindows AG)', layerId: 'default' },
  { id: 'el3', type: 'defect', x: 0.72, y: 0.70, title: 'Schutzabdeckung Bodenheizung montiert', description: 'Trittschutz vor Einbringen des Unterlagsbodens montiert. Bereit zur Bauleitung-Abnahme.', status: 'In Review', priority: 'Medium', trade: 'Heizung / Sanitär', layerId: 'default' },
  { id: 'el4', type: 'defect', x: 0.38, y: 0.78, title: 'Aussparung Steigzone brandschutzverkleidet (SIA 118)', description: 'Aussparung mit Promat EI90 verkleidet und gemäss Brandschutzvorschriften VKF abgenommen.', status: 'Done', priority: 'Low', trade: 'Brandschutz & Dämmung', layerId: 'default' }
];
