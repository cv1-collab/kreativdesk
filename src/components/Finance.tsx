import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { 
  TrendingUp, Plus, X, Calculator, Download, Send, Copy, Trash2, Receipt, 
  DollarSign, ArrowUpRight, ArrowDownRight, PieChart as PieChartIcon, 
  FileText, AlertCircle, CalendarDays, FileSignature, 
  Clock, CheckCircle2, ClipboardList, Loader2, RotateCw, Camera, Smartphone,
  Image as ImageIcon
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { cn } from '../utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useProject } from '../contexts/ProjectContext';
import { useLanguage } from '../contexts/LanguageContext';
import { hasFeature } from '../utils/planFeatures';
import { useTheme } from '../contexts/ThemeContext';
import { db, storage } from '../firebase';
import { collection, onSnapshot, doc, setDoc, getDoc, getDocs, addDoc, query, where, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';
import InvoiceStudio from './InvoiceStudio';
import UniversalPDFStudio from './UniversalPDFStudio';

if (typeof window !== 'undefined' && typeof window.Buffer === 'undefined') {
  window.Buffer = { from: () => new Uint8Array(), isBuffer: () => false } as any;
}

import { Document, Page, Text, View, StyleSheet, Image as PDFImage } from '@react-pdf/renderer';

function formatBytes(bytes: number) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB']; const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  de: { finance_budget: 'Finanzen & Budget', overview: 'Übersicht', budget_plan: 'Budgetplan', payment_control: 'Zahlungskontrolle', cashflow: 'Cashflow & Hauptbuch', all_time: 'Gesamte Zeit', this_year: 'Dieses Jahr', this_month: 'Dieser Monat', today: 'Heute', book_hours: 'Stunden erfassen', quote: 'Offerte', receipt: 'Beleg', invoice: 'Rechnung', planned: 'Geplant', actual_costs: 'Ist-Kosten', variance: 'Abweichung', pos: 'Pos', description: 'Beschreibung', qty: 'Menge', unit: 'Einh.', unit_price: 'EP', total: 'Total', subtotal: 'Zwischentotal', vat: 'MWST', total_amount: 'Bruttobetrag', budget_supplement: 'Nachtrag', internal_hours_time_tracking: 'Interne Stunden', date: 'Datum', budget_assignment: 'Budget-Zuweisung', credit_revenue: 'Haben (Umsatz)', debit_costs: 'Soll (Kosten)', balance_profit: 'Saldo', free_booking: 'Freie Buchung', status: 'Status', open: 'Offen', paid: 'Bezahlt', draft: 'Entwurf', no_bookings_period: 'Keine Buchungen.', book_costs: 'Kosten verbuchen', cancel: 'Abbrechen', take_photo: 'Foto aufnehmen', receipts_photos: 'Belege / Fotos', amount_chf: 'Betrag (CHF)', vendor_company: 'Firma', project: 'Projekt',  book_receipt: 'Beleg erfassen', new_project: 'Neues Projekt', client: 'Kunde', new_variant: 'Neue Variante', duplicate_variant: 'Duplizieren', delete_variant: 'Löschen', approve: 'Freigeben', approve_revoke: 'Freigabe widerrufen', approved: 'Freigegeben', add_position: 'Position hinzufügen', new_phase: 'Neue Phase', status_updated: 'Status aktualisiert', update_error: 'Fehler', delete_confirm: 'Wirklich löschen?', booking_deleted: 'Gelöscht', delete_error: 'Fehler beim Löschen', hours_deleted: 'Stunden gelöscht', new_variant_created: 'Variante erstellt', variant_duplicated: 'Dupliziert', min_one_variant: 'Min. eine Variante', cant_delete_approved: 'Freigegebene können nicht gelöscht werden', variant_deleted: 'Gelöscht', revoke_confirm: 'Freigabe widerrufen?', approve_confirm: 'Freigeben?', approval_revoked: 'Widerrufen', budget_approved: 'Freigegeben', analyzing_ai: 'KI analysiert...', ai_failed: 'KI Fehler', receipt_live_received: 'Beleg erkannt!', project_profit: 'Projectgewinn', revenue: 'Umsatz', costs: 'Kosten', total_budget: 'Gesamtbudget', budget_utilization: 'Budget Auslastung', spent: 'Ausgegeben', no_budget_present: 'Kein Budget vorhanden', planned_vs_actual: 'Soll vs Ist', payment_control_inactive: 'Zahlungskontrolle Inaktiv', payment_control_inactive_desc: 'Gib ein Budget frei', total_project_excl_vat: 'Total Projekt (exkl. MwSt)', external_costs: 'Externe Kosten', invoices_total: 'Rechnungen Total', expenses_team: 'Spesen', ext_costs: 'Externe Kosten', open_quotes: 'Offene Offerten', quotes: 'Offerten', outgoing_invoices: 'Rechnungen', expenses: 'Spesen', no_entries: 'Keine Einträge', simple_internal: 'Einfach (Intern)', detailed_external: 'Detailliert (Extern)', generate_pdf_book: 'PDF generieren & verbuchen', rotate: 'Tabelle zeigen' },
  en: { finance_budget: 'Finance & Budget', overview: 'Overview', budget_plan: 'Budget Plan', payment_control: 'Payment Control', cashflow: 'Cashflow & Ledger', all_time: 'All Time', this_year: 'This Year', this_month: 'This Month', today: 'Today', book_hours: 'Book Hours', quote: 'Quote', receipt: 'Receipt', invoice: 'Invoice', planned: 'Planned', actual_costs: 'Actual Costs', variance: 'Variance', pos: 'Pos', description: 'Description', qty: 'Qty', unit: 'Unit', unit_price: 'Unit Price', total: 'Total', subtotal: 'Subtotal', vat: 'VAT', total_amount: 'Total Amount', budget_supplement: 'Supplement', internal_hours_time_tracking: 'Internal Hours', date: 'Date', budget_assignment: 'Budget Assignment', credit_revenue: 'Credit (Revenue)', debit_costs: 'Debit (Costs)', balance_profit: 'Balance', free_booking: 'Free Booking', status: 'Status', open: 'Open', paid: 'Paid', draft: 'Draft', no_bookings_period: 'No bookings.', book_costs: 'Book Costs', cancel: 'Cancel', take_photo: 'Take Photo', receipts_photos: 'Receipts / Photos', amount_chf: 'Amount (CHF)', vendor_company: 'Company', project: 'Project', book_receipt: 'Book Receipt', new_project: 'New Project', client: 'Client', new_variant: 'New Variant', duplicate_variant: 'Duplicate', delete_variant: 'Delete', approve: 'Approve', approve_revoke: 'Revoke', approved: 'Approved', add_position: 'Add Pos', new_phase: 'New Phase', status_updated: 'Status updated', update_error: 'Error', delete_confirm: 'Delete?', booking_deleted: 'Deleted', delete_error: 'Error', hours_deleted: 'Hours deleted', new_variant_created: 'Variant created', variant_duplicated: 'Duplicated', min_one_variant: 'Min 1 variant', cant_delete_approved: 'Cant delete approved', variant_deleted: 'Deleted', revoke_confirm: 'Revoke?', approve_confirm: 'Approve?', approval_revoked: 'Revoked', budget_approved: 'Approved', analyzing_ai: 'AI analyzing...', ai_failed: 'AI Failed', receipt_live_received: 'Receipt recognized!', project_profit: 'Project Profit', revenue: 'Revenue', costs: 'Costs', total_budget: 'Total Budget', budget_utilization: 'Budget Utilization', spent: 'Spent', no_budget_present: 'No budget', planned_vs_actual: 'Planned vs Actual', payment_control_inactive: 'Payment Control Inactive', payment_control_inactive_desc: 'Approve a budget', total_project_excl_vat: 'Total Project (excl. VAT)', external_costs: 'External Costs', invoices_total: 'Invoices Total', expenses_team: 'Expenses', ext_costs: 'Ext. Costs', open_quotes: 'Open Quotes', quotes: 'Quotes', outgoing_invoices: 'Invoices', expenses: 'Expenses', no_entries: 'No entries', simple_internal: 'Simple (Internal)', detailed_external: 'Detailed (External)', generate_pdf_book: 'Generate PDF & Book', rotate: 'Show Table' }
};

const numberInputClass = "bg-transparent outline-none w-full text-right focus:border-b focus:border-accent-ai/50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]";

interface Transaction { id: string; date: string; description: string; category: string; amount: number; status: string; ownerId?: string; projectId?: string; budgetPosId?: string; url?: string; isTimeEntry?: boolean; hours?: number; userId?: string; }
interface BudgetItem { id: string; pos: string; description: string; qty: number; unit: string; unitPrice: number; option: number; total: number; }
interface BudgetGroup { id: string; pos: string; title: string; items: BudgetItem[]; }
interface BudgetVersion { id: string; name: string; groups: BudgetGroup[]; vatRate: number; status?: 'draft' | 'approved'; }

const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#374151', backgroundColor: '#ffffff' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 2, paddingBottom: 10, marginBottom: 20 },
  headerLeft: { flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000000', textTransform: 'uppercase', marginBottom: 8 },
  metaGrid: { flexDirection: 'row', gap: 20 },
  metaBlock: { flexDirection: 'column' },
  metaLabel: { fontSize: 8, color: '#6b7280', textTransform: 'uppercase' },
  metaValue: { fontSize: 12, color: '#000000', fontWeight: 'bold' },
  logo: { width: 120, height: 40, objectFit: 'contain' },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#d1d5db', paddingBottom: 5, marginBottom: 5 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingVertical: 6 },
  groupRow: { flexDirection: 'row', backgroundColor: '#f9fafb', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e5e7eb', paddingVertical: 8, marginTop: 10 },
  hrRow: { flexDirection: 'row', backgroundColor: '#fff7ed', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#fdba74', paddingVertical: 6, marginTop: 5 },
  col1: { width: '10%' },
  col2: { width: '40%', paddingRight: 10 },
  col3: { width: '10%', textAlign: 'right' },
  col4: { width: '10%', paddingLeft: 10 },
  col5: { width: '15%', textAlign: 'right' },
  col6: { width: '15%', textAlign: 'right' },
  textBold: { fontWeight: 'bold', color: '#000000' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 10 },
  footerText: { fontSize: 8, color: '#9ca3af' },
});

const FinancePDFDocument = ({ settings, activeTab, t, projectHeader, budgetGroups, approvedVersions, allTimeHours, allTimeHoursCost, displayLedger, getBudgetDetails, overviewTotalBudget, totalActualCostsIncludingHoursAllTime, totalBudget, vatRate, formatCHF, calculateGroupTotal, getAllTimeActualCostForGroup, getAllTimeActualCostForItem }: any) => {
  const title = activeTab === 'budget' ? t('budget_plan') : activeTab === 'control' ? t('payment_control') : t('cashflow');
  return (
    <Document>
      <Page size={settings.format} orientation={settings.orientation} style={pdfStyles.page}>
        <View style={[pdfStyles.headerContainer, { borderBottomColor: settings.accentColor }]} fixed>
          <View style={pdfStyles.headerLeft}>
            <Text style={pdfStyles.title}>{title}</Text>
            <View style={pdfStyles.metaGrid}>
              <View style={pdfStyles.metaBlock}><Text style={pdfStyles.metaLabel}>Projekt:</Text><Text style={pdfStyles.metaValue}>{projectHeader.project}</Text></View>
              <View style={pdfStyles.metaBlock}><Text style={pdfStyles.metaLabel}>Version:</Text><Text style={pdfStyles.metaValue}>{projectHeader.version}</Text></View>
              <View style={pdfStyles.metaBlock}><Text style={pdfStyles.metaLabel}>Datum:</Text><Text style={pdfStyles.metaValue}>{new Date(projectHeader.date).toLocaleDateString('de-CH')}</Text></View>
            </View>
          </View>
          {settings.logo && <PDFImage src={settings.logo} style={pdfStyles.logo} />}
        </View>

        {activeTab === 'budget' && (
          <View>
            <View style={pdfStyles.tableHeader} fixed>
              <Text style={[pdfStyles.col1, pdfStyles.textBold]}>{t('pos')}</Text>
              <Text style={[pdfStyles.col2, pdfStyles.textBold]}>{t('description')}</Text>
              <Text style={[pdfStyles.col3, pdfStyles.textBold]}>{t('qty')}</Text>
              <Text style={[pdfStyles.col4, pdfStyles.textBold]}>{t('unit')}</Text>
              <Text style={[pdfStyles.col5, pdfStyles.textBold]}>{t('unit_price')}</Text>
              <Text style={[pdfStyles.col6, pdfStyles.textBold]}>{t('total')}</Text>
            </View>
            {budgetGroups.map((group: any) => (
              <React.Fragment key={group.id}>
                <View style={pdfStyles.groupRow} wrap={false}>
                  <Text style={[pdfStyles.col1, pdfStyles.textBold, {color: settings.accentColor}]}>{group.pos}</Text>
                  <Text style={[pdfStyles.col2, pdfStyles.textBold, {color: settings.accentColor}]}>{group.title}</Text>
                  <Text style={pdfStyles.col3}></Text>
                  <Text style={pdfStyles.col4}></Text>
                  <Text style={pdfStyles.col5}></Text>
                  <Text style={[pdfStyles.col6, pdfStyles.textBold, {color: settings.accentColor}]}>{formatCHF(calculateGroupTotal(group))}</Text>
                </View>
                {group.items.map((item: any) => (
                  <View style={pdfStyles.tableRow} key={item.id} wrap={false}>
                    <Text style={[pdfStyles.col1, {fontSize: 8, color: '#6b7280'}]}>{item.pos}</Text>
                    <Text style={[pdfStyles.col2, pdfStyles.textBold]}>{item.description}</Text>
                    <Text style={pdfStyles.col3}>{item.qty}</Text>
                    <Text style={pdfStyles.col4}>{item.unit}</Text>
                    <Text style={pdfStyles.col5}>{formatCHF(item.unitPrice)}</Text>
                    <Text style={[pdfStyles.col6, pdfStyles.textBold]}>{formatCHF(item.total)}</Text>
                  </View>
                ))}
              </React.Fragment>
            ))}
            <View style={{ marginTop: 20, alignItems: 'flex-end' }} wrap={false}>
               <View style={{ flexDirection: 'row', width: 200, justifyContent: 'space-between', marginBottom: 5 }}>
                 <Text>{t('subtotal')}</Text><Text style={pdfStyles.textBold}>{formatCHF(totalBudget)}</Text>
               </View>
               <View style={{ flexDirection: 'row', width: 200, justifyContent: 'space-between', marginBottom: 5 }}>
                 <Text>{t('vat')} {vatRate}%</Text><Text style={pdfStyles.textBold}>{formatCHF(totalBudget * (vatRate/100))}</Text>
               </View>
               <View style={{ flexDirection: 'row', width: 200, justifyContent: 'space-between', borderTopWidth: 1, borderColor: '#d1d5db', paddingTop: 5, marginTop: 5 }}>
                 <Text style={[pdfStyles.textBold, {color: settings.accentColor, fontSize: 12}]}>{t('total_amount').toUpperCase()}</Text>
                 <Text style={[pdfStyles.textBold, {color: settings.accentColor, fontSize: 12}]}>{formatCHF(totalBudget * (1 + vatRate/100))}</Text>
               </View>
            </View>
          </View>
        )}

        {activeTab === 'control' && (
          <View>
            <View style={pdfStyles.tableHeader} fixed>
              <Text style={[pdfStyles.col1, pdfStyles.textBold]}>{t('pos')}</Text>
              <Text style={[pdfStyles.col2, pdfStyles.textBold]}>{t('description')}</Text>
              <Text style={[pdfStyles.col5, pdfStyles.textBold]}>{t('planned')}</Text>
              <Text style={[pdfStyles.col6, pdfStyles.textBold, {color: '#ef4444'}]}>{t('actual_costs')}</Text>
              <Text style={[pdfStyles.col6, pdfStyles.textBold]}>{t('variance')}</Text>
            </View>
            {approvedVersions.map((v: any) => (
              <React.Fragment key={v.id}>
                <View style={[{ backgroundColor: '#e5e7eb', paddingVertical: 5, marginTop: 5 }]} wrap={false}>
                   <Text style={{ fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase', paddingLeft: 5 }}>{t('budget_supplement')} {v.name}</Text>
                </View>
                {v.groups.map((g: any) => {
                  const plan = calculateGroupTotal(g);
                  const actual = getAllTimeActualCostForGroup(g);
                  const diff = plan - actual;
                  return (
                    <React.Fragment key={g.id}>
                      <View style={pdfStyles.groupRow} wrap={false}>
                        <Text style={[pdfStyles.col1, pdfStyles.textBold, {color: settings.accentColor}]}>{g.pos}</Text>
                        <Text style={[pdfStyles.col2, pdfStyles.textBold, {color: settings.accentColor}]}>{g.title}</Text>
                        <Text style={[pdfStyles.col5, pdfStyles.textBold]}>{formatCHF(plan)}</Text>
                        <Text style={[pdfStyles.col6, pdfStyles.textBold, {color: '#ef4444'}]}>{formatCHF(actual)}</Text>
                        <Text style={[pdfStyles.col6, pdfStyles.textBold, {color: diff < 0 ? '#ef4444' : '#10b981'}]}>{(diff >= 0 ? '+' : '')}{formatCHF(diff)}</Text>
                      </View>
                      {g.items.map((i: any) => {
                         const itemActual = getAllTimeActualCostForItem(i.id);
                         const itemDiff = i.total - itemActual;
                         return (
                           <View style={pdfStyles.tableRow} key={i.id} wrap={false}>
                             <Text style={[pdfStyles.col1, {fontSize: 8, color: '#6b7280'}]}>{i.pos}</Text>
                             <Text style={[pdfStyles.col2, pdfStyles.textBold]}>{i.description}</Text>
                             <Text style={pdfStyles.col5}>{formatCHF(i.total)}</Text>
                             <Text style={[pdfStyles.col6, {color: '#ef4444'}]}>{itemActual > 0 ? formatCHF(itemActual) : '-'}</Text>
                             <Text style={[pdfStyles.col6, pdfStyles.textBold, {color: itemDiff < 0 ? '#ef4444' : '#10b981'}]}>{(itemDiff >= 0 ? '+' : '')}{formatCHF(itemDiff)}</Text>
                           </View>
                         )
                      })}
                    </React.Fragment>
                  )
                })}
              </React.Fragment>
            ))}
            <View style={pdfStyles.hrRow} wrap={false}>
              <Text style={[pdfStyles.col1, pdfStyles.textBold, {color: '#ea580c'}]}>HR</Text>
              <Text style={[pdfStyles.col2, pdfStyles.textBold, {color: '#ea580c'}]}>{t('internal_hours_time_tracking')} ({allTimeHours} h)</Text>
              <Text style={pdfStyles.col5}>-</Text>
              <Text style={[pdfStyles.col6, pdfStyles.textBold, {color: '#ef4444'}]}>{formatCHF(allTimeHoursCost)}</Text>
              <Text style={[pdfStyles.col6, pdfStyles.textBold, {color: '#ef4444'}]}>-{formatCHF(allTimeHoursCost)}</Text>
            </View>
            <View style={{ marginTop: 20, alignItems: 'flex-end' }} wrap={false}>
               <View style={{ flexDirection: 'row', width: 350, justifyContent: 'space-between', borderTopWidth: 2, borderColor: '#9ca3af', paddingTop: 8, marginTop: 5 }}>
                 <Text style={[pdfStyles.textBold, { fontSize: 12}]}>{t('total_project_excl_vat')}</Text>
                 <View style={{ flexDirection: 'row', gap: 15 }}>
                    <Text style={[pdfStyles.textBold, { fontSize: 12}]}>{formatCHF(overviewTotalBudget)}</Text>
                    <Text style={[pdfStyles.textBold, { fontSize: 12, color: '#ef4444'}]}>{formatCHF(totalActualCostsIncludingHoursAllTime)}</Text>
                    <Text style={[pdfStyles.textBold, { fontSize: 12, color: (overviewTotalBudget - totalActualCostsIncludingHoursAllTime) < 0 ? '#ef4444' : '#10b981' }]}>
                      {((overviewTotalBudget - totalActualCostsIncludingHoursAllTime) >= 0 ? '+' : '')}{formatCHF(overviewTotalBudget - totalActualCostsIncludingHoursAllTime)}
                    </Text>
                 </View>
               </View>
            </View>
          </View>
        )}

        {activeTab === 'cashflow' && (
          <View>
            <View style={pdfStyles.tableHeader} fixed>
              <Text style={[pdfStyles.col1, pdfStyles.textBold, {width: '15%'}]}>{t('date')}</Text>
              <Text style={[pdfStyles.col2, pdfStyles.textBold, {width: '35%'}]}>{t('description')}</Text>
              <Text style={[pdfStyles.col5, pdfStyles.textBold, {width: '20%', textAlign: 'left'}]}>{t('budget_assignment')}</Text>
              <Text style={[pdfStyles.col4, pdfStyles.textBold, {textAlign: 'right'}]}>Haben</Text>
              <Text style={[pdfStyles.col4, pdfStyles.textBold, {textAlign: 'right'}]}>Soll</Text>
              <Text style={[pdfStyles.col4, pdfStyles.textBold, {textAlign: 'right'}]}>Saldo</Text>
            </View>
            {displayLedger.map((tx: any) => {
              const isQuote = tx.category === 'Offerte' || tx.category === 'Quote';
              const isTime = !!tx.isTimeEntry;
              const isRevenue = tx.category === 'Debitorenrechnung' || tx.category === 'Outgoing Invoice' || (!isQuote && !isTime && tx.amount > 0);
              const displayAmount = tx.amount === 0 ? 0 : Math.abs(tx.amount);
              const bdDetails = getBudgetDetails(tx.budgetPosId);
              const isBalanceNegative = 0 > tx.balance;

              return (
                <View style={pdfStyles.tableRow} key={tx.id} wrap={false}>
                  <Text style={[{width: '15%', color: '#6b7280'}]}>{tx.date}</Text>
                  <Text style={[{width: '35%'}, pdfStyles.textBold]}>{tx.description}</Text>
                  <Text style={[{width: '20%', color: '#6b7280'}]}>{bdDetails ? `${bdDetails.phase} - ${bdDetails.item}` : t('free_booking')}</Text>
                  <Text style={[{width: '10%', textAlign: 'right'}, pdfStyles.textBold, {color: '#10b981'}]}>{isQuote ? `(${formatCHF(displayAmount)})` : (isRevenue && displayAmount > 0 ? `+${formatCHF(displayAmount)}` : '')}</Text>
                  <Text style={[{width: '10%', textAlign: 'right'}, pdfStyles.textBold, {color: '#ef4444'}]}>{!isQuote && !isRevenue && displayAmount > 0 ? `-${formatCHF(displayAmount)}` : ''}</Text>
                  <Text style={[{width: '10%', textAlign: 'right'}, pdfStyles.textBold, {color: isQuote ? '#9ca3af' : (isBalanceNegative ? '#ef4444' : '#10b981')}]}>{isQuote ? '-' : formatCHF(tx.balance)}</Text>
                </View>
              )
            })}
          </View>
        )}

        <View style={pdfStyles.footer} fixed>
          <Text style={pdfStyles.footerText}>{settings.footerText}</Text>
          <Text style={pdfStyles.footerText} render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};

const ReceiptPDFDocument = ({ settings, incomingData, incomingReceipts, formatCHF, projectHeader, budgetDetails, receiptType }: any) => {
  const isExternal = incomingData.type === 'external';
  return (
    <Document>
      <Page size={settings.format} orientation={settings.orientation} style={pdfStyles.page}>
        <View style={[pdfStyles.headerContainer, { borderBottomColor: settings.accentColor }]} fixed>
          <View style={pdfStyles.headerLeft}>
            <Text style={[pdfStyles.title, { color: settings.accentColor }]}>BUCHUNG</Text>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase' }}>{receiptType === 'external_cost' ? 'EXTERNER BELEG' : 'SPESEN BELEG'}</Text>
          </View>
          <View style={{ textAlign: 'right', alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 9, color: '#6b7280', marginBottom: 2 }}>Datum: <Text style={{ color: '#000', fontWeight: 'bold' }}>{new Date(incomingData.date).toLocaleDateString('de-CH')}</Text></Text>
            <Text style={{ fontSize: 9, color: '#6b7280', marginBottom: 2 }}>Projekt: <Text style={{ color: '#000', fontWeight: 'bold' }}>{projectHeader.project}</Text></Text>
            {budgetDetails && <Text style={{ fontSize: 9, color: '#6b7280' }}>Zuweisung: <Text style={{ color: '#000', fontWeight: 'bold' }}>{budgetDetails.phase}</Text></Text>}
          </View>
        </View>

        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 5, marginBottom: 10 }}>
          <Text style={{ width: '40%', fontWeight: 'bold' }}>Firma / Kreditor</Text>
          <Text style={{ width: '40%', fontWeight: 'bold' }}>Beschreibung</Text>
          <Text style={{ width: '20%', fontWeight: 'bold', textAlign: 'right' }}>Betrag (CHF)</Text>
        </View>
        
        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 10 }}>
          <View style={{ width: '40%' }}>
            <Text style={{ backgroundColor: '#f3f4f6', color: '#4b5563', padding: 4, fontWeight: 'bold', fontSize: 8 }}>{incomingData.vendor || incomingData.company || 'Firma'}</Text>
            {isExternal && incomingData.firstName && <Text style={{ fontSize: 8, color: '#6b7280', marginTop: 4 }}>{incomingData.firstName} {incomingData.lastName}</Text>}
          </View>
          <View style={{ width: '40%' }}>
            <Text style={{ fontWeight: 'bold' }}>{incomingData.description || '-'}</Text>
            {budgetDetails && <Text style={{ fontSize: 8, color: '#6b7280', marginTop: 2 }}>Pos: {budgetDetails.item}</Text>}
          </View>
          <Text style={{ width: '20%', textAlign: 'right', fontWeight: 'bold', color: settings.accentColor, fontSize: 12 }}>{formatCHF(Number(incomingData.amount))}</Text>
        </View>

        {incomingReceipts.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: settings.accentColor, borderBottomWidth: 1, borderBottomColor: settings.accentColor, paddingBottom: 5, marginBottom: 10, textTransform: 'uppercase' }}>Original Beleg</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {incomingReceipts.map((url: string, i: number) => (
                <PDFImage key={i} src={url} style={{ width: 200, height: 200, objectFit: 'contain', backgroundColor: '#f9fafb', border: '1px solid #d1d5db', padding: 5, marginRight: 10, marginBottom: 10 }} />
              ))}
            </View>
          </View>
        )}

        <View style={pdfStyles.footer} fixed>
          <Text style={pdfStyles.footerText}>{settings.footerText}</Text>
          <Text style={pdfStyles.footerText} render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};

export default function Finance() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;
  const { theme } = useTheme();
  const functions = getFunctions(getApp(), 'europe-west1');
  const tooltipContentStyle = { backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff', borderColor: theme === 'dark' ? '#27272a' : '#e4e4e7', color: theme === 'dark' ? '#fafafa' : '#09090b', borderRadius: '8px' };
  
  const { activeProjectId, projects, projectMembers, timeEntries, addTimeEntry, isDemoMode, demoData } = useProject() as any;
  const { projectId: urlProjectId } = useParams<{ projectId: string }>();
  const currentProjectId = urlProjectId || activeProjectId;
  
  const activeProject = projects?.find((p: any) => p.id === currentProjectId);
  
  const currentMember = projectMembers?.find((m: any) => m.projectId === currentProjectId && m.userId === currentUser?.uid);
  const isReadOnly = currentMember ? (currentMember.projectRole === 'Viewer') : false;

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'control' | 'cashflow'>('overview');
  const [timeFilter, setTimeFilter] = useState<'all' | 'year' | 'month' | 'today'>('all');

  // --- DIE NEUE ROTATIONS LOGIK FÜR iOS & MOBILE ---
  const [isLandscapeMode, setIsLandscapeMode] = useState(false);
  const [isPortrait, setIsPortrait] = useState(
    typeof window !== 'undefined' ? window.matchMedia('(orientation: portrait)').matches : false
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(orientation: portrait)');
    const handleChange = (e: any) => setIsPortrait(e.matches);
    setIsPortrait(mediaQuery.matches);
    
    // 🔥 FIX FÜR MOBILE CRASH: Apple Safari Kompatibilität
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if ((mediaQuery as any).addListener) {
      (mediaQuery as any).addListener(handleChange);
    }
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else if ((mediaQuery as any).removeListener) {
        (mediaQuery as any).removeListener(handleChange);
      }
    };
  }, []);

  // Versucht nativ den Screen zu locken, wenn auf Tabellenansicht geklickt wird
  useEffect(() => {
    if (isLandscapeMode) {
      const lockScreen = async () => {
        try {
          const docEl = document.documentElement as any;
          if (docEl.requestFullscreen) await docEl.requestFullscreen();
          else if (docEl.webkitRequestFullscreen) await docEl.webkitRequestFullscreen();
          
          if (window.screen.orientation && 'lock' in window.screen.orientation) {
            await (window.screen.orientation as any).lock('landscape');
          }
        } catch (e) {
          // Fallback schlägt still fehl -> Nutzer muss manuell drehen (siehe Portal-Render-Logik unten)
        }
      };
      lockScreen();
    } else {
      const unlockScreen = async () => {
        try {
          if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
            if (document.exitFullscreen) await document.exitFullscreen();
            else if ((document as any).webkitExitFullscreen) await (document as any).webkitExitFullscreen();
          }
          if (window.screen.orientation && 'unlock' in window.screen.orientation) {
            window.screen.orientation.unlock();
          }
        } catch (e) { console.error('Unlock screen fail', e); }
      };
      unlockScreen();
    }
  }, [isLandscapeMode]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [projectHeader, setProjectHeader] = useState({ project: activeProject?.name || t('new_project'), client: '', date: new Date().toISOString().split('T')[0], version: 'v1.0' });
  const [includeOptions, setIncludeOptions] = useState(false);
  const [versions, setVersions] = useState<BudgetVersion[]>([{ id: 'v1', name: 'Variant 1', vatRate: 8.1, status: 'draft', groups: [{ id: 'g1', pos: '100', title: 'Phase', items: [] }] }]);
  const [activeVersionId, setActiveVersionId] = useState<string>('v1');
  
  const activeVersion = versions.find(v => v.id === activeVersionId) || versions[0];
  const approvedVersions = versions.filter(v => v.status === 'approved'); 
  const budgetGroups = activeVersion.groups;
  const vatRate = activeVersion.vatRate;

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false); 
  const [showReceiptStudio, setShowReceiptStudio] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [isPdfStudioOpen, setIsPdfStudioOpen] = useState(false);
  const [isReceiptPdfStudioOpen, setIsReceiptPdfStudioOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);

  const [receiptType, setReceiptType] = useState<'expense' | 'external_cost'>('expense');
  const [incomingReceipts, setIncomingReceipts] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [incomingData, setIncomingData] = useState({ type: 'internal', vendor: '', company: '', firstName: '', lastName: '', contactPerson: '', address: '', zipCity: '', phone: '', email: '', description: '', amount: '', date: new Date().toISOString().split('T')[0], budgetPosId: '', status: 'Offen' });
  const [timeData, setTimeData] = useState({ type: 'internal', userId: '', company: '', firstName: '', lastName: '', contactPerson: '', address: '', zipCity: '', phone: '', email: '', hours: 0, hourlyRate: 0, description: '', date: new Date().toISOString().split('T')[0] });
  const mobileCameraRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [opCostSessionId] = useState(() => Math.random().toString(36).substring(2, 15));
  const mobileUploadUrl = `${window.location.origin}/mobile-upload/extern/${opCostSessionId}`;

  // === MULTI-TENANT FILTERUNG ===
  useEffect(() => {
    // 🔥 DEMO-BRÜCKE: Lade Daten aus deinem Template!
    if (isDemoMode && demoData) {
      if (demoData.financeGroups) {
         setVersions([{ id: 'demo-v1', name: 'Originalbudget', vatRate: 8.1, status: 'approved', groups: demoData.financeGroups }]);
         setActiveVersionId('demo-v1');
         setProjectHeader(prev => ({ ...prev, project: demoData.project?.name || 'Demo Projekt', version: 'Originalbudget' }));
         
         const dummyTxs: any[] = [];
         let txId = 1;
         let totalPlan = 0;
         const today = new Date();
         
         demoData.financeGroups.forEach((g: any) => {
           g.items.forEach((item: any) => {
              const itemTotal = ((item.qty || item.quantity || 0) * (item.unitPrice || 0));
              totalPlan += itemTotal;
              if (txId % 2 !== 0) {
                const pastDate = new Date(today);
                pastDate.setDate(today.getDate() - (Math.random() * 30));
                dummyTxs.push({ id: `demo-tx-${txId}`, date: pastDate.toISOString().split('T')[0], description: `Teilrechnung: ${item.description}`, category: 'Kreditorenrechnung', amount: -(itemTotal * 0.65), status: 'Bezahlt', budgetPosId: item.id });
              }
              txId++;
           });
         });

         dummyTxs.push({ id: `demo-rev-1`, date: new Date().toISOString().split('T')[0], description: 'Akontozahlung Bauherr', category: 'Debitorenrechnung', amount: totalPlan * 0.7, status: 'Bezahlt' });
         setTransactions(dummyTxs);
      }
      setIsInitialLoad(false);
      return;
    }

    // --- REGULÄRER FIREBASE FETCH FÜR ECHTE USER ---
    if (!currentUser || !currentUser.companyId || !db || !currentProjectId) return;
    const q = query(collection(db, 'transactions'), where('companyId', '==', currentUser.companyId), where('projectId', '==', currentProjectId));
    const unsub = onSnapshot(q, (snap) => {
      const txs = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Transaction));
      txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(txs);
    }, (error) => console.log("Silent skip: Transactions fetch blocked"));
    
    getDoc(doc(db, 'financeData', `finance_${currentProjectId}`)).then(docSnap => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.versions) setVersions(data.versions);
        if (data.activeVersionId) setActiveVersionId(data.activeVersionId);
        if (data.projectHeader) setProjectHeader(data.projectHeader);
        if (data.includeOptions !== undefined) setIncludeOptions(data.includeOptions);
      }
      setIsInitialLoad(false);
    }).catch(e => console.log('Silent skip: getDoc blocked'));
    
    return () => unsub();
  }, [currentUser, currentProjectId, isDemoMode, demoData]);

  // 🔥 AUTO-SAVE BLOCKIEREN IM DEMO MODUS
  useEffect(() => {
    if (isDemoMode || isInitialLoad || !currentUser || !currentUser.companyId || !db || isReadOnly || !currentProjectId) return;
    const timeout = setTimeout(() => {
      setDoc(doc(db, 'financeData', `finance_${currentProjectId}`), { versions, activeVersionId, projectHeader, includeOptions, ownerId: currentUser.uid, companyId: currentUser.companyId, projectId: currentProjectId }, { merge: true }).catch(() => {});
    }, 1500);
  }, [versions, activeVersionId, projectHeader, includeOptions, currentProjectId, currentUser, db, isReadOnly, isDemoMode, isInitialLoad]);

  const [companyColor, setCompanyColor] = useState('#10b981');
  useEffect(() => {
    if (!db || !currentUser?.companyId) return;
    const fetchCompanyData = async () => {
      try {
        const snap = await getDoc(doc(db, 'companies', currentUser.companyId!));
        if (snap.exists() && snap.data().primaryColor) {
          setCompanyColor(snap.data().primaryColor);
        }
      } catch (e) { console.error('Error fetching company color:', e); }
    };
    fetchCompanyData();
  }, [db, currentUser?.companyId]);

  useEffect(() => {
    if (!db || !opCostSessionId || !showReceiptStudio) return;
    const q = query(collection(db, 'temp_receipts'), where('sessionId', '==', opCostSessionId));
    
    const unsub = onSnapshot(q, async (snapshot) => { 
      snapshot.docChanges().forEach(async (change) => { 
        if (change.type === 'added') { 
          const data = change.doc.data(); 
          const imgSrc = data.url || (data.base64Image ? `data:${data.mimeType || 'image/jpeg'};base64,${data.base64Image}` : null);
          if (imgSrc) setIncomingReceipts(prev => prev.includes(imgSrc) ? prev : [...prev, imgSrc]); 
          
          const extData = data.receiptData || data.extractedData;
          if (extData && (extData.total || extData.amount || extData.vendor || extData.merchant)) {
            applyAiData(extData);
            deleteDoc(doc(db, 'temp_receipts', change.doc.id)).catch(() => {}); 
            return;
          }
          if (imgSrc) {
            let base64ToProcess = data.base64Image;
            let mimeToProcess = data.mimeType || 'image/jpeg';
            if (!base64ToProcess && data.url) {
              try {
                const res = await fetch(data.url);
                const blob = await res.blob();
                mimeToProcess = blob.type;
                const base64Str = await new Promise<string>((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.readAsDataURL(blob);
                });
                base64ToProcess = base64Str.split(',')[1];
              } catch(e) { console.error('Fetch receipt fail', e); }
            }
            await processImageWithAI(base64ToProcess || null, data.url || null, mimeToProcess);
          }
          deleteDoc(doc(db, 'temp_receipts', change.doc.id)).catch(() => {}); 
        } 
      }); 
    }, (error) => console.log("Silent skip: Temp Receipts fetch blocked"));
    return () => unsub();
  }, [opCostSessionId, showReceiptStudio]);

  // 🔥 SICHERE BERECHNUNG MIT FALLBACK
  const calculateGroupTotal = (group: BudgetGroup) => {
    if (!group || !group.items) return 0;
    return group.items.reduce((sum, item) => sum + (Number(item.total) || (Number(item.qty || (item as any).quantity || 0) * Number(item.unitPrice || 0))) + (includeOptions ? (Number(item.option) || 0) : 0), 0);
  };

  // Wenn noch geladen wird, zeige 0 statt NaN
  const totalBudget = isInitialLoad ? 0 : budgetGroups.reduce((sum, group) => sum + calculateGroupTotal(group), 0);

  const getFilteredTransactions = () => {
    return transactions.filter(tx => {
      if (timeFilter === 'all') return true;
      const txDate = new Date(tx.date);
      const now = new Date();
      if (timeFilter === 'year') return txDate.getFullYear() === now.getFullYear();
      if (timeFilter === 'month') return txDate.getFullYear() === now.getFullYear() && txDate.getMonth() === now.getMonth();
      if (timeFilter === 'today') return tx.date === now.toISOString().split('T')[0];
      return true;
    });
  };

  const getFilteredTimeEntries = () => {
    const currentProjectTimeEntries = (timeEntries || []).filter((e: any) => e.projectId === currentProjectId);
    return currentProjectTimeEntries.filter((e: any) => {
      if (timeFilter === 'all') return true;
      const eDate = new Date(e.date);
      const now = new Date();
      if (timeFilter === 'year') return eDate.getFullYear() === now.getFullYear();
      if (timeFilter === 'month') return eDate.getFullYear() === now.getFullYear() && eDate.getMonth() === now.getMonth();
      if (timeFilter === 'today') return (e.date || '') === now.toISOString().split('T')[0];
      return true;
    });
  };

  const filteredTransactions = getFilteredTransactions();
  const filteredTimeEntries = getFilteredTimeEntries();

  const filteredHoursCost = filteredTimeEntries.reduce((sum: number, e: any) => sum + ((Number(e.hours) || 0) * (e.hourlyRate || 0)), 0);
  const filteredInvoiced = filteredTransactions.filter(tx => tx.category === 'Debitorenrechnung').reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const filteredExtSpent = filteredTransactions.filter(tx => tx.category === 'Kreditorenrechnung').reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const filteredSpent = filteredExtSpent + filteredHoursCost;
  const filteredProfit = filteredInvoiced - filteredSpent;

  const allTimeTimeEntries = (timeEntries || []).filter((e: any) => e.projectId === currentProjectId);
  const allTimeHoursCost = allTimeTimeEntries.reduce((sum: number, e: any) => sum + ((Number(e.hours) || 0) * (e.hourlyRate || 0)), 0);
  const allTimeHours = allTimeTimeEntries.reduce((sum: number, e: any) => sum + (Number(e.hours) || 0), 0);
  
  const getFilteredActualCostForItem = (itemId: string) => filteredTransactions.filter(tx => tx.budgetPosId === itemId && tx.category === 'Kreditorenrechnung').reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const getFilteredActualCostForGroup = (group: BudgetGroup) => group.items.reduce((sum, item) => sum + getFilteredActualCostForItem(item.id), 0);

  const getAllTimeActualCostForItem = (itemId: string) => transactions.filter(tx => tx.budgetPosId === itemId && tx.category === 'Kreditorenrechnung').reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const getAllTimeActualCostForGroup = (group: BudgetGroup) => group.items.reduce((sum, item) => sum + getAllTimeActualCostForItem(item.id), 0);

  const overviewTotalBudget = approvedVersions.length > 0 
    ? approvedVersions.reduce((sum, v) => sum + v.groups.reduce((s, g) => s + calculateGroupTotal(g), 0), 0)
    : totalBudget;

  const globalExtSpent = transactions.filter(tx => tx.category === 'Kreditorenrechnung').reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const globalSpent = globalExtSpent + allTimeHoursCost;
  const totalActualCostsIncludingHoursAllTime = approvedVersions.reduce((sum, v) => sum + v.groups.reduce((s, g) => s + getAllTimeActualCostForGroup(g), 0), 0) + allTimeHoursCost;
  const budgetRemaining = Math.max(0, overviewTotalBudget - filteredSpent); 
  
  const formatCHF = (val: number) => new Intl.NumberFormat('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

  const pieData = [
    { name: t('external_costs'), value: filteredExtSpent }, 
    { name: t('internal_hours_time_tracking'), value: filteredHoursCost }, 
    { name: t('remaining'), value: budgetRemaining > 0 ? budgetRemaining : 0 }
  ];
  const PIE_COLORS = ['#f87171', '#f97316', '#3b82f6']; 
  
  const activeChartGroups = approvedVersions.length > 0 ? approvedVersions.flatMap(v => v.groups) : budgetGroups;
  const chartData = activeChartGroups.map(g => ({ name: g.title.length > 15 ? g.title.substring(0, 15) + '...' : g.title, [t('planned')]: calculateGroupTotal(g), [t('actual_costs')]: getFilteredActualCostForGroup(g) }));

  const rawTxs = transactions.map(t => ({ ...t, isTimeEntry: false }));
  const rawTimes = allTimeTimeEntries.map((e: any) => ({
    id: e.id, date: e.date || new Date().toISOString().split('T')[0], description: e.description || 'Zeiterfassung', category: 'Interne Stunden',
    amount: -(Number(e.hours || 0) * Number(e.hourlyRate || 0)), status: 'Gebucht', isTimeEntry: true, hours: e.hours, userId: e.userId, budgetPosId: e.budgetPosId || ''
  }));
  const combinedLedgerAsc = [...rawTxs, ...rawTimes].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let runningBalance = 0;
  const allLedgerTransactions = combinedLedgerAsc.map(tx => { if (tx.category !== 'Offerte') runningBalance += tx.amount; return { ...tx, balance: runningBalance }; });
  
  const displayLedger = [...allLedgerTransactions].reverse().filter(tx => {
    if (timeFilter === 'all') return true;
    const txDate = new Date(tx.date); const now = new Date();
    if (timeFilter === 'year') return txDate.getFullYear() === now.getFullYear();
    if (timeFilter === 'month') return txDate.getFullYear() === now.getFullYear() && txDate.getMonth() === now.getMonth();
    if (timeFilter === 'today') return tx.date === now.toISOString().split('T')[0];
    return true;
  });

  const getBudgetDetails = (posId?: string) => {
    if (!posId) return null;
    for (const v of versions) {
      for (const g of v.groups) {
        const item = g.items.find(i => i.id === posId);
        if (item) return { phase: g.title, item: `${item.pos} ${item.description}`, versionName: v.name };
      }
    }
    return null;
  };

  const handleExportCSV = async () => {
    if (!currentUser || !currentUser.companyId) return;
    try {
      addToast('Bereite Export vor...', 'info');
      // Fetch Defects for current project
      let projectDefects: any[] = [];
      if (currentProjectId) {
        const defectsQuery = query(collection(db, 'defects'), where('companyId', '==', currentUser.companyId), where('projectId', '==', currentProjectId));
        const defectsSnap = await getDocs(defectsQuery);
        projectDefects = defectsSnap.docs.map(d => d.data());
      } else {
        const defectsQuery = query(collection(db, 'defects'), where('companyId', '==', currentUser.companyId));
        const defectsSnap = await getDocs(defectsQuery);
        projectDefects = defectsSnap.docs.map(d => d.data());
      }

      let csv = "Kategorie,Datum,Titel/Beschreibung,Betrag/Status\n";
      
      transactions.forEach((t: any) => {
        const date = t.date || (t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : '');
        const desc = (t.description || t.title || '').replace(/"/g, '""');
        csv += `"Finanzen","${date}","${desc}","${t.amount || 0}"\n`;
      });
      
      projectDefects.forEach((d: any) => {
        const date = d.createdAt ? new Date(d.createdAt).toISOString().split('T')[0] : '';
        const desc = (d.title || d.description || '').replace(/"/g, '""');
        csv += `"Mängel","${date}","${desc}","${d.status || ''}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `${activeProject?.name || 'Projekt'}_Export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addToast('Export erfolgreich', 'success');
    } catch (e) {
      console.error('Export error:', e);
      addToast('Fehler beim Export', 'error');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (isReadOnly) return;
    if (window.confirm(t('delete_confirm'))) {
      try { await deleteDoc(doc(db, 'transactions', id)); addToast(t('booking_deleted'), 'success'); } 
      catch (error) { addToast(t('delete_error'), 'error'); }
    }
  };

  const updateTransactionStatus = async (id: string, newStatus: string) => {
    if (isReadOnly) return;
    try { await updateDoc(doc(db, 'transactions', id), { status: newStatus }); addToast(t('status_updated'), 'success'); } 
    catch (e) { addToast(t('update_error'), 'error'); }
  };

  const handleCreateNewVersion = () => {
    const newId = `v${Date.now()}`;
    setVersions([...versions, { id: newId, name: t('new_variant'), vatRate: 8.1, status: 'draft', groups: [{ id: `g${Date.now()}`, pos: '100', title: t('new_phase'), items: [] }] }]);
    setActiveVersionId(newId);
    addToast(t('new_variant_created'), 'success');
  };

  const handleDuplicateVersion = () => {
    const newId = `v${Date.now()}`;
    setVersions([...versions, { ...activeVersion, id: newId, status: 'draft', name: `${activeVersion.name} (Kopie)` }]);
    setActiveVersionId(newId);
    addToast(t('variant_duplicated'), 'success');
  };

  const handleDeleteVersion = (id: string) => {
    if (versions.length <= 1) return addToast(t('min_one_variant'), 'error');
    if (versions.find(v => v.id === id)?.status === 'approved') return addToast(t('cant_delete_approved'), 'error');
    const newVersions = versions.filter(v => v.id !== id);
    setVersions(newVersions);
    if (activeVersionId === id) setActiveVersionId(newVersions[0].id);
    addToast(t('variant_deleted'), 'info');
  };

  const handleToggleApproveVersion = () => {
    if (currentUser?.role !== 'owner' && !currentUser?.canApproveBudget) {
      return addToast('Du hast keine Berechtigung, Budgets freizugeben.', 'error');
    }
    const isCurrentlyApproved = activeVersion.status === 'approved';
    const msg = isCurrentlyApproved ? t('revoke_confirm') : t('approve_confirm');
    if (window.confirm(msg)) {
      setVersions(prev => prev.map(v => v.id === activeVersionId ? { ...v, status: isCurrentlyApproved ? 'draft' : 'approved' } : v));
      addToast(isCurrentlyApproved ? t('approval_revoked') : t('budget_approved'), 'success');
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    setVersions(prev => prev.map(v => v.id === activeVersionId ? { ...v, groups: v.groups.filter(g => g.id !== groupId) } : v));
  };

  const handleBudgetChange = (groupId: string, itemId: string, field: keyof BudgetItem, value: string | number) => {
    if (isReadOnly) return;
    setVersions(prev => prev.map(v => v.id === activeVersionId ? {
      ...v, groups: v.groups.map(g => g.id !== groupId ? g : {
        ...g, items: g.items.map(i => {
          if (i.id !== itemId) return i;
          const updated = { ...i, [field]: value };
          if (['qty', 'unitPrice', 'unit'].includes(field)) {
            const qty = field === 'qty' ? Number(value) : i.qty;
            const price = field === 'unitPrice' ? Number(value) : i.unitPrice;
            const unit = field === 'unit' ? String(value) : i.unit;
            if (unit === 'Option') { updated.option = qty * price; updated.total = 0; } 
            else { updated.total = qty * price; updated.option = 0; }
          }
          return updated;
        })
      })
    } : v));
  };

  const applyAiData = (aiData: any) => {
    const vendorName = aiData.vendor || aiData.merchant || aiData.company || aiData.description || '';
    const rawAmount = aiData.total || aiData.amount || aiData.sum || '';
    const cleanAmount = rawAmount ? String(rawAmount).replace(/[^0-9.,]/g, '').replace(',', '.') : '';
    setIncomingData(prev => ({
      ...prev, amount: cleanAmount || prev.amount, vendor: vendorName || prev.vendor, company: vendorName || prev.company, description: vendorName ? `${vendorName} Beleg` : prev.description, date: aiData.date || prev.date
    }));
  };

  const processImageWithAI = async (base64Data: string | null, imageUrl: string | null, mimeType: string) => {
    setIsAnalyzingAI(true); addToast(t('analyzing_ai'), 'info');
    try {
      const analyzeReceipt = httpsCallable(functions, 'analyzeReceipt');
      const result = await analyzeReceipt({ base64Image: base64Data, imageUrl: imageUrl, mimeType });
      applyAiData(result.data); addToast(t('receipt_live_received'), 'success');
    } catch (error) { addToast(t('ai_failed'), 'error'); } finally { setIsAnalyzingAI(false); }
  };

  const handleLocalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = Array.from(e.target.files || []);
    if (!filesList.length || !currentUser) return;
    for (const file of filesList) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (reader.result) {
          const base64String = reader.result as string;
          setIncomingReceipts(prev => [...prev, base64String]);
          const base64Data = base64String.split(',')[1];
          await processImageWithAI(base64Data, null, file.type);
        }
      };
      reader.readAsDataURL(file);
    }
    if (mobileCameraRef.current) mobileCameraRef.current.value = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const ensureFolderLocal = async (folderName: string, docCategory: string) => {
    if (!currentUser || !currentUser.companyId || !currentProjectId) return '';
    const folderQ = query(collection(db, 'documents'), where('companyId', '==', currentUser.companyId), where('name', '==', folderName), where('isFolder', '==', true), where('projectId', '==', currentProjectId));
    const folderSnap = await getDocs(folderQ);
    if (!folderSnap.empty) return folderSnap.docs[0].id;
    const newFolderRef = await addDoc(collection(db, 'documents'), { name: folderName, isFolder: true, category: docCategory, ownerId: currentUser.uid, companyId: currentUser.companyId, projectId: currentProjectId, createdAt: new Date().toISOString() });
    return newFolderRef.id;
  };

  const saveDocumentToCloud = async (fileData: any, category: string, defaultStatus: string = 'Offen') => {
    if (!currentUser || !currentUser.companyId || !db || !currentProjectId) return false;
    try {
      let downloadUrl = fileData.url || '';
      if (fileData.file) {
         const storageRef = ref(storage, `${currentUser.companyId}/documents/${Date.now()}_${fileData.fileName}`);
         await uploadBytes(storageRef, fileData.file);
         downloadUrl = await getDownloadURL(storageRef);
      }
      const targetFolderId = await ensureFolderLocal('Finanzen', 'projects');
      const documentName = fileData.fileName || fileData.name || `Dokument_${Date.now()}.pdf`;
      const documentTotal = fileData.total !== undefined ? fileData.total : (fileData.amount || 0);
      await addDoc(collection(db, 'documents'), { name: documentName, size: fileData.size || '0 MB', type: 'application/pdf', url: downloadUrl, fileUrl: downloadUrl, folderId: targetFolderId, isFolder: false, ownerId: currentUser.uid, companyId: currentUser.companyId, projectId: currentProjectId, category: 'projects', uploadedBy: currentUser.uid, createdAt: new Date().toISOString(), uploadedAt: new Date().toISOString() });
      const displayCategory = category === 'Debitorenrechnung' ? t('invoice') : t('quote');
      await addDoc(collection(db, 'transactions'), { date: fileData.date || new Date().toISOString().split('T')[0], description: `${displayCategory}: ${documentName}`, category: category || 'Dokument', amount: documentTotal || 0, status: defaultStatus || 'Offen', ownerId: currentUser.uid, companyId: currentUser.companyId, projectId: currentProjectId, budgetPosId: fileData.budgetPosId || '', url: downloadUrl });
      return true;
    } catch (error) { return false; }
  };

  const handleSaveGeneratedInvoice = async (fileData: any) => {
    const success = await saveDocumentToCloud(fileData, 'Debitorenrechnung', 'Offen');
    if (success) { setShowInvoiceModal(false); addToast(t('invoice_saved'), 'success'); } else { addToast(t('save_error'), 'error'); }
  };

  const handleSaveGeneratedQuote = async (fileData: any) => {
    const success = await saveDocumentToCloud(fileData, 'Offerte', 'Draft');
    if (success) { setShowQuoteModal(false); addToast(t('quote_saved'), 'success'); } else { addToast(t('save_error'), 'error'); }
  };

  const handleSavePdfToCloud = async (blob: Blob) => {
    if (!currentUser || !currentUser.companyId) return;
    try {
      const fileName = `Finanzbericht_${Date.now()}.pdf`;
      const storageRef = ref(storage, `${currentUser.companyId}/pdf_exports/${fileName}`);
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      const targetFolderId = await ensureFolderLocal("Finanzen", "projects");
      await addDoc(collection(db, 'documents'), { name: fileName, url: downloadUrl, fileUrl: downloadUrl, projectId: currentProjectId, folderId: targetFolderId, category: 'projects', ownerId: currentUser.uid, companyId: currentUser.companyId, uploadedBy: currentUser.uid, type: 'application/pdf', size: formatBytes(blob.size), isFolder: false, createdAt: new Date().toISOString(), uploadedAt: new Date().toISOString(), date: new Date().toLocaleDateString('de-CH') });
      addToast('Erfolgreich exportiert', 'success');
      setIsPdfStudioOpen(false);
    } catch (e) { addToast('Fehler beim Speichern', 'error'); }
  };

  const handleSaveReceiptPdfToCloud = async (blob: Blob) => {
    if (!currentUser || !currentUser.companyId || !currentProjectId) return;
    setIsSubmitting(true);
    try {
      const fileName = `Buchung_${incomingData.vendor.replace(/\s/g,'_')}_${Date.now()}.pdf`;
      const storageRef = ref(storage, `${currentUser.companyId}/pdf_exports/${fileName}`);
      await uploadBytes(storageRef, blob);
      const finalPdfUrl = await getDownloadURL(storageRef);

      const uploadedUrls = [finalPdfUrl];
      for (let i = 0; i < incomingReceipts.length; i++) {
        if (incomingReceipts[i].startsWith('data:image')) {
          const fetchRes = await fetch(incomingReceipts[i]);
          const fileBlob = await fetchRes.blob();
          const imgRef = ref(storage, `${currentUser.companyId}/documents/Kreditoren_Beleg_${Date.now()}_${i}.png`);
          await uploadBytes(imgRef, fileBlob);
          const imgUrl = await getDownloadURL(imgRef);
          uploadedUrls.push(imgUrl);
        }
      }
      
      const isExternal = incomingData.type === 'external';
      const descPrefix = isExternal && incomingData.company ? `${incomingData.company} (${incomingData.firstName} ${incomingData.lastName})` : (incomingData.vendor || 'Firma');
      
      await addDoc(collection(db, 'transactions'), {
        date: incomingData.date || new Date().toISOString().split('T')[0], 
        description: `${descPrefix} - ${incomingData.description || 'Beleg'}`, 
        category: 'Kreditorenrechnung', amount: -Math.abs(Number(incomingData.amount) || 0), status: incomingData.status || 'Offen', projectId: currentProjectId, ownerId: currentUser.uid, companyId: currentUser.companyId, budgetPosId: incomingData.budgetPosId || '', receiptUrls: uploadedUrls
      });

      addToast(t('receipt_booked_success') || 'Erfolgreich verbucht', 'success'); 
      setIsReceiptPdfStudioOpen(false); setShowReceiptStudio(false); setIncomingReceipts([]);
    } catch (e) { addToast('Fehler', 'error'); } finally { setIsSubmitting(false); }
  };

  const handleTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault(); if (timeData.hours <= 0 || !currentProjectId) return;
    setIsSubmitting(true);
    try {
      if (typeof addTimeEntry === 'function') {
        const isExternal = timeData.type === 'external';
        const descPrefix = isExternal && timeData.company ? `[Extern: ${timeData.company}] ` : '';
        addTimeEntry({ userId: isExternal ? 'external_partner' : (timeData.userId || 'internal_team'), projectId: currentProjectId, date: timeData.date || new Date().toISOString().split('T')[0], hours: timeData.hours || 0, description: `${descPrefix}${timeData.description || 'Stunden'}`, hourlyRate: timeData.hourlyRate || 0, externalData: isExternal ? { company: timeData.company, firstName: timeData.firstName, lastName: timeData.lastName, contactPerson: timeData.contactPerson, address: timeData.address, zipCity: timeData.zipCity, phone: timeData.phone, email: timeData.email } : null });
        addToast(t('hours_booked_success') || 'Erfolgreich', 'success'); setShowTimeModal(false);
        setTimeData({ type: 'internal', userId: '', company: '', firstName: '', lastName: '', contactPerson: '', address: '', zipCity: '', phone: '', email: '', hours: 0, hourlyRate: 0, description: '', date: new Date().toISOString().split('T')[0] });
      } else { addToast('Fehler: Zeiterfassung noch nicht initialisiert.', 'error'); }
    } finally { setIsSubmitting(false); }
  };

  // 🔥 NEU: Der VOLLBILD-LANDSCAPE Handler für Smartphones 🔥
  if (isLandscapeMode) {
    // FALLBACK: Wenn das Handy hochkant (Portrait) ist, Overlay anzeigen, das zum Drehen auffordert.
    // iOS verhindert oft das Drehen via API. Wir zwingen den Nutzer visuell dazu.
    if (isPortrait) {
      return createPortal(
        <div style={{ zIndex: 999999 }} className="fixed inset-0 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95">
          <div className="bg-surface border border-border p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm">
            <RotateCw size={48} className="mb-6 text-accent-ai animate-[spin_3s_linear_infinite]" />
            <h2 className="text-xl font-bold mb-3 text-text-primary">Bitte Smartphone drehen</h2>
            <p className="text-sm text-text-muted mb-8 font-medium">Um die vollständige B2B-Tabellenansicht zu nutzen, drehe dein Gerät bitte ins Querformat (Landscape).</p>
            <button onClick={() => setIsLandscapeMode(false)} className="w-full py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl font-bold transition-colors">Abbrechen</button>
          </div>
        </div>,
        document.body
      );
    }

    // Wenn physisch im Landscape Modus, zeige die Tabelle im Vollbild:
    // HIGHLIGHT: zIndex 999999 als inline-style garantiert, dass nichts (kein Header) mehr überlappt.
    return createPortal(
      <div style={{ zIndex: 999999 }} className="fixed inset-0 bg-background text-text-primary p-0 lg:p-6 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        <div className="bg-surface lg:rounded-2xl border-0 lg:border border-border/50 p-4 lg:p-6 shadow-2xl flex-1 flex flex-col min-h-0 overflow-hidden w-full h-full">
           
           <div className="flex justify-between items-center mb-4 shrink-0">
             <h2 className="text-xl font-bold flex items-center gap-2 text-accent-ai"><RotateCw size={20}/> Tabellenansicht</h2>
             <button onClick={() => setIsLandscapeMode(false)} className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors font-bold flex items-center gap-2">
               <X size={18}/> <span className="hidden sm:inline">Schließen</span>
             </button>
           </div>
           
           <div className="flex-1 overflow-auto custom-scrollbar -mx-4 px-4 lg:-mx-6 lg:px-6">
             <div className="min-w-[1000px] pb-8">
               
               {activeTab === 'budget' && (
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="text-xs uppercase tracking-wider text-text-muted border-b border-border/50">
                      <tr>
                        <th className="px-4 py-3 w-16">{t('pos')}</th>
                        <th className="px-4 py-3">{t('description')}</th>
                        <th className="px-4 py-3 text-right w-24">{t('qty')}</th>
                        <th className="px-4 py-3 w-24">{t('unit')}</th>
                        <th className="px-4 py-3 text-right w-24">{t('unit_price')}</th>
                        {includeOptions && <th className="px-4 py-3 text-right w-24 text-accent-ai">Option</th>}
                        <th className="px-4 py-3 text-right w-36 text-blue-400">{t('total')} (CHF)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {budgetGroups.map(group => {
                        const groupPlanTotal = calculateGroupTotal(group);
                        return (
                        <React.Fragment key={group.id}>
                          <tr className="bg-blue-500/10 border-y border-blue-500/20 group relative">
                            <td className="px-4 py-3 font-bold text-blue-400">{group.pos}</td>
                            <td className="px-4 py-3 font-bold text-blue-400" colSpan={includeOptions ? 5 : 4}>
                              <input className="bg-transparent text-blue-400 border-none outline-none w-full font-bold" value={group.title} onChange={e => setVersions(versions.map(v => v.id === activeVersionId ? {...v, groups: v.groups.map(g => g.id === group.id ? {...g, title: e.target.value} : g)} : v))} disabled={activeVersion.status === 'approved'} />
                            </td>
                            <td className="px-4 py-3 font-bold text-right text-blue-400 relative">
                              {formatCHF(groupPlanTotal)}
                              {!isReadOnly && activeVersion.status !== 'approved' && (
                                <button onClick={() => handleDeleteGroup(group.id)} className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover:opacity-100 p-1 no-print">
                                  <Trash2 size={16}/>
                                </button>
                              )}
                            </td>
                          </tr>
                          {group.items.map(item => (
                            <tr key={item.id} className="hover:bg-white/5 transition-colors group/row">
                              <td className="px-4 py-2 text-xs text-text-muted font-medium">{item.pos}</td>
                              <td className="px-4 py-2">
                                <input value={item.description} onChange={e => handleBudgetChange(group.id, item.id, 'description', e.target.value)} className="w-full bg-transparent outline-none focus:border-b focus:border-accent-ai/50 py-1 font-medium text-text-primary" disabled={activeVersion.status === 'approved'} placeholder={t('description')} />
                              </td>
                              <td className="px-4 py-2 text-right">
                                <input type="number" value={item.qty || ''} onChange={e => handleBudgetChange(group.id, item.id, 'qty', e.target.value)} className={cn(numberInputClass, "font-medium text-text-primary")} disabled={activeVersion.status === 'approved'} />
                              </td>
                              <td className="px-4 py-2 relative">
                                <select value={item.unit} onChange={e => handleBudgetChange(group.id, item.id, 'unit', e.target.value)} className="bg-transparent text-text-primary outline-none w-full appearance-none cursor-pointer font-medium" disabled={activeVersion.status === 'approved'}>
                                  <option className="bg-surface">Std.</option>
                                  <option className="bg-surface">Stk.</option>
                                  <option className="bg-surface">Pauschal</option>
                                  <option className="bg-surface">m2</option>
                                  <option className="bg-surface font-bold text-accent-ai">Option</option>
                                </select>
                              </td>
                              <td className="px-4 py-2 text-right">
                                <input type="number" value={item.unitPrice || ''} onChange={e => handleBudgetChange(group.id, item.id, 'unitPrice', e.target.value)} className={cn(numberInputClass, "font-medium text-text-primary")} disabled={activeVersion.status === 'approved'} />
                              </td>
                              {includeOptions && (
                                <td className="px-4 py-2 text-right bg-accent-ai/5">
                                  <span className={item.option > 0 ? "text-accent-ai font-bold" : "text-text-muted font-medium"}>{item.option > 0 ? formatCHF(item.option) : '-'}</span>
                                </td>
                              )}
                              <td className="px-4 py-2 text-right font-bold relative text-text-primary">
                                <span className={item.option > 0 ? "text-accent-ai" : ""}>{formatCHF(item.total + (includeOptions ? item.option : 0))}</span>
                                {!isReadOnly && activeVersion.status !== 'approved' && (
                                  <button onClick={() => setVersions(versions.map(v => v.id === activeVersionId ? {...v, groups: v.groups.map(g => g.id === group.id ? {...g, items: g.items.filter(i => i.id !== item.id)} : g)} : v))} className="absolute right-1 top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover/row:opacity-100 p-1 no-print">
                                    <X size={14}/>
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                          {!isReadOnly && activeVersion.status !== 'approved' && (
                            <tr className="no-print">
                              <td colSpan={includeOptions ? 7 : 6} className="px-4 py-3 bg-background/30">
                                <button onClick={() => setVersions(versions.map(v => v.id === activeVersionId ? {...v, groups: v.groups.map(g => g.id === group.id ? {...g, items: [...g.items, { id: `i${Date.now()}`, pos: `${g.pos.substring(0,1)}0${g.items.length + 1}`, description: '', qty: 1, unit: 'Stk.', unitPrice: 0, option: 0, total: 0 }]} : g)} : v))} className="text-xs font-bold flex items-center gap-1 text-accent-ai hover:underline">
                                  <Plus size={14}/> {t('add_position')}
                                </button>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      )})}
                      {!isReadOnly && activeVersion.status !== 'approved' && (
                        <tr className="no-print">
                          <td colSpan={includeOptions ? 7 : 6} className="px-4 py-6">
                            <button onClick={() => setVersions(versions.map(v => v.id === activeVersionId ? {...v, groups: [...v.groups, { id: `g${Date.now()}`, pos: `${(v.groups.length + 1)}00`, title: t('new_phase'), items: [] }]} : v))} className="w-full py-3 border border-dashed border-accent-ai/30 text-accent-ai rounded-lg font-bold hover:bg-accent-ai/5 flex justify-center items-center gap-2 transition-colors">
                              <Plus size={18} /> {t('new_phase')}
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-background border-t-2 border-border/50">
                        <td colSpan={4} className="px-4 py-4"></td>
                        <td className="px-4 py-4 text-right text-xs uppercase font-bold text-text-muted whitespace-nowrap">{t('subtotal')}</td>
                        {includeOptions && <td className="px-4 py-4 text-right font-bold text-sm text-accent-ai whitespace-nowrap">{formatCHF(budgetGroups.reduce((sum, group) => sum + group.items.reduce((s, item) => s + item.option, 0), 0))}</td>}
                        <td className="px-4 py-4 text-right font-bold text-sm text-text-primary whitespace-nowrap">{formatCHF(totalBudget)}</td>
                      </tr>
                      <tr className="bg-background border-b border-border/50">
                        <td colSpan={4} className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-right text-xs uppercase font-semibold text-text-muted flex justify-end items-center gap-2 whitespace-nowrap">
                          {t('vat')} 
                          <input type="number" value={vatRate} onChange={e => setVersions(versions.map(v => v.id === activeVersionId ? {...v, vatRate: Number(e.target.value)} : v))} className={cn(numberInputClass, "font-medium w-16 px-2 py-1 rounded border border-border/50 bg-surface outline-none text-text-primary")} disabled={activeVersion.status === 'approved'} />%
                        </td>
                        {includeOptions && <td></td>}
                        <td className="px-4 py-3 text-right font-medium text-sm text-text-muted whitespace-nowrap">{formatCHF(totalBudget * (vatRate/100))}</td>
                      </tr>
                      <tr className="bg-surface border-b-2 border-border">
                        <td colSpan={4} className="px-4 py-5"></td>
                        <td className="px-4 py-5 text-right font-bold text-sm uppercase text-text-primary whitespace-nowrap">{t('total_amount')}</td>
                        {includeOptions && <td></td>}
                        <td className="px-4 py-5 text-right font-bold text-sm text-blue-400 whitespace-nowrap">{formatCHF(totalBudget * (1 + vatRate/100))}</td>
                      </tr>
                    </tfoot>
                  </table>
               )}

               {activeTab === 'control' && (
                 <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-surface border-b border-border/50">
                      <tr>
                        <th className="px-4 py-3 w-16 text-text-muted uppercase tracking-wider">{t('pos')}</th>
                        <th className="px-4 py-3 text-text-muted uppercase tracking-wider min-w-[200px]">{t('description')}</th>
                        <th className="px-4 py-3 text-right text-text-muted uppercase tracking-wider w-32">{t('planned')}</th>
                        <th className="px-4 py-3 text-right text-red-500 uppercase tracking-wider w-32">{t('actual_costs')}</th>
                        <th className="px-4 py-3 text-right text-text-muted uppercase tracking-wider w-32">{t('variance')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {approvedVersions.map((version) => (
                        <React.Fragment key={version.id}>
                          <tr className="bg-accent-ai/5">
                            <td colSpan={5} className="px-4 py-2 font-bold text-xs uppercase text-accent-ai tracking-widest">{t('budget_supplement')} {version.name}</td>
                          </tr>
                          {version.groups.map(group => {
                            const plan = calculateGroupTotal(group);
                            const actual = getAllTimeActualCostForGroup(group);
                            const diff = plan - actual;
                            return (
                              <React.Fragment key={group.id}>
                                <tr className="bg-surface/50 border-t border-border/50">
                                  <td className="px-4 py-3 font-bold text-text-primary">{group.pos}</td>
                                  <td className="px-4 py-3 font-bold text-text-primary">{group.title}</td>
                                  <td className="px-4 py-3 font-bold text-right text-text-primary">{formatCHF(plan)}</td>
                                  <td className="px-4 py-3 font-bold text-right text-red-500">{formatCHF(actual)}</td>
                                  <td className={cn("px-4 py-3 font-bold text-right", diff < 0 ? "text-red-500" : "text-emerald-500")}>
                                    {diff >= 0 ? '+' : ''}{formatCHF(diff)}
                                  </td>
                                </tr>
                                {group.items.map(item => {
                                  const itemActual = getAllTimeActualCostForItem(item.id);
                                  const itemDiff = item.total - itemActual;
                                  return (
                                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                      <td className="px-4 py-2 text-xs text-text-muted font-medium">{item.pos}</td>
                                      <td className="px-4 py-2 text-text-primary font-medium">{item.description}</td>
                                      <td className="px-4 py-2 text-right text-text-primary">{formatCHF(item.total)}</td>
                                      <td className="px-4 py-2 text-right text-red-500">{itemActual > 0 ? formatCHF(itemActual) : '-'}</td>
                                      <td className={cn("px-4 py-2 text-right font-medium", itemDiff < 0 ? "text-red-500" : "text-emerald-500")}>
                                        {itemDiff >= 0 ? '+' : ''}{formatCHF(itemDiff)}
                                      </td>
                                    </tr>
                                  )
                                })}
                              </React.Fragment>
                            )
                          })}
                        </React.Fragment>
                      ))}
                      <tr className="bg-orange-500/10 border-y-2 border-orange-500/20">
                        <td className="px-4 py-3 font-bold text-orange-500">HR</td>
                        <td className="px-4 py-3 font-bold text-orange-500">{t('internal_hours_time_tracking')} ({allTimeHours} h)</td>
                        <td className="px-4 py-3 font-bold text-right text-orange-500">-</td>
                        <td className="px-4 py-3 font-bold text-right text-red-500">{formatCHF(allTimeHoursCost)}</td>
                        <td className="px-4 py-3 font-bold text-right text-red-500">-{formatCHF(allTimeHoursCost)}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="bg-surface border-t-2 border-border/50">
                        <td colSpan={2} className="px-4 py-5 text-right font-black uppercase tracking-wider text-text-primary">{t('total_project_excl_vat')}</td>
                        <td className="px-4 py-5 text-right font-black text-text-primary">{formatCHF(overviewTotalBudget)}</td>
                        <td className="px-4 py-5 text-right font-black text-red-500">{formatCHF(totalActualCostsIncludingHoursAllTime)}</td>
                        <td className={cn("px-4 py-5 text-right font-black", (overviewTotalBudget - totalActualCostsIncludingHoursAllTime) < 0 ? "text-red-500" : "text-emerald-500")}>
                          {((overviewTotalBudget - totalActualCostsIncludingHoursAllTime) >= 0 ? '+' : '')}{formatCHF(overviewTotalBudget - totalActualCostsIncludingHoursAllTime)}
                        </td>
                      </tr>
                    </tfoot>
                 </table>
               )}

               {activeTab === 'cashflow' && (
                 <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-surface border-b border-border/50">
                      <tr>
                        <th className="px-4 py-3 text-text-muted uppercase tracking-wider w-32">{t('date')}</th>
                        <th className="px-4 py-3 text-text-muted uppercase tracking-wider min-w-[200px]">{t('description')}</th>
                        <th className="px-4 py-3 text-text-muted uppercase tracking-wider w-48">{t('budget_assignment')}</th>
                        <th className="px-4 py-3 text-right text-text-muted uppercase tracking-wider w-32">{t('credit_revenue')}</th>
                        <th className="px-4 py-3 text-right text-text-muted uppercase tracking-wider w-32">{t('debit_costs')}</th>
                        <th className="px-4 py-3 text-right text-text-muted uppercase tracking-wider w-32">{t('balance_profit')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {displayLedger.length === 0 && (
                        <tr><td colSpan={6} className="px-4 py-8 text-center text-text-muted italic">{t('no_bookings_period')}</td></tr>
                      )}
                      {displayLedger.map((tx) => {
                        const isQuote = tx.category === 'Offerte' || tx.category === 'Quote';
                        const isTime = !!tx.isTimeEntry;
                        const isRevenue = tx.category === 'Debitorenrechnung' || tx.category === 'Outgoing Invoice' || (!isQuote && !isTime && tx.amount > 0);
                        const displayAmount = tx.amount === 0 ? 0 : Math.abs(tx.amount);
                        const bdDetails = getBudgetDetails(tx.budgetPosId);
                        const isBalanceNegative = 0 > tx.balance;

                        return (
                          <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-4 py-3 text-text-muted font-medium flex items-center gap-2">
                               <button onClick={() => handleDeleteTransaction(tx.id)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500/10 p-1 rounded transition-all"><Trash2 size={14}/></button>
                               {tx.date}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-text-primary">{tx.description}</span>
                                {tx.url && <a href={tx.url} target="_blank" rel="noopener noreferrer" className="text-accent-ai hover:underline p-1 bg-accent-ai/10 rounded"><FileText size={14}/></a>}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-text-muted font-medium">
                               {bdDetails ? <div className="flex flex-col"><span>{bdDetails.phase}</span><span className="text-text-primary font-bold truncate max-w-[150px]">{bdDetails.item}</span></div> : <span className="italic opacity-50">{t('free_booking')}</span>}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-emerald-500">
                              {isQuote ? <span className="text-text-muted italic">({formatCHF(displayAmount)})</span> : (isRevenue && displayAmount > 0 ? `+ ${formatCHF(displayAmount)}` : '')}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-red-500">
                              {!isQuote && !isRevenue && displayAmount > 0 ? `- ${formatCHF(displayAmount)}` : ''}
                            </td>
                            <td className={cn("px-4 py-3 text-right font-bold", isQuote ? "text-text-muted" : (isBalanceNegative ? "text-red-500" : "text-emerald-500"))}>
                              {isQuote ? '-' : formatCHF(tx.balance)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
               )}
             </div>
           </div>
        </div>
      </div>,
      document.body
    );
  }

  // --- NORMALE ANSICHT WIE BISHER ---

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col min-h-0 bg-background text-text-primary">
      <header className="flex flex-col gap-4 shrink-0 z-40 px-4 sm:px-0 pt-4 sm:pt-0 pb-4 border-b border-border/50 sm:border-none bg-surface/50 sm:bg-transparent">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-start justify-between w-full xl:w-auto">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                <DollarSign className="text-accent-ai" size={24} /> {t('finance_budget')}
              </h1>
              <p className="text-sm text-text-muted mt-1 font-medium">{projectHeader.project}</p>
            </div>
            {(activeTab === 'budget' || activeTab === 'cashflow' || activeTab === 'control') && (
               <button onClick={() => setIsLandscapeMode(true)} className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg font-bold shadow-sm active:scale-95 transition-transform">
                  <RotateCw size={14}/> <span className="text-xs">{t('rotate')}</span>
               </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
            <div className="grid grid-cols-4 sm:flex gap-2 w-full sm:w-auto shrink-0">
              <button onClick={() => setShowTimeModal(true)} className="flex-1 sm:flex-none flex items-center justify-center p-2.5 sm:px-4 sm:py-2 bg-surface border border-border/50 rounded-lg text-sm font-bold hover:bg-white/5 hover:text-orange-400 transition-colors shadow-sm"><Clock size={16} /> <span className="hidden sm:inline ml-2">{t('book_hours')}</span></button>
              <button onClick={() => setShowQuoteModal(true)} className="flex-1 sm:flex-none flex items-center justify-center p-2.5 sm:px-4 sm:py-2 bg-surface border border-border/50 rounded-lg text-sm font-bold hover:bg-white/5 hover:text-accent-ai transition-colors shadow-sm"><FileSignature size={16} /> <span className="hidden sm:inline ml-2">{t('quote')}</span></button>
              <button onClick={() => { setReceiptType('expense'); setShowReceiptStudio(true); }} className="flex-1 sm:flex-none flex items-center justify-center p-2.5 sm:px-4 sm:py-2 bg-surface border border-border/50 rounded-lg text-sm font-bold hover:bg-white/5 hover:text-red-400 transition-colors shadow-sm"><Receipt size={16} /> <span className="hidden sm:inline ml-2">{t('book_receipt')}</span></button>
              <button onClick={() => setShowInvoiceModal(true)} className="tour-finance-invoices flex-1 sm:flex-none flex items-center justify-center p-2.5 sm:px-4 sm:py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-bold hover:bg-emerald-500/20 transition-colors shadow-sm"><Send size={16} /> <span className="hidden sm:inline ml-2">{t('invoice')}</span></button>
            </div>
            <div className="hidden lg:block w-px h-6 bg-border/50 mx-1"></div>
            <button onClick={handleExportCSV} className="flex-1 sm:flex-none flex items-center justify-center p-2.5 sm:px-4 sm:py-2 bg-surface border border-border/50 text-text-primary rounded-lg text-sm font-bold hover:bg-white/5 transition-colors shadow-sm items-center gap-2 h-[42px] shrink-0">
               <Download size={16} /> <span className="hidden lg:inline">CSV Export</span>
            </button>
            {activeTab !== 'overview' && (
              <button onClick={() => setIsPdfStudioOpen(true)} className="hidden lg:flex px-4 py-2 bg-surface border border-border/50 text-text-primary rounded-lg text-sm font-bold hover:bg-white/5 transition-colors shadow-sm items-center gap-2 h-[42px] cursor-pointer shrink-0">
                 <FileText size={16} /> <span>PDF Studio</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-3 w-full">
           <div className="flex bg-surface border border-border/50 rounded-lg p-1 shadow-sm overflow-x-auto hide-scrollbar w-full lg:w-auto h-[42px] shrink-0">
              <button onClick={() => setActiveTab('overview')} className={cn("flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap", activeTab === 'overview' ? "bg-accent-ai/10 text-accent-ai shadow-sm" : "text-text-muted hover:text-text-primary")}><PieChartIcon size={16} />{t('overview')}</button>
              <button onClick={() => setActiveTab('budget')} className={cn("tour-finance-budget flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap", activeTab === 'budget' ? "bg-accent-ai/10 text-accent-ai shadow-sm" : "text-text-muted hover:text-text-primary")}><Calculator size={16} />{t('budget_plan')}</button>
              <button onClick={() => setActiveTab('control')} className={cn("flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 relative whitespace-nowrap", activeTab === 'control' ? "bg-accent-ai/10 text-accent-ai shadow-sm" : "text-text-muted hover:text-text-primary")}>
                <ClipboardList size={16} /> {t('payment_control')}
                {approvedVersions.length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"></span>}
              </button>
              <button onClick={() => setActiveTab('cashflow')} className={cn("flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap", activeTab === 'cashflow' ? "bg-accent-ai/10 text-accent-ai shadow-sm" : "text-text-muted hover:text-text-primary")}><DollarSign size={16} />{t('cashflow')}</button>
           </div>
           
           <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto hide-scrollbar pb-1 lg:pb-0">
             {(activeTab === 'overview' || activeTab === 'cashflow') && (
               <div className="flex items-center bg-surface border border-border/50 rounded-lg px-3 h-[42px] shrink-0">
                 <CalendarDays size={16} className="text-text-muted mr-2" />
                 <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value as any)} className="bg-transparent text-sm font-bold text-text-primary focus:outline-none cursor-pointer appearance-none outline-none">
                   <option value="all" className="bg-surface">{t('all_time')}</option>
                   <option value="year" className="bg-surface">{t('this_year')}</option>
                   <option value="month" className="bg-surface">{t('this_month')}</option>
                   <option value="today" className="bg-surface">{t('today')}</option>
                 </select>
               </div>
             )}

             {activeTab === 'budget' && (
               <div className="flex items-center bg-surface border border-border/50 rounded-lg px-2 h-[42px] shrink-0">
                  <select value={activeVersionId} onChange={(e) => setActiveVersionId(e.target.value)} className="bg-transparent text-sm font-bold focus:outline-none px-2 py-1 cursor-pointer outline-none w-28 sm:w-32 truncate shrink-0 appearance-none">
                    {versions.map(v => <option key={v.id} value={v.id} className={cn("bg-surface text-text-primary", v.status === 'approved' ? "font-bold text-emerald-400" : "")}>{v.name} {v.status === 'approved' ? ` (${t('approved')})` : ''}</option>)}
                  </select>
                  <div className="w-px h-4 bg-border mx-1"></div>
                  {!isReadOnly && (currentUser?.role === 'owner' || currentUser?.canApproveBudget) && (
                    <button onClick={handleToggleApproveVersion} className={cn("p-1 px-2 rounded text-xs font-bold transition-colors border mr-1 whitespace-nowrap", activeVersion.status === 'approved' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "hover:bg-white/5 text-text-muted border-border/50")} title={t('approve_revoke')}>
                      {activeVersion.status === 'approved' ? t('approved') : t('approve')}
                    </button>
                  )}
                  <button onClick={handleCreateNewVersion} className="p-1 hover:text-emerald-400 text-text-muted transition-colors shrink-0" title={t('new_variant')}><Plus size={16} /></button>
                  <button onClick={handleDuplicateVersion} className="p-1 hover:text-accent-ai text-text-muted transition-colors shrink-0" title={t('duplicate_variant')}><Copy size={14} /></button>
                  <button onClick={() => handleDeleteVersion(activeVersionId)} className="p-1 hover:text-red-500 text-text-muted transition-colors shrink-0" title={t('delete_variant')}><Trash2 size={14} /></button>
               </div>
             )}
           </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-0 pb-24 lg:pb-0 relative z-10">
        
        {activeTab === 'overview' && (
          <div className="space-y-6 pt-4 lg:pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
                <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">{t('total_budget')}</h3>
                <p className="text-2xl font-bold text-text-primary font-medium">CHF {formatCHF(overviewTotalBudget)}</p>
              </div>
              <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
                <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 flex items-center gap-2">
                  <ArrowUpRight className="text-emerald-400" size={14}/> {t('revenue')}
                </h3>
                <p className="text-2xl font-bold text-emerald-400 font-medium">CHF {formatCHF(filteredInvoiced)}</p>
              </div>
              <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
                <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 flex items-center gap-2">
                  <ArrowDownRight className="text-red-400" size={14}/> {t('costs')}
                </h3>
                <p className="text-2xl font-bold text-red-400 font-medium">CHF {formatCHF(filteredSpent)}</p>
              </div>
              <div className="tour-finance-profit bg-gradient-to-br from-surface to-accent-ai/5 border border-border rounded-xl p-5 shadow-sm">
                <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">{t('project_profit')}</h3>
                <p className={cn("text-2xl font-bold font-medium", 0 > filteredProfit ? "text-red-500" : "text-emerald-400")}>
                  CHF {formatCHF(filteredProfit)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-surface border border-border rounded-xl p-6 flex flex-col items-center justify-center">
                <h3 className="text-sm font-semibold w-full text-left mb-2">{t('budget_utilization')}</h3>
                <div className="h-64 w-full relative">
                  {overviewTotalBudget > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                          {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                        </Pie>
                        <RechartsTooltip contentStyle={tooltipContentStyle} formatter={(value: number) => `CHF ${formatCHF(value)}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted text-sm">{t('no_budget_present')}</div>
                  )}
                  {overviewTotalBudget > 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-bold text-text-primary">{Math.round((filteredSpent / overviewTotalBudget) * 100)}%</span>
                      <span className="text-[10px] uppercase tracking-widest text-text-muted">{t('spent')}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6 flex flex-col min-h-[380px]">
                <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
                  <TrendingUp className="text-accent-ai" size={18}/> {t('planned_vs_actual')}
                </h3>
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#27272a" : "#e4e4e7"} vertical={false} />
                      <XAxis dataKey="name" stroke="#a1a1aa" fontSize={10} tickMargin={10} />
                      <YAxis stroke="#a1a1aa" fontSize={10} tickFormatter={(value) => `CHF ${value.toLocaleString()}`} />
                      <RechartsTooltip cursor={{fill: theme === 'dark' ? '#27272a' : '#f4f4f5'}} contentStyle={tooltipContentStyle} />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                      <Bar dataKey={t('planned')} fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey={t('actual_costs')} fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 🔥 MOBILE PORTRAIT VIEW (KACHELN FÜR SMARTPHONE) 🔥 */}
        {/* ========================================================= */}
        {activeTab === 'budget' && (
          <div className="lg:hidden space-y-6 pb-6 pt-4">
            
            {/* Header Karte Mobile */}
            <div className="bg-surface border border-border/50 rounded-xl p-4 space-y-4 shadow-sm">
              <input className="text-xl font-extrabold bg-transparent outline-none w-full border-b border-border/50 focus:border-accent-ai/50 text-text-primary pb-2" value={projectHeader.project} onChange={e => setProjectHeader({...projectHeader, project: e.target.value})} placeholder={t('project')} disabled={activeVersion.status === 'approved'} />
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-border/30 pb-2">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('date')}</span>
                  <input type="date" value={projectHeader.date} onChange={e => setProjectHeader({...projectHeader, date: e.target.value})} className="bg-transparent text-sm font-medium outline-none text-right text-text-primary" disabled={activeVersion.status === 'approved'} />
                </div>
                <div className="flex justify-between items-center border-b border-border/30 pb-2">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('client')}</span>
                  <input type="text" value={projectHeader.client} onChange={e => setProjectHeader({...projectHeader, client: e.target.value})} className="bg-transparent text-sm font-medium outline-none text-right text-text-primary w-1/2" placeholder="Kunde" disabled={activeVersion.status === 'approved'} />
                </div>
                <div className="flex justify-between items-center border-b border-border/30 pb-2">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Version</span>
                  <input type="text" value={projectHeader.version} onChange={e => setProjectHeader({...projectHeader, version: e.target.value})} className="bg-transparent text-sm font-medium outline-none text-right text-text-primary w-1/4" disabled={activeVersion.status === 'approved'} />
                </div>
                <div className="pt-2">
                  <label className="flex items-center justify-between text-sm font-bold text-text-primary cursor-pointer">
                    <span className="text-xs text-text-muted uppercase tracking-widest">Optionen einrechnen</span>
                    <input type="checkbox" checked={includeOptions} onChange={(e) => setIncludeOptions(e.target.checked)} className="rounded border-border text-accent-ai w-5 h-5 cursor-pointer" /> 
                  </label>
                </div>
              </div>
            </div>

            {/* Budget Groups Kacheln */}
            {budgetGroups.map(group => (
               <div key={group.id} className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 shadow-sm relative">
                     <div className="flex justify-between items-center mb-2">
                       <span className="font-bold text-blue-500 text-sm">{group.pos}</span>
                       <span className="font-bold text-blue-500 text-sm">{formatCHF(calculateGroupTotal(group))}</span>
                     </div>
                     <input className="bg-transparent text-blue-400 font-bold text-lg outline-none w-full pr-8" value={group.title} onChange={e => setVersions(versions.map(v => v.id === activeVersionId ? {...v, groups: v.groups.map(g => g.id === group.id ? {...g, title: e.target.value} : g)} : v))} disabled={activeVersion.status === 'approved'} placeholder="Titel der Phase" />
                     {!isReadOnly && activeVersion.status !== 'approved' && (
                       <button onClick={() => handleDeleteGroup(group.id)} className="absolute right-4 bottom-4 text-red-500 p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20"><Trash2 size={16}/></button>
                     )}
                  </div>

                  <div className="space-y-3 pl-3 border-l-2 border-border/30">
                     {group.items.map(item => (
                        <div key={item.id} className="bg-surface border border-border/50 rounded-xl p-4 shadow-sm relative space-y-3">
                           <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-text-muted bg-background px-2 py-1 rounded border border-border/50">{item.pos}</span>
                              {!isReadOnly && activeVersion.status !== 'approved' && (
                                <button onClick={() => setVersions(versions.map(v => v.id === activeVersionId ? {...v, groups: v.groups.map(g => g.id === group.id ? {...g, items: g.items.filter(i => i.id !== item.id)} : g)} : v))} className="text-text-muted hover:text-red-500 p-1 bg-background rounded-md"><X size={14}/></button>
                              )}
                           </div>
                           <input value={item.description} onChange={e => handleBudgetChange(group.id, item.id, 'description', e.target.value)} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-medium text-text-primary outline-none focus:border-accent-ai/50" disabled={activeVersion.status === 'approved'} placeholder={t('description')} />
                           
                           <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">{t('qty')}</label>
                                <input type="number" value={item.qty || ''} onChange={e => handleBudgetChange(group.id, item.id, 'qty', e.target.value)} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-medium outline-none text-right" disabled={activeVersion.status === 'approved'} />
                              </div>
                              <div>
                                <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">{t('unit')}</label>
                                <select value={item.unit} onChange={e => handleBudgetChange(group.id, item.id, 'unit', e.target.value)} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-medium outline-none cursor-pointer" disabled={activeVersion.status === 'approved'}>
                                  <option value="Std.">Std.</option><option value="Stk.">Stk.</option><option value="Pauschal">Pauschal</option><option value="m2">m2</option><option value="Option" className="font-bold text-accent-ai">Option</option>
                                </select>
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-3 items-end border-b border-border/30 pb-3">
                              <div>
                                <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">{t('unit_price')}</label>
                                <input type="number" value={item.unitPrice || ''} onChange={e => handleBudgetChange(group.id, item.id, 'unitPrice', e.target.value)} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-medium outline-none text-right" disabled={activeVersion.status === 'approved'} />
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-text-muted font-bold uppercase block mb-1">Total (CHF)</span>
                                <span className={cn("text-lg font-bold", item.option > 0 ? "text-accent-ai" : "text-text-primary")}>{formatCHF(item.total + (includeOptions ? item.option : 0))}</span>
                              </div>
                           </div>
                        </div>
                     ))}
                     {!isReadOnly && activeVersion.status !== 'approved' && (
                       <button onClick={() => setVersions(versions.map(v => v.id === activeVersionId ? {...v, groups: v.groups.map(g => g.id === group.id ? {...g, items: [...g.items, { id: `i${Date.now()}`, pos: `${g.pos.substring(0,1)}0${g.items.length + 1}`, description: '', qty: 1, unit: 'Stk.', unitPrice: 0, option: 0, total: 0 }]} : g)} : v))} className="w-full py-2.5 bg-background border border-dashed border-accent-ai/30 text-accent-ai rounded-xl text-xs font-bold hover:bg-accent-ai/10 flex items-center justify-center gap-2">
                         <Plus size={14}/> {t('add_position')}
                       </button>
                     )}
                  </div>
               </div>
            ))}

            {!isReadOnly && activeVersion.status !== 'approved' && (
              <button onClick={() => setVersions(versions.map(v => v.id === activeVersionId ? {...v, groups: [...v.groups, { id: `g${Date.now()}`, pos: `${(v.groups.length + 1)}00`, title: t('new_phase'), items: [] }]} : v))} className="w-full py-4 bg-surface border border-dashed border-accent-ai/50 text-accent-ai rounded-xl font-bold hover:bg-accent-ai/10 flex items-center justify-center gap-2 shadow-sm">
                <Plus size={18} /> {t('new_phase')}
              </button>
            )}

            {/* Totals Mobile Card */}
            <div className="bg-surface border border-border/50 rounded-xl p-5 shadow-sm space-y-3">
               <div className="flex justify-between items-center text-sm font-bold text-text-muted">
                 <span>{t('subtotal')}</span><span>{formatCHF(totalBudget)}</span>
               </div>
               {includeOptions && (
                 <div className="flex justify-between items-center text-sm font-bold text-accent-ai border-t border-border/30 pt-3">
                   <span>Optionen Gesamt</span><span>{formatCHF(budgetGroups.reduce((sum, group) => sum + group.items.reduce((s, item) => s + item.option, 0), 0))}</span>
                 </div>
               )}
               <div className="flex justify-between items-center text-sm font-bold text-text-muted border-t border-border/30 pt-3">
                 <span className="flex items-center gap-2">
                   {t('vat')} <input type="number" value={vatRate} onChange={e => setVersions(versions.map(v => v.id === activeVersionId ? {...v, vatRate: Number(e.target.value)} : v))} className="w-14 bg-background border border-border/50 rounded p-1 outline-none text-text-primary text-center" disabled={activeVersion.status === 'approved'} />%
                 </span>
                 <span>{formatCHF(totalBudget * (vatRate/100))}</span>
               </div>
               <div className="flex justify-between items-center text-lg font-bold text-blue-400 border-t-2 border-border pt-4">
                 <span className="uppercase">{t('total_amount')}</span><span>{formatCHF(totalBudget * (1 + vatRate/100))}</span>
               </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* DESKTOP TABELLEN ANSICHT (BUDGET) WIRD AUF HANDYS VERSTECKT */}
        {/* ========================================================= */}
        {activeTab === 'budget' && (
          <div className="hidden lg:flex flex-col w-full overflow-hidden">
             <div className="bg-surface border border-border rounded-xl shadow-lg mt-0 w-full flex-col overflow-x-auto custom-scrollbar">
                <div className="min-w-[800px]">
                  <div className="p-8 bg-surface border-b border-border/50 w-full flex justify-between items-end">
                    <div>
                      <input className="text-3xl font-extrabold bg-transparent outline-none w-[600px] border-b border-transparent focus:border-accent-ai/50 text-text-primary mb-2" value={projectHeader.project} onChange={e => setProjectHeader({...projectHeader, project: e.target.value})} placeholder={t('project')} disabled={activeVersion.status === 'approved'} />
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('date')}:</span>
                          <input type="date" value={projectHeader.date} onChange={e => setProjectHeader({...projectHeader, date: e.target.value})} className="bg-transparent text-sm font-medium outline-none text-text-primary cursor-pointer border-b border-transparent focus:border-accent-ai/50 py-1" disabled={activeVersion.status === 'approved'} />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('client')}:</span>
                          <input type="text" value={projectHeader.client} onChange={e => setProjectHeader({...projectHeader, client: e.target.value})} className="bg-transparent text-sm font-medium outline-none text-text-primary border-b border-transparent focus:border-accent-ai/50 py-1 w-48" placeholder="Kunde / Bauherr" disabled={activeVersion.status === 'approved'} />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Version:</span>
                          <input type="text" value={projectHeader.version} onChange={e => setProjectHeader({...projectHeader, version: e.target.value})} className="bg-transparent text-sm font-medium outline-none text-text-primary border-b border-transparent focus:border-accent-ai/50 py-1 w-16" placeholder="v1.0" disabled={activeVersion.status === 'approved'} />
                        </div>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm font-bold text-text-muted cursor-pointer hover:text-text-primary transition-colors bg-background border border-border/50 px-3 py-2 rounded-lg shadow-sm">
                      <input type="checkbox" checked={includeOptions} onChange={(e) => setIncludeOptions(e.target.checked)} className="rounded border-border text-accent-ai focus:ring-accent-ai w-4 h-4 cursor-pointer" /> 
                      Optionen einrechnen
                    </label>
                  </div>

                  <div className="w-full">
                    <table className="w-full text-sm text-left border-collapse bg-surface">
                      <thead className="text-xs uppercase tracking-wider text-text-muted bg-background border-b border-border/50">
                        <tr>
                          <th className="px-4 py-3 w-16">{t('pos')}</th>
                          <th className="px-4 py-3">{t('description')}</th>
                          <th className="px-4 py-3 text-right w-24">{t('qty')}</th>
                          <th className="px-4 py-3 w-24">{t('unit')}</th>
                          <th className="px-4 py-3 text-right w-24">{t('unit_price')}</th>
                          {includeOptions && <th className="px-4 py-3 text-right w-24 text-accent-ai">Option</th>}
                          <th className="px-4 py-3 text-right w-36 text-blue-400">{t('total')} (CHF)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {budgetGroups.map(group => {
                          const groupPlanTotal = calculateGroupTotal(group);
                          return (
                          <React.Fragment key={group.id}>
                            <tr className="bg-blue-500/10 border-y border-blue-500/20 group relative">
                              <td className="px-4 py-3 font-bold text-blue-400">{group.pos}</td>
                              <td className="px-4 py-3 font-bold text-blue-400" colSpan={includeOptions ? 5 : 4}>
                                <input className="bg-transparent text-blue-400 border-none outline-none w-full font-bold" value={group.title} onChange={e => setVersions(versions.map(v => v.id === activeVersionId ? {...v, groups: v.groups.map(g => g.id === group.id ? {...g, title: e.target.value} : g)} : v))} disabled={activeVersion.status === 'approved'} />
                              </td>
                              <td className="px-4 py-3 font-bold text-right text-blue-400 relative">
                                {formatCHF(groupPlanTotal)}
                                {!isReadOnly && activeVersion.status !== 'approved' && (
                                  <button onClick={() => handleDeleteGroup(group.id)} className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover:opacity-100 p-1 no-print">
                                    <Trash2 size={16}/>
                                  </button>
                                )}
                              </td>
                            </tr>
                            {group.items.map(item => (
                              <tr key={item.id} className="hover:bg-white/5 transition-colors group/row">
                                <td className="px-4 py-2 text-xs text-text-muted font-medium">{item.pos}</td>
                                <td className="px-4 py-2">
                                  <input value={item.description} onChange={e => handleBudgetChange(group.id, item.id, 'description', e.target.value)} className="w-full bg-transparent outline-none focus:border-b focus:border-accent-ai/50 py-1 font-medium text-text-primary" disabled={activeVersion.status === 'approved'} placeholder={t('description')} />
                                </td>
                                <td className="px-4 py-2 text-right">
                                  <input type="number" value={item.qty || ''} onChange={e => handleBudgetChange(group.id, item.id, 'qty', e.target.value)} className={cn(numberInputClass, "font-medium text-text-primary")} disabled={activeVersion.status === 'approved'} />
                                </td>
                                <td className="px-4 py-2 relative">
                                  <select value={item.unit} onChange={e => handleBudgetChange(group.id, item.id, 'unit', e.target.value)} className="bg-transparent text-text-primary outline-none w-full appearance-none cursor-pointer font-medium" disabled={activeVersion.status === 'approved'}>
                                    <option className="bg-surface">Std.</option>
                                    <option className="bg-surface">Stk.</option>
                                    <option className="bg-surface">Pauschal</option>
                                    <option className="bg-surface">m2</option>
                                    <option className="bg-surface font-bold text-accent-ai">Option</option>
                                  </select>
                                </td>
                                <td className="px-4 py-2 text-right">
                                  <input type="number" value={item.unitPrice || ''} onChange={e => handleBudgetChange(group.id, item.id, 'unitPrice', e.target.value)} className={cn(numberInputClass, "font-medium text-text-primary")} disabled={activeVersion.status === 'approved'} />
                                </td>
                                {includeOptions && (
                                  <td className="px-4 py-2 text-right bg-accent-ai/5">
                                    <span className={item.option > 0 ? "text-accent-ai font-bold" : "text-text-muted font-medium"}>{item.option > 0 ? formatCHF(item.option) : '-'}</span>
                                  </td>
                                )}
                                <td className="px-4 py-2 text-right font-bold relative text-text-primary">
                                  <span className={item.option > 0 ? "text-accent-ai" : ""}>{formatCHF(item.total + (includeOptions ? item.option : 0))}</span>
                                  {!isReadOnly && activeVersion.status !== 'approved' && (
                                    <button onClick={() => setVersions(versions.map(v => v.id === activeVersionId ? {...v, groups: v.groups.map(g => g.id === group.id ? {...g, items: g.items.filter(i => i.id !== item.id)} : g)} : v))} className="absolute right-1 top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover/row:opacity-100 p-1 no-print">
                                      <X size={14}/>
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                            {!isReadOnly && activeVersion.status !== 'approved' && (
                              <tr className="no-print">
                                <td colSpan={includeOptions ? 7 : 6} className="px-4 py-3 bg-background/30">
                                  <button onClick={() => setVersions(versions.map(v => v.id === activeVersionId ? {...v, groups: v.groups.map(g => g.id === group.id ? {...g, items: [...g.items, { id: `i${Date.now()}`, pos: `${g.pos.substring(0,1)}0${g.items.length + 1}`, description: '', qty: 1, unit: 'Stk.', unitPrice: 0, option: 0, total: 0 }]} : g)} : v))} className="text-xs font-bold flex items-center gap-1 text-accent-ai hover:underline">
                                    <Plus size={14}/> {t('add_position')}
                                  </button>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        )})}
                        {!isReadOnly && activeVersion.status !== 'approved' && (
                          <tr className="no-print">
                            <td colSpan={includeOptions ? 7 : 6} className="px-4 py-6">
                              <button onClick={() => setVersions(versions.map(v => v.id === activeVersionId ? {...v, groups: [...v.groups, { id: `g${Date.now()}`, pos: `${(v.groups.length + 1)}00`, title: t('new_phase'), items: [] }]} : v))} className="w-full py-3 border border-dashed border-accent-ai/30 text-accent-ai rounded-lg font-bold hover:bg-accent-ai/5 flex justify-center items-center gap-2 transition-colors">
                                <Plus size={18} /> {t('new_phase')}
                              </button>
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="bg-background border-t-2 border-border/50">
                          <td colSpan={4} className="px-4 py-4"></td>
                          <td className="px-4 py-4 text-right text-xs uppercase font-bold text-text-muted whitespace-nowrap">{t('subtotal')}</td>
                          {includeOptions && <td className="px-4 py-4 text-right font-bold text-sm text-accent-ai whitespace-nowrap">{formatCHF(budgetGroups.reduce((sum, group) => sum + group.items.reduce((s, item) => s + item.option, 0), 0))}</td>}
                          <td className="px-4 py-4 text-right font-bold text-sm text-text-primary whitespace-nowrap">{formatCHF(totalBudget)}</td>
                        </tr>
                        <tr className="bg-background border-b border-border/50">
                          <td colSpan={4} className="px-4 py-3"></td>
                          <td className="px-4 py-3 text-right text-xs uppercase font-semibold text-text-muted flex justify-end items-center gap-2 whitespace-nowrap">
                            {t('vat')} 
                            <input type="number" value={vatRate} onChange={e => setVersions(versions.map(v => v.id === activeVersionId ? {...v, vatRate: Number(e.target.value)} : v))} className={cn(numberInputClass, "font-medium w-16 px-2 py-1 rounded border border-border/50 bg-surface outline-none text-text-primary")} disabled={activeVersion.status === 'approved'} />%
                          </td>
                          {includeOptions && <td></td>}
                          <td className="px-4 py-3 text-right font-medium text-sm text-text-muted whitespace-nowrap">{formatCHF(totalBudget * (vatRate/100))}</td>
                        </tr>
                        <tr className="bg-surface border-b-2 border-border">
                          <td colSpan={4} className="px-4 py-5"></td>
                          <td className="px-4 py-5 text-right font-bold text-sm uppercase text-text-primary whitespace-nowrap">{t('total_amount')}</td>
                          {includeOptions && <td></td>}
                          <td className="px-4 py-5 text-right font-bold text-sm text-blue-400 whitespace-nowrap">{formatCHF(totalBudget * (1 + vatRate/100))}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
             </div>
          </div>
        )}

        {/* Andere Tabs (control, cashflow) Desktop & Mobile */}
        {activeTab === 'control' && (
          <div className="bg-surface border border-border rounded-xl shadow-lg mt-4 lg:mt-0 w-full overflow-hidden flex flex-col p-4 lg:p-8">
            <h2 className="text-xl font-bold mb-6">{t('payment_control')}</h2>
            <div className="w-full overflow-x-auto custom-scrollbar pb-4">
              <div className="min-w-[800px] lg:min-w-full">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-surface border-b border-border/50">
                    <tr>
                      <th className="px-4 py-3 w-16 text-text-muted uppercase tracking-wider">{t('pos')}</th>
                      <th className="px-4 py-3 text-text-muted uppercase tracking-wider min-w-[200px]">{t('description')}</th>
                      <th className="px-4 py-3 text-right text-text-muted uppercase tracking-wider w-32">{t('planned')}</th>
                      <th className="px-4 py-3 text-right text-red-500 uppercase tracking-wider w-32">{t('actual_costs')}</th>
                      <th className="px-4 py-3 text-right text-text-muted uppercase tracking-wider w-32">{t('variance')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {approvedVersions.map((version) => (
                      <React.Fragment key={version.id}>
                        <tr className="bg-accent-ai/5">
                          <td colSpan={5} className="px-4 py-2 font-bold text-xs uppercase text-accent-ai tracking-widest">{t('budget_supplement')} {version.name}</td>
                        </tr>
                        {version.groups.map(group => {
                          const plan = calculateGroupTotal(group);
                          const actual = getAllTimeActualCostForGroup(group);
                          const diff = plan - actual;
                          return (
                            <React.Fragment key={group.id}>
                              <tr className="bg-surface/50 border-t border-border/50">
                                <td className="px-4 py-3 font-bold text-text-primary">{group.pos}</td>
                                <td className="px-4 py-3 font-bold text-text-primary">{group.title}</td>
                                <td className="px-4 py-3 font-bold text-right text-text-primary">{formatCHF(plan)}</td>
                                <td className="px-4 py-3 font-bold text-right text-red-500">{formatCHF(actual)}</td>
                                <td className={cn("px-4 py-3 font-bold text-right", diff < 0 ? "text-red-500" : "text-emerald-500")}>
                                  {diff >= 0 ? '+' : ''}{formatCHF(diff)}
                                </td>
                              </tr>
                              {group.items.map(item => {
                                const itemActual = getAllTimeActualCostForItem(item.id);
                                const itemDiff = item.total - itemActual;
                                return (
                                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-2 text-xs text-text-muted font-medium">{item.pos}</td>
                                    <td className="px-4 py-2 text-text-primary font-medium">{item.description}</td>
                                    <td className="px-4 py-2 text-right text-text-primary">{formatCHF(item.total)}</td>
                                    <td className="px-4 py-2 text-right text-red-500">{itemActual > 0 ? formatCHF(itemActual) : '-'}</td>
                                    <td className={cn("px-4 py-2 text-right font-medium", itemDiff < 0 ? "text-red-500" : "text-emerald-500")}>
                                      {itemDiff >= 0 ? '+' : ''}{formatCHF(itemDiff)}
                                    </td>
                                  </tr>
                                )
                              })}
                            </React.Fragment>
                          )
                        })}
                      </React.Fragment>
                    ))}
                    <tr className="bg-orange-500/10 border-y-2 border-orange-500/20">
                      <td className="px-4 py-3 font-bold text-orange-500">HR</td>
                      <td className="px-4 py-3 font-bold text-orange-500">{t('internal_hours_time_tracking')} ({allTimeHours} h)</td>
                      <td className="px-4 py-3 font-bold text-right text-orange-500">-</td>
                      <td className="px-4 py-3 font-bold text-right text-red-500">{formatCHF(allTimeHoursCost)}</td>
                      <td className="px-4 py-3 font-bold text-right text-red-500">-{formatCHF(allTimeHoursCost)}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-surface border-t-2 border-border/50">
                      <td colSpan={2} className="px-4 py-5 text-right font-black uppercase tracking-wider text-text-primary">{t('total_project_excl_vat')}</td>
                      <td className="px-4 py-5 text-right font-black text-text-primary">{formatCHF(overviewTotalBudget)}</td>
                      <td className="px-4 py-5 text-right font-black text-red-500">{formatCHF(totalActualCostsIncludingHoursAllTime)}</td>
                      <td className={cn("px-4 py-5 text-right font-black", (overviewTotalBudget - totalActualCostsIncludingHoursAllTime) < 0 ? "text-red-500" : "text-emerald-500")}>
                        {((overviewTotalBudget - totalActualCostsIncludingHoursAllTime) >= 0 ? '+' : '')}{formatCHF(overviewTotalBudget - totalActualCostsIncludingHoursAllTime)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            {approvedVersions.length === 0 && (
               <div className="mt-8 flex flex-col items-center justify-center p-12 border-2 border-dashed border-border/50 rounded-2xl bg-surface/30 text-text-muted sticky left-0">
                 <AlertCircle size={48} className="mb-4 opacity-50" />
                 <h3 className="text-lg font-bold mb-2 text-text-primary">{t('payment_control_inactive')}</h3>
                 <p className="text-sm">{t('payment_control_inactive_desc')}</p>
               </div>
            )}
          </div>
        )}

        {activeTab === 'cashflow' && (
          <div className="bg-surface border border-border rounded-xl shadow-lg mt-4 lg:mt-0 w-full overflow-hidden flex flex-col p-4 lg:p-8">
            <h2 className="text-xl font-bold mb-6">{t('cashflow')}</h2>
            <div className="w-full overflow-x-auto custom-scrollbar pb-4">
              <div className="min-w-[800px] lg:min-w-full">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-surface border-b border-border/50">
                    <tr>
                      <th className="px-4 py-3 text-text-muted uppercase tracking-wider w-32">{t('date')}</th>
                      <th className="px-4 py-3 text-text-muted uppercase tracking-wider min-w-[200px]">{t('description')}</th>
                      <th className="px-4 py-3 text-text-muted uppercase tracking-wider w-48">{t('budget_assignment')}</th>
                      <th className="px-4 py-3 text-right text-text-muted uppercase tracking-wider w-32">{t('credit_revenue')}</th>
                      <th className="px-4 py-3 text-right text-text-muted uppercase tracking-wider w-32">{t('debit_costs')}</th>
                      <th className="px-4 py-3 text-right text-text-muted uppercase tracking-wider w-32">{t('balance_profit')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {displayLedger.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-text-muted italic">{t('no_bookings_period')}</td></tr>
                    )}
                    {displayLedger.map((tx) => {
                      const isQuote = tx.category === 'Offerte' || tx.category === 'Quote';
                      const isTime = !!tx.isTimeEntry;
                      const isRevenue = tx.category === 'Debitorenrechnung' || tx.category === 'Outgoing Invoice' || (!isQuote && !isTime && tx.amount > 0);
                      const displayAmount = tx.amount === 0 ? 0 : Math.abs(tx.amount);
                      const bdDetails = getBudgetDetails(tx.budgetPosId);
                      const isBalanceNegative = 0 > tx.balance;

                      return (
                        <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-4 py-3 text-text-muted font-medium flex items-center gap-2">
                             <button onClick={() => handleDeleteTransaction(tx.id)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500/10 p-1 rounded transition-all"><Trash2 size={14}/></button>
                             {tx.date}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-text-primary">{tx.description}</span>
                              {tx.url && <a href={tx.url} target="_blank" rel="noopener noreferrer" className="text-accent-ai hover:underline p-1 bg-accent-ai/10 rounded"><FileText size={14}/></a>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-text-muted font-medium">
                             {bdDetails ? <div className="flex flex-col"><span>{bdDetails.phase}</span><span className="text-text-primary font-bold truncate max-w-[150px]">{bdDetails.item}</span></div> : <span className="italic opacity-50">{t('free_booking')}</span>}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-500">
                            {isQuote ? <span className="text-text-muted italic">({formatCHF(displayAmount)})</span> : (isRevenue && displayAmount > 0 ? `+ ${formatCHF(displayAmount)}` : '')}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-red-500">
                            {!isQuote && !isRevenue && displayAmount > 0 ? `- ${formatCHF(displayAmount)}` : ''}
                          </td>
                          <td className={cn("px-4 py-3 text-right font-bold", isQuote ? "text-text-muted" : (isBalanceNegative ? "text-red-500" : "text-emerald-500"))}>
                            {isQuote ? '-' : formatCHF(tx.balance)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PDF Studios */}
      <UniversalPDFStudio 
        isOpen={isPdfStudioOpen} 
        onClose={() => setIsPdfStudioOpen(false)} 
        title={t('finance_budget')} 
        fileName={`Finanzen_${activeTab}_${Date.now()}`}
        onSaveCloud={handleSavePdfToCloud}
        defaultAccentColor={companyColor}
      >
        {(settings) => (
          <FinancePDFDocument 
             settings={settings}
             activeTab={activeTab}
             t={t}
             projectHeader={projectHeader}
             budgetGroups={budgetGroups}
             approvedVersions={approvedVersions}
             allTimeHours={allTimeHours}
             allTimeHoursCost={allTimeHoursCost}
             displayLedger={displayLedger}
             getBudgetDetails={getBudgetDetails}
             overviewTotalBudget={overviewTotalBudget}
             totalActualCostsIncludingHoursAllTime={totalActualCostsIncludingHoursAllTime}
             totalBudget={totalBudget}
             vatRate={activeVersion.vatRate}
             formatCHF={formatCHF}
             calculateGroupTotal={calculateGroupTotal}
             getAllTimeActualCostForGroup={getAllTimeActualCostForGroup}
             getAllTimeActualCostForItem={getAllTimeActualCostForItem}
          />
        )}
      </UniversalPDFStudio>

      <UniversalPDFStudio 
        isOpen={isReceiptPdfStudioOpen} 
        onClose={() => setIsReceiptPdfStudioOpen(false)} 
        title="Buchungsbeleg" 
        fileName={`Buchung_${incomingData.vendor.replace(/\s/g,'_')}_${Date.now()}`}
        onSaveCloud={handleSaveReceiptPdfToCloud}
        defaultAccentColor={companyColor}
      >
        {(settings) => (
          <ReceiptPDFDocument 
            settings={settings}
            incomingData={incomingData}
            incomingReceipts={incomingReceipts}
            formatCHF={formatCHF}
            projectHeader={projectHeader}
            budgetDetails={getBudgetDetails(incomingData.budgetPosId)}
            receiptType={receiptType}
          />
        )}
      </UniversalPDFStudio>

      {/* MODALS */}
      {isMounted && showTimeModal && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border/50 flex justify-between items-center bg-surface/50">
              <h3 className="font-bold flex items-center gap-2 text-text-primary"><Clock className="text-orange-400" size={18}/> {t('book_hours')}</h3>
              <button onClick={() => setShowTimeModal(false)} className="text-text-muted hover:text-text-primary p-1 rounded-md bg-background"><X size={18}/></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="time-form" onSubmit={handleTimeSubmit} className="space-y-4">
                
                <div className="flex bg-background border border-border/50 rounded-lg p-1">
                  <button type="button" onClick={() => setTimeData({...timeData, type: 'internal'})} className={cn("flex-1 py-1.5 text-xs font-bold rounded-md transition-all", timeData.type === 'internal' ? "bg-orange-500 text-white shadow-sm" : "text-text-muted hover:text-text-primary")}>{t('simple_internal')}</button>
                  <button type="button" onClick={() => setTimeData({...timeData, type: 'external'})} className={cn("flex-1 py-1.5 text-xs font-bold rounded-md transition-all", timeData.type === 'external' ? "bg-orange-500 text-white shadow-sm" : "text-text-muted hover:text-text-primary")}>{t('detailed_external')}</button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block">Ressource</label>
                     {timeData.type === 'internal' ? (
                        <select required value={timeData.userId} onChange={(e) => setTimeData({...timeData, userId: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none">
                          <option value="" disabled className="bg-surface">Mitarbeiter wählen...</option>
                          {projectMembers?.filter((m:any) => m.projectId === currentProjectId).map((member:any) => (
                             <option key={member.userId} value={member.userId} className="bg-surface">{member.userEmail || member.userId}</option>
                          ))}
                        </select>
                     ) : (
                        <input type="text" required placeholder="Partner Firma" value={timeData.company} onChange={(e) => setTimeData({...timeData, company: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none" />
                     )}
                   </div>
                   <div>
                     <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block">Datum</label>
                     <input type="date" required value={timeData.date} onChange={(e) => setTimeData({...timeData, date: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none" />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block">Stunden (h)</label>
                    <input type="number" step="0.25" min="0.25" required value={timeData.hours || ''} onChange={(e) => setTimeData({...timeData, hours: Number(e.target.value)})} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none" placeholder="z.B. 4.5" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block">Stundensatz (CHF)</label>
                    <input type="number" required value={timeData.hourlyRate || ''} onChange={(e) => setTimeData({...timeData, hourlyRate: Number(e.target.value)})} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none" placeholder="z.B. 120" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block">Beschreibung</label>
                  <textarea required value={timeData.description} onChange={(e) => setTimeData({...timeData, description: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-medium text-text-primary outline-none resize-none h-20" placeholder="Was wurde gemacht..." />
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-border bg-surface flex justify-end gap-3 shrink-0">
              <button onClick={() => setShowTimeModal(false)} className="px-5 py-2 text-sm font-bold text-text-muted border border-border rounded-lg hover:text-text-primary transition-colors">{t('cancel')}</button>
              <button form="time-form" type="submit" disabled={isSubmitting} className="px-5 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-50">
                {isSubmitting && <Loader2 size={16} className="animate-spin"/>} Buchen
              </button>
            </div>
          </motion.div>
        </div>, document.body
      )}

      {isMounted && showReceiptStudio && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface border border-border rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col lg:flex-row overflow-hidden max-h-[95vh] h-full lg:h-auto">
             
             {/* LEFT SIDE: SCAN & UPLOAD */}
             <div className="w-full lg:w-5/12 p-6 border-b lg:border-b-0 lg:border-r border-border bg-background/50 flex flex-col overflow-y-auto custom-scrollbar">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-text-primary">
                  <Receipt className="text-red-500" /> {t('receipts_photos')}
                </h3>
                
                <div className="grid grid-cols-2 gap-3 mb-6 shrink-0">
                   <label className="flex flex-col items-center justify-center bg-surface border border-border rounded-xl p-4 cursor-pointer hover:bg-white/5 transition-colors shadow-sm relative overflow-hidden group">
                     {isAnalyzingAI && <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex flex-col items-center justify-center z-10"><Loader2 size={24} className="text-red-500 animate-spin mb-2" /><span className="text-[10px] font-bold text-red-500 uppercase tracking-widest text-center">{t('analyzing_ai')}</span></div>}
                     <Camera size={24} className="text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                     <span className="text-xs font-bold text-center">{t('take_photo')}</span>
                     <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleLocalImageUpload} />
                   </label>
                   <label className="flex flex-col items-center justify-center bg-surface border border-border rounded-xl p-4 cursor-pointer hover:bg-white/5 transition-colors shadow-sm relative overflow-hidden group">
                     {isAnalyzingAI && <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex flex-col items-center justify-center z-10"><Loader2 size={24} className="text-red-500 animate-spin mb-2" /><span className="text-[10px] font-bold text-red-500 uppercase tracking-widest text-center">{t('analyzing_ai')}</span></div>}
                     <ImageIcon size={24} className="text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                     <span className="text-xs font-bold text-center">Datei wählen</span>
                     <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleLocalImageUpload} multiple />
                   </label>
                </div>

                <div className="bg-surface border border-border rounded-xl p-6 flex flex-col items-center justify-center text-center shrink-0 mb-6 relative overflow-hidden">
                   {isAnalyzingAI && <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex flex-col items-center justify-center z-10"><Loader2 size={32} className="text-red-500 animate-spin mb-2" /><span className="text-xs font-bold text-red-500 uppercase tracking-widest text-center">{t('analyzing_ai')}</span></div>}
                   <div className="bg-white p-3 rounded-xl shadow-lg mb-4">
                     <QRCode value={mobileUploadUrl} size={120} />
                   </div>
                   <p className="text-xs font-bold text-text-primary mb-1">Smartphone Scanner</p>
                   <p className="text-[10px] text-text-muted leading-relaxed max-w-[200px]">QR Code scannen, um Belege per Handy-Kamera direkt hierher zu senden.</p>
                </div>

                <div className="flex-1 min-h-0 flex flex-col">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3 shrink-0">Gescannte Belege</h4>
                  {incomingReceipts.length === 0 ? (
                    <div className="flex-1 border-2 border-dashed border-border/50 rounded-xl flex items-center justify-center text-text-muted text-xs p-6 text-center">Noch keine Belege hochgeladen.</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 overflow-y-auto custom-scrollbar pr-2 pb-4">
                       {incomingReceipts.map((src, i) => (
                          <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border shadow-sm group">
                             <img src={src} className="w-full h-full object-cover" alt="Beleg" />
                             <button onClick={() => setIncomingReceipts(incomingReceipts.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"><Trash2 size={14}/></button>
                          </div>
                       ))}
                    </div>
                  )}
                </div>
             </div>

             {/* RIGHT SIDE: DATA FORM */}
             <div className="w-full lg:w-7/12 flex flex-col h-full bg-surface">
                <div className="p-6 border-b border-border/50 flex justify-between items-center shrink-0">
                   <h3 className="font-bold text-lg text-text-primary">Buchungsdetails</h3>
                   <button onClick={() => setShowReceiptStudio(false)} className="p-2 bg-background border border-border rounded-lg hover:text-red-500 transition-colors"><X size={18}/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                  <div className="flex bg-background border border-border/50 rounded-lg p-1 mb-6">
                    <button type="button" onClick={() => { setReceiptType('expense'); setIncomingData({...incomingData, type: 'internal'}); }} className={cn("flex-1 py-2 text-xs font-bold rounded-md transition-all", receiptType === 'expense' ? "bg-red-500 text-white shadow-sm" : "text-text-muted hover:text-text-primary")}>Intern (Spesen)</button>
                    <button type="button" onClick={() => { setReceiptType('external_cost'); setIncomingData({...incomingData, type: 'external'}); }} className={cn("flex-1 py-2 text-xs font-bold rounded-md transition-all", receiptType === 'external_cost' ? "bg-red-500 text-white shadow-sm" : "text-text-muted hover:text-text-primary")}>Externer Kreditor</button>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block">{t('vendor_company')}</label>
                      <input type="text" value={incomingData.vendor} onChange={e => setIncomingData({...incomingData, vendor: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-4 py-2.5 text-sm font-bold text-text-primary outline-none focus:border-red-500/50 transition-colors" placeholder="Name des Lieferanten / Shops" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block">{t('date')}</label>
                        <input type="date" value={incomingData.date} onChange={e => setIncomingData({...incomingData, date: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-4 py-2.5 text-sm font-bold text-text-primary outline-none focus:border-red-500/50 transition-colors" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block text-red-500">{t('amount_chf')}</label>
                        <input type="number" step="0.05" value={incomingData.amount} onChange={e => setIncomingData({...incomingData, amount: e.target.value})} className="w-full bg-red-500/5 border border-red-500/30 rounded-lg px-4 py-2.5 text-sm font-bold text-red-500 outline-none focus:border-red-500 transition-colors placeholder:text-red-500/30" placeholder="0.00" />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block">{t('description')}</label>
                      <textarea value={incomingData.description} onChange={e => setIncomingData({...incomingData, description: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm font-medium text-text-primary outline-none resize-none h-20 focus:border-red-500/50 transition-colors" placeholder="Wofür war diese Ausgabe?" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block">{t('budget_assignment')}</label>
                        <select value={incomingData.budgetPosId} onChange={e => setIncomingData({...incomingData, budgetPosId: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2.5 text-sm font-bold text-text-primary outline-none cursor-pointer">
                          <option value="" className="bg-surface">{t('free_booking')}</option>
                          {approvedVersions.flatMap(v => v.groups).flatMap(g => g.items).map((item:any) => (
                            <option key={item.id} value={item.id} className="bg-surface">{item.pos} {item.description}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block">{t('status')}</label>
                        <select value={incomingData.status} onChange={e => setIncomingData({...incomingData, status: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2.5 text-sm font-bold text-text-primary outline-none cursor-pointer">
                          <option value="Offen" className="bg-surface">{t('open')}</option>
                          <option value="Bezahlt" className="bg-surface">{t('paid')}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-border/50 bg-background/30 flex justify-end shrink-0">
                   <button 
                    onClick={() => {
                      if (!hasFeature(currentUser, 'invoice_studio')) {
                        window.dispatchEvent(new CustomEvent('open-upgrade-modal'));
                      } else {
                        setIsReceiptPdfStudioOpen(true);
                      }
                    }} 
                    disabled={!incomingData.vendor || !incomingData.amount || isSubmitting} 
                    className="w-full sm:w-auto px-8 py-3.5 bg-red-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-500 transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50"
                  >
                     {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <FileText size={18} />} {t('generate_pdf_book')}
                   </button>
                </div>
             </div>
          </motion.div>
        </div>, document.body
      )}

      <AnimatePresence>
        {showInvoiceModal && (
          <InvoiceStudio 
            type="invoice" 
            onClose={() => setShowInvoiceModal(false)} 
            onSave={handleSaveGeneratedInvoice} 
            budgetGroups={versions.find(v => v.id === activeVersionId)?.groups || []} 
          />
        )}
        {showQuoteModal && (
          <InvoiceStudio 
            type="quote" 
            onClose={() => setShowQuoteModal(false)} 
            onSave={handleSaveGeneratedQuote} 
            budgetGroups={versions.find(v => v.id === activeVersionId)?.groups || []} 
          />
        )}
      </AnimatePresence>

    </motion.div>
  );
}