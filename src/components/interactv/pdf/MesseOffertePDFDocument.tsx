import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image as PDFImage } from '@react-pdf/renderer';
import { PDFSettings } from '../../UniversalPDFStudio';
import { generateSwissQRPayload, getSwissQRCodeUrl } from '../../../utils/qrBillGenerator';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#0F172A'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1.5,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 14,
    marginBottom: 16
  },
  companyName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A'
  },
  companySubtitle: {
    fontSize: 8.5,
    color: '#0284C7',
    marginTop: 2,
    marginBottom: 6
  },
  companyDetails: {
    fontSize: 7.5,
    color: '#64748B',
    lineHeight: 1.3
  },
  docMetaRight: {
    alignItems: 'flex-end'
  },
  badge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    color: '#1D4ED8',
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    marginBottom: 6
  },
  docNumber: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A'
  },
  docDate: {
    fontSize: 8,
    color: '#64748B',
    marginTop: 2
  },
  addressGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 18,
    gap: 16
  },
  addressCol: {
    flex: 1
  },
  addressLabel: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 4
  },
  clientName: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A'
  },
  clientCompany: {
    fontSize: 9,
    color: '#334155',
    marginTop: 1
  },
  clientContact: {
    fontSize: 8,
    color: '#64748B',
    marginTop: 2
  },
  table: {
    marginTop: 4,
    marginBottom: 16
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: '#0F172A',
    paddingBottom: 5,
    marginBottom: 5
  },
  th: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#64748B',
    textTransform: 'uppercase'
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center'
  },
  colPos: { width: '8%' },
  colDesc: { width: '56%' },
  colDays: { width: '12%', textAlign: 'center' },
  colPrice: { width: '24%', textAlign: 'right' },
  itemTitle: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A'
  },
  itemDesc: {
    fontSize: 7,
    color: '#64748B',
    marginTop: 1.5
  },
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0'
  },
  totalsBox: {
    width: 220
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2.5
  },
  totalLabel: {
    fontSize: 8,
    color: '#64748B'
  },
  totalVal: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A'
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 6,
    marginTop: 4,
    borderTopWidth: 1.5,
    borderTopColor: '#0F172A'
  },
  grandTotalLabel: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0284C7'
  },
  grandTotalVal: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#0284C7'
  },
  guaranteeBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 6,
    padding: 10,
    marginTop: 14
  },
  guaranteeTitle: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#1E3A8A',
    marginBottom: 2
  },
  guaranteeText: {
    fontSize: 7.5,
    color: '#3B82F6',
    lineHeight: 1.3
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: '#CBD5E1',
    paddingTop: 6
  },
  footerText: {
    fontSize: 7,
    color: '#94A3B8'
  },
  watermark: {
    position: 'absolute',
    top: '40%',
    left: '20%',
    fontSize: 48,
    fontFamily: 'Helvetica-Bold',
    color: 'rgba(2, 132, 199, 0.06)',
    transform: 'rotate(-25deg)'
  }
});

interface MesseOffertePDFDocumentProps {
  settings: PDFSettings;
  leadName?: string;
  leadCompany?: string;
  leadEmail?: string;
  leadPhone?: string;
  fairName?: string;
  steleModelName?: string;
  baseDiameterCm?: number;
  touchscreenOption?: 'byod' | 'interactv_touch';
  screenInches?: number;
  steleChassisPrice?: number;
  touchscreenPrice?: number;
  selectedPackage?: 'stele_43_rental' | 'stele_55_dual' | 'complete_suite';
  durationDays?: number;
  includeNfc?: boolean;
  include3dPlanner?: boolean;
  includeInsurance?: boolean;
  companyName?: string;
  companySubtitle?: string;
  companyAddress?: string;
  companyContact?: string;
  footerText?: string;
}

export const MesseOffertePDFDocument: React.FC<MesseOffertePDFDocumentProps> = ({
  settings,
  leadName = 'Aussteller',
  leadCompany = 'Unternehmen',
  leadEmail = 'kontakt@unternehmen.com',
  leadPhone = '+41 79 123 45 67',
  fairName = 'Fachmesse 2026',
  steleModelName = 'interacTV Event Pro 80',
  baseDiameterCm = 80,
  touchscreenOption = 'interactv_touch',
  screenInches = 43,
  steleChassisPrice = 490,
  touchscreenPrice = 290,
  selectedPackage = 'stele_43_rental',
  durationDays = 3,
  includeNfc = true,
  include3dPlanner = true,
  includeInsurance = true,
  companyName = 'interacTV Interactive Systems',
  companySubtitle = '4K Smart Stelen, Digital Signage & 3D Spatial Experiences',
  companyAddress = 'Technoparkstrasse 1 • 8005 Zürich',
  companyContact = 'kontakt@interactv.ch • +41 44 200 40 80',
  footerText
}) => {
  const lang = settings.language || 'de';
  const curr = settings.currency || 'CHF';
  const rate = curr === 'EUR' ? 1.05 : curr === 'USD' ? 1.12 : 1.0;

  const baseStele = steleChassisPrice || (selectedPackage === 'stele_43_rental' ? 490 : 890);
  const baseTouch = touchscreenOption === 'byod' ? 0 : (touchscreenPrice || 290);
  const baseNfc = includeNfc ? 350 : 0;
  const basePlanner = include3dPlanner ? 450 : 0;
  const baseInsurance = includeInsurance ? 180 : 0;
  const baseTransport = 280;

  const finalStelePrice = Math.round(baseStele * rate);
  const finalTouchPrice = Math.round(baseTouch * rate);
  const nfcPrice = Math.round(baseNfc * rate);
  const plannerPrice = Math.round(basePlanner * rate);
  const insurancePrice = Math.round(baseInsurance * rate);
  const transportPrice = Math.round(baseTransport * rate);

  const subtotal = finalStelePrice + finalTouchPrice + nfcPrice + plannerPrice + insurancePrice + transportPrice;
  const discount = Math.round(subtotal * 0.08);
  const netTotal = subtotal - discount;
  const vat = Math.round(netTotal * 0.081 * 100) / 100;
  const grandTotal = netTotal + vat;

  const docNumber = `OFF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const offerteNumber = docNumber;
  const dateStr = new Date().toLocaleDateString(lang === 'en' ? 'en-US' : lang === 'fr' ? 'fr-FR' : 'de-CH');

  // Multi-Language Dictionary
  const t = {
    de: {
      badge: 'SIA-Messeofferte // Mietvertrag',
      docNr: 'Nr.',
      date: 'Datum',
      validity: 'Gültigkeit: 30 Tage',
      clientTitle: 'Auftraggeber / Empfänger',
      fairTitle: 'Messe & Einsatzort',
      duration: 'Mietdauer',
      days: 'Messetage',
      flightcaseNote: 'Inkl. Rollen-Flightcase & 5-Minuten Schnellaufbau',
      pos: 'Pos.',
      desc: 'Bezeichnung / Leistungsumfang',
      tableDays: 'Tage',
      amount: `Betrag (${curr})`,
      item1Title: `${steleModelName} (Chassis Ø ${baseDiameterCm} cm)`,
      item1Desc: 'interacTV Präzisions Aluminium/Stahl-Chassis, verdecktes Kabelmanagement, Universal VESA 200/400 Aufnahme, 360° LED-Glimmnut',
      item2ByodTitle: 'Display: Eigenes Kundendisplay (BYOD Montage-Kit)',
      item2ByodDesc: `Universal VESA-Montagesatz & Kabeldurchführung inklusive (Aufpreis ${curr} 0.–)`,
      item2TouchTitle: `Display: ${screenInches}" 4K PCAP Touchscreen`,
      item2TouchDesc: '4K UHD IPS Commercial Panel (500 nits), 10-Punkt PCAP Multitouch, Anti-Glare, betriebsbereit',
      item3Title: 'NFC Lift & Learn Sensorik-Kit',
      item3Desc: 'USB-Hardware Sensor + 10x programmierbare Produkt-Tags',
      item4Title: '3D WebGL Messestand Visualizer & Digital Twin',
      item4Desc: 'Interaktive Standansicht für Kunden & Web-Showroom',
      item5Title: 'All-Risk Messe- & Transportschutz',
      item5Desc: 'Vollkaskoschutz ohne Selbstbehalt während der Messe',
      item6Title: 'Anlieferung, Einweisung & Rücktransport',
      item6Desc: 'Direkt an Ihren Messestandort via Express-Logistik',
      subtotalNet: 'Zwischensumme netto:',
      discount: 'Messe-Aktionsrabatt (-8%):',
      vat: 'MwSt. 8.1%:',
      grandTotal: `Gesamtbetrag (${curr}):`,
      guaranteeTitle: '5-Minuten Aufbau- & Funktionsgarantie',
      guaranteeText: 'Zahlungskonditionen: 14 Tage netto nach Messe-Abschluss. Dieses Angebot basiert auf den SIA-Honorar- und Bereitstellungsrichtlinien.',
      page2Title: curr === 'CHF' ? 'Schweizer QR-Rechnung // Zahlteil' : 'International SEPA & Wire Payment Part',
      page2Sub: curr === 'CHF' ? 'Offizieller Schweizer Standard nach ISO 20022 (SIX Payment Services)' : 'Official ISO 20022 Electronic SEPA Bank Transfer Standard',
      due: 'Fällig: 30 Tage netto',
      payInfo: 'Zahlungsinformationen & 50% Messe-Anzahlungsoption',
      payInfoDesc: 'Bitte verwenden Sie die Bankverbindung für Ihre Überweisung. Für eine verbindliche Reservierung ist eine Anzahlung von 50% fällig.'
    },
    en: {
      badge: 'Official Trade Show Quote // Rental Agreement',
      docNr: 'No.',
      date: 'Date',
      validity: 'Validity: 30 Days',
      clientTitle: 'Client / Recipient',
      fairTitle: 'Exhibition & Venue',
      duration: 'Rental Duration',
      days: 'Exhibition Days',
      flightcaseNote: 'Includes Heavy-Duty Flightcase & 5-Minute Fast Toolless Setup',
      pos: 'Item',
      desc: 'Description & Scope of Services',
      tableDays: 'Days',
      amount: `Amount (${curr})`,
      item1Title: `${steleModelName} (Stand Ø ${baseDiameterCm} cm)`,
      item1Desc: 'interacTV precision aluminum/steel kiosk stand, concealed cable routing, universal VESA 200/400 mount, 360° LED halo glow',
      item2ByodTitle: 'Display: Customer Own Display (BYOD Mounting Kit)',
      item2ByodDesc: `Universal VESA mounting set & cable passthrough included (${curr} 0.-)`,
      item2TouchTitle: `Display: ${screenInches}" 4K PCAP Touchscreen`,
      item2TouchDesc: '4K UHD IPS Commercial Panel (500 nits), 10-Point PCAP Multitouch, Anti-Glare, pre-configured',
      item3Title: 'NFC Lift & Learn Sensor Suite',
      item3Desc: 'USB hardware sensor module + 10x programmable product smart tags',
      item4Title: '3D WebGL Booth Visualizer & Digital Twin',
      item4Desc: 'Interactive spatial 3D booth presentation for clients & showroom',
      item5Title: 'All-Risk Exhibition & Transit Insurance',
      item5Desc: 'Full comprehensive coverage without deductible during the event',
      item6Title: 'White-Glove Delivery, Briefing & Return Logistics',
      item6Desc: 'Direct delivery to your booth location via dedicated Swiss express freight',
      subtotalNet: 'Subtotal net:',
      discount: 'Trade show bundle discount (-8%):',
      vat: 'VAT (8.1%):',
      grandTotal: `Grand Total (${curr}):`,
      guaranteeTitle: '5-Minute Setup & Operational Guarantee',
      guaranteeText: 'Payment terms: 14 days net after exhibition wrap-up. This quote adheres to Swiss SIA event deployment standards.',
      page2Title: 'International SEPA & Wire Payment Part',
      page2Sub: 'Official ISO 20022 Electronic SEPA & SWIFT Bank Transfer Standard',
      due: 'Due: 30 days net',
      payInfo: 'Payment Details & 50% Booth Reservation Option',
      payInfoDesc: 'Please use the bank account coordinates below for your electronic wire transfer. A 50% deposit confirms station reservation.'
    },
    fr: {
      badge: 'Offre Salon Officielle // Contrat de location',
      docNr: 'N°',
      date: 'Date',
      validity: 'Validité: 30 Jours',
      clientTitle: 'Client / Destinataire',
      fairTitle: 'Salon & Lieu d\'exposition',
      duration: 'Durée de location',
      days: 'Jours de salon',
      flightcaseNote: 'Inclus Flightcase à roulettes & Montage rapide sans outil en 5 minutes',
      pos: 'Pos.',
      desc: 'Désignation & Prestations',
      tableDays: 'Jours',
      amount: `Montant (${curr})`,
      item1Title: `${steleModelName} (Socle Ø ${baseDiameterCm} cm)`,
      item1Desc: 'Châssis haute précision en aluminium/acier brossé interacTV, passage de câbles dissimulé, support VESA universel, halo LED 360°',
      item2ByodTitle: 'Écran: Écran client (Kit de montage BYOD)',
      item2ByodDesc: `Kit de montage VESA universel & passage de câbles inclus (${curr} 0.-)`,
      item2TouchTitle: `Écran: Écran tactile 4K PCAP ${screenInches}"`,
      item2TouchDesc: 'Dalle commerciale 4K UHD IPS (500 nits), 10 points PCAP multitouch, anti-reflet, prêt à l\'emploi',
      item3Title: 'Kit capteurs interactifs NFC Lift & Learn',
      item3Desc: 'Module capteur USB + 10x puces intelligentes programmables',
      item4Title: 'Jumeau numérique 3D WebGL du stand',
      item4Desc: 'Vue interactive du stand pour les clients & showroom digital',
      item5Title: 'Assurance tous risques salon & transport',
      item5Desc: 'Couverture complète sans franchise pendant toute la durée de l\'événement',
      item6Title: 'Livraison express, prise en main & retour',
      item6Desc: 'Livraison directe à votre emplacement de stand via logistique dédiée',
      subtotalNet: 'Sous-total net:',
      discount: 'Remise forfait salon (-8%):',
      vat: 'TVA (8.1%):',
      grandTotal: `Montant Total (${curr}):`,
      guaranteeTitle: 'Garantie de montage & bon fonctionnement en 5 min',
      guaranteeText: 'Conditions de paiement: 14 jours net après le salon. Devis conforme aux normes suisses SIA pour événements professionnels.',
      page2Title: 'Section Paiement International SEPA / QR Facture',
      page2Sub: 'Standard bancaire officiel ISO 20022 pour virements électroniques SEPA / SIX',
      due: 'Échéance: 30 jours net',
      payInfo: 'Informations de règlement & acompte de 50%',
      payInfoDesc: 'Veuillez utiliser les coordonnées bancaires ci-dessous pour votre virement. Un acompte de 50% valide la réservation du matériel.'
    }
  }[lang];

  return (
    <Document>
      <Page size={settings.format} orientation={settings.orientation} style={styles.page}>
        {settings.watermark && settings.watermark !== 'NONE' && (
          <Text style={styles.watermark}>{settings.watermark}</Text>
        )}

        {/* Top Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.companyName}>{companyName}</Text>
            <Text style={styles.companySubtitle}>{companySubtitle}</Text>
            <Text style={styles.companyDetails}>{companyAddress}</Text>
            <Text style={styles.companyDetails}>{companyContact}</Text>
          </View>

          <View style={styles.docMetaRight}>
            <Text style={[styles.badge, { borderColor: settings.accentColor || '#0284C7', color: settings.accentColor || '#0284C7' }]}>
              {t.badge}
            </Text>
            <Text style={styles.docNumber}>{t.docNr} {docNumber}</Text>
            <Text style={styles.docDate}>{t.date}: {dateStr}</Text>
            <Text style={styles.docDate}>{t.validity}</Text>
          </View>
        </View>

        {/* Client & Project Address */}
        <View style={styles.addressGrid}>
          <View style={styles.addressCol}>
            <Text style={styles.addressLabel}>{t.clientTitle}</Text>
            <Text style={styles.clientName}>{leadName}</Text>
            <Text style={styles.clientCompany}>{leadCompany}</Text>
            <Text style={styles.clientContact}>{leadEmail} • {leadPhone}</Text>
          </View>

          <View style={styles.addressCol}>
            <Text style={styles.addressLabel}>{t.fairTitle}</Text>
            <Text style={[styles.clientName, { color: settings.accentColor || '#0284C7' }]}>{fairName}</Text>
            <Text style={styles.clientCompany}>{t.duration}: {durationDays} {t.days}</Text>
            <Text style={styles.clientContact}>{t.flightcaseNote}</Text>
          </View>
        </View>

        {/* Positions Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.colPos]}>{t.pos}</Text>
            <Text style={[styles.th, styles.colDesc]}>{t.desc}</Text>
            <Text style={[styles.th, styles.colDays]}>{t.tableDays}</Text>
            <Text style={[styles.th, styles.colPrice]}>{t.amount}</Text>
          </View>

          {/* Pos 1.0: Stele Chassis */}
          <View style={styles.tableRow}>
            <Text style={[styles.colPos, { color: '#94A3B8' }]}>1.0</Text>
            <View style={styles.colDesc}>
              <Text style={styles.itemTitle}>{t.item1Title}</Text>
              <Text style={styles.itemDesc}>{t.item1Desc}</Text>
            </View>
            <Text style={styles.colDays}>{durationDays}</Text>
            <Text style={[styles.colPrice, { fontFamily: 'Helvetica-Bold' }]}>{finalStelePrice.toFixed(2)}</Text>
          </View>

          {/* Pos 2.0: Display-Modul */}
          <View style={styles.tableRow}>
            <Text style={[styles.colPos, { color: '#94A3B8' }]}>2.0</Text>
            <View style={styles.colDesc}>
              <Text style={styles.itemTitle}>
                {touchscreenOption === 'byod' ? t.item2ByodTitle : t.item2TouchTitle}
              </Text>
              <Text style={styles.itemDesc}>
                {touchscreenOption === 'byod' ? t.item2ByodDesc : t.item2TouchDesc}
              </Text>
            </View>
            <Text style={styles.colDays}>{durationDays}</Text>
            <Text style={[styles.colPrice, { fontFamily: 'Helvetica-Bold' }]}>{finalTouchPrice.toFixed(2)}</Text>
          </View>

          {includeNfc && (
            <View style={styles.tableRow}>
              <Text style={[styles.colPos, { color: '#94A3B8' }]}>3.0</Text>
              <View style={styles.colDesc}>
                <Text style={styles.itemTitle}>{t.item3Title}</Text>
                <Text style={styles.itemDesc}>{t.item3Desc}</Text>
              </View>
              <Text style={styles.colDays}>{durationDays}</Text>
              <Text style={[styles.colPrice, { fontFamily: 'Helvetica-Bold' }]}>{nfcPrice.toFixed(2)}</Text>
            </View>
          )}

          {include3dPlanner && (
            <View style={styles.tableRow}>
              <Text style={[styles.colPos, { color: '#94A3B8' }]}>4.0</Text>
              <View style={styles.colDesc}>
                <Text style={styles.itemTitle}>{t.item4Title}</Text>
                <Text style={styles.itemDesc}>{t.item4Desc}</Text>
              </View>
              <Text style={styles.colDays}>—</Text>
              <Text style={[styles.colPrice, { fontFamily: 'Helvetica-Bold' }]}>{plannerPrice.toFixed(2)}</Text>
            </View>
          )}

          {includeInsurance && (
            <View style={styles.tableRow}>
              <Text style={[styles.colPos, { color: '#94A3B8' }]}>5.0</Text>
              <View style={styles.colDesc}>
                <Text style={styles.itemTitle}>{t.item5Title}</Text>
                <Text style={styles.itemDesc}>{t.item5Desc}</Text>
              </View>
              <Text style={styles.colDays}>—</Text>
              <Text style={[styles.colPrice, { fontFamily: 'Helvetica-Bold' }]}>{insurancePrice.toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.tableRow}>
            <Text style={[styles.colPos, { color: '#94A3B8' }]}>6.0</Text>
            <View style={styles.colDesc}>
              <Text style={styles.itemTitle}>{t.item6Title}</Text>
              <Text style={styles.itemDesc}>{t.item6Desc}</Text>
            </View>
            <Text style={styles.colDays}>—</Text>
            <Text style={[styles.colPrice, { fontFamily: 'Helvetica-Bold' }]}>{transportPrice.toFixed(2)}</Text>
          </View>
        </View>

        {/* Totals Box */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t.subtotalNet}</Text>
              <Text style={styles.totalVal}>{curr} {subtotal.toFixed(2)}</Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: '#059669' }]}>{t.discount}</Text>
              <Text style={[styles.totalVal, { color: '#059669' }]}>- {curr} {discount.toFixed(2)}</Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t.vat}</Text>
              <Text style={styles.totalVal}>{curr} {vat.toFixed(2)}</Text>
            </View>

            <View style={styles.grandTotalRow}>
              <Text style={[styles.grandTotalLabel, { color: settings.accentColor || '#0284C7' }]}>{t.grandTotal}</Text>
              <Text style={[styles.grandTotalVal, { color: settings.accentColor || '#0284C7' }]}>{curr} {grandTotal.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Guarantee Box */}
        <View style={styles.guaranteeBox}>
          <Text style={styles.guaranteeTitle}>{t.guaranteeTitle}</Text>
          <Text style={styles.guaranteeText}>{t.guaranteeText}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{footerText || settings.footerText || `${companyName} • ${t.badge} • www.interactv.ch`}</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>

      {/* PAGE 2: OFFICIAL PAYMENT PART (SWISS QR OR SEPA WIRE) */}
      <Page size={settings.format || 'A4'} orientation="portrait" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.companyName}>{t.page2Title}</Text>
            <Text style={styles.companySubtitle}>{t.page2Sub}</Text>
          </View>
          <View style={styles.docMetaRight}>
            <Text style={styles.docNumber}>{t.docNr} {offerteNumber}</Text>
            <Text style={styles.docDate}>{t.due}</Text>
          </View>
        </View>

        {/* Bank & Payment Instructions */}
        <View style={{ marginBottom: 20, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 6, borderWidth: 1, borderColor: '#E2E8F0' }}>
          <Text style={{ fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: '#0F172A', marginBottom: 4 }}>
            {t.payInfo}
          </Text>
          <Text style={{ fontSize: 8, color: '#475569', lineHeight: 1.4 }}>
            {t.payInfoDesc}
          </Text>
        </View>

        {/* QR BILL CONTAINER (EMPFANGSSCHEIN + ZAHLTEIL) */}
        <View style={{ marginTop: 'auto', borderWidth: 1, borderColor: '#CBD5E1', borderStyle: 'dashed', padding: 15, borderRadius: 4 }}>
          <View style={{ flexDirection: 'row', gap: 15 }}>
            {/* EMPFANGSSCHEIN (LEFT) */}
            <View style={{ width: '35%', borderRightWidth: 1, borderRightColor: '#CBD5E1', borderStyle: 'dotted', paddingRight: 10 }}>
              <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 8 }}>
                {curr === 'CHF' ? 'Empfangsschein' : 'Receipt'}
              </Text>
              
              <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#64748B', marginTop: 4 }}>
                {curr === 'CHF' ? 'Konto / Zahlbar an' : 'Bank Account / IBAN'}
              </Text>
              <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold' }}>CH44 0076 2011 6238 5295 7</Text>
              <Text style={{ fontSize: 7.5 }}>interacTV Interactive Systems AG</Text>
              <Text style={{ fontSize: 7.5 }}>BIC: UBSWCHZH80A</Text>
              <Text style={{ fontSize: 7.5 }}>8005 Zürich, Switzerland</Text>

              <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#64748B', marginTop: 8 }}>Referenz</Text>
              <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold' }}>21 00000 00003 13947 12894</Text>

              <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#64748B', marginTop: 8 }}>
                {curr === 'CHF' ? 'Zahlbar durch' : 'Payable by'}
              </Text>
              <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold' }}>{leadCompany || 'Unternehmen'}</Text>
              <Text style={{ fontSize: 7.5 }}>{leadName || 'Messe-Kunde'}</Text>

              <View style={{ marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <View>
                  <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#64748B' }}>
                    {curr === 'CHF' ? 'Währung' : 'Currency'}
                  </Text>
                  <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>{curr}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#64748B', textAlign: 'right' }}>
                    {curr === 'CHF' ? 'Betrag' : 'Amount'}
                  </Text>
                  <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>{grandTotal.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            {/* ZAHLTEIL (RIGHT) */}
            <View style={{ width: '65%', paddingLeft: 5 }}>
              <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 8 }}>
                {curr === 'CHF' ? 'Zahlteil (Swiss QR)' : 'SEPA & Wire Payment Section'}
              </Text>
              
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {/* Real Scannable QR Code */}
                <View style={{ width: 105, height: 105, padding: 2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 4 }}>
                  <PDFImage 
                    src={getSwissQRCodeUrl(generateSwissQRPayload({
                      iban: 'CH4400762011623852957',
                      creditor: { name: 'interacTV Systems AG', postalCode: '8005', city: 'Zürich', country: 'CH' },
                      amount: grandTotal,
                      currency: curr === 'EUR' ? 'EUR' : 'CHF',
                      debtor: { name: leadName || leadCompany || 'Kunde', postalCode: '8000', city: 'Zürich', country: 'CH' },
                      unstructuredMessage: `Offerte ${offerteNumber}`
                    }))}
                    style={{ width: 98, height: 98, borderRadius: 2 }}
                  />
                </View>

                {/* Account & Payee Information */}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#64748B' }}>
                    {curr === 'CHF' ? 'Konto / Zahlbar an' : 'Bank Account / IBAN'}
                  </Text>
                  <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold' }}>CH44 0076 2011 6238 5295 7</Text>
                  <Text style={{ fontSize: 7.5 }}>interacTV Interactive Systems AG</Text>
                  <Text style={{ fontSize: 7.5 }}>BIC / SWIFT: UBSWCHZH80A</Text>
                  <Text style={{ fontSize: 7.5 }}>8005 Zürich, Switzerland</Text>

                  <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#64748B', marginTop: 6 }}>Referenz</Text>
                  <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold' }}>21 00000 00003 13947 12894</Text>

                  <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#64748B', marginTop: 6 }}>
                    {curr === 'CHF' ? 'Zusätzliche Informationen' : 'Payment Details'}
                  </Text>
                  <Text style={{ fontSize: 7.5 }}>{offerteNumber} • {fairName} 4K Stelen-Miete</Text>

                  <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#64748B', marginTop: 6 }}>
                    {curr === 'CHF' ? 'Zahlbar durch' : 'Payable by'}
                  </Text>
                  <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold' }}>{leadCompany || 'Unternehmen'}</Text>
                  <Text style={{ fontSize: 7.5 }}>{leadName || 'Messe-Kunde'}</Text>
                </View>
              </View>

              {/* Currency & Amount */}
              <View style={{ marginTop: 12, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#E2E8F0', flexDirection: 'row', gap: 20 }}>
                <View>
                  <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#64748B' }}>
                    {curr === 'CHF' ? 'Währung' : 'Currency'}
                  </Text>
                  <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold' }}>{curr}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#64748B' }}>
                    {curr === 'CHF' ? 'Betrag' : 'Amount'}
                  </Text>
                  <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold' }}>{grandTotal.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Page 2 Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{footerText || settings.footerText || `${companyName} • ${t.page2Title} • www.interactv.ch`}</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};
