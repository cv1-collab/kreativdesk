import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SmartProposal } from '../../services/proposalService';
import { CompanySettings } from '../../services/companySettingsService';

export function generateSignedProposalPdfDoc(
  proposalData: SmartProposal,
  acceptance: any,
  total: number,
  getTranslatedProposalTitle: (title?: string) => string,
  companySettings?: CompanySettings
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Top Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RECHTSVERBINDLICHE AUFTRAGSBESTÄTIGUNG', 15, 18);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${companySettings?.companyName || (proposalData as any)?.companyName || 'Architektur & Planung'} • Smart Proposal & SIA 102/118 Digitale Freigabe`, 15, 26);

  // Project Info
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`Projekt: ${getTranslatedProposalTitle(proposalData.title)}`, 15, 48);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Auftraggeber: ${acceptance.name} ${acceptance.company ? `(${acceptance.company})` : ''}`, 15, 56);
  doc.text(`E-Mail: ${acceptance.email} | Datum: ${new Date().toLocaleDateString('de-CH')}`, 15, 62);
  doc.text(`Status: DIGITAL UNTERZEICHNET & VERBINDLICH FREIGEGEBEN`, 15, 68);

  // Table of Items
  const tableRows: any[] = [
    ['1', 'Basis-Projektumfang & Planung gemäss SIA', `${proposalData.currency} ${proposalData.basePrice.toLocaleString('de-CH')}`]
  ];

  (proposalData.options || [])
    .filter(o => acceptance.selectedOptionIds.includes(o.id))
    .forEach((opt, idx) => {
      tableRows.push([`${idx + 2}`, `[Zusatzpaket] ${opt.title}`, `+${proposalData.currency} ${opt.price.toLocaleString('de-CH')}`]);
    });

  autoTable(doc, {
    startY: 74,
    head: [['Pos', 'Leistungsbeschreibung & Position', 'Betrag']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 3 }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 8;

  // Total Price Box
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Gesamtinvestition (exkl. MwSt.): ${proposalData.currency} ${total.toLocaleString('de-CH')}`, 15, finalY);

  // Payment Milestones Table
  const milestones = (proposalData as any).paymentMilestones || [
    { phase: 'Phase 1: Vorprojekt & Machbarkeit', percentage: 20, description: 'Grundlagen & Kostenschätzung' },
    { phase: 'Phase 2: Bauprojekt & Baueingabe', percentage: 30, description: 'Pläne & Baueingabe' },
    { phase: 'Phase 3: Ausführungsplanung', percentage: 25, description: 'Detailpläne & Ausschreibung' },
    { phase: 'Phase 4: Realisierung & Bauleitung', percentage: 20, description: 'Örtliche Bauleitung & Kontrolle' },
    { phase: 'Phase 5: Abschluss & Abnahme', percentage: 5, description: 'Garantieabnahme & Abrechnung' }
  ];

  const msRows = milestones.map((ms: any) => [
    ms.phase,
    `${ms.percentage}%`,
    `${proposalData.currency} ${Math.round((total * ms.percentage) / 100).toLocaleString('de-CH')}`,
    ms.description
  ]);

  autoTable(doc, {
    startY: finalY + 6,
    head: [['SIA-Zahlungsphase', 'Anteil', 'Fälliger Betrag', 'Leistungsnachweis']],
    body: msRows,
    theme: 'striped',
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255] },
    styles: { fontSize: 8, cellPadding: 2.2 }
  });

  let signY = (doc as any).lastAutoTable.finalY + 10;
  if (signY > 235) {
    doc.addPage();
    signY = 25;
  }

  // Legal Confirmation & Signature Stamp
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  const legalLines = doc.splitTextToSize('Mit der digitalen Signatur bestätigt die Bauherrschaft die verbindliche Annahme des vorliegenden Angebots.', 170);
  doc.text(legalLines, 20, signY);
  const stampY = signY + legalLines.length * 4 + 2;
  doc.text(`Signatur-Zeitstempel: ${new Date().toISOString()} | Signatur-ID: KD-SIG-${Date.now().toString(36).toUpperCase()}`, 20, stampY);

  if (acceptance.signatureDataUrl) {
    try {
      doc.addImage(acceptance.signatureDataUrl, 'PNG', 20, stampY + 4, 45, 18);
      doc.text(`Digital unterzeichnet von: ${acceptance.name}`, 20, stampY + 26);
    } catch (e) {}
  }

  doc.save(`Auftragsbestaetigung_${getTranslatedProposalTitle(proposalData.title).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}

export function downloadProposalQRBillPdf(
  proposal: SmartProposal,
  companySettings: CompanySettings,
  total: number,
  acceptName: string,
  acceptCompany: string,
  getTranslatedProposalTitle: (title?: string) => string
) {
  const depositRatio = 0.3;
  const depositPercent = Math.round(depositRatio * 100);
  const depositAmount = Math.round(total * depositRatio);

  const issuerName = companySettings.companyName || (proposal as any).companyName || 'Architektur & Planung';
  const issuerAddress = [
    [companySettings.street, companySettings.buildingNumber].filter(Boolean).join(' '),
    [companySettings.postalCode, companySettings.city].filter(Boolean).join(' ')
  ].filter(Boolean).join(' • ') || 'Schweiz';
  const issuerIban = companySettings.qrIban || companySettings.iban || 'Gemäss Vertrag / Offerte';

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Top Header Banner
  doc.setFillColor(2, 132, 199);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`SCHWEIZER QR-RECHNUNG (${depositPercent}% ANZAHLUNG)`, 15, 16);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${issuerName} • ${issuerAddress}`, 15, 24);

  // Invoice Info
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Projekt / Offerte: ${getTranslatedProposalTitle(proposal.title)}`, 15, 45);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Empfänger: ${acceptName || proposal.clientName} ${acceptCompany ? `(${acceptCompany})` : ''}`, 15, 52);
  doc.text(`Datum: ${new Date().toLocaleDateString('de-CH')} | Zahlungsfrist: 10 Tage netto`, 15, 58);
  doc.text(`Gesamtbetrag Offerte: CHF ${total.toLocaleString('de-CH', { minimumFractionDigits: 2 })}`, 15, 64);
  doc.text(`Fällige Anzahlung (${depositPercent}%): CHF ${depositAmount.toLocaleString('de-CH', { minimumFractionDigits: 2 })}`, 15, 70);

  // QR Bill Payment Section
  doc.setLineWidth(0.5);
  doc.setDrawColor(203, 213, 225);
  doc.line(15, 76, 195, 76);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Zahlteil / Section paiement (SIX Swiss Payment Standard)', 15, 84);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Konto / Account: ${issuerIban} (${issuerName})`, 15, 92);
  doc.text(`Referenz: QRR-2026-${Math.floor(100000 + Math.random() * 900000)}`, 15, 97);
  doc.text(`Zahlbar durch: ${acceptName || proposal.clientName}, ${acceptCompany || proposal.clientCompany || ''}`, 15, 102);

  doc.setFillColor(241, 245, 249);
  doc.rect(15, 110, 180, 25, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 132, 199);
  doc.text(`Zahlbarer Betrag: CHF ${depositAmount.toLocaleString('de-CH', { minimumFractionDigits: 2 })}`, 22, 126);

  doc.save(`QR_Rechnung_Anzahlung_${getTranslatedProposalTitle(proposal.title).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}
