async function test() {
  console.log("Fetching API...");
  try {
    const res = await fetch('https://www.kreativdesk.ch/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: "A futuristic city", imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800" })
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text.substring(0, 500));
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
