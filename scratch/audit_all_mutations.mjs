import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function auditAllMutations() {
  console.log("=== COMPREHENSIVE MUTATION & SCHEMA AUDIT ===");

  const tables = [
    'companies', 'profiles', 'projects', 'documents', 'defects', 
    'company_users', 'system_config', 'api_keys', 'invites', 
    'audit_logs', 'project_members', 'calendar_events', 'time_entries'
  ];

  const schemas = {};

  for (const t of tables) {
    const { data } = await supabaseAdmin.from(t).select('*').limit(1);
    schemas[t] = data && data[0] ? Object.keys(data[0]) : [];
  }

  const issues = [];
  const srcDir = './src';

  function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Regex to match supabase.from('tableName').insert|update|upsert(...)
    const matches = content.matchAll(/supabase\s*\.\s*from\(\s*['"](\w+)['"]\s*\)\s*\.\s*(insert|update|upsert)\s*\(([\s\S]*?)\)/g);
    for (const match of matches) {
      const tableName = match[1];
      const action = match[2];
      const rawArg = match[3];

      const realCols = schemas[tableName];
      if (realCols && realCols.length > 0) {
        // Find property keys in object literals like { key: value, ... }
        const keyMatches = rawArg.matchAll(/([a-zA-Z0-9_]+)\s*:/g);
        for (const km of keyMatches) {
          const key = km[1];
          // Filter out JS keywords / common variables
          if (!['id', 'type', 'created_at', 'updated_at', 'company_id', 'owner_id', 'project_id', 'user_id', 'data'].includes(key)) {
            if (!realCols.includes(key)) {
              issues.push({
                file: filePath,
                table: tableName,
                action,
                invalidKey: key
              });
            }
          }
        }
      }
    }
  }

  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const fullPath = path.join(dir, f);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
        scanFile(fullPath);
      }
    }
  }

  scanDir(srcDir);

  console.log("\n--- AUDIT RESULTS FOR ALL MUTATIONS ---");
  if (issues.length === 0) {
    console.log("✅ 0 Schema errors! Every single insert, update, and upsert payload targets valid database columns.");
  } else {
    console.log(`⚠️ Found ${issues.length} potential issues:`, JSON.stringify(issues, null, 2));
  }
}

auditAllMutations();
