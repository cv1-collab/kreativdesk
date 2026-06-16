async function callGeminiAPI(model, contents, config) {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, contents, config })
  });
  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || "API Request failed");
  }
  return await response.json();
}
async function callGeminiEmbedAPI(model, contents) {
  const response = await fetch("/api/embed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, contents })
  });
  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || "API Request failed");
  }
  return await response.json();
}

export { callGeminiEmbedAPI as a, callGeminiAPI as c };
