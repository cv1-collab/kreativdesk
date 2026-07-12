import fs from 'fs';
import path from 'path';

// Just a quick test script to see what files need fixing.
const dir = '/Users/carlo/Desktop/BackUp App 300626/Kreativ Desk V2_0/src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

let count = 0;
files.forEach(file => {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  if (content.includes("collection(db, '") && (content.match(/query\(collection\(db/g) || []).length > 0) {
    if (!content.includes('visibility')) {
      console.log('Needs check:', file);
      count++;
    }
  }
});
console.log('Total files to check:', count);
