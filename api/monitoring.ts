export const config = {
  api: {
    bodyParser: false,
  },
};

async function readBody(readable: any): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawEnvelope = await readBody(req);
    const envelopeText = rawEnvelope.toString('utf8');
    const firstLine = envelopeText.split('\n')[0];

    if (!firstLine) {
      return res.status(400).json({ error: 'Empty envelope' });
    }

    const header = JSON.parse(firstLine);
    if (!header.dsn) {
      return res.status(400).json({ error: 'Missing DSN' });
    }

    const dsn = new URL(header.dsn);
    const projectId = dsn.pathname.replace(/^\//, '');

    // Sicherheitsprüfung: Nur Anfragen an unser eigenes Sentry-Projekt weiterleiten
    const allowedHost = 'o4511721911287808.ingest.de.sentry.io';
    const allowedProjectId = '4511721931276368';

    if (dsn.hostname !== allowedHost || projectId !== allowedProjectId) {
      return res.status(403).json({ error: 'Invalid Sentry target' });
    }

    const upstreamUrl = `https://${allowedHost}/api/${allowedProjectId}/envelope/`;

    const upstreamResponse = await fetch(upstreamUrl, {
      method: 'POST',
      body: rawEnvelope,
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
      },
    });

    res.status(upstreamResponse.status).end();
  } catch (error: any) {
    console.error('Sentry tunnel error:', error);
    res.status(500).json({ error: 'Internal tunnel error' });
  }
}
