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

  // 3. Scan codebase for supabase.from('...').select/eq/insert for missing columns & missing tables
  console.log("\n--- SUPABASE CODEBASE QUERY AUDIT ---");
  const columnIssues = [];
  const missingTableIssues = [];
  
  function scanQueries(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const fullPath = path.join(dir, f);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanQueries(fullPath);
      } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Match .from('table')
        const fromMatches = content.matchAll(/supabase\s*\.\s*from\(\s*['"](\w+)['"]\s*\)([\s\S]*?)(?=\.from|\n\n|;\n|$)/g);
        for (const m of fromMatches) {
          const tableName = m[1];
          const queryChain = m[2];
          
          if (schemas[tableName] === null) {
            missingTableIssues.push({ file: fullPath, table: tableName });
          } else if (schemas[tableName] && schemas[tableName].length > 0) {
            const realCols = schemas[tableName];
            
            // Check .eq('col', ...)
            const eqMatches = queryChain.matchAll(/\.eq\(\s*['"](\w+)['"]/g);
            for (const eq of eqMatches) {
              const col = eq[1];
              if (!realCols.includes(col)) {
                columnIssues.push({ file: fullPath, type: '.eq()', table: tableName, invalidCol: col });
              }
            }
            
            // Check .order('col')
            const orderMatches = queryChain.matchAll(/\.order\(\s*['"](\w+)['"]/g);
            for (const ord of orderMatches) {
              const col = ord[1];
              if (!realCols.includes(col)) {
                columnIssues.push({ file: fullPath, type: '.order()', table: tableName, invalidCol: col });
              }
            }
          }
        }
      }
    }
  }

  scanQueries(srcDir);
  if (missingTableIssues.length === 0) {
    console.log("✅ All Supabase table queries target existing database tables!");
  } else {
    console.log("⚠️ Missing Table references found in code:", missingTableIssues);
  }

  // 5. Test video_calls upsert and calendar_events insert with valid schemas
  console.log("\n--- TESTING VALID SCHEMA INSERTS ---");
  const vcPayload = {
    id: `call_${Date.now()}`,
    host_id: 'u1',
    room_name: 'p1',
    status: 'active',
    created_at: new Date().toISOString()
  };
  const { data: vcData, error: vcErr } = await supabaseAdmin.from('video_calls').upsert(vcPayload).select().single();
  if (vcErr) {
    console.log('❌ video_calls Upsert Error:', vcErr.code, vcErr.message);
  } else {
    console.log('✅ video_calls Upsert Success! ID:', vcData.id);
    await supabaseAdmin.from('video_calls').delete().eq('id', vcData.id);
  }

  const calPayload = {
    title: 'Test Call Schedule',
    description: 'Typ: call\nLink: /meet?join=123',
    start_date: '2026-08-20',
    end_date: '2026-08-20',
    company_id: 'c1',
    project_id: 'p1',
    created_at: new Date().toISOString()
  };
  const { data: calData, error: calErr } = await supabaseAdmin.from('calendar_events').insert(calPayload).select().single();
  if (calErr) {
    console.log('❌ calendar_events Insert Error:', calErr.code, calErr.message);
  } else {
    console.log('✅ calendar_events Insert Success! ID:', calData.id);
    await supabaseAdmin.from('calendar_events').delete().eq('id', calData.id);
  }
}

runDeepAudit();
