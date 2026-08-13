import fs from 'fs';
import path from 'path';

const targetFiles = [
  'src/components/AuditLogsTab.tsx',
  'src/components/BIMViewer.tsx',
  'src/components/DailyGoals.tsx',
  'src/components/DemoApp.tsx',
  'src/components/DemoLayout.tsx',
  'src/components/Finance.tsx',
  'src/components/FinanceTab.tsx',
  'src/components/GlobalVideoPlayer.tsx',
  'src/components/MaintenanceGuard.tsx',
  'src/components/MobileUpload.tsx',
  'src/components/PitchDeck.tsx',
  'src/components/PitchDeckStudio.tsx',
  'src/components/PlanEditorViewer.tsx',
  'src/components/Project3DViewer.tsx',
  'src/components/TrialGuard.tsx',
  'src/components/WelcomeOnboarding.tsx',
  'src/components/Whiteboard.tsx'
];

const basePath = '/Users/carlo/Desktop/Kreativ Desk V2_0_Supabase';

console.log("=== COMPONENT AUDIT FOR SUPABASE INTEGRATION ===");

targetFiles.forEach(relPath => {
  const fullPath = path.join(basePath, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ File not found: ${relPath}`);
    return;
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  const hasSupabaseImport = content.includes("import { supabase }") || content.includes("import supabase");
  
  // Find all .from('...') calls
  const matches = [...content.matchAll(/\.from\(['"]([^'"]+)['"]\)/g)];
  const tables = matches.map(m => m[1]);

  console.log(`\n📄 ${relPath}`);
  console.log(`  - Supabase Import: ${hasSupabaseImport ? '✅ YES' : 'ℹ️ NO (UI/Standalone)'}`);
  if (tables.length > 0) {
    console.log(`  - Queried Supabase Tables: ${Array.from(new Set(tables)).join(', ')}`);
  } else {
    console.log(`  - Queried Supabase Tables: (None - Component is UI/State wrapper)`);
  }
});
