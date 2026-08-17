import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://jtgfrogbrkrllzdwzdrt.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Z2Zyb2dicmtybGx6ZHd6ZHJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0ODMzOTcsImV4cCI6MjEwMTA1OTM5N30.WHFlicuJoJ2xSevb2-HvWgPml8Rwz28fTOFppQkvlYE';
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function verifyAuth(req: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch (error) {
    console.error('Auth verification failed:', error);
    return null;
  }
}

export default async function handler(req: any, res: any) {
  const targetUrl = req.headers['x-fal-target-url'];
  
  if (!targetUrl || typeof targetUrl !== 'string') {
    return res.status(400).json({ error: 'Missing x-fal-target-url header' });
  }

  // Mitigate SSRF: Only allow connections to official fal.ai domains
  if (!targetUrl.startsWith('https://queue.fal.run/') && 
      !targetUrl.startsWith('https://fal.run/') && 
      !targetUrl.startsWith('https://rest.alpha.fal.run/')) {
    return res.status(403).json({ error: 'Forbidden target URL' });
  }

  try {
    const user = await verifyAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const headers: any = {
      'Authorization': `Key ${process.env.FAL_KEY || ''}`,
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
