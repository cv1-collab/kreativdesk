import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function runDeepAudit() {
  console.log("=== STARTING DEEP SYSTEM AUDIT ===");

  // 1. Fetch all real table schemas from Supabase
  const tables = [
    'companies', 'profiles', 'projects', 'documents', 'defects', 
    'company_users', 'system_config', 'api_keys', 'invites', 
    'audit_logs', 'project_members', 'crm_contacts', 'crm_deals', 
    'calendar_events', 'invoices', 'time_entries', 'whiteboards'
  ];

  const schemas = {};

  for (const t of tables) {
    const { data, error } = await supabaseAdmin.from(t).select('*').limit(1);
    if (error) {
      console.log(`[Table Check] ${t}: NOT FOUND or Error ->`, error.message);
      schemas[t] = null;
    } else {
      schemas[t] = data && data[0] ? Object.keys(data[0]) : [];
      console.log(`[Table Check] ${t}: OK (columns: ${schemas[t].join(', ') || 'empty table'})`);
    }
  }

  // 2. Scan codebase for hardcoded `file:///` URLs
  const fileUrlIssues = [];
  const srcDir = './src';

  function scanForFileUrls(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const fullPath = path.join(dir, f);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanForFileUrls(fullPath);
      } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (line.includes('file:///') && !line.includes('// ignore') && !line.includes('scratch/')) {
            fileUrlIssues.push({ file: fullPath, lineNum: idx + 1, content: line.trim() });
          }
        });
      }
    }
  }

  scanForFileUrls(srcDir);
  console.log("\n--- HARDCODED file:/// URL CHECK ---");
  if (fileUrlIssues.length === 0) {
    console.log("✅ No hardcoded file:/// URLs found in production source files!");
  } else {
    console.log("⚠️ Found file:/// references:", fileUrlIssues);
  }

  // 3. Scan codebase for supabase.from('...').select('...') for missing columns
  console.log("\n--- SUPABASE SELECT COLUMN CHECK ---");
  const selectIssues = [];
  
  function scanSelects(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const fullPath = path.join(dir, f);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanSelects(fullPath);
      } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const matches = content.matchAll(/supabase\s*\.\s*from\(\s*['"](\w+)['"]\s*\)\s*\.\s*select\(\s*['"]([^'"]+)['"]\s*\)/g);
        for (const m of matches) {
          const tableName = m[1];
          const colString = m[2];
          const realCols = schemas[tableName];
          if (realCols && realCols.length > 0) {
            // parse simple columns
            const cols = colString.split(',').map(c => c.trim().split(' ')[0].split('(')[0]);
            for (const col of cols) {
              if (col !== '*' && !col.includes('!') && !col.includes(':') && !col.includes('count') && !realCols.includes(col)) {
                selectIssues.push({ file: fullPath, table: tableName, invalidCol: col });
              }
            }
          }
        }
      }
    }
  }

  scanSelects(srcDir);
  if (selectIssues.length === 0) {
    console.log("✅ All Supabase select queries target valid existing columns!");
  } else {
    console.log("⚠️ Select column issues:", selectIssues);
  }
}

runDeepAudit();
