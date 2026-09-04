import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image as PDFImage } from '@react-pdf/renderer';

const pdfStyles = StyleSheet.create({
  page: { backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
  safeArea: { flex: 1, margin: 30, marginBottom: 50, display: 'flex', flexDirection: 'column' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 2, paddingBottom: 10, marginBottom: 15 },
  headerLeft: { flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#000000', textTransform: 'uppercase', marginBottom: 8 },
  metaGrid: { flexDirection: 'row' },
  metaBlock: { flexDirection: 'column', marginRight: 20 },
  metaLabel: { fontSize: 7, color: '#6b7280', textTransform: 'uppercase', fontWeight: 'bold' },
  metaValue: { fontSize: 10, color: '#000000', fontWeight: 'bold' },
  logo: { width: 100, height: 40, objectFit: 'contain' },
  content: { flex: 1, width: '100%', backgroundColor: '#f9fafb', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  snapshot: { width: '98%', height: '98%', objectFit: 'contain' },
  noImageText: { color: '#9ca3af', fontStyle: 'italic', alignSelf: 'center', marginTop: 20 },
  footer: { position: 'absolute', bottom: 20, left: 30, right: 30, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 5 },
  footerText: { fontSize: 7, color: '#9ca3af' },
});

export default function WhiteboardPDFDocument({ settings, pdfRenderImage, projectHeader }: any) {
  const projectName = projectHeader?.project || 'Projekt';
  const projectDate = projectHeader?.date ? new Date(projectHeader.date).toLocaleDateString('de-CH') : new Date().toLocaleDateString('de-CH');

  return (
    <Document>
      <Page size={settings.format} orientation={settings.orientation} style={pdfStyles.page}>
        <View style={pdfStyles.safeArea}>
          <View style={[pdfStyles.headerContainer, { borderBottomColor: settings.accentColor }]} fixed>
            <View style={pdfStyles.headerLeft}>
              <Text style={[pdfStyles.title, { color: settings.accentColor }]}>Whiteboard Skizze</Text>
              <View style={pdfStyles.metaGrid}>
                <View style={pdfStyles.metaBlock}><Text style={pdfStyles.metaLabel}>Projekt:</Text><Text style={pdfStyles.metaValue}>{projectName}</Text></View>
                <View style={pdfStyles.metaBlock}><Text style={pdfStyles.metaLabel}>Datum:</Text><Text style={pdfStyles.metaValue}>{projectDate}</Text></View>
              </View>
            </View>
            {settings.logo && <PDFImage src={settings.logo} style={pdfStyles.logo} />}
          </View>
          <View style={[pdfStyles.content, { borderColor: settings.accentColor }]}>
            {pdfRenderImage ? <PDFImage src={pdfRenderImage} style={pdfStyles.snapshot} /> : <Text style={pdfStyles.noImageText}>Keine Skizze vorhanden.</Text>}
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
