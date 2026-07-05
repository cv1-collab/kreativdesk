import React, { useState, Suspense, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Box as DreiBox, Environment, Grid, Cylinder, Line, Html, Center } from '@react-three/drei';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { callGeminiAPI, callGeminiImageAPI } from '../utils/geminiClient';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Box, Layers, Eye, EyeOff, Maximize, Rotate3D,
  ShieldAlert, Sparkles, ArrowUp, ArrowDown, SplitSquareVertical,
  Ruler, Camera, Loader2, Image as ImageIcon, X, UploadCloud, Upload, Video, Download, 
  Hand, CheckCircle2, Plus, Edit2, Trash2, FileText, Cloud, PenTool, Smartphone, LayoutDashboard, CalendarDays, Users, AlertTriangle, DollarSign, MonitorPlay, Map
} from 'lucide-react';
import { cn } from '../utils';

import { IFCLoader } from 'web-ifc-three/IFCLoader';
import { checkStorageLimit, incrementStorage } from '../utils/storageGuard';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, addDoc, collection, query, where, getDocs, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { storage, db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { hasFeature } from '../utils/planFeatures';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext'; 
import { useProject } from '../contexts/ProjectContext'; 
import { jsPDF } from 'jspdf';

import UniversalPDFStudio from './UniversalPDFStudio';
import { Document, Page, Text, View, StyleSheet, Image as PDFImage } from '@react-pdf/renderer';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    error_loading_ifc: 'Error loading IFC', defect: 'Defect', defect_saved: 'Defect saved!',
    error_saving_defect: 'Error saving defect.', ai_audit_complete: 'AI Audit complete.',
    error_generating_render: 'Error generating render.', render_saved: 'Render saved!',
    error_saving_cloud: 'Error saving to cloud.', fbx_optimization_info: 'FBX models will be automatically optimized in the cloud.',
    unsupported_format: 'Unsupported format. Please use IFC, OBJ, GLTF, DAE or DWG.',
    model_saved: 'Model saved!', error_processing_model: 'Error processing model.',
    enter_new_name: 'Enter new name:', confirm_delete_model: 'Are you sure you want to delete this model?',
    layer_arch: 'Architecture', layer_tga: 'MEP / HVAC', layer_fire: 'Fire Safety', layer_struct: 'Structure',
    viewer_title: '3D Viewer', analyzing_model: 'Analyzing...', ai_modelaudit: 'AI Model Audit',
    ai_render: 'AI Render', rotate: 'Rotate', pan: 'Pan', defect_pin_mode: 'Defect Pin Mode',
    measurement_mode: 'Measurement Mode', exploded_view: 'Exploded View', ai_site_tour: 'AI Site Tour',
    floor_up: 'Floor Up', floor_down: 'Floor Down', download_screenshot: 'Screenshot', fullscreen: 'Fullscreen',
    model_library: 'Model Library', rename: 'Rename', upload_model: 'Upload Model',
    supported_3d_formats: 'Supported: IFC, OBJ, GLTF, DAE, DWG', model_layers: 'Model Layers',
    layer_import_native: 'Layer structure is imported natively from the {type} file.',
    selected_object: 'Selected Object', click_anywhere_defect: 'Click anywhere on the model to place a defect pin.',
    clear_all_pins: 'Clear all pins', click_point_start: 'Click to set start point',
    click_second_point: 'Click to set end point', distance_calculated: 'Distance calculated',
    audit_report: 'Audit Report', no_report_generated: 'Click "AI Model Audit" to scan the current view for issues.',
    close_audit: 'Close Audit', click_object_3d: 'Click an object in the 3D model to see details.',
    ai_high_end_rendering: 'AI High-End Rendering', style_presets: 'Style Presets',
    photorealistic: 'Photorealistic', blue_hour: 'Blue Hour', cyberpunk: 'Cyberpunk',
    pencil_sketch: 'Pencil Sketch', clay_model: 'Clay Model', watercolor: 'Watercolor',
    custom_prompt: 'Custom Prompt', describe_lighting_mood: 'Describe lighting, mood, season...',
    click_generate_render: 'Click to generate render', generating_render: 'Generating Render...',
    download_image: 'Download Image', save_to_dataroom: 'Save to Data Room', describe_defect: 'Describe Defect',
    cancel: 'Cancel', create_ticket: 'Create Ticket', defect_placeholder: 'e.g. Crack in wall',
    type: 'Type', material: 'Material', cost: 'Cost', status: 'Status',
    dwg_mock: 'DWG loaded via Cloud Conversion (Mock)', saving_cloud: 'Saving to cloud...',
    saved_cloud: 'Saved to Data Room!', create_pdf_btn: '+ Create PDF', pdf_exported: 'PDF Exported!',
    export_error: 'Error generating PDF.', report_title: 'Report Title', report_color: 'Accent Color',
    report_footer: 'Footer Text', upload_logo: 'Upload Logo', format: 'Format', orientation: 'Orientation',
    landscape: 'Landscape', portrait: 'Portrait', pdf_export: 'Report Studio', generating_pdf: 'Generating PDF...',
    mobile_3d_title: 'BIM 3D Viewer', mobile_3d_desc: 'Complex 3D models require significant memory. To prevent crashes, the 3D view is paused on smartphones. Please use a desktop PC for the full experience.',
    force_load: 'Load anyway (High RAM)', download_pdf_local: 'Download Locally'
  },
  de: {
    error_loading_ifc: 'Fehler beim Laden der IFC', defect: 'Mangel', defect_saved: 'Mangel gespeichert!',
    error_saving_defect: 'Fehler beim Speichern des Mangels.', ai_audit_complete: 'KI Audit abgeschlossen.',
    error_generating_render: 'Fehler beim Generieren des Renderings.', render_saved: 'Rendering gespeichert!',
    error_saving_cloud: 'Fehler beim Speichern in der Cloud.', fbx_optimization_info: 'FBX-Modelle werden in der Cloud automatisch optimiert.',
    unsupported_format: 'Nicht unterstütztes Format. Bitte IFC, OBJ, GLTF, DAE oder DWG verwenden.',
    model_saved: 'Modell gespeichert!', error_processing_model: 'Fehler bei der Modellverarbeitung.',
    enter_new_name: 'Neuen Namen eingeben:', confirm_delete_model: 'Möchtest du dieses Modell wirklich löschen?',
    layer_arch: 'Architektur', layer_tga: 'TGA / HLK', layer_fire: 'Brandschutz', layer_struct: 'Tragwerk',
    viewer_title: '3D Viewer', analyzing_model: 'Analysiert...', ai_modelaudit: 'KI Modell-Audit',
    ai_render: 'KI Rendering', rotate: 'Drehen', pan: 'Verschieben', defect_pin_mode: 'Mangel-Pin Modus',
    measurement_mode: 'Messwerkzeug', exploded_view: 'Explosionsansicht', ai_site_tour: 'KI Baustellen-Tour',
    floor_up: 'Stockwerk hoch', floor_down: 'Stockwerk runter', download_screenshot: 'Screenshot', fullscreen: 'Vollbild',
    model_library: 'Modell-Bibliothek', rename: 'Umbenennen', upload_model: 'Modell hochladen',
    supported_3d_formats: 'Unterstützt: IFC, OBJ, GLTF, DAE, DWG', model_layers: 'Modell-Ebenen',
    layer_import_native: 'Ebenenstruktur wird nativ aus der {type}-Datei importiert.',
    selected_object: 'Ausgewähltes Objekt', click_anywhere_defect: 'Klicke auf das Modell, um einen Mangel-Pin zu setzen.',
    clear_all_pins: 'Alle Pins löschen', click_point_start: 'Klicke für Startpunkt',
    click_second_point: 'Klicke für Endpunkt', distance_calculated: 'Distanz berechnet',
    audit_report: 'Prüfbericht', no_report_generated: 'Klicke auf "KI Modell-Audit", um die aktuelle Ansicht zu prüfen.',
    close_audit: 'Audit schließen', click_object_3d: 'Klicke auf ein Objekt im 3D-Modell, um Details zu sehen.',
    ai_high_end_rendering: 'KI High-End Rendering', style_presets: 'Stil-Vorlagen',
    photorealistic: 'Fotorealistisch', blue_hour: 'Blaue Stunde', cyberpunk: 'Cyberpunk',
    pencil_sketch: 'Bleistiftskizze', clay_model: 'Gipsmodell', watercolor: 'Aquarell',
    custom_prompt: 'Eigener Prompt', describe_lighting_mood: 'Beschreibe Licht, Stimmung, Jahreszeit...',
    click_generate_render: 'Rendering generieren', generating_render: 'Generiert Rendering...',
    download_image: 'Bild herunterladen', save_to_dataroom: 'In Datenraum speichern', describe_defect: 'Mangel beschreiben',
    cancel: 'Abbrechen', create_ticket: 'Ticket erstellen', defect_placeholder: 'z.B. Riss in der Wand',
    type: 'Typ', material: 'Material', cost: 'Kosten', status: 'Status',
    dwg_mock: 'DWG über Cloud-Konvertierung geladen (Mock)', saving_cloud: 'Speichert in Cloud...',
    saved_cloud: 'In Bau-Akte gespeichert!', create_pdf_btn: '+ PDF erstellen', pdf_exported: 'PDF erfolgreich exportiert!',
    export_error: 'Fehler bei der PDF-Erstellung.', report_title: 'Bericht Titel', report_color: 'Akzentfarbe',
    report_footer: 'Fusszeile', upload_logo: 'Logo hochladen', format: 'Format', orientation: 'Ausrichtung',
    landscape: 'Querformat', portrait: 'Hochformat', pdf_export: 'Report Studio', generating_pdf: 'PDF wird erstellt...',
    mobile_3d_title: 'BIM 3D-Viewer', mobile_3d_desc: 'Komplexe 3D-Modelle benötigen viel Arbeitsspeicher. Um Abstürze zu vermeiden, ist die 3D-Ansicht auf Smartphones pausiert. Bitte wechsle für das volle Erlebnis an einen Desktop-PC oder Tablet.',
    force_load: 'Trotzdem laden (Hoher RAM)', download_pdf_local: 'Lokal herunterladen'
  }
};

const formatBytes = (bytes: number) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const pdfStyles = StyleSheet.create({
  page: { padding: '15mm', fontFamily: 'Helvetica', fontSize: 10, color: '#374151', backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 2, paddingBottom: 10, marginBottom: 15 },
  title: { fontSize: 20, fontStyle: 'normal', color: '#000000', textTransform: 'uppercase' },
  meta: { fontSize: 8, color: '#6b7280', marginTop: 4 },
  logo: { width: 100, height: 40, objectFit: 'contain' },
  content: { flex: 1, flexDirection: 'column', gap: 15 },
  imageContainer: { width: '100%', height: 250, backgroundColor: '#f3f4f6', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  snapshot: { width: '100%', height: '100%', objectFit: 'contain' },
  noImageText: { color: '#9ca3af', fontStyle: 'italic', alignSelf: 'center', marginTop: 20 },
  section: { marginTop: 10, padding: 10, backgroundColor: '#f9fafb', borderRadius: 6, borderWidth: 1, borderColor: '#f3f4f6' },
  sectionTitle: { fontSize: 12, fontStyle: 'normal', marginBottom: 8, textTransform: 'uppercase' },
  text: { fontSize: 9, lineHeight: 1.5, color: '#4b5563' },
  defectList: { marginTop: 5, display: 'flex', flexDirection: 'column', gap: 6 },
  defectItem: { padding: 6, backgroundColor: '#ffffff', borderLeftWidth: 3, borderLeftColor: '#ef4444', borderRadius: 4 },
  defectTitle: { fontSize: 9, fontStyle: 'normal', color: '#111827' },
  defectDesc: { fontSize: 8, color: '#4b5563', marginTop: 2 },
  defectMeta: { fontSize: 7, color: '#9ca3af', marginTop: 3 },
  footer: { position: 'absolute', bottom: '10mm', left: '15mm', right: '15mm', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 5, flexDirection: 'row', justifyContent: 'space-between' }
});

const BIMReportPDFDocument = ({ settings, docHeader, snapshotImage, auditReport, defectPins, t }: any) => {
  return (
    <Document>
      <Page size={settings.format} orientation={settings.orientation} style={pdfStyles.page}>
        <View style={[pdfStyles.header, { borderBottomColor: settings.accentColor }]} fixed>
          <View>
            <Text style={pdfStyles.title}>{docHeader?.title || 'BIM Audit Report'}</Text>
            <Text style={pdfStyles.meta}>{docHeader?.project || 'Projekt'} | Stand: {new Date(docHeader?.date || new Date()).toLocaleDateString('de-CH')}</Text>
          </View>
          {settings.logo && <PDFImage src={settings.logo} style={pdfStyles.logo} />}
        </View>

        <View style={pdfStyles.content}>
          {snapshotImage ? (
            <View style={[pdfStyles.imageContainer, { borderColor: settings.accentColor }]}>
              <PDFImage src={snapshotImage} style={pdfStyles.snapshot} />
            </View>
          ) : (
            <Text style={pdfStyles.noImageText}>Kein 3D-Snapshot vorhanden.</Text>
          )}

          <View style={pdfStyles.section}>
            <Text style={[pdfStyles.sectionTitle, { color: settings.accentColor }]}>{t('audit_report')}</Text>
            <Text style={pdfStyles.text}>{auditReport || "Kein Audit-Bericht für diese Ansicht generiert."}</Text>
          </View>

          {defectPins && defectPins.length > 0 && (
            <View style={pdfStyles.section}>
              <Text style={[pdfStyles.sectionTitle, { color: settings.accentColor }]}>Erfasste Mängel ({defectPins.length})</Text>
              <View style={pdfStyles.defectList}>
                {defectPins.map((pin: any, idx: number) => (
                  <View key={idx} style={pdfStyles.defectItem}>
                    <Text style={pdfStyles.defectTitle}>Mangel #{idx + 1}</Text>
                    <Text style={pdfStyles.defectDesc}>{pin.description}</Text>
                    <Text style={pdfStyles.defectMeta}>Position: X:{pin.position.x?.toFixed(1) || 0} Y:{pin.position.y?.toFixed(1) || 0} Z:{pin.position.z?.toFixed(1) || 0}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={pdfStyles.footer} fixed>
          <Text style={{ fontSize: 7, color: '#9ca3af' }}>{settings.footerText}</Text>
          <Text style={{ fontSize: 7, color: '#9ca3af' }} render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};

function SnapshotHelper() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    (window as any).captureBimSnapshot = () => {
      gl.render(scene, camera);
      return gl.domElement.toDataURL('image/png');
    };
    return () => { delete (window as any).captureBimSnapshot; };
  }, [gl, scene, camera]);
  return null;
}

const normalizeModel = (scene: THREE.Object3D) => {
  const box = new THREE.Box3().setFromObject(scene);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  scene.position.x = -center.x;
  scene.position.y = -center.y;
  scene.position.z = -center.z;

  const maxDim = Math.max(size.x, size.y, size.z);
  if (maxDim > 0) {
    const scale = 10 / maxDim;
    scene.scale.set(scale, scale, scale);
  }

  scene.traverse((child: any) => {
    if (child.isMesh && child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((mat: any) => {
          if (mat.map) {
            mat.map.generateMipmaps = false;
            mat.map.minFilter = THREE.LinearFilter;
          }
        });
      } else if (child.material.map) {
        child.material.map.generateMipmaps = false;
        child.material.map.minFilter = THREE.LinearFilter;
      }
    }
  });
  return scene;
};

function IfcModel({ url, onSelect, t }: { url: string, onSelect: (id: string, details: any) => void, t: (key: string) => string }) {
  const [model, setModel] = useState<any>(null);
  const { addToast } = useToast();
  useEffect(() => {
    const loader = new IFCLoader();
    loader.ifcManager.setWasmPath('https://unpkg.com/web-ifc@0.0.36/');
    loader.load(url, (ifcModel) => { 
      normalizeModel(ifcModel);
      setModel(ifcModel); 
    }, undefined, (error) => { console.error("Error loading IFC:", error); addToast(t('error_loading_ifc'), "error"); });
  }, [url, addToast, t]);

  if (!model) return null;
  return (
    <Center>
      <primitive object={model} onClick={(e: any) => { e.stopPropagation(); if (e.object.geometry && e.faceIndex !== undefined) { onSelect(`ifc-element-${Math.floor(Math.random() * 1000)}`, { type: 'IFC Element', material: 'Unknown', cost: 'N/A', status: 'Imported' }); } }} />
    </Center>
  );
}

function GltfModel({ url, onClick }: { url: string, onClick: (e: any) => void }) { 
  const gltf = useLoader(GLTFLoader, url, (loader: any) => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(dracoLoader);
  }); 
  useEffect(() => { normalizeModel(gltf.scene); }, [gltf]);
  return <Center><primitive object={gltf.scene} onClick={onClick} /></Center>; 
}

function ObjModel({ url, onClick }: { url: string, onClick: (e: any) => void }) { 
  const obj = useLoader(OBJLoader, url); 
  useEffect(() => { normalizeModel(obj); }, [obj]);
  return <Center><primitive object={obj} onClick={onClick} /></Center>; 
}

function DaeModel({ url, onClick }: { url: string, onClick: (e: any) => void }) { 
  const dae = useLoader(ColladaLoader, url); 
  useEffect(() => { normalizeModel(dae.scene); }, [dae]);
  return <Center><primitive object={dae.scene} onClick={onClick} /></Center>; 
}

function DwgModel({ onClick, t }: { onClick: (e: any) => void, t: (key: string) => string }) {
  return (
    <group onClick={onClick}>
      <Center><mesh><boxGeometry args={[10, 10, 10]} /><meshBasicMaterial color="#3b82f6" wireframe={true} /></mesh></Center>
      <Html position={[0, 6, 0]} center zIndexRange={[10, 0]}>
        <div className="bg-surface/90 backdrop-blur-md border border-blue-500/50 text-blue-400 px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-xl flex items-center gap-2"><Loader2 size={16} className="animate-spin" /><span>{t('dwg_mock')}</span></div>
      </Html>
    </group>
  );
}

function UploadedModelViewer({ url, type, onSelect, measureMode, onMeasureClick, defectMode, onDefectClick, t }: any) {
  const tType = type?.toLowerCase() || '';

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (measureMode) {
      onMeasureClick(e.point);
    } else if (defectMode) {
      let worldNormal = new THREE.Vector3(0, 1, 0);
      if (e.face?.normal && e.object) {
        const normalMatrix = new THREE.Matrix3().getNormalMatrix(e.object.matrixWorld);
        worldNormal = e.face.normal.clone().applyMatrix3(normalMatrix).normalize();
      }
      onDefectClick(e.point, worldNormal);
    } else {
      onSelect(`uploaded-element-${Math.floor(Math.random() * 1000)}`, { type: `${type.toUpperCase()} Element`, material: 'Imported', cost: 'N/A', status: 'Loaded' });
    }
  };

  if (tType === 'ifc') return <IfcModel url={url} onSelect={onSelect} t={t} />;
  if (tType === 'obj') return <ObjModel url={url} onClick={handleClick} />;
  if (tType === 'gltf' || tType === 'glb') return <GltfModel url={url} onClick={handleClick} />;
  if (tType === 'dae') return <DaeModel url={url} onClick={handleClick} />;
  if (tType === 'dwg') return <DwgModel onClick={handleClick} t={t} />;
  return null;
}

function CameraRig({ isTouring }: { isTouring: boolean }) {
  const timeRef = useRef(0);
  useFrame((state, delta) => {
    if (isTouring) {
      timeRef.current += delta;
      const t = timeRef.current * 0.2;
      const x = Math.sin(t) * 25; const z = Math.cos(t) * 25; const y = 10 + Math.sin(t * 2) * 5;
      state.camera.position.lerp(new THREE.Vector3(x, y, z), delta * 2);
      state.camera.lookAt(0, 4, 0);
    }
  });
  return null;
}

function Building({ layers, activeFloor, selectedId, onSelect, isExploded, measureMode, onMeasureClick, defectMode, onDefectClick }: any) {
  const isArchVisible = layers.find((l: any) => l.id === 'arch')?.visible;
  const isTgaVisible = layers.find((l: any) => l.id === 'tga')?.visible;
  const isStructVisible = layers.find((l: any) => l.id === 'struct')?.visible;
  const isFireVisible = layers.find((l: any) => l.id === 'fire')?.visible;

  const floors = [0, 1, 2];
  const floorRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame((state, delta) => {
    floors.forEach((floor, i) => {
      const ref = floorRefs.current[i];
      if (ref) {
        const targetY = (floor * 4) + (isExploded ? floor * 5 : 0);
        ref.position.y = THREE.MathUtils.lerp(ref.position.y, targetY, delta * 5);
      }
    });
  });

  const handleClick = (e: any, id: string) => {
    e.stopPropagation();
    if (measureMode) {
      onMeasureClick(e.point);
    } else if (defectMode) {
      let worldNormal = new THREE.Vector3(0, 1, 0);
      if (e.face?.normal && e.object) {
        const normalMatrix = new THREE.Matrix3().getNormalMatrix(e.object.matrixWorld);
        worldNormal = e.face.normal.clone().applyMatrix3(normalMatrix).normalize();
      }
      onDefectClick(e.point, worldNormal);
    } else {
      onSelect(id);
    }
  };

  return (
    <group position={[0, -1, 0]}>
      {floors.map((floor, i) => {
        if (activeFloor !== null && activeFloor !== floor) return null;
        return (
          <group key={floor} ref={(el) => (floorRefs.current[i] = el)} position={[0, floor * 4, 0]}>
            {isStructVisible && (
              <DreiBox args={[12, 0.4, 12]} position={[0, 0.2, 0]} onClick={(e) => handleClick(e, `slab-${floor}`)}>
                <meshStandardMaterial color={selectedId === `slab-${floor}` ? "#fcd34d" : "#f97316"} transparent opacity={0.8} />
              </DreiBox>
            )}
            {isStructVisible && (
              <group>
                {[[-5, -5], [5, -5], [-5, 5], [5, 5], [0, 0]].map((pos, idx) => (
                  <Cylinder key={idx} args={[0.3, 0.3, 3.6]} position={[pos[0], 2.2, pos[1]]} onClick={(e) => handleClick(e, `col-${floor}-${idx}`)}>
                    <meshStandardMaterial color={selectedId === `col-${floor}-${idx}` ? "#fcd34d" : "#ea580c"} />
                  </Cylinder>
                ))}
              </group>
            )}
            {isArchVisible && (
              <group>
                <DreiBox args={[4, 3.6, 4]} position={[0, 2.2, 0]} onClick={(e) => handleClick(e, `core-${floor}`)}>
                  <meshStandardMaterial color={selectedId === `core-${floor}` ? "#fcd34d" : "#a1a1aa"} />
                </DreiBox>
                <DreiBox args={[11.6, 3.6, 0.1]} position={[0, 2.2, -5.8]} onClick={(e) => handleClick(e, `glass-n-${floor}`)}><meshStandardMaterial color="#38bdf8" transparent opacity={0.2} metalness={0.9} roughness={0.1} /></DreiBox>
                <DreiBox args={[11.6, 3.6, 0.1]} position={[0, 2.2, 5.8]} onClick={(e) => handleClick(e, `glass-s-${floor}`)}><meshStandardMaterial color="#38bdf8" transparent opacity={0.2} metalness={0.9} roughness={0.1} /></DreiBox>
                <DreiBox args={[0.1, 3.6, 11.6]} position={[-5.8, 2.2, 0]} onClick={(e) => handleClick(e, `glass-w-${floor}`)}><meshStandardMaterial color="#38bdf8" transparent opacity={0.2} metalness={0.9} roughness={0.1} /></DreiBox>
                <DreiBox args={[0.1, 3.6, 11.6]} position={[5.8, 2.2, 0]} onClick={(e) => handleClick(e, `glass-e-${floor}`)}><meshStandardMaterial color="#38bdf8" transparent opacity={0.2} metalness={0.9} roughness={0.1} /></DreiBox>
              </group>
            )}
            {isTgaVisible && (
              <group>
                <DreiBox args={[8, 0.4, 0.6]} position={[0, 3.6, 2]} onClick={(e) => handleClick(e, `hvac-main-${floor}`)}>
                  <meshStandardMaterial color={selectedId === `hvac-main-${floor}` ? "#fcd34d" : "#3b82f6"} metalness={0.8} roughness={0.2} />
                </DreiBox>
                <DreiBox args={[0.4, 0.4, 6]} position={[2, 3.6, -1]} onClick={(e) => handleClick(e, `hvac-branch-${floor}`)}>
                  <meshStandardMaterial color={selectedId === `hvac-branch-${floor}` ? "#fcd34d" : "#3b82f6"} metalness={0.8} roughness={0.2} />
                </DreiBox>
              </group>
            )}
            {isFireVisible && (
              <group>
                <DreiBox args={[0.3, 0.5, 0.3]} position={[-2, 1, -2]} onClick={(e) => handleClick(e, `fire-1-${floor}`)}><meshStandardMaterial color="#ef4444" /></DreiBox>
                <DreiBox args={[0.3, 0.5, 0.3]} position={[2, 1, 2]} onClick={(e) => handleClick(e, `fire-2-${floor}`)}><meshStandardMaterial color="#ef4444" /></DreiBox>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
}

export default function BIMViewer() {
  const { projectId } = useParams<{ projectId: string }>();
  const { language, t: globalT } = useLanguage();
  const t = (key: string) => localTranslations[language as 'en' | 'de']?.[key] || globalT(key);

  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
  useEffect(() => { setPortalNode(document.body); }, []);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser && !hasFeature(currentUser, '3d_bim')) {
      navigate('/app', { replace: true });
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('open-upgrade-modal'));
      }, 100);
    }
  }, [currentUser, navigate]);

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      const isUserAgentMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      return isUserAgentMobile || window.innerWidth < 1024;
    }
    return false;
  });
  
  const [forceMobile3D, setForceMobile3D] = useState(false);
  const [showMobileTools, setShowMobileTools] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isUserAgentMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isUserAgentMobile || window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const originalWarn = console.warn;
    const originalError = console.error;
    console.warn = (...args) => {
      const msg = typeof args[0] === 'string' ? args[0] : '';
      if (/THREE|texSubImage|WebGL|mozPressure|mozInputSource|deprecated/i.test(msg)) return;
      originalWarn(...args);
    };
    console.error = (...args) => {
      const msg = typeof args[0] === 'string' ? args[0] : '';
      if (/WebChannelConnection|RPC 'Listen'|520|WebGL|texSubImage/i.test(msg)) return;
      originalError(...args);
    };
    return () => { console.warn = originalWarn; console.error = originalError; };
  }, []);
  
  const [layerVis, setLayerVis] = useState<Record<string, boolean>>({
    arch: true, tga: true, fire: false, struct: true
  });

  const toggleLayer = (id: string) => setLayerVis(prev => ({ ...prev, [id]: !prev[id] }));

  const layersInfo = [
    { id: 'arch', name: t('layer_arch'), visible: layerVis['arch'], color: 'bg-zinc-400' },
    { id: 'tga', name: t('layer_tga'), visible: layerVis['tga'], color: 'bg-blue-500' },
    { id: 'fire', name: t('layer_fire'), visible: layerVis['fire'], color: 'bg-red-500' },
    { id: 'struct', name: t('layer_struct'), visible: layerVis['struct'], color: 'bg-orange-500' },
  ];

  const [activeFloor, setActiveFloor] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<any>(null);
  
  const [auditMode, setAuditMode] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditReport, setAuditReport] = useState<string | null>(null);
  
  const [isExploded, setIsExploded] = useState(false);
  const [cameraMode, setCameraMode] = useState<'rotate' | 'pan'>('rotate');
  
  const [measureMode, setMeasureMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<THREE.Vector3[]>([]);
  const [defectMode, setDefectMode] = useState(false);
  const [defectPins, setDefectPins] = useState<{position: THREE.Vector3, normal: THREE.Vector3, id: string, description: string}[]>([]);
  const [isTouring, setIsTouring] = useState(false);
  
  const { addToast } = useToast();
  const { theme } = useTheme(); 
  const { projects, isDemoMode, demoData } = useProject() as any;
  
  const activeProject = projects?.find((p: any) => p.id === projectId);

  const [customModels, setCustomModels] = useState<any[]>([]);
  const [activeModelId, setActiveModelId] = useState<string>(() => {
    return localStorage.getItem(`kreativdesk_bim_${projectId}`) || 'default';
  });

  const mainInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!db || !projectId || !activeModelId || !currentUser?.companyId) return;

    if (activeModelId === 'default') {
      const cached = sessionStorage.getItem(`bim_cache_${projectId}_default`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setDefectPins(parsed.defectPins ? parsed.defectPins.map((p: any) => ({
            ...p, 
            position: new THREE.Vector3(p.position.x, p.position.y, p.position.z),
            normal: new THREE.Vector3(p.normal.x, p.normal.y, p.normal.z)
          })) : []);
          setMeasurePoints(parsed.measurePoints ? parsed.measurePoints.map((p: any) => new THREE.Vector3(p.x, p.y, p.z)) : []);
        } catch (e) {
          setDefectPins([]);
          setMeasurePoints([]);
        }
      } else if (isDemoMode) {
        setDefectPins([
          {
            position: new THREE.Vector3(0, 2.2, 2.1), 
            normal: new THREE.Vector3(0, 0, 1),
            id: 'DEF-1',
            description: 'Riss im Sichtbeton Achse B'
          }
        ]);
        setMeasurePoints([]);
      } else {
        setDefectPins([]);
        setMeasurePoints([]);
      }
      return;
    }

    if (isDemoMode) return;

    const q = query(
      collection(db, 'defects'), 
      where('companyId', '==', currentUser.companyId),
      where('projectId', '==', projectId)
    );

    const unsub = onSnapshot(q, (snap) => {
      const loadedPins: any[] = [];
      snap.docs.forEach(doc => {
        const data = doc.data();
        if (data.modelId === activeModelId && data.title) {
           loadedPins.push({
             id: doc.id,
             position: new THREE.Vector3(data.posX || 0, data.posY || 0, data.posZ || 0),
             normal: new THREE.Vector3(0, 1, 0),
             title: data.title,
             description: data.description || '',
             status: data.status || 'To Do',
             modelId: data.modelId 
           });
        }
      });
      setDefectPins(loadedPins); 
    });

    setSelectedId(null);
    setDefectPrompt(null);
    setAuditMode(false);
    setIsTouring(false);
    setAuditReport(null);

    return () => unsub();
  }, [activeModelId, projectId, currentUser, isDemoMode]);

  useEffect(() => {
    if (activeModelId === 'default') {
      const cacheData = {
        defectPins: defectPins.map(p => ({
          ...p,
          position: { x: p.position.x, y: p.position.y, z: p.position.z },
          normal: { x: p.normal.x, y: p.normal.y, z: p.normal.z }
        })),
        measurePoints: measurePoints.map(p => ({ x: p.x, y: p.y, z: p.z }))
      };
      sessionStorage.setItem(`bim_cache_${projectId}_default`, JSON.stringify(cacheData));
    }
  }, [defectPins, measurePoints, activeModelId, projectId]);

  const [isUploading, setIsUploading] = useState(false);

  const activeModel = activeModelId === 'default' ? null : customModels.find(m => m.id === activeModelId);

  const [isRendering, setIsRendering] = useState(false);
  const [renderPrompt, setRenderPrompt] = useState('Photorealistic architectural rendering, daylight, clear sky, high quality, 8k resolution, cinematic composition');
  const [activeStyle, setActiveStyle] = useState('realistic');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showRenderModal, setShowRenderModal] = useState(false);

  const [isPdfStudioOpen, setIsPdfStudioOpen] = useState(false);
  const [snapshotImage, setSnapshotImage] = useState<string | null>(null);
  const [docHeader, setDocHeader] = useState({ title: 'BIM Audit Report', project: activeProject?.name || 'Workspace', version: 'v1.0', date: new Date().toISOString().split('T')[0] });
  
  const viewerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [defectPrompt, setDefectPrompt] = useState<any>(null);

  useEffect(() => {
    if (isDemoMode) {
      setCustomModels([]);
      return;
    }

    if (!projectId || !db || !currentUser?.companyId) return;
    const q = query(
      collection(db, 'documents'), 
      where('companyId', '==', currentUser.companyId),
      where('projectId', '==', projectId)
    );
    const unsub = onSnapshot(q, (snap) => {
      const allDocs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const models = allDocs.filter(d => {
        const type = String((d as any).type || '').toLowerCase();
        const name = String((d as any).name || '').toLowerCase();
        return ['obj', 'gltf', 'glb', 'dae', 'ifc', 'dwg', 'fbx', '3d model'].includes(type) ||
               name.endsWith('.obj') || name.endsWith('.gltf') || name.endsWith('.glb') || 
               name.endsWith('.dae') || name.endsWith('.ifc') || name.endsWith('.dwg') || name.endsWith('.fbx');
      });
      setCustomModels(models);
    });
    return () => unsub();
  }, [projectId, currentUser, isDemoMode]);

  const ensureFolder = async (folderName: string, docCategory: string) => {
    if (!currentUser?.companyId || !projectId) return '';
    const folderQ = query(
      collection(db, 'documents'), 
      where('name', '==', folderName), 
      where('isFolder', '==', true), 
      where('projectId', '==', projectId),
      where('companyId', '==', currentUser.companyId)
    );
    const folderSnap = await getDocs(folderQ);
    if (!folderSnap.empty) return folderSnap.docs[0].id;
    const newFolderRef = await addDoc(collection(db, 'documents'), { 
      name: folderName, isFolder: true, category: docCategory, 
      ownerId: currentUser.uid, companyId: currentUser.companyId,
      projectId: projectId, createdAt: new Date().toISOString() 
    });
    return newFolderRef.id;
  };

  const handleSelect = (id: string, details?: any) => { setSelectedId(id); if (details) { setSelectedDetails(details); } else { setSelectedDetails(null); } };
  const handleMeasureClick = (point: THREE.Vector3) => { if (measurePoints.length >= 2) { setMeasurePoints([point]); } else { setMeasurePoints([...measurePoints, point]); } };
  const handleDefectClick = async (point: THREE.Vector3, normal: THREE.Vector3) => { setDefectPrompt({ isOpen: true, point, normal, value: "" }); };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) { viewerRef.current?.requestFullscreen().catch(err => console.error(err)); } else { document.exitFullscreen(); }
  };

  const handleDefectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!defectPrompt || !defectPrompt.value) return;
    const { point, normal, value: desc } = defectPrompt;
    setDefectPrompt(null);
    const newPin = { position: point, normal, id: `DEF-${Date.now()}`, description: desc, title: desc };
    
    setDefectPins(prev => [...prev, newPin]);
    
    if (isDemoMode) {
      addToast(t('defect_saved'), 'success');
      return;
    }

    if (currentUser && currentUser.companyId && db) {
      try {
        const base64DataUrl = typeof (window as any).captureBimSnapshot === 'function' ? (window as any).captureBimSnapshot() : canvasRef.current?.toDataURL('image/png');
        let imageUrl = '';
        if (storage && base64DataUrl) {
          const blob = new Blob([new Uint8Array(atob(base64DataUrl.split(',')[1]).split('').map(c => c.charCodeAt(0)))], {type: 'image/png'});
          const isAllowed = await checkStorageLimit(currentUser.companyId, blob.size);
          if (!isAllowed) {
            addToast('Speicherplatz-Limit erreicht! Bitte upgrade dein Abo.', 'error');
            return;
          }
          const storageRef = ref(storage, `${currentUser!.companyId}/defects/${newPin.id}.png`);
          await uploadBytes(storageRef, blob);
          imageUrl = await getDownloadURL(storageRef);
          await incrementStorage(currentUser.companyId, blob.size);
        }
        
        await setDoc(doc(db, 'defects', newPin.id), { 
          id: newPin.id, 
          title: desc || 'Neuer Mangel', 
          status: 'To Do', 
          priority: 'Medium', 
          assignee: 'Unassigned', 
          date: new Date().toISOString().split('T')[0], 
          trade: 'Architektur', 
          location: `3D Model`, 
          description: `Erfasst im 3D-Viewer.`, 
          imageUrl: imageUrl || '', 
          ownerId: currentUser.uid, 
          companyId: currentUser.companyId, 
          projectId: projectId,
          modelId: activeModelId, 
          posX: point.x,
          posY: point.y,
          posZ: point.z
        });
        addToast(t('defect_saved'), 'success');
      } catch (err) { 
        console.error("Defect Error:", err);
        addToast(t('error_saving_defect'), 'error'); 
      }
    }
  };

  const handleAudit = async () => {
    setAuditMode(true); setIsAuditing(true); setAuditReport(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const dataUrl = typeof (window as any).captureBimSnapshot === 'function' ? (window as any).captureBimSnapshot() : canvasRef.current?.toDataURL('image/png');
      const base64Data = dataUrl?.split(',')[1];
      if (!base64Data) throw new Error("No image data");
      const prompt = language === 'de' ? `Du bist ein erfahrener BIM-Auditor. Analysiere diesen Screenshot. Erstelle einen Prüfbericht in 3 Stichpunkten auf Deutsch.` : `You are an expert BIM auditor. Analyze this screenshot. Provide a report in 3 bullet points in English.`;
      const response = await callGeminiAPI('gemini-2.5-flash', [ { inlineData: { data: base64Data, mimeType: 'image/png' } }, { text: prompt } ]);
      setAuditReport(response.text || 'Audit completed with no findings.');
      addToast(t('ai_audit_complete'), "success");
    } catch (error: any) { setAuditReport("Fehler beim Audit."); } finally { setIsAuditing(false); }
  };

  const handleGenerateRender = async () => {
    setIsRendering(true);
    try {
      const dataUrl = typeof (window as any).captureBimSnapshot === 'function' ? (window as any).captureBimSnapshot() : canvasRef.current?.toDataURL('image/png');
      
      let uploadedImageUrl = undefined;
      if (dataUrl && currentUser && storage) {
        try {
          const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
          const fetchRes = await fetch(dataUrl);
          const blob = await fetchRes.blob();
          const fileName = `tmp_render_3d_${Date.now()}.png`;
          const storageRef = ref(storage, `${currentUser.companyId}/whiteboardExports/${currentUser.uid}/tmp/${fileName}`);
          await uploadBytes(storageRef, blob);
          uploadedImageUrl = await getDownloadURL(storageRef);
        } catch (err) {
          console.error("Failed to upload temp snapshot", err);
        }
      }

      const prompt = `Transform a 3D building model view into a high-end architectural rendering. Style: ${renderPrompt}`;
      const encodedPrompt = encodeURIComponent(prompt.substring(0, 1000));
      
      let pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&enhance=true&seed=${Math.floor(Math.random() * 10000)}&model=flux`;
      
      if (uploadedImageUrl) {
        pollinationsUrl += `&image=${encodeURIComponent(uploadedImageUrl)}`;
      }

      console.log("Fetching rendering directly from Pollinations...", pollinationsUrl);
      
      // Fetch directly from frontend to avoid Vercel's 10-second timeout!
      const imageRes = await fetch(pollinationsUrl);
      if (!imageRes.ok) {
        throw new Error(`Failed to generate image: ${imageRes.statusText}`);
      }
      
      const blob = await imageRes.blob();
      
      // Convert Blob to Base64 data URL so handleSaveRenderToCloud works without modification
      const reader = new FileReader();
      reader.onloadend = () => {
        setGeneratedImage(reader.result as string);
        setIsRendering(false);
      };
      reader.readAsDataURL(blob);
      
    } catch (error: any) { 
      console.error(error);
      addToast(t('error_generating_render'), "error"); 
      setIsRendering(false);
    }
  };

  const handleSaveRenderToCloud = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!generatedImage || !currentUser || !projectId) return;
    setIsUploading(true);
    try {
      const base64Data = generatedImage.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
      const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'image/png' });
      const isAllowed = await checkStorageLimit(currentUser.companyId, blob.size);
      if (!isAllowed) {
        addToast('Speicherplatz-Limit erreicht! Bitte upgrade dein Abo.', 'error');
        setIsUploading(false);
        return;
      }
      const fileName = `AI_Render_${activeStyle}_${Date.now()}.png`;
      const storageRef = ref(storage, `${currentUser!.companyId}/ai_renders/${fileName}`);
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      await incrementStorage(currentUser.companyId, blob.size);
      const docCategory = projectId === 'global' ? 'company' : 'projects';
      const targetFolderId = await ensureFolder("KI Renderings", docCategory);
      await addDoc(collection(db, 'documents'), { name: fileName, url: downloadUrl, fileUrl: downloadUrl, projectId: projectId, folderId: targetFolderId, ownerId: currentUser.uid, uploadedBy: currentUser.uid, companyId: currentUser.companyId, type: 'image/png', size: formatBytes(blob.size), uploadedAt: new Date().toISOString(), date: new Date().toLocaleDateString('de-CH') });
      addToast(t('render_saved'), 'success'); setShowRenderModal(false); setGeneratedImage(null);
    } catch (err) { addToast(t('error_saving_cloud'), 'error'); } finally { setIsUploading(false); }
  };

  const handleOpenPdfStudio = () => {
    const dataUrl = typeof (window as any).captureBimSnapshot === 'function' ? (window as any).captureBimSnapshot() : canvasRef.current?.toDataURL('image/png');
    setSnapshotImage(dataUrl);
    setIsPdfStudioOpen(true);
  };

  const handleSavePdfToCloud = async (blob: Blob) => {
    try {
      if (!currentUser || !currentUser.companyId) return;
      const isAllowed = await checkStorageLimit(currentUser.companyId, blob.size);
      if (!isAllowed) {
        addToast('Speicherplatz-Limit erreicht! Bitte upgrade dein Abo.', 'error');
        return;
      }
      const fileName = `BIM_Report_${Date.now()}.pdf`;
      const storageRef = ref(storage, `${currentUser!.companyId}/pdf_exports/${fileName}`);
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      await incrementStorage(currentUser.companyId, blob.size);

      const docCategory = projectId === 'global' ? 'company' : 'projects';
      const targetFolderId = await ensureFolder("03_PLANUNG", docCategory);

      await addDoc(collection(db, 'documents'), {
        name: fileName,
        url: downloadUrl,
        fileUrl: downloadUrl,
        projectId: projectId,
        folderId: targetFolderId, 
        category: docCategory, 
        ownerId: currentUser!.uid,
        uploadedBy: currentUser!.uid,
        companyId: currentUser!.companyId,
        type: 'application/pdf',
        size: formatBytes(blob.size), 
        isFolder: false,
        createdAt: new Date().toISOString(), 
        uploadedAt: new Date().toISOString(),
        date: new Date().toLocaleDateString('de-CH')
      });

      addToast(t('saved_cloud'), 'success');
      setIsPdfStudioOpen(false);
    } catch (error) {
      console.error(error);
      addToast(t('export_error'), 'error');
    }
  };

  const handleDeleteModel = async (id: string) => {
    if (!window.confirm(t('confirm_delete_model'))) return;
    try {
      await deleteDoc(doc(db, 'documents', id));
      if (activeModelId === id) setActiveModelId('default');
    } catch (err) { addToast(t('error_processing_model'), 'error'); }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!currentUser) {
      addToast('Fehler: Nicht autorisiert.', 'error');
      return;
    }
    
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!['ifc', 'obj', 'gltf', 'glb', 'dae', 'dwg', 'fbx'].includes(fileExt || '')) {
      addToast(t('unsupported_format'), 'error');
      event.target.value = ''; 
      return;
    }

    setIsUploading(true);
    addToast('Modell lädt in die Cloud...', 'info');

    try {
      const isAllowed = await checkStorageLimit(currentUser.companyId, file.size);
      if (!isAllowed) {
        addToast('Speicherplatz-Limit erreicht! Bitte upgrade dein Abo.', 'error');
        setIsUploading(false);
        return;
      }
      const storageRef = ref(storage, `${currentUser.companyId}/documents/${projectId}/3d_models_${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await incrementStorage(currentUser.companyId, file.size);

      const docCategory = projectId === 'global' ? 'company' : 'projects';
      const folderId = await ensureFolder("3D Modelle", docCategory);

      const newDocRef = await addDoc(collection(db, 'documents'), {
        name: file.name, url, fileUrl: url, projectId, folderId, type: fileExt,
        category: docCategory, ownerId: currentUser.uid, uploadedBy: currentUser.uid, companyId: currentUser.companyId,
        size: formatBytes(file.size), isFolder: false,
        createdAt: new Date().toISOString(), uploadedAt: new Date().toISOString(), date: new Date().toLocaleDateString('de-CH')
      });

      setActiveModelId(newDocRef.id);
      addToast(t('model_saved'), 'success');
    } catch (err) {
      console.error("Upload error:", err);
      addToast(t('error_saving_cloud'), 'error');
    } finally {
      setIsUploading(false);
      event.target.value = ''; 
    }
  };

  const triggerUpload = () => {
    if (mainInputRef.current) mainInputRef.current.click();
  };

  const uiPanels = (
    <>
      <div className="bg-surface border border-border rounded-xl p-4 flex flex-col min-h-0 shrink-0">
        <div className="flex justify-between items-center mb-3 shrink-0">
          <h3 className="font-medium flex items-center gap-2 text-sm"><Box size={16} className="text-text-muted" />{t('model_library')}</h3>
          
          <label 
            htmlFor="upload-model-header" 
            className="p-1 hover:bg-accent-ai/10 text-accent-ai rounded transition-colors cursor-pointer" 
            title={t('upload_model')}
          >
            <Plus size={16} />
          </label>
          <input 
            id="upload-model-header" 
            type="file" 
            onChange={handleFileUpload} 
            accept=".ifc,.obj,.gltf,.glb,.dae,.dwg,.fbx" 
            className="hidden" 
            disabled={isUploading} 
          />
        </div>
        <div className="space-y-2 overflow-y-auto custom-scrollbar pr-2 max-h-[150px] min-h-0 relative">
          <button 
            onClick={() => { setActiveModelId('default'); if(isMobile) setShowMobileTools(false); }} 
            className={cn("w-full flex items-center justify-between p-2 rounded-lg text-sm font-medium transition-colors border shrink-0", activeModelId === 'default' ? "bg-accent-ai/10 border-accent-ai/30 text-accent-ai" : "bg-background border-border hover:bg-surface text-text-primary")}
          >
            <span className="truncate">Munich Tech Campus v2.4</span>
            {activeModelId === 'default' && <CheckCircle2 size={16} />}
          </button>
          
          {customModels.map(model => (
            <div key={model.id} className={cn("flex items-center justify-between p-2 rounded-lg text-sm font-medium transition-colors border shrink-0", activeModelId === model.id ? "bg-accent-ai/10 border-accent-ai/30 text-accent-ai" : "bg-background border-border hover:bg-surface text-text-primary")}>
              <div className="flex-1 truncate cursor-pointer pr-2" onClick={() => { setActiveModelId(model.id); if(isMobile) setShowMobileTools(false); }}>
                {model.name}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={(e) => { e.stopPropagation(); handleDeleteModel(model.id); }} className="p-1 hover:bg-red-500/20 rounded text-text-muted hover:text-red-500"><Trash2 size={14} /></button>
                {activeModelId === model.id && <CheckCircle2 size={16} className="ml-1" />}
              </div>
            </div>
          ))}
          
          <div className="w-full mt-4">
             <button 
               onClick={triggerUpload} 
               disabled={isUploading}
               className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border bg-background hover:bg-white/5 text-text-muted hover:text-text-primary text-xs font-bold transition-colors disabled:opacity-50"
             >
               {isUploading ? <Loader2 size={16} className="animate-spin pointer-events-none" /> : <UploadCloud size={16} className="pointer-events-none" />} 
               <span className="pointer-events-none">{t('upload_model')}</span>
             </button>
             <input type="file" ref={mainInputRef} onChange={handleFileUpload} accept=".ifc,.obj,.gltf,.glb,.dae,.dwg,.fbx" className="hidden" disabled={isUploading} />
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-4 flex flex-col min-h-0 shrink-0">
        <h3 className="font-medium mb-4 flex items-center gap-2 text-sm shrink-0"><Layers size={16} className="text-text-muted" />{t('model_layers')}</h3>
        
        {activeModel ? (
          <div className="flex items-center justify-center text-center p-4 bg-background rounded-lg border border-dashed border-border overflow-hidden">
            <p className="text-xs text-text-muted">
              {t('layer_import_native').replace('{type}', activeModel.type.toUpperCase())}
            </p>
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto custom-scrollbar pr-2 max-h-[150px] min-h-0">
            {layersInfo.map((layer) => (
              <div key={layer.id} className={cn("flex items-center justify-between p-2 rounded-lg border transition-colors cursor-pointer shrink-0", layer.visible ? "bg-background border-border" : "bg-transparent border-transparent hover:bg-background")} onClick={() => toggleLayer(layer.id)}>
                <div className="flex items-center gap-3"><div className={cn("w-3 h-3 rounded-sm", layer.color, !layer.visible && "opacity-30")}></div><span className={cn("text-sm font-medium", !layer.visible && "text-text-muted")}>{layer.name}</span></div>
                <button className="text-text-muted hover:text-text-primary transition-colors">{layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-surface border border-border rounded-xl p-4 flex flex-col min-h-[250px] shrink-0">
        <h3 className="font-medium mb-3 text-sm shrink-0">
           {auditMode ? <span className="flex items-center gap-2 text-accent-warning"><ShieldAlert size={16}/> {isAuditing ? t('analyzing_model') : t('audit_report')}</span> : t('selected_object')}
        </h3>
        
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {auditMode ? (
            <div className="h-full flex flex-col animate-in fade-in min-h-0">
              {isAuditing ? (
                 <div className="flex flex-col items-center justify-center flex-1 text-accent-warning gap-3">
                   <Loader2 className="animate-spin" size={32} />
                   <span className="text-xs font-bold tracking-widest uppercase animate-pulse">{t('analyzing_model')}</span>
                 </div>
              ) : auditReport ? (
                 <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
                    <div className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">{auditReport}</div>
                 </div>
              ) : (
                 <p className="text-xs text-text-muted flex-1">{t('no_report_generated')}</p>
              )}
              <button onClick={() => setAuditMode(false)} className="w-full mt-4 py-2 bg-background border border-border hover:bg-white/5 rounded-lg text-xs font-bold transition-colors shrink-0">
                {t('close_audit')}
              </button>
            </div>
          ) : defectMode ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-red-500/50 bg-red-500/5 rounded-lg p-5 text-center mt-2 flex-1 overflow-y-auto custom-scrollbar">
              <ShieldAlert className="text-red-500 mb-2" size={24} />
              <p className="text-sm text-text-primary font-medium">{t('defect_pin_mode')}</p>
              <p className="text-xs text-text-muted mt-1">{t('click_anywhere_defect')}</p>
              {defectPins.length > 0 && (<button onClick={() => setDefectPins([])} className="mt-3 px-3 py-1.5 bg-background hover:bg-surface rounded-md text-xs border border-border text-text-primary transition-colors">{t('clear_all_pins')}</button>)}
            </div>
          ) : measureMode ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-accent-ai/50 bg-accent-ai/5 rounded-lg p-5 text-center mt-2 flex-1">
              <Ruler className="text-accent-ai mb-2" size={24} />
              <p className="text-sm text-text-primary font-medium">{t('measurement_mode')}</p>
              <p className="text-xs text-text-muted mt-1">{measurePoints.length === 0 ? t('click_point_start') : measurePoints.length === 1 ? t('click_second_point') : t('distance_calculated')}</p>
              {measurePoints.length > 0 && (<button onClick={() => setMeasurePoints([])} className="mt-3 px-3 py-1.5 bg-background hover:bg-surface rounded-md text-xs border border-border text-text-primary transition-colors">Alle Messungen löschen</button>)}
            </div>
          ) : selectedDetails ? (
            <div className="space-y-3 animate-in fade-in mt-1 flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0 pb-4">
              <div className="bg-background border border-border rounded-lg p-3"><p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">{t('type')}</p><p className="text-sm font-medium text-text-primary">{selectedDetails.type}</p></div>
              <div className="bg-background border border-border rounded-lg p-3"><p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">{t('material')}</p><p className="text-sm font-medium text-text-primary">{selectedDetails.material}</p></div>
              <div className="grid grid-cols-2 gap-3"><div className="bg-background border border-border rounded-lg p-3"><p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">{t('cost')}</p><p className="text-sm font-mono text-text-primary">{selectedDetails.cost}</p></div><div className="bg-background border border-border rounded-lg p-3"><p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">{t('status')}</p><p className="text-sm font-medium text-emerald-500">{selectedDetails.status}</p></div></div>
            </div>
          ) : (
            <div className="py-8 mt-2 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-background/50 text-center flex-1 min-h-0">
              <Box className="text-text-muted/40 mb-3" size={28} />
              <p className="text-sm text-text-muted px-4">{t('click_object_3d')}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="absolute inset-0 flex flex-col bg-background p-4 md:p-6 gap-4">
        
        <header className="flex flex-col md:flex-row md:items-start justify-between gap-4 shrink-0">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t('viewer_title')}</h1>
            <p className="text-text-muted text-sm mt-1">{activeModel ? activeModel.name : 'Munich Tech Campus - Main Building v2.4'}</p>
          </div>
          
          {!isMobile && (
            <div className="flex flex-col items-end">
              <div className="flex flex-wrap gap-2">
                <button onClick={handleAudit} className={cn("px-4 py-2 border rounded-md text-sm font-medium transition-colors flex items-center gap-2", auditMode ? "bg-accent-warning/20 border-accent-warning text-accent-warning" : "bg-surface border-accent-ai/50 text-accent-ai hover:bg-accent-ai/10")}>
                  <Sparkles size={16} />{auditMode ? t('analyzing_model') : t('audit_report')}
                </button>
                <button onClick={handleOpenPdfStudio} className="px-4 py-2 bg-surface border border-border text-text-primary rounded-md text-sm font-medium hover:bg-background transition-colors flex items-center gap-2 shadow-sm">
                  <FileText size={16} /> <span>{t('create_pdf_btn')}</span>
                </button>
                <button onClick={() => setShowRenderModal(true)} className="px-4 py-2 bg-accent-ai text-white rounded-md text-sm font-medium hover:bg-accent-ai/90 transition-colors shadow-lg shadow-accent-ai/20 flex items-center gap-2">
                  <Camera size={16} />{t('ai_render')}
                </button>
              </div>
            </div>
          )}
        </header>

        <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 overflow-hidden">
          
          <div ref={viewerRef} className="flex-1 bg-black border border-border rounded-xl relative overflow-hidden flex flex-col min-h-0 z-10">
            
            {isMobile && !forceMobile3D ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #3b82f6 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/20 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="w-24 h-24 bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 rounded-3xl flex items-center justify-center mb-8 shadow-2xl relative z-10">
                  <Box size={40} className="text-blue-400" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 relative z-10">{t('mobile_3d_title')}</h3>
                <p className="text-zinc-400 max-w-sm mb-8 leading-relaxed relative z-10">
                  {t('mobile_3d_desc')}
                </p>

                <button
                  onClick={() => setForceMobile3D(true)}
                  className="px-6 py-3.5 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-xl text-sm font-bold hover:bg-zinc-800 hover:text-white transition-all shadow-lg relative z-10 flex items-center gap-2 active:scale-95"
                >
                  <AlertTriangle size={16} className="text-orange-500"/>
                  {t('force_load')}
                </button>
              </div>
            ) : (
              <>
                <div className="absolute top-0 left-0 right-0 bg-surface/90 backdrop-blur-md border-b border-border px-4 py-2 flex flex-wrap justify-between items-center z-20 shadow-sm pointer-events-auto">
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setCameraMode('rotate'); setMeasureMode(false); setDefectMode(false); setSelectedId(null); }} className={cn("p-2 rounded-md transition-colors", cameraMode === 'rotate' && !measureMode && !defectMode ? "bg-blue-500/20 text-blue-400" : "text-text-muted hover:bg-background hover:text-text-primary")} title={t('rotate')}><Rotate3D size={18} /></button>
                    <button onClick={() => { setCameraMode('pan'); setMeasureMode(false); setDefectMode(false); setSelectedId(null); }} className={cn("p-2 rounded-md transition-colors", cameraMode === 'pan' && !measureMode && !defectMode ? "bg-blue-500/20 text-blue-400" : "text-text-muted hover:bg-background hover:text-text-primary")} title={t('pan')}><Hand size={18} /></button>
                    <div className="w-px h-4 bg-border mx-2"></div>
                    <button onClick={() => { setDefectMode(!defectMode); if (!defectMode) { setMeasureMode(false); setCameraMode('rotate'); } setSelectedId(null); }} className={cn("p-2 rounded-md transition-colors", defectMode ? "bg-red-500/20 text-red-500" : "text-text-muted hover:bg-background hover:text-text-primary")} title={t('defect_pin_mode')}><ShieldAlert size={18} /></button>
                    <button onClick={() => { setMeasureMode(!measureMode); if (!measureMode) { setDefectMode(false); setCameraMode('rotate'); } setMeasurePoints([]); setSelectedId(null); }} className={cn("p-2 rounded-md transition-colors", measureMode ? "bg-accent-ai/20 text-accent-ai" : "text-text-muted hover:bg-background hover:text-text-primary")} title={t('measurement_mode')}><Ruler size={18} /></button>
                    <div className="w-px h-4 bg-border mx-2 hidden sm:block"></div>
                    <button onClick={() => setIsExploded(!isExploded)} className={cn("p-2 rounded-md transition-colors hidden sm:block", isExploded ? "bg-accent-ai/20 text-accent-ai" : "text-text-muted hover:bg-background hover:text-text-primary")} title={t('exploded_view')}><SplitSquareVertical size={18} /></button>
                    <button onClick={() => setIsTouring(!isTouring)} className={cn("p-2 rounded-md transition-colors hidden sm:block", isTouring ? "bg-accent-ai/20 text-accent-ai" : "text-text-muted hover:bg-background hover:text-text-primary")} title={t('ai_site_tour')}><Video size={18} /></button>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button onClick={() => setActiveFloor(prev => prev === null ? 2 : (prev < 2 ? prev + 1 : null))} className="p-2 hover:bg-background rounded-md text-text-muted hover:text-text-primary transition-colors" title={t('floor_up')}><ArrowUp size={18} /></button>
                    <div className="px-2 text-xs font-medium text-text-muted w-12 sm:w-16 text-center">{activeFloor === null ? 'ALL' : `LVL ${activeFloor}`}</div>
                    <button onClick={() => setActiveFloor(prev => prev === null ? 0 : (prev > 0 ? prev - 1 : null))} className="p-2 hover:bg-background rounded-md text-text-muted hover:text-text-primary transition-colors" title={t('floor_down')}><ArrowDown size={18} /></button>
                    <div className="w-px h-4 bg-border mx-2"></div>
                    <button onClick={toggleFullscreen} className="p-2 hover:bg-background rounded-md text-text-muted hover:text-text-primary transition-colors" title={t('fullscreen')}><Maximize size={18} /></button>
                  </div>
                </div>

                <div className="absolute inset-0 pt-12 z-0 overflow-hidden bg-background">
                  <Canvas 
                    camera={{ position: [15, 12, 15], fov: 50 }} 
                    gl={{ preserveDrawingBuffer: !isMobile, powerPreference: isMobile ? "low-power" : "high-performance", antialias: !isMobile }} 
                    ref={canvasRef}
                    onPointerMissed={() => { if(!measureMode && !defectMode) setSelectedId(null); }}
                  >
                    {!isMobile && <SnapshotHelper />}
                    <CameraRig isTouring={isTouring} />
                    <color attach="background" args={[theme === 'dark' ? '#09090b' : '#f4f4f5']} />
                    <ambientLight intensity={isMobile ? 1.0 : 0.5} />
                    <directionalLight position={[10, 20, 5]} intensity={1.5} />
                    
                    <Suspense fallback={<Html center zIndexRange={[10, 0]}><Loader2 className="animate-spin text-accent-ai" size={32} /></Html>}>
                      {activeModel ? (
                        <UploadedModelViewer 
                           url={activeModel.url} 
                           type={activeModel.type} 
                           onSelect={handleSelect} 
                           measureMode={measureMode} 
                           onMeasureClick={handleMeasureClick} 
                           defectMode={defectMode} 
                           onDefectClick={handleDefectClick} 
                           t={t} 
                        />
                      ) : (
                        <Building layers={layersInfo} activeFloor={activeFloor} selectedId={selectedId} onSelect={handleSelect} isExploded={isExploded} measureMode={measureMode} onMeasureClick={handleMeasureClick} defectMode={defectMode} onDefectClick={handleDefectClick} />
                      )}
                      
                      {measurePoints.map((p, i) => (<mesh key={i} position={p}><sphereGeometry args={[0.15, 16, 16]} /><meshBasicMaterial color="#fcd34d" /></mesh>))}
                      {measurePoints.length === 2 && (
                        <><Line points={[measurePoints[0], measurePoints[1]]} color="#fcd34d" lineWidth={3} />
                        <Html position={measurePoints[0].clone().lerp(measurePoints[1], 0.5)} center zIndexRange={[10, 0]}>
                          <div className="bg-surface text-text-primary px-2 py-1 rounded border border-border font-mono text-xs whitespace-nowrap shadow-lg">{measurePoints[0].distanceTo(measurePoints[1]).toFixed(2)} m</div>
                        </Html></>
                      )}

                      {defectPins.map((pin, i) => {
                        const quaternion = new THREE.Quaternion();
                        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pin.normal);
                        return (
                          <group key={pin.id} position={pin.position} quaternion={quaternion}>
                            <mesh position={[0, 0.25, 0]}><coneGeometry args={[0.1, 0.5, 16]} /><meshStandardMaterial color="#ef4444" /></mesh>
                            <mesh position={[0, 0.5, 0]}><sphereGeometry args={[0.15, 16, 16]} /><meshStandardMaterial color="#ef4444" /></mesh>
                            {!isMobile && (
                              <Html position={[0, 0.8, 0]} center zIndexRange={[10, 0]}>
                                <div className="bg-red-500 text-white px-2 py-1 rounded border border-red-700 font-mono text-xs whitespace-nowrap shadow-lg cursor-pointer hover:bg-red-600 transition-colors flex flex-col items-center">
                                  <span className="font-bold">{t('defect')} #{i + 1}</span><span className="text-[10px] opacity-90">{pin.description}</span>
                                </div>
                              </Html>
                            )}
                          </group>
                        );
                      })}
                      
                      {!isMobile && <Environment preset="city" />}
                    </Suspense>
                    
                    <OrbitControls 
                      makeDefault 
                      target={[0, activeFloor !== null ? activeFloor * 4 : 4, 0]} 
                      enableDamping={!isMobile}
                      dampingFactor={0.05}
                      mouseButtons={{
                        LEFT: cameraMode === 'rotate' ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN,
                        MIDDLE: THREE.MOUSE.DOLLY,
                        RIGHT: cameraMode === 'rotate' ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE
                      }}
                    />
                    {!isMobile && <Grid infiniteGrid fadeDistance={40} sectionColor={theme === 'dark' ? "#27272a" : "#d4d4d8"} cellColor={theme === 'dark' ? "#18181b" : "#e4e4e7"} />}
                  </Canvas>

                  {isMobile && forceMobile3D && (
                    <>
                      <button 
                        onClick={() => setShowMobileTools(true)} 
                        className="absolute bottom-6 right-4 z-40 bg-blue-600 text-white p-4 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)] active:scale-95 transition-transform"
                      >
                         <Layers size={24} />
                      </button>

                      <AnimatePresence>
                        {showMobileTools && (
                          <>
                            <motion.div 
                              initial={{ opacity: 0 }} 
                              animate={{ opacity: 1 }} 
                              exit={{ opacity: 0 }} 
                              onClick={() => setShowMobileTools(false)} 
                              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[100] pointer-events-auto" 
                            />
                            <motion.div 
                              initial={{ y: '100%' }} 
                              animate={{ y: 0 }} 
                              exit={{ y: '100%' }} 
                              transition={{ type: "spring", damping: 25, stiffness: 200 }} 
                              className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-3xl z-[101] flex flex-col max-h-[85vh] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] pointer-events-auto"
                            >
                               <div className="p-4 flex justify-center cursor-pointer shrink-0" onClick={() => setShowMobileTools(false)}>
                                 <div className="w-12 h-1.5 bg-border rounded-full" />
                               </div>
                               <div className="p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4 pb-12">
                                 {uiPanels}
                               </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {!isMobile && (
            <div className="w-full md:w-80 flex flex-col gap-4 shrink-0 h-full min-h-0 relative z-20">
              {uiPanels}
            </div>
          )}

        </div>
      </motion.div>

      {portalNode && createPortal(
        <>
          {showRenderModal && !isMobile && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-surface border border-border rounded-2xl w-full max-w-5xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-hidden">
                <div className="p-5 border-b border-border flex items-center justify-between bg-surface shrink-0">
                  <h2 className="text-xl font-bold flex items-center gap-3 text-text-primary"><Sparkles className="text-accent-ai" size={22} />{t('ai_high_end_rendering')}</h2>
                  <button onClick={(e) => { e.stopPropagation(); setShowRenderModal(false); }} className="text-text-muted hover:text-text-primary p-2 rounded-lg hover:bg-background transition-colors"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 flex flex-col md:flex-row gap-8 bg-surface">
                  <div className="w-full md:w-1/3 flex flex-col gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-3">{t('style_presets')}</label>
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        {[
                          { id: 'realistic', name: t('photorealistic'), prompt: 'Photorealistic architectural rendering, daylight, clear sky, high quality, 8k resolution, cinematic composition' },
                          { id: 'bluehour', name: t('blue_hour'), prompt: 'Architectural rendering during blue hour, warm interior lights, cool exterior twilight, high end, 8k' },
                          { id: 'cyberpunk', name: t('cyberpunk'), prompt: 'Cyberpunk style architectural rendering, neon lights, rainy night, futuristic, glowing accents, 8k, Unreal Engine 5' },
                          { id: 'sketch', name: t('pencil_sketch'), prompt: 'Architectural pencil sketch, hand-drawn, technical drawing style, clean lines, white background, minimalist' }
                        ].map(style => (
                          <button key={style.id} onClick={() => { setActiveStyle(style.id); setRenderPrompt(style.prompt); }} className={cn("p-3 text-sm font-medium text-left rounded-xl border transition-all duration-200", activeStyle === style.id ? "bg-accent-ai/10 border-accent-ai/50 text-accent-ai shadow-sm" : "bg-background border-transparent text-text-muted hover:bg-surface hover:text-text-primary")}>{style.name}</button>
                        ))}
                      </div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-3">{t('custom_prompt')}</label>
                      <textarea value={renderPrompt} onChange={(e) => { setRenderPrompt(e.target.value); setActiveStyle('custom'); }} className="w-full bg-background border border-border rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-accent-ai/50 focus:ring-1 focus:ring-accent-ai/50 resize-none h-32 transition-all shadow-sm" placeholder={t('describe_lighting_mood')} />
                    </div>
                    <button onClick={handleGenerateRender} disabled={isRendering} className="w-full py-3.5 bg-accent-ai text-white rounded-xl text-sm font-bold hover:bg-accent-ai/90 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-auto">
                      {isRendering ? <><Loader2 size={18} className="animate-spin" />{t('generating_render')}</> : <><ImageIcon size={18} />{t('click_generate_render')}</>}
                    </button>
                  </div>
                  <div className="w-full md:w-2/3 bg-background border border-border rounded-2xl flex items-center justify-center overflow-hidden min-h-[400px] relative shadow-inner">
                    {isRendering ? (
                      <div className="flex flex-col items-center gap-4 text-accent-ai"><Loader2 size={56} className="animate-spin" /><p className="text-sm font-bold tracking-widest uppercase animate-pulse">{t('generating_render')}</p></div>
                    ) : generatedImage ? (
                      <img src={generatedImage} alt="Generated Render" className="w-full h-full object-contain" />
                    ) : (
                      <div className="flex flex-col items-center gap-4 text-text-muted"><Camera size={56} className="opacity-30" /><p className="text-sm font-medium">{t('click_generate_render')}</p></div>
                    )}
                    {generatedImage && !isRendering && (
                      <div className="absolute bottom-6 right-6 flex gap-3">
                        <a href={generatedImage} download="kreativ-desk-render.png" className="px-5 py-2.5 bg-surface/80 backdrop-blur-md border border-border text-text-primary rounded-xl text-sm font-bold hover:bg-background transition-all shadow-lg">{t('download_image')}</a>
                        <button onClick={handleSaveRenderToCloud} disabled={isUploading} className="px-5 py-2.5 bg-accent-ai text-white rounded-xl text-sm font-bold hover:bg-accent-ai/90 shadow-md disabled:opacity-50 flex items-center gap-2 transition-all">
                          {isUploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />} {t('save_to_dataroom')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {defectPrompt && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95">
                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2"><ShieldAlert className="text-red-500"/> {t('describe_defect')}</h3>
                <form onSubmit={handleDefectSubmit}>
                  <input type="text" value={defectPrompt.value} onChange={(e) => setDefectPrompt({ ...defectPrompt, value: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 mb-5 font-medium shadow-sm transition-all" placeholder={t('defect_placeholder')} autoFocus />
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={(e) => { e.stopPropagation(); setDefectPrompt(null); }} className="px-5 py-2.5 text-sm font-bold text-text-muted hover:text-text-primary transition-colors">{t('cancel')}</button>
                    <button type="submit" className="px-5 py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-all shadow-sm">{t('create_ticket')}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <UniversalPDFStudio 
            isOpen={isPdfStudioOpen} onClose={() => setIsPdfStudioOpen(false)} 
            title={t('pdf_export')} fileName={`BIM_Report_${activeProject?.name}`}
            onSaveCloud={handleSavePdfToCloud} defaultOrientation="portrait"
          >
            {(settings) => (
              <BIMReportPDFDocument 
                settings={settings} 
                docHeader={docHeader} 
                snapshotImage={snapshotImage}
                auditReport={auditReport}
                defectPins={defectPins}
                t={t} 
              />
            )}
          </UniversalPDFStudio>
        </>,
        document.body
      )}
    </>
  );
}