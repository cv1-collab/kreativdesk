import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { isExcelFile, parseExcelFile } from '../../src/utils/excelParser';

describe('excelParser', () => {
  it('identifies excel and csv files by filename and mime', () => {
    expect(isExcelFile('budget.xlsx')).toBe(true);
    expect(isExcelFile('kalkulation.XLS')).toBe(true);
    expect(isExcelFile('export.csv')).toBe(true);
    expect(isExcelFile('daten.tsv')).toBe(true);
    expect(isExcelFile('tabelle.ods')).toBe(true);
    expect(isExcelFile('screenshot.png')).toBe(false);
    expect(isExcelFile('offerte.pdf')).toBe(false);
  });

  it('parses an excel workbook buffer and extracts structured text', async () => {
    // Create an in-memory workbook
    const wb = XLSX.utils.book_new();
    const wsData = [
      ['BKP', 'Beschreibung', 'Menge', 'Einheit', 'Preis', 'Total'],
      ['100', 'Vorbereitungsarbeiten', '', '', '', ''],
      ['101.1', 'Baustellensicherung', '1', 'Pausch.', '3500', '3500'],
      ['200', 'Rohbauarbeiten', '', '', '', ''],
      ['211.1', 'Aushubarbeiten', '150', 'm3', '85', '12750']
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Budget 2026');

    const u8 = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const file = new File([u8], 'test_budget.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const result = await parseExcelFile(file);

    expect(result.fileName).toBe('test_budget.xlsx');
    expect(result.sheetNames).toEqual(['Budget 2026']);
    expect(result.totalRows).toBe(5);
    expect(result.formattedText).toContain('=== TABELLENBLATT: "Budget 2026" (5 Zeilen) ===');
    expect(result.formattedText).toContain('101.1\tBaustellensicherung\t1\tPausch.\t3500\t3500');
  });

  it('parses a CSV file into structured tabular text', async () => {
    const csvContent = 'Pos;Beschreibung;Menge;Einheit;Preis\n100;Vorbereitung;;;\n101;Planung;1;Pausch;2500';
    const file = new File([csvContent], 'offerte.csv', { type: 'text/csv' });

    const result = await parseExcelFile(file);

    expect(result.fileName).toBe('offerte.csv');
    expect(result.totalRows).toBeGreaterThanOrEqual(2);
    expect(result.formattedText).toContain('101');
    expect(result.formattedText).toContain('Planung');
  });
});
