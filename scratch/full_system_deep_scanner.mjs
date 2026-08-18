import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: './.env' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://jtgfrogbrkrllzdwzdrt.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

function getFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs'], files = []) {
  if (!fs.existsSync(dir)) return files;
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        getFiles(name, extensions, files);
      }
    } else if (extensions.some(ext => name.endsWith(ext))) {
      files.push(name);
    }
  }
  return files;
}

async function deepSystemScanner() {
  console.log('====================================================');
  console.log('=== FULL SYSTEM DEEP SCANNER (GROUPED REPORT) ===');
  console.log('====================================================\n');

  const openApiRes = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`
    }
  });

  const realSchemas = {};
  if (openApiRes.ok) {
    const spec = await openApiRes.json();
    if (spec.definitions) {
      for (const [defName, defObj] of Object.entries(spec.definitions)) {
        if (defObj.properties) {
          realSchemas[defName] = Object.keys(defObj.properties);
        }
      }
    }
  }

  const allFiles = [
    ...getFiles('./src'),
    ...getFiles('./api'),
    ...getFiles('./scripts')
  ];

  const fileIssuesMap = {};

  for (const filePath of allFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Find queries: .from('tbl')
    const regex = /\.from\(['"]([^'"]+)['"]\)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const tableName = match[1];
      const matchPos = match.index;
      const snippet = content.slice(matchPos, matchPos + 350);

      const validCols = realSchemas[tableName];
      if (!validCols) continue; // Skip unlisted system tables

      // Check for .update({ ... }), .insert({ ... }), .upsert({ ... })
      const actionMatches = [...snippet.matchAll(/\.(update|insert|upsert)\(\{([^}]+)\}\)/g)];
      for (const act of actionMatches) {
        const actionType = act[1];
        const payloadStr = act[2];
        const keyMatches = [...payloadStr.matchAll(/([a-zA-Z0-9_]+)\s*:/g)];
        for (const k of keyMatches) {
          const colName = k[1];
          if (['true', 'false', 'null', 'undefined', 'created_at', 'updated_at'].includes(colName)) continue;
          if (!validCols.includes(colName)) {
            if (!fileIssuesMap[filePath]) fileIssuesMap[filePath] = [];
            fileIssuesMap[filePath].push({
              type: 'INVALID_MUTATION_COLUMN',
              table: tableName,
              column: colName,
              action: actionType,
              snippet: snippet.replace(/\s+/g, ' ').slice(0, 120)
            });
          }
        }
      }

      // Check for .eq('col', ...), .in('col', ...), etc.
      const filterMatches = [...snippet.matchAll(/\.(eq|neq|in|like|ilike|gt|gte|lt|lte)\(['"]([a-zA-Z0-9_]+)['"]/g)];
      for (const filter of filterMatches) {
        const colName = filter[2];
        if (!validCols.includes(colName)) {
          if (!fileIssuesMap[filePath]) fileIssuesMap[filePath] = [];
          fileIssuesMap[filePath].push({
            type: 'INVALID_FILTER_COLUMN',
            table: tableName,
            column: colName,
            action: filter[1],
            snippet: snippet.replace(/\s+/g, ' ').slice(0, 120)
          });
        }
      }
    }
  }

  const fileKeys = Object.keys(fileIssuesMap);
  console.log(`TOTAL FILES WITH SCHEMA ISSUES: ${fileKeys.length}\n`);

  for (const file of fileKeys) {
    console.log(`📂 FILE: ${file}`);
    const issues = fileIssuesMap[file];
    // Deduplicate issues by table+column
    const unique = [];
    const seen = new Set();
    for (const iss of issues) {
      const key = `${iss.table}:${iss.column}:${iss.type}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(iss);
      }
    }

    unique.forEach((iss, idx) => {
      console.log(`   ${idx + 1}. [${iss.type}] Table: '${iss.table}' | Column '${iss.column}' (Action: ${iss.action})`);
      console.log(`      Snippet: ${iss.snippet}`);
    });
    console.log('');
  }
}

deepSystemScanner().catch(console.error);
