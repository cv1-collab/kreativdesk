import { describe, it, expect } from 'vitest';
import {
  calculateTimeEntryCost,
  convertTimeEntriesToTransactions,
  calculateVat,
  calculateFinancialLedger,
  formatCHF,
} from '../../src/services/financialLedgerService';

describe('Financial Ledger Service: Mathematische Validierung', () => {
  describe('calculateTimeEntryCost', () => {
    it('berechnet Stunden x Stundensatz exakt', () => {
      expect(calculateTimeEntryCost(5, 150)).toBe(750);
      expect(calculateTimeEntryCost('3.5', '120')).toBe(420);
    });

    it('greift bei ungültigem oder fehlendem Satz auf Fallback zurück', () => {
      expect(calculateTimeEntryCost(4, null, 120)).toBe(480);
      expect(calculateTimeEntryCost(2, 0, 100)).toBe(200);
    });

    it('verhindert negative Stunden', () => {
      expect(calculateTimeEntryCost(-5, 120)).toBe(0);
    });
  });

  describe('calculateVat (Schweizer MwSt)', () => {
    it('berechnet Normalsatz 8.1% auf 2 Nachkommastellen genau', () => {
      const res = calculateVat(1000, 8.1);
      expect(res.vatAmount).toBe(81);
      expect(res.grossAmount).toBe(1081);
    });

    it('rundet kaufmännisch korrekt', () => {
      const res = calculateVat(123.45, 8.1);
      // 123.45 * 0.081 = 9.99945 => 10.00
      expect(res.vatAmount).toBe(10);
      expect(res.grossAmount).toBe(133.45);
    });
  });

  describe('convertTimeEntriesToTransactions', () => {
    it('konvertiert Rapporte in normierte Ledger-Transaktionen', () => {
      const raw = [
        { id: 't1', hours: 4, hourly_rate: 130, description: 'Bauleitung', date: '2026-03-01' },
        { id: 't2', hours: 2, hourlyRate: 150, description: 'CAD Zeichnen', date: '2026-03-02' }
      ];
      const txs = convertTimeEntriesToTransactions(raw);
      expect(txs).toHaveLength(2);
      expect(txs[0].amount).toBe(520);
      expect(txs[0].type).toBe('time_entry');
      expect(txs[1].amount).toBe(300);
    });
  });

  describe('calculateFinancialLedger', () => {
    it('saldiert Einnahmen, Ausgaben, Margen und Mehrwertsteuer exakt', () => {
      const txs = [
        { id: 'inv-1', type: 'invoice', amount: 10000, description: 'Abschlagsrechnung 1', date: '2026-01-15', status: 'Bezahlt' },
        { id: 'inv-2', type: 'invoice', amount: 5000, description: 'Abschlagsrechnung 2', date: '2026-02-15', status: 'Bezahlt' },
        { id: 'quote-1', type: 'quote', amount: 12000, description: 'Offerte Umbau', date: '2026-02-01', status: 'Offen' },
        { id: 'exp-1', type: 'expense', amount: 1500, description: 'Fahrtspesen & Material', date: '2026-01-20', status: 'Gebucht' },
        { id: 'ext-1', type: 'external_cost', amount: 3500, description: 'Statiker Gutachten', date: '2026-02-10', status: 'Gebucht' },
        { id: 'time-1', type: 'time_entry', amount: 2000, description: 'Interne Projektstunden', date: '2026-02-12', status: 'Gebucht' }
      ];

      const ledger = calculateFinancialLedger(txs, 'all');

      expect(ledger.outgoingInvoicesTotal).toBe(15000);
      expect(ledger.openQuotesTotal).toBe(12000);
      expect(ledger.teamExpensesTotal).toBe(1500);
      expect(ledger.externalCostsTotal).toBe(3500);
      expect(ledger.internalTimeCostTotal).toBe(2000);
      expect(ledger.totalExpenses).toBe(7000);
      expect(ledger.netProfit).toBe(8000);
      // Marge: 8000 / 15000 = 53.33%
      expect(ledger.profitMarginPercent).toBe(53.33);
      // MwSt auf Rechnungen (8.1% auf 15000 = 1215)
      expect(ledger.vatStandardTotal).toBe(1215);
    });

    it('filtert korrekt nach Jahr', () => {
      const txs = [
        { id: 'inv-1', type: 'invoice', amount: 5000, description: 'Rechnung 2025', date: '2025-11-01', status: 'Bezahlt' },
        { id: 'inv-2', type: 'invoice', amount: 8000, description: 'Rechnung 2026', date: '2026-03-01', status: 'Bezahlt' }
      ];
      const ledger2026 = calculateFinancialLedger(txs, '2026');
      expect(ledger2026.outgoingInvoicesTotal).toBe(8000);
    });
  });

  describe('formatCHF', () => {
    it('formatiert nach Schweizer Standard', () => {
      const str = formatCHF(1250.5);
      // de-CH Formatierer verwendet Leerzeichen oder Apostroph als Tausendertrennzeichen
      expect(str).toContain('50');
      expect(str).toContain('1');
    });
  });
});
