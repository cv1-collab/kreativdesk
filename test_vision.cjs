const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [
            "Describe this image exactly.",
            {
                inlineData: {
                    data: fs.readFileSync("test_img2img.jpg").toString("base64"),
                    mimeType: "image/jpeg"
                }
            }
        ]
    });
    console.log("img2img:", response.text);
    
    const response2 = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [
            "Describe this image exactly.",
            {
                inlineData: {
                    data: fs.readFileSync("test_post_image.jpg").toString("base64"),
                    mimeType: "image/jpeg"
                }
            }
        ]
    });
    console.log("post_img:", response2.text);
  } catch (e) {
    console.error(e);
  }
}
run();
