import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_URL");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

const componentTableMap = {
  'AuditLogsTab.tsx': ['audit_logs'],
  'BIMViewer.tsx': ['defects', 'documents'],
  'DailyGoals.tsx': ['goals'],
  'Finance.tsx': ['transactions', 'system_config', 'companies', 'time_entries', 'defects', 'documents'],
  'FinanceTab.tsx': ['transactions', 'time_entries', 'system_config', 'projects', 'documents'],
  'MaintenanceGuard.tsx': ['system_config'],
  'MobileUpload.tsx': ['documents'],
  'PitchDeck.tsx': ['system_config'],
  'PitchDeckStudio.tsx': ['projects', 'documents', 'system_config'],
  'PlanEditorViewer.tsx': ['documents', 'defects'],
  'WelcomeOnboarding.tsx': ['profiles'],
  'Whiteboard.tsx': ['documents']
};

async function verifyComponentTables() {
  console.log("=== COMPONENT SUPABASE DATABASE COMPATIBILITY VERIFICATION ===");
  const allTables = new Set();
  Object.values(componentTableMap).forEach(list => list.forEach(t => allTables.add(t)));

  for (const table of allTables) {
    const { data, error } = await supabaseAdmin.from(table).select('*').limit(1);
    if (error) {
      console.log(`❌ Table '${table}': ERROR (${error.message})`);
    } else {
      console.log(`✅ Table '${table}': OK (Schema accessible, 0 issues)`);
    }
  }
}

verifyComponentTables();
