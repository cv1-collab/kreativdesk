import React from 'react';
import UniversalPDFStudio, { PDFSettings } from './UniversalPDFStudio';
import WhiteboardPDFDocument from './WhiteboardPDFDocument';

interface WhiteboardPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfRenderImage: string | null;
  projectName: string;
  onSaveCloud: (blob: Blob) => Promise<void>;
}

export default function WhiteboardPDFModal({
  isOpen,
  onClose,
  pdfRenderImage,
  projectName,
  onSaveCloud,
}: WhiteboardPDFModalProps) {
  if (!isOpen) return null;

  return (
    <UniversalPDFStudio
      isOpen={isOpen}
      onClose={onClose}
      title="Whiteboard Export"
      fileName={`Whiteboard_${(projectName || 'Projekt').replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}`}
      onSaveCloud={onSaveCloud}
      defaultOrientation="landscape"
    >
      {(settings: PDFSettings) => (
        <WhiteboardPDFDocument
          settings={settings}
          pdfRenderImage={pdfRenderImage}
          projectHeader={{ project: projectName || 'Projekt', date: new Date().toISOString() }}
        />
      )}
    </UniversalPDFStudio>
  );
}
