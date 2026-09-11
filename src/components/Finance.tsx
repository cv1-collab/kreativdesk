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
  Image as ImageIcon, Maximize, Lock, Unlock, Layers, ChevronDown, Sparkles,
  User, Building2, FileSpreadsheet
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { cn, sanitizeUrl } from '../utils';
import { safeRequestFullscreen, safeExitFullscreen, isFullscreenActive } from '../utils/fullscreen';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useProject } from '../contexts/ProjectContext';
import { useLanguage } from '../contexts/LanguageContext';
import { hasFeature } from '../utils/planFeatures';
import { useTheme } from '../contexts/ThemeContext';
import { usePermissions } from '../hooks/usePermissions';
import { safeStorage } from '../utils/safeStorage';
import { fetchSystemConfigJSON, saveSystemConfigJSON } from '../utils/configHelper';
import { supabase } from '../lib/supabase';
import { callGeminiAPI } from '../utils/geminiClient';
import InvoiceStudio from './InvoiceStudio';
import UniversalPDFStudio from './UniversalPDFStudio';
import AiBudgetImportModal from './AiBudgetImportModal';
import { uploadPdfBlobWithFallback } from '../utils/cloudStorageHelper';
import { notifyNewDocument } from '../utils/documentNotificationHelper';
import { demoTemplates } from '../utils/demoTemplates';

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
  de: { finance_budget: 'Finanzen & Budget', overview: 'Übersicht', budget_plan: 'Budgetplan', payment_control: 'Zahlungskontrolle', cashflow: 'Cashflow & Hauptbuch', all_time: 'Gesamte Zeit', this_year: 'Dieses Jahr', this_month: 'Dieser Monat', today: 'Heute', book_hours: 'Stunden erfassen', quote: 'Offerte', receipt: 'Beleg', invoice: 'Rechnung', planned: 'Geplant', actual_costs: 'Ist-Kosten', variance: 'Abweichung', pos: 'Pos', description: 'Beschreibung', qty: 'Menge', unit: 'Einh.', unit_price: 'EP', total: 'Total', subtotal: 'Zwischentotal', vat: 'MWST', total_amount: 'Bruttobetrag', budget_supplement: 'Nachtrag', internal_hours_time_tracking: 'Interne Stunden', date: 'Datum', budget_assignment: 'Budget-Zuweisung', credit_revenue: 'Haben (Umsatz)', debit_costs: 'Soll (Kosten)', balance_profit: 'Saldo', free_booking: 'Freie Buchung', status: 'Status', open: 'Offen', paid: 'Bezahlt', draft: 'Entwurf', no_bookings_period: 'Keine Buchungen.', book_costs: 'Kosten verbuchen', cancel: 'Abbrechen', take_photo: 'Foto aufnehmen', receipts_photos: 'Belege / Fotos', amount_chf: 'Betrag (CHF)', vendor_company: 'Firma', project: 'Projekt', book_receipt: 'Beleg erfassen', new_project: 'Neues Projekt', client: 'Kunde', new_variant: 'Neue Variante', duplicate_variant: 'Duplizieren', delete_variant: 'Löschen', approve: 'Freigeben', approve_revoke: 'Freigabe widerrufen', approved: 'Freigegeben', add_position: 'Position hinzufügen', new_phase: 'Neue Phase', status_updated: 'Status aktualisiert', update_error: 'Fehler', delete_confirm: 'Wirklich löschen?', booking_deleted: 'Gelöscht', delete_error: 'Fehler beim Löschen', hours_deleted: 'Stunden gelöscht', new_variant_created: 'Variante erstellt', variant_duplicated: 'Dupliziert', min_one_variant: 'Min. eine Variante', cant_delete_approved: 'Freigegebene können nicht gelöscht werden', variant_deleted: 'Gelöscht', revoke_confirm: 'Freigabe widerrufen?', approve_confirm: 'Freigeben?', approval_revoked: 'Widerrufen', budget_approved: 'Freigegeben', analyzing_ai: 'KI analysiert...', ai_failed: 'KI Fehler', receipt_live_received: 'Beleg erkannt!', project_profit: 'Projectgewinn', revenue: 'Umsatz', costs: 'Kosten', total_budget: 'Gesamtbudget', budget_utilization: 'Budget Auslastung', spent: 'Ausgegeben', no_budget_present: 'Kein Budget vorhanden', planned_vs_actual: 'Soll vs Ist', payment_control_inactive: 'Zahlungskontrolle Inaktiv', payment_control_inactive_desc: 'Gib ein Budget frei', total_project_excl_vat: 'Total Projekt (exkl. MwSt)', external_costs: 'Externe Kosten', invoices_total: 'Rechnungen Total', expenses_team: 'Spesen', ext_costs: 'Externe Kosten', open_quotes: 'Offene Offerten', quotes: 'Offerten', outgoing_invoices: 'Rechnungen', expenses: 'Spesen', no_entries: 'Keine Einträge', simple_internal: 'Einfach (Intern)', detailed_external: 'Detailliert (Extern)', generate_pdf_book: 'PDF generieren & verbuchen', rotate: 'Tabelle zeigen', remaining: 'Verbleibend', invoice_saved: 'Rechnung erfolgreich gespeichert', save_error: 'Fehler beim Speichern', quote_saved: 'Offerte erfolgreich gespeichert', receipt_booked_success: 'Beleg erfolgreich verbucht', hours_booked_success: 'Stunden erfolgreich erfasst' },
  en: { finance_budget: 'Finance & Budget', overview: 'Overview', budget_plan: 'Budget Plan', payment_control: 'Payment Control', cashflow: 'Cashflow & Ledger', all_time: 'All Time', this_year: 'This Year', this_month: 'This Month', today: 'Today', book_hours: 'Book Hours', quote: 'Quote', receipt: 'Receipt', invoice: 'Invoice', planned: 'Planned', actual_costs: 'Actual Costs', variance: 'Variance', pos: 'Pos', description: 'Description', qty: 'Qty', unit: 'Unit', unit_price: 'Unit Price', total: 'Total', subtotal: 'Subtotal', vat: 'VAT', total_amount: 'Total Amount', budget_supplement: 'Supplement', internal_hours_time_tracking: 'Internal Hours', date: 'Date', budget_assignment: 'Budget Assignment', credit_revenue: 'Credit (Revenue)', debit_costs: 'Debit (Costs)', balance_profit: 'Balance', free_booking: 'Free Booking', status: 'Status', open: 'Open', paid: 'Paid', draft: 'Draft', no_bookings_period: 'No bookings.', book_costs: 'Book Costs', cancel: 'Cancel', take_photo: 'Take Photo', receipts_photos: 'Receipts / Photos', amount_chf: 'Amount (CHF)', vendor_company: 'Company', project: 'Project', book_receipt: 'Book Receipt', new_project: 'New Project', client: 'Client', new_variant: 'New Variant', duplicate_variant: 'Duplicate', delete_variant: 'Delete', approve: 'Approve', approve_revoke: 'Revoke', approved: 'Approved', add_position: 'Add Pos', new_phase: 'New Phase', status_updated: 'Status updated', update_error: 'Error', delete_confirm: 'Delete?', booking_deleted: 'Deleted', delete_error: 'Error', hours_deleted: 'Hours deleted', new_variant_created: 'Variant created', variant_duplicated: 'Duplicated', min_one_variant: 'Min 1 variant', cant_delete_approved: 'Cant delete approved', variant_deleted: 'Deleted', revoke_confirm: 'Revoke?', approve_confirm: 'Approve?', approval_revoked: 'Revoked', budget_approved: 'Approved', analyzing_ai: 'AI analyzing...', ai_failed: 'AI Failed', receipt_live_received: 'Receipt recognized!', project_profit: 'Project Profit', revenue: 'Revenue', costs: 'Costs', total_budget: 'Total Budget', budget_utilization: 'Budget Utilization', spent: 'Spent', no_budget_present: 'No budget', planned_vs_actual: 'Planned vs Actual', payment_control_inactive: 'Payment Control Inactive', payment_control_inactive_desc: 'Approve a budget', total_project_excl_vat: 'Total Project (excl. VAT)', external_costs: 'External Costs', invoices_total: 'Invoices Total', expenses_team: 'Expenses', ext_costs: 'Ext. Costs', open_quotes: 'Open Quotes', quotes: 'Quotes', outgoing_invoices: 'Invoices', expenses: 'Expenses', no_entries: 'No entries', simple_internal: 'Simple (Internal)', detailed_external: 'Detailed (External)', generate_pdf_book: 'Generate PDF & Book', rotate: 'Show Table', remaining: 'Remaining', invoice_saved: 'Invoice successfully saved', save_error: 'Error saving document', quote_saved: 'Quote successfully saved', receipt_booked_success: 'Receipt successfully booked', hours_booked_success: 'Hours successfully booked' }
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
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#d1d5db', paddingBottom: 5, marginBottom: 5, alignItems: 'center' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingVertical: 6, alignItems: 'flex-start' },
  groupRow: { flexDirection: 'row', backgroundColor: '#f9fafb', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e5e7eb', paddingVertical: 8, marginTop: 10, alignItems: 'flex-start' },
  hrRow: { flexDirection: 'row', backgroundColor: '#fff7ed', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#fdba74', paddingVertical: 6, marginTop: 5, alignItems: 'flex-start' },
  col1: { width: '10%', paddingTop: 1 },
  col2: { width: '40%', paddingRight: 10 },
  col3: { width: '10%', textAlign: 'right', paddingTop: 1 },
  col4: { width: '10%', paddingLeft: 10, paddingTop: 1 },
  col5: { width: '15%', textAlign: 'right', paddingTop: 1 },
  col6: { width: '15%', textAlign: 'right', paddingTop: 1 },
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
                  <Text style={[pdfStyles.col1, pdfStyles.textBold, { color: settings.accentColor }]}>{group.pos}</Text>
                  <View style={pdfStyles.col2}>
                    <Text style={[pdfStyles.textBold, { color: settings.accentColor, fontSize: 9.5, lineHeight: 1.35 }]}>{group.title}</Text>
                  </View>
                  <Text style={pdfStyles.col3}></Text>
                  <Text style={pdfStyles.col4}></Text>
                  <Text style={pdfStyles.col5}></Text>
                  <Text style={[pdfStyles.col6, pdfStyles.textBold, { color: settings.accentColor }]}>{formatCHF(calculateGroupTotal(group))}</Text>
                </View>
                {group.items.map((item: any) => (
                  <View style={pdfStyles.tableRow} key={item.id} wrap={false}>
                    <Text style={[pdfStyles.col1, { fontSize: 8, color: '#6b7280' }]}>{item.pos}</Text>
                    <View style={pdfStyles.col2}>
                      <Text style={[pdfStyles.textBold, { fontSize: 9, lineHeight: 1.35 }]}>{item.description}</Text>
                    </View>
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
                <Text>{t('vat')} {vatRate}%</Text><Text style={pdfStyles.textBold}>{formatCHF(totalBudget * (vatRate / 100))}</Text>
              </View>
              <View style={{ flexDirection: 'row', width: 200, justifyContent: 'space-between', borderTopWidth: 1, borderColor: '#d1d5db', paddingTop: 5, marginTop: 5 }}>
                <Text style={[pdfStyles.textBold, { color: settings.accentColor, fontSize: 12 }]}>{t('total_amount').toUpperCase()}</Text>
                <Text style={[pdfStyles.textBold, { color: settings.accentColor, fontSize: 12 }]}>{formatCHF(totalBudget * (1 + vatRate / 100))}</Text>
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
              <Text style={[pdfStyles.col6, pdfStyles.textBold, { color: '#ef4444' }]}>{t('actual_costs')}</Text>
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
                        <Text style={[pdfStyles.col1, pdfStyles.textBold, { color: settings.accentColor }]}>{g.pos}</Text>
                        <View style={pdfStyles.col2}>
                          <Text style={[pdfStyles.textBold, { color: settings.accentColor, fontSize: 9.5, lineHeight: 1.35 }]}>{g.title}</Text>
                        </View>
                        <Text style={[pdfStyles.col5, pdfStyles.textBold]}>{formatCHF(plan)}</Text>
                        <Text style={[pdfStyles.col6, pdfStyles.textBold, { color: '#ef4444' }]}>{formatCHF(actual)}</Text>
                        <Text style={[pdfStyles.col6, pdfStyles.textBold, { color: diff < 0 ? '#ef4444' : '#10b981' }]}>{(diff >= 0 ? '+' : '')}{formatCHF(diff)}</Text>
                      </View>
                      {g.items.map((i: any) => {
                        const itemActual = getAllTimeActualCostForItem(i.id);
                        const itemDiff = i.total - itemActual;
                        return (
                          <View style={pdfStyles.tableRow} key={i.id} wrap={false}>
                            <Text style={[pdfStyles.col1, { fontSize: 8, color: '#6b7280' }]}>{i.pos}</Text>
                            <View style={pdfStyles.col2}>
                              <Text style={[pdfStyles.textBold, { fontSize: 9, lineHeight: 1.35 }]}>{i.description}</Text>
                            </View>
                            <Text style={pdfStyles.col5}>{formatCHF(i.total)}</Text>
                            <Text style={[pdfStyles.col6, { color: '#ef4444' }]}>{itemActual > 0 ? formatCHF(itemActual) : '-'}</Text>
                            <Text style={[pdfStyles.col6, pdfStyles.textBold, { color: itemDiff < 0 ? '#ef4444' : '#10b981' }]}>{(itemDiff >= 0 ? '+' : '')}{formatCHF(itemDiff)}</Text>
                          </View>
                        )
                      })}
                    </React.Fragment>
                  )
                })}
              </React.Fragment>
            ))}
            <View style={pdfStyles.hrRow} wrap={false}>
              <Text style={[pdfStyles.col1, pdfStyles.textBold, { color: '#ea580c' }]}>HR</Text>
              <Text style={[pdfStyles.col2, pdfStyles.textBold, { color: '#ea580c' }]}>{t('internal_hours_time_tracking')} ({allTimeHours} h)</Text>
              <Text style={pdfStyles.col5}>-</Text>
              <Text style={[pdfStyles.col6, pdfStyles.textBold, { color: '#ef4444' }]}>{formatCHF(allTimeHoursCost)}</Text>
              <Text style={[pdfStyles.col6, pdfStyles.textBold, { color: '#ef4444' }]}>-{formatCHF(allTimeHoursCost)}</Text>
            </View>
            <View style={{ marginTop: 20, alignItems: 'flex-end' }} wrap={false}>
              <View style={{ flexDirection: 'row', width: 350, justifyContent: 'space-between', borderTopWidth: 2, borderColor: '#9ca3af', paddingTop: 8, marginTop: 5 }}>
                <Text style={[pdfStyles.textBold, { fontSize: 12 }]}>{t('total_project_excl_vat')}</Text>
                <View style={{ flexDirection: 'row', gap: 15 }}>
                  <Text style={[pdfStyles.textBold, { fontSize: 12 }]}>{formatCHF(overviewTotalBudget)}</Text>
                  <Text style={[pdfStyles.textBold, { fontSize: 12, color: '#ef4444' }]}>{formatCHF(totalActualCostsIncludingHoursAllTime)}</Text>
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
              <Text style={[pdfStyles.col1, pdfStyles.textBold, { width: '15%' }]}>{t('date')}</Text>
              <Text style={[pdfStyles.col2, pdfStyles.textBold, { width: '35%' }]}>{t('description')}</Text>
              <Text style={[pdfStyles.col5, pdfStyles.textBold, { width: '20%', textAlign: 'left' }]}>{t('budget_assignment')}</Text>
              <Text style={[pdfStyles.col4, pdfStyles.textBold, { textAlign: 'right' }]}>Haben</Text>
              <Text style={[pdfStyles.col4, pdfStyles.textBold, { textAlign: 'right' }]}>Soll</Text>
              <Text style={[pdfStyles.col4, pdfStyles.textBold, { textAlign: 'right' }]}>Saldo</Text>
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
                  <Text style={[{ width: '15%', color: '#6b7280', paddingTop: 1 }]}>{tx.date}</Text>
                  <View style={{ width: '35%', paddingRight: 10 }}>
                    <Text style={[pdfStyles.textBold, { fontSize: 9, lineHeight: 1.35 }]}>{tx.description}</Text>
                  </View>
                  <View style={{ width: '20%', paddingRight: 5 }}>
                    <Text style={[{ fontSize: 8.5, color: '#6b7280', lineHeight: 1.3 }]}>{bdDetails ? `${bdDetails.phase} - ${bdDetails.item}` : t('free_booking')}</Text>
                  </View>
                  <Text style={[{ width: '10%', textAlign: 'right', paddingTop: 1 }, pdfStyles.textBold, { color: '#10b981' }]}>{isQuote ? `(${formatCHF(displayAmount)})` : (isRevenue && displayAmount > 0 ? `+${formatCHF(displayAmount)}` : '')}</Text>
                  <Text style={[{ width: '10%', textAlign: 'right', paddingTop: 1 }, pdfStyles.textBold, { color: '#ef4444' }]}>{!isQuote && !isRevenue && displayAmount > 0 ? `-${formatCHF(displayAmount)}` : ''}</Text>
                  <Text style={[{ width: '10%', textAlign: 'right', paddingTop: 1 }, pdfStyles.textBold, { color: isQuote ? '#9ca3af' : (isBalanceNegative ? '#ef4444' : '#10b981') }]}>{isQuote ? '-' : formatCHF(tx.balance)}</Text>
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
  const isExternal = receiptType === 'external_cost' || incomingData.type === 'external';
  return (
    <Document>
      <Page size={settings.format} orientation={settings.orientation} style={pdfStyles.page}>
        <View style={[pdfStyles.headerContainer, { borderBottomColor: settings.accentColor }]} fixed>
          <View style={pdfStyles.headerLeft}>
            <Text style={[pdfStyles.title, { color: settings.accentColor }]}>BUCHUNGSBELEG</Text>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase' }}>
              {isExternal ? 'EXTERNER KREDITORENBELEG' : 'INTERNER SPESEN- & AUSLAGENBELEG'}
            </Text>
          </View>
          <View style={{ textAlign: 'right', alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 9, color: '#6b7280', marginBottom: 2 }}>Datum: <Text style={{ color: '#000', fontWeight: 'bold' }}>{new Date(incomingData.date).toLocaleDateString('de-CH')}</Text></Text>
            <Text style={{ fontSize: 9, color: '#6b7280', marginBottom: 2 }}>Projekt: <Text style={{ color: '#000', fontWeight: 'bold' }}>{projectHeader.project}</Text></Text>
            {budgetDetails && <Text style={{ fontSize: 9, color: '#6b7280' }}>Zuweisung: <Text style={{ color: '#000', fontWeight: 'bold' }}>{budgetDetails.phase}</Text></Text>}
          </View>
        </View>

        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 5, marginBottom: 10 }}>
          <Text style={{ width: '35%', fontWeight: 'bold' }}>{isExternal ? 'Firma / Kreditor' : 'Begünstigter / Händler'}</Text>
          <Text style={{ width: '45%', fontWeight: 'bold' }}>Beschreibung & Buchungsdetails</Text>
          <Text style={{ width: '20%', fontWeight: 'bold', textAlign: 'right' }}>Betrag (CHF)</Text>
        </View>

        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 10 }}>
          <View style={{ width: '35%' }}>
            <Text style={{ backgroundColor: '#f3f4f6', color: '#111827', padding: 4, fontWeight: 'bold', fontSize: 9 }}>
              {isExternal ? (incomingData.company || incomingData.vendor || 'Lieferant') : (incomingData.vendor || 'Auslage')}
            </Text>
            {isExternal ? (
              <>
                {incomingData.invoiceNumber && <Text style={{ fontSize: 8, color: '#4b5563', marginTop: 3 }}>Rechnungs-Nr: {incomingData.invoiceNumber}</Text>}
                {incomingData.vatNumber && <Text style={{ fontSize: 8, color: '#4b5563', marginTop: 2 }}>MWST-Nr: {incomingData.vatNumber}</Text>}
                {incomingData.contactPerson && <Text style={{ fontSize: 8, color: '#4b5563', marginTop: 2 }}>Kontakt: {incomingData.contactPerson}</Text>}
                {incomingData.dueDate && <Text style={{ fontSize: 8, color: '#4b5563', marginTop: 2 }}>Fällig bis: {new Date(incomingData.dueDate).toLocaleDateString('de-CH')}</Text>}
                {incomingData.creditorCategory && <Text style={{ fontSize: 8, color: '#4b5563', marginTop: 2 }}>Kategorie: {incomingData.creditorCategory}</Text>}
                {incomingData.iban && <Text style={{ fontSize: 8, color: '#4b5563', marginTop: 2 }}>IBAN: {incomingData.iban}</Text>}
              </>
            ) : (
              <>
                {incomingData.beneficiaryName && <Text style={{ fontSize: 8, color: '#4b5563', marginTop: 3 }}>Mitarbeiter: {incomingData.beneficiaryName}</Text>}
                {incomingData.expenseCategory && <Text style={{ fontSize: 8, color: '#4b5563', marginTop: 2 }}>Kategorie: {incomingData.expenseCategory}</Text>}
                {incomingData.paymentMethod && <Text style={{ fontSize: 8, color: '#4b5563', marginTop: 2 }}>Zahlungsart: {incomingData.paymentMethod}</Text>}
              </>
            )}
          </View>
          <View style={{ width: '45%', paddingRight: 10 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 9 }}>{incomingData.description || '-'}</Text>
            {budgetDetails && <Text style={{ fontSize: 8, color: '#4b5563', marginTop: 3 }}>BKP / Pos: {budgetDetails.item}</Text>}
            <Text style={{ fontSize: 8, color: '#4b5563', marginTop: 2 }}>MWST: {incomingData.vatRate || 8.1}%</Text>
            {isExternal && incomingData.skontoRate > 0 && (
              <Text style={{ fontSize: 8, color: '#059669', marginTop: 2, fontWeight: 'bold' }}>
                Skonto: {incomingData.skontoRate}% (Netto: CHF {formatCHF(Number(incomingData.amount) * (1 - incomingData.skontoRate / 100))})
              </Text>
            )}
          </View>
          <View style={{ width: '20%', alignItems: 'flex-end' }}>
            <Text style={{ textAlign: 'right', fontWeight: 'bold', color: settings.accentColor, fontSize: 13 }}>
              {formatCHF(Number(incomingData.amount))}
            </Text>
            <Text style={{ fontSize: 8, color: '#6b7280', marginTop: 4 }}>Status: {incomingData.status || 'Offen'}</Text>
          </View>
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
  const { hasPermission } = usePermissions();
  const { activeProjectId, projects, projectMembers, timeEntries, addTimeEntry, isDemoMode, demoData } = useProject() as any;
  const { projectId: urlProjectId } = useParams<{ projectId: string }>();
  const currentProjectId = urlProjectId || activeProjectId;
  const canViewFinance = isDemoMode || currentProjectId === 'demo-1' || currentProjectId?.startsWith('demo-') || hasPermission('canViewFinance');
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;
  const { theme } = useTheme();
  const tooltipContentStyle = { backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff', borderColor: theme === 'dark' ? '#27272a' : '#e4e4e7', color: theme === 'dark' ? '#fafafa' : '#09090b', borderRadius: '8px' };

  const activeProject = projects?.find((p: any) => p.id === currentProjectId);

  const currentMember = projectMembers?.find((m: any) => m.projectId === currentProjectId && m.userId === currentUser?.uid);
  const isReadOnly = currentMember ? (currentMember.projectRole === 'Viewer') : false;

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);



  const finStorageKey = `fin_state_${currentProjectId || 'global'}`;
  const [activeTab, setActiveTabRaw] = useState<'overview' | 'budget' | 'control' | 'cashflow'>(() => {
    const saved = safeStorage.getItem<{ activeTab?: any } | null>(finStorageKey, null);
    return saved?.activeTab || 'overview';
  });

  const [timeFilter, setTimeFilterRaw] = useState<'all' | 'year' | 'month' | 'today'>(() => {
    const saved = safeStorage.getItem<{ timeFilter?: any } | null>(finStorageKey, null);
    return saved?.timeFilter || 'all';
  });

  const setActiveTab = (tab: 'overview' | 'budget' | 'control' | 'cashflow') => {
    setActiveTabRaw(tab);
    const saved = safeStorage.getItem<Record<string, any>>(finStorageKey, {});
    safeStorage.setItem(finStorageKey, { ...saved, activeTab: tab });
  };

  const setTimeFilter = (tf: 'all' | 'year' | 'month' | 'today') => {
    setTimeFilterRaw(tf);
    const saved = safeStorage.getItem<Record<string, any>>(finStorageKey, {});
    safeStorage.setItem(finStorageKey, { ...saved, timeFilter: tf });
  };

  // --- DIE NEUE ROTATIONS LOGIK FÜR iOS & MOBILE ---
  const [isLandscapeMode, setIsLandscapeMode] = useState(false);
  const [forceLandscapeView, setForceLandscapeView] = useState(false);
  const [isRotatedCss, setIsRotatedCss] = useState(false);
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
          if (!isFullscreenActive()) {
            await safeRequestFullscreen(document.documentElement);
          }

          if (window.screen.orientation && 'lock' in window.screen.orientation) {
            await (window.screen.orientation as any).lock('landscape');
          }
        } catch (e) {
          // Fallback schlägt still fehl -> Nutzer muss manuell drehen
        }
      };
      lockScreen();
    } else {
      const unlockScreen = async () => {
        try {
          if (isFullscreenActive()) {
            await safeExitFullscreen();
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
  const [incomingData, setIncomingData] = useState({
    type: 'internal',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    budgetPosId: '',
    vatRate: 8.1,
    // Intern (Spesen)
    beneficiaryUserId: '',
    beneficiaryName: '',
    vendor: '',
    receiptNumber: '',
    expenseCategory: 'Materialkauf & Muster',
    paymentMethod: 'Privat vorgelegt (Rückerstattung ausstehend)',
    status: 'Offen (Rückerstattung ausstehend)',
    // Externer Kreditor
    company: '',
    contactPerson: '',
    invoiceNumber: '',
    vatNumber: '',
    dueDate: '',
    skontoRate: 0,
    creditorCategory: 'Kreditorenrechnung (Handwerker / Material)',
    iban: ''
  });
  const [restKostenPrognose, setRestKostenPrognose] = useState<Record<string, number>>({});
  const [showCsvImportModal, setShowCsvImportModal] = useState(false);
  const [showAiBudgetModal, setShowAiBudgetModal] = useState(false);
  const [showCsvMenu, setShowCsvMenu] = useState(false);
  const csvMenuRef = useRef<HTMLDivElement>(null);
  const [csvImportText, setCsvImportText] = useState('');
  const [timeData, setTimeData] = useState({
    type: 'internal',
    date: new Date().toISOString().split('T')[0],
    hours: 0,
    hourlyRate: 120,
    description: '',
    budgetPosId: '',
    // Intern
    userId: '',
    isBillable: true,
    overtimeType: 'normal' as 'normal' | 'overtime' | 'compensation',
    breakMinutes: 0,
    // Extern
    company: '',
    specialistName: '',
    orderNumber: '',
    rapportNumber: '',
    approvalStatus: 'Zur Prüfung eingereicht',
    approvedBy: ''
  });
  const mobileCameraRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [opCostSessionId] = useState(() => Math.random().toString(36).substring(2, 15));
  const mobileUploadUrl = `${window.location.origin}/mobile-upload/extern/${opCostSessionId}`;

  // Close CSV dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (csvMenuRef.current && !csvMenuRef.current.contains(e.target as Node)) {
        setShowCsvMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Realtime & Polling listener for Smartphone Live Scan (QR Code)
  useEffect(() => {
    if (!opCostSessionId) return;
    let isMounted = true;

    const channel = supabase.channel(`mobile_upload_${opCostSessionId}`)
      .on('broadcast', { event: 'receipt_uploaded' }, async (payload: any) => {
        if (!isMounted) return;
        const data = payload?.payload;
        if (data?.url) {
          setIncomingReceipts(prev => prev.includes(data.url) ? prev : [...prev, data.url]);
          await processImageWithAI(null, data.url, data.type || 'image/jpeg');
          addToast('Beleg vom Smartphone empfangen & analysiert!', 'success');
        }
      })
      .subscribe();

    const pollInterval = setInterval(async () => {
      if (!isMounted) return;
      try {
        const { data: docs } = await supabase
          .from('documents')
          .select('*')
          .eq('company_id', opCostSessionId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (docs && docs.length > 0) {
          const doc = docs[0];
          const docUrl = doc.url || doc.file_url;
          if (docUrl) {
            setIncomingReceipts(prev => {
              if (prev.includes(docUrl)) return prev;
              processImageWithAI(null, docUrl, doc.type || 'image/jpeg');
              addToast('Beleg vom Smartphone empfangen & analysiert!', 'success');
              return [...prev, docUrl];
            });
          }
        }
      } catch (err) { }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [opCostSessionId]);

  // === MULTI-TENANT FILTERUNG ===
  useEffect(() => {
    // 🔥 DEMO-BRÜCKE: Lade Daten aus deinem Template!
    if ((isDemoMode || currentProjectId === 'demo-1' || currentProjectId?.startsWith('demo-')) && demoData) {
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

    // --- REGULÄRER SUPABASE FETCH FÜR ECHTE USER ---
    if (!currentUser || !currentProjectId) return;

    const safeCompanyId = currentUser?.companyId || currentUser?.uid;
    if (!safeCompanyId) return;
    const fetchData = async () => {
      if (!safeCompanyId) return;
      const { data: txs } = await supabase
        .from('transactions')
        .select('*')
        .eq('company_id', safeCompanyId)
        .eq('project_id', currentProjectId)
        .order('created_at', { ascending: false });

      if (txs && txs.length > 0) {
        setTransactions(txs.map(t => ({
          ...t,
          projectId: t.project_id,
          companyId: t.company_id,
          ownerId: t.owner_id
        } as Transaction)));
      } else {
        setTransactions([]);
      }

      // SafeStorage Cache Key
      const localCacheKey = `finance_cache_${currentProjectId}`;
      const cachedData = safeStorage.getItem<any>(localCacheKey, null);

      // FETCH BUDGET VERSIONS FROM SYSTEM_CONFIG (silently handle missing column/table error)
      let finConfig: any = null;
      try {
        finConfig = await fetchSystemConfigJSON(`finance_${currentProjectId}`, safeCompanyId);
      } catch (e) { }

      const configData = finConfig || cachedData;
      const hasValidVersions = Array.isArray(configData?.versions) && configData.versions.length > 0;

      if (hasValidVersions) {
        setVersions(configData.versions);
        if (configData.activeVersionId) setActiveVersionId(configData.activeVersionId);
        if (configData.projectHeader) setProjectHeader(configData.projectHeader);
        if (configData.includeOptions !== undefined) setIncludeOptions(configData.includeOptions);
      } else {
        const isDemo = isDemoMode || currentProjectId?.startsWith('demo-') || currentProjectId === 'demo-1' || currentProjectId === 'global';
        const initGroups = (isDemo && demoTemplates.construction?.financeGroups)
          ? demoTemplates.construction.financeGroups
          : [{ id: `g${Date.now()}`, pos: '100', title: 'Phase 1: Vorbereitung & Konzept', items: [{ id: `i${Date.now()}`, pos: '101', description: 'Planung & Koordination', qty: 1, unit: 'Std.', unitPrice: 0, option: 0, total: 0 }] }];
        const initVersion: BudgetVersion = {
          id: `v-${isDemo ? 'approved' : 'draft'}-${currentProjectId}`,
          name: 'Originalbudget',
          vatRate: 8.1,
          status: isDemo ? 'approved' : 'draft',
          groups: initGroups
        };
        const initialFinanceData = {
          versions: [initVersion],
          activeVersionId: initVersion.id,
          projectHeader: {
            project: activeProject?.name || 'Quartier Neubau Süd',
            client: 'Bauherrschaft AG',
            date: new Date().toISOString().split('T')[0],
            version: 'Originalbudget'
          },
          includeOptions: false
        };
        setVersions([initVersion]);
        setActiveVersionId(initVersion.id);
        setProjectHeader(initialFinanceData.projectHeader);
        safeStorage.setItem(localCacheKey, initialFinanceData);

        try {
          await saveSystemConfigJSON(`finance_${currentProjectId}`, {
            ...initialFinanceData,
            ownerId: currentUser.uid,
            companyId: safeCompanyId,
            projectId: currentProjectId
          }, safeCompanyId, currentUser.uid);
        } catch (e) { }
      }

      setIsInitialLoad(false);
    };

    fetchData();

    const channel = supabase
      .channel('finance-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `company_id=eq.${safeCompanyId}` }, fetchData)
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel).catch(() => { });
    };
  }, [currentUser, currentProjectId, isDemoMode, demoData, activeProject]);

  // AUTO-SAVE TO LOCAL STORAGE & SUPABASE DOCUMENTS ON BUDGET CHANGES
  useEffect(() => {
    const safeCompanyId = currentUser?.companyId || currentUser?.uid;
    if (isDemoMode || isInitialLoad || !currentUser || !safeCompanyId || isReadOnly || !currentProjectId) return;

    const localCacheKey = `finance_cache_${currentProjectId}`;
    const saveData = {
      versions,
      activeVersionId,
      projectHeader,
      includeOptions,
      ownerId: currentUser.uid,
      companyId: safeCompanyId,
      projectId: currentProjectId
    };
    safeStorage.setItem(localCacheKey, saveData);

    const timeout = setTimeout(async () => {
      try {
        await saveSystemConfigJSON(`finance_${currentProjectId}`, saveData, safeCompanyId, currentUser.uid);
      } catch (e) { }
    }, 1500);
    return () => clearTimeout(timeout);
  }, [versions, activeVersionId, projectHeader, includeOptions, currentProjectId, currentUser, isReadOnly, isDemoMode, isInitialLoad]);

  const [companyColor, setCompanyColor] = useState('#10b981');
  useEffect(() => {
    const safeCompanyId = currentUser?.companyId || currentUser?.uid;
    if (!safeCompanyId) return;
    const fetchCompanyData = async () => {
      try {
        const { data: comp } = await supabase
          .from('companies')
          .select('*')
          .eq('id', safeCompanyId)
          .maybeSingle();
        const rawComp = comp as any;
        if (rawComp && (rawComp.primary_color || rawComp.primaryColor)) {
          setCompanyColor(rawComp.primary_color || rawComp.primaryColor);
        }
      } catch (e) {
        console.warn('Company color fetch fallback handled:', e);
      }
    };
    fetchCompanyData();
  }, [currentUser?.companyId]);

  useEffect(() => {
    if (!opCostSessionId || !showReceiptStudio) return;
  }, [opCostSessionId, showReceiptStudio]);

  // 🔥 SICHERE BERECHNUNG MIT FALLBACK
  const calculateGroupTotal = (group: BudgetGroup) => {
    if (!group || !group.items) return 0;
    return group.items.reduce((sum, item) => sum + (Number(item.total) || (Number(item.qty || (item as any).quantity || 0) * Number(item.unitPrice || (item as any).unit_price || 0))) + (includeOptions ? (Number(item.option) || 0) : 0), 0);
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

  const [localTimeEntries, setLocalTimeEntries] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;
    const fetchTimes = async () => {
      try {
        const localCacheKey = `time_entries_cache_${safeCompanyId}`;
        const localTimes: any[] = safeStorage.getItem<any[]>(localCacheKey, []);

        const { data: times } = await supabase.from('time_entries').select('*').eq('company_id', safeCompanyId);
        const configTime = await fetchSystemConfigJSON<{ entries?: any[] }>(`time_entries_${safeCompanyId}`, safeCompanyId);
        const configTimes = configTime?.entries || [];

        const map = new Map();
        [...localTimes, ...configTimes, ...(times || [])].forEach((t: any) => {
          if (t && (t.id || t.hours)) {
            const tId = t.id || `time-${t.date}-${t.hours}`;
            map.set(tId, {
              id: tId,
              userId: t.userId || t.user_id,
              projectId: t.projectId || t.project_id || 'global',
              date: t.date || new Date().toISOString().split('T')[0],
              hours: Number(t.hours || 0),
              description: t.description || 'Zeiterfassung',
              hourlyRate: Number(t.hourlyRate || t.hourly_rate || 120),
              isBillable: t.isBillable !== undefined ? t.isBillable : true,
              budgetPosId: t.budgetPosId || t.budget_pos_id || ''
            });
          }
        });
        setLocalTimeEntries(Array.from(map.values()));
      } catch (err) {
        console.warn("Finance fetchTimes error:", err);
      }
    };
    fetchTimes();
  }, [currentUser, currentProjectId]);

  if (isMounted && !canViewFinance) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-background text-text-primary">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
        <h1 className="text-2xl font-bold mb-2">Zugriff verweigert</h1>
        <p className="text-text-muted mb-6">Sie haben keine Berechtigung, die Finanzen dieses Projekts einzusehen.</p>
        <button onClick={() => navigate(`/project/${currentProjectId}`)} className="px-6 py-2.5 bg-accent-ai text-white rounded-lg font-semibold hover:opacity-90 transition-opacity cursor-pointer">
          Zurück zum Projekt
        </button>
      </div>
    );
  }

  const filteredTransactions = getFilteredTransactions();

  const allTimeEntriesCombined = [...(timeEntries || []), ...localTimeEntries];
  const combinedMap = new Map();
  allTimeEntriesCombined.forEach((t: any) => combinedMap.set(t.id || `time-${t.date}-${t.hours}`, t));
  const effectiveTimeEntries = Array.from(combinedMap.values());

  const getFilteredTimeEntries = () => {
    let result = effectiveTimeEntries.filter((e: any) => e.projectId === currentProjectId);
    const now = new Date();
    if (timeFilter === 'year') {
      const year = now.getFullYear();
      result = result.filter((e: any) => e.date && new Date(e.date).getFullYear() === year);
    } else if (timeFilter === 'month') {
      const year = now.getFullYear();
      const month = now.getMonth();
      result = result.filter((e: any) => {
        if (!e.date) return false;
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() === month;
      });
    } else if (timeFilter === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      result = result.filter((e: any) => e.date === todayStr);
    }
    return result;
  };

  const filteredTimeEntries = getFilteredTimeEntries();

  const filteredHoursCost = filteredTimeEntries.reduce((sum: number, e: any) => sum + ((Number(e.hours) || 0) * (e.hourlyRate || 0)), 0);
  const isExpenseTx = (tx: any) =>
    tx.type === 'expense' ||
    tx.type === 'operating_cost' ||
    (typeof tx.category === 'string' && (
      tx.category.includes('Kreditor') ||
      tx.category.includes('Honorar') ||
      tx.category.includes('Gebühr') ||
      tx.category === 'Spesen' ||
      tx.category === 'Material'
    )) ||
    (tx.category !== 'Debitorenrechnung' && tx.category !== 'Outgoing Invoice' && tx.category !== 'Offerte' && tx.category !== 'Quote' && tx.type !== 'income' && Number(tx.amount) < 0);

  const isRevenueTx = (tx: any) =>
    tx.type === 'income' ||
    tx.category === 'Debitorenrechnung' ||
    tx.category === 'Outgoing Invoice' ||
    (tx.category !== 'Offerte' && tx.category !== 'Quote' && Number(tx.amount) > 0);

  const filteredInvoiced = filteredTransactions.filter(isRevenueTx).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const filteredExtSpent = filteredTransactions.filter(isExpenseTx).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const filteredSpent = filteredExtSpent + filteredHoursCost;
  const filteredProfit = filteredInvoiced - filteredSpent;

  const allTimeTimeEntries = effectiveTimeEntries.filter((e: any) => e.projectId === currentProjectId);
  const allTimeHoursCost = allTimeTimeEntries.reduce((sum: number, e: any) => sum + ((Number(e.hours) || 0) * (e.hourlyRate || 0)), 0);
  const allTimeHours = allTimeTimeEntries.reduce((sum: number, e: any) => sum + (Number(e.hours) || 0), 0);

  const getFilteredActualCostForItem = (itemId: string) => filteredTransactions.filter(tx => tx.budgetPosId === itemId && isExpenseTx(tx)).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const getFilteredActualCostForGroup = (group: BudgetGroup) => group.items.reduce((sum, item) => sum + getFilteredActualCostForItem(item.id), 0);

  const getAllTimeActualCostForItem = (itemId: string) => transactions.filter(tx => tx.budgetPosId === itemId && isExpenseTx(tx)).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const getAllTimeActualCostForGroup = (group: BudgetGroup) => group.items.reduce((sum, item) => sum + getAllTimeActualCostForItem(item.id), 0);

  const overviewTotalBudget = approvedVersions.length > 0
    ? approvedVersions.reduce((sum, v) => sum + v.groups.reduce((s, g) => s + calculateGroupTotal(g), 0), 0)
    : totalBudget;

  const globalExtSpent = transactions.filter(isExpenseTx).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
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
    amount: -(Number(e.hours || 0) * Number(e.hourlyRate || 0)), status: 'Gebucht', isTimeEntry: true, hours: e.hours, userId: e.userId, budgetPosId: e.budgetPosId || '', url: ''
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

  const overBudgetPositions = budgetGroups.flatMap(g => g.items.map(i => {
    const actual = getAllTimeActualCostForItem(i.id);
    const planned = i.total || ((i.qty || 0) * (i.unitPrice || 0));
    const variance = actual - planned;
    return { ...i, groupTitle: g.title, actual, planned, variance, isOver: variance > 0 };
  })).filter(x => x.isOver);

  const exportLedgerCSV = () => {
    const headers = ['Datum', 'Kategorie', 'Beschreibung', 'Soll (Kosten CHF)', 'Haben (Umsatz CHF)', 'Saldo (CHF)', 'Status'];
    const rows = displayLedger.map(tx => [
      tx.date,
      tx.category,
      tx.description,
      tx.amount < 0 ? Math.abs(tx.amount).toFixed(2) : '0.00',
      tx.amount > 0 ? tx.amount.toFixed(2) : '0.00',
      tx.balance ? tx.balance.toFixed(2) : '0.00',
      tx.status || 'Gebucht'
    ]);
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Hauptbuch_${projectHeader.project.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    addToast('Hauptbuch als CSV exportiert!', 'success');
  };

  const exportBudgetCSV = () => {
    const headers = ['BKP/Pos', 'Phase/Gruppe', 'Bezeichnung', 'Menge', 'Einheit', 'Einheitspreis (CHF)', 'Total Netto (CHF)', 'Ist-Kosten (CHF)', 'Abweichung (CHF)'];
    const rows: (string | number)[][] = [];
    budgetGroups.forEach(g => {
      rows.push([g.pos, g.title, '--- Gruppe Total ---', '', '', '', calculateGroupTotal(g).toFixed(2), getAllTimeActualCostForGroup(g).toFixed(2), (getAllTimeActualCostForGroup(g) - calculateGroupTotal(g)).toFixed(2)]);
      g.items.forEach(i => {
        const planned = i.total || ((i.qty || 0) * (i.unitPrice || 0));
        const actual = getAllTimeActualCostForItem(i.id);
        rows.push([i.pos, g.title, i.description, i.qty, i.unit, i.unitPrice.toFixed(2), planned.toFixed(2), actual.toFixed(2), (actual - planned).toFixed(2)]);
      });
    });
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Budgetplan_BKP_${projectHeader.project.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    addToast('Budgetplan als CSV exportiert!', 'success');
  };

  const handleImportCSV = () => {
    if (!csvImportText.trim()) return;
    try {
      const lines = csvImportText.split('\n').map(l => l.trim()).filter(Boolean);
      const newItems: BudgetItem[] = [];
      lines.forEach((line, index) => {
        const parts = line.split(/[,;\t]/).map(p => p.trim().replace(/^"/, '').replace(/"$/, ''));
        if (parts.length >= 2) {
          const pos = parts[0] || `${100 + index}`;
          const description = parts[1] || 'Importierte Position';
          const qty = parseFloat(parts[2]) || 1;
          const unit = parts[3] || 'Stk';
          const unitPrice = parseFloat(parts[4]) || 0;
          const total = qty * unitPrice;
          newItems.push({ id: `imp-${Date.now()}-${index}`, pos, description, qty, unit, unitPrice, option: 0, total });
        }
      });
      if (newItems.length > 0) {
        setVersions(prev => prev.map(v => v.id === activeVersionId ? {
          ...v,
          groups: v.groups.length > 0 ? v.groups.map((g, idx) => idx === 0 ? { ...g, items: [...g.items, ...newItems] } : g) : [{ id: 'g-imp', pos: '100', title: 'Importierte Positionen', items: newItems }]
        } : v));
        addToast(`${newItems.length} BKP-Positionen aus CSV importiert!`, 'success');
        setShowCsvImportModal(false);
        setCsvImportText('');
      } else {
        addToast('Keine gültigen Zeilen im CSV gefunden.', 'error');
      }
    } catch (err) {
      addToast('Fehler beim Parsen der CSV-Datei.', 'error');
    }
  };

  const handleImportAiBudget = (
    importedGroups: BudgetGroup[],
    mode: 'new_version' | 'append' | 'replace',
    suggestedTitle?: string
  ) => {
    if (!importedGroups || importedGroups.length === 0) return;

    if (mode === 'new_version') {
      const newVersionNum = versions.length + 1;
      const newVerId = `v${Date.now()}`;
      const cleanTitle = suggestedTitle ? suggestedTitle.trim().slice(0, 24) : '';
      const newVersionName = cleanTitle
        ? `Variante ${newVersionNum} (${cleanTitle})`
        : `Variante ${newVersionNum} (Excel-Import)`;

      const newVersion: BudgetVersion = {
        id: newVerId,
        name: newVersionName,
        groups: importedGroups,
        vatRate: activeVersion.vatRate || 8.1,
        status: 'draft'
      };

      setVersions(prev => [...prev, newVersion]);
      setActiveVersionId(newVerId);
      addToast(`Neue Budget-Variante «${newVersionName}» mit ${importedGroups.length} Phasen erstellt!`, 'success');
    } else if (mode === 'append') {
      setVersions(prev => prev.map(v => {
        if (v.id !== activeVersionId) return v;
        return {
          ...v,
          groups: [...v.groups, ...importedGroups]
        };
      }));
      addToast(`${importedGroups.length} Phasen erfolgreich an «${activeVersion.name}» angehängt!`, 'success');
    } else if (mode === 'replace') {
      setVersions(prev => prev.map(v => {
        if (v.id !== activeVersionId) return v;
        return {
          ...v,
          groups: importedGroups
        };
      }));
      addToast(`Budget «${activeVersion.name}» mit ${importedGroups.length} importierten Phasen aktualisiert!`, 'success');
    }
  };

  const handleExportCSV = async () => {
    const safeCompanyId = currentUser?.companyId || (currentUser as any)?.company_id || currentUser?.uid;
    if (!currentUser || !safeCompanyId) return;
    try {
      addToast('Bereite Export vor...', 'info');
      let projectDefects: any[] = [];
      const queryB = supabase.from('defects').select('*').eq('company_id', safeCompanyId);
      if (currentProjectId) queryB.eq('project_id', currentProjectId);
      const { data: defectsData } = await queryB;
      if (defectsData) projectDefects = defectsData;

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
      try {
        const safeCompanyId = currentUser?.companyId || currentUser?.uid;
        let query = supabase.from('transactions').delete().eq('id', id);
        if (safeCompanyId) query = query.eq('company_id', safeCompanyId);
        await query;
        setTransactions(prev => prev.filter(tx => tx.id !== id));
        addToast(t('booking_deleted'), 'success');
      }
      catch (error) { addToast(t('delete_error'), 'error'); }
    }
  };

  const updateTransactionStatus = async (id: string, newStatus: string) => {
    if (isReadOnly) return;
    try {
      const safeCompanyId = currentUser?.companyId || currentUser?.uid;
      let query = supabase.from('transactions').update({ status: newStatus }).eq('id', id);
      if (safeCompanyId) query = query.eq('company_id', safeCompanyId);
      await query;
      setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status: newStatus } : tx));
      addToast(t('status_updated'), 'success');
    }
    catch (e) { addToast(t('update_error'), 'error'); }
  };

  const handleCreateNewVersion = () => {
    const newId = `v${Date.now()}`;
    setVersions([...versions, {
      id: newId,
      name: t('new_variant'),
      vatRate: 8.1,
      status: 'draft',
      groups: [{
        id: `g${Date.now()}`,
        pos: '100',
        title: t('new_phase'),
        items: [{ id: `i${Date.now()}`, pos: '101', description: '', qty: 1, unit: 'Std.', unitPrice: 0, option: 0, total: 0 }]
      }]
    }]);
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
    const totalItems = (activeVersion.groups || []).reduce((acc, g) => acc + (g.items?.length || 0), 0);

    // If approved and empty, immediately unlock without prompt
    if (isCurrentlyApproved && totalItems === 0) {
      setVersions(prev => prev.map(v => v.id === activeVersionId ? { ...v, status: 'draft' } : v));
      addToast('Budget zur Bearbeitung entsperrt (Entwurf)', 'success');
      return;
    }

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

  const processImageWithAI = async (base64Data: string | null, imageUrl: string | null, mimeType: string = 'image/jpeg') => {
    setIsAnalyzingAI(true); addToast(t('analyzing_ai'), 'info');
    try {
      let b64 = base64Data;
      let effectiveMime = mimeType || 'image/jpeg';
      if (!b64 && imageUrl) {
        try {
          const res = await fetch(imageUrl);
          const blob = await res.blob();
          effectiveMime = blob.type || 'image/jpeg';
          const reader = new FileReader();
          b64 = await new Promise((resolve) => {
            reader.onloadend = () => {
              const resStr = (reader.result as string) || '';
              resolve(resStr.split(',')[1] || null);
            };
            reader.readAsDataURL(blob);
          });
        } catch (fetchErr) {
          console.warn("Could not convert imageUrl to base64:", fetchErr);
        }
      }
      if (!b64) throw new Error("No image data");

      const prompt = "Analysiere diese Quittung / diese Rechnung. Antworte AUSSCHLIESSLICH im JSON Format mit diesen Keys: {\"total\": number, \"vendor\": string, \"category\": string, \"description\": string}";
      const response = await callGeminiAPI('gemini-2.5-flash', [
        { inlineData: { data: b64, mimeType: effectiveMime } },
        { text: prompt }
      ]);

      let text = typeof response === 'string' ? response : (response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const aiData = JSON.parse(jsonMatch[0]);
        applyAiData(aiData);
        addToast(t('receipt_live_received'), 'success');
      } else {
        addToast(t('ai_failed'), 'error');
      }
    } catch (error) {
      console.error("AI receipt error:", error);
      addToast(t('ai_failed'), 'error');
    } finally {
      setIsAnalyzingAI(false);
    }
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
    const safeCompanyId = currentUser?.companyId || (currentUser as any)?.company_id || currentUser?.uid;
    if (!currentUser || !safeCompanyId || !currentProjectId) return 'root';
    const { data: existing } = await supabase
      .from('documents')
      .select('id')
      .eq('company_id', safeCompanyId)
      .eq('name', folderName)
      .eq('project_id', currentProjectId)
      .maybeSingle();
    if (existing) return existing.id;

    const { data: newF } = await supabase.from('documents').insert({
      name: folderName, is_folder: true, category: docCategory, owner_id: currentUser.uid, company_id: safeCompanyId, project_id: currentProjectId, created_at: new Date().toISOString()
    }).select().maybeSingle();
    return newF ? newF.id : 'root';
  };

  const saveDocumentToCloud = async (fileData: any, category: string, defaultStatus: string = 'Offen') => {
    if (!currentUser) return false;
    const safeCompanyId = currentUser.companyId || currentUser.uid;
    const safeProjectId = currentProjectId || 'global';
    try {
      let downloadUrl = fileData.url || '';
      if (fileData.file) {
        const fileName = fileData.fileName || `Dokument_${Date.now()}.pdf`;
        downloadUrl = await uploadPdfBlobWithFallback(fileData.file, fileName, safeCompanyId);
      }
      const targetFolderId = await ensureFolderLocal('Finanzen', 'projects');
      const documentName = fileData.fileName || fileData.name || `Dokument_${Date.now()}.pdf`;
      const documentTotal = fileData.total !== undefined ? fileData.total : (fileData.amount || 0);

      await supabase.from('documents').insert({
        name: documentName, size: fileData.size || '0 MB', type: 'application/pdf', url: downloadUrl, file_url: downloadUrl, folder_id: targetFolderId, is_folder: false, owner_id: currentUser.uid, company_id: safeCompanyId, project_id: safeProjectId, category: 'projects', uploaded_by: currentUser.uid, created_at: new Date().toISOString()
      });
      const displayCategory = category === 'Debitorenrechnung' ? t('invoice') : t('quote');
      await supabase.from('transactions').insert({
        type: category === 'Debitorenrechnung' ? 'income' : 'quote',
        date: fileData.date || new Date().toISOString().split('T')[0],
        description: `${displayCategory}: ${documentName}`,
        category: category || 'Dokument',
        amount: documentTotal || 0,
        status: defaultStatus || 'Offen',
        owner_id: currentUser.uid,
        company_id: safeCompanyId,
        project_id: safeProjectId,
        receipt_urls: downloadUrl ? [downloadUrl] : []
      });
      await notifyNewDocument(safeCompanyId, documentName, category, safeProjectId);
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
    if (!currentUser) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;
    const safeProjectId = currentProjectId || 'global';
    try {
      const fileName = `Finanzbericht_${Date.now()}.pdf`;
      const downloadUrl = await uploadPdfBlobWithFallback(blob, fileName, safeCompanyId);
      const targetFolderId = await ensureFolderLocal("Finanzen", "projects");
      await supabase.from('documents').insert({ name: fileName, url: downloadUrl, file_url: downloadUrl, project_id: safeProjectId, folder_id: targetFolderId, category: 'projects', owner_id: currentUser.uid, company_id: safeCompanyId, uploaded_by: currentUser.uid, type: 'application/pdf', size: `${Math.round(blob.size / 1024)} KB`, is_folder: false, created_at: new Date().toISOString(), uploaded_at: new Date().toISOString(), date: new Date().toLocaleDateString('de-CH') });
      addToast('Erfolgreich exportiert', 'success');
      setIsPdfStudioOpen(false);
    } catch (e) { addToast('Fehler beim Speichern', 'error'); }
  };

  const handleSaveReceiptPdfToCloud = async (blob: Blob) => {
    if (!currentUser) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;
    const safeProjectId = currentProjectId || 'global';
    setIsSubmitting(true);
    try {
      const isExternal = receiptType === 'external_cost' || incomingData.type === 'external';
      const mainName = isExternal
        ? (incomingData.company || incomingData.vendor || 'Kreditor')
        : (incomingData.vendor || 'Spesen');
      const cleanMain = mainName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `Buchung_${cleanMain}_${Date.now()}.pdf`;
      const finalPdfUrl = await uploadPdfBlobWithFallback(blob, fileName, safeCompanyId);

      const uploadedUrls = [finalPdfUrl];

      let descPrefix = '';
      let transactionCategory = '';

      if (isExternal) {
        const invNum = incomingData.invoiceNumber ? ` [Rechnung: ${incomingData.invoiceNumber}]` : '';
        const vatNum = incomingData.vatNumber ? ` [MWST: ${incomingData.vatNumber}]` : '';
        descPrefix = `[Kreditor: ${mainName}${invNum}${vatNum}]`;
        transactionCategory = incomingData.creditorCategory || 'Kreditorenrechnung';
      } else {
        const beneficiary = projectMembers?.find((m: any) => m.userId === incomingData.beneficiaryUserId);
        const benName = beneficiary?.userEmail || incomingData.beneficiaryName || currentUser.email || 'Team';
        descPrefix = `[Spesen: ${benName} - ${incomingData.vendor || 'Auslage'}]`;
        transactionCategory = incomingData.expenseCategory || 'Spesen';
      }

      const budgetSuffix = incomingData.budgetPosId ? ` [Budget: ${incomingData.budgetPosId}]` : '';
      const fullDescription = `${descPrefix} ${incomingData.description || (isExternal ? 'Kreditorenrechnung' : 'Spesen')}${budgetSuffix}`.trim();
      const statusValue = incomingData.status || (isExternal ? 'Offen zur Prüfung' : 'Offen (Rückerstattung ausstehend)');

      await supabase.from('transactions').insert({
        type: 'expense',
        date: incomingData.date || new Date().toISOString().split('T')[0],
        description: fullDescription,
        category: transactionCategory,
        amount: -Math.abs(Number(incomingData.amount) || 0),
        status: statusValue,
        project_id: safeProjectId,
        owner_id: currentUser.uid,
        company_id: safeCompanyId,
        receipt_urls: uploadedUrls
      });

      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        date: incomingData.date || new Date().toISOString().split('T')[0],
        description: fullDescription,
        category: transactionCategory,
        amount: -Math.abs(Number(incomingData.amount) || 0),
        status: statusValue,
        budgetPosId: incomingData.budgetPosId || '',
        projectId: safeProjectId,
        ownerId: currentUser.uid
      };
      setTransactions(prev => [newTx, ...prev]);

      addToast(t('receipt_booked_success') || 'Erfolgreich verbucht', 'success');
      setIsReceiptPdfStudioOpen(false);
      setShowReceiptStudio(false);
      setIncomingReceipts([]);
      setIncomingData({
        type: isExternal ? 'external' : 'internal',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        description: '',
        budgetPosId: '',
        vatRate: 8.1,
        beneficiaryUserId: '',
        beneficiaryName: '',
        vendor: '',
        receiptNumber: '',
        expenseCategory: 'Materialkauf & Muster',
        paymentMethod: 'Privat vorgelegt (Rückerstattung ausstehend)',
        status: isExternal ? 'Offen zur Prüfung' : 'Offen (Rückerstattung ausstehend)',
        company: '',
        contactPerson: '',
        invoiceNumber: '',
        vatNumber: '',
        dueDate: '',
        skontoRate: 0,
        creditorCategory: 'Kreditorenrechnung (Handwerker / Material)',
        iban: ''
      });
    } catch (e) {
      addToast('Fehler beim Speichern', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (timeData.hours <= 0 || !currentProjectId) return;
    setIsSubmitting(true);
    try {
      if (typeof addTimeEntry === 'function') {
        const isExternal = timeData.type === 'external';
        const netHours = isExternal ? timeData.hours : Math.max(0, timeData.hours - ((timeData.breakMinutes || 0) / 60));
        let descPrefix = '';
        if (isExternal) {
          const comp = timeData.company || 'Partner';
          const rap = timeData.rapportNumber ? ` [Rapport: ${timeData.rapportNumber}]` : '';
          const ord = timeData.orderNumber ? ` [Bestell-Nr: ${timeData.orderNumber}]` : '';
          const spec = timeData.specialistName ? ` (${timeData.specialistName})` : '';
          const appr = timeData.approvedBy ? ` [Freigabe: ${timeData.approvedBy}]` : '';
          descPrefix = `[Extern: ${comp}${spec}${rap}${ord}${appr}] `;
        } else {
          const otLabel = timeData.overtimeType === 'overtime' ? ': Überstunden' : (timeData.overtimeType === 'compensation' ? ': Kompensation' : '');
          const brkLabel = timeData.breakMinutes > 0 ? ` (${timeData.breakMinutes}m Pause)` : '';
          descPrefix = `[Intern${otLabel}${brkLabel}] `;
        }

        const budgetSuffix = timeData.budgetPosId ? ` [Budget: ${timeData.budgetPosId}]` : '';
        const fullDesc = `${descPrefix}${timeData.description || 'Zeiterfassung'}${budgetSuffix}`;
        const safeCompanyId = currentUser?.companyId || currentUser?.uid;

        addTimeEntry({
          userId: isExternal ? 'external_partner' : (timeData.userId || currentUser?.uid || 'internal_team'),
          projectId: currentProjectId,
          date: timeData.date || new Date().toISOString().split('T')[0],
          hours: Number(netHours.toFixed(2)) || Number(timeData.hours) || 0,
          description: fullDesc,
          hourlyRate: timeData.hourlyRate || (isExternal ? 165 : 120),
          isBillable: isExternal ? true : (timeData.isBillable !== false),
          budgetPosId: timeData.budgetPosId || '',
          internalData: !isExternal ? {
            overtimeType: timeData.overtimeType || 'normal',
            breakMinutes: timeData.breakMinutes || 0,
            grossHours: timeData.hours,
            netHours: Number(netHours.toFixed(2)),
            budgetPosId: timeData.budgetPosId
          } : null,
          externalData: isExternal ? {
            company: timeData.company,
            specialistName: timeData.specialistName,
            orderNumber: timeData.orderNumber,
            rapportNumber: timeData.rapportNumber,
            approvalStatus: timeData.approvalStatus || 'Zur Prüfung eingereicht',
            approvedBy: timeData.approvedBy,
            budgetPosId: timeData.budgetPosId
          } : null
        }, safeCompanyId, currentUser.uid);

        addToast(t('hours_booked_success') || 'Erfolgreich verbucht', 'success');
        setShowTimeModal(false);
        setTimeData({
          type: isExternal ? 'external' : 'internal',
          userId: '',
          company: '',
          specialistName: '',
          orderNumber: '',
          rapportNumber: '',
          approvalStatus: 'Zur Prüfung eingereicht',
          approvedBy: '',
          overtimeType: 'normal',
          breakMinutes: 0,
          hours: 0,
          hourlyRate: isExternal ? 165 : 120,
          description: '',
          budgetPosId: '',
          isBillable: true,
          date: new Date().toISOString().split('T')[0]
        });
      } else {
        addToast('Fehler: Zeiterfassung noch nicht initialisiert.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔥 NEU: Der VOLLBILD-LANDSCAPE Handler für Smartphones 🔥
  if (isLandscapeMode) {
    if (isPortrait && !forceLandscapeView) {
      return createPortal(
        <div style={{ zIndex: 999999 }} className="fixed inset-0 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95">
          <div className="bg-surface border border-border p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full">
            <RotateCw size={48} className="mb-4 text-accent-ai animate-[spin_3s_linear_infinite]" />
            <h2 className="text-xl font-bold mb-2 text-text-primary">Tabellenansicht im Vollbild</h2>
            <p className="text-sm text-text-muted mb-6 font-medium">Drehe dein Smartphone ins Querformat oder öffne die Vollbild-Tabelle direkt.</p>
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => setForceLandscapeView(true)}
                className="w-full py-3 bg-accent-ai text-white rounded-xl font-bold transition-all shadow-lg hover:bg-accent-ai/90 flex items-center justify-center gap-2"
              >
                <Maximize size={18} /> Tabelle jetzt öffnen
              </button>
              <button
                onClick={() => { setForceLandscapeView(true); setIsRotatedCss(true); }}
                className="w-full py-3 bg-surface border border-border/80 text-text-primary rounded-xl font-bold hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCw size={18} /> 90° Drehen (CSS)
              </button>
              <button
                onClick={() => { setIsLandscapeMode(false); setForceLandscapeView(false); setIsRotatedCss(false); }}
                className="w-full py-2.5 text-text-muted hover:text-text-primary font-semibold text-sm transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>,
        document.body
      );
    }

    return createPortal(
      <div
        style={isRotatedCss ? {
          zIndex: 999999,
          width: '100vh',
          height: '100vw',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(90deg)',
          transformOrigin: 'center center'
        } : {
          zIndex: 999999,
          position: 'fixed',
          inset: 0
        }}
        className="bg-background text-text-primary p-0 lg:p-6 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
      >
        <div className="bg-surface lg:rounded-2xl border-0 lg:border border-border/50 p-4 lg:p-6 shadow-2xl flex-1 flex flex-col min-h-0 overflow-hidden w-full h-full">

          <div className="flex justify-between items-center mb-4 shrink-0">
            <h2 className="text-xl font-bold flex items-center gap-2 text-accent-ai"><RotateCw size={20} /> Tabellenansicht</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRotatedCss(prev => !prev)}
                className={cn("px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer", isRotatedCss ? "bg-accent-ai text-white border-accent-ai" : "bg-surface border-border/50 text-text-primary hover:bg-white/5")}
              >
                <RotateCw size={14} /> <span>90° Ansicht</span>
              </button>
              <button
                onClick={() => { setIsLandscapeMode(false); setForceLandscapeView(false); setIsRotatedCss(false); }}
                className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors font-bold flex items-center gap-2 cursor-pointer"
              >
                <X size={18} /> <span className="hidden sm:inline">Schließen</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar -mx-4 px-4 lg:-mx-6 lg:px-6">
            <div className="min-w-[1000px] pb-8">

              {activeTab === 'budget' && (
                <table className="w-full text-sm text-left border-collapse table-fixed">
                  <thead className="text-xs uppercase tracking-wider text-text-muted border-b border-border/50">
                    <tr>
                      <th className="px-4 py-3 w-16">{t('pos')}</th>
                      <th className="px-4 py-3">{t('description')}</th>
                      <th className="px-4 py-3 text-right w-24">{t('qty')}</th>
                      <th className="px-4 py-3 w-24">{t('unit')}</th>
                      <th className="px-4 py-3 text-right w-24">{t('unit_price')}</th>
                      {includeOptions && <th className="px-4 py-3 text-right w-24 text-accent-ai">Option</th>}
                      <th className="px-4 py-3 text-right w-36 text-blue-400 shrink-0">{t('total')} (CHF)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {budgetGroups.length === 0 ? (
                      <tr>
                        <td colSpan={includeOptions ? 7 : 6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-accent-ai/10 text-accent-ai flex items-center justify-center">
                              <Calculator size={24} />
                            </div>
                            <h4 className="font-bold text-base text-text-primary">Noch keine Phasen im Budgetplan</h4>
                            <p className="text-xs text-text-muted">
                              {activeVersion.status === 'approved'
                                ? "Dieses Budget ist als 'Freigegeben' markiert (schreibgeschützt). Entsperren Sie das Budget, um Phasen und Positionen anzulegen."
                                : "Erstellen Sie die erste Phase für dieses Projekt."}
                            </p>
                            {!isReadOnly && (
                              activeVersion.status === 'approved' ? (
                                <button
                                  onClick={() => {
                                    setVersions(prev => prev.map(v => v.id === activeVersionId ? {
                                      ...v,
                                      status: 'draft',
                                      groups: [{ id: `g${Date.now()}`, pos: '100', title: 'Phase 1: Vorbereitung & Konzept', items: [{ id: `i${Date.now()}`, pos: '101', description: 'Planung & Koordination', qty: 1, unit: 'Std.', unitPrice: 0, option: 0, total: 0 }] }]
                                    } : v));
                                    addToast('Budget entsperrt und Phase 1 erstellt', 'success');
                                  }}
                                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                                >
                                  <Unlock size={14} /> Budget entsperren & Phase erstellen
                                </button>
                              ) : (
                                <button
                                  onClick={() => setVersions(prev => prev.map(v => v.id === activeVersionId ? {
                                    ...v,
                                    groups: [{ id: `g${Date.now()}`, pos: '100', title: 'Phase 1: Vorbereitung & Konzept', items: [{ id: `i${Date.now()}`, pos: '101', description: 'Planung & Koordination', qty: 1, unit: 'Std.', unitPrice: 0, option: 0, total: 0 }] }]
                                  } : v))}
                                  className="px-4 py-2 bg-accent-ai hover:bg-accent-ai/90 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                                >
                                  <Plus size={14} /> Erste Phase erstellen
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      budgetGroups.map(group => {
                        const groupPlanTotal = calculateGroupTotal(group);
                        return (
                          <React.Fragment key={group.id}>
                            <tr className="bg-blue-500/10 border-y border-blue-500/20 group relative">
                              <td className="px-4 py-3 font-bold text-blue-400 align-top">{group.pos}</td>
                              <td className="px-4 py-3 font-bold text-blue-400 align-top" colSpan={includeOptions ? 5 : 4}>
                                <textarea
                                  className="bg-transparent text-blue-400 border-none outline-none w-full font-bold resize-none overflow-hidden leading-snug break-words block min-h-[28px]"
                                  rows={1}
                                  value={group.title}
                                  onChange={e => {
                                    setVersions(versions.map(v => v.id === activeVersionId ? { ...v, groups: v.groups.map(g => g.id === group.id ? { ...g, title: e.target.value } : g) } : v));
                                    e.target.style.height = 'auto';
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                  }}
                                  ref={el => {
                                    if (el) {
                                      el.style.height = 'auto';
                                      el.style.height = `${el.scrollHeight}px`;
                                    }
                                  }}
                                  disabled={activeVersion.status === 'approved'}
                                  placeholder="Titel der Phase"
                                />
                              </td>
                              <td className="px-4 py-3 font-bold text-right text-blue-400 relative align-top">
                                {formatCHF(groupPlanTotal)}
                                {!isReadOnly && activeVersion.status !== 'approved' && (
                                  <button onClick={() => handleDeleteGroup(group.id)} className="absolute right-2 top-3 text-red-500 opacity-0 group-hover:opacity-100 p-1 no-print cursor-pointer">
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </td>
                            </tr>
                            {group.items.length === 0 && (
                              <tr>
                                <td colSpan={includeOptions ? 7 : 6} className="px-4 py-3 text-xs text-text-muted italic bg-background/20">
                                  Noch keine Positionen in dieser Phase. {!isReadOnly && activeVersion.status !== 'approved' && "Klicken Sie unten auf '+ Position hinzufügen'."}
                                </td>
                              </tr>
                            )}
                            {group.items.map(item => (
                              <tr key={item.id} className="hover:bg-white/5 transition-colors group/row">
                                <td className="px-4 py-2 align-top text-xs text-text-muted font-medium pt-2.5">{item.pos}</td>
                                <td className="px-4 py-2 align-top">
                                  <textarea
                                    value={item.description}
                                    onChange={e => {
                                      handleBudgetChange(group.id, item.id, 'description', e.target.value);
                                      e.target.style.height = 'auto';
                                      e.target.style.height = `${e.target.scrollHeight}px`;
                                    }}
                                    ref={el => {
                                      if (el) {
                                        el.style.height = 'auto';
                                        el.style.height = `${el.scrollHeight}px`;
                                      }
                                    }}
                                    rows={1}
                                    className="w-full bg-transparent outline-none focus:border-b focus:border-accent-ai/50 py-1 font-medium text-text-primary resize-none overflow-hidden leading-relaxed break-words block min-h-[28px]"
                                    disabled={activeVersion.status === 'approved'}
                                    placeholder={t('description')}
                                  />
                                </td>
                                <td className="px-4 py-2 align-top text-right pt-2">
                                  <input type="number" value={item.qty || ''} onChange={e => handleBudgetChange(group.id, item.id, 'qty', e.target.value)} className={cn(numberInputClass, "font-medium text-text-primary")} disabled={activeVersion.status === 'approved'} />
                                </td>
                                <td className="px-4 py-2 align-top relative pt-2">
                                  <select value={item.unit} onChange={e => handleBudgetChange(group.id, item.id, 'unit', e.target.value)} className="bg-transparent text-text-primary outline-none w-full appearance-none cursor-pointer font-medium" disabled={activeVersion.status === 'approved'}>
                                    <option className="bg-surface">Std.</option>
                                    <option className="bg-surface">Stk.</option>
                                    <option className="bg-surface">Pauschal</option>
                                    <option className="bg-surface">m2</option>
                                    <option className="bg-surface font-bold text-accent-ai">Option</option>
                                  </select>
                                </td>
                                <td className="px-4 py-2 align-top text-right pt-2">
                                  <input type="number" value={item.unitPrice || ''} onChange={e => handleBudgetChange(group.id, item.id, 'unitPrice', e.target.value)} className={cn(numberInputClass, "font-medium text-text-primary")} disabled={activeVersion.status === 'approved'} />
                                </td>
                                {includeOptions && (
                                  <td className="px-4 py-2 align-top text-right bg-accent-ai/5 pt-2.5">
                                    <span className={item.option > 0 ? "text-accent-ai font-bold" : "text-text-muted font-medium"}>{item.option > 0 ? formatCHF(item.option) : '-'}</span>
                                  </td>
                                )}
                                <td className="px-4 py-2 align-top text-right font-bold relative text-text-primary pt-2.5">
                                  <span className={item.option > 0 ? "text-accent-ai" : ""}>{formatCHF(item.total + (includeOptions ? item.option : 0))}</span>
                                  {!isReadOnly && activeVersion.status !== 'approved' && (
                                    <button onClick={() => setVersions(versions.map(v => v.id === activeVersionId ? { ...v, groups: v.groups.map(g => g.id === group.id ? { ...g, items: g.items.filter(i => i.id !== item.id) } : g) } : v))} className="absolute right-1 top-2.5 text-red-500 opacity-0 group-hover/row:opacity-100 p-1 no-print cursor-pointer">
                                      <X size={14} />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                            {!isReadOnly && activeVersion.status !== 'approved' && (
                              <tr className="no-print">
                                <td colSpan={includeOptions ? 7 : 6} className="px-4 py-3 bg-background/30">
                                  <button onClick={() => setVersions(versions.map(v => v.id === activeVersionId ? { ...v, groups: v.groups.map(g => g.id === group.id ? { ...g, items: [...g.items, { id: `i${Date.now()}`, pos: `${g.pos.substring(0, 1)}0${g.items.length + 1}`, description: '', qty: 1, unit: 'Std.', unitPrice: 0, option: 0, total: 0 }] } : g) } : v))} className="text-xs font-bold flex items-center gap-1 text-accent-ai hover:underline cursor-pointer">
                                    <Plus size={14} /> {t('add_position')}
                                  </button>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        )
                      })
                    )}
                    {!isReadOnly && activeVersion.status !== 'approved' && budgetGroups.length > 0 && (
                      <tr className="no-print">
                        <td colSpan={includeOptions ? 7 : 6} className="px-4 py-6">
                          <button onClick={() => setVersions(versions.map(v => v.id === activeVersionId ? { ...v, groups: [...v.groups, { id: `g${Date.now()}`, pos: `${(v.groups.length + 1)}00`, title: t('new_phase'), items: [] }] } : v))} className="w-full py-3 border border-dashed border-accent-ai/30 text-accent-ai rounded-lg font-bold hover:bg-accent-ai/5 flex justify-center items-center gap-2 transition-colors cursor-pointer">
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
                        <input type="number" value={vatRate} onChange={e => setVersions(versions.map(v => v.id === activeVersionId ? { ...v, vatRate: parseFloat(e.target.value) || 0 } : v))} className={cn(numberInputClass, "font-medium w-16 px-2 py-1 rounded border border-border/50 bg-surface outline-none text-text-primary")} disabled={activeVersion.status === 'approved'} />%
                      </td>
                      {includeOptions && <td></td>}
                      <td className="px-4 py-3 text-right font-medium text-sm text-text-muted whitespace-nowrap">{formatCHF(totalBudget * (vatRate / 100))}</td>
                    </tr>
                    <tr className="bg-surface border-b-2 border-border">
                      <td colSpan={4} className="px-4 py-5"></td>
                      <td className="px-4 py-5 text-right font-bold text-sm uppercase text-text-primary whitespace-nowrap">{t('total_amount')}</td>
                      {includeOptions && <td></td>}
                      <td className="px-4 py-5 text-right font-bold text-sm text-blue-400 whitespace-nowrap">{formatCHF(totalBudget * (1 + vatRate / 100))}</td>
                    </tr>
                  </tfoot>
                </table>
              )}

              {activeTab === 'control' && (
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-surface border-b border-border/50">
                    <tr>
                      <th className="px-4 py-3 w-16 text-text-muted uppercase tracking-wider">{t('pos')}</th>
                      <th className="px-4 py-3 text-text-muted uppercase tracking-wider min-w-[180px]">{t('description')}</th>
                      <th className="px-4 py-3 text-right text-text-muted uppercase tracking-wider w-28">{t('planned')}</th>
                      <th className="px-4 py-3 text-right text-red-500 uppercase tracking-wider w-28">{t('actual_costs')}</th>
                      <th className="px-4 py-3 text-right text-accent-ai uppercase tracking-wider w-36">Restkosten (Prognose)</th>
                      <th className="px-4 py-3 text-right text-text-primary uppercase tracking-wider w-36">Voraussichtl. Total</th>
                      <th className="px-4 py-3 text-right text-text-muted uppercase tracking-wider w-28">{t('variance')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {approvedVersions.map((version) => (
                      <React.Fragment key={version.id}>
                        <tr className="bg-accent-ai/5">
                          <td colSpan={7} className="px-4 py-2 font-bold text-xs uppercase text-accent-ai tracking-widest">{t('budget_supplement')} {version.name}</td>
                        </tr>
                        {version.groups.map(group => {
                          const plan = calculateGroupTotal(group);
                          const actual = getAllTimeActualCostForGroup(group);
                          const groupRestkosten = group.items.reduce((sum, item) => sum + (restKostenPrognose[item.id] !== undefined ? restKostenPrognose[item.id] : Math.max(0, item.total - getAllTimeActualCostForItem(item.id))), 0);
                          const forecastTotal = actual + groupRestkosten;
                          const diff = plan - forecastTotal;
                          const isGroupOver = actual > plan;
                          return (
                            <React.Fragment key={group.id}>
                              <tr className="bg-surface/50 border-t border-border/50">
                                <td className="px-4 py-3 font-bold text-text-primary">{group.pos}</td>
                                <td className="px-4 py-3 font-bold text-text-primary flex items-center gap-2">
                                  {group.title}
                                  {isGroupOver && <span className="px-2 py-0.5 text-[10px] bg-red-500 text-white font-bold rounded-md uppercase">🔴 Über Budget</span>}
                                </td>
                                <td className="px-4 py-3 font-bold text-right text-text-primary">{formatCHF(plan)}</td>
                                <td className="px-4 py-3 font-bold text-right text-red-500">{formatCHF(actual)}</td>
                                <td className="px-4 py-3 font-bold text-right text-accent-ai">{formatCHF(groupRestkosten)}</td>
                                <td className="px-4 py-3 font-bold text-right text-text-primary">{formatCHF(forecastTotal)}</td>
                                <td className={cn("px-4 py-3 font-bold text-right", diff < 0 ? "text-red-500" : "text-emerald-500")}>
                                  {diff >= 0 ? '+' : ''}{formatCHF(diff)}
                                </td>
                              </tr>
                              {group.items.map(item => {
                                const itemActual = getAllTimeActualCostForItem(item.id);
                                const itemRest = restKostenPrognose[item.id] !== undefined ? restKostenPrognose[item.id] : Math.max(0, item.total - itemActual);
                                const itemForecast = itemActual + itemRest;
                                const itemDiff = item.total - itemForecast;
                                const isItemOver = itemActual > item.total;
                                return (
                                  <tr key={item.id} className={cn("hover:bg-white/5 transition-colors", isItemOver ? "bg-red-500/5" : "")}>
                                    <td className="px-4 py-2 text-xs text-text-muted font-medium">{item.pos}</td>
                                    <td className="px-4 py-2 text-text-primary font-medium flex items-center gap-2">
                                      {item.description}
                                      {isItemOver && <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">+CHF {formatCHF(itemActual - item.total)}</span>}
                                    </td>
                                    <td className="px-4 py-2 text-right text-text-primary">{formatCHF(item.total)}</td>
                                    <td className="px-4 py-2 text-right text-red-500 font-bold">{itemActual > 0 ? formatCHF(itemActual) : '-'}</td>
                                    <td className="px-4 py-2 text-right">
                                      <input
                                        type="number"
                                        value={itemRest}
                                        onChange={e => setRestKostenPrognose({ ...restKostenPrognose, [item.id]: parseFloat(e.target.value) || 0 })}
                                        className="w-24 bg-background border border-border/50 rounded px-2 py-1 text-right font-medium text-xs text-accent-ai focus:border-accent-ai outline-none"
                                        placeholder="0.00"
                                      />
                                    </td>
                                    <td className="px-4 py-2 text-right font-bold text-text-primary">{formatCHF(itemForecast)}</td>
                                    <td className={cn("px-4 py-2 text-right font-medium", itemDiff < 0 ? "text-red-500 font-bold" : "text-emerald-500")}>
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
                      <td className="px-4 py-3 font-bold text-right text-orange-500">0.00</td>
                      <td className="px-4 py-3 font-bold text-right text-red-500">{formatCHF(allTimeHoursCost)}</td>
                      <td className="px-4 py-3 font-bold text-right text-red-500">-{formatCHF(allTimeHoursCost)}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-surface border-t-2 border-border/50">
                      <td colSpan={2} className="px-4 py-5 text-right font-black uppercase tracking-wider text-text-primary">{t('total_project_excl_vat')}</td>
                      <td className="px-4 py-5 text-right font-black text-text-primary">{formatCHF(overviewTotalBudget)}</td>
                      <td className="px-4 py-5 text-right font-black text-red-500">{formatCHF(totalActualCostsIncludingHoursAllTime)}</td>
                      <td className="px-4 py-5 text-right font-black text-accent-ai">
                        {formatCHF(approvedVersions.reduce((sum, v) => sum + v.groups.reduce((s, g) => s + g.items.reduce((iSum, i) => iSum + (restKostenPrognose[i.id] !== undefined ? restKostenPrognose[i.id] : Math.max(0, i.total - getAllTimeActualCostForItem(i.id))), 0), 0), 0))}
                      </td>
                      <td className="px-4 py-5 text-right font-black text-text-primary">
                        {formatCHF(totalActualCostsIncludingHoursAllTime + approvedVersions.reduce((sum, v) => sum + v.groups.reduce((s, g) => s + g.items.reduce((iSum, i) => iSum + (restKostenPrognose[i.id] !== undefined ? restKostenPrognose[i.id] : Math.max(0, i.total - getAllTimeActualCostForItem(i.id))), 0), 0), 0))}
                      </td>
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
                            <button onClick={() => handleDeleteTransaction(tx.id)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500/10 p-1 rounded transition-all"><Trash2 size={14} /></button>
                            {tx.date}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-text-primary">{tx.description}</span>
                              {!!sanitizeUrl(tx.url) && <a href={sanitizeUrl(tx.url)} target="_blank" rel="noopener noreferrer" className="text-accent-ai hover:underline p-1 bg-accent-ai/10 rounded"><FileText size={14} /></a>}
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
            <button
              onClick={() => { setIsLandscapeMode(true); setForceLandscapeView(true); setIsRotatedCss(true); }}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg font-bold shadow-sm active:scale-95 transition-transform"
              title="Tabelle im Querformat (90°) anzeigen"
            >
              <RotateCw size={14} /> <span className="text-xs">{t('rotate')}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
            {/* Primary Action Buttons */}
            <div className="grid grid-cols-2 sm:flex flex-wrap gap-2 w-full sm:w-auto shrink-0">
              <button
                onClick={() => setShowTimeModal(true)}
                className="flex-1 sm:flex-none flex items-center justify-center p-2 sm:px-3.5 sm:py-2 bg-surface border border-border/50 rounded-lg text-xs sm:text-sm font-bold hover:bg-white/5 hover:text-orange-400 transition-colors shadow-sm gap-1.5 h-[42px] cursor-pointer"
              >
                <Clock size={16} className="text-orange-400 shrink-0" /> <span>{t('book_hours')}</span>
              </button>
              <button
                onClick={() => setShowQuoteModal(true)}
                className="flex-1 sm:flex-none flex items-center justify-center p-2 sm:px-3.5 sm:py-2 bg-surface border border-border/50 rounded-lg text-xs sm:text-sm font-bold hover:bg-white/5 hover:text-accent-ai transition-colors shadow-sm gap-1.5 h-[42px] cursor-pointer"
              >
                <FileSignature size={16} className="text-accent-ai shrink-0" /> <span>{t('quote')}</span>
              </button>
              <button
                onClick={() => { setReceiptType('expense'); setShowReceiptStudio(true); }}
                className="flex-1 sm:flex-none flex items-center justify-center p-2 sm:px-3.5 sm:py-2 bg-surface border border-border/50 rounded-lg text-xs sm:text-sm font-bold hover:bg-white/5 hover:text-red-400 transition-colors shadow-sm gap-1.5 h-[42px] cursor-pointer"
              >
                <Receipt size={16} className="text-red-400 shrink-0" /> <span>{t('book_receipt')}</span>
              </button>
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="tour-finance-invoices flex-1 sm:flex-none flex items-center justify-center p-2 sm:px-3.5 sm:py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs sm:text-sm font-bold hover:bg-emerald-500/20 transition-colors shadow-sm gap-1.5 h-[42px] cursor-pointer"
              >
                <Send size={16} className="shrink-0" /> <span>{t('invoice')}</span>
              </button>
              <button
                onClick={() => setIsPdfStudioOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center p-2 sm:px-3.5 sm:py-2 bg-surface border border-border/50 text-text-primary rounded-lg text-xs sm:text-sm font-bold hover:bg-white/5 hover:text-accent-ai transition-colors shadow-sm gap-1.5 h-[42px] cursor-pointer shrink-0"
              >
                <FileText size={16} className="text-accent-ai shrink-0" /> <span>PDF Studio</span>
              </button>
            </div>

            <div className="hidden lg:block w-px h-6 bg-border/50 mx-1"></div>

            {/* CSV & Export / Import Dropdown */}
            <div className="relative" ref={csvMenuRef}>
              <button
                onClick={() => setShowCsvMenu(prev => !prev)}
                className="flex items-center justify-center px-3 sm:px-3.5 py-2 bg-surface border border-border/50 text-text-primary rounded-lg text-xs font-bold hover:bg-white/5 transition-all shadow-sm gap-1.5 h-[42px] cursor-pointer shrink-0"
                title="CSV Export- & Import-Aktionen"
              >
                <Download size={15} className="text-accent-ai shrink-0" />
                <span>CSV & Export</span>
                <ChevronDown size={14} className={cn("text-text-muted transition-transform duration-200", showCsvMenu ? "rotate-180" : "")} />
              </button>

              {showCsvMenu && (
                <div className="absolute right-0 mt-1.5 w-64 bg-surface/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2">
                  <button
                    onClick={() => { exportBudgetCSV(); setShowCsvMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-text-primary hover:bg-accent-ai/10 hover:text-accent-ai transition-colors text-left cursor-pointer"
                  >
                    <Download size={15} className="text-accent-ai shrink-0" />
                    <div>
                      <div>BKP Budget CSV</div>
                      <div className="text-[10px] text-text-muted font-normal">Budgetplan als CSV exportieren</div>
                    </div>
                  </button>
                  <button
                    onClick={() => { exportLedgerCSV(); setShowCsvMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-text-primary hover:bg-accent-ai/10 hover:text-accent-ai transition-colors text-left cursor-pointer"
                  >
                    <Download size={15} className="text-accent-ai shrink-0" />
                    <div>
                      <div>Hauptbuch CSV</div>
                      <div className="text-[10px] text-text-muted font-normal">Alle Buchungen als CSV exportieren</div>
                    </div>
                  </button>
                  <div className="border-t border-border/40 my-1" />
                  <button
                    onClick={() => { setShowAiBudgetModal(true); setShowCsvMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-text-primary hover:bg-white/5 transition-colors text-left cursor-pointer"
                  >
                    <Sparkles size={15} className="shrink-0 text-purple-400" />
                    <div>
                      <div>KI Excel & Foto Import</div>
                      <div className="text-[10px] text-text-muted font-normal">Excel-Screenshot, Foto oder PDF analysieren</div>
                    </div>
                  </button>
                  <button
                    onClick={() => { setShowCsvImportModal(true); setShowCsvMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-accent-ai hover:bg-accent-ai/10 transition-colors text-left cursor-pointer"
                  >
                    <Plus size={15} className="shrink-0" />
                    <div>
                      <div>BKP CSV Import</div>
                      <div className="text-[10px] text-text-muted font-normal">Positionen aus CSV-Datei importieren</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-3 w-full">
          <div className="flex bg-surface border border-border/50 rounded-lg p-1 shadow-sm overflow-x-auto hide-scrollbar w-full lg:w-auto h-[42px] shrink-0">
            <button onClick={() => setActiveTab('overview')} className={cn("flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap", activeTab === 'overview' ? "bg-accent-ai/10 text-accent-ai shadow-sm" : "text-text-muted hover:text-text-primary")}><PieChartIcon size={16} />{t('overview')}</button>
            <button onClick={() => setActiveTab('budget')} className={cn("tour-finance-budget flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap", activeTab === 'budget' ? "bg-accent-ai/10 text-accent-ai shadow-sm" : "text-text-muted hover:text-text-primary")}><Calculator size={16} />{t('budget_plan')}</button>
            <button onClick={() => setActiveTab('control')} className={cn("tour-finance-control flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap", activeTab === 'control' ? "bg-accent-ai/10 text-accent-ai shadow-sm" : "text-text-muted hover:text-text-primary")}><Receipt size={16} />{t('payment_control')}</button>
            <button onClick={() => setActiveTab('cashflow')} className={cn("tour-finance-cashflow flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap", activeTab === 'cashflow' ? "bg-accent-ai/10 text-accent-ai shadow-sm" : "text-text-muted hover:text-text-primary")}><Clock size={16} />{t('cashflow')}</button>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
            {activeTab !== 'budget' && (
              <div className="flex items-center bg-surface border border-border/50 rounded-lg px-2 h-[42px] shrink-0">
                <CalendarDays size={16} className="text-text-muted mr-1.5 shrink-0" />
                <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value as any)} className="bg-transparent text-sm font-bold focus:outline-none py-1 cursor-pointer outline-none w-28 truncate shrink-0">
                  <option value="all" className="bg-surface">{t('all_time')}</option>
                  <option value="year" className="bg-surface">{t('this_year')}</option>
                  <option value="month" className="bg-surface">{t('this_month')}</option>
                  <option value="today" className="bg-surface">{t('today')}</option>
                </select>
              </div>
            )}

            {activeTab === 'budget' && (
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center bg-surface border border-border/50 rounded-lg px-2 h-[42px] shrink-0">
                  <select value={activeVersionId} onChange={(e) => setActiveVersionId(e.target.value)} className="bg-transparent text-sm font-bold focus:outline-none px-2 py-1 cursor-pointer outline-none w-28 sm:w-32 truncate shrink-0 appearance-none">
                    {versions.map(v => <option key={v.id} value={v.id} className={cn("bg-surface text-text-primary", v.status === 'approved' ? "font-bold text-emerald-400" : "")}>{v.name} {v.status === 'approved' ? ` (${t('approved')})` : ''}</option>)}
                  </select>
                  <div className="w-px h-4 bg-border mx-1"></div>
                  {!isReadOnly && (currentUser?.role === 'owner' || currentUser?.canApproveBudget) && (
                    <button
                      onClick={handleToggleApproveVersion}
                      className={cn(
                        "p-1 px-2.5 rounded-md text-xs font-bold transition-all border mr-1 whitespace-nowrap flex items-center gap-1.5 cursor-pointer shadow-sm",
                        activeVersion.status === 'approved'
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                      )}
                      title={activeVersion.status === 'approved' ? 'Freigabe aufheben (Gesperrt – Klicken zum Bearbeiten)' : 'Budget freigeben (Entwurf – Klicken zum Sperren)'}
                    >
                      {activeVersion.status === 'approved' ? (
                        <>
                          <Lock size={12} className="text-emerald-400 shrink-0" />
                          <span>{t('approved')}</span>
                        </>
                      ) : (
                        <>
                          <Unlock size={12} className="text-amber-400 shrink-0" />
                          <span>{t('draft')}</span>
                        </>
                      )}
                    </button>
                  )}
                  <button onClick={handleCreateNewVersion} className="p-1 hover:text-emerald-400 text-text-muted transition-colors shrink-0" title={t('new_variant')}><Plus size={16} /></button>
                  <button onClick={handleDuplicateVersion} className="p-1 hover:text-accent-ai text-text-muted transition-colors shrink-0" title={t('duplicate_variant')}><Copy size={14} /></button>
                  <button onClick={() => handleDeleteVersion(activeVersionId)} className="p-1 hover:text-red-500 text-text-muted transition-colors shrink-0" title={t('delete_variant')}><Trash2 size={14} /></button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-0 pb-24 lg:pb-0 relative z-10 space-y-4">
        {/* BUDGET LOCKED STATUS BANNER */}
        {activeTab === 'budget' && activeVersion.status === 'approved' && (
          <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-3.5 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
                <Lock size={18} />
              </div>
              <div>
                <div className="font-bold text-xs text-emerald-400">Budgetplan ist freigegeben (Schreibgeschützt)</div>
                <div className="text-[11px] text-text-muted mt-0.5">Positionen und Preise sind gesperrt, um Abweichungen in der Zahlungskontrolle zu vermeiden.</div>
              </div>
            </div>
            {!isReadOnly && (currentUser?.role === 'owner' || currentUser?.canApproveBudget) && (
              <button
                onClick={handleToggleApproveVersion}
                className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
              >
                <Unlock size={13} /> Freigabe widerrufen (Bearbeiten)
              </button>
            )}
          </div>
        )}

        {/* OVER-BUDGET ALERT BANNER */}
        {overBudgetPositions.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-500 text-white rounded-xl shadow-md shrink-0">
                <AlertCircle size={20} />
              </div>
              <div>
                <div className="font-bold text-sm text-red-500 flex items-center gap-2">
                  ⚠️ Budget-Überschreitung erkannt ({overBudgetPositions.length} {overBudgetPositions.length === 1 ? 'Position' : 'Positionen'})
                </div>
                <div className="text-xs text-text-muted mt-0.5 font-medium line-clamp-1">
                  Positionen über Soll-Budget: {overBudgetPositions.map(p => `${p.pos} (${p.description || p.groupTitle})`).join(' • ')}
                </div>
              </div>
            </div>
            <button onClick={() => setActiveTab('control')} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-colors shrink-0 shadow-md">
              In Zahlungskontrolle prüfen
            </button>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-6 pt-4 lg:pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
                <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">{t('total_budget')}</h3>
                <p className="text-2xl font-bold text-text-primary font-medium">CHF {formatCHF(overviewTotalBudget)}</p>
              </div>
              <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
                <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 flex items-center gap-2">
                  <ArrowUpRight className="text-emerald-400" size={14} /> {t('revenue')}
                </h3>
                <p className="text-2xl font-bold text-emerald-400 font-medium">CHF {formatCHF(filteredInvoiced)}</p>
              </div>
              <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
                <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 flex items-center gap-2">
                  <ArrowDownRight className="text-red-400" size={14} /> {t('costs')}
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
                  <TrendingUp className="text-accent-ai" size={18} /> {t('planned_vs_actual')}
                </h3>
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#27272a" : "#e4e4e7"} vertical={false} />
                      <XAxis dataKey="name" stroke="#a1a1aa" fontSize={10} tickMargin={10} />
                      <YAxis stroke="#a1a1aa" fontSize={10} tickFormatter={(value) => `CHF ${value.toLocaleString()}`} />
                      <RechartsTooltip cursor={{ fill: theme === 'dark' ? '#27272a' : '#f4f4f5' }} contentStyle={tooltipContentStyle} />
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
              <input className="text-xl font-extrabold bg-transparent outline-none w-full border-b border-border/50 focus:border-accent-ai/50 text-text-primary pb-2" value={projectHeader.project} onChange={e => setProjectHeader({ ...projectHeader, project: e.target.value })} placeholder={t('project')} disabled={activeVersion.status === 'approved'} />
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-border/30 pb-2">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('date')}</span>
                  <input type="date" value={projectHeader.date} onChange={e => setProjectHeader({ ...projectHeader, date: e.target.value })} className="bg-transparent text-sm font-medium outline-none text-right text-text-primary" disabled={activeVersion.status === 'approved'} />
                </div>
                <div className="flex justify-between items-center border-b border-border/30 pb-2">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('client')}</span>
                  <input type="text" value={projectHeader.client} onChange={e => setProjectHeader({ ...projectHeader, client: e.target.value })} className="bg-transparent text-sm font-medium outline-none text-right text-text-primary w-1/2" placeholder="Kunde" disabled={activeVersion.status === 'approved'} />
                </div>
                <div className="flex justify-between items-center border-b border-border/30 pb-2">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Version</span>
                  <input type="text" value={projectHeader.version} onChange={e => setProjectHeader({ ...projectHeader, version: e.target.value })} className="bg-transparent text-sm font-medium outline-none text-right text-text-primary w-1/4" disabled={activeVersion.status === 'approved'} />
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
            {budgetGroups.length === 0 ? (
              <div className="bg-surface border border-border/50 rounded-2xl p-6 text-center space-y-3 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-accent-ai/10 text-accent-ai flex items-center justify-center mx-auto">
                  <Calculator size={24} />
                </div>
                <h4 className="font-bold text-base text-text-primary">Noch keine Phasen</h4>
                <p className="text-xs text-text-muted">
                  {activeVersion.status === 'approved'
                    ? "Dieses Budget ist als 'Freigegeben' markiert. Entsperren Sie es, um Phasen anzulegen."
                    : "Erstellen Sie die erste Phase für dieses Projekt."}
                </p>
                {!isReadOnly && (
                  activeVersion.status === 'approved' ? (
                    <button
                      onClick={() => {
                        setVersions(prev => prev.map(v => v.id === activeVersionId ? {
                          ...v,
                          status: 'draft',
                          groups: [{ id: `g${Date.now()}`, pos: '100', title: 'Phase 1: Vorbereitung & Konzept', items: [{ id: `i${Date.now()}`, pos: '101', description: 'Planung & Koordination', qty: 1, unit: 'Std.', unitPrice: 0, option: 0, total: 0 }] }]
                        } : v));
                        addToast('Budget entsperrt und Phase 1 erstellt', 'success');
                      }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mx-auto w-full"
                    >
                      <Unlock size={14} /> Budget entsperren & Phase erstellen
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        onClick={() => setShowAiBudgetModal(true)}
                        className="px-4 py-2.5 bg-surface hover:bg-white/5 border border-border text-text-primary text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mx-auto w-full cursor-pointer"
                      >
                        <Sparkles size={15} className="text-purple-400" /> Mit KI importieren (Excel / Foto)
                      </button>
                      <button
                        onClick={() => setVersions(prev => prev.map(v => v.id === activeVersionId ? {
                          ...v,
                          groups: [{ id: `g${Date.now()}`, pos: '100', title: 'Phase 1: Vorbereitung & Konzept', items: [{ id: `i${Date.now()}`, pos: '101', description: 'Planung & Koordination', qty: 1, unit: 'Std.', unitPrice: 0, option: 0, total: 0 }] }]
                        } : v))}
                        className="px-4 py-2 bg-surface hover:bg-white/5 border border-border text-text-primary text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mx-auto w-full cursor-pointer"
                      >
                        <Plus size={14} /> Erste Phase manuell erstellen
                      </button>
                    </div>
                  )
                )}
              </div>
            ) : (
              budgetGroups.map(group => (
                <div key={group.id} className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 shadow-sm relative">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-blue-500 text-sm">{group.pos}</span>
                      <span className="font-bold text-blue-500 text-sm">{formatCHF(calculateGroupTotal(group))}</span>
                    </div>
                    <input className="bg-transparent text-blue-400 font-bold text-lg outline-none w-full pr-8" value={group.title} onChange={e => setVersions(versions.map(v => v.id === activeVersionId ? { ...v, groups: v.groups.map(g => g.id === group.id ? { ...g, title: e.target.value } : g) } : v))} disabled={activeVersion.status === 'approved'} placeholder="Titel der Phase" />
                    {!isReadOnly && activeVersion.status !== 'approved' && (
                      <button onClick={() => handleDeleteGroup(group.id)} className="absolute right-4 bottom-4 text-red-500 p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20"><Trash2 size={16} /></button>
                    )}
                  </div>

                  <div className="space-y-3 pl-3 border-l-2 border-border/30">
                    {group.items.length === 0 && (
                      <div className="p-3 bg-background/50 border border-dashed border-border/50 rounded-xl text-xs text-text-muted italic text-center">
                        Noch keine Positionen in dieser Phase.
                      </div>
                    )}
                    {group.items.map(item => (
                      <div key={item.id} className="bg-surface border border-border/50 rounded-xl p-4 shadow-sm relative space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-text-muted bg-background px-2 py-1 rounded border border-border/50">{item.pos}</span>
                          {!isReadOnly && activeVersion.status !== 'approved' && (
                            <button onClick={() => setVersions(versions.map(v => v.id === activeVersionId ? { ...v, groups: v.groups.map(g => g.id === group.id ? { ...g, items: g.items.filter(i => i.id !== item.id) } : g) } : v))} className="text-text-muted hover:text-red-500 p-1 bg-background rounded-md"><X size={14} /></button>
                          )}
                        </div>
                        <textarea
                          value={item.description}
                          onChange={e => {
                            handleBudgetChange(group.id, item.id, 'description', e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                          }}
                          ref={el => {
                            if (el) {
                              el.style.height = 'auto';
                              el.style.height = `${el.scrollHeight}px`;
                            }
                          }}
                          rows={1}
                          className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-medium text-text-primary outline-none focus:border-accent-ai/50 resize-none overflow-hidden leading-relaxed break-words block min-h-[38px]"
                          disabled={activeVersion.status === 'approved'}
                          placeholder={t('description')}
                        />

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
                      <button onClick={() => setVersions(versions.map(v => v.id === activeVersionId ? { ...v, groups: v.groups.map(g => g.id === group.id ? { ...g, items: [...g.items, { id: `i${Date.now()}`, pos: `${g.pos.substring(0, 1)}0${g.items.length + 1}`, description: '', qty: 1, unit: 'Stk.', unitPrice: 0, option: 0, total: 0 }] } : g) } : v))} className="w-full py-2.5 bg-background border border-dashed border-accent-ai/30 text-accent-ai rounded-xl text-xs font-bold hover:bg-accent-ai/10 flex items-center justify-center gap-2">
                        <Plus size={14} /> {t('add_position')}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}

            {!isReadOnly && activeVersion.status !== 'approved' && budgetGroups.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <button onClick={() => setVersions(versions.map(v => v.id === activeVersionId ? { ...v, groups: [...v.groups, { id: `g${Date.now()}`, pos: `${(v.groups.length + 1)}00`, title: t('new_phase'), items: [] }] } : v))} className="flex-1 w-full py-2.5 bg-surface border border-dashed border-border/80 text-text-muted hover:text-text-primary rounded-xl font-bold hover:bg-white/5 flex items-center justify-center gap-2 shadow-sm cursor-pointer text-xs">
                  <Plus size={16} /> {t('new_phase')}
                </button>
                <button onClick={() => setShowAiBudgetModal(true)} className="flex-1 w-full py-2.5 bg-surface border border-dashed border-border/80 text-text-muted hover:text-text-primary rounded-xl font-bold hover:bg-white/5 flex items-center justify-center gap-2 shadow-sm cursor-pointer text-xs">
                  <Sparkles size={15} className="text-purple-400" /> Mit KI importieren
                </button>
              </div>
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
                  {t('vat')} <input type="number" value={vatRate} onChange={e => setVersions(versions.map(v => v.id === activeVersionId ? { ...v, vatRate: parseFloat(e.target.value) || 0 } : v))} className="w-14 bg-background border border-border/50 rounded p-1 outline-none text-text-primary text-center" disabled={activeVersion.status === 'approved'} />%
                </span>
                <span>{formatCHF(totalBudget * (vatRate / 100))}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold text-blue-400 border-t-2 border-border pt-4">
                <span className="uppercase">{t('total_amount')}</span><span>{formatCHF(totalBudget * (1 + vatRate / 100))}</span>
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
                    <input className="text-3xl font-extrabold bg-transparent outline-none w-[600px] border-b border-transparent focus:border-accent-ai/50 text-text-primary mb-2" value={projectHeader.project} onChange={e => setProjectHeader({ ...projectHeader, project: e.target.value })} placeholder={t('project')} disabled={activeVersion.status === 'approved'} />
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('date')}:</span>
                        <input type="date" value={projectHeader.date} onChange={e => setProjectHeader({ ...projectHeader, date: e.target.value })} className="bg-transparent text-sm font-medium outline-none text-text-primary cursor-pointer border-b border-transparent focus:border-accent-ai/50 py-1" disabled={activeVersion.status === 'approved'} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('client')}:</span>
                        <input type="text" value={projectHeader.client} onChange={e => setProjectHeader({ ...projectHeader, client: e.target.value })} className="bg-transparent text-sm font-medium outline-none text-text-primary border-b border-transparent focus:border-accent-ai/50 py-1 w-48" placeholder="Kunde / Bauherr" disabled={activeVersion.status === 'approved'} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Version:</span>
                        <input type="text" value={projectHeader.version} onChange={e => setProjectHeader({ ...projectHeader, version: e.target.value })} className="bg-transparent text-sm font-medium outline-none text-text-primary border-b border-transparent focus:border-accent-ai/50 py-1 w-16" placeholder="v1.0" disabled={activeVersion.status === 'approved'} />
                      </div>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-bold text-text-muted cursor-pointer hover:text-text-primary transition-colors bg-background border border-border/50 px-3 py-2 rounded-lg shadow-sm">
                    <input type="checkbox" checked={includeOptions} onChange={(e) => setIncludeOptions(e.target.checked)} className="rounded border-border text-accent-ai focus:ring-accent-ai w-4 h-4 cursor-pointer" />
                    Optionen einrechnen
                  </label>
                </div>

                <div className="w-full overflow-x-auto custom-scrollbar">
                  <table className="w-full text-sm text-left border-collapse bg-surface table-fixed">
                    <thead className="text-xs uppercase tracking-wider text-text-muted bg-background border-b border-border/50">
                      <tr>
                        <th className="px-4 py-3 w-16">{t('pos')}</th>
                        <th className="px-4 py-3">{t('description')}</th>
                        <th className="px-4 py-3 text-right w-24">{t('qty')}</th>
                        <th className="px-4 py-3 w-24">{t('unit')}</th>
                        <th className="px-4 py-3 text-right w-24">{t('unit_price')}</th>
                        {includeOptions && <th className="px-4 py-3 text-right w-24 text-accent-ai">Option</th>}
                        <th className="px-4 py-3 text-right w-36 text-blue-400 shrink-0">{t('total')} (CHF)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {budgetGroups.length === 0 ? (
                        <tr>
                          <td colSpan={includeOptions ? 7 : 6} className="px-6 py-16 text-center">
                            <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
                              <div className="w-14 h-14 rounded-2xl bg-accent-ai/10 text-accent-ai flex items-center justify-center shadow-inner">
                                <Calculator size={28} />
                              </div>
                              <h4 className="font-bold text-base text-text-primary">Noch keine Phasen im Budgetplan</h4>
                              <p className="text-xs text-text-muted leading-relaxed">
                                {activeVersion.status === 'approved'
                                  ? "Dieser Budgetplan ist aktuell als 'Freigegeben' markiert (schreibgeschützt). Entsperren Sie das Budget, um Phasen und Positionen anzulegen."
                                  : "Beginnen Sie mit der Erstellung von Phasen (z.B. Vorbereitung, Konzept, Ausführung) und Positionen."}
                              </p>
                              {!isReadOnly && (
                                activeVersion.status === 'approved' ? (
                                  <button
                                    onClick={() => {
                                      setVersions(prev => prev.map(v => v.id === activeVersionId ? {
                                        ...v,
                                        status: 'draft',
                                        groups: [{ id: `g${Date.now()}`, pos: '100', title: 'Phase 1: Vorbereitung & Konzept', items: [{ id: `i${Date.now()}`, pos: '101', description: 'Planung & Koordination', qty: 1, unit: 'Std.', unitPrice: 0, option: 0, total: 0 }] }]
                                      } : v));
                                      addToast('Budget entsperrt und Phase 1 erstellt', 'success');
                                    }}
                                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                                  >
                                    <Unlock size={14} /> Budget entsperren & Phase erstellen
                                  </button>
                                ) : (
                                  <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                                    <button
                                      onClick={() => setShowAiBudgetModal(true)}
                                      className="px-4 py-2.5 bg-surface hover:bg-white/5 border border-border text-text-primary text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                                    >
                                      <Sparkles size={15} className="text-purple-400" /> Mit KI importieren (Excel / Foto)
                                    </button>
                                    <button
                                      onClick={() => setVersions(prev => prev.map(v => v.id === activeVersionId ? {
                                        ...v,
                                        groups: [{ id: `g${Date.now()}`, pos: '100', title: 'Phase 1: Vorbereitung & Konzept', items: [{ id: `i${Date.now()}`, pos: '101', description: 'Planung & Koordination', qty: 1, unit: 'Std.', unitPrice: 0, option: 0, total: 0 }] }]
                                      } : v))}
                                      className="px-4 py-2.5 bg-surface hover:bg-white/5 border border-border text-text-primary text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                                    >
                                      <Plus size={14} /> Erste Phase manuell anlegen
                                    </button>
                                  </div>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        budgetGroups.map(group => {
                          const groupPlanTotal = calculateGroupTotal(group);
                          return (
                            <React.Fragment key={group.id}>
                              <tr className="bg-blue-500/10 border-y border-blue-500/20 group relative">
                                <td className="px-4 py-3 font-bold text-blue-400 align-top">{group.pos}</td>
                                <td className="px-4 py-3 font-bold text-blue-400 align-top" colSpan={includeOptions ? 5 : 4}>
                                  <textarea
                                    className="bg-transparent text-blue-400 border-none outline-none w-full font-bold resize-none overflow-hidden leading-snug break-words block min-h-[28px]"
                                    rows={1}
                                    value={group.title}
                                    onChange={e => {
                                      setVersions(versions.map(v => v.id === activeVersionId ? { ...v, groups: v.groups.map(g => g.id === group.id ? { ...g, title: e.target.value } : g) } : v));
                                      e.target.style.height = 'auto';
                                      e.target.style.height = `${e.target.scrollHeight}px`;
                                    }}
                                    ref={el => {
                                      if (el) {
                                        el.style.height = 'auto';
                                        el.style.height = `${el.scrollHeight}px`;
                                      }
                                    }}
                                    disabled={activeVersion.status === 'approved'}
                                    placeholder="Titel der Phase"
                                  />
                                </td>
                                <td className="px-4 py-3 font-bold text-right text-blue-400 relative align-top">
                                  {formatCHF(groupPlanTotal)}
                                  {!isReadOnly && activeVersion.status !== 'approved' && (
                                    <button onClick={() => handleDeleteGroup(group.id)} className="absolute right-2 top-3 text-red-500 opacity-0 group-hover:opacity-100 p-1 no-print cursor-pointer">
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </td>
                              </tr>
                              {group.items.length === 0 && (
                                <tr>
                                  <td colSpan={includeOptions ? 7 : 6} className="px-4 py-3 text-xs text-text-muted italic bg-background/20">
                                    Noch keine Positionen in dieser Phase. {!isReadOnly && activeVersion.status !== 'approved' && "Klicken Sie unten auf '+ Position hinzufügen'."}
                                  </td>
                                </tr>
                              )}
                              {group.items.map(item => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors group/row">
                                  <td className="px-4 py-2 align-top text-xs text-text-muted font-medium pt-2.5">{item.pos}</td>
                                  <td className="px-4 py-2 align-top">
                                    <textarea
                                      value={item.description}
                                      onChange={e => {
                                        handleBudgetChange(group.id, item.id, 'description', e.target.value);
                                        e.target.style.height = 'auto';
                                        e.target.style.height = `${e.target.scrollHeight}px`;
                                      }}
                                      ref={el => {
                                        if (el) {
                                          el.style.height = 'auto';
                                          el.style.height = `${el.scrollHeight}px`;
                                        }
                                      }}
                                      rows={1}
                                      className="w-full bg-transparent outline-none focus:border-b focus:border-accent-ai/50 py-1 font-medium text-text-primary resize-none overflow-hidden leading-relaxed break-words block min-h-[28px]"
                                      disabled={activeVersion.status === 'approved'}
                                      placeholder={t('description')}
                                    />
                                  </td>
                                  <td className="px-4 py-2 align-top text-right pt-2">
                                    <input type="number" value={item.qty || ''} onChange={e => handleBudgetChange(group.id, item.id, 'qty', e.target.value)} className={cn(numberInputClass, "font-medium text-text-primary")} disabled={activeVersion.status === 'approved'} />
                                  </td>
                                  <td className="px-4 py-2 align-top relative pt-2">
                                    <select value={item.unit} onChange={e => handleBudgetChange(group.id, item.id, 'unit', e.target.value)} className="bg-transparent text-text-primary outline-none w-full appearance-none cursor-pointer font-medium" disabled={activeVersion.status === 'approved'}>
                                      <option className="bg-surface">Std.</option>
                                      <option className="bg-surface">Stk.</option>
                                      <option className="bg-surface">Pauschal</option>
                                      <option className="bg-surface">m2</option>
                                      <option className="bg-surface font-bold text-accent-ai">Option</option>
                                    </select>
                                  </td>
                                  <td className="px-4 py-2 align-top text-right pt-2">
                                    <input type="number" value={item.unitPrice || ''} onChange={e => handleBudgetChange(group.id, item.id, 'unitPrice', e.target.value)} className={cn(numberInputClass, "font-medium text-text-primary")} disabled={activeVersion.status === 'approved'} />
                                  </td>
                                  {includeOptions && (
                                    <td className="px-4 py-2 align-top text-right bg-accent-ai/5 pt-2.5">
                                      <span className={item.option > 0 ? "text-accent-ai font-bold" : "text-text-muted font-medium"}>{item.option > 0 ? formatCHF(item.option) : '-'}</span>
                                    </td>
                                  )}
                                  <td className="px-4 py-2 align-top text-right font-bold relative text-text-primary pt-2.5">
                                    <span className={item.option > 0 ? "text-accent-ai" : ""}>{formatCHF(item.total + (includeOptions ? item.option : 0))}</span>
                                    {!isReadOnly && activeVersion.status !== 'approved' && (
                                      <button onClick={() => setVersions(versions.map(v => v.id === activeVersionId ? { ...v, groups: v.groups.map(g => g.id === group.id ? { ...g, items: g.items.filter(i => i.id !== item.id) } : g) } : v))} className="absolute right-1 top-2.5 text-red-500 opacity-0 group-hover/row:opacity-100 p-1 no-print cursor-pointer">
                                        <X size={14} />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                              {!isReadOnly && activeVersion.status !== 'approved' && (
                                <tr className="no-print">
                                  <td colSpan={includeOptions ? 7 : 6} className="px-4 py-2.5 bg-background/30">
                                    <button onClick={() => setVersions(versions.map(v => v.id === activeVersionId ? { ...v, groups: v.groups.map(g => g.id === group.id ? { ...g, items: [...g.items, { id: `i${Date.now()}`, pos: `${g.pos.substring(0, 1)}0${g.items.length + 1}`, description: '', qty: 1, unit: 'Std.', unitPrice: 0, option: 0, total: 0 }] } : g) } : v))} className="text-xs font-bold flex items-center gap-1.5 text-accent-ai hover:underline cursor-pointer">
                                      <Plus size={14} /> {t('add_position')}
                                    </button>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          )
                        })
                      )}
                      {!isReadOnly && activeVersion.status !== 'approved' && budgetGroups.length > 0 && (
                        <tr className="no-print">
                          <td colSpan={includeOptions ? 7 : 6} className="px-4 py-4">
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                              <button onClick={() => setVersions(versions.map(v => v.id === activeVersionId ? { ...v, groups: [...v.groups, { id: `g${Date.now()}`, pos: `${(v.groups.length + 1)}00`, title: t('new_phase'), items: [] }] } : v))} className="flex-1 w-full py-2.5 border border-dashed border-border/80 text-text-muted hover:text-text-primary rounded-lg font-bold hover:bg-white/5 flex justify-center items-center gap-2 transition-colors cursor-pointer text-xs">
                                <Plus size={16} /> {t('new_phase')}
                              </button>
                              <button onClick={() => setShowAiBudgetModal(true)} className="flex-1 w-full py-2.5 border border-dashed border-border/80 text-text-muted hover:text-text-primary bg-surface/40 hover:bg-white/5 rounded-lg font-bold flex justify-center items-center gap-2 transition-colors cursor-pointer shadow-sm text-xs">
                                <Sparkles size={15} className="text-purple-400" /> {language === 'de' ? 'Mit KI importieren' : 'Import with AI'}
                              </button>
                            </div>
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
                          <input type="number" value={vatRate} onChange={e => setVersions(versions.map(v => v.id === activeVersionId ? { ...v, vatRate: parseFloat(e.target.value) || 0 } : v))} className={cn(numberInputClass, "font-medium w-16 px-2 py-1 rounded border border-border/50 bg-surface outline-none text-text-primary")} disabled={activeVersion.status === 'approved'} />%
                        </td>
                        {includeOptions && <td></td>}
                        <td className="px-4 py-3 text-right font-medium text-sm text-text-muted whitespace-nowrap">{formatCHF(totalBudget * (vatRate / 100))}</td>
                      </tr>
                      <tr className="bg-surface border-b-2 border-border">
                        <td colSpan={4} className="px-4 py-5"></td>
                        <td className="px-4 py-5 text-right font-bold text-sm uppercase text-text-primary whitespace-nowrap">{t('total_amount')}</td>
                        {includeOptions && <td></td>}
                        <td className="px-4 py-5 text-right font-bold text-sm text-blue-400 whitespace-nowrap">{formatCHF(totalBudget * (1 + vatRate / 100))}</td>
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
                            <button onClick={() => handleDeleteTransaction(tx.id)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500/10 p-1 rounded transition-all"><Trash2 size={14} /></button>
                            {tx.date}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-text-primary">{tx.description}</span>
                              {!!sanitizeUrl(tx.url) && <a href={sanitizeUrl(tx.url)} target="_blank" rel="noopener noreferrer" className="text-accent-ai hover:underline p-1 bg-accent-ai/10 rounded"><FileText size={14} /></a>}
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
        fileName={`Buchung_${incomingData.vendor.replace(/\s/g, '_')}_${Date.now()}`}
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
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/40 dark:bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface border border-border rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border/50 flex justify-between items-center bg-surface/50">
              <h3 className="font-bold flex items-center gap-2 text-text-primary"><Clock className="text-orange-400" size={18} /> {t('book_hours')}</h3>
              <button onClick={() => setShowTimeModal(false)} className="text-text-muted hover:text-text-primary p-1 rounded-md bg-background"><X size={18} /></button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[85vh] custom-scrollbar">
              <form id="time-form" onSubmit={handleTimeSubmit} className="space-y-4">

                <div className="flex bg-background border border-border/50 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setTimeData(prev => ({ ...prev, type: 'internal', hourlyRate: prev.hourlyRate === 165 ? 120 : (prev.hourlyRate || 120) }))}
                    className={cn("flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5", timeData.type === 'internal' ? "bg-orange-500 text-white shadow-sm" : "text-text-muted hover:text-text-primary")}
                  >
                    <User size={14} /> Einfach (Intern: Eigenleistung)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeData(prev => ({ ...prev, type: 'external', hourlyRate: prev.hourlyRate === 120 ? 165 : (prev.hourlyRate || 165) }))}
                    className={cn("flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5", timeData.type === 'external' ? "bg-orange-500 text-white shadow-sm" : "text-text-muted hover:text-text-primary")}
                  >
                    <FileSpreadsheet size={14} /> Detailliert (Extern: Partner & Regie)
                  </button>
                </div>

                {timeData.type === 'internal' ? (
                  <>
                    <div className="text-xs text-text-muted bg-orange-500/10 border border-orange-500/20 p-2.5 rounded-lg flex items-center gap-2">
                      <Clock size={15} className="text-orange-500 shrink-0" />
                      <span>Interne Zeiterfassung für eigene Mitarbeiter, Bauleiter & Projektleitung.</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block">Mitarbeiter</label>
                        <select
                          required
                          value={timeData.userId}
                          onChange={(e) => setTimeData({ ...timeData, userId: e.target.value })}
                          className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none"
                        >
                          <option value="" disabled className="bg-surface">Mitarbeiter wählen...</option>
                          {projectMembers?.filter((m: any) => m.projectId === currentProjectId).map((member: any) => (
                            <option key={member.userId} value={member.userId} className="bg-surface">{member.userEmail || member.userId}</option>
                          ))}
                          {(!projectMembers || projectMembers.filter((m: any) => m.projectId === currentProjectId).length === 0) && currentUser && (
                            <option value={currentUser.uid} className="bg-surface">{currentUser.email || 'Aktueller Benutzer'}</option>
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block">{t('date')}</label>
                        <input type="date" required value={timeData.date} onChange={(e) => setTimeData({ ...timeData, date: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block">Arbeitszeit brutto (h)</label>
                        <input type="number" step="0.25" min="0.25" required value={timeData.hours || ''} onChange={(e) => setTimeData({ ...timeData, hours: parseFloat(e.target.value) || 0 })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none" placeholder="z.B. 8.5" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block">Pausenregelung</label>
                        <select
                          value={timeData.breakMinutes}
                          onChange={(e) => setTimeData({ ...timeData, breakMinutes: Number(e.target.value) || 0 })}
                          className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none cursor-pointer"
                        >
                          <option value={0} className="bg-surface">Keine Pause (0 Min)</option>
                          <option value={15} className="bg-surface">15 Min Kurzpause</option>
                          <option value={30} className="bg-surface">30 Min Mittagspause</option>
                          <option value={45} className="bg-surface">45 Min Pause</option>
                          <option value={60} className="bg-surface">60 Min Mittagspause</option>
                        </select>
                      </div>
                    </div>

                    {timeData.breakMinutes > 0 && timeData.hours > 0 && (
                      <div className="text-[11px] font-medium text-text-muted bg-surface/70 border border-border/40 px-3 py-1.5 rounded-lg flex items-center justify-between">
                        <span>Pausenabzug: {timeData.breakMinutes} Minuten</span>
                        <span className="font-bold text-text-primary">Effektive Netto-Zeit: {Math.max(0, timeData.hours - (timeData.breakMinutes / 60)).toFixed(2)} h</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block">Interner Ansatz (CHF/h)</label>
                        <input type="number" required value={timeData.hourlyRate || ''} onChange={(e) => setTimeData({ ...timeData, hourlyRate: parseFloat(e.target.value) || 0 })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none" placeholder="z.B. 120" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block">Überstunden-Konto</label>
                        <select
                          value={timeData.overtimeType}
                          onChange={(e) => setTimeData({ ...timeData, overtimeType: e.target.value as any })}
                          className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none cursor-pointer"
                        >
                          <option value="normal" className="bg-surface">Normalarbeitszeit</option>
                          <option value="overtime" className="bg-surface">Überstunden (+) Gutschrift</option>
                          <option value="compensation" className="bg-surface">Kompensation (-) Zeitausgleich</option>
                        </select>
                      </div>
                    </div>

                    {timeData.hours > 0 && timeData.hourlyRate > 0 && (
                      <div className="text-xs font-bold text-orange-500 bg-orange-500/10 border border-orange-500/20 p-2.5 rounded-lg flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span>Aufwand ({Math.max(0, timeData.hours - (timeData.breakMinutes / 60)).toFixed(2)}h × CHF {timeData.hourlyRate}):</span>
                          {timeData.overtimeType === 'overtime' && (
                            <span className="text-[10px] font-extrabold bg-orange-500 text-white px-1.5 py-0.5 rounded">+ Überstunden</span>
                          )}
                          {timeData.overtimeType === 'compensation' && (
                            <span className="text-[10px] font-extrabold bg-blue-500 text-white px-1.5 py-0.5 rounded">- Kompensation</span>
                          )}
                        </div>
                        <span>CHF {formatCHF(Math.max(0, timeData.hours - (timeData.breakMinutes / 60)) * Number(timeData.hourlyRate))}</span>
                      </div>
                    )}

                    <div>
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block">Phase / SIA- / Budget-Zuweisung</label>
                      <select value={timeData.budgetPosId} onChange={(e) => setTimeData({ ...timeData, budgetPosId: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none cursor-pointer">
                        <option value="" className="bg-surface">Allgemeine Regiestunden (Ohne Phasenzuweisung)</option>
                        <optgroup label="SIA Phasen (SIA 102 / 108 / 112)" className="bg-surface font-bold text-orange-500">
                          <option value="sia_31">SIA 31: Vorprojekt</option>
                          <option value="sia_32">SIA 32: Bauprojekt</option>
                          <option value="sia_33">SIA 33: Bewilligungsverfahren</option>
                          <option value="sia_41">SIA 41: Ausschreibung & Vergabe</option>
                          <option value="sia_51">SIA 51: Ausführungsplanung</option>
                          <option value="sia_52">SIA 52: Bauleitung / Realisierung</option>
                          <option value="sia_53">SIA 53: Inbetriebnahme & Abschluss</option>
                        </optgroup>
                        {budgetGroups.length > 0 && budgetGroups.map((group) => (
                          <optgroup key={group.id} label={`BKP ${group.pos} ${group.title}`} className="bg-surface font-bold">
                            <option value={group.id} className="font-medium">{group.pos} {group.title} (Gesamte Phase)</option>
                            {group.items.map((item) => (
                              <option key={item.id} value={item.id} className="font-normal">&nbsp;&nbsp;↳ {item.pos} {item.description}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="time-is-billable"
                        checked={timeData.isBillable !== false}
                        onChange={(e) => setTimeData({ ...timeData, isBillable: e.target.checked })}
                        className="rounded border-border text-orange-500 focus:ring-orange-500 w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="time-is-billable" className="text-xs font-bold text-text-primary cursor-pointer">An Kunden verrechenbar</label>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block">Tätigkeitsbeschrieb</label>
                      <textarea required value={timeData.description} onChange={(e) => setTimeData({ ...timeData, description: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-medium text-text-primary outline-none resize-none h-20" placeholder="Was wurde gemacht (z.B. Detailpläne Fassade überarbeitet, Bauherrensitzung)..." />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-xs text-text-muted bg-blue-500/10 border border-blue-500/20 p-2.5 rounded-lg flex items-center gap-2">
                      <FileSpreadsheet size={15} className="text-blue-500 shrink-0" />
                      <span>Nachweisbare Regiestunden & Fremdleistung externer Partner, Ingenieure oder Handwerker.</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block">Partner-Firma / Planer</label>
                        <input type="text" required placeholder="z.B. Geotechnik Schweiz AG" value={timeData.company} onChange={(e) => setTimeData({ ...timeData, company: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block">Fachkraft / Ausführende Person</label>
                        <input type="text" placeholder="z.B. Peter Keller (Bauleiter)" value={timeData.specialistName} onChange={(e) => setTimeData({ ...timeData, specialistName: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-medium text-text-primary outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block">Auftrags- / Bestellnummer (PO)</label>
                        <input type="text" placeholder="z.B. PO-2026-084 / Werkvertrag #12" value={timeData.orderNumber} onChange={(e) => setTimeData({ ...timeData, orderNumber: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-medium text-text-primary outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block">Rapport- / Regieschein-Nr.</label>
                        <input type="text" required placeholder="z.B. Rapport #104 / 2026" value={timeData.rapportNumber} onChange={(e) => setTimeData({ ...timeData, rapportNumber: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block">Rapportdatum</label>
                        <input type="date" required value={timeData.date} onChange={(e) => setTimeData({ ...timeData, date: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block">Stunden (h)</label>
                        <input type="number" step="0.25" min="0.25" required value={timeData.hours || ''} onChange={(e) => setTimeData({ ...timeData, hours: parseFloat(e.target.value) || 0 })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none" placeholder="z.B. 8.0" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block">Ansatz (CHF/h)</label>
                        <input type="number" required value={timeData.hourlyRate || ''} onChange={(e) => setTimeData({ ...timeData, hourlyRate: parseFloat(e.target.value) || 0 })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none" placeholder="z.B. 165" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block">BKP / Vergabe-Position</label>
                        <select required value={timeData.budgetPosId} onChange={(e) => setTimeData({ ...timeData, budgetPosId: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none cursor-pointer">
                          <option value="" disabled className="bg-surface">BKP-Position wählen...</option>
                          {budgetGroups.map((group) => (
                            <optgroup key={group.id} label={`${group.pos} ${group.title}`} className="bg-surface font-bold">
                              <option value={group.id} className="font-medium">{group.pos} {group.title} (Gesamte Phase)</option>
                              {group.items.map((item) => (
                                <option key={item.id} value={item.id} className="font-normal">&nbsp;&nbsp;↳ {item.pos} {item.description}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                    </div>

                    {timeData.hours > 0 && timeData.hourlyRate > 0 && (
                      <div className="text-xs font-bold text-blue-500 bg-blue-500/10 border border-blue-500/20 p-2.5 rounded-lg flex justify-between items-center">
                        <span>Total Fremdleistung ({timeData.hours}h × CHF {timeData.hourlyRate}):</span>
                        <span>CHF {formatCHF(Number(timeData.hours) * Number(timeData.hourlyRate))}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block">Prüf- & Abrechnungsstatus</label>
                        <select value={timeData.approvalStatus} onChange={(e) => setTimeData({ ...timeData, approvalStatus: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none cursor-pointer">
                          <option value="Zur Prüfung eingereicht" className="bg-surface">Zur Prüfung eingereicht</option>
                          <option value="Geprüft & Freigegeben" className="bg-surface">Geprüft & Freigegeben</option>
                          <option value="Bereits verrechnet" className="bg-surface">Bereits verrechnet</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block">Freigabe durch (Projektleiter)</label>
                        <select value={timeData.approvedBy} onChange={(e) => setTimeData({ ...timeData, approvedBy: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none cursor-pointer">
                          <option value="" className="bg-surface">Freigabe noch ausstehend...</option>
                          {projectMembers?.filter((m: any) => m.projectId === currentProjectId).map((member: any) => (
                            <option key={member.userId} value={member.userEmail || member.userId} className="bg-surface">{member.userEmail || member.userId}</option>
                          ))}
                          {currentUser && (
                            <option value={currentUser.email || 'Aktueller Projektleiter'} className="bg-surface">{currentUser.email || 'Aktueller Projektleiter'}</option>
                          )}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block">Ausgeführte Arbeiten gemäss Rapport</label>
                      <textarea required value={timeData.description} onChange={(e) => setTimeData({ ...timeData, description: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-medium text-text-primary outline-none resize-none h-20" placeholder="Genaue Beschreibung der erbrachten Regiearbeiten gemäss Rapport..." />
                    </div>
                  </>
                )}

              </form>
            </div>
            <div className="p-4 border-t border-border bg-surface flex justify-end gap-3 shrink-0">
              <button onClick={() => setShowTimeModal(false)} className="px-5 py-2 text-sm font-bold text-text-muted border border-border rounded-lg hover:text-text-primary transition-colors">{t('cancel')}</button>
              <button form="time-form" type="submit" disabled={isSubmitting} className="px-5 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-50">
                {isSubmitting && <Loader2 size={16} className="animate-spin" />} Buchen
              </button>
            </div>
          </motion.div>
        </div>, document.body
      )}

      {isMounted && showReceiptStudio && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/40 dark:bg-black/80 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface border border-border rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col lg:flex-row overflow-hidden max-h-[92vh] h-[92vh] lg:h-[820px]">

            {/* LEFT SIDE: SCAN & UPLOAD */}
            <div className="w-full lg:w-5/12 p-6 border-b lg:border-b-0 lg:border-r border-border bg-background/50 flex flex-col overflow-y-auto custom-scrollbar min-h-0 h-full">
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
                        <img src={sanitizeUrl(src)} className="w-full h-full object-cover" alt="Beleg" />
                        <button onClick={() => setIncomingReceipts(incomingReceipts.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDE: DATA FORM */}
            <div className="w-full lg:w-7/12 flex flex-col h-full bg-surface min-h-0">
              <div className="p-6 border-b border-border/50 flex justify-between items-center shrink-0">
                <h3 className="font-bold text-lg text-text-primary">Buchungsdetails</h3>
                <button onClick={() => setShowReceiptStudio(false)} className="p-2 bg-background border border-border rounded-lg hover:text-red-500 transition-colors"><X size={18} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar min-h-0">
                <div className="flex bg-background border border-border/50 rounded-lg p-1 mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setReceiptType('expense');
                      setIncomingData(prev => ({
                        ...prev,
                        type: 'internal',
                        status: prev.status === 'Bezahlt' ? 'Rückerstattet / Ausbezahlt' : 'Offen (Rückerstattung ausstehend)'
                      }));
                    }}
                    className={cn("flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5", receiptType === 'expense' ? "bg-red-500 text-white shadow-sm" : "text-text-muted hover:text-text-primary")}
                  >
                    <User size={14} /> 🔴 Intern (Spesen & Auslagen)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReceiptType('external_cost');
                      setIncomingData(prev => ({
                        ...prev,
                        type: 'external',
                        status: prev.status === 'Rückerstattet / Ausbezahlt' ? 'Bezahlt' : 'Offen zur Prüfung'
                      }));
                    }}
                    className={cn("flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5", receiptType === 'external_cost' ? "bg-red-500 text-white shadow-sm" : "text-text-muted hover:text-text-primary")}
                  >
                    <Building2 size={14} /> 🔵 Externer Kreditor (Lieferant / Handwerker)
                  </button>
                </div>

                {receiptType === 'expense' ? (
                  /* 🔴 INTERN (SPESEN & AUSLAGEN) */
                  <div className="space-y-4">
                    <div className="text-xs text-text-muted bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg flex items-center gap-2">
                      <Receipt size={15} className="text-red-500 shrink-0" />
                      <span>Spesenabrechnung: Rückerstattung für privat vorgelegte Auslagen oder Firmenkartenbelege.</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Mitarbeiter / Begünstigter</label>
                        <select
                          required
                          value={incomingData.beneficiaryUserId}
                          onChange={e => {
                            const member = projectMembers?.find((m: any) => m.userId === e.target.value);
                            setIncomingData({
                              ...incomingData,
                              beneficiaryUserId: e.target.value,
                              beneficiaryName: member?.userEmail || e.target.value
                            });
                          }}
                          className="w-full bg-background border border-border/50 rounded-lg px-3 py-2.5 text-sm font-bold text-text-primary outline-none cursor-pointer"
                        >
                          <option value="" disabled className="bg-surface">Teammitglied wählen...</option>
                          {projectMembers?.filter((m: any) => m.projectId === currentProjectId).map((member: any) => (
                            <option key={member.userId} value={member.userId} className="bg-surface">{member.userEmail || member.userId}</option>
                          ))}
                          {(!projectMembers || projectMembers.filter((m: any) => m.projectId === currentProjectId).length === 0) && currentUser && (
                            <option value={currentUser.uid} className="bg-surface">{currentUser.email || 'Aktueller Benutzer'}</option>
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Händler / Geschäft (Shop)</label>
                        <input
                          type="text"
                          required
                          value={incomingData.vendor}
                          onChange={e => setIncomingData({ ...incomingData, vendor: e.target.value })}
                          className="w-full bg-background border border-border/50 rounded-lg px-4 py-2.5 text-sm font-bold text-text-primary outline-none focus:border-red-500/50 transition-colors"
                          placeholder="z.B. Jumbo, SBB, Coop, Restaurant"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block">{t('date')}</label>
                        <input type="date" value={incomingData.date} onChange={e => setIncomingData({ ...incomingData, date: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2.5 text-sm font-bold text-text-primary outline-none focus:border-red-500/50 transition-colors" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block text-red-500">{t('amount_chf')}</label>
                        <input type="number" step="0.05" value={incomingData.amount} onChange={e => setIncomingData({ ...incomingData, amount: e.target.value })} className="w-full bg-red-500/5 border border-red-500/30 rounded-lg px-3 py-2.5 text-sm font-bold text-red-500 outline-none focus:border-red-500 transition-colors placeholder:text-red-500/30" placeholder="0.00" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block">MWST-Satz</label>
                        <select value={incomingData.vatRate} onChange={e => setIncomingData({ ...incomingData, vatRate: Number(e.target.value) })} className="w-full bg-background border border-border/50 rounded-lg px-2 py-2.5 text-sm font-bold text-text-primary outline-none cursor-pointer">
                          <option value={8.1} className="bg-surface">8.1% (Normalsatz)</option>
                          <option value={2.6} className="bg-surface">2.6% (Verpflegung)</option>
                          <option value={0} className="bg-surface">0% (Steuerfrei)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Spesenkategorie</label>
                        <select value={incomingData.expenseCategory} onChange={e => setIncomingData({ ...incomingData, expenseCategory: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2.5 text-sm font-bold text-text-primary outline-none cursor-pointer">
                          <option value="Materialkauf & Muster" className="bg-surface">Materialkauf & Muster</option>
                          <option value="Reise- & Fahrtkosten (ÖV / Auto / Parken)" className="bg-surface">Reise- & Fahrtkosten (ÖV / Auto / Parken)</option>
                          <option value="Verpflegung & Kundenmeetings" className="bg-surface">Verpflegung & Kundenmeetings</option>
                          <option value="Werkzeuge, Software & Kleinmaterial" className="bg-surface">Werkzeuge, Software & Kleinmaterial</option>
                          <option value="Sonstiges" className="bg-surface">Sonstiges</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Zahlungsart (Auslage via)</label>
                        <select value={incomingData.paymentMethod} onChange={e => setIncomingData({ ...incomingData, paymentMethod: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2.5 text-sm font-bold text-text-primary outline-none cursor-pointer">
                          <option value="Privat vorgelegt (Rückerstattung ausstehend)" className="bg-surface">Privat vorgelegt (Rückerstattung ausstehend)</option>
                          <option value="Geschäftskarte / Firmenkarte" className="bg-surface">Geschäftskarte / Firmenkarte</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block">{t('description')}</label>
                      <textarea value={incomingData.description} onChange={e => setIncomingData({ ...incomingData, description: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-4 py-2.5 text-sm font-medium text-text-primary outline-none resize-none h-16 focus:border-red-500/50 transition-colors" placeholder="Wofür war diese Ausgabe (z.B. Musterplatten für Bauherrschaft)..." />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block">{t('budget_assignment')}</label>
                        <select value={incomingData.budgetPosId} onChange={e => setIncomingData({ ...incomingData, budgetPosId: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2.5 text-sm font-bold text-text-primary outline-none cursor-pointer">
                          <option value="" className="bg-surface">{t('free_booking')}</option>
                          {budgetGroups.map((group) => (
                            <optgroup key={group.id} label={`${group.pos} ${group.title}`} className="bg-surface font-bold">
                              {group.items.map((item) => (
                                <option key={item.id} value={item.id} className="font-normal">{item.pos} {item.description}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Status Rückerstattung</label>
                        <select value={incomingData.status} onChange={e => setIncomingData({ ...incomingData, status: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2.5 text-sm font-bold text-text-primary outline-none cursor-pointer">
                          <option value="Offen (Rückerstattung ausstehend)" className="bg-surface">Offen (Rückerstattung ausstehend)</option>
                          <option value="Rückerstattet / Ausbezahlt" className="bg-surface">Rückerstattet / Ausbezahlt</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 🔵 EXTERNER KREDITOR (LIEFERANT / HANDWERKER) */
                  <div className="space-y-4">
                    <div className="text-xs text-text-muted bg-blue-500/10 border border-blue-500/20 p-2.5 rounded-lg flex items-center gap-2">
                      <Building2 size={15} className="text-blue-500 shrink-0" />
                      <span>Kreditorenrechnung: Offizielle Handwerker-, Material- oder Planerrechnung erfassen.</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Firma / Kreditor (Lieferant)</label>
                        <input
                          type="text"
                          required
                          value={incomingData.company || incomingData.vendor}
                          onChange={e => setIncomingData({ ...incomingData, company: e.target.value, vendor: e.target.value })}
                          className="w-full bg-background border border-border/50 rounded-lg px-4 py-2.5 text-sm font-bold text-text-primary outline-none focus:border-red-500/50 transition-colors"
                          placeholder="z.B. Baumeister AG, Sanitär Meier"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Ansprechperson (optional)</label>
                        <input
                          type="text"
                          value={incomingData.contactPerson}
                          onChange={e => setIncomingData({ ...incomingData, contactPerson: e.target.value })}
                          className="w-full bg-background border border-border/50 rounded-lg px-4 py-2.5 text-sm font-medium text-text-primary outline-none focus:border-red-500/50 transition-colors"
                          placeholder="z.B. Herr Keller, Bauleiter"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Kreditoren-Rechnungs-Nr.</label>
                        <input
                          type="text"
                          value={incomingData.invoiceNumber}
                          onChange={e => setIncomingData({ ...incomingData, invoiceNumber: e.target.value })}
                          className="w-full bg-background border border-border/50 rounded-lg px-3 py-2.5 text-sm font-bold text-text-primary outline-none focus:border-red-500/50 transition-colors"
                          placeholder="z.B. RE-2026-8910"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block">MWST-Nr. des Lieferanten</label>
                        <input
                          type="text"
                          value={incomingData.vatNumber}
                          onChange={e => setIncomingData({ ...incomingData, vatNumber: e.target.value })}
                          className="w-full bg-background border border-border/50 rounded-lg px-3 py-2.5 text-sm font-medium text-text-primary outline-none focus:border-red-500/50 transition-colors"
                          placeholder="z.B. CHE-123.456.789 MWST"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Rechnungsdatum</label>
                        <input type="date" value={incomingData.date} onChange={e => setIncomingData({ ...incomingData, date: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2.5 text-sm font-bold text-text-primary outline-none focus:border-red-500/50 transition-colors" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Fälligkeit (Zahlungsziel)</label>
                        <input type="date" value={incomingData.dueDate} onChange={e => setIncomingData({ ...incomingData, dueDate: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2.5 text-sm font-medium text-text-primary outline-none focus:border-red-500/50 transition-colors" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block text-red-500">{t('amount_chf')}</label>
                        <input type="number" step="0.05" value={incomingData.amount} onChange={e => setIncomingData({ ...incomingData, amount: e.target.value })} className="w-full bg-red-500/5 border border-red-500/30 rounded-lg px-3 py-2.5 text-sm font-bold text-red-500 outline-none focus:border-red-500 transition-colors placeholder:text-red-500/30" placeholder="0.00" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Skonto %</label>
                        <select value={incomingData.skontoRate} onChange={e => setIncomingData({ ...incomingData, skontoRate: Number(e.target.value) })} className="w-full bg-background border border-border/50 rounded-lg px-2 py-2.5 text-sm font-bold text-text-primary outline-none cursor-pointer">
                          <option value={0} className="bg-surface">0% Skonto (Netto)</option>
                          <option value={2} className="bg-surface">2% Skonto (10 Tage)</option>
                          <option value={3} className="bg-surface">3% Skonto (8 Tage)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block">MWST-Satz</label>
                        <select value={incomingData.vatRate} onChange={e => setIncomingData({ ...incomingData, vatRate: Number(e.target.value) })} className="w-full bg-background border border-border/50 rounded-lg px-2 py-2.5 text-sm font-bold text-text-primary outline-none cursor-pointer">
                          <option value={8.1} className="bg-surface">8.1% (Normalsatz)</option>
                          <option value={2.6} className="bg-surface">2.6% (Reduziert)</option>
                          <option value={0} className="bg-surface">0% (Steuerfrei)</option>
                        </select>
                      </div>
                    </div>

                    {incomingData.skontoRate > 0 && incomingData.amount && (
                      <div className="text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg flex justify-between items-center">
                        <span>Skonto Abzug ({incomingData.skontoRate}%): -CHF {formatCHF(Number(incomingData.amount) * (incomingData.skontoRate / 100))}</span>
                        <span>Effektiv Netto: CHF {formatCHF(Number(incomingData.amount) * (1 - incomingData.skontoRate / 100))}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Aufwandskategorie</label>
                        <select value={incomingData.creditorCategory} onChange={e => setIncomingData({ ...incomingData, creditorCategory: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2.5 text-sm font-bold text-text-primary outline-none cursor-pointer">
                          <option value="Kreditorenrechnung (Handwerker / Material)" className="bg-surface">Kreditorenrechnung (Handwerker / Material)</option>
                          <option value="Honorar / Planerleistung" className="bg-surface">Honorar / Planerleistung</option>
                          <option value="Behörden & Gebühren" className="bg-surface">Behörden & Gebühren</option>
                          <option value="Sonstige Fremdleistung" className="bg-surface">Sonstige Fremdleistung</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block">IBAN / QR-IBAN (optional)</label>
                        <input type="text" value={incomingData.iban} onChange={e => setIncomingData({ ...incomingData, iban: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2.5 text-sm font-medium text-text-primary outline-none focus:border-red-500/50 transition-colors" placeholder="CH..." />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block">{t('description')}</label>
                      <textarea value={incomingData.description} onChange={e => setIncomingData({ ...incomingData, description: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-4 py-2.5 text-sm font-medium text-text-primary outline-none resize-none h-16 focus:border-red-500/50 transition-colors" placeholder="Leistungsbeschrieb / Werkvertrag gemäss Rechnung..." />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block">{t('budget_assignment')}</label>
                        <select value={incomingData.budgetPosId} onChange={e => setIncomingData({ ...incomingData, budgetPosId: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2.5 text-sm font-bold text-text-primary outline-none cursor-pointer">
                          <option value="" className="bg-surface">{t('free_booking')}</option>
                          {budgetGroups.map((group) => (
                            <optgroup key={group.id} label={`${group.pos} ${group.title}`} className="bg-surface font-bold">
                              {group.items.map((item) => (
                                <option key={item.id} value={item.id} className="font-normal">{item.pos} {item.description}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Status Rechnungsprüfung</label>
                        <select value={incomingData.status} onChange={e => setIncomingData({ ...incomingData, status: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2.5 text-sm font-bold text-text-primary outline-none cursor-pointer">
                          <option value="Offen zur Prüfung" className="bg-surface">Offen zur Prüfung</option>
                          <option value="Freigegeben zur Zahlung" className="bg-surface">Freigegeben zur Zahlung</option>
                          <option value="Bezahlt" className="bg-surface">{t('paid')}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
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
                  disabled={!(receiptType === 'external_cost' ? (incomingData.company || incomingData.vendor) : (incomingData.vendor)) || !incomingData.amount || isSubmitting}
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

      {isMounted && showCsvImportModal && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/40 dark:bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface border border-border rounded-2xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border/50 flex justify-between items-center bg-surface/50">
              <h3 className="font-bold flex items-center gap-2 text-text-primary"><Plus className="text-accent-ai" size={18} /> BKP CSV-Import</h3>
              <button onClick={() => setShowCsvImportModal(false)} className="text-text-muted hover:text-text-primary p-1 rounded-md bg-background"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-text-muted">Füge CSV-Zeilen im Format <code>Pos;Bezeichnung;Menge;Einheit;Einheitspreis</code> ein:</p>
              <textarea
                value={csvImportText}
                onChange={e => setCsvImportText(e.target.value)}
                className="w-full bg-background border border-border/50 rounded-xl p-4 text-xs font-mono text-text-primary outline-none focus:border-accent-ai resize-none h-44 custom-scrollbar"
                placeholder="211;Mauerarbeiten Ziegel;120;m2;85&#10;212;Betonarbeiten Fundament;15;m3;320"
              />
            </div>
            <div className="p-4 border-t border-border bg-surface flex justify-end gap-3 shrink-0">
              <button onClick={() => setShowCsvImportModal(false)} className="px-5 py-2 text-sm font-bold text-text-muted border border-border rounded-lg hover:text-text-primary transition-colors">{t('cancel')}</button>
              <button onClick={handleImportCSV} disabled={!csvImportText.trim()} className="px-5 py-2 bg-accent-ai text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50">
                Positionen Importieren
              </button>
            </div>
          </motion.div>
        </div>, document.body
      )}

      {isMounted && showAiBudgetModal && createPortal(
        <AiBudgetImportModal
          isOpen={showAiBudgetModal}
          onClose={() => setShowAiBudgetModal(false)}
          onImport={handleImportAiBudget}
          addToast={addToast}
          currentVersionName={activeVersion?.name || 'Aktuelle Variante'}
        />,
        document.body
      )}

    </motion.div>
  );
}