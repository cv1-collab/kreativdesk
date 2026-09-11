// Sentry Tunnel Handler: Proxies Sentry envelopes from the same domain to prevent tracking blockers / adblockers from blocking error & telemetry reports.
import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALLOWED_HOSTS = [
  'o4511721911287808.ingest.de.sentry.io',
  'o4511721911287808.ingest.sentry.io',
];
const ALLOWED_PROJECT_IDS = ['4511721931276368'];

async function getRawBody(req: any): Promise<Buffer> {
  if (Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (typeof req.body === 'string') {
    return Buffer.from(req.body, 'utf8');
  }
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    return Buffer.from(JSON.stringify(req.body), 'utf8');
  }
  const chunks: any[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function sentryTunnelHandler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-sentry-envelope');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const rawBody = await getRawBody(req);
    if (!rawBody || rawBody.length === 0) {
      return res.status(400).json({ error: 'Empty envelope body' });
    }

    const envelopeString = rawBody.toString('utf8');
    const firstNewlineIndex = envelopeString.indexOf('\n');
    const headerLine = firstNewlineIndex !== -1 ? envelopeString.slice(0, firstNewlineIndex) : envelopeString;
    
    let header: any;
    try {
      header = JSON.parse(headerLine);
    } catch {
      return res.status(400).json({ error: 'Invalid envelope header JSON' });
    }

    const dsn = header?.dsn;
    if (!dsn || typeof dsn !== 'string') {
      return res.status(400).json({ error: 'No DSN found in envelope header' });
    }

    const dsnUrl = new URL(dsn);
    const hostname = dsnUrl.hostname;
    const projectId = dsnUrl.pathname.replace(/^\/+/, '');

    if (!ALLOWED_HOSTS.includes(hostname) || !ALLOWED_PROJECT_IDS.includes(projectId)) {
      console.warn(`[Sentry Tunnel] Blocked untrusted target: host=${hostname}, project=${projectId}`);
      return res.status(403).json({ error: 'Forbidden: Untrusted DSN destination' });
    }

    const targetUrl = `https://${hostname}/api/${projectId}/envelope/`;

    const upstreamResponse = await fetch(targetUrl, {
      method: 'POST',
      body: rawBody,
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
      },
    });

    const responseText = await upstreamResponse.text();
    res.setHeader('Content-Type', upstreamResponse.headers.get('content-type') || 'application/json');
    return res.status(upstreamResponse.status).send(responseText);
  } catch (err: any) {
    console.error('[Sentry Tunnel] Error proxying envelope:', err);
    return res.status(500).json({ error: 'Failed to tunnel Sentry envelope', message: err?.message });
  }
}
