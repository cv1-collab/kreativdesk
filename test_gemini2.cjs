const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: "AIzaSyBpPeVQvv2KXi7sIALaz_sNdWFMIgCEy4M", apiVersion: "v1alpha" });
async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: 'Hello'
    });
    console.log("Success! Response:", response.text);
  } catch (error) {
    console.error("Error:", error.message);
  }
}
run();
