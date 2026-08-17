import fs from 'fs';
import path from 'path';

function findSystemConfigDataUsages(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fullPath = path.join(dir, f);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findSystemConfigDataUsages(fullPath);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('system_config')) {
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (line.includes('system_config') || line.includes("select('data')") || line.includes("select('data,") || line.includes("data:")) {
            if (line.includes('system_config') || line.includes('data')) {
              console.log(`${fullPath}:${idx + 1}: ${line.trim()}`);
            }
          }
        });
      }
    }
  }
}

findSystemConfigDataUsages('./src');
