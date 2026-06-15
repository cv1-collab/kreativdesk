import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CreditCard, ExternalLink, Loader2, Filter, X, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    stripe_billing: 'Subscriptions & Billing', manage_payments_desc: 'Manage all payments and active subscriptions.',
    filter_all: 'All', filter_paid: 'Paid', filter_pending: 'Pending', filter_failed: 'Failed', filter_refunded: 'Refunded',
    filter_canceled: 'Canceled', filter_active: 'Active', transaction_id: 'ID', user_plan: 'User & Plan', amount: 'Amount',
    status: 'Status', unknown: 'Unknown', no_payments_found: 'No transactions found.', open_stripe: 'Open Stripe Dashboard',
    details: 'Transaction Details', cancel: 'Cancel', save_changes: 'Save Changes', status_updated: 'Status successfully updated.'
  },
  de: {
    stripe_billing: 'Abos & Abrechnung', manage_payments_desc: 'Verwalte alle Zahlungen und aktive Abonnements.',
    filter_all: 'Alle', filter_paid: 'Bezahlt', filter_pending: 'Ausstehend', filter_failed: 'Fehler', filter_refunded: 'Erstattet',
    filter_canceled: 'Gekündigt', filter_active: 'Aktiv', transaction_id: 'ID', user_plan: 'Nutzer & Abo', amount: 'Betrag',
    status: 'Status', unknown: 'Unbekannt', no_payments_found: 'Keine Transaktionen gefunden.', open_stripe: 'Stripe Dashboard öffnen',
    details: 'Transaktionsdetails', cancel: 'Abbrechen', save_changes: 'Änderungen speichern', status_updated: 'Status erfolgreich aktualisiert.'
  }
};

export default function AdminSalesTab() {
  const { addToast } = useToast();
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [transactions, setTransactions] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrx, setSelectedTrx] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, 'transactions'), (snapshot) => {
      const allTrx = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((trx: any) => 
            trx.category !== 'Kreditorenrechnung' && 
            trx.category !== 'Expense' &&
            !trx.description?.toLowerCase().includes('akonto')
        );
        
      setTransactions(allTrx);
    });
    return () => unsub();
  }, []);

  const handleSaveTrx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrx || !db) return;
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, 'transactions', selectedTrx.id), {
        status: selectedTrx.status
      });
      addToast(t('status_updated'), 'success');
      setIsModalOpen(false);
    } catch (err) {
      addToast('Fehler beim Speichern', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTransactions = filter === 'All' ? transactions : transactions.filter(t => t.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 sm:pb-0">
          <Filter size={16} className="text-text-muted shrink-0 mr-2" />
          {['All', 'Paid', 'Pending', 'Failed', 'Refunded', 'Canceled'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={cn("px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border", filter === f ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-surface text-text-muted border-border hover:bg-white/5")}>
              {t(`filter_${f.toLowerCase()}`) || f}
            </button>
          ))}
        </div>
        <button onClick={() => window.open('https://dashboard.stripe.com', '_blank')} className="px-4 py-2 bg-[#635BFF]/10 text-[#635BFF] border border-[#635BFF]/20 rounded-xl text-sm font-bold hover:bg-[#635BFF]/20 transition-all flex items-center justify-center gap-2 shadow-sm shrink-0">
          <ExternalLink size={16}/> {t('open_stripe')}
        </button>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-[10px] uppercase tracking-widest text-text-muted bg-background border-b border-border/50">
            <tr>
              <th className="px-6 py-4 font-bold">{t('transaction_id')}</th>
              <th className="px-6 py-4 font-bold">{t('user_plan')}</th>
              <th className="px-6 py-4 font-bold text-right">{t('amount')}</th>
              <th className="px-6 py-4 font-bold text-right">{t('status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filteredTransactions.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-12 text-text-muted font-medium">{t('no_payments_found')}</td></tr>
            ) : (
              filteredTransactions.map(trx => (
                <tr key={trx.id} onClick={() => { setSelectedTrx(trx); setIsModalOpen(true); }} className="hover:bg-background transition-colors cursor-pointer group">
                  <td className="px-6 py-4 font-mono text-xs text-text-muted">{trx.id.substring(0, 12)}...</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-text-primary">{trx.userEmail || trx.userName || t('unknown')}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-text-muted font-medium">{trx.plan || 'Subscription'}</p>
                      {/* 🔥 NEU: Label für manuelle Rechnungen */}
                      {trx.isManual && (
                        <span className="text-[9px] bg-purple-500/10 text-purple-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-widest border border-purple-500/20">Manuell</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-text-primary">CHF {trx.amount?.toFixed(2) || '0.00'}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase", trx.status === 'Paid' ? "bg-emerald-500/10 text-emerald-500" : trx.status === 'Pending' ? "bg-orange-500/10 text-orange-500" : "bg-red-500/10 text-red-500")}>
                      {trx.status || 'Pending'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedTrx && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 md:p-6 border-b border-border/50 flex items-center justify-between bg-surface/50">
              <h3 className="font-bold flex items-center gap-2 text-text-primary"><CreditCard size={18} className="text-emerald-500"/> {t('details')}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-primary transition-colors p-1.5 bg-background rounded-lg border border-border"><X size={20}/></button>
            </div>
            
            <div className="p-4 md:p-6 flex-1 overflow-y-auto bg-background/50">
              <form id="edit-trx-form" onSubmit={handleSaveTrx} className="space-y-5">
                
                <div className="p-4 bg-surface border border-border/50 rounded-xl space-y-3 mb-6">
                  <div className="flex justify-between text-sm"><span className="text-text-muted font-medium">Transaktions-ID</span><span className="font-mono text-text-primary font-bold">{selectedTrx.id}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-text-muted font-medium">Nutzer</span><span className="text-text-primary font-bold">{selectedTrx.userEmail || selectedTrx.userName || 'Unbekannt'}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-text-muted font-medium">Betrag</span><span className="text-text-primary font-bold">CHF {selectedTrx.amount?.toFixed(2) || '0.00'}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-text-muted font-medium">Datum</span><span className="text-text-primary font-bold">{new Date(selectedTrx.createdAt || selectedTrx.date).toLocaleDateString()}</span></div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">{t('status')}</label>
                  <select 
                    value={selectedTrx.status || 'Pending'} 
                    onChange={(e) => setSelectedTrx({...selectedTrx, status: e.target.value})} 
                    className="w-full bg-surface border border-border/50 rounded-lg px-4 py-3 text-sm font-bold text-text-primary focus:outline-none focus:border-emerald-500 shadow-sm cursor-pointer"
                  >
                    <option value="Paid">Paid (Bezahlt)</option>
                    <option value="Pending">Pending (Ausstehend)</option>
                    <option value="Failed">Failed (Fehlgeschlagen)</option>
                    <option value="Refunded">Refunded (Erstattet)</option>
                    <option value="Canceled">Canceled (Gekündigt)</option>
                  </select>
                </div>

              </form>
            </div>

            <div className="p-4 md:p-6 border-t border-border bg-surface/90 backdrop-blur-md flex flex-col sm:flex-row justify-end gap-3 shrink-0 sticky bottom-0 z-30">
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-text-primary border border-border sm:border-transparent rounded-lg transition-colors">{t('cancel')}</button>
              <button form="edit-trx-form" type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-8 py-3 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {isSubmitting && <Loader2 size={16} className="animate-spin"/>} 
                <CheckCircle2 size={18} /> {t('save_changes')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}