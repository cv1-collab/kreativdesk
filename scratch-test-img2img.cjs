async function test() {
  const prompt = encodeURIComponent("A futuristic city");
  const imgUrl = encodeURIComponent("https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800");
  const url = `https://image.pollinations.ai/prompt/${prompt}?width=800&height=800&image=${imgUrl}&nologo=true`;
  console.log("Fetching", url);
  try {
    const res = await fetch(url);
    console.log("Status:", res.status);
    console.log("Content-Type:", res.headers.get("content-type"));
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
