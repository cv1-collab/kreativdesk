import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  DollarSign, TrendingUp, Receipt, FileText,
  Plus, ArrowRight, Download, MoreVertical,
  CheckCircle2, Clock, Loader2, FileSignature, Trash2,
  Building, Landmark, PieChart, Briefcase, X, Smartphone, Image as ImageIcon, Camera,
  Calendar, Sparkles, Search, Filter, CheckSquare, Square, ExternalLink
} from 'lucide-react';
import { cn, sanitizeUrl } from '../utils';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { purgeAllDummyData } from '../services/seedService';
import { fetchSystemConfigJSON } from '../utils/configHelper';
import { useFinancialQuery } from '../hooks/queries/useFinancialQuery';
import { useProjectsQuery } from '../hooks/queries/useProjectsQuery';
import { useQueryClient } from '@tanstack/react-query';
import OpCostStudio from './OpCostStudio';
import ModuleGuideButton from './ModuleGuideButton';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  de: {
    receipt_live_received: 'Beleg analysiert & automatisch ausgefüllt!', status_updated: 'Status aktualisiert', update_error: 'Fehler beim Aktualisieren', confirm_delete: 'Möchtest du diesen Eintrag wirklich löschen?', entry_deleted: 'Eintrag gelöscht', delete_error: 'Fehler beim Löschen', uploading_receipt: 'Beleg wird hochgeladen...', upload_image_error: 'Fehler beim Bild-Upload', booking_receipt_ext: 'Buchungsbeleg (Externe Kosten)', recorded_by: 'Erfasst von', recorded_date: 'Erfassungsdatum', invoice_date: 'Rechnungsdatum', category: 'Kategorie', company_purpose: 'Firma / Zweck', amount_chf: 'Betrag (CHF)', attached_original_receipts: 'Angehängte Originalbelege', unknown: 'Unbekannt', ext_costs_booked: 'Externe Kosten erfolgreich verbucht & archiviert', save_error: 'Fehler beim Speichern', finance_analytics: 'Finanzen & Analytics', all_years: 'Alle Jahre', finance_overview_year: 'Die finanzielle Übersicht für', new_quote: 'Neue Offerte', new_invoice: 'Neue Rechnung', record_expenses: 'Spesen erfassen', record_ext_cost: 'Ext. Kosten erfassen', open_quotes: 'Offene Offerten', invoices_total: 'Rechnungen Total', expenses_team: 'Spesen Team', ext_costs: 'Externe Kosten', outgoing_invoices: 'Ausgangsrechnungen', quotes: 'Offerten', expenses: 'Spesen', external_costs: 'Externe Kosten', purpose_merchant: 'Zweck / Firma', amount: 'Betrag', date: 'Datum', receipts_photos: 'Belege / Fotos', upload_document: 'Beleg hochladen', live_scan: 'Live Scan', generate_pdf_book: 'PDF generieren & verbuchen', analyzing_ai: 'KI analysiert den Beleg...', ai_failed: 'Konnte Belegdaten nicht automatisch lesen. Bitte manuell eintragen.', no_entries: 'Keine Einträge', take_photo: 'Foto aufnehmen'
  },
  en: {
    receipt_live_received: 'Receipt analyzed & auto-filled!', status_updated: 'Status updated', update_error: 'Error updating', confirm_delete: 'Are you sure you want to delete this entry?', entry_deleted: 'Entry deleted', delete_error: 'Error deleting', uploading_receipt: 'Uploading receipt...', upload_image_error: 'Error uploading image', booking_receipt_ext: 'Booking Receipt (External Costs)', recorded_by: 'Recorded by', recorded_date: 'Date recorded', invoice_date: 'Invoice Date', category: 'Category', company_purpose: 'Company / Purpose', amount_chf: 'Amount (CHF)', attached_original_receipts: 'Attached Original Receipts', unknown: 'Unknown', ext_costs_booked: 'External costs successfully booked & archived', save_error: 'Error saving', finance_analytics: 'Finance Analytics', all_years: 'All Years', finance_overview_year: 'Financial overview for', new_quote: 'New Quote', new_invoice: 'New Invoice', record_expenses: 'Record Expenses', record_ext_cost: 'Record Ext. Costs', open_quotes: 'Open Quotes', invoices_total: 'Invoiced (Total)', expenses_team: 'Team Expenses', ext_costs: 'External Costs', outgoing_invoices: 'Outgoing Invoices', quotes: 'Quotes', expenses: 'Expenses', external_costs: 'External Costs', purpose_merchant: 'Purpose / Merchant', amount: 'Amount', date: 'Date', receipts_photos: 'Receipts / Photos', upload_document: 'Upload Document', live_scan: 'Live Scan', generate_pdf_book: 'Generate PDF & Book', analyzing_ai: 'AI is analyzing receipt...', ai_failed: 'Could not read data automatically. Please enter manually.', no_entries: 'No entries', take_photo: 'Take Photo'
  }
};

const formatCHF = (val: number) => new Intl.NumberFormat('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

const formatDateDisplay = (dateStr?: string) => {
  if (!dateStr) return '-';
  let clean = dateStr;
  if (clean.includes('T')) {
    clean = clean.split('T')[0];
  }
  const parts = clean.split('-');
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return clean;
};

interface Transaction { id: string; type?: string; amount: number; client?: string; description: string; date: string; status: string; category?: string; createdAt?: string; receiptUrls?: string[]; url?: string; }
interface FinanceTabProps { addToast: (msg: string, type: 'success' | 'error' | 'info') => void; setShowExpenseModal: (s: boolean) => void; setShowInvoiceModal: (s: boolean) => void; setShowQuoteModal: (s: boolean) => void; setNewFileAlerts?: any; }



export default function FinanceTab({ addToast, setShowExpenseModal, setShowInvoiceModal, setShowQuoteModal }: FinanceTabProps) {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const [showOpCostModal, setShowOpCostModal] = useState(false);

  const safeCompanyId = currentUser?.companyId || currentUser?.uid || '';
  const { transactions: queryTransactions, invalidateFinancial } = useFinancialQuery(safeCompanyId, selectedYear);
  const { projects: queryProjects } = useProjectsQuery(safeCompanyId);

  useEffect(() => {
    if (queryTransactions) {
      setTransactions(queryTransactions as any);
    }
  }, [queryTransactions]);

  useEffect(() => {
    if (queryProjects) {
      setProjects(queryProjects as any);
    }
  }, [queryProjects]);



  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await supabase.from('transactions').update({ status: newStatus }).eq('id', id);
      setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status: newStatus } : tx));
      addToast(t('status_updated'), "success");
    } catch (e) {
      addToast(t('update_error'), "error");
    }
  };

  const handleDeleteTransaction = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(t('confirm_delete'))) {
      try {
        await supabase.from('transactions').delete().eq('id', id);
        await supabase.from('time_entries').delete().eq('id', id);
        setTransactions(prev => prev.filter(tx => tx.id !== id));
        addToast(t('entry_deleted'), "success");
      } catch (e) {
        addToast(t('delete_error'), "error");
      }
    }
  };



  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'quotes' | 'invoices' | 'expenses' | 'operating_costs' | 'time_entries'>('all');

  const toggleSelectId = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = (items: Transaction[]) => {
    const itemIds = items.map(i => i.id);
    const allSelected = itemIds.length > 0 && itemIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !itemIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...itemIds])));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Möchtest du wirklich ${selectedIds.length} ausgewählte Einträge unwiderruflich löschen?`)) {
      try {
        const safeCompanyId = currentUser?.companyId || (currentUser as any)?.company_id || currentUser?.uid;
        let query = supabase.from('transactions').delete().in('id', selectedIds);
        if (safeCompanyId) {
          query = query.eq('company_id', safeCompanyId);
        }
        await query;
        setTransactions(prev => prev.filter(tx => !selectedIds.includes(tx.id)));
        setSelectedIds([]);
        addToast(`${selectedIds.length} Einträge erfolgreich gelöscht!`, 'success');
      } catch (e) {
        addToast(t('delete_error'), 'error');
      }
    }
  };

  const handleBulkStatus = async (newStatus: string) => {
    if (selectedIds.length === 0) return;
    try {
      const safeCompanyId = currentUser?.companyId || (currentUser as any)?.company_id || currentUser?.uid;
      let query = supabase.from('transactions').update({ status: newStatus }).in('id', selectedIds);
      if (safeCompanyId) {
        query = query.eq('company_id', safeCompanyId);
      }
      await query;
      setTransactions(prev => prev.map(tx => selectedIds.includes(tx.id) ? { ...tx, status: newStatus } : tx));
      addToast(`Status für ${selectedIds.length} Einträge auf "${newStatus}" aktualisiert`, 'success');
    } catch (e) {
      addToast(t('update_error'), 'error');
    }
  };


  const handleExportCSV = (itemsToExport: Transaction[]) => {
    if (itemsToExport.length === 0) return;
    const headers = ['ID', 'Datum', 'Kategorie', 'Beschreibung', 'Betrag (CHF)', 'Status'];
    const rows = itemsToExport.map(tx => [
      tx.id,
      tx.date || tx.createdAt || '',
      `"${(tx.category || tx.type || '').replace(/"/g, '""')}"`,
      `"${(tx.description || tx.client || '').replace(/"/g, '""')}"`,
      tx.amount,
      tx.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Finanzen_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const yearFiltered = selectedYear === 'all' ? transactions : transactions.filter(tx => (tx.date || tx.createdAt || '').includes(selectedYear));

  const searchFiltered = yearFiltered.filter(tx => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (tx.description || '').toLowerCase().includes(q) ||
      (tx.category || '').toLowerCase().includes(q) ||
      (tx.client || '').toLowerCase().includes(q) ||
      (tx.status || '').toLowerCase().includes(q) ||
      String(tx.amount).includes(q)
    );
  });

  const quotes = searchFiltered.filter(tx => tx.category === 'Offerte' || tx.category === 'Quote' || tx.type === 'quote');
  const invoices = searchFiltered.filter(tx => tx.category === 'Debitorenrechnung' || tx.category === 'Outgoing Invoice' || tx.type === 'revenue' || tx.type === 'invoice');
  const expenses = searchFiltered.filter(tx => tx.category === 'Spesen' || tx.type === 'expense');
  const operatingCosts = searchFiltered.filter(tx => tx.type === 'operating_cost' || (typeof tx.category === 'string' && (tx.category.includes('Kreditor') || tx.category.includes('Honorar') || tx.category.includes('Gebühr'))));
  const timeEntriesList = searchFiltered.filter(tx => tx.category === 'Interne Stunden' || tx.type === 'time_entry');

  const totalRevenue = invoices.reduce((acc, curr) => acc + Math.abs(Number(curr.amount)), 0);
  const totalSpesen = expenses.reduce((acc, curr) => acc + Math.abs(Number(curr.amount)), 0);
  const totalOpCosts = operatingCosts.reduce((acc, curr) => acc + Math.abs(Number(curr.amount)), 0);
  const totalTimeCosts = timeEntriesList.reduce((acc, curr) => acc + Math.abs(Number(curr.amount)), 0);

  const activeCategoryItems =
    activeTabFilter === 'quotes' ? quotes :
      activeTabFilter === 'invoices' ? invoices :
        activeTabFilter === 'expenses' ? expenses :
          activeTabFilter === 'operating_costs' ? operatingCosts :
            activeTabFilter === 'time_entries' ? timeEntriesList :
              searchFiltered;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-text-primary">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('finance_analytics')}</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-text-muted text-sm">{t('finance_overview_year')}</p>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-background border border-border/60 rounded-xl px-2.5 py-1 text-xs font-bold focus:border-accent-ai outline-none text-text-primary h-7 shadow-xs cursor-pointer"
            >
              <option value="all">{t('all_years')}</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>
        </div>
        <div className="tour-company-finance-actions flex flex-wrap items-center gap-2 sm:gap-2.5 w-full lg:w-auto">
          <ModuleGuideButton moduleId="finance" />
          <button onClick={() => setShowQuoteModal(true)} className="flex-1 sm:flex-none h-9 px-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"><FileSignature size={15} /> {t('new_quote')}</button>
          <button onClick={() => setShowInvoiceModal(true)} className="flex-1 sm:flex-none h-9 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"><FileText size={15} /> {t('new_invoice')}</button>
          <button onClick={() => setShowExpenseModal(true)} className="flex-1 sm:flex-none h-9 px-3.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"><Receipt size={15} /> {t('record_expenses')}</button>
          <button onClick={() => setShowOpCostModal(true)} className="flex-1 sm:flex-none h-9 px-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"><Landmark size={15} /> {t('record_ext_cost')}</button>
        </div>
      </div>

      <div className="tour-company-finance-kpis grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border/50 p-5 rounded-2xl shadow-sm"><div className="flex items-center gap-3 mb-2"><div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg"><FileSignature size={18} /></div><h3 className="font-semibold text-sm">{t('open_quotes')}</h3></div><p className="text-2xl font-bold">{quotes.filter(tx => tx.status !== 'Approved' && tx.status !== 'Angenommen' && tx.status !== 'Bezahlt').length}</p></div>
        <div className="bg-surface border border-border/50 p-5 rounded-2xl shadow-sm"><div className="flex items-center gap-3 mb-2"><div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg"><TrendingUp size={18} /></div><h3 className="font-semibold text-sm">{t('invoices_total')}</h3></div><p className="text-2xl font-bold">CHF {totalRevenue.toLocaleString('de-CH')}</p></div>
        <div className="bg-surface border border-border/50 p-5 rounded-2xl shadow-sm"><div className="flex items-center gap-3 mb-2"><div className="p-1.5 bg-orange-500/10 text-orange-500 rounded-lg"><Receipt size={18} /></div><h3 className="font-semibold text-sm">{t('expenses_team')}</h3></div><p className="text-2xl font-bold">CHF {totalSpesen.toLocaleString('de-CH')}</p></div>
        <div className="bg-surface border border-border/50 p-5 rounded-2xl shadow-sm"><div className="flex items-center gap-3 mb-2"><div className="p-1.5 bg-purple-500/10 text-purple-500 rounded-lg"><Landmark size={18} /></div><h3 className="font-semibold text-sm">{t('ext_costs')}</h3></div><p className="text-2xl font-bold">CHF {totalOpCosts.toLocaleString('de-CH')}</p></div>
      </div>

      {/* PROJECT BUDGETS OVERVIEW */}
      <div className="tour-company-finance-budgets bg-surface border border-border/50 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center shrink-0 shadow-xs">
            <Briefcase size={15} />
          </div>
          <h3 className="font-bold text-base text-text-primary tracking-tight">Projekt Budgets (Übersicht)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-background/50 text-text-muted text-xs uppercase">
              <tr>
                <th className="px-4 py-2 rounded-l-lg">Projekt</th>
                <th className="px-4 py-2 text-right">Geplantes Budget (Soll)</th>
                <th className="px-4 py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {projects.length === 0 && <tr><td colSpan={3} className="text-center py-4 text-text-muted">{t('no_entries')}</td></tr>}
              {projects.map(proj => {
                let pBudget = 0;
                if (Array.isArray(proj.financeGroups)) {
                  proj.financeGroups.forEach((g: any) => {
                    if (Array.isArray(g.items)) {
                      g.items.forEach((i: any) => {
                        pBudget += (Number(i.qty) || 0) * (Number(i.unitPrice) || 0);
                      });
                    }
                  });
                }
                return (
                  <tr key={proj.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium">{proj.name}</td>
                    <td className="px-4 py-3 text-right font-bold text-indigo-500">CHF {pBudget.toLocaleString('de-CH')}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn("px-2 py-1 rounded text-xs font-medium", proj.status === 'active' ? "bg-emerald-500/10 text-emerald-500" : "bg-gray-500/10 text-gray-500")}>
                        {proj.status === 'active' ? 'Aktiv' : 'Abgeschlossen'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SEARCH, FILTER & INTERACTIVE ACTION BAR */}
      <div className="tour-company-finance-table bg-surface border border-border/50 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* SEARCH INPUT */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Durchsuchen nach Beschreibung, Firma, Betrag, Status..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm outline-none focus:border-indigo-500 text-text-primary placeholder:text-text-muted/60 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-xs">
                <X size={16} />
              </button>
            )}
          </div>

          {/* EXPORT ALL CSV BUTTON */}
          <button
            onClick={() => handleExportCSV(activeCategoryItems)}
            disabled={activeCategoryItems.length === 0}
            className="px-4 py-2.5 bg-surface border border-border hover:bg-white/5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40"
          >
            <Download size={15} /> CSV Export ({activeCategoryItems.length})
          </button>
        </div>

        {/* CATEGORY TABS */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar border-b border-border/30 pb-3">
          <button
            onClick={() => setActiveTabFilter('all')}
            className={cn("px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border", activeTabFilter === 'all' ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/30" : "bg-surface border-border/40 text-text-muted hover:text-text-primary")}
          >
            Alle ({searchFiltered.length})
          </button>
          <button
            onClick={() => setActiveTabFilter('quotes')}
            className={cn("px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5", activeTabFilter === 'quotes' ? "bg-blue-500/10 text-blue-500 border-blue-500/30" : "bg-surface border-border/40 text-text-muted hover:text-text-primary")}
          >
            <FileSignature size={14} /> Offerten ({quotes.length})
          </button>
          <button
            onClick={() => setActiveTabFilter('invoices')}
            className={cn("px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5", activeTabFilter === 'invoices' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : "bg-surface border-border/40 text-text-muted hover:text-text-primary")}
          >
            <FileText size={14} /> Ausgangsrechnungen ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTabFilter('expenses')}
            className={cn("px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5", activeTabFilter === 'expenses' ? "bg-orange-500/10 text-orange-500 border-orange-500/30" : "bg-surface border-border/40 text-text-muted hover:text-text-primary")}
          >
            <Receipt size={14} /> Spesen ({expenses.length})
          </button>
          <button
            onClick={() => setActiveTabFilter('operating_costs')}
            className={cn("px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5", activeTabFilter === 'operating_costs' ? "bg-purple-500/10 text-purple-500 border-purple-500/30" : "bg-surface border-border/40 text-text-muted hover:text-text-primary")}
          >
            <Landmark size={14} /> Externe Kosten ({operatingCosts.length})
          </button>
          <button
            onClick={() => setActiveTabFilter('time_entries')}
            className={cn("px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5", activeTabFilter === 'time_entries' ? "bg-amber-500/10 text-amber-500 border-amber-500/30" : "bg-surface border-border/40 text-text-muted hover:text-text-primary")}
          >
            <Clock size={14} /> Interne Stunden / Rapporte ({timeEntriesList.length})
          </button>
        </div>

        {/* FLOATING BULK ACTIONS BAR */}
        {selectedIds.length > 0 && (
          <div className="bg-indigo-600 text-white p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xl animate-in fade-in duration-200">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckSquare size={18} />
              <span>{selectedIds.length} Einträge ausgewählt</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow"
              >
                <Trash2 size={14} /> Ausgewählte löschen
              </button>
              <button
                onClick={() => handleBulkStatus('Bezahlt')}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow"
              >
                <CheckCircle2 size={14} /> Als Bezahlt markieren
              </button>
              <button
                onClick={() => handleBulkStatus('Offen')}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow"
              >
                Als Offen markieren
              </button>
              <button
                onClick={() => handleExportCSV(transactions.filter(t => selectedIds.includes(t.id)))}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Download size={14} /> CSV Export
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-xs text-white/80 hover:text-white font-bold ml-2 underline"
              >
                Abwählen
              </button>
            </div>
          </div>
        )}

        {/* MASTER INTERACTIVE TABLE */}
        <div className="overflow-x-auto custom-scrollbar border border-border/30 rounded-xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-background/80 text-text-muted text-xs uppercase tracking-wider border-b border-border/30">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={activeCategoryItems.length > 0 && activeCategoryItems.every(item => selectedIds.includes(item.id))}
                    onChange={() => toggleSelectAll(activeCategoryItems)}
                    className="w-4 h-4 rounded border-border text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="p-3">Beschreibung / Firma</th>
                <th className="p-3">Kategorie</th>
                <th className="p-3">Datum</th>
                <th className="p-3 text-right">Betrag (CHF)</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {activeCategoryItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-text-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Receipt size={32} className="opacity-30" />
                      <p className="font-medium text-sm">{t('no_entries')}</p>
                      {searchQuery && <p className="text-xs text-text-muted">Keine Treffer für "{searchQuery}"</p>}
                    </div>
                  </td>
                </tr>
              )}
              {activeCategoryItems.map(item => {
                const isSelected = selectedIds.includes(item.id);
                const hasPdf = !!sanitizeUrl(item.url || item.receiptUrls?.[0]);
                const pdfUrl = sanitizeUrl(item.url || item.receiptUrls?.[0]);

                return (
                  <tr key={item.id} className={cn("hover:bg-white/[0.03] transition-colors", isSelected && "bg-indigo-500/10")}>
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectId(item.id)}
                        className="w-4 h-4 rounded border-border text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                    <td className="p-3 font-semibold text-text-primary">
                      <div className="truncate max-w-[280px]" title={item.description || item.client}>
                        {item.description || item.client || 'Buchung'}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-surface border border-border/40 rounded text-[11px] font-medium text-text-muted">
                        {item.category || item.type || 'Allgemein'}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-text-muted whitespace-nowrap">
                      {formatDateDisplay(item.date || item.createdAt)}
                    </td>
                    <td className="p-3 text-right font-bold text-sm whitespace-nowrap text-text-primary">
                      CHF {formatCHF(Math.abs(Number(item.amount)))}
                    </td>
                    <td className="p-3 text-center">
                      <select
                        value={item.status || 'Offen'}
                        onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border outline-none cursor-pointer",
                          item.status === 'Bezahlt' || item.status === 'paid' || item.status === 'Approved' || item.status === 'Angenommen'
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                            : item.status === 'Abgelehnt'
                              ? "bg-red-500/10 text-red-500 border-red-500/30"
                              : "bg-amber-500/10 text-amber-500 border-amber-500/30"
                        )}
                      >
                        <option value="Offen" className="bg-surface text-text-primary">Offen</option>
                        <option value="Bezahlt" className="bg-surface text-text-primary">Bezahlt</option>
                        <option value="Angenommen" className="bg-surface text-text-primary">Angenommen</option>
                        <option value="Abgelehnt" className="bg-surface text-text-primary">Abgelehnt</option>
                      </select>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {hasPdf && !!sanitizeUrl(pdfUrl) && (
                          <a
                            href={sanitizeUrl(pdfUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg border border-blue-500/20 transition-all flex items-center gap-1 text-xs font-bold"
                            title="Dokument / PDF anzeigen & herunterladen"
                          >
                            <FileText size={14} /> PDF
                          </a>
                        )}
                        <button
                          onClick={(e) => handleDeleteTransaction(item.id, e)}
                          className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg border border-red-500/20 transition-all flex items-center gap-1 text-xs font-bold"
                          title="Eintrag löschen"
                        >
                          <Trash2 size={14} /> Löschen
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* EXT. KOSTEN MODAL */}
      {showOpCostModal && (
        <OpCostStudio onClose={() => { setShowOpCostModal(false); invalidateFinancial(); }} />
      )}
    </div>
  );
}