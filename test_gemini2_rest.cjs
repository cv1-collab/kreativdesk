async function run() {
  try {
    const url = "https://generativelanguage.googleapis.com/v1alpha/models/gemini-2.0-flash-exp:generateContent?key=AIzaSyBpPeVQvv2KXi7sIALaz_sNdWFMIgCEy4M";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Draw a simple cube. Output an image." }] }]
      })
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }
}
run();
