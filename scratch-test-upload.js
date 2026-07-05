const fs = require('fs');

async function test() {
  const fetch = (await import('node-fetch')).default;
  const { FormData, Blob } = await import('node-fetch'); // wait, node 18 has native fetch and FormData
  
  // Create a dummy transparent 1x1 png base64
  const base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  const buffer = Buffer.from(base64, 'base64');
  
  const form = new globalThis.FormData();
  form.append('file', new globalThis.Blob([buffer], { type: 'image/png' }), 'test.png');
  
  console.log("Uploading...");
  const res = await globalThis.fetch('https://gen.pollinations.ai/upload', {
    method: 'POST',
    body: form
  });
  
  const text = await res.text();
  console.log("Result:", text);
}
test();
