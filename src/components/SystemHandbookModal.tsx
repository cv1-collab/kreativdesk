import React, { useMemo } from 'react';
import UniversalPDFStudio, { PDFSettings } from './UniversalPDFStudio';
import SystemHandbookPDFDocument from './pdf/SystemHandbookPDFDocument';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { uploadPdfBlobWithFallback } from '../utils/cloudStorageHelper';
import { BookOpen, Sparkles, CheckCircle2, Shield } from 'lucide-react';

interface SystemHandbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLanguage?: 'de' | 'en';
}

export default function SystemHandbookModal({
  isOpen,
  onClose,
  initialLanguage
}: SystemHandbookModalProps) {
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const isEn = (initialLanguage || language) === 'en';

  const title = isEn 
    ? 'Master System Handbook 2026' 
    : 'Offizielles Master-System-Handbuch 2026';

  const fileName = useMemo(() => {
    return isEn 
      ? 'KreativDesk_OS_Master_System_Guide_2026' 
      : 'KreativDesk_OS_Master_System_Handbuch_2026';
  }, [isEn]);

  const companyName = currentUser?.companyName || 'Kreativ Desk OS';

  const handleSaveCloud = async (blob: Blob) => {
    try {
      const safeCompanyId = currentUser?.companyId || currentUser?.uid || 'global';
      const storageFileName = `${fileName}_${Date.now()}.pdf`;
      const publicUrl = await uploadPdfBlobWithFallback(blob, storageFileName, safeCompanyId);

      // Find or link to 09_DOKUMENTATION or 02_RECHTLICHES folder if present
      const { data: folderData } = await supabase
        .from('documents')
        .select('id')
        .eq('company_id', safeCompanyId)
        .eq('is_folder', true)
        .ilike('name', '%dokumentation%')
        .maybeSingle();

      const targetFolderId = folderData?.id || null;

      await supabase.from('documents').insert({
        name: isEn ? 'Kreativ Desk OS - Master System Guide 2026.pdf' : 'Kreativ Desk OS - Master-System-Handbuch 2026.pdf',
        url: publicUrl,
        file_url: publicUrl,
        type: 'application/pdf',
        size: `${Math.round(blob.size / 1024)} KB`,
        is_folder: false,
        folder_id: targetFolderId,
        category: 'documentation',
        owner_id: currentUser?.uid,
        company_id: safeCompanyId,
        uploaded_by: currentUser?.uid,
        project_id: 'global',
        created_at: new Date().toISOString(),
        uploaded_at: new Date().toISOString(),
        date: new Date().toLocaleDateString(isEn ? 'en-US' : 'de-CH')
      });

      addToast(
        isEn 
          ? 'Master Handbook successfully saved to Company Vault!' 
          : 'Master-Handbuch erfolgreich im Datenraum der Firmenzentrale gespeichert!',
        'success'
      );
    } catch (err) {
      console.error('Save to vault error:', err);
      addToast(
        isEn ? 'Failed to save handbook to vault.' : 'Fehler beim Speichern im Datenraum.',
        'error'
      );
    }
  };

  if (!isOpen) return null;

  return (
    <UniversalPDFStudio
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      fileName={fileName}
      onSaveCloud={handleSaveCloud}
      defaultOrientation="portrait"
      defaultAccentColor="#2563EB"
      defaultFooterText="Kreativ Desk OS | Offizielles Master-Referenzhandbuch 2026 | Vertraulich"
      sidebarControls={
        <div className="space-y-3 pt-2">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/25 text-xs text-text-primary space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-blue-500 uppercase tracking-wider text-[11px]">
              <Sparkles size={13} />
              <span>{isEn ? 'Official 14-Page Master Guide' : 'Offizielles 14-Seiten Handbuch'}</span>
            </div>
            <p className="text-[11px] text-text-muted leading-relaxed font-medium">
              {isEn
                ? 'Covers all 12 modules, the 2-tier architecture (Company Hub vs. Project Cockpit), SIA 102/118 compliance, BKP 1–9 and Swiss QR-bill.'
                : 'Erklärt alle 12 Module im Detail: 2-Ebenen-Prinzip, 3D BIM, CAD-Pläne, BKP 1–9, SIA 102/118, Offline PWA und Schweizer QR-Rechnung.'}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-surface border border-border/70 text-[11px] text-text-muted space-y-1">
            <div className="flex items-center gap-1.5 text-text-primary font-bold">
              <Shield size={12} className="text-emerald-500" />
              <span>{isEn ? 'SIA Standards & Norms' : 'SIA-Standards & Normen'}</span>
            </div>
            <p className="text-[10px] leading-tight">
              {isEn ? 'SIA 102, SIA 118, ISO 20022 QR-Bill, Swiss DSG & GDPR.' : 'SIA 102, SIA 118, ISO 20022 QR-Rechnung, Schweizer DSG & DSGVO.'}
            </p>
          </div>
        </div>
      }
    >
      {(settings: PDFSettings) => (
        <SystemHandbookPDFDocument
          settings={settings}
          companyName={companyName}
        />
      )}
    </UniversalPDFStudio>
  );
}
