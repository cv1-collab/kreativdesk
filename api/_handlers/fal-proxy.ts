import { verifyAuth, supabaseAdmin } from '../_auth.js';

export default async function handler(req: any, res: any) {
  const targetUrl = req.headers['x-fal-target-url'];
  
  if (!targetUrl || typeof targetUrl !== 'string') {
    return res.status(400).json({ error: 'Missing x-fal-target-url header' });
  }

  try {
    const parsedUrl = new URL(targetUrl);
    const host = parsedUrl.hostname.toLowerCase();
    if (!host.endsWith('fal.run') && !host.endsWith('fal.ai') && !host.endsWith('fal.media')) {
      return res.status(403).json({ error: 'Forbidden target URL' });
    }
  } catch (urlErr) {
    return res.status(400).json({ error: 'Invalid target URL format' });
  }

  try {
    const user = await verifyAuth(req);
    const origin = req.headers.origin || req.headers.referer || '';
    const isSameOrigin = origin.includes('kreativdesk.ch') || origin.includes('localhost') || origin.includes('vercel.app');
    
    if (!user && !isSameOrigin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const falKey = process.env.FAL_KEY || '74ab3a75-7a36-4c81-b6b1-e7efde8627e0:396cf0c00fcf01484883bc3e6850a073';
    const headers: any = {
      'Authorization': `Key ${falKey}`,
      'Content-Type': 'application/json'
    };

    // Forward any x-fal- headers from client
    Object.keys(req.headers).forEach((key) => {
      if (key.toLowerCase().startsWith('x-fal-')) {
        headers[key.toLowerCase()] = req.headers[key];
      }
    });

    const options: any = {
      method: req.method,
      headers
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = JSON.stringify(req.body);
    }

    const falResponse = await fetch(targetUrl, options);

    // Forward response headers back to client
    const excludedHeaders = ['content-length', 'content-encoding'];
    falResponse.headers.forEach((value, key) => {
      if (!excludedHeaders.includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    if (!falResponse.ok) {
      const errorText = await falResponse.text();
      return res.status(falResponse.status).json({ error: errorText });
    }

    const data = await falResponse.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error("FAL Proxy Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
