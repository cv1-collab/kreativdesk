import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

const knownSchemas = {
  companies: [
    'id', 'name', 'plan', 'max_seats', 'used_seats', 'owner_id', 'created_at', 'screensaver_active', 'screensaver_image', 'screensaver_timeout'
  ],
  profiles: [
    'id', 'email', 'name', 'role', 'company_id', 'has_active_subscription', 'stripe_customer_id', 'plan', 'trial_ends_at', 'can_view_finance', 'can_approve_budget', 'has_seen_tour', 'has_completed_onboarding', 'created_at', 'updated_at'
  ],
  projects: [
    'id', 'company_id', 'owner_id', 'name', 'description', 'status', 'budget', 'created_at', 'updated_at', 'site_location', 'siteLocation', 'cam1_url', 'cam2_url', 'drone_url', 'logistics_url', 'access_url'
  ],
  documents: [
    'id', 'name', 'url', 'file_url', 'project_id', 'folder_id', 'category', 'owner_id', 'uploaded_by', 'company_id', 'type', 'size', 'is_folder', 'created_at', 'uploaded_at', 'date'
  ]
};

async function auditCode() {
  const srcDir = './src';
  const issues = [];

  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const fullPath = path.join(dir, f);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Match supabase.from('tableName').update({...}) or insert({...})
        const fromMatches = content.matchAll(/supabase\s*\.\s*from\(\s*['"](\w+)['"]\s*\)\s*\.\s*(update|insert)\(\s*\{([^}]+)\}/g);
        for (const match of fromMatches) {
          const tableName = match[1];
          const action = match[2];
          const payload = match[3];

          const realCols = knownSchemas[tableName];
          if (realCols) {
            // Extract keys in payload
            const lines = payload.split('\n');
            for (const line of lines) {
              const km = line.match(/^\s*([a-zA-Z0-9_]+)\s*:/);
              if (km) {
                const key = km[1];
                if (!realCols.includes(key) && !['updated_at', 'created_at'].includes(key)) {
                  issues.push({
                    file: fullPath,
                    table: tableName,
                    action,
                    invalidKey: key,
                    line: line.trim()
                  });
                }
              }
            }
          }
        }
      }
    }
  }

  scanDir(srcDir);
  console.log("\n--- AUDIT POTENTIAL SCHEMA MISMATCHES ---");
  console.log(JSON.stringify(issues, null, 2));
}

auditCode();
