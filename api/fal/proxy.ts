export default async function handler(req: any, res: any) {
  const targetUrl = req.headers['x-fal-target-url'];
  
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing x-fal-target-url header' });
  }

  try {
    const options: any = {
      method: req.method,
      headers: {
        'Authorization': `Key ${process.env.FAL_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = JSON.stringify(req.body);
    }

    const falResponse = await fetch(targetUrl, options);

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
