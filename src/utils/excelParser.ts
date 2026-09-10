import * as XLSX from 'xlsx';

export interface ParsedExcelResult {
  fileName: string;
  sheetNames: string[];
  totalRows: number;
  formattedText: string;
  fileSize: number;
}

/**
 * Checks if a file or filename is an Excel or spreadsheet document.
 */
export function isExcelFile(file: File | Blob | string): boolean {
  const name = typeof file === 'string' ? file : ((file as any).name || '');
  const type = typeof file === 'string' ? '' : (file.type || '');

  const lowerName = name.toLowerCase();
  const lowerType = type.toLowerCase();

  return (
    lowerName.endsWith('.xlsx') ||
    lowerName.endsWith('.xls') ||
    lowerName.endsWith('.csv') ||
    lowerName.endsWith('.tsv') ||
    lowerName.endsWith('.ods') ||
    lowerType.includes('spreadsheet') ||
    lowerType.includes('excel') ||
    lowerType.includes('csv')
  );
}

/**
 * Safely parses an Excel or CSV file in the browser using SheetJS (xlsx).
 * Converts all worksheets into clean, tab-delimited text ready for Gemini AI analysis.
 */
export async function parseExcelFile(file: File): Promise<ParsedExcelResult> {
  let arrayBuffer: ArrayBuffer;

  if (typeof file.arrayBuffer === 'function') {
    arrayBuffer = await file.arrayBuffer();
  } else {
    arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = (e) => reject(new Error('Fehler beim Lesen der Excel-Datei: ' + e));
      reader.readAsArrayBuffer(file);
    });
  }

  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetNames = workbook.SheetNames || [];

  if (sheetNames.length === 0) {
    throw new Error('Die hochgeladene Excel-Datei enthält keine Tabellenblätter.');
  }

  let totalRows = 0;
  const sections: string[] = [];

  for (const sheetName of sheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    // Convert sheet to tab-separated values (TSV preserves columns cleanly for LLMs)
    const tsv = XLSX.utils.sheet_to_csv(sheet, { FS: '\t' });
    const lines = tsv.split('\n').filter(line => line.trim().length > 0);

    if (lines.length > 0) {
      totalRows += lines.length;
      sections.push(
        `=== TABELLENBLATT: "${sheetName}" (${lines.length} Zeilen) ===\n${tsv}`
      );
    }
  }

  if (sections.length === 0 || totalRows === 0) {
    throw new Error('Die Excel-Tabelle ist leer oder enthält keine lesbaren Daten.');
  }

  const formattedText = sections.join('\n\n');

  return {
    fileName: file.name,
    sheetNames,
    totalRows,
    formattedText,
    fileSize: file.size
  };
}
