import { verifyAuth } from '../_auth';

export default async function handler(req: any, res: any) {
  const targetUrl = req.headers['x-fal-target-url'];
  
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing x-fal-target-url header' });
  }

  try {
    const user = await verifyAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const headers: any = {
      'Authorization': `Key ${process.env.FAL_KEY}`,
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
