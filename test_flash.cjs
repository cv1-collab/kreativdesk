const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: "AIzaSyBpPeVQvv2KXi7sIALaz_sNdWFMIgCEy4M" });
async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: 'Hello'
    });
    console.log("Success! Response:", response.text);
  } catch (error) {
    console.error("Error:", error);
  }
}
run();
