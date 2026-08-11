import React, { useState, useEffect } from 'react';
import { 
  X, Printer, Save, Copy, Check, Sparkles, Building2, Briefcase, 
  FileText, Download, Edit3, ShieldCheck, UserCheck, CheckCircle2, Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { sendNotification } from '../lib/notifications';
import UniversalPDFStudio from './UniversalPDFStudio';
import { cn } from '../utils';

interface DocumentStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle: string;
  initialContent: string;
}

export default function DocumentStudioModal({
  isOpen,
  onClose,
  initialTitle,
  initialContent
}: DocumentStudioModalProps) {
  const { currentUser } = useAuth();
  const { activeProjectId, projects } = useProject() as any;
  const activeProject = projects?.find((p: any) => p.id === activeProjectId);
  const { addToast } = useToast();
  const { language } = useLanguage();

  const [docTitle, setDocTitle] = useState(initialTitle || 'KI-Vorlage (Vertrag / Brief)');
  const [docContent, setDocContent] = useState(initialContent || '');
  const [saveScope, setSaveScope] = useState<'company' | 'project'>('company');
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Recipient details
  const [recipientName, setRecipientName] = useState('Erika & Hans Muster');
  const [recipientStreet, setRecipientStreet] = useState('Musterstrasse 12');
  const [recipientZipCity, setRecipientZipCity] = useState('8000 Zürich');

  // Letter metadata
  const [docPlaceDate, setDocPlaceDate] = useState(`Zürich, ${new Date().toLocaleDateString('de-CH', { day: '2-digit', month: 'long', year: 'numeric' })}`);
  const [docReference, setDocReference] = useState(activeProject?.name ? `Ref: ${activeProject.name}` : 'Ref: Projekt-Vertrag 2026');

  // Signature Block details
  const [clientSignatory, setClientSignatory] = useState('Auftraggeber (Bauherr)');
  const [architectSignatory, setArchitectSignatory] = useState(currentUser?.email ? `Auftragnehmer (${currentUser.email})` : 'Auftragnehmer (Architekt / Planer)');

  // Company details
  const [companyData, setCompanyData] = useState({
    name: 'Kreativ-Desk OS Architecture',
    street: 'Bahnhofstrasse 1',
    zipCity: '8001 Zürich',
    website: 'www.kreativdesk.ch',
    logo: ''
  });

  const [isPdfStudioOpen, setIsPdfStudioOpen] = useState(false);

  useEffect(() => {
    setDocTitle(initialTitle || 'KI-Vorlage (Vertrag / Brief)');
    setDocContent(initialContent || '');
  }, [initialTitle, initialContent]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchCompanyInfo = async () => {
      try {
        const safeCompanyId = currentUser?.companyId || currentUser?.uid;
        if (!safeCompanyId) return;

        const { data } = await supabase
          .from('company_settings')
          .select('*')
          .eq('company_id', safeCompanyId)
          .maybeSingle();

        if (data) {
          setCompanyData({
            name: data.company_name || 'Kreativ-Desk OS Architecture',
            street: data.street || 'Bahnhofstrasse 1',
            zipCity: `${data.zip || '8001'} ${data.city || 'Zürich'}`,
            website: data.website || 'www.kreativdesk.ch',
            logo: data.logo_url || ''
          });
        }
      } catch (e) {
        console.error("Fetch company info error:", e);
      }
    };
    fetchCompanyInfo();
  }, [currentUser]);

  if (!isOpen) return null;

  const handleSaveDocument = async () => {
    if (!docContent || isSaving) return;
    setIsSaving(true);
    try {
      const safeCompanyId = currentUser?.companyId || currentUser?.uid || 'global';
      const isProjectScope = saveScope === 'project';
      const targetProjectId = isProjectScope ? (activeProjectId || 'global') : 'global';
      const category = isProjectScope ? 'projects' : 'company';
      
      const cleanTitle = docTitle.trim() || 'KI-Vorlage (Vertrag)';
      const docFileName = cleanTitle.endsWith('.txt') ? cleanTitle : `${cleanTitle}.txt`;
      
      const fullDocumentText = `==================================================
${companyData.name.toUpperCase()}
${companyData.street}, ${companyData.zipCity}
Web: ${companyData.website}
==================================================

EMPFÄNGER:
${recipientName}
${recipientStreet}
${recipientZipCity}

ORT / DATUM: ${docPlaceDate}
REFERENZ: ${docReference}

--------------------------------------------------
${cleanTitle.toUpperCase()}
--------------------------------------------------

${docContent}

--------------------------------------------------
UNTERSCHRIFTEN & BESTÄTIGUNG:

ORT, DATUM: ______________________, __________________

UNTERSCHRIFT AUFTRAGGEBER:       UNTERSCHRIFT AUFTRAGNEHMER:
(${clientSignatory})              (${architectSignatory})

______________________________   ______________________________
==================================================`;

      const dataUrl = 'data:text/plain;charset=utf-8,' + encodeURIComponent(fullDocumentText);

      const { data, error } = await supabase.from('documents').insert({
        company_id: safeCompanyId,
        project_id: targetProjectId,
        category: category,
        folder_id: 'root',
        is_folder: false,
        name: docFileName,
        type: 'vorlage',
        url: dataUrl,
        file_url: dataUrl,
        size: `${Math.max(1, Math.round(fullDocumentText.length / 1024))} KB`,
        created_at: new Date().toISOString(),
        uploaded_at: new Date().toISOString()
      }).select().single();

      if (error) throw error;

      localStorage.setItem('has_new_document', 'true');
      localStorage.setItem('last_created_doc_title', docFileName);
      window.dispatchEvent(new CustomEvent('document_created', { detail: { title: docFileName, id: data?.id } }));

      const locationName = isProjectScope ? `Projekt-Bauakte (${activeProject?.name || 'Projekt'})` : 'Company Dashboard (Firmenunterlagen)';
      
      await sendNotification({
        companyId: safeCompanyId,
        title: '📄 Neue KI-Vorlage im Studio gespeichert',
        message: `Vorlage "${docFileName}" wurde im Studio formatiert und in ${locationName} abgelegt.`,
        type: 'document',
        link: isProjectScope ? `/project/${targetProjectId}/documents` : '/app'
      });

      addToast(`Vorlage "${docFileName}" erfolgreich in ${locationName} gespeichert!`, 'success');
      onClose();
    } catch (err: any) {
      console.error("Save doc error:", err);
      addToast('Fehler beim Speichern der Vorlage!', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(docContent);
    setIsCopied(true);
    addToast('Vertragstext in Zwischenablage kopiert!', 'info');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-md flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
      
      {/* Top Header Control Toolbar */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 z-50 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-md">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-bold text-sm text-white tracking-wide flex items-center gap-2">
              KI Brief- & Dokumenten-Studio <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500 text-black font-black uppercase">DIN-A4 Live Layout</span>
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">Interaktiver Vertrags- & Brief-Editor im Schweizer Layout</p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPdfStudioOpen(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Printer size={15} className="text-amber-400" /> PDF Studio / Drucken
          </button>
          
          <button
            onClick={handleCopyText}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            {isCopied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
            {isCopied ? 'Kopiert' : 'Text Kopieren'}
          </button>

          <button
            onClick={handleSaveDocument}
            disabled={isSaving}
            className={cn(
              "px-5 py-2 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50",
              saveScope === 'company' ? "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20" : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
            )}
          >
            {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saveScope === 'company' ? 'In Firmen-Dokumente speichern' : 'In Projekt-Bauakte speichern'}
          </button>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors ml-2 cursor-pointer"
            title="Schließen"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Main Studio Canvas Area */}
      <div className="flex-1 flex overflow-hidden bg-slate-950">
        
        {/* Left Sidebar Control Panel */}
        <aside className="w-80 border-r border-slate-800 bg-slate-900/90 p-5 flex flex-col gap-5 overflow-y-auto custom-scrollbar shrink-0 text-slate-200">
          
          {/* Target Scope Selection */}
          <div className="space-y-2">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">1. Ablageort festlegen</label>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => setSaveScope('company')}
                className={cn(
                  "p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer",
                  saveScope === 'company'
                    ? "bg-blue-600/10 border-blue-500 text-white shadow-md shadow-blue-500/10"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white"
                )}
              >
                <Building2 size={18} className="text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs text-white">Firmenunterlagen</div>
                  <div className="text-[10px] text-slate-400">Company Dashboard ➔ Dokumente</div>
                </div>
              </button>

              <button
                onClick={() => setSaveScope('project')}
                className={cn(
                  "p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer",
                  saveScope === 'project'
                    ? "bg-emerald-600/10 border-emerald-500 text-white shadow-md shadow-emerald-500/10"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white"
                )}
              >
                <Briefcase size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs text-white">Projekt-Bauakte</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{activeProject?.name || 'Aktuelles Projekt'}</div>
                </div>
              </button>
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Recipient Details Edit */}
          <div className="space-y-3">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">2. Empfänger-Adresse</label>
            <input
              type="text"
              value={recipientName}
              onChange={e => setRecipientName(e.target.value)}
              placeholder="Empfänger Name / Firma..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none font-bold"
            />
            <input
              type="text"
              value={recipientStreet}
              onChange={e => setRecipientStreet(e.target.value)}
              placeholder="Strasse & Nr..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none font-medium"
            />
            <input
              type="text"
              value={recipientZipCity}
              onChange={e => setRecipientZipCity(e.target.value)}
              placeholder="PLZ & Ort..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none font-medium"
            />
          </div>

          <hr className="border-slate-800" />

          {/* Document Header Meta Edit */}
          <div className="space-y-3">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">3. Datum & Referenz</label>
            <input
              type="text"
              value={docPlaceDate}
              onChange={e => setDocPlaceDate(e.target.value)}
              placeholder="Ort, Datum..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none font-medium"
            />
            <input
              type="text"
              value={docReference}
              onChange={e => setDocReference(e.target.value)}
              placeholder="Referenz / Projekt..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none font-medium"
            />
          </div>

          <hr className="border-slate-800" />

          {/* Signatories Edit */}
          <div className="space-y-3">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">4. Unterschriften-Blöcke</label>
            <div>
              <span className="text-[10px] text-slate-400">Auftraggeber (Bauherr):</span>
              <input
                type="text"
                value={clientSignatory}
                onChange={e => setClientSignatory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-amber-500 outline-none font-medium mt-1"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Auftragnehmer (Architekt):</span>
              <input
                type="text"
                value={architectSignatory}
                onChange={e => setArchitectSignatory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-amber-500 outline-none font-medium mt-1"
              />
            </div>
          </div>
        </aside>

        {/* Live DIN-A4 Paper Canvas */}
        <main className="flex-1 overflow-y-auto p-6 md:p-12 flex justify-center items-start custom-scrollbar bg-slate-950">
          <div className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-[15mm] md:p-[20mm] shadow-2xl rounded-sm font-sans flex flex-col justify-between relative border border-slate-300">
            
            <div>
              {/* Swiss Letter Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
                <div>
                  <h1 className="text-xl font-black text-slate-900 uppercase tracking-wider">{companyData.name}</h1>
                  <p className="text-xs text-slate-600 font-medium mt-1">{companyData.street} • {companyData.zipCity}</p>
                  <p className="text-[11px] text-blue-600 font-bold mt-0.5">{companyData.website}</p>
                </div>
                {companyData.logo ? (
                  <img src={companyData.logo} alt="Logo" className="h-12 object-contain max-w-[160px]" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center text-xl shadow-md">
                    K
                  </div>
                )}
              </div>

              {/* Recipient Address & Meta Data Grid */}
              <div className="grid grid-cols-2 gap-8 mb-10 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Empfänger</div>
                  <div className="font-bold text-slate-900 text-sm">{recipientName}</div>
                  <div className="text-slate-700">{recipientStreet}</div>
                  <div className="text-slate-700 font-medium">{recipientZipCity}</div>
                </div>

                <div className="text-right space-y-1 self-end">
                  <div className="font-bold text-slate-900 text-xs">{docPlaceDate}</div>
                  <div className="text-slate-500 font-mono text-[11px]">{docReference}</div>
                </div>
              </div>

              {/* Editable Document Title */}
              <div className="mb-6">
                <input
                  type="text"
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  className="w-full text-xl md:text-2xl font-black text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-blue-600 outline-none pb-1 bg-transparent tracking-tight"
                  placeholder="Betreff / Dokumtentitel..."
                />
              </div>

              {/* Editable Document Body */}
              <div className="mb-10">
                <textarea
                  value={docContent}
                  onChange={e => setDocContent(e.target.value)}
                  rows={14}
                  className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-600 rounded-xl p-4 text-xs md:text-sm text-slate-800 font-sans leading-relaxed outline-none resize-y min-h-[300px] font-medium"
                />
              </div>
            </div>

            {/* Swiss Dual Signature Block */}
            <div className="pt-8 border-t-2 border-slate-900 mt-12">
              <div className="text-[11px] font-bold text-slate-600 mb-6 uppercase tracking-wider">Unterschriften & Rechtsgültige Bestätigung</div>
              <div className="grid grid-cols-2 gap-12 text-xs">
                <div>
                  <div className="text-slate-500 mb-10">Ort, Datum: _______________________</div>
                  <div className="border-t border-slate-900 pt-2 font-bold text-slate-900">{clientSignatory}</div>
                  <div className="text-[10px] text-slate-500">Rechtsgültige Unterschrift Auftraggeber</div>
                </div>

                <div>
                  <div className="text-slate-500 mb-10">Ort, Datum: _______________________</div>
                  <div className="border-t border-slate-900 pt-2 font-bold text-slate-900">{architectSignatory}</div>
                  <div className="text-[10px] text-slate-500">Rechtsgültige Unterschrift Auftragnehmer</div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Universal PDF Studio Export Integration Modal */}
      {isPdfStudioOpen && (
        <UniversalPDFStudio
          isOpen={isPdfStudioOpen}
          onClose={() => setIsPdfStudioOpen(false)}
          title={docTitle}
          fileName={docTitle.replace(/\s+/g, '_')}
          onSaveCloud={handleSaveDocument}
        >
          <div className="p-8 bg-white text-slate-900 font-sans max-w-2xl mx-auto space-y-6">
            <div className="border-b-2 border-slate-900 pb-4">
              <h1 className="text-xl font-bold">{companyData.name}</h1>
              <p className="text-xs text-slate-500">{companyData.street} • {companyData.zipCity}</p>
            </div>
            <div className="text-xs space-y-1">
              <p className="font-bold">{recipientName}</p>
              <p>{recipientStreet}</p>
              <p>{recipientZipCity}</p>
            </div>
            <h2 className="text-lg font-bold border-b pb-2">{docTitle}</h2>
            <div className="text-xs whitespace-pre-wrap leading-relaxed">{docContent}</div>
            <div className="pt-8 border-t flex justify-between text-xs">
              <div>Unterschrift Auftraggeber: ____________________</div>
              <div>Unterschrift Auftragnehmer: ____________________</div>
            </div>
          </div>
        </UniversalPDFStudio>
      )}

    </div>
  );
}
