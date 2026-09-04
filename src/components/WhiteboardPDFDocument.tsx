import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image as PDFImage } from '@react-pdf/renderer';

const pdfStyles = StyleSheet.create({
  page: { backgroundColor: '#ffffff', fontFamily: 'Helvetica', padding: 25 },
  safeArea: { flex: 1, display: 'flex', flexDirection: 'column' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 2, paddingBottom: 10, marginBottom: 12 },
  headerLeft: { flex: 1 },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#000000', textTransform: 'uppercase', marginBottom: 6 },
  metaGrid: { flexDirection: 'row' },
  metaBlock: { flexDirection: 'column', marginRight: 20 },
  metaLabel: { fontSize: 7, color: '#6b7280', textTransform: 'uppercase', marginBottom: 2 },
  metaValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#000000' },
  logo: { width: 100, height: 35, objectFit: 'contain' },
  content: { 
    width: '100%', 
    backgroundColor: '#f9fafb', 
    borderRadius: 6, 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    justifyContent: 'center', 
    alignItems: 'center', 
    overflow: 'hidden',
    padding: 6
  },
  snapshot: { width: '100%', height: '100%', objectFit: 'contain' },
  noImageText: { color: '#9ca3af', fontStyle: 'italic', alignSelf: 'center' },
  footer: { position: 'absolute', bottom: 15, left: 25, right: 25, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 5 },
  footerText: { fontSize: 7, color: '#9ca3af' },
});

export default function WhiteboardPDFDocument({ settings, pdfRenderImage, projectHeader }: any) {
  const projectName = projectHeader?.project || 'Projekt';
  const projectDate = projectHeader?.date ? new Date(projectHeader.date).toLocaleDateString('de-CH') : new Date().toLocaleDateString('de-CH');

  const isLandscape = settings.orientation === 'landscape';
  const isA3 = settings.format === 'A3';

  // Standard paper dimensions in points (72 pt/inch):
  // A4: 595.28 x 841.89
  // A3: 841.89 x 1190.55
  const pageH = isLandscape ? (isA3 ? 841.89 : 595.28) : (isA3 ? 1190.55 : 841.89);
  // Subtract top/bottom padding (50pt), header (~65pt), footer (~30pt)
  const contentHeight = pageH - 145;

  return (
    <Document>
      <Page size={settings.format} orientation={settings.orientation} style={pdfStyles.page}>
        <View style={pdfStyles.safeArea}>
          <View style={[pdfStyles.headerContainer, { borderBottomColor: settings.accentColor || '#3b82f6' }]} fixed>
            <View style={pdfStyles.headerLeft}>
              <Text style={[pdfStyles.title, { color: settings.accentColor || '#3b82f6' }]}>Whiteboard Skizze</Text>
              <View style={pdfStyles.metaGrid}>
                <View style={pdfStyles.metaBlock}>
                  <Text style={pdfStyles.metaLabel}>Projekt:</Text>
                  <Text style={pdfStyles.metaValue}>{projectName}</Text>
                </View>
                <View style={pdfStyles.metaBlock}>
                  <Text style={pdfStyles.metaLabel}>Datum:</Text>
                  <Text style={pdfStyles.metaValue}>{projectDate}</Text>
                </View>
              </View>
            </View>
            {settings.logo && <PDFImage src={settings.logo} style={pdfStyles.logo} />}
          </View>
          <View style={[pdfStyles.content, { height: contentHeight, borderColor: settings.accentColor || '#3b82f6' }]}>
            {pdfRenderImage ? (
              <PDFImage src={pdfRenderImage} style={pdfStyles.snapshot} />
            ) : (
              <Text style={pdfStyles.noImageText}>Keine Skizze vorhanden.</Text>
            )}
          </View>
        </View>
        <View style={pdfStyles.footer} fixed>
          <Text style={pdfStyles.footerText}>{settings.footerText}</Text>
          <Text style={pdfStyles.footerText} render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
