/**
 * ============================================================================
 * KREATIV DESK OS - FINANCIAL LEDGER SERVICE
 * ============================================================================
 * Zentrale, seiteneffektfreie Geschäftslogik für Budget-, Margen-,
 * Stundensatz- und Ledger-Berechnungen (Separation of Concerns).
 */

export interface TransactionItem {
  id: string;
  type?: string;
  amount: number;
  client?: string;
  description: string;
  date: string;
  status: string;
  category?: string;
  createdAt?: string;
  receiptUrls?: string[];
  url?: string;
  projectId?: string;
  companyId?: string;
}

export interface RawTimeEntry {
  id?: string;
  hours?: number | string;
  hourly_rate?: number | string;
  hourlyRate?: number | string;
  description?: string;
  date?: string;
  created_at?: string;
  project_id?: string;
  projectId?: string;
  company_id?: string;
}

export interface FinancialLedgerSummary {
  outgoingInvoicesTotal: number;
  openQuotesTotal: number;
  teamExpensesTotal: number;
  externalCostsTotal: number;
  internalTimeCostTotal: number;
  totalExpenses: number;
  netProfit: number;
  profitMarginPercent: number;
  vatStandardTotal: number; // 8.1% CH Normalsatz
}

/**
 * Formatiert Beträge nach Schweizer Banken- und Buchhaltungsstandard (z.B. 1'250.00).
 */
export function formatCHF(val: number): string {
  const num = Number.isFinite(val) ? val : 0;
  return new Intl.NumberFormat('de-CH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Berechnet die Kosten eines einzelnen Stundeneintrags (Rapport).
 */
export function calculateTimeEntryCost(
  hours: number | string | undefined | null,
  hourlyRate: number | string | undefined | null,
  fallbackRate = 120
): number {
  const numHours = Math.max(0, Number(hours || 0));
  const rate = Number(hourlyRate || 0) > 0 ? Number(hourlyRate) : fallbackRate;
  return Math.round(numHours * rate * 100) / 100;
}

/**
 * Mappt und konvertiert rohe Zeiteinträge in einheitliche Ledger-Transaktionen.
 */
export function convertTimeEntriesToTransactions(
  timeEntries: RawTimeEntry[],
  fallbackRate = 120
): TransactionItem[] {
  if (!Array.isArray(timeEntries)) return [];

  const timeMap = new Map<string, TransactionItem>();

  for (const t of timeEntries) {
    if (!t) continue;
    const hoursNum = Math.max(0, Number(t.hours || 0));
    if (hoursNum <= 0 && !t.id) continue;

    const rateNum = Number(t.hourly_rate || t.hourlyRate || fallbackRate);
    const entryId = t.id || `time-${t.date || 'nodate'}-${hoursNum}`;
    const amount = calculateTimeEntryCost(hoursNum, rateNum, fallbackRate);

    timeMap.set(entryId, {
      id: entryId,
      type: 'time_entry',
      category: 'Interne Stunden',
      description: `${hoursNum}h Rapport: ${t.description || 'Stundenerfassung'}`,
      amount,
      date: t.date ? (String(t.date).includes('T') ? String(t.date).split('T')[0] : String(t.date)) : (t.created_at ? String(t.created_at).split('T')[0] : new Date().toISOString().split('T')[0]),
      status: 'Gebucht',
      projectId: t.project_id || t.projectId || 'global',
      companyId: t.company_id,
      createdAt: t.created_at || new Date().toISOString(),
    });
  }

  return Array.from(timeMap.values());
}

/**
 * Berechnet Mehrwertsteuer nach Schweizer Standard.
 * @param netAmount Nettobetrag in CHF
 * @param vatPercent Steuersatz in Prozent (z. B. 8.1 für Normalsatz)
 */
export function calculateVat(netAmount: number, vatPercent = 8.1): { vatAmount: number; grossAmount: number } {
  const validNet = Math.max(0, Number(netAmount) || 0);
  const vatAmount = Math.round((validNet * (vatPercent / 100)) * 100) / 100;
  const grossAmount = Math.round((validNet + vatAmount) * 100) / 100;
  return { vatAmount, grossAmount };
}

/**
 * Konsolidiert alle Transaktionen und Zeitaufwände in einen vollständigen Financial Ledger.
 */
export function calculateFinancialLedger(
  transactions: TransactionItem[],
  selectedYear: string = 'all'
): FinancialLedgerSummary {
  const filtered = transactions.filter((t) => {
    if (!t || typeof t.amount !== 'number') return false;
    if (selectedYear === 'all') return true;
    const txYear = (t.date || t.createdAt || '').substring(0, 4);
    return txYear === selectedYear;
  });

  let outgoingInvoicesTotal = 0;
  let openQuotesTotal = 0;
  let teamExpensesTotal = 0;
  let externalCostsTotal = 0;
  let internalTimeCostTotal = 0;

  for (const t of filtered) {
    const amt = Math.abs(Number(t.amount) || 0);
    const type = (t.type || '').toLowerCase();

    if (type === 'invoice') {
      outgoingInvoicesTotal += amt;
    } else if (type === 'quote') {
      openQuotesTotal += amt;
    } else if (type === 'expense') {
      teamExpensesTotal += amt;
    } else if (type === 'external_cost' || type === 'ext_cost') {
      externalCostsTotal += amt;
    } else if (type === 'time_entry') {
      internalTimeCostTotal += amt;
    }
  }

  const totalExpenses = teamExpensesTotal + externalCostsTotal + internalTimeCostTotal;
  const netProfit = outgoingInvoicesTotal - totalExpenses;
  const profitMarginPercent =
    outgoingInvoicesTotal > 0
      ? Math.round((netProfit / outgoingInvoicesTotal) * 10000) / 100
      : 0;

  const { vatAmount: vatStandardTotal } = calculateVat(outgoingInvoicesTotal, 8.1);

  return {
    outgoingInvoicesTotal: Math.round(outgoingInvoicesTotal * 100) / 100,
    openQuotesTotal: Math.round(openQuotesTotal * 100) / 100,
    teamExpensesTotal: Math.round(teamExpensesTotal * 100) / 100,
    externalCostsTotal: Math.round(externalCostsTotal * 100) / 100,
    internalTimeCostTotal: Math.round(internalTimeCostTotal * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    profitMarginPercent,
    vatStandardTotal,
  };
}
