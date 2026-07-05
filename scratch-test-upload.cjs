async function test() {
  const base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  const buffer = Buffer.from(base64, 'base64');
  
  const form = new FormData();
  form.append('file', new Blob([buffer], { type: 'image/png' }), 'test.png');
  
  console.log("Uploading...");
  try {
    const res = await fetch('https://gen.pollinations.ai/upload', {
      method: 'POST',
      body: form
    });
    const text = await res.text();
    console.log("Result:", text);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
