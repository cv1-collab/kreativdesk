import fs from 'fs';
import path from 'path';

const srcDir = './src/components';
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.tsx'));

console.log(`Auditing ${files.length} component files for i18n coverage...`);

const germanWordPattern = /[äöüÄÖÜß]|(Willkommen|Übersicht|Erstellen|Speichern|Abbrechen|Löschen|Bearbeiten|Projekt|Folie|Einstellungen|Datei|Kategorie|Benutzer|Mängel|Termin|Dokument)/g;

let totalHardcodedCount = 0;

for (const file of files) {
  const filePath = path.join(srcDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const lines = content.split('\n');
  let fileMatches = 0;

  lines.forEach((line, idx) => {
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*') || line.includes('import ') || line.includes('console.')) return;
    
    if (germanWordPattern.test(line) && !line.includes('t(') && !line.includes('localTranslations') && !line.includes('Record<')) {
      if (line.includes('<') || line.includes('placeholder=') || line.includes('title=') || line.includes('label=')) {
        fileMatches++;
      }
    }
  });

  if (fileMatches > 0) {
    console.log(`- ${file}: ~${fileMatches} potential hardcoded text lines found`);
    totalHardcodedCount += fileMatches;
  }
}

console.log(`\nAudit finished! Total potential hardcoded lines found: ${totalHardcodedCount}`);
