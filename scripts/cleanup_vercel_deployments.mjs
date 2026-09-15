import { execSync } from 'child_process';

async function main() {
  console.log('--- Vercel Deployment Cleanup ---');
  
  // 1. Get active deployment
  const activeInspectRaw = execSync('npx vercel inspect kreativ-desk-v2-0.vercel.app 2>&1', { encoding: 'utf-8' });
  const activeIdMatch = activeInspectRaw.match(/(dpl_[a-zA-Z0-9]+)/);
  const activeId = activeIdMatch ? activeIdMatch[1] : null;
  const activeUrlMatch = activeInspectRaw.match(/https:\/\/(kreativ-desk-v2-0-[a-z0-9]+-[^\s\n]+)/);
  const activeUrl = activeUrlMatch ? activeUrlMatch[1] : null;
  
  console.log('Active Production Deployment:', {
    id: activeId,
    url: activeUrl
  });

  if (!activeUrl && !activeId) {
    throw new Error('Could not identify active production deployment! Aborting to prevent accidental deletion.');
  }

  // 2. Fetch all deployments across pages
  let next = null;
  let allDeployments = [];
  let page = 1;

  while (true) {
    const cmd = next 
      ? `npx vercel list --format json --next ${next}` 
      : `npx vercel list --format json`;
    
    console.log(`Fetching deployments page ${page}...`);
    const output = execSync(cmd, { encoding: 'utf-8' });
    const data = JSON.parse(output);
    
    if (data.deployments && data.deployments.length > 0) {
      allDeployments.push(...data.deployments);
    }
    
    if (data.pagination && data.pagination.next) {
      next = data.pagination.next;
      page++;
    } else {
      break;
    }
  }

  console.log(`Found ${allDeployments.length} total deployments.`);

  // Filter READY deployments
  const readyDeployments = allDeployments.filter(d => d.state === 'READY');
  const keepUrls = new Set();
  
  if (activeUrl) keepUrls.add(activeUrl);
  // Keep the 2 most recent ready deployments as safe fallback
  readyDeployments.slice(0, 2).forEach(d => keepUrls.add(d.url));

  console.log('\nRetaining active and recent backup deployments:');
  keepUrls.forEach(url => console.log('  [KEEP] ' + url));

  const toDelete = allDeployments.filter(d => {
    if (keepUrls.has(d.url)) return false;
    if (activeId && (d.uid === activeId || d.id === activeId)) return false;
    return true;
  });

  console.log(`\nDeleting ${toDelete.length} old deployments...`);

  // Batch delete in chunks of 10
  const BATCH_SIZE = 10;
  let deletedCount = 0;

  for (let i = 0; i < toDelete.length; i += BATCH_SIZE) {
    const batch = toDelete.slice(i, i + BATCH_SIZE);
    const urls = batch.map(d => d.url).join(' ');
    console.log(`\n[Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(toDelete.length / BATCH_SIZE)}] Deleting ${batch.length} deployments...`);
    try {
      const rmOutput = execSync(`npx vercel rm ${urls} -y --safe 2>&1`, { encoding: 'utf-8' });
      console.log(rmOutput.trim());
      deletedCount += batch.length;
    } catch (err) {
      console.error(`Error deleting batch: ${err.message}`);
      // Fallback: delete one by one
      for (const item of batch) {
        try {
          execSync(`npx vercel rm ${item.url} -y --safe 2>&1`, { encoding: 'utf-8' });
          console.log(`  Deleted ${item.url}`);
          deletedCount++;
        } catch (singleErr) {
          console.error(`  Failed to delete ${item.url}:`, singleErr.message);
        }
      }
    }
  }

  console.log(`\n=== Vercel Cleanup Complete ===`);
  console.log(`Successfully removed ${deletedCount} old deployments.`);
  console.log(`Active site https://kreativdesk.ch is fully running on ${activeUrl}.`);
}

main().catch(err => {
  console.error('Fatal error during cleanup:', err);
  process.exit(1);
});
