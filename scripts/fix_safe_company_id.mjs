import fs from 'fs';
import path from 'path';

const srcDir = '/Users/carlo/Desktop/Kreativ Desk V2_0_Supabase/src';

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('`comp_${currentUser')) {
        console.log(`Replacing in: ${entry.name}`);
        content = content.replaceAll('`comp_${currentUser.uid}`', 'currentUser.uid');
        content = content.replaceAll('`comp_${currentUser?.uid}`', 'currentUser?.uid');
        content = content.replaceAll('`comp_${currentUser?.uid}`', 'currentUser?.uid');
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

processDir(srcDir);
console.log("Replacement of comp_ prefix complete!");
