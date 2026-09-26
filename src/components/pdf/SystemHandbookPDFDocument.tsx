import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image as PDFImage } from '@react-pdf/renderer';
import { PDFSettings } from '../UniversalPDFStudio';

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 36,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontSize: 8.5,
    color: '#0F172A',
    lineHeight: 1.35
  },
  
  // Running Header & Footer
  runningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
    marginBottom: 16
  },
  runningHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  runningLogoText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  runningLogoTag: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingVertical: 1,
    paddingHorizontal: 5,
    borderRadius: 3,
    marginLeft: 6
  },
  runningHeaderRight: {
    fontSize: 7.5,
    color: '#64748B',
    fontFamily: 'Helvetica'
  },
  runningFooter: {
    position: 'absolute',
    bottom: 18,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 6
  },
  runningFooterText: {
    fontSize: 7,
    color: '#94A3B8'
  },

  // Cover Page Styles
  coverPage: {
    paddingTop: 50,
    paddingBottom: 45,
    paddingHorizontal: 45,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    justifyContent: 'space-between'
  },
  coverTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 2,
    borderBottomColor: '#0F172A',
    paddingBottom: 16
  },
  coverBrandTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    color: '#0F172A',
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  coverBrandSubtitle: {
    fontSize: 9.5,
    color: '#2563EB',
    fontFamily: 'Helvetica-Bold',
    marginTop: 3,
    letterSpacing: 0.5
  },
  coverBadge: {
    backgroundColor: '#0F172A',
    color: '#FFFFFF',
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    letterSpacing: 0.5
  },
  coverHeroSection: {
    marginTop: 35,
    marginBottom: 30
  },
  coverHeroPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginBottom: 12
  },
  coverHeroPillText: {
    color: '#1D4ED8',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8
  },
  coverMainHeading: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 28,
    color: '#0F172A',
    lineHeight: 1.15,
    marginBottom: 12,
    letterSpacing: -0.5
  },
  coverLeadParagraph: {
    fontSize: 10.5,
    color: '#475569',
    lineHeight: 1.45,
    maxWidth: 480
  },
  coverStandardsGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 14,
    marginTop: 20
  },
  coverStandardItem: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    paddingRight: 10,
    marginRight: 10
  },
  coverStandardItemLast: {
    flex: 1,
    borderRightWidth: 0,
    paddingRight: 0,
    marginRight: 0
  },
  coverStandardLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 3
  },
  coverStandardValue: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A'
  },
  coverTocBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 14,
    marginTop: 18
  },
  coverTocTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 4
  },
  coverTocGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  coverTocCol: {
    width: '50%',
    paddingRight: 10
  },
  coverTocItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2.5
  },
  coverTocText: {
    fontSize: 7.5,
    color: '#334155',
    fontFamily: 'Helvetica'
  },
  coverTocPage: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#2563EB'
  },
  coverMetaBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12
  },
  coverMetaText: {
    fontSize: 7.5,
    color: '#64748B',
    lineHeight: 1.3
  },

  // Content Page Styles
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  moduleHeaderLeft: {
    flex: 1,
    paddingRight: 16
  },
  moduleNumberPill: {
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 5,
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  },
  moduleTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 15,
    lineHeight: 1.25,
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.2
  },
  moduleSubtitle: {
    fontSize: 8.5,
    lineHeight: 1.35,
    color: '#64748B'
  },
  moduleRightBadge: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'flex-end',
    flexShrink: 0
  },
  moduleRightBadgeText: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A'
  },
  moduleRightBadgeSub: {
    fontSize: 6.5,
    color: '#64748B',
    marginTop: 1
  },

  // Content Sections
  sectionBlock: {
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 3,
    letterSpacing: 0.3
  },
  bodyParagraph: {
    fontSize: 8.5,
    color: '#334155',
    lineHeight: 1.45,
    marginBottom: 10
  },

  // Feature 2-Column Grid
  featureGrid: {
    flexDirection: 'row',
    marginBottom: 10
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 10,
    marginRight: 8
  },
  featureCardLast: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 10,
    marginRight: 0
  },
  featureCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  featureIconBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
    marginRight: 5
  },
  featureCardTitle: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A'
  },
  featureCardText: {
    fontSize: 7.5,
    color: '#475569',
    lineHeight: 1.3
  },

  // Workflow Steps Box
  workflowBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10
  },
  workflowTitle: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6
  },
  workflowStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4
  },
  workflowStepNum: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    color: '#1D4ED8',
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    lineHeight: 12,
    marginRight: 6,
    marginTop: 1
  },
  workflowStepText: {
    flex: 1,
    fontSize: 7.8,
    color: '#334155',
    lineHeight: 1.3
  },

  // Callout Box
  calloutBox: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 3,
    borderLeftColor: '#2563EB',
    borderRadius: 4,
    padding: 8,
    marginBottom: 10
  },
  calloutTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#1D4ED8',
    textTransform: 'uppercase',
    marginBottom: 2
  },
  calloutText: {
    fontSize: 7.5,
    color: '#1E3A8A',
    lineHeight: 1.3
  },

  // Tables
  table: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    paddingVertical: 4,
    paddingHorizontal: 6
  },
  tableHeaderCell: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#475569',
    textTransform: 'uppercase'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 6,
    alignItems: 'center'
  },
  tableRowEven: {
    backgroundColor: '#FAFAFA'
  },
  tableCell: {
    fontSize: 7.5,
    color: '#334155'
  },
  tableCellBold: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A'
  }
});

interface SystemHandbookPDFProps {
  settings: PDFSettings;
  companyName?: string;
}

export default function SystemHandbookPDFDocument({ settings, companyName = 'Kreativ Desk OS' }: SystemHandbookPDFProps) {
  const isEn = settings.language === 'en';
  const accentColor = settings.accentColor || '#2563EB';

  const docDate = new Date().toLocaleDateString(isEn ? 'en-US' : 'de-CH', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <Document title={isEn ? "Kreativ Desk OS - Master System Guide" : "Kreativ Desk OS - Offizielles Master-System-Handbuch"} author="Kreativ Desk OS">
      
      {/* ============================================================ */}
      {/* SEITE 1: TITELSEITE & EXECUTIVE SUMMARY                      */}
      {/* ============================================================ */}
      <Page size={settings.format || 'A4'} orientation="portrait" style={styles.coverPage}>
        <View>
          {/* Top Brand Bar */}
          <View style={styles.coverTopBar}>
            <View>
              <Text style={styles.coverBrandTitle}>Kreativ-Desk OS</Text>
              <Text style={[styles.coverBrandSubtitle, { color: accentColor }]}>
                {isEn ? 'Swiss Architecture & Timber Construction OS' : 'Das Schweizer Betriebssystem für Holzbau & Architektur'}
              </Text>
            </View>
            <Text style={styles.coverBadge}>RELEASE 2026.1</Text>
          </View>

          {/* Hero Section */}
          <View style={styles.coverHeroSection}>
            <View style={styles.coverHeroPill}>
              <Text style={styles.coverHeroPillText}>
                {isEn ? 'Official Master Reference Guide' : 'Offizielles System-Referenzhandbuch'}
              </Text>
            </View>
            <Text style={styles.coverMainHeading}>
              {isEn 
                ? 'System Handbook &\nOperations Manual' 
                : 'System-Handbuch &\nPraxis-Leitfaden'}
            </Text>
            <Text style={styles.coverLeadParagraph}>
              {isEn
                ? 'Comprehensive operational guide for architecture studios, timber engineers, site managers and general contractors. Covering end-to-end workflows from Swiss BKP 1–9 cost calculations and browser-native 3D BIM coordination to defect management and legal digital client sign-offs.'
                : 'Umfassendes Nachschlagewerk und Leitfaden für Architekturbüros, Holzingenieure, Bauleiter und Generalunternehmer. Behandelt alle Workflows von Schweizer BKP 1–9 Kostenplanung und 3D BIM Koordination bis zur mobilen Mängelerfassung und rechtssicheren digitalen Bauherren-Freigabe.'}
            </Text>
          </View>

          {/* Swiss Standards & Compliance Grid */}
          <View style={styles.coverStandardsGrid}>
            <View style={styles.coverStandardItem}>
              <Text style={styles.coverStandardLabel}>{isEn ? 'Standard SIA' : 'SIA-Normen'}</Text>
              <Text style={styles.coverStandardValue}>SIA 102 & 118</Text>
            </View>
            <View style={styles.coverStandardItem}>
              <Text style={styles.coverStandardLabel}>{isEn ? 'Cost Standard' : 'Kostenstruktur'}</Text>
              <Text style={styles.coverStandardValue}>BKP 1–9 CH</Text>
            </View>
            <View style={styles.coverStandardItem}>
              <Text style={styles.coverStandardLabel}>{isEn ? 'Banking Standard' : 'Zahlungsverkehr'}</Text>
              <Text style={styles.coverStandardValue}>ISO 20022 QR</Text>
            </View>
            <View style={styles.coverStandardItemLast}>
              <Text style={styles.coverStandardLabel}>{isEn ? 'Data Privacy' : 'Datenschutz'}</Text>
              <Text style={styles.coverStandardValue}>CH DSG / GDPR</Text>
            </View>
          </View>

          {/* Table of Contents Box */}
          <View style={styles.coverTocBox}>
            <Text style={styles.coverTocTitle}>
              {isEn ? 'Document Structure & Modules' : 'Inhaltsverzeichnis & Modulübersicht'}
            </Text>
            <View style={styles.coverTocGrid}>
              <View style={styles.coverTocCol}>
                <View style={styles.coverTocItem}>
                  <Text style={styles.coverTocText}>1. {isEn ? '2-Tier System Architecture' : 'Das 2-Ebenen-Prinzip'}</Text>
                  <Text style={[styles.coverTocPage, { color: accentColor }]}>P. 2</Text>
                </View>
                <View style={styles.coverTocItem}>
                  <Text style={styles.coverTocText}>2. {isEn ? '3D BIM Viewer & IFC Engine' : '3D BIM Viewer & IFC-Parser'}</Text>
                  <Text style={[styles.coverTocPage, { color: accentColor }]}>P. 3</Text>
                </View>
                <View style={styles.coverTocItem}>
                  <Text style={styles.coverTocText}>3. {isEn ? '2D CAD Plans & Defect Pins' : '2D CAD Pläne & Mängel-Pins'}</Text>
                  <Text style={[styles.coverTocPage, { color: accentColor }]}>P. 4</Text>
                </View>
                <View style={styles.coverTocItem}>
                  <Text style={styles.coverTocText}>4. {isEn ? 'BKP 1–9 Costs & QR-Bills' : 'BKP 1–9 Finanzen & QR-Rechnung'}</Text>
                  <Text style={[styles.coverTocPage, { color: accentColor }]}>P. 5</Text>
                </View>
                <View style={styles.coverTocItem}>
                  <Text style={styles.coverTocText}>5. {isEn ? 'Smart Calendar & Gantt Timeline' : 'Smarter Kalender & Gantt-Plan'}</Text>
                  <Text style={[styles.coverTocPage, { color: accentColor }]}>P. 6</Text>
                </View>
                <View style={styles.coverTocItem}>
                  <Text style={styles.coverTocText}>6. {isEn ? 'Defects & Offline PWA Sync' : 'Mängel & Offline PWA Baustellen-Sync'}</Text>
                  <Text style={[styles.coverTocPage, { color: accentColor }]}>P. 7</Text>
                </View>
              </View>
              <View style={styles.coverTocCol}>
                <View style={styles.coverTocItem}>
                  <Text style={styles.coverTocText}>7. {isEn ? 'AI Whiteboard & Gemini Engine' : 'KI-Whiteboard & Gemini Engine'}</Text>
                  <Text style={[styles.coverTocPage, { color: accentColor }]}>P. 8</Text>
                </View>
                <View style={styles.coverTocItem}>
                  <Text style={styles.coverTocText}>8. {isEn ? 'Pitch Deck Studio (16:9 Presentation)' : 'Pitch Deck Studio & Präsentationen'}</Text>
                  <Text style={[styles.coverTocPage, { color: accentColor }]}>P. 9</Text>
                </View>
                <View style={styles.coverTocItem}>
                  <Text style={styles.coverTocText}>9. {isEn ? 'HD Video Meet & Site Chat' : 'HD Video Meet & Baustellen-Chat'}</Text>
                  <Text style={[styles.coverTocPage, { color: accentColor }]}>P. 10</Text>
                </View>
                <View style={styles.coverTocItem}>
                  <Text style={styles.coverTocText}>10. {isEn ? 'Smart Proposals & E-Signatures' : 'Smart Proposals & E-Signatur'}</Text>
                  <Text style={[styles.coverTocPage, { color: accentColor }]}>P. 11</Text>
                </View>
                <View style={styles.coverTocItem}>
                  <Text style={styles.coverTocText}>11. {isEn ? 'Digital Vault & Mobile QR Upload' : 'Digitaler Datenraum & QR-Upload'}</Text>
                  <Text style={[styles.coverTocPage, { color: accentColor }]}>P. 12</Text>
                </View>
                <View style={styles.coverTocItem}>
                  <Text style={styles.coverTocText}>12. {isEn ? 'CRM, Zero Leakage & Security' : 'CRM, Rollenrechte & Datenschutz'}</Text>
                  <Text style={[styles.coverTocPage, { color: accentColor }]}>P. 13</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Footer Meta */}
        <View style={styles.coverMetaBottom}>
          <View>
            <Text style={styles.coverMetaText}>
              {isEn ? `Publisher: ${companyName}` : `Herausgeber: ${companyName}`}
            </Text>
            <Text style={styles.coverMetaText}>
              {isEn ? `Compiled: ${docDate} | System Revision: v2.0 Enterprise` : `Stand: ${docDate} | System-Revision: v2.0 Enterprise`}
            </Text>
          </View>
          <View>
            <Text style={[styles.coverMetaText, { textAlign: 'right' }]}>
              {isEn ? 'Confidential — For Authorized Workspace Users Only' : 'Vertraulich — Nur für autorisierte Workspace-Nutzer'}
            </Text>
          </View>
        </View>
      </Page>

      {/* ============================================================ */}
      {/* SEITE 2: SYSTEM-ARCHITEKTUR & DAS 2-EBENEN-PRINZIP           */}
      {/* ============================================================ */}
      <Page size={settings.format || 'A4'} orientation="portrait" style={styles.page}>
        <View style={styles.runningHeader} fixed>
          <View style={styles.runningHeaderLeft}>
            <Text style={styles.runningLogoText}>Kreativ-Desk OS</Text>
            <Text style={[styles.runningLogoTag, { color: accentColor }]}>
              {isEn ? 'Architecture' : 'Architektur'}
            </Text>
          </View>
          <Text style={styles.runningHeaderRight}>
            {isEn ? 'Chapter 1: Operating Model & 2-Tier Architecture' : 'Kapitel 1: Betriebsmodell & 2-Ebenen-Prinzip'}
          </Text>
        </View>

        <View style={styles.moduleHeader}>
          <View style={styles.moduleHeaderLeft}>
            <View style={{ marginBottom: 5 }}>
              <Text style={[styles.moduleNumberPill, { backgroundColor: accentColor }]}>
                {isEn ? 'Core Concept' : 'Grundprinzip'}
              </Text>
            </View>
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.moduleTitle}>
                {isEn ? 'The 2-Tier Architecture Model' : 'Das 2-Ebenen-Architektur-Prinzip'}
              </Text>
            </View>
            <View>
              <Text style={styles.moduleSubtitle}>
                {isEn 
                  ? 'Separation of macro-management (Company Hub) and operational execution (Project Cockpit)' 
                  : 'Klare Trennung zwischen strategischer Firmenzentrale und operativer Baustellensteuerung'}
              </Text>
            </View>
          </View>
          <View style={styles.moduleRightBadge}>
            <Text style={styles.moduleRightBadgeText}>{isEn ? 'TIER 1 vs TIER 2' : 'EBENE 1 vs EBENE 2'}</Text>
            <Text style={styles.moduleRightBadgeSub}>{isEn ? 'Zero Data Leakage' : 'Strikte Kapselung'}</Text>
          </View>
        </View>

        <Text style={styles.bodyParagraph}>
          {isEn
            ? 'Kreativ Desk OS operates on a strict two-tier architecture that eliminates chaos across multiple parallel construction sites while protecting firm-wide financials and contracts from unintended subcontractor visibility.'
            : 'Kreativ Desk OS basiert auf einem durchdachten 2-Ebenen-Modell. Dies verhindert Datenchaos bei mehreren parallelen Bauprojekten und stellt sicher, dass sensible Firmenfinanzen und Verträge niemals versehentlich von externen Handwerkern eingesehen werden können.'}
        </Text>

        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <View style={styles.featureCardHeader}>
              <View style={[styles.featureIconBullet, { backgroundColor: '#10B981' }]} />
              <Text style={styles.featureCardTitle}>
                {isEn ? 'Tier 1: Company Hub (Central)' : 'Ebene 1: Firmenzentrale (Zentrale)'}
              </Text>
            </View>
            <Text style={styles.featureCardText}>
              {isEn
                ? 'The strategic control center for owners, partners and management. Governs firm-wide templates (SIA 102/118 contracts, standard letterheads), OpEx operational finances, Swiss QR-bill ledger, CRM pipeline with incoming builder leads, and global employee permissions.'
                : 'Die strategische Steuerungszentrale für Inhaber und Büroleiter. Verwaltet büroweite Master-Vorlagen (SIA-Verträge, Briefköpfe), Firmen-Finanzen (OpEx), Schweizer QR-Rechnungsbuch, zentrale CRM-Pipeline mit neuen Bauherren-Leads und Mitarbeiter-Stammdaten.'}
            </Text>
          </View>

          <View style={styles.featureCardLast}>
            <View style={styles.featureCardHeader}>
              <View style={[styles.featureIconBullet, { backgroundColor: '#2563EB' }]} />
              <Text style={styles.featureCardTitle}>
                {isEn ? 'Tier 2: Project Cockpit (Workspace)' : 'Ebene 2: Projekt-Cockpit (Workspace)'}
              </Text>
            </View>
            <Text style={styles.featureCardText}>
              {isEn
                ? 'The autonomous operational workspace dedicated to a specific construction site. Encapsulates 3D BIM models, 2D floor plans, BKP 1–9 construction budgets, SIA milestone calendars, defect tracking, and project vault with trade-specific access filters.'
                : 'Der autonome operative Arbeitsraum für ein konkretes Bauvorhaben. Beinhaltet IFC 3D BIM-Modelle, CAD-Grundrisse, BKP 1–9 Baukostenkontrolle, SIA-Terminpläne, Mängelprotokolle und den projektbezogenen Revisions-Datenraum.'}
            </Text>
          </View>
        </View>

        <View style={styles.workflowBox}>
          <Text style={styles.workflowTitle}>
            {isEn ? 'Automatic Data Flow from Tier 1 to Tier 2' : 'Automatischer Datenfluss von Ebene 1 nach Ebene 2'}
          </Text>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>1</Text>
            <Text style={styles.workflowStepText}>
              {isEn 
                ? 'Template Inheritance: When creating a new project, standard SIA contracts and company cost catalogs are inherited automatically without manual duplication.' 
                : 'Vorlagen-Vererbung: Beim Anlegen eines Projekts werden SIA-Musterverträge und Firmen-Briefköpfe automatisch übernommen.'}
            </Text>
          </View>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>2</Text>
            <Text style={styles.workflowStepText}>
              {isEn 
                ? 'Budget Rollup: Project expenses and approved subcontractor invoices roll up securely into company cashflow projections in real time.' 
                : 'Finanz-Rollup: Freigegebene Rechnungen und Zahlungspläne fließen in Echtzeit in die übergreifende Firmen-Liquiditätsplanung ein.'}
            </Text>
          </View>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>3</Text>
            <Text style={styles.workflowStepText}>
              {isEn 
                ? 'Zero Leakage Subcontractor Portal: Invited trades (carpenters, electricians) access only their assigned floor plans and defect pins.' 
                : 'Zero-Leakage Handwerker-Portal: Externe Gewerke erhalten nur Einblick in ihre eigenen Planausschnitte und Rügen — kein Einblick in Gesamthonorare.'}
            </Text>
          </View>
        </View>

        <View style={styles.calloutBox}>
          <Text style={styles.calloutTitle}>
            {isEn ? 'Pro Tip: Smooth Navigation' : 'Pro-Tipp: Schneller Wechsel zwischen den Ebenen'}
          </Text>
          <Text style={styles.calloutText}>
            {isEn
              ? 'Click the top-left project title arrow to instantly jump back to the Company Hub (/app). To re-open a project cockpit, simply click any project card in the dashboard or active project selector.'
              : 'Über den Pfeil oben links im Projekt-Header springst du jederzeit sofort zurück in die Firmenzentrale (/app). Von dort gelangst du mit einem Klick auf eine Projektkarte wieder direkt in das jeweilige Projekt-Cockpit.'}
          </Text>
        </View>

        <View style={styles.runningFooter} fixed>
          <Text style={styles.runningFooterText}>{settings.footerText || 'Kreativ Desk OS | Master Reference Guide'}</Text>
          <Text style={styles.runningFooterText} render={({ pageNumber, totalPages }) => isEn ? `Page ${pageNumber} of ${totalPages}` : `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>

      {/* ============================================================ */}
      {/* SEITE 3: MODUL 1 – 3D BIM VIEWER & IFC BROWSER ENGINE        */}
      {/* ============================================================ */}
      <Page size={settings.format || 'A4'} orientation="portrait" style={styles.page}>
        <View style={styles.runningHeader} fixed>
          <View style={styles.runningHeaderLeft}>
            <Text style={styles.runningLogoText}>Kreativ-Desk OS</Text>
            <Text style={[styles.runningLogoTag, { color: accentColor }]}>Modul 01</Text>
          </View>
          <Text style={styles.runningHeaderRight}>
            {isEn ? '3D BIM Viewer & IFC Engine' : '3D BIM Viewer & IFC-Parser'}
          </Text>
        </View>

        <View style={styles.moduleHeader}>
          <View style={styles.moduleHeaderLeft}>
            <View style={{ marginBottom: 5 }}>
              <Text style={[styles.moduleNumberPill, { backgroundColor: accentColor }]}>Modul 01</Text>
            </View>
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.moduleTitle}>
                {isEn ? '3D BIM Viewer & IFC Browser Engine' : '3D BIM Viewer & IFC-Browser-Engine'}
              </Text>
            </View>
            <View>
              <Text style={styles.moduleSubtitle}>
                {isEn 
                  ? 'Interactive 3D navigation, spatial coordination and component inspection directly in browser' 
                  : 'Interaktive 3D-Modellnavigation, Bauteilprüfung und Kollisionskontrolle ohne Zusatzsoftware'}
              </Text>
            </View>
          </View>
          <View style={styles.moduleRightBadge}>
            <Text style={styles.moduleRightBadgeText}>OPEN BIM</Text>
            <Text style={styles.moduleRightBadgeSub}>IFC 2x3 & IFC 4</Text>
          </View>
        </View>

        <Text style={styles.bodyParagraph}>
          {isEn
            ? 'The 3D BIM Viewer allows architects, timber construction planners, and clients to inspect complex building models directly within the browser without requiring expensive CAD licenses or local installations.'
            : 'Der integrierte 3D BIM Viewer ermöglicht es Architekten, Holzbauplanern und Bauherren, vollständige Gebäudemodelle ohne teure Softwareinstallationen flüssig und hochpräzise direkt im Webbrowser zu untersuchen.'}
        </Text>

        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <View style={styles.featureCardHeader}>
              <View style={[styles.featureIconBullet, { backgroundColor: accentColor }]} />
              <Text style={styles.featureCardTitle}>
                {isEn ? 'Component Inspector (Pset)' : 'Bauteil-Inspektor & Psets'}
              </Text>
            </View>
            <Text style={styles.featureCardText}>
              {isEn
                ? 'Single-click any beam, column, slab or window to display its complete IFC property set (dimensions, volume, fire rating, U-value, material classification).'
                : 'Ein Klick auf Wand, Träger, Decke oder Fenster öffnet sämtliche IFC-Eigenschaften (Abmessungen, Holzgüteklasse, Brandschutz, U-Wert, Herstellerdaten).'}
            </Text>
          </View>

          <View style={styles.featureCardLast}>
            <View style={styles.featureCardHeader}>
              <View style={[styles.featureIconBullet, { backgroundColor: accentColor }]} />
              <Text style={styles.featureCardTitle}>
                {isEn ? 'Cross-Sections & Clipping' : 'Ebenenschnitte & Geschosse'}
              </Text>
            </View>
            <Text style={styles.featureCardText}>
              {isEn
                ? 'Dynamically slice the building horizontally and vertically to inspect interior joints, shaft layouts and timber ceiling connections.'
                : 'Horizontale und vertikale Schnittebenen ermöglichen es, Geschossdecken und Haustechnik-Schächte im Raum millimetergenau freizulegen.'}
            </Text>
          </View>
        </View>

        <View style={styles.workflowBox}>
          <Text style={styles.workflowTitle}>
            {isEn ? 'Key 3D Navigation Controls' : 'Steuerung & Navigationsbefehle'}
          </Text>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>1</Text>
            <Text style={styles.workflowStepText}>
              {isEn ? 'Left Mouse Button / One Finger: Orbit and rotate 3D camera around building center.' : 'Linke Maustaste / Ein Finger: 3D-Kamera flüssig um das Modell rotieren (Orbit).'}
            </Text>
          </View>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>2</Text>
            <Text style={styles.workflowStepText}>
              {isEn ? 'Right Mouse Button / Two Fingers: Pan camera horizontally and vertically.' : 'Rechte Maustaste / Zwei Finger: Kamera parallel im Raum verschieben (Pan).'}
            </Text>
          </View>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>3</Text>
            <Text style={styles.workflowStepText}>
              {isEn ? 'Mouse Wheel / Pinch: Smooth zoom in and out with intelligent focal preservation.' : 'Mausrad / Pinch-to-Zoom: Stufenloser Zoom mit automatischer Brennpunktfokussierung.'}
            </Text>
          </View>
        </View>

        <View style={styles.calloutBox}>
          <Text style={styles.calloutTitle}>
            {isEn ? 'Timber Engineering Note' : 'Holzbau-Praxishinweis'}
          </Text>
          <Text style={styles.calloutText}>
            {isEn
              ? 'Timber construction elements (Glulam, CLT/Brettsperrholz, frame posts) can be isolated by structural type. Export snapshots directly into the AI Whiteboard or Universal PDF Studio for client meetings.'
              : 'Holzbauteile (BSH, Brettsperrholz, Riegel) können nach Tragwerksklassen gefiltert werden. Schnappschüsse lassen sich direkt ins Whiteboard oder Universal PDF Studio für Bauherrensitzungen exportieren.'}
          </Text>
        </View>

        <View style={styles.runningFooter} fixed>
          <Text style={styles.runningFooterText}>{settings.footerText || 'Kreativ Desk OS | Master Reference Guide'}</Text>
          <Text style={styles.runningFooterText} render={({ pageNumber, totalPages }) => isEn ? `Page ${pageNumber} of ${totalPages}` : `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>

      {/* ============================================================ */}
      {/* SEITE 4: MODUL 2 – 2D CAD PLÄNE & PRÄZISIONS-MÄNGEL-PINS     */}
      {/* ============================================================ */}
      <Page size={settings.format || 'A4'} orientation="portrait" style={styles.page}>
        <View style={styles.runningHeader} fixed>
          <View style={styles.runningHeaderLeft}>
            <Text style={styles.runningLogoText}>Kreativ-Desk OS</Text>
            <Text style={[styles.runningLogoTag, { color: accentColor }]}>Modul 02</Text>
          </View>
          <Text style={styles.runningHeaderRight}>
            {isEn ? '2D CAD Plans & Precision Pins' : '2D CAD Pläne & Präzisions-Pins'}
          </Text>
        </View>

        <View style={styles.moduleHeader}>
          <View style={styles.moduleHeaderLeft}>
            <View style={{ marginBottom: 5 }}>
              <Text style={[styles.moduleNumberPill, { backgroundColor: accentColor }]}>Modul 02</Text>
            </View>
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.moduleTitle}>
                {isEn ? '2D CAD Plans & Precision Pins' : '2D CAD Pläne & Präzisions-Pins'}
              </Text>
            </View>
            <View>
              <Text style={styles.moduleSubtitle}>
                {isEn 
                  ? 'TrueScale scale calibration, multi-layer floor plans and millimeter-exact defect pins' 
                  : 'Digitale TrueScale Maßstabskalibrierung und millimetergenaue Mängelverortung im Plan'}
              </Text>
            </View>
          </View>
          <View style={styles.moduleRightBadge}>
            <Text style={styles.moduleRightBadgeText}>TrueScale 1:X</Text>
            <Text style={styles.moduleRightBadgeSub}>DIN A0 – A4 Support</Text>
          </View>
        </View>

        <Text style={styles.bodyParagraph}>
          {isEn
            ? 'The 2D Plan Studio handles vector PDF drawings and CAD plans of all standard formats. It allows site inspectors to place localized defect pins, attach photos, and assign corrective tasks to specific contractors.'
            : 'Das 2D Plan Studio verarbeitet hochauflösende Vektor-PDFs und CAD-Pläne aller DIN-Formate. Bauleiter und Architekten können Mängel und Aufgaben millimetergenau auf dem Grundriss markieren und Handwerkern zuweisen.'}
        </Text>

        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <View style={styles.featureCardHeader}>
              <View style={[styles.featureIconBullet, { backgroundColor: accentColor }]} />
              <Text style={styles.featureCardTitle}>
                {isEn ? 'TrueScale Calibration' : 'TrueScale Kalibrierung'}
              </Text>
            </View>
            <Text style={styles.featureCardText}>
              {isEn
                ? 'Draw a reference line along a known measure (e.g. 1.00m doorway). The engine immediately calculates the exact pixel-to-meter ratio for accurate on-plan measurements.'
                : 'Eine Referenzlinie an einem bekannten Maß ziehen (z.B. 1,00m Türbreite) — das System kalibriert den Maßstab automatisch für exakte digitale Kontrollmaße.'}
            </Text>
          </View>

          <View style={styles.featureCardLast}>
            <View style={styles.featureCardHeader}>
              <View style={[styles.featureIconBullet, { backgroundColor: accentColor }]} />
              <Text style={styles.featureCardTitle}>
                {isEn ? 'Color-Coded Status Pins' : 'Status-Farbcodierte Pins'}
              </Text>
            </View>
            <Text style={styles.featureCardText}>
              {isEn
                ? 'Pins are colored by execution status: Red = Open, Amber = In Progress, Blue = Resolved, Green = Approved and signed off by the site engineer.'
                : 'Pins zeigen den Status auf einen Blick: Rot = Offen, Gelb = In Arbeit, Blau = Zur Abnahme gemeldet, Grün = Vom Bauleiter abgenommen und geschlossen.'}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: '25%' }]}>{isEn ? 'Pin Status' : 'Pin-Status'}</Text>
            <Text style={[styles.tableHeaderCell, { width: '25%' }]}>{isEn ? 'Color Code' : 'Farbcode'}</Text>
            <Text style={[styles.tableHeaderCell, { width: '50%' }]}>{isEn ? 'Meaning & Action' : 'Bedeutung & Aktion'}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCellBold, { width: '25%', color: '#DC2626' }]}>{isEn ? 'OPEN' : 'OFFEN'}</Text>
            <Text style={[styles.tableCell, { width: '25%' }]}>{isEn ? 'Red (#EF4444)' : 'Rot (#EF4444)'}</Text>
            <Text style={[styles.tableCell, { width: '50%' }]}>{isEn ? 'Defect recorded; awaiting contractor response.' : 'Mangel neu erfasst; Handwerker informiert.'}</Text>
          </View>
          <View style={[styles.tableRow, styles.tableRowEven]}>
            <Text style={[styles.tableCellBold, { width: '25%', color: '#D97706' }]}>{isEn ? 'IN PROGRESS' : 'IN ARBEIT'}</Text>
            <Text style={[styles.tableCell, { width: '25%' }]}>{isEn ? 'Amber (#F59E0B)' : 'Gelb (#F59E0B)'}</Text>
            <Text style={[styles.tableCell, { width: '50%' }]}>{isEn ? 'Contractor on-site fixing the issue.' : 'Nachbesserung auf Baustelle im Gange.'}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCellBold, { width: '25%', color: '#059669' }]}>{isEn ? 'RESOLVED' : 'ABGENOMMEN'}</Text>
            <Text style={[styles.tableCell, { width: '25%' }]}>{isEn ? 'Green (#10B981)' : 'Grün (#10B981)'}</Text>
            <Text style={[styles.tableCell, { width: '50%' }]}>{isEn ? 'Verified and approved according to SIA 118.' : 'Rechtssicher nach SIA 118 freigegeben.'}</Text>
          </View>
        </View>

        <View style={styles.calloutBox}>
          <Text style={styles.calloutTitle}>
            {isEn ? 'Filter by Trade' : 'Gewerk-Filterung im Plan'}
          </Text>
          <Text style={styles.calloutText}>
            {isEn
              ? 'Use the trade filter at the top of the plan to isolate pins for specific subcontractors (e.g. Electrical, Timber framing, Plumbing). Reduces visual clutter during on-site inspections.'
              : 'Nutze den Gewerke-Filter oben im Planviewer, um z.B. nur Mängel des Holzbauers oder Elektrikers einzublenden. Dies erleichtert Baustellenbegehungen enorm.'}
          </Text>
        </View>

        <View style={styles.runningFooter} fixed>
          <Text style={styles.runningFooterText}>{settings.footerText || 'Kreativ Desk OS | Master Reference Guide'}</Text>
          <Text style={styles.runningFooterText} render={({ pageNumber, totalPages }) => isEn ? `Page ${pageNumber} of ${totalPages}` : `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>

      {/* ============================================================ */}
      {/* SEITE 5: MODUL 3 – BKP 1–9 BAUFINANZEN & SCHWEIZER QR-BILL   */}
      {/* ============================================================ */}
      <Page size={settings.format || 'A4'} orientation="portrait" style={styles.page}>
        <View style={styles.runningHeader} fixed>
          <View style={styles.runningHeaderLeft}>
            <Text style={styles.runningLogoText}>Kreativ-Desk OS</Text>
            <Text style={[styles.runningLogoTag, { color: accentColor }]}>Modul 03</Text>
          </View>
          <Text style={styles.runningHeaderRight}>
            {isEn ? 'BKP 1–9 Costs & Swiss QR-Bill' : 'BKP 1–9 Baufinanzen & QR-Rechnung'}
          </Text>
        </View>

        <View style={styles.moduleHeader}>
          <View style={styles.moduleHeaderLeft}>
            <View style={{ marginBottom: 5 }}>
              <Text style={[styles.moduleNumberPill, { backgroundColor: accentColor }]}>Modul 03</Text>
            </View>
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.moduleTitle}>
                {isEn ? 'BKP 1–9 Costs & Swiss QR-Bill Engine' : 'BKP 1–9 Baufinanzen & Schweizer QR-Rechnung'}
              </Text>
            </View>
            <View>
              <Text style={styles.moduleSubtitle}>
                {isEn 
                  ? 'Swiss cost code classification, 3-tier budget variance and ISO 20022 QR-bill generation' 
                  : 'Baukostenplan BKP 1–9, 3-spaltiger Soll/Ist-Vergleich und ISO 20022 QR-Rechnungserstellung'}
              </Text>
            </View>
          </View>
          <View style={styles.moduleRightBadge}>
            <Text style={styles.moduleRightBadgeText}>ISO 20022</Text>
            <Text style={styles.moduleRightBadgeSub}>SIA 102/118 Konform</Text>
          </View>
        </View>

        <Text style={styles.bodyParagraph}>
          {isEn
            ? 'The finance engine implements the official Swiss BKP (Baukostenplan) standard 1 through 9. It provides real-time tracking across Budget (KV), Awarded Contracts (KVB), and Invoiced Actuals (Ist) with automated cashflow projections.'
            : 'Das Finanzmodul bildet den offiziellen Schweizer Baukostenplan BKP 1 bis 9 lückenlos ab. Es steuert den dreistufigen Vergleich zwischen Kostenvoranschlag (KV), Vergabe (KVB) und Ist-Abrechnung mit automatischer Restkostenprognose.'}
        </Text>

        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <View style={styles.featureCardHeader}>
              <View style={[styles.featureIconBullet, { backgroundColor: accentColor }]} />
              <Text style={styles.featureCardTitle}>
                {isEn ? 'Swiss BKP Structure (1–9)' : 'BKP 1–9 Struktur (Schweiz)'}
              </Text>
            </View>
            <Text style={styles.featureCardText}>
              {isEn
                ? 'Structured into BKP 1 (Prep), BKP 2 (Building & Timber structure), BKP 3 (Equipment), BKP 4 (Surroundings), BKP 5 (Ancillary fees & SIA honorary fees).'
                : 'Strukturiert nach BKP 1 (Vorbereitung), BKP 2 (Gebäude & Holzbau), BKP 3 (Betriebseinrichtungen), BKP 4 (Umgebung) und BKP 5 (Baunebenkosten & SIA-Honorare).'}
            </Text>
          </View>

          <View style={styles.featureCardLast}>
            <View style={styles.featureCardHeader}>
              <View style={[styles.featureIconBullet, { backgroundColor: accentColor }]} />
              <Text style={styles.featureCardTitle}>
                {isEn ? 'Integrated Swiss QR-Bill' : 'Integrierte QR-Rechnung'}
              </Text>
            </View>
            <Text style={styles.featureCardText}>
              {isEn
                ? 'Generates official Swiss QR-bills with QR-IBAN, Creditor Reference (SCOR/ISO 11649), and payment receipt slip according to SIX Payment Services regulations.'
                : 'Erstellt offizielle Schweizer QR-Rechnungen nach SIX-Standard mit QR-IBAN, strukturierter Referenznummer (SCOR) und Zahlteil für Schweizer Banken.'}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: '15%' }]}>BKP</Text>
            <Text style={[styles.tableHeaderCell, { width: '35%' }]}>{isEn ? 'Designation' : 'Bezeichnung'}</Text>
            <Text style={[styles.tableHeaderCell, { width: '50%' }]}>{isEn ? 'Controlling & Scope' : 'Steuerungsinhalt'}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCellBold, { width: '15%' }]}>BKP 1</Text>
            <Text style={[styles.tableCell, { width: '35%' }]}>{isEn ? 'Preparatory Work' : 'Vorbereitungsarbeiten'}</Text>
            <Text style={[styles.tableCell, { width: '50%' }]}>{isEn ? 'Site survey, demolition, soil investigations.' : 'Terrainaufnahme, Rodungen, Altlasten.'}</Text>
          </View>
          <View style={[styles.tableRow, styles.tableRowEven]}>
            <Text style={[styles.tableCellBold, { width: '15%' }]}>BKP 2</Text>
            <Text style={[styles.tableCell, { width: '35%' }]}>{isEn ? 'Building & Timber Construction' : 'Gebäude & Holzbau'}</Text>
            <Text style={[styles.tableCell, { width: '50%' }]}>{isEn ? 'Master masonry, timber framing, facade, interior.' : 'Rohbau, Holzbaukonstruktion, Fassade, Ausbau.'}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCellBold, { width: '15%' }]}>BKP 5</Text>
            <Text style={[styles.tableCell, { width: '35%' }]}>{isEn ? 'Fees & Ancillary Costs' : 'Baunebenkosten & Honorare'}</Text>
            <Text style={[styles.tableCell, { width: '50%' }]}>{isEn ? 'Architect & engineer fees according to SIA 102.' : 'SIA 102 Honorare, Gebühren, Bewilligungen.'}</Text>
          </View>
        </View>

        <View style={styles.calloutBox}>
          <Text style={styles.calloutTitle}>
            {isEn ? 'Multi-Version Budgeting' : 'Budget-Versionierung & Freigabe'}
          </Text>
          <Text style={styles.calloutText}>
            {isEn
              ? 'Create locked budget baselines (e.g. Kostenvoranschlag SIA Phase 32). Any extra claims or change orders are tracked as distinct supplementary versions with approval audit.'
              : 'Fixiere freigegebene Budgets als unveränderliche Baselines (z.B. KV nach Phase 32). Nachträge werden als separate Versionen mit Freigabepfad dokumentiert.'}
          </Text>
        </View>

        <View style={styles.runningFooter} fixed>
          <Text style={styles.runningFooterText}>{settings.footerText || 'Kreativ Desk OS | Master Reference Guide'}</Text>
          <Text style={styles.runningFooterText} render={({ pageNumber, totalPages }) => isEn ? `Page ${pageNumber} of ${totalPages}` : `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>

      {/* ============================================================ */}
      {/* SEITE 6: MODUL 4 – SMARTER BAUKALENDER & GANTT-TERMINPLANUNG */}
      {/* ============================================================ */}
      <Page size={settings.format || 'A4'} orientation="portrait" style={styles.page}>
        <View style={styles.runningHeader} fixed>
          <View style={styles.runningHeaderLeft}>
            <Text style={styles.runningLogoText}>Kreativ-Desk OS</Text>
            <Text style={[styles.runningLogoTag, { color: accentColor }]}>Modul 04</Text>
          </View>
          <Text style={styles.runningHeaderRight}>
            {isEn ? 'Smart Calendar & Gantt Timeline' : 'Smarter Kalender & Gantt-Plan'}
          </Text>
        </View>

        <View style={styles.moduleHeader}>
          <View style={styles.moduleHeaderLeft}>
            <View style={{ marginBottom: 5 }}>
              <Text style={[styles.moduleNumberPill, { backgroundColor: accentColor }]}>Modul 04</Text>
            </View>
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.moduleTitle}>
                {isEn ? 'Smart Construction Calendar & Gantt Timeline' : 'Smarter Baukalender & Gantt-Terminplanung'}
              </Text>
            </View>
            <View>
              <Text style={styles.moduleSubtitle}>
                {isEn 
                  ? 'SIA phase scheduling, critical path analysis, daily weather logs and site diary' 
                  : 'SIA-Phasenablauf, Kritischer Pfad, digitales Bautagebuch und automatische Wettererfassung'}
              </Text>
            </View>
          </View>
          <View style={styles.moduleRightBadge}>
            <Text style={styles.moduleRightBadgeText}>SIA 102/118</Text>
            <Text style={styles.moduleRightBadgeSub}>{isEn ? 'Critical Path' : 'Kritischer Pfad'}</Text>
          </View>
        </View>

        <Text style={styles.bodyParagraph}>
          {isEn
            ? 'The Calendar and Gantt engine synchronizes milestone delivery dates, subcontractor standup meetings, and regulatory deadlines. It incorporates official SIA phases and provides legal site documentation.'
            : 'Das Terminmodul synchronisiert Meilensteine, Baustellensitzungen und Abnahmetermine. Es integriert die offiziellen SIA-Phasen und sichert die lückenlose rechtliche Dokumentation durch das digitale Bautagebuch.'}
        </Text>

        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <View style={styles.featureCardHeader}>
              <View style={[styles.featureIconBullet, { backgroundColor: accentColor }]} />
              <Text style={styles.featureCardTitle}>
                {isEn ? 'SIA 102 Phases Built-in' : 'Integrierte SIA 102 Phasen'}
              </Text>
            </View>
            <Text style={styles.featureCardText}>
              {isEn
                ? 'Organized by Phase 1 (Strategic Definition), Phase 2 (Preliminary Studies), Phase 3 (Project Design), Phase 4 (Tendering), Phase 5 (Realization), Phase 6 (Operation).'
                : 'Gegliedert nach Phase 1 (Strategie), Phase 2 (Vorstudien), Phase 3 (Projektierung), Phase 4 (Ausschreibung), Phase 5 (Realisierung) und Phase 6 (Bewirtschaftung).'}
            </Text>
          </View>

          <View style={styles.featureCardLast}>
            <View style={styles.featureCardHeader}>
              <View style={[styles.featureIconBullet, { backgroundColor: accentColor }]} />
              <Text style={styles.featureCardTitle}>
                {isEn ? 'Digital Site Journal' : 'Digitales Bautagebuch'}
              </Text>
            </View>
            <Text style={styles.featureCardText}>
              {isEn
                ? 'Automated daily weather logging (temperature, precipitation), active contractor attendance tracking, site standup minutes, and photo documentation.'
                : 'Automatische tägliche Wetteraufzeichnung (Temperatur, Regen), Anwesenheitsliste der Handwerker, Baustellenrapporte und Fotobeweise.'}
            </Text>
          </View>
        </View>

        <View style={styles.workflowBox}>
          <Text style={styles.workflowTitle}>
            {isEn ? 'How to Export Official Site Standup Minutes' : 'Export von Baujournal & Sitzungsprotokoll'}
          </Text>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>1</Text>
            <Text style={styles.workflowStepText}>
              {isEn ? 'Select date or meeting entry in the Smart Calendar.' : 'Gewünschten Tag oder Sitzungstermin im Kalender auswählen.'}
            </Text>
          </View>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>2</Text>
            <Text style={styles.workflowStepText}>
              {isEn ? 'Click "Export PDF" in the header to open Universal PDF Studio.' : 'Auf "PDF Exportieren" klicken, um das Universal PDF Studio zu öffnen.'}
            </Text>
          </View>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>3</Text>
            <Text style={styles.workflowStepText}>
              {isEn ? 'Review the auto-formatted DIN-A4 document with weather, attendance and tasks, then download or save to vault.' : 'Das fertige DIN-A4 Protokoll mit Wetter, Anwesenheit und Pendenzentabelle prüfen und direkt archivieren.'}
            </Text>
          </View>
        </View>

        <View style={styles.calloutBox}>
          <Text style={styles.calloutTitle}>
            {isEn ? 'SIA 118 Legal Tip' : 'Rechtssicherheit nach SIA 118'}
          </Text>
          <Text style={styles.calloutText}>
            {isEn
              ? 'Weather-related construction delays must be logged with verified temperature and rainfall data to legally justify extension of delivery deadlines.'
              : 'Witterungsbedingte Bauverzögerungen müssen mit Temperatur- und Niederschlagsdaten protokolliert werden, um Fristverlängerungen nach SIA 118 rechtssicher zu begründen.'}
          </Text>
        </View>

        <View style={styles.runningFooter} fixed>
          <Text style={styles.runningFooterText}>{settings.footerText || 'Kreativ Desk OS | Master Reference Guide'}</Text>
          <Text style={styles.runningFooterText} render={({ pageNumber, totalPages }) => isEn ? `Page ${pageNumber} of ${totalPages}` : `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>

      {/* ============================================================ */}
      {/* SEITE 7: MODUL 5 – MÄNGELMANAGEMENT & OFFLINE PWA FIELD SYNC  */}
      {/* ============================================================ */}
      <Page size={settings.format || 'A4'} orientation="portrait" style={styles.page}>
        <View style={styles.runningHeader} fixed>
          <View style={styles.runningHeaderLeft}>
            <Text style={styles.runningLogoText}>Kreativ-Desk OS</Text>
            <Text style={[styles.runningLogoTag, { color: accentColor }]}>Modul 05</Text>
          </View>
          <Text style={styles.runningHeaderRight}>
            {isEn ? 'Defects & Offline PWA Sync' : 'Mängel & Offline PWA Sync'}
          </Text>
        </View>

        <View style={styles.moduleHeader}>
          <View style={styles.moduleHeaderLeft}>
            <View style={{ marginBottom: 5 }}>
              <Text style={[styles.moduleNumberPill, { backgroundColor: accentColor }]}>Modul 05</Text>
            </View>
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.moduleTitle}>
                {isEn ? 'Defect Management & Offline PWA Sync' : 'Mängelmanagement & Offline PWA Baustellen-Sync'}
              </Text>
            </View>
            <View>
              <Text style={styles.moduleSubtitle}>
                {isEn 
                  ? 'Zero-connectivity field inspection with local IndexedDB storage and auto-sync' 
                  : 'Mängelerfassung ohne Netzempfang im Untergeschoss mit lokaler Speicherung und Auto-Sync'}
              </Text>
            </View>
          </View>
          <View style={styles.moduleRightBadge}>
            <Text style={styles.moduleRightBadgeText}>OFFLINE PWA</Text>
            <Text style={styles.moduleRightBadgeSub}>IndexedDB Engine</Text>
          </View>
        </View>

        <Text style={styles.bodyParagraph}>
          {isEn
            ? 'Basements, underground garages and raw timber structures often lack cellular connectivity. Kreativ Desk OS utilizes a local IndexedDB offline storage layer that permits uninterrupted field logging.'
            : 'Tiefgaragen, Untergeschosse und Rohbauten haben oft keinen Mobilfunkempfang. Kreativ Desk OS nutzt einen lokalen IndexedDB-Puffer, sodass Bauleiter und Handwerker auch ohne Netzverbindung weiterarbeiten können.'}
        </Text>

        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <View style={styles.featureCardHeader}>
              <View style={[styles.featureIconBullet, { backgroundColor: accentColor }]} />
              <Text style={styles.featureCardTitle}>
                {isEn ? 'Mobile Camera & Dictation' : 'Kamera & Sprachmemos'}
              </Text>
            </View>
            <Text style={styles.featureCardText}>
              {isEn
                ? 'Capture defect photos directly through mobile phone browser, highlight problem areas with markup, and dictate descriptions with speech-to-text.'
                : 'Fotos direkt auf der Baustelle mit dem Smartphone aufnehmen, Schadstelle markieren und den Mängeltext per Spracheingabe diktieren.'}
            </Text>
          </View>

          <View style={styles.featureCardLast}>
            <View style={styles.featureCardHeader}>
              <View style={[styles.featureIconBullet, { backgroundColor: accentColor }]} />
              <Text style={styles.featureCardTitle}>
                {isEn ? 'Automatic Background Sync' : 'Automatischer Cloud-Sync'}
              </Text>
            </View>
            <Text style={styles.featureCardText}>
              {isEn
                ? 'As soon as your mobile device reconnects to Wi-Fi or 4G/5G, all queued records and photos upload automatically to Supabase without data loss.'
                : 'Sobald das Gerät wieder Empfang hat, synchronisiert der SyncManager alle zwischengespeicherten Daten und Fotos automatisch mit der Cloud.'}
            </Text>
          </View>
        </View>

        <View style={styles.workflowBox}>
          <Text style={styles.workflowTitle}>
            {isEn ? 'Official Defect Notice (Mängelrüge) Workflow' : 'Rechtssichere Mängelrüge nach SIA 118'}
          </Text>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>1</Text>
            <Text style={styles.workflowStepText}>
              {isEn ? 'Record defect on site with photo, severity level and assign to contractor.' : 'Mangel mit Foto, Dringlichkeitsstufe und Gewerk auf der Baustelle erfassen.'}
            </Text>
          </View>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>2</Text>
            <Text style={styles.workflowStepText}>
              {isEn ? 'Set rectification deadline according to SIA 118 Art. 169 (e.g. 10 business days).' : 'Nachbesserungsfrist nach SIA 118 festlegen (z.B. 10 Arbeitstage).'}
            </Text>
          </View>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>3</Text>
            <Text style={styles.workflowStepText}>
              {isEn ? 'Click "Export Defect Notice" in Universal PDF Studio to generate official notice with QR reference.' : 'Auf "Mängelrüge exportieren" klicken, um das offizielle Rüge-PDF mit Nachweis zu erzeugen.'}
            </Text>
          </View>
        </View>

        <View style={styles.calloutBox}>
          <Text style={styles.calloutTitle}>
            {isEn ? 'PWA Installation' : 'PWA Installation auf dem Homescreen'}
          </Text>
          <Text style={styles.calloutText}>
            {isEn
              ? 'Click "Install App (PWA)" in the top navigation bar to add Kreativ Desk to your iOS or Android home screen for native fullscreen experience.'
              : 'Klicke oben rechts auf "App installieren (PWA)", um Kreativ Desk direkt auf deinem iPhone oder Android-Startbildschirm als native Vollbild-App abzulegen.'}
          </Text>
        </View>

        <View style={styles.runningFooter} fixed>
          <Text style={styles.runningFooterText}>{settings.footerText || 'Kreativ Desk OS | Master Reference Guide'}</Text>
          <Text style={styles.runningFooterText} render={({ pageNumber, totalPages }) => isEn ? `Page ${pageNumber} of ${totalPages}` : `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>

      {/* ============================================================ */}
      {/* SEITE 8: MODUL 6 – KI-WHITEBOARD & GEMINI MULTIMODAL ENGINE  */}
      {/* ============================================================ */}
      <Page size={settings.format || 'A4'} orientation="portrait" style={styles.page}>
        <View style={styles.runningHeader} fixed>
          <View style={styles.runningHeaderLeft}>
            <Text style={styles.runningLogoText}>Kreativ-Desk OS</Text>
            <Text style={[styles.runningLogoTag, { color: accentColor }]}>Modul 06</Text>
          </View>
          <Text style={styles.runningHeaderRight}>
            {isEn ? 'AI Whiteboard & Gemini Multimodal' : 'KI-Whiteboard & Gemini Engine'}
          </Text>
        </View>

        <View style={styles.moduleHeader}>
          <View style={styles.moduleHeaderLeft}>
            <View style={{ marginBottom: 5 }}>
              <Text style={[styles.moduleNumberPill, { backgroundColor: accentColor }]}>Modul 06</Text>
            </View>
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.moduleTitle}>
                {isEn ? 'AI Whiteboard & Multimodal Concept Engine' : 'KI-Whiteboard & Multimodale Entwurfs-Engine'}
              </Text>
            </View>
            <View>
              <Text style={styles.moduleSubtitle}>
                {isEn 
                  ? 'Infinite canvas for architectural sketching, sticky notes and Google Gemini plan analysis' 
                  : 'Unendliche Arbeitsfläche für Freihandskizzen, Schnittstellenkoordination und KI-Plananalysen'}
              </Text>
            </View>
          </View>
          <View style={styles.moduleRightBadge}>
            <Text style={styles.moduleRightBadgeText}>GEMINI 2.5</Text>
            <Text style={styles.moduleRightBadgeSub}>Multimodal AI</Text>
          </View>
        </View>

        <Text style={styles.bodyParagraph}>
          {isEn
            ? 'The AI Whiteboard combines freehand digital sketching with multimodal artificial intelligence powered by Google Gemini. Teams can drop floor plans, facade concepts, or detail photos directly onto the canvas to receive structural insights.'
            : 'Das KI-Whiteboard verbindet kreative Freihand-Skizzen mit multimodaler künstlicher Intelligenz (Google Gemini). Teams können Grundrisse, Fassadenentwürfe und Fotos auf das Board ziehen und vom KI-Modell analysieren lassen.'}
        </Text>

        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <View style={styles.featureCardHeader}>
              <View style={[styles.featureIconBullet, { backgroundColor: accentColor }]} />
              <Text style={styles.featureCardTitle}>
                {isEn ? 'Multimodal Plan Analysis' : 'Multimodale Plananalyse'}
              </Text>
            </View>
            <Text style={styles.featureCardText}>
              {isEn
                ? 'Upload an architectural sketch or floor plan crop and prompt Gemini to verify room dimensions, fire-escape corridors, or timber beam spans according to SIA guidelines.'
                : 'Lade eine Skizze oder einen Planausschnitt hoch und lasse Gemini Fluchtwege, Raumproportionen oder Holzspannweiten nach SIA-Richtlinien prüfen.'}
            </Text>
          </View>

          <View style={styles.featureCardLast}>
            <View style={styles.featureCardHeader}>
              <View style={[styles.featureIconBullet, { backgroundColor: accentColor }]} />
              <Text style={styles.featureCardTitle}>
                {isEn ? 'Live Vector PDF Export' : 'Vektor-PDF-Protokoll'}
              </Text>
            </View>
            <Text style={styles.featureCardText}>
              {isEn
                ? 'Export high-resolution landscape PDF snapshots of the entire board or selected areas through Universal PDF Studio for immediate distribution to clients.'
                : 'Exportiere hochauflösende Querformat-PDFs des gesamten Boards oder einzelner Bereiche direkt über das Universal PDF Studio für Bauherrensitzungen.'}
            </Text>
          </View>
        </View>

        <View style={styles.workflowBox}>
          <Text style={styles.workflowTitle}>
            {isEn ? 'Recommended Whiteboard Shortcut Keys' : 'Tastaturkürzel im Whiteboard'}
          </Text>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>V</Text>
            <Text style={styles.workflowStepText}>
              {isEn ? 'Select & Move Tool: Pan objects, select multiple elements.' : 'Auswahlwerkzeug: Objekte verschieben, skalieren oder gruppieren.'}
            </Text>
          </View>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>P</Text>
            <Text style={styles.workflowStepText}>
              {isEn ? 'Pen Tool: Freehand architectural drawing with smoothing.' : 'Stift-Werkzeug: Präzises Freihandzeichnen mit automatischer Glättung.'}
            </Text>
          </View>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>S</Text>
            <Text style={styles.workflowStepText}>
              {isEn ? 'Sticky Note: Drop colorful brainstorming cards.' : 'Haftnotiz (Post-it): Farbige Notizen für schnelle Ideen und Pendenzenerfassung.'}
            </Text>
          </View>
        </View>

        <View style={styles.calloutBox}>
          <Text style={styles.calloutTitle}>
            {isEn ? 'Security & Privacy' : 'Datenschutz bei KI-Abfragen'}
          </Text>
          <Text style={styles.calloutText}>
            {isEn
              ? 'All AI interactions are processed through enterprise API endpoints. Client project data is never used to train public foundation models.'
              : 'Alle KI-Anfragen erfolgen über geschützte Enterprise-Schnittstellen. Deine Plandaten werden niemals für das Training öffentlicher Modelle verwendet.'}
          </Text>
        </View>

        <View style={styles.runningFooter} fixed>
          <Text style={styles.runningFooterText}>{settings.footerText || 'Kreativ Desk OS | Master Reference Guide'}</Text>
          <Text style={styles.runningFooterText} render={({ pageNumber, totalPages }) => isEn ? `Page ${pageNumber} of ${totalPages}` : `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>

      {/* ============================================================ */}
      {/* SEITE 9: MODUL 7 – PITCH DECK STUDIO (16:9 PRÄSENTATIONEN)   */}
      {/* ============================================================ */}
      <Page size={settings.format || 'A4'} orientation="portrait" style={styles.page}>
        <View style={styles.runningHeader} fixed>
          <View style={styles.runningHeaderLeft}>
            <Text style={styles.runningLogoText}>Kreativ-Desk OS</Text>
            <Text style={[styles.runningLogoTag, { color: accentColor }]}>Modul 07</Text>
          </View>
          <Text style={styles.runningHeaderRight}>
            {isEn ? 'Pitch Deck Studio (16:9 Presentation)' : 'Pitch Deck Studio & Präsentationen'}
          </Text>
        </View>

        <View style={styles.moduleHeader}>
          <View style={styles.moduleHeaderLeft}>
            <View style={{ marginBottom: 5 }}>
              <Text style={[styles.moduleNumberPill, { backgroundColor: accentColor }]}>Modul 07</Text>
            </View>
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.moduleTitle}>
                {isEn ? 'Pitch Deck Studio & Presentation Engine' : 'Pitch Deck Studio & Präsentations-Engine'}
              </Text>
            </View>
            <View>
              <Text style={styles.moduleSubtitle}>
                {isEn 
                  ? '16:9 widescreen presentation mode with dual export to PDF, Keynote and PowerPoint (.pptx)' 
                  : '16:9 Widescreen Präsentationsmodus mit Dual-Export für PDF, Keynote und PowerPoint (.pptx)'}
              </Text>
            </View>
          </View>
          <View style={styles.moduleRightBadge}>
            <Text style={styles.moduleRightBadgeText}>16:9 CINEMA</Text>
            <Text style={styles.moduleRightBadgeSub}>PDF + PPTX Export</Text>
          </View>
        </View>

        <Text style={styles.bodyParagraph}>
          {isEn
            ? 'Presenting projects to clients, municipal authorities or investors used to require tedious manual copying of numbers and renderings into slide programs. Pitch Deck Studio generates presentations directly from live workspace data.'
            : 'Präsentationen vor Bauherren, Behörden oder Investoren erforderten bisher mühsames Kopieren von Zahlen und Renderings. Das Pitch Deck Studio generiert professionelle Foliendecks direkt aus den Live-Projektdaten.'}
        </Text>

        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <View style={styles.featureCardHeader}>
              <View style={[styles.featureIconBullet, { backgroundColor: accentColor }]} />
              <Text style={styles.featureCardTitle}>
                {isEn ? 'Live Data Synchronization' : 'Echtzeit-Datensynchronisation'}
              </Text>
            </View>
            <Text style={styles.featureCardText}>
              {isEn
                ? 'Slide metrics (BKP total budgets, completion rates, milestone dates) update automatically when project records change.'
                : 'Folienzahlen (BKP-Budgets, Fertigstellungsgrade, Meilensteine) aktualisieren sich automatisch bei Änderungen im Projekt.'}
            </Text>
          </View>

          <View style={styles.featureCardLast}>
            <View style={styles.featureCardHeader}>
              <View style={[styles.featureIconBullet, { backgroundColor: accentColor }]} />
              <Text style={styles.featureCardTitle}>
                {isEn ? 'Dual Export Engine' : 'Dual-Export: PDF & PPTX'}
              </Text>
            </View>
            <Text style={styles.featureCardText}>
              {isEn
                ? 'Export as crisp vector PDF via Universal PDF Studio or as native editable PowerPoint (.pptx) presentation for Keynote and Office 365.'
                : 'Exportiere gestochen scharfe Vektor-PDFs im Universal PDF Studio oder native PowerPoint (.pptx) Dateien zur Weiterbearbeitung in Keynote oder PowerPoint.'}
            </Text>
          </View>
        </View>

        <View style={styles.workflowBox}>
          <Text style={styles.workflowTitle}>
            {isEn ? 'How to Start a Client Pitch in Fullscreen' : 'So startest du die Präsentation'}
          </Text>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>1</Text>
            <Text style={styles.workflowStepText}>
              {isEn ? 'Open Pitch Deck Studio from the project sidebar or AI Tools menu.' : 'Öffne das Pitch Deck Studio über die linke Projekt-Seitenleiste.'}
            </Text>
          </View>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>2</Text>
            <Text style={styles.workflowStepText}>
              {isEn ? 'Select template theme (Minimal Dark, Modern Light or Timber Craft).' : 'Wähle dein bevorzugtes Design-Template (z.B. Modern Light oder Minimal Dark).'}
            </Text>
          </View>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>3</Text>
            <Text style={styles.workflowStepText}>
              {isEn ? 'Click "Fullscreen" to present directly on beamer or click "Export" to send to client.' : 'Klicke auf "Vollbild" zur Direktpräsentation oder exportiere das fertige Deck als PDF.'}
            </Text>
          </View>
        </View>

        <View style={styles.calloutBox}>
          <Text style={styles.calloutTitle}>
            {isEn ? 'Pro Tip: Client Presentation Mode' : 'Pro-Tipp: Vorbereitung auf Bauherren'}
          </Text>
          <Text style={styles.calloutText}>
            {isEn
              ? 'Use the hide/show toggle on individual slides to tailor the presentation for different audiences (e.g. hide technical BKP details for marketing presentations).'
              : 'Über die Folienauswahl links kannst du gezielt einzelne Folien für bestimmte Zielgruppen ein- oder ausblenden (z.B. Detailfinanzen bei Gestaltungspräsentationen verbergen).'}
          </Text>
        </View>

        <View style={styles.runningFooter} fixed>
          <Text style={styles.runningFooterText}>{settings.footerText || 'Kreativ Desk OS | Master Reference Guide'}</Text>
          <Text style={styles.runningFooterText} render={({ pageNumber, totalPages }) => isEn ? `Page ${pageNumber} of ${totalPages}` : `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>

      {/* ============================================================ */}
      {/* SEITE 10: MODUL 8 – HD VIDEO MEET, BAUSTELLEN-CHAT & GÄSTE   */}
      {/* ============================================================ */}
      <Page size={settings.format || 'A4'} orientation="portrait" style={styles.page}>
        <View style={styles.runningHeader} fixed>
          <View style={styles.runningHeaderLeft}>
            <Text style={styles.runningLogoText}>Kreativ-Desk OS</Text>
            <Text style={[styles.runningLogoTag, { color: accentColor }]}>Modul 08</Text>
          </View>
          <Text style={styles.runningHeaderRight}>
            {isEn ? 'HD Video Meet & Site Chat' : 'HD Video Meet & Baustellen-Chat'}
          </Text>
        </View>

        <View style={styles.moduleHeader}>
          <View style={styles.moduleHeaderLeft}>
            <View style={{ marginBottom: 5 }}>
              <Text style={[styles.moduleNumberPill, { backgroundColor: accentColor }]}>Modul 08</Text>
            </View>
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.moduleTitle}>
                {isEn ? 'HD Video Meet, Site Chat & Guest Magic Links' : 'HD Video Meet, Baustellen-Chat & Gast-Links'}
              </Text>
            </View>
            <View>
              <Text style={styles.moduleSubtitle}>
                {isEn 
                  ? 'WebRTC peer-to-peer conferencing with zero client software installation and screen sharing' 
                  : 'Integrierte Videokonferenzen ohne Fremdsoftware mit 1-Klick-Gastzugang für Bauherren'}
              </Text>
            </View>
          </View>
          <View style={styles.moduleRightBadge}>
            <Text style={styles.moduleRightBadgeText}>WebRTC HD</Text>
            <Text style={styles.moduleRightBadgeSub}>{isEn ? 'Zero Installation' : 'Keine App nötig'}</Text>
          </View>
        </View>

        <Text style={styles.bodyParagraph}>
          {isEn
            ? 'Forget complicated meeting links across Zoom, Teams or Skype. Kreativ Desk OS provides a native WebRTC video conferencing and chat environment embedded directly in the project workspace.'
            : 'Kein Wechsel mehr zwischen Zoom, Teams und E-Mail. Kreativ Desk OS bietet eine direkt in das Projekt integrierte HD-Videokonferenz- und Chat-Umgebung ohne Softwareinstallation.'}
        </Text>

        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <View style={styles.featureCardHeader}>
              <View style={[styles.featureIconBullet, { backgroundColor: accentColor }]} />
              <Text style={styles.featureCardTitle}>
                {isEn ? '1-Click Guest Magic Links' : '1-Klick-Gastzugang'}
              </Text>
            </View>
            <Text style={styles.featureCardText}>
              {isEn
                ? 'Send a secure magic URL to external clients or building authorities. They join immediately from any desktop or mobile browser without registration.'
                : 'Sende einen sicheren Gastlink per E-Mail oder WhatsApp an Bauherren oder Behördenvertreter. Der Beitritt erfolgt sofort im Browser ohne Registrierung.'}
            </Text>
          </View>

          <View style={styles.featureCardLast}>
            <View style={styles.featureCardHeader}>
              <View style={[styles.featureIconBullet, { backgroundColor: accentColor }]} />
              <Text style={styles.featureCardTitle}>
                {isEn ? 'Real-Time Screen Share' : 'BIM & CAD Bildschirmfreigabe'}
              </Text>
            </View>
            <Text style={styles.featureCardText}>
              {isEn
                ? 'Share 3D BIM models or CAD drawings directly in the call to coordinate structural details and review punch-list items collaboratively.'
                : 'Teile 3D-BIM-Modelle oder CAD-Pläne direkt im Videocall, um knifflige Anschlüsse und Details im Team live zu besprechen.'}
            </Text>
          </View>
        </View>

        <View style={styles.workflowBox}>
          <Text style={styles.workflowTitle}>
            {isEn ? 'Integrated Project Communication Features' : 'Wichtige Kommunikationsfunktionen'}
          </Text>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>1</Text>
            <Text style={styles.workflowStepText}>
              {isEn ? 'Project Channel Chat: All messages and site photos are archived in the project history.' : 'Projekt-Gruppenchat: Sämtliche Absprachen und Fotos bleiben im Bauakt archiviert.'}
            </Text>
          </View>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>2</Text>
            <Text style={styles.workflowStepText}>
              {isEn ? 'Read Receipts: Know immediately when contractors have viewed critical site instructions.' : 'Gelesen-Bestätigung: Sofort sehen, ob der Polier oder Handwerker die Anweisung gelesen hat.'}
            </Text>
          </View>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>3</Text>
            <Text style={styles.workflowStepText}>
              {isEn ? 'Instant Standup Call: Launch an emergency meeting with a single button click.' : 'Spontaner Baustellencall: Mit einem Klick alle Verantwortlichen in die Videorunde holen.'}
            </Text>
          </View>
        </View>

        <View style={styles.calloutBox}>
          <Text style={styles.calloutTitle}>
            {isEn ? 'Swiss Privacy Guarantee' : 'Datenschutz bei Videogesprächen'}
          </Text>
          <Text style={styles.calloutText}>
            {isEn
              ? 'Video and audio streams are encrypted end-to-end (DTLS/SRTP). No audio or video recordings are stored on servers unless explicitly authorized.'
              : 'Video- und Audiostreams werden Ende-zu-Ende verschlüsselt (DTLS/SRTP). Es findet keine heimliche Speicherung von Gesprächsinhalten auf Servern statt.'}
          </Text>
        </View>

        <View style={styles.runningFooter} fixed>
          <Text style={styles.runningFooterText}>{settings.footerText || 'Kreativ Desk OS | Master Reference Guide'}</Text>
          <Text style={styles.runningFooterText} render={({ pageNumber, totalPages }) => isEn ? `Page ${pageNumber} of ${totalPages}` : `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>

      {/* ============================================================ */}
      {/* SEITE 11: MODUL 9 – SMART PROPOSALS & DIGITALE E-SIGNATUR    */}
      {/* ============================================================ */}
      <Page size={settings.format || 'A4'} orientation="portrait" style={styles.page}>
        <View style={styles.runningHeader} fixed>
          <View style={styles.runningHeaderLeft}>
            <Text style={styles.runningLogoText}>Kreativ-Desk OS</Text>
            <Text style={[styles.runningLogoTag, { color: accentColor }]}>Modul 09</Text>
          </View>
          <Text style={styles.runningHeaderRight}>
            {isEn ? 'Smart Proposals & E-Signatures' : 'Smart Proposals & E-Signatur'}
          </Text>
        </View>

        <View style={styles.moduleHeader}>
          <View style={styles.moduleHeaderLeft}>
            <View style={{ marginBottom: 5 }}>
              <Text style={[styles.moduleNumberPill, { backgroundColor: accentColor }]}>Modul 09</Text>
            </View>
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.moduleTitle}>
                {isEn ? 'Smart Proposals & Legally Binding E-Signatures' : 'Smart Proposals & Digitale E-Signatur'}
              </Text>
            </View>
            <View>
              <Text style={styles.moduleSubtitle}>
                {isEn 
                  ? 'Interactive client offer landing pages with real-time options and touch e-signing' 
                  : 'Interaktive Web-Offerten mit Optionen-Kalkulator und rechtssicherer Touchscreen-Signatur'}
              </Text>
            </View>
          </View>
          <View style={styles.moduleRightBadge}>
            <Text style={styles.moduleRightBadgeText}>E-SIGN READY</Text>
            <Text style={styles.moduleRightBadgeSub}>{isEn ? 'Full Audit Trail' : 'Lückenloser Prüfpfad'}</Text>
          </View>
        </View>

        <Text style={styles.bodyParagraph}>
          {isEn
            ? 'Static PDF proposals often suffer from low closing rates and slow feedback. Smart Proposals turn quotations into interactive web experiences where clients can select optional services and sign digitally.'
            : 'Statische Papierofferten bremsen den Verkaufsabschluss. Smart Proposals verwandeln Angebote in interaktive Web-Erlebnisse: Bauherren können Zusatzoptionen wählen und das Angebot direkt auf dem Tablet unterschreiben.'}
        </Text>

        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <View style={styles.featureCardHeader}>
              <View style={[styles.featureIconBullet, { backgroundColor: accentColor }]} />
              <Text style={styles.featureCardTitle}>
                {isEn ? 'Interactive Option Selectors' : 'Interaktive Zusatzoptionen'}
              </Text>
            </View>
            <Text style={styles.featureCardText}>
              {isEn
                ? 'Clients can toggle upgrade packages (e.g. acoustic timber panels, solar pre-installation) with live recalculation of the total CHF investment.'
                : 'Bauherren können Optionen (z.B. Akustik-Holzdecken, Vorbereitung Photovoltaik) interaktiv aktivieren — der Gesamtbetrag passt sich sofort an.'}
            </Text>
          </View>

          <View style={styles.featureCardLast}>
            <View style={styles.featureCardHeader}>
              <View style={[styles.featureIconBullet, { backgroundColor: accentColor }]} />
              <Text style={styles.featureCardTitle}>
                {isEn ? 'Legally Compliant Audit Trail' : 'Rechtssicherer Audit Trail'}
              </Text>
            </View>
            <Text style={styles.featureCardText}>
              {isEn
                ? 'Every signature records exact UTC timestamp, IP address, device user-agent and SHA-256 integrity hash, preventing later disputes.'
                : 'Jede Unterschrift protokolliert Zeitstempel, IP-Adresse, Browser-Fingerprint und SHA-256 Hash zur Verhinderung von Vergabestreitigkeiten.'}
            </Text>
          </View>
        </View>

        <View style={styles.workflowBox}>
          <Text style={styles.workflowTitle}>
            {isEn ? '3-Step Proposal & Closing Workflow' : 'Der 3-Schritte-Freigabe-Workflow'}
          </Text>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>1</Text>
            <Text style={styles.workflowStepText}>
              {isEn ? 'Compose proposal in Proposal Studio using SIA cost groups and standard letterhead.' : 'Offerte im Vorlagen-Studio aus SIA-Vorlagen und Leistungsverzeichnis zusammenstellen.'}
            </Text>
          </View>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>2</Text>
            <Text style={styles.workflowStepText}>
              {isEn ? 'Share private proposal link (/p/...) with client via email or instant message.' : 'Individuellen Freigabelink (/p/...) per E-Mail oder Chat an den Bauherrn senden.'}
            </Text>
          </View>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>3</Text>
            <Text style={styles.workflowStepText}>
              {isEn ? 'Client signs with finger or stylus; the signed agreement is instantly archived as PDF.' : 'Bauherr signiert per Finger oder Stylus; der signierte Vertrag wird als PDF im Datenraum abgelegt.'}
            </Text>
          </View>
        </View>

        <View style={styles.calloutBox}>
          <Text style={styles.calloutTitle}>
            {isEn ? 'Automatic Project Conversion' : 'Automatische Projekterstellung'}
          </Text>
          <Text style={styles.calloutText}>
            {isEn
              ? 'Once signed by the client, the proposal can be converted into an active operational project workspace with a single click, transferring budget numbers directly into BKP 1–9.'
              : 'Nach erfolgter Signatur kann die Offerte mit einem Klick in ein aktives Projekt überführt werden — alle Budgetpositionen fließen direkt in den BKP 1–9 Kostenplan.'}
          </Text>
        </View>

        <View style={styles.runningFooter} fixed>
          <Text style={styles.runningFooterText}>{settings.footerText || 'Kreativ Desk OS | Master Reference Guide'}</Text>
          <Text style={styles.runningFooterText} render={({ pageNumber, totalPages }) => isEn ? `Page ${pageNumber} of ${totalPages}` : `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>

      {/* ============================================================ */}
      {/* SEITE 12: MODUL 10 – DIGITALER DATENRAUM & MOBILE QR-UPLOAD  */}
      {/* ============================================================ */}
      <Page size={settings.format || 'A4'} orientation="portrait" style={styles.page}>
        <View style={styles.runningHeader} fixed>
          <View style={styles.runningHeaderLeft}>
            <Text style={styles.runningLogoText}>Kreativ-Desk OS</Text>
            <Text style={[styles.runningLogoTag, { color: accentColor }]}>Modul 10</Text>
          </View>
          <Text style={styles.runningHeaderRight}>
            {isEn ? 'Document Vault & QR Scan' : 'Datenraum & QR-Scan'}
          </Text>
        </View>

        <View style={styles.moduleHeader}>
          <View style={styles.moduleHeaderLeft}>
            <View style={{ marginBottom: 5 }}>
              <Text style={[styles.moduleNumberPill, { backgroundColor: accentColor }]}>Modul 10</Text>
            </View>
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.moduleTitle}>
                {isEn ? 'Digital Document Vault & Mobile QR Upload' : 'Digitaler Datenraum & Mobiler QR-Upload'}
              </Text>
            </View>
            <View>
              <Text style={styles.moduleSubtitle}>
                {isEn 
                  ? 'Structured construction file archives, version control and zero-login camera upload' 
                  : 'Revisionssichere Bauakte (01_FINANZEN bis 09_DOKUMENTATION) und mobiler QR-Scan'}
              </Text>
            </View>
          </View>
          <View style={styles.moduleRightBadge}>
            <Text style={styles.moduleRightBadgeText}>{isEn ? 'SECURE VAULT' : 'REVISIONS-AKTE'}</Text>
            <Text style={styles.moduleRightBadgeSub}>{isEn ? 'Auto-Categorized' : 'Automatische Ordner'}</Text>
          </View>
        </View>

        <Text style={styles.bodyParagraph}>
          {isEn
            ? 'The Document Vault provides an immutable audit trail for all construction plans, engineering calculations, delivery notes, and building permits. It eliminates lost physical paperwork through mobile camera scanning.'
            : 'Der digitale Datenraum bietet eine revisionssichere Ablage für alle Baupläne, Statiken, Lieferscheine und behördlichen Entscheide. Durch den mobilen QR-Code Scan entfällt mühsames Scannen im Büro.'}
        </Text>

        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <View style={styles.featureCardHeader}>
              <View style={[styles.featureIconBullet, { backgroundColor: accentColor }]} />
              <Text style={styles.featureCardTitle}>
                {isEn ? 'Standardized Folder Structure' : 'Standard-Ordnerstruktur (01–09)'}
              </Text>
            </View>
            <Text style={styles.featureCardText}>
              {isEn
                ? 'Every project automatically organizes into 01_FINANCE, 02_LEGAL, 03_PERMITS, 08_PLANS, 09_DOCUMENTATION. Enforces clean office-wide compliance.'
                : 'Jedes Projekt initialisiert automatisch die Ordner 01_FINANZEN, 02_RECHTLICHES, 03_BEWILLIGUNGEN, 08_PLÄNE und 09_DOKUMENTATION nach SIA-Standard.'}
            </Text>
          </View>

          <View style={styles.featureCardLast}>
            <View style={styles.featureCardHeader}>
              <View style={[styles.featureIconBullet, { backgroundColor: accentColor }]} />
              <Text style={styles.featureCardTitle}>
                {isEn ? 'Mobile QR Camera Upload' : 'Mobiler QR-Code Direktupload'}
              </Text>
            </View>
            <Text style={styles.featureCardText}>
              {isEn
                ? 'Scan the folder QR code with your smartphone camera to upload on-site delivery notes and receipts directly into the target project folder without typing logins.'
                : 'Scanne den QR-Code des Zielordners mit dem Smartphone, um Lieferscheine oder Quittungen auf der Baustelle sofort per Handykamera abzulegen.'}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: '25%' }]}>{isEn ? 'Folder ID' : 'Ordner-Nr.'}</Text>
            <Text style={[styles.tableHeaderCell, { width: '35%' }]}>{isEn ? 'Folder Category' : 'Kategorie'}</Text>
            <Text style={[styles.tableHeaderCell, { width: '40%' }]}>{isEn ? 'Typical Content' : 'Typischer Inhalt'}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCellBold, { width: '25%' }]}>01_FINANZEN</Text>
            <Text style={[styles.tableCell, { width: '35%' }]}>{isEn ? 'Finances & Invoices' : 'Finanzen & Rechnungen'}</Text>
            <Text style={[styles.tableCell, { width: '40%' }]}>{isEn ? 'BKP budgets, QR-bills, contractor invoices.' : 'BKP-Budgets, QR-Rechnungen, Spesen.'}</Text>
          </View>
          <View style={[styles.tableRow, styles.tableRowEven]}>
            <Text style={[styles.tableCellBold, { width: '25%' }]}>02_RECHTLICHES</Text>
            <Text style={[styles.tableCell, { width: '35%' }]}>{isEn ? 'Contracts & Agreements' : 'Verträge & Rechtliches'}</Text>
            <Text style={[styles.tableCell, { width: '40%' }]}>{isEn ? 'SIA 102/118 agreements, subcontractor contracts.' : 'SIA 102/118 Verträge, Werkverträge.'}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCellBold, { width: '25%' }]}>08_PLÄNE</Text>
            <Text style={[styles.tableCell, { width: '35%' }]}>{isEn ? 'CAD & BIM Drawings' : 'CAD- & BIM-Pläne'}</Text>
            <Text style={[styles.tableCell, { width: '40%' }]}>{isEn ? 'Approved plans, IFC models, revisions.' : 'Freigegebene Pläne, IFC, Revisionen.'}</Text>
          </View>
        </View>

        <View style={styles.calloutBox}>
          <Text style={styles.calloutTitle}>
            {isEn ? 'Revision Control & Versioning' : 'Revisionssicherheit & Versionierung'}
          </Text>
          <Text style={styles.calloutText}>
            {isEn
              ? 'Uploading an updated plan with the same name preserves the historical revision with author timestamp, fulfilling Swiss SIA 118 documentation obligations.'
              : 'Wird ein neuer Plan mit gleichem Namen hochgeladen, bleibt der Vorgängerstand als archivierte Revision erhalten — unverzichtbar für SIA-Nachweise.'}
          </Text>
        </View>

        <View style={styles.runningFooter} fixed>
          <Text style={styles.runningFooterText}>{settings.footerText || 'Kreativ Desk OS | Master Reference Guide'}</Text>
          <Text style={styles.runningFooterText} render={({ pageNumber, totalPages }) => isEn ? `Page ${pageNumber} of ${totalPages}` : `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>

      {/* ============================================================ */}
      {/* SEITE 13: MODUL 11 & 12 – CRM, ZERO LEAKAGE & DATENSCHUTZ   */}
      {/* ============================================================ */}
      <Page size={settings.format || 'A4'} orientation="portrait" style={styles.page}>
        <View style={styles.runningHeader} fixed>
          <View style={styles.runningHeaderLeft}>
            <Text style={styles.runningLogoText}>Kreativ-Desk OS</Text>
            <Text style={[styles.runningLogoTag, { color: accentColor }]}>Modul 11 & 12</Text>
          </View>
          <Text style={styles.runningHeaderRight}>
            {isEn ? 'CRM, Zero Leakage & Security' : 'CRM, Zero Leakage & Datenschutz'}
          </Text>
        </View>

        <View style={styles.moduleHeader}>
          <View style={styles.moduleHeaderLeft}>
            <View style={{ marginBottom: 5 }}>
              <Text style={[styles.moduleNumberPill, { backgroundColor: accentColor }]}>Modul 11 & 12</Text>
            </View>
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.moduleTitle}>
                {isEn ? 'CRM, Granular Roles & Swiss Data Security' : 'CRM, Rollenrechte & Schweizer Datenschutz'}
              </Text>
            </View>
            <View>
              <Text style={styles.moduleSubtitle}>
                {isEn 
                  ? 'Role-based access control (RBAC), subcontractor isolation, and Swiss DSG / GDPR compliance' 
                  : 'Rollenbasierte Rechteverwaltung, Zero-Data-Leakage und Schweizer DSG / DSGVO Konformität'}
              </Text>
            </View>
          </View>
          <View style={styles.moduleRightBadge}>
            <Text style={styles.moduleRightBadgeText}>CH DSG / GDPR</Text>
            <Text style={styles.moduleRightBadgeSub}>{isEn ? 'Row Level Security' : 'RLS Verschlüsselung'}</Text>
          </View>
        </View>

        <Text style={styles.bodyParagraph}>
          {isEn
            ? 'Construction involves dozens of external partners with conflicting interests. Kreativ Desk OS implements a mathematical Zero Data Leakage security architecture using Supabase Row Level Security (RLS).'
            : 'Am Bau arbeiten dutzende externe Partner mit unterschiedlichen Interessen. Kreativ Desk OS setzt auf eine kompromisslose Zero-Data-Leakage Sicherheitsarchitektur mittels Row Level Security (RLS).'}
        </Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: '22%' }]}>{isEn ? 'User Role' : 'Benutzerrolle'}</Text>
            <Text style={[styles.tableHeaderCell, { width: '38%' }]}>{isEn ? 'Access Permissions' : 'Zugriffsrechte'}</Text>
            <Text style={[styles.tableHeaderCell, { width: '40%' }]}>{isEn ? 'Financial & Defect Visibility' : 'Sichtbarkeit Finanzen'}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCellBold, { width: '22%', color: '#7C3AED' }]}>{isEn ? 'OWNER / ADMIN' : 'INHABER / ADMIN'}</Text>
            <Text style={[styles.tableCell, { width: '38%' }]}>{isEn ? 'Full system control, OpEx, billing, team.' : 'Vollzugriff, Firmenfinanzen, Lizenzen, Audit.'}</Text>
            <Text style={[styles.tableCell, { width: '40%' }]}>{isEn ? 'Complete financial transparency across all projects.' : 'Volle Einsicht in alle Summen & Honorare.'}</Text>
          </View>
          <View style={[styles.tableRow, styles.tableRowEven]}>
            <Text style={[styles.tableCellBold, { width: '22%', color: '#2563EB' }]}>{isEn ? 'PROJECT LEAD' : 'PROJEKTLEITER'}</Text>
            <Text style={[styles.tableCell, { width: '38%' }]}>{isEn ? 'Full control within assigned project cockpits.' : 'Volle Steuerung im zugewiesenen Projekt.'}</Text>
            <Text style={[styles.tableCell, { width: '40%' }]}>{isEn ? 'Sees project BKP 1–9 budget and contractor quotes.' : 'Sieht BKP 1–9 des Projekts (keine Bürokosten).'}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCellBold, { width: '22%', color: '#059669' }]}>{isEn ? 'EMPLOYEE' : 'MITARBEITER'}</Text>
            <Text style={[styles.tableCell, { width: '38%' }]}>{isEn ? 'Plan viewing, time tracking, defect recording.' : 'Pläne einsehen, Mängel erfassen, Zeiterfassung.'}</Text>
            <Text style={[styles.tableCell, { width: '40%' }]}>{isEn ? 'No access to contractor quotes or profit margins.' : 'Keine Einsicht in Einkaufspreise oder Margen.'}</Text>
          </View>
          <View style={[styles.tableRow, styles.tableRowEven]}>
            <Text style={[styles.tableCellBold, { width: '22%', color: '#D97706' }]}>{isEn ? 'SUBCONTRACTOR' : 'HANDWERKER (EXTERN)'}</Text>
            <Text style={[styles.tableCell, { width: '38%' }]}>{isEn ? 'Strictly limited to assigned trade pins and tasks.' : 'Ausschließlich eigenes Gewerk (Pläne & Mängel).'}</Text>
            <Text style={[styles.tableCell, { width: '40%' }]}>{isEn ? 'ZERO LEAKAGE: Cannot see other trades or budgets.' : 'ZERO LEAKAGE: Sieht weder Budgets noch Dritte.'}</Text>
          </View>
        </View>

        <View style={styles.workflowBox}>
          <Text style={styles.workflowTitle}>
            {isEn ? 'Security Standards & Data Sovereignty' : 'Datensicherheit & Schweizer Rechenzentrum'}
          </Text>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>1</Text>
            <Text style={styles.workflowStepText}>
              {isEn ? 'Swiss DSG & EU-GDPR: Compliance certified for client and financial construction data.' : 'Schweizer DSG & EU-DSGVO: Vollumfänglich konform für Bauherren- und Baudaten.'}
            </Text>
          </View>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>2</Text>
            <Text style={styles.workflowStepText}>
              {isEn ? 'Row Level Security: Database records are filtered at kernel level; zero API leakage.' : 'Row Level Security (RLS): Jeder Zugriff wird auf Datenbankebene nach Firmen- und Mandanten-ID gefiltert.'}
            </Text>
          </View>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>3</Text>
            <Text style={styles.workflowStepText}>
              {isEn ? 'Automated Offsite Backups: Encrypted multi-redundant daily backup snapshots.' : 'Verschlüsselte Backups: Tägliche automatische Sicherung in Schweizer/EU Rechenzentren.'}
            </Text>
          </View>
        </View>

        <View style={styles.calloutBox}>
          <Text style={styles.calloutTitle}>
            {isEn ? 'Immutable Audit Logs' : 'Revisionssicheres Audit-Logbuch'}
          </Text>
          <Text style={styles.calloutText}>
            {isEn
              ? 'Every creation, modification, plan download, and signature is recorded in the immutable Audit Log with user identity and IP address for complete accountability.'
              : 'Jede Aktion (Plan-Download, Budgetänderung, Mängelfreigabe) wird im internen Audit-Logbuch lückenlos mit Benutzer-ID und Zeitstempel dokumentiert.'}
          </Text>
        </View>

        <View style={styles.runningFooter} fixed>
          <Text style={styles.runningFooterText}>{settings.footerText || 'Kreativ Desk OS | Master Reference Guide'}</Text>
          <Text style={styles.runningFooterText} render={({ pageNumber, totalPages }) => isEn ? `Page ${pageNumber} of ${totalPages}` : `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>

      {/* ============================================================ */}
      {/* SEITE 14: ANHANG – SHORTCUTS, CHECKLISTE & SUPPORT          */}
      {/* ============================================================ */}
      <Page size={settings.format || 'A4'} orientation="portrait" style={styles.page}>
        <View style={styles.runningHeader} fixed>
          <View style={styles.runningHeaderLeft}>
            <Text style={styles.runningLogoText}>Kreativ-Desk OS</Text>
            <Text style={[styles.runningLogoTag, { color: accentColor }]}>
              {isEn ? 'Appendix' : 'Anhang'}
            </Text>
          </View>
          <Text style={styles.runningHeaderRight}>
            {isEn ? 'Shortcuts, Quickstart Checklist & Support' : 'Shortcuts, Checkliste & Support'}
          </Text>
        </View>

        <View style={styles.moduleHeader}>
          <View style={styles.moduleHeaderLeft}>
            <View style={{ marginBottom: 5 }}>
              <Text style={[styles.moduleNumberPill, { backgroundColor: accentColor }]}>
                {isEn ? 'Quick Reference' : 'Schnellreferenz'}
              </Text>
            </View>
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.moduleTitle}>
                {isEn ? '5-Step Quickstart & Professional Cheatsheet' : '5-Schritte-Schnellstart & Profi-Tastenkürzel'}
              </Text>
            </View>
            <View>
              <Text style={styles.moduleSubtitle}>
                {isEn 
                  ? 'Best practices for rapid onboarding and direct official support access' 
                  : 'Schritt-für-Schritt-Anleitung für neue Projekte und offizielle Supportkanäle'}
              </Text>
            </View>
          </View>
          <View style={styles.moduleRightBadge}>
            <Text style={styles.moduleRightBadgeText}>{isEn ? 'SWISS SUPPORT' : 'CH-SUPPORT'}</Text>
            <Text style={styles.moduleRightBadgeSub}>help@kreativdesk.ch</Text>
          </View>
        </View>

        <View style={styles.workflowBox}>
          <Text style={styles.workflowTitle}>
            {isEn ? '5-Step Project Launch Checklist' : '5-Schritte-Checkliste für den Projektstart'}
          </Text>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>1</Text>
            <Text style={styles.workflowStepText}>
              {isEn ? 'Company Hub Setup: Verify company address, logo, and IBAN under Settings > Profile.' : 'Firmenzentrale konfigurieren: Firmenadresse, Briefkopf-Logo und QR-IBAN in den Einstellungen hinterlegen.'}
            </Text>
          </View>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>2</Text>
            <Text style={styles.workflowStepText}>
              {isEn ? 'Create Project: In Company Hub, click "+ New Project" or test with "Sample Project".' : 'Projekt anlegen: In der Firmenzentrale auf "+ Neues Projekt" klicken oder mit "Musterprojekt" starten.'}
            </Text>
          </View>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>3</Text>
            <Text style={styles.workflowStepText}>
              {isEn ? 'Upload Plans & IFC: Drag CAD floor plans (PDF) into Plans and 3D model (.ifc) into 3D Viewer.' : 'Pläne & IFC hochladen: 2D-Grundrisse in das Planmodul und 3D-Modell (.ifc) in den BIM Viewer laden.'}
            </Text>
          </View>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>4</Text>
            <Text style={styles.workflowStepText}>
              {isEn ? 'Setup BKP 1–9 Budget: Adopt standard SIA budget positions or import your Excel/CSV ledger.' : 'BKP-Kostenplan aktivieren: SIA-Standardpositionen übernehmen oder bestehenden Kostenvoranschlag erfassen.'}
            </Text>
          </View>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowStepNum}>5</Text>
            <Text style={styles.workflowStepText}>
              {isEn ? 'Invite Team & Contractors: Assign project roles with trade filters for guaranteed Zero Leakage.' : 'Team & Handwerker einladen: Rollen mit Gewerk-Zuweisung vergeben für garantierten Zero-Leakage Schutz.'}
            </Text>
          </View>
        </View>

        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <View style={styles.featureCardHeader}>
              <View style={[styles.featureIconBullet, { backgroundColor: accentColor }]} />
              <Text style={styles.featureCardTitle}>
                {isEn ? 'Universal PDF Studio' : 'Universal PDF Studio'}
              </Text>
            </View>
            <Text style={styles.featureCardText}>
              {isEn
                ? 'Available in every module (Finance, Calendar, Whiteboard, Defects, Pitch Deck). Generates vector-sharp DIN-A4/A3 documents with live preview and vault save.'
                : 'In jedem Modul verfügbar (Finanzen, Kalender, Whiteboard, Mängel, Pitch Deck). Generiert gestochen scharfe Vektor-PDFs mit Sofort-Vorschau und Datenraum-Speicherung.'}
            </Text>
          </View>

          <View style={styles.featureCardLast}>
            <View style={styles.featureCardHeader}>
              <View style={[styles.featureIconBullet, { backgroundColor: accentColor }]} />
              <Text style={styles.featureCardTitle}>
                {isEn ? 'Concierge & Support' : 'Concierge & Hilfe-Center'}
              </Text>
            </View>
            <Text style={styles.featureCardText}>
              {isEn
                ? 'Access the built-in AI Concierge anytime via the floating button or visit the Help Center (/help) for interactive FAQs and live video demonstrations.'
                : 'Nutze den integrierten KI-Concierge über das schwebende Icon oder besuche das Hilfe-Center (/help) für Anleitungen, FAQs und Video-Demos.'}
            </Text>
          </View>
        </View>

        {/* Support & Contact Details */}
        <View style={[styles.coverStandardsGrid, { marginTop: 12 }]}>
          <View style={styles.coverStandardItem}>
            <Text style={styles.coverStandardLabel}>{isEn ? 'Direct Support' : 'Support-E-Mail'}</Text>
            <Text style={styles.coverStandardValue}>support@kreativdesk.ch</Text>
          </View>
          <View style={styles.coverStandardItem}>
            <Text style={styles.coverStandardLabel}>{isEn ? 'Official Portal' : 'Webportal'}</Text>
            <Text style={styles.coverStandardValue}>www.kreativdesk.ch</Text>
          </View>
          <View style={styles.coverStandardItem}>
            <Text style={styles.coverStandardLabel}>{isEn ? 'Location' : 'Standort'}</Text>
            <Text style={styles.coverStandardValue}>Schweiz (CH)</Text>
          </View>
          <View style={styles.coverStandardItemLast}>
            <Text style={styles.coverStandardLabel}>{isEn ? 'Status' : 'System-Status'}</Text>
            <Text style={[styles.coverStandardValue, { color: '#059669' }]}>All Systems Active</Text>
          </View>
        </View>

        <View style={styles.runningFooter} fixed>
          <Text style={styles.runningFooterText}>{settings.footerText || 'Kreativ Desk OS | Master Reference Guide'}</Text>
          <Text style={styles.runningFooterText} render={({ pageNumber, totalPages }) => isEn ? `Page ${pageNumber} of ${totalPages}` : `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>

    </Document>
  );
}
