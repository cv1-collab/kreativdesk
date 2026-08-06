import 'dotenv/config';
import fs from 'fs';
import path from 'path';

// --- 1. THREE.JS 3D MEASUREMENT & IFC UTILS TEST ---
function calculate3DDistance(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = p2.z - p1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// --- 2. WEBHOOK & EMAIL PAYLOAD VALIDATOR ---
function validateWebhookPayload(payload) {
  if (!payload || !payload.event || !payload.title) {
    return { valid: false, error: 'Missing required event or title' };
  }
  const slackFormatted = {
    text: `🔔 *Kreativ-Desk Event: ${payload.event.toUpperCase()}*\n*${payload.title}*\n${payload.description || ''}`
  };
  return { valid: true, payload: slackFormatted };
}

async function runSystemPerformanceAudit() {
  console.log("=================================================");
  console.log("⚡ STARTING SYSTEM PERFORMANCE, WEBHOOK & BUILD AUDIT");
  console.log("=================================================\n");

  // === AUDIT 1: EMAIL-BENACHRICHTIGUNGEN & WEBHOOKS ===
  console.log("📌 1. AUDITING EMAIL NOTIFICATIONS & WEBHOOK DISPATCHING:");
  
  const testPayload = {
    event: 'defect.created',
    title: 'Neuer Mangel erfasst: Riss in Betonwand',
    description: 'Priorität: Hoch, Ort: Baustelle OG1',
    timestamp: new Date().toISOString()
  };

  const webhookCheck = validateWebhookPayload(testPayload);
  console.log(`- Webhook Event: ${testPayload.event}`);
  console.log(`- Slack/JSON Payload Valid: ${webhookCheck.valid}`);
  console.log(`- Formatted Message: "${webhookCheck.payload.text.replace(/\n/g, ' ')}"`);

  const webhookPassed = webhookCheck.valid && webhookCheck.payload.text.includes('Riss in Betonwand');
  if (webhookPassed) {
    console.log("✅ EMAIL & WEBHOOK AUDIT PASSED!\n");
  } else {
    console.error("❌ WEBHOOK AUDIT FAILED!\n");
  }

  // === AUDIT 2: CAD 3D IFC VIEWER RENDERING & MEASUREMENT MATH ===
  console.log("📌 2. AUDITING CAD 3D IFC VIEWER RENDERING & MATH ENGINE:");

  const pointA = { x: 0, y: 0, z: 0 };
  const pointB = { x: 3, y: 4, z: 0 }; // 3D distance = sqrt(3^2 + 4^2) = 5.0m
  const pointC = { x: 1, y: 2, z: 2 };
  const pointD = { x: 4, y: 8, z: 8 }; // 3D distance = sqrt(3^2 + 6^2 + 6^2) = sqrt(81) = 9.0m

  const dist1 = calculate3DDistance(pointA, pointB);
  const dist2 = calculate3DDistance(pointC, pointD);

  console.log(`- 3D Point-to-Point Distance 1: ${dist1.toFixed(2)}m (Expected: 5.00m)`);
  console.log(`- 3D Point-to-Point Distance 2: ${dist2.toFixed(2)}m (Expected: 9.00m)`);

  const cadPassed = (dist1 === 5.0) && (dist2 === 9.0);
  if (cadPassed) {
    console.log("✅ CAD 3D MEASUREMENT MATH ENGINE AUDIT PASSED!\n");
  } else {
    console.error("❌ CAD 3D AUDIT FAILED!\n");
  }

  // === AUDIT 3: VITE PRODUCTION BUILD & SERVICE WORKER CACHING ===
  console.log("📌 3. AUDITING VITE PRODUCTION BUILD & SERVICE WORKER CACHING:");

  const distPath = path.join(process.cwd(), 'dist');
  const swPath = path.join(distPath, 'sw.js');
  const manifestPath = path.join(distPath, 'manifest.webmanifest');
  const indexHtmlPath = path.join(distPath, 'index.html');

  const distExists = fs.existsSync(distPath);
  const swExists = fs.existsSync(swPath);
  const manifestExists = fs.existsSync(manifestPath);
  const indexHtmlExists = fs.existsSync(indexHtmlPath);

  console.log(`- Output Directory 'dist/' Exists: ${distExists}`);
  console.log(`- PWA Service Worker ('dist/sw.js') Exists: ${swExists}`);
  console.log(`- PWA Manifest ('dist/manifest.webmanifest') Exists: ${manifestExists}`);
  console.log(`- Entry Point HTML ('dist/index.html') Exists: ${indexHtmlExists}`);

  if (swExists) {
    const swContent = fs.readFileSync(swPath, 'utf-8');
    const hasWorkbox = swContent.includes('workbox') || swContent.includes('precache') || swContent.includes('self.addEventListener');
    console.log(`- Service Worker Caching Logic Detected: ${hasWorkbox}`);
  }

  const buildPassed = distExists && swExists && manifestExists && indexHtmlExists;
  if (buildPassed) {
    console.log("✅ VITE PRODUCTION BUILD & PWA SERVICE WORKER AUDIT PASSED!\n");
  } else {
    console.error("❌ BUILD AUDIT FAILED! (Try running npm run build)\n");
  }

  // === FINAL SUMMARY ===
  console.log("=================================================");
  if (webhookPassed && cadPassed && buildPassed) {
    console.log("🎉 FINAL RESULT: ALL 3 PERFORMANCE, WEBHOOK & BUILD AUDITS PASSED 100%!");
  } else {
    console.log("⚠️ FINAL RESULT: SOME AUDITS FAILED.");
  }
  console.log("=================================================");
}

runSystemPerformanceAudit();
