const fetch = require('node-fetch');
async function run() {
  const prompt = "abstract minimalist 3D blocks, massing model, architecture study, no windows, no doors, purely structural";
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=1234&model=flux`;
  console.log("Fetching:", url);
  const res = await fetch(url);
  console.log("Status:", res.status);
  if (!res.ok) {
    const text = await res.text();
    console.log("Error text:", text);
  }
}
run();
