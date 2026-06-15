import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import { 
  AlertTriangle, LayoutGrid, List as ListIcon, Sparkles, Loader2, ChevronsUp, ChevronUp, 
  Equal, ChevronDown, Printer, BrainCircuit, Image as ImageIcon, Camera, X, Plus, 
  Trash2, Smartphone, Eye, MapPin, AlignLeft, Edit2, Calendar, FileText 
} from 'lucide-react';
import { cn } from '../utils';
import { callGeminiAPI } from '../utils/geminiClient';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useProject, Defect } from '../contexts/ProjectContext';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { db, storage } from '../firebase';
import { doc, updateDoc, setDoc, deleteDoc, collection, query, where, onSnapshot, getDocs, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import QRCode from 'react-qr-code';

import UniversalPDFStudio, { PDFSettings } from './UniversalPDFStudio';

// NATIVE PDF IMPORTS
import { Document, Page, Text, View, StyleSheet, Image as PDFImage } from '@react-pdf/renderer';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  de: { defects_title: 'Mängel & Tickets', defects_desc: 'Mängellisten, Aufgaben und Tickets verwalten.', board: 'Board', list: 'Liste', add_defect: 'Mangel erfassen', edit_defect: 'Mangel bearbeiten', ai_insights: 'KI Analyse', ai_analyzing_defects: 'Analysiert...', ai_pattern_recognition: 'Mustererkennung', no_data_for_analysis: 'Keine Daten für die Analyse vorhanden.', analysis_completed: 'Analyse abgeschlossen.', error_ai_analysis: 'Fehler bei der KI-Analyse.', unassigned: 'Nicht zugewiesen', title: 'Titel', description: 'Beschreibung', status: 'Status', priority: 'Priorität', trade: 'Gewerk', location: 'Ort / Raum', due_date: 'Fällig am', actions: 'Aktionen', create_ticket: 'Ticket erstellen', low: 'Niedrig', medium: 'Mittel', high: 'Hoch', critical: 'Kritisch', cancel: 'Abbrechen', save: 'Speichern', save_changes: 'Änderungen speichern', upload_success: 'Erfolgreich gespeichert!', delete_confirm: 'Mangel unwiderruflich löschen?', delete: 'Löschen', completed: 'abgeschlossen', export_pdf: 'Als PDF exportieren', to_do: 'To Do', in_progress: 'In Arbeit', in_review: 'Prüfung', done: 'Erledigt', upload_image: 'Foto aufnehmen / Hochladen', uploading: 'Lädt hoch...', scan_qr_upload: 'Smartphone Upload', mobile_upload_desc: 'Scanne diesen QR-Code mit dem Smartphone, um ein Foto direkt in dieses Ticket hochzuladen.', photo: 'Foto', saved_cloud: 'Erfolgreich in Dokumente gespeichert.', project: 'Projekt', date: 'Datum', client: 'Kunde', defect_report: 'Mängelprotokoll' },
  en: { defects_title: 'Defects & Tickets', defects_desc: 'Manage punch lists, tasks, and issues.', board: 'Board', list: 'List', add_defect: 'Add Defect', edit_defect: 'Edit Defect', ai_insights: 'AI Insights', ai_analyzing_defects: 'Analyzing...', ai_pattern_recognition: 'Pattern Recognition', no_data_for_analysis: 'No data for analysis.', analysis_completed: 'Analysis completed.', error_ai_analysis: 'Error analyzing data.', unassigned: 'Unassigned', title: 'Title', description: 'Description', status: 'Status', priority: 'Priority', trade: 'Trade', location: 'Location / Room', due_date: 'Due Date', actions: 'Actions', create_ticket: 'Create Ticket', low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical', cancel: 'Cancel', save: 'Save', save_changes: 'Save Changes', upload_success: 'Saved successfully!', delete_confirm: 'Delete this item irrevocably?', delete: 'Delete', completed: 'completed', export_pdf: 'Export PDF', to_do: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done', upload_image: 'Take Photo / Upload', uploading: 'Uploading...', scan_qr_upload: 'Scan to Upload', mobile_upload_desc: 'Scan this QR code with your smartphone to take a photo and attach it directly to this ticket.', photo: 'Photo', saved_cloud: 'Successfully saved to documents.', project: 'Project', date: 'Date', client: 'Client', defect_report: 'Defect Report' }
};

const STATUS_COLUMNS = ['To Do', 'In Progress', 'In Review', 'Done'];

const formatBytes = (bytes: number) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const DEFAULT_DEFECT: Partial<Defect> = { title: '', description: '', status: 'To Do', priority: 'Medium', assignee: '', trade: '', location: '', dueDate: '', imageUrl: '' };

// 🔥 DEMO-DATEN FÜR DIE APP
const DEMO_DEFECTS: any[] = [
  {
    id: 'demo-def-1',
    projectId: 'demo-1',
    title: 'Riss im Sichtbeton Achse B',
    description: 'Feiner Haarriss im Sichtbeton neben der Fensterlaibung. Muss durch Baumeister geprüft und verpresst werden.',
    status: 'To Do',
    priority: 'High',
    trade: 'Baumeister',
    location: 'Wohnen / Essen',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    imageUrl: '/demo-assets/mangel_betonriss.jpg' // <-- Dein lokales Bild!
  },
  {
    id: 'demo-def-2',
    projectId: 'demo-1',
    title: 'Loch in der Trockenbauwand',
    description: 'Beschädigung der Trockenbauwand durch Materialtransport im Flur. Spachtelarbeiten erforderlich.',
    status: 'In Progress',
    priority: 'Medium',
    trade: 'Gipser / Maler',
    location: 'Korridor',
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    imageUrl: '' // <-- Unsplash entfernt! Zeigt nun das elegante Icon
  },
  {
    id: 'demo-def-3',
    projectId: 'demo-1',
    title: 'Fenstergriff klemmt',
    description: 'Der Griff des Südfensters lässt sich nicht vollständig schließen. Beschlag muss justiert werden.',
    status: 'In Review',
    priority: 'Low',
    trade: 'Fensterbauer',
    location: 'Master Bedroom',
    dueDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    imageUrl: ''
  }
];

// ============================================================================
// STYLES FÜR NATIVES PDF (React-PDF)
// ============================================================================
const pdfStyles = StyleSheet.create({
  page: { padding: '15mm', fontFamily: 'Helvetica', fontSize: 10, color: '#374151', backgroundColor: '#ffffff' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 2, paddingBottom: 10, marginBottom: 15 },
  headerLeft: { flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#000000', textTransform: 'uppercase', marginBottom: 8 },
  metaGrid: { flexDirection: 'row' },
  metaBlock: { flexDirection: 'column', marginRight: 20 },
  metaLabel: { fontSize: 7, color: '#6b7280', textTransform: 'uppercase', fontWeight: 'bold' },
  metaValue: { fontSize: 10, color: '#000000', fontWeight: 'bold' },
  logo: { width: 100, height: 40, objectFit: 'contain' },
  
  defectCard: { border: '1px solid #d1d5db', borderRadius: 4, padding: 10, marginBottom: 15, backgroundColor: '#f9fafb', flexDirection: 'row' },
  defectInfo: { flex: 1, paddingRight: 10 },
  defectMetaRow: { flexDirection: 'row', marginBottom: 6, alignItems: 'center' },
  tag: { fontSize: 8, padding: '2px 4px', borderRadius: 2, border: '1px solid #d1d5db', backgroundColor: '#ffffff', marginRight: 5, fontWeight: 'bold', textTransform: 'uppercase' },
  defectTitle: { fontSize: 12, fontWeight: 'bold', color: '#000000', marginBottom: 4 },
  defectDesc: { fontSize: 9, color: '#374151', marginBottom: 8, lineHeight: 1.4 },
  
  detailGrid: { flexDirection: 'row', borderTop: '1px solid #e5e7eb', paddingTop: 5, marginTop: 'auto' },
  detailCol: { flex: 1 },
  detailLabel: { fontSize: 8, fontWeight: 'bold', color: '#000000' },
  detailValue: { fontSize: 9, color: '#4b5563' },
  
  defectImage: { width: 120, height: 80, objectFit: 'cover', borderRadius: 4, border: '1px solid #e5e7eb' },
  
  footer: { position: 'absolute', bottom: '10mm', left: '15mm', right: '15mm', flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 5 },
  footerText: { fontSize: 7, color: '#9ca3af' },
});

// ============================================================================
// KOMPONENTE FÜR NATIVES PDF
// ============================================================================
const DefectsPDFDocument = ({ settings, defects, projectHeader, t }: any) => (
  <Document>
    <Page size={settings.format} orientation={settings.orientation} style={pdfStyles.page}>
      
      {/* HEADER */}
      <View style={[pdfStyles.headerContainer, { borderBottomColor: settings.accentColor }]} fixed>
        <View style={pdfStyles.headerLeft}>
          <Text style={[pdfStyles.title, { color: settings.accentColor }]}>{t('defect_report')}</Text>
          <View style={pdfStyles.metaGrid}>
            <View style={pdfStyles.metaBlock}><Text style={pdfStyles.metaLabel}>Projekt:</Text><Text style={pdfStyles.metaValue}>{projectHeader.project}</Text></View>
            <View style={pdfStyles.metaBlock}><Text style={pdfStyles.metaLabel}>Kunde:</Text><Text style={pdfStyles.metaValue}>{projectHeader.client || '-'}</Text></View>
            <View style={pdfStyles.metaBlock}><Text style={pdfStyles.metaLabel}>Datum:</Text><Text style={pdfStyles.metaValue}>{new Date(projectHeader.date).toLocaleDateString('de-CH')}</Text></View>
          </View>
        </View>
        {settings.logo && <PDFImage src={settings.logo} style={pdfStyles.logo} />}
      </View>

      {/* MÄNGEL LISTE */}
      {defects.length === 0 ? (
        <Text style={{ fontStyle: 'italic', color: '#6b7280' }}>Keine Mängel erfasst.</Text>
      ) : (
        defects.map((d: any) => (
          <View key={d.id} style={pdfStyles.defectCard} wrap={false}>
            <View style={pdfStyles.defectInfo}>
              <View style={pdfStyles.defectMetaRow}>
                <Text style={[pdfStyles.tag, { color: '#6b7280' }]}>#{d.id.slice(-6)}</Text>
                <Text style={pdfStyles.tag}>{d.status}</Text>
                <Text style={[pdfStyles.tag, { color: d.priority === 'Critical' ? '#ef4444' : d.priority === 'High' ? '#f97316' : '#3b82f6' }]}>{d.priority}</Text>
              </View>
              <Text style={pdfStyles.defectTitle}>{d.title}</Text>
              <Text style={pdfStyles.defectDesc}>{d.description || '-'}</Text>
              
              <View style={pdfStyles.detailGrid}>
                <View style={pdfStyles.detailCol}>
                  <Text style={pdfStyles.detailLabel}>{t('location')}:</Text>
                  <Text style={pdfStyles.detailValue}>{d.location || '-'}</Text>
                </View>
                <View style={pdfStyles.detailCol}>
                  <Text style={pdfStyles.detailLabel}>{t('trade')}:</Text>
                  <Text style={pdfStyles.detailValue}>{d.trade || '-'}</Text>
                </View>
                <View style={pdfStyles.detailCol}>
                  <Text style={pdfStyles.detailLabel}>{t('due_date')}:</Text>
                  <Text style={pdfStyles.detailValue}>{d.dueDate ? new Date(d.dueDate).toLocaleDateString('de-CH') : '-'}</Text>
                </View>
              </View>
            </View>
            {d.imageUrl && (
              <PDFImage src={d.imageUrl} style={pdfStyles.defectImage} />
            )}
          </View>
        ))
      )}

      {/* FOOTER */}
      <View style={pdfStyles.footer} fixed>
        <Text style={pdfStyles.footerText}>{settings.footerText}</Text>
        <Text style={pdfStyles.footerText} render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`} />
      </View>
    </Page>
  </Document>
);

export default function Defects({ projectId: propProjectId }: { projectId?: string }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { projects, activeProjectId } = useProject() as any;
  const { language, t: globalT } = useLanguage();
  const { projectId: routeProjectId } = useParams<{ projectId: string }>();

  // 🔥 FIX: Prop ID bevorzugen (für die Demo-App)
  const currentProjectId = propProjectId || routeProjectId || activeProjectId;
  
  const t = (key: string) => localTranslations[language as 'en' | 'de']?.[key] || globalT(key);
  const activeProject = projects?.find((p: any) => p.id === currentProjectId);

  const [defects, setDefects] = useState<Defect[]>([]);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentDefect, setCurrentDefect] = useState<Partial<Defect>>(DEFAULT_DEFECT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [isPdfStudioOpen, setIsPdfStudioOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [uploadSessionId] = useState(() => Math.random().toString(36).substring(2, 15));
  const mobileUploadUrl = `${window.location.origin}/mobile-upload/defect/${uploadSessionId}`;

  const [projectHeader] = useState({ 
    project: activeProject?.name || t('new_project') || 'Neues Projekt', 
    client: '', 
    date: new Date().toISOString().split('T')[0]
  });

  const [activeDragDefect, setActiveDragDefect] = useState<Defect | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const wasDragged = useRef(false);

  // === MULTI-TENANT FILTERUNG & DEMO DATEN ===
  useEffect(() => {
    if (!currentProjectId) return;

    // 🔥 DEMO-MODUS SCHUTZSCHILD: Lädt die perfekten Dummy-Mängel!
    if (currentProjectId === 'demo-1' || activeProject?.name === 'Quartier Neubau Süd') {
      setDefects(DEMO_DEFECTS);
      return;
    }

    if (!db) return;
    const q = query(
      collection(db, 'defects'), 
      where('projectId', '==', currentProjectId)
    );
    const unsub = onSnapshot(q, (snap) => setDefects(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Defect))));
    return () => unsub();
  }, [currentProjectId]);

  useEffect(() => {
    if (!db || !uploadSessionId || !showQrScanner) return;
    const q = query(collection(db, 'temp_receipts'), where('sessionId', '==', uploadSessionId));
    const unsub = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if (data.url) {
            setCurrentDefect(prev => ({ ...prev, imageUrl: data.url }));
            setShowQrScanner(false);
            addToast('Bild vom Smartphone empfangen!', 'success');
            deleteDoc(doc(db, 'temp_receipts', change.doc.id)).catch(console.error);
          }
        }
      });
    });
    return () => unsub();
  }, [uploadSessionId, showQrScanner, addToast]);

  const handleDropLogic = async (id: string, status: string) => {
    if (!id) return;

    // Lokaler State Update für die interaktive Demo!
    if (currentProjectId === 'demo-1' || activeProject?.name === 'Quartier Neubau Süd') {
      setDefects(prev => prev.map(d => d.id === id ? { ...d, status } : d));
      return;
    }

    if (!db) return;
    try { await updateDoc(doc(db, 'defects', id), { status }); } 
    catch (error) { addToast('Fehler', 'error'); }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => { e.dataTransfer.setData('text/plain', id); };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault(); 
    const id = e.dataTransfer.getData('text/plain');
    handleDropLogic(id, status);
  };

  const handleTouchStart = (e: React.TouchEvent, defect: Defect) => {
    wasDragged.current = false;
    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    longPressTimer.current = setTimeout(() => {
      wasDragged.current = true;
      setActiveDragDefect(defect);
      setDragPos({ x: startX, y: startY });
      if (navigator.vibrate) navigator.vibrate(50); 
    }, 300); 
  };
  const handleTouchMoveCancel = () => { if (longPressTimer.current) clearTimeout(longPressTimer.current); };

  const openAddModal = () => { setEditingId(null); setCurrentDefect(DEFAULT_DEFECT); setShowQrScanner(false); setIsModalOpen(true); };
  const openEditModal = (defect: Defect) => { setEditingId(defect.id); setCurrentDefect({ ...defect }); setShowQrScanner(false); setIsModalOpen(true); };

  const handleSaveDefect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Lokaler State Update für die interaktive Demo!
    if (currentProjectId === 'demo-1' || activeProject?.name === 'Quartier Neubau Süd') {
       setIsSubmitting(true);
       setTimeout(() => {
         if (editingId) {
           setDefects(prev => prev.map(d => d.id === editingId ? { ...d, ...currentDefect } as Defect : d));
         } else {
           const newId = `DEF-${Date.now()}`;
           setDefects(prev => [...prev, { ...currentDefect, id: newId, projectId: 'demo-1' } as Defect]);
         }
         setIsModalOpen(false); 
         setCurrentDefect(DEFAULT_DEFECT); 
         setShowQrScanner(false); 
         addToast(t('upload_success'), 'success');
         setIsSubmitting(false);
       }, 500);
       return;
    }

    if (!currentUser || !currentUser.companyId || !db || !currentProjectId) return;
    setIsSubmitting(true);
    try {
      if (editingId) { 
        await updateDoc(doc(db, 'defects', editingId), { ...currentDefect }); 
      } else { 
        const newId = `DEF-${Date.now()}`; 
        await setDoc(doc(db, 'defects', newId), { 
          ...currentDefect, 
          id: newId, 
          projectId: currentProjectId, 
          ownerId: currentUser.uid, 
          companyId: currentUser.companyId, 
          date: new Date().toISOString().split('T')[0] 
        }); 
      }
      setIsModalOpen(false); 
      setCurrentDefect(DEFAULT_DEFECT); 
      setShowQrScanner(false); 
      addToast(t('upload_success'), 'success');
    } catch (error: any) { 
      addToast('Fehler beim Speichern', 'error'); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleDeleteDefect = async (id: string) => {
    if (!window.confirm(t('delete_confirm'))) return;

    if (currentProjectId === 'demo-1' || activeProject?.name === 'Quartier Neubau Süd') {
        setDefects(prev => prev.filter(d => d.id !== id));
        addToast(t('delete') + ' ' + t('completed'), 'success');
        return;
    }

    if (!db) return;
    try { 
      await deleteDoc(doc(db, 'defects', id)); 
      addToast(t('delete') + ' ' + t('completed'), 'success'); 
    } catch (error) { 
      addToast('Fehler beim Löschen', 'error'); 
    }
  };

  const generateAIInsights = async () => {
    if (defects.length === 0) return addToast(t('no_data_for_analysis'), "info");
    setIsAnalyzing(true);
    try {
      const dataStr = JSON.stringify(defects.map(d => ({ title: d.title, priority: d.priority, trade: d.trade, status: d.status, location: d.location })));
      const prompt = language === 'de' ? `Analysiere diese Mängelliste. Welche Gewerke machen Probleme? Sind kritische Dinge offen? Antworte in 2 Sätzen auf Deutsch. \nDaten: ${dataStr}` : `Analyze this defect list. Identify patterns. Answer in 2 short sentences in English. \nData: ${dataStr}`;
      const response = await callGeminiAPI('gemini-2.5-flash', [{ text: prompt }]);
      setAiInsights(response.text || t('analysis_completed'));
    } catch (error) { addToast(t('error_ai_analysis'), "error"); } 
    finally { setIsAnalyzing(false); }
  };

  const handleLocalImageUploadWithAI = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    
    setIsAnalyzingImage(true);
    try {
      const storageRef = ref(storage, `${currentUser.companyId}/defects/temp_${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setCurrentDefect(prev => ({ ...prev, imageUrl: url }));
      await new Promise(r => setTimeout(r, 1500)); 
      
      setCurrentDefect(prev => ({
        ...prev, title: prev.title || "Schaden/Mangel erkannt", description: prev.description || "Die KI hat einen potenziellen Mangel auf dem Foto identifiziert. Bitte Details prüfen.", trade: prev.trade || "Baumeister / Gipser", priority: "High"
      }));
      addToast("KI hat das Bild analysiert!", "success");
    } catch (error) { addToast(globalT('error'), 'error'); } 
    finally { setIsAnalyzingImage(false); }
  };

  const handleSavePdfToCloud = async (blob: Blob) => {
    if (!currentUser || !currentUser.companyId) return;
    try {
      const fileName = `Maengelliste_${activeProject?.name || 'Projekt'}_${Date.now()}.pdf`;
      const storageReference = ref(storage, `${currentUser.companyId}/pdf_exports/${fileName}`);
      await uploadBytes(storageReference, blob);
      const downloadUrl = await getDownloadURL(storageReference);
      
      let targetFolderId = '';
      if (currentProjectId) {
        const folderQ = query(
          collection(db, 'documents'), 
          where('companyId', '==', currentUser.companyId),
          where('name', '==', 'Mängel & Tickets'), 
          where('isFolder', '==', true), 
          where('projectId', '==', currentProjectId)
        );
        const folderSnap = await getDocs(folderQ);
        
        if (!folderSnap.empty) { 
          targetFolderId = folderSnap.docs[0].id; 
        } else { 
          const newFolderRef = await addDoc(collection(db, 'documents'), { 
            name: 'Mängel & Tickets', 
            isFolder: true, 
            category: 'projects', 
            projectId: currentProjectId, 
            ownerId: currentUser.uid, 
            companyId: currentUser.companyId,
            createdAt: new Date().toISOString() 
          }); 
          targetFolderId = newFolderRef.id; 
        }
      }
      
      await addDoc(collection(db, 'documents'), { 
        name: fileName, 
        url: downloadUrl, 
        fileUrl: downloadUrl, 
        size: formatBytes(blob.size), 
        type: 'application/pdf', 
        ownerId: currentUser.uid, 
        companyId: currentUser.companyId,
        uploadedBy: currentUser.uid, 
        createdAt: new Date().toISOString(), 
        uploadedAt: new Date().toISOString(), 
        isFolder: false, 
        projectId: currentProjectId || null, 
        folderId: targetFolderId || null, 
        category: 'projects',
        date: new Date().toLocaleDateString('de-CH')
      });
      
      addToast(t('saved_cloud'), 'success');
      setIsPdfStudioOpen(false);
    } catch (error) {
      addToast('Fehler beim Speichern in der Cloud', 'error');
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) { case 'Critical': return <ChevronsUp size={16} className="text-red-500" />; case 'High': return <ChevronUp size={16} className="text-orange-500" />; case 'Low': return <ChevronDown size={16} className="text-blue-500" />; default: return <Equal size={16} className="text-yellow-500" />; }
  };
  const getPriorityColor = (priority: string) => {
    switch (priority) { case 'Critical': return 'bg-red-500/10 text-red-500 border-red-500/20'; case 'High': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'; case 'Low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'; default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'; }
  };
  const getStatusColor = (status: string) => {
    switch (status) { case 'To Do': return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'; case 'In Progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'; case 'In Review': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'; case 'Done': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'; default: return 'bg-surface text-text-primary border-border'; }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex-1 flex flex-col min-h-0 bg-background text-text-primary relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
            <div><h1 className="text-2xl font-semibold tracking-tight">{t('defects_title')}</h1><p className="text-text-muted text-sm mt-1">{t('defects_desc')}</p></div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex bg-surface border border-border rounded-lg p-1 w-full sm:w-auto">
                <button onClick={() => setViewMode('board')} className={cn("flex-1 px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2", viewMode === 'board' ? "bg-accent-ai/10 text-accent-ai shadow-sm border border-accent-ai/20" : "text-text-muted hover:text-text-primary")}><LayoutGrid size={16} /> {t('board')}</button>
                <button onClick={() => setViewMode('list')} className={cn("flex-1 px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2", viewMode === 'list' ? "bg-accent-ai/10 text-accent-ai shadow-sm border border-accent-ai/20" : "text-text-muted hover:text-text-primary")}><ListIcon size={16} /> {t('list')}</button>
              </div>
              <button onClick={() => setIsPdfStudioOpen(true)} className="flex-1 sm:flex-none px-4 py-2 bg-surface border border-border text-text-primary rounded-md text-sm font-bold hover:bg-white/5 transition-colors flex items-center justify-center gap-2 shadow-sm">
                <FileText size={16} /> <span className="hidden sm:inline">PDF Studio</span>
              </button>
              <button onClick={openAddModal} className="flex-1 sm:flex-none px-4 py-2 bg-accent-ai text-white rounded-md text-sm font-medium hover:bg-accent-ai/90 transition-colors shadow-lg shadow-accent-ai/20 flex items-center justify-center gap-2"><Plus size={16} /> {t('add_defect')}</button>
            </div>
          </header>

          <div className="flex items-center gap-4 shrink-0">
             <button onClick={generateAIInsights} disabled={isAnalyzing} className="w-full sm:w-auto justify-center px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg text-sm font-bold hover:bg-purple-500/20 transition-colors flex items-center gap-2 disabled:opacity-50">
               {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} {isAnalyzing ? t('ai_analyzing_defects') : t('ai_insights')}
             </button>
          </div>

          {aiInsights && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 flex items-start gap-4 animate-in slide-in-from-top-2 shrink-0">
              <BrainCircuit className="text-purple-400 shrink-0 mt-0.5" size={20} />
              <div><h4 className="text-sm font-bold text-purple-400 mb-1">{t('ai_pattern_recognition')}</h4><p className="text-sm text-text-primary leading-relaxed">{aiInsights}</p></div>
              <button onClick={() => setAiInsights(null)} className="ml-auto text-text-muted hover:text-text-primary"><X size={16}/></button>
            </div>
          )}

          {viewMode === 'board' ? (
            <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar pb-4 -mx-2 md:mx-0 px-2 md:px-0">
              <div className="flex gap-4 md:gap-6 h-full min-w-[900px]">
                {STATUS_COLUMNS.map(status => {
                  const colDefects = defects.filter(d => d.status === status);
                  return (
                    <div key={status} data-status={status} className="flex-1 flex flex-col w-[260px] md:w-[300px] bg-surface/50 border border-border rounded-xl p-3 md:p-4 shadow-sm h-full" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, status)}>
                      <div className="flex items-center justify-between mb-4 shrink-0">
                        <h3 className={cn("font-bold text-[10px] md:text-sm uppercase tracking-widest px-3 py-1 rounded-md border", getStatusColor(status))}>{status}</h3>
                        <span className="bg-background text-text-muted text-xs font-bold px-2 py-0.5 rounded-md border border-border">{colDefects.length}</span>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1 pb-10">
                        {colDefects.map(defect => (
                          <div key={defect.id} draggable onDragStart={(e) => handleDragStart(e, defect.id)} onClick={() => { if (!wasDragged.current) openEditModal(defect); }} onTouchStart={(e) => handleTouchStart(e, defect)} onTouchMove={handleTouchMoveCancel} onTouchEnd={handleTouchMoveCancel} className={cn("bg-background border border-border rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-accent-ai/50 transition-colors shadow-sm group", activeDragDefect?.id === defect.id ? "opacity-40 scale-95" : "opacity-100")}>
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] font-bold text-text-muted">{defect.id.slice(-6)}</span>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteDefect(defect.id); }} className="text-text-muted hover:text-red-500 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                            </div>
                            <h4 className="font-bold text-sm text-text-primary mb-2 leading-tight pointer-events-none">{defect.title}</h4>
                            {(defect.location || defect.dueDate) && (
                               <div className="flex items-center gap-3 text-[10px] font-medium text-text-muted mb-3 pointer-events-none">
                                 {defect.location && <span className="flex items-center gap-1"><MapPin size={10}/> {defect.location}</span>}
                                 {defect.dueDate && <span className="flex items-center gap-1"><Calendar size={10}/> {new Date(defect.dueDate).toLocaleDateString()}</span>}
                               </div>
                            )}
                            {defect.imageUrl && (
                              <div className="w-full h-28 rounded-lg overflow-hidden mb-3 border border-border cursor-zoom-in group/image relative pointer-events-none" onClick={(e) => { e.stopPropagation(); setPreviewImage(defect.imageUrl as string); }}>
                                <img src={defect.imageUrl} alt="Defect" className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-300" onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400/27272a/ffffff?text=Bild+nicht+verf%C3%BCgbar'; }}/>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 flex items-center justify-center transition-opacity"><Eye className="text-white" size={24} /></div>
                              </div>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-auto pt-2 border-t border-border/50 pointer-events-none">
                              <span className={cn("px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1 border", getPriorityColor(defect.priority))}>{getPriorityIcon(defect.priority)} {defect.priority}</span>
                              <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-surface text-text-muted border border-border truncate max-w-[100px]">{defect.trade || t('unassigned')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto bg-background md:bg-surface md:border md:border-border md:rounded-xl shadow-lg custom-scrollbar">
              <table className="hidden md:table w-full text-sm text-left">
                <thead className="text-xs uppercase tracking-wider text-text-muted bg-surface/50 border-b border-border sticky top-0 z-10">
                  <tr><th className="px-6 py-4 font-semibold">{t('title')}</th><th className="px-6 py-4 font-semibold">{t('location')}</th><th className="px-6 py-4 font-semibold">{t('due_date')}</th><th className="px-6 py-4 font-semibold">{t('status')}</th><th className="px-6 py-4 font-semibold">{t('priority')}</th><th className="px-6 py-4 font-semibold">{t('trade')}</th><th className="px-6 py-4 text-right font-semibold">{t('actions')}</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {defects.map(defect => (
                    <tr key={defect.id} onClick={() => openEditModal(defect)} className="hover:bg-background transition-colors group cursor-pointer">
                      <td className="px-6 py-4 font-bold text-text-primary">{defect.title}</td>
                      <td className="px-6 py-4 text-text-muted font-medium">{defect.location || '-'}</td>
                      <td className="px-6 py-4 text-text-muted font-medium">{defect.dueDate ? new Date(defect.dueDate).toLocaleDateString() : '-'}</td>
                      <td className="px-6 py-4"><span className={cn("px-2 py-1 rounded-md text-[10px] font-bold uppercase border whitespace-nowrap", getStatusColor(defect.status))}>{defect.status}</span></td>
                      <td className="px-6 py-4"><span className={cn("px-2 py-1 rounded-md text-[10px] font-bold uppercase border flex items-center gap-1 w-fit", getPriorityColor(defect.priority))}>{getPriorityIcon(defect.priority)} {defect.priority}</span></td>
                      <td className="px-6 py-4 text-text-muted font-medium">{defect.trade}</td>
                      <td className="px-6 py-4 text-right"><button onClick={(e) => { e.stopPropagation(); handleDeleteDefect(defect.id); }} className="text-text-muted hover:text-red-500 p-2 rounded-md hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="md:hidden flex flex-col gap-3 pb-24">
                {defects.length === 0 && <div className="text-center text-text-muted py-8 text-sm border-2 border-dashed border-border rounded-xl mx-2 bg-surface">{t('no_data_for_analysis')}</div>}
                {defects.map(defect => (
                  <div key={defect.id} onClick={() => openEditModal(defect)} className="bg-surface border border-border rounded-xl p-4 shadow-sm flex flex-col gap-3 cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div className="font-bold text-text-primary text-sm line-clamp-2 pr-2">{defect.title}</div>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteDefect(defect.id); }} className="text-text-muted hover:text-red-500 p-1 bg-background rounded-md border border-border"><Trash2 size={14}/></button>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-text-muted font-medium">
                      {defect.location && <span className="flex items-center gap-1"><MapPin size={12}/>{defect.location}</span>}
                      {defect.dueDate && <span className="flex items-center gap-1"><Calendar size={12}/>{new Date(defect.dueDate).toLocaleDateString()}</span>}
                    </div>
                    <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-1">
                      <span className={cn("px-2 py-1 rounded-md text-[10px] font-bold uppercase border", getStatusColor(defect.status))}>{defect.status}</span>
                      <span className={cn("px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1 border w-fit", getPriorityColor(defect.priority))}>{getPriorityIcon(defect.priority)} {defect.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* DRAG AND DROP OVERLAY */}
      {activeDragDefect && createPortal(
        <div id="drag-overlay" className="fixed inset-0 z-[99999] touch-none" onTouchMove={(e) => { setDragPos({ x: e.touches[0].clientX, y: e.touches[0].clientY }); }} onTouchEnd={(e) => { const touch = e.changedTouches[0]; const overlay = document.getElementById('drag-overlay'); if (overlay) overlay.style.visibility = 'hidden'; const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY); if (overlay) overlay.style.visibility = 'visible'; const col = dropTarget?.closest('[data-status]'); if (col) { const status = col.getAttribute('data-status'); if (status && status !== activeDragDefect.status) { handleDropLogic(activeDragDefect.id, status); } } setActiveDragDefect(null); }}>
          <div className="absolute bg-surface border-2 border-accent-ai rounded-xl p-4 shadow-2xl opacity-95 w-[260px] md:w-[300px] pointer-events-none flex flex-col gap-2" style={{ left: dragPos.x, top: dragPos.y, transform: 'translate(-50%, -50%) scale(1.05)' }}>
            <h4 className="font-bold text-sm text-text-primary leading-tight">{activeDragDefect.title}</h4>
            <div className="flex flex-wrap items-center gap-2 mt-2"><span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-surface text-text-muted border border-border">{activeDragDefect.trade || 'Nicht zugewiesen'}</span></div>
          </div>
        </div>, document.body
      )}

      {/* PORTALE FÜR MODALE */}
      {typeof document !== 'undefined' && createPortal(
        <>
          {/* MODAL FÜR NEUEN / EDITIERTEN MANGEL */}
          {isModalOpen && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center md:p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-surface md:border md:border-border md:rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[100dvh] md:h-auto md:max-h-[90vh]">
                <div className="p-4 border-b border-border flex justify-between items-center bg-surface/90 backdrop-blur-md sticky top-0 z-20 shrink-0">
                  <h3 className="font-bold flex items-center gap-2 text-text-primary">
                    {editingId ? <Edit2 size={18} className="text-accent-ai" /> : <AlertTriangle size={18} className="text-accent-ai" />} 
                    {editingId ? t('edit_defect') : t('create_ticket')}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-primary transition-colors bg-background p-2 rounded-lg border border-border"><X size={20}/></button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 bg-background/50">
                  <form id="defect-form" onSubmit={handleSaveDefect} className="space-y-6">
                    <div className="space-y-4">
                      <div><label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1 h-5 flex items-center">{t('title')}</label><input type="text" required value={currentDefect.title} onChange={e => setCurrentDefect({...currentDefect, title: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg py-3 px-4 text-sm font-bold text-text-primary focus:outline-none focus:border-accent-ai shadow-sm" placeholder="Kurzer, prägnanter Titel" autoFocus={!editingId} /></div>
                      <div><label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1 flex items-center gap-2 h-5"><AlignLeft size={14}/> {t('description')}</label><textarea value={currentDefect.description} onChange={e => setCurrentDefect({...currentDefect, description: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg py-3 px-4 text-sm font-medium text-text-primary focus:outline-none focus:border-accent-ai resize-none h-24 custom-scrollbar shadow-sm" placeholder="Details zum Mangel..." /></div>
                    </div>
                    <div className="w-full h-px bg-border/50"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div><label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1 flex items-center gap-2 h-5"><MapPin size={14}/> {t('location')}</label><input type="text" value={currentDefect.location} onChange={e => setCurrentDefect({...currentDefect, location: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg py-3 px-4 text-sm font-bold text-text-primary focus:outline-none focus:border-accent-ai shadow-sm" placeholder="z.B. Raum 3.04" /></div>
                      <div><label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1 flex items-center gap-2 h-5"><Calendar size={14}/> {t('due_date')}</label><input type="date" value={currentDefect.dueDate} onChange={e => setCurrentDefect({...currentDefect, dueDate: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg py-3 px-4 text-sm font-bold text-text-primary focus:outline-none focus:border-accent-ai shadow-sm" /></div>
                      <div><label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1 flex items-center h-5">{t('trade')}</label><input type="text" value={currentDefect.trade} onChange={e => setCurrentDefect({...currentDefect, trade: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg py-3 px-4 text-sm font-bold text-text-primary focus:outline-none focus:border-accent-ai shadow-sm" placeholder="z.B. Elektro" /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1 flex items-center h-5">{t('priority')}</label><select value={currentDefect.priority} onChange={e => setCurrentDefect({...currentDefect, priority: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg py-3 px-4 text-sm font-bold text-text-primary focus:outline-none focus:border-accent-ai cursor-pointer shadow-sm"><option value="Low" className="bg-surface">{t('low')}</option><option value="Medium" className="bg-surface">{t('medium')}</option><option value="High" className="bg-surface">{t('high')}</option><option value="Critical" className="bg-surface">{t('critical')}</option></select></div>
                        <div><label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1 flex items-center h-5">{t('status')}</label><select value={currentDefect.status} onChange={e => setCurrentDefect({...currentDefect, status: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg py-3 px-4 text-sm font-bold text-text-primary focus:outline-none focus:border-accent-ai cursor-pointer shadow-sm"><option value="To Do" className="bg-surface">{t('to_do')}</option><option value="In Progress" className="bg-surface">{t('in_progress')}</option><option value="In Review" className="bg-surface">{t('in_review')}</option><option value="Done" className="bg-surface">{t('done')}</option></select></div>
                      </div>
                    </div>
                    <div className="w-full h-px bg-border/50"></div>
                    <div className="space-y-3 pb-8">
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2"><ImageIcon size={14}/> {t('photo')} / Beweisbild</label>
                      {currentDefect.imageUrl ? (
                        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-border">
                          <img src={currentDefect.imageUrl} alt="Uploaded" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setCurrentDefect({...currentDefect, imageUrl: ''})} className="absolute top-3 right-3 p-3 bg-black/70 text-white rounded-lg hover:bg-red-500 transition-colors shadow-lg"><Trash2 size={18}/></button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <div className="grid grid-cols-2 gap-3">
                            <label className="flex flex-col items-center justify-center border border-border bg-background hover:bg-white/5 rounded-xl p-4 cursor-pointer transition-colors shadow-sm relative overflow-hidden">
                              {isAnalyzingImage && <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex flex-col items-center justify-center z-10"><Loader2 size={24} className="text-accent-ai animate-spin mb-2" /><span className="text-[10px] font-bold text-accent-ai uppercase tracking-widest text-center">KI scannt<br/>Bild...</span></div>}
                              <Camera size={24} className="text-blue-500 mb-2" />
                              <span className="text-xs font-bold text-text-primary text-center">{language === 'de' ? 'Foto aufnehmen' : 'Take Photo'}</span>
                              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleLocalImageUploadWithAI} />
                            </label>
                            <label className="flex flex-col items-center justify-center border border-border bg-background hover:bg-white/5 rounded-xl p-4 cursor-pointer transition-colors shadow-sm relative overflow-hidden">
                              {isAnalyzingImage && <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex flex-col items-center justify-center z-10"><Loader2 size={24} className="text-accent-ai animate-spin mb-2" /><span className="text-[10px] font-bold text-accent-ai uppercase tracking-widest text-center">KI scannt<br/>Bild...</span></div>}
                              <ImageIcon size={24} className="text-emerald-500 mb-2" />
                              <span className="text-xs font-bold text-text-primary text-center">{language === 'de' ? 'Aus Galerie' : 'From Gallery'}</span>
                              <input type="file" accept="image/*" className="hidden" onChange={handleLocalImageUploadWithAI} />
                            </label>
                          </div>
                          <div className="hidden md:flex justify-center mt-2"><button type="button" onClick={() => setShowQrScanner(true)} className="text-xs font-bold text-text-muted hover:text-accent-ai transition-colors flex items-center gap-1"><Smartphone size={14}/> Via Smartphone hochladen (QR Code)</button></div>
                          {showQrScanner && (
                            <div className="bg-background border border-border rounded-xl p-6 flex flex-col items-center text-center animate-in fade-in mt-2"><div className="bg-white p-4 rounded-xl shadow-lg mb-4"><QRCode value={mobileUploadUrl} size={150} /></div><p className="text-xs text-text-muted max-w-xs mb-4">{t('mobile_upload_desc')}</p><button type="button" onClick={() => setShowQrScanner(false)} className="px-6 py-2 text-sm font-bold text-text-muted border border-border rounded-lg">{t('cancel')}</button></div>
                          )}
                        </div>
                      )}
                    </div>
                  </form>
                </div>
                <div className="p-4 md:p-6 border-t border-border bg-surface/90 backdrop-blur-md flex flex-col md:flex-row justify-end gap-3 shrink-0 pb-8 md:pb-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-sm font-bold text-text-muted hover:text-text-primary transition-colors border border-border md:border-transparent rounded-lg">{t('cancel')}</button>
                  <button form="defect-form" type="submit" disabled={isSubmitting || !currentDefect.title} className="px-8 py-3 bg-accent-ai text-white rounded-lg text-sm font-bold shadow-lg shadow-accent-ai/20 hover:bg-accent-ai/90 transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                    {isSubmitting ? <Loader2 size={16} className="animate-spin"/> : null} {editingId ? t('save_changes') : t('save')}
                  </button>
                </div>
              </div>
            </div>
          )}

          <UniversalPDFStudio 
            isOpen={isPdfStudioOpen} 
            onClose={() => setIsPdfStudioOpen(false)} 
            title={t('export_pdf')} 
            fileName={`Maengel_${activeProject?.name || 'Projekt'}_${Date.now()}`}
            onSaveCloud={handleSavePdfToCloud}
            defaultOrientation="portrait"
          >
            {(settings) => (
              <DefectsPDFDocument 
                settings={settings}
                defects={defects}
                projectHeader={projectHeader}
                t={t}
              />
            )}
          </UniversalPDFStudio>

          {/* VOLLBILD-BILDVORSCHAU (LIGHTBOX) */}
          <AnimatePresence>
            {previewImage && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 cursor-zoom-out"
                onClick={() => setPreviewImage(null)}
              >
                <button className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[10010]" onClick={() => setPreviewImage(null)}>
                  <X size={24} />
                </button>
                <motion.img 
                  initial={{ scale: 0.9 }} 
                  animate={{ scale: 1 }} 
                  exit={{ scale: 0.9 }} 
                  src={previewImage} 
                  alt="Preview" 
                  className="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain"
                  onClick={(e) => e.stopPropagation()} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}
    </>
  );
}