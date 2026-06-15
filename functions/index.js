const { onCall, HttpsError } = require("firebase-functions/v2/https");
const functions = require("firebase-functions"); // 🔥 NEU: Für die Datenbank-Trigger
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

admin.initializeApp();

// HIER DEINEN API KEY EINTRAGEN
const GEMINI_API_KEY = 'AIzaSyBpPeVQvv2KXi7sIALaz_sNdWFMIgCEy4M'; 

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ============================================================================
// 1. VISIENKARTEN SCANNER (Bestehend)
// ============================================================================
exports.analyzeVcard = onCall({ 
    region: 'europe-west1',
    maxInstances: 10,
    invoker: 'public' 
}, async (request) => {
    const data = request.data;
    const base64Image = data.base64Image;
    const mimeType = data.mimeType || 'image/jpeg';

    if (!base64Image) throw new HttpsError('invalid-argument', 'Fehler: Kein Bild empfangen.');

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const prompt = "Analysiere diese Visitenkarte. Gib exakt ein JSON-Objekt zurück, ohne Formatierungszeichen drumherum. " +
                       "Struktur: {\"firstName\": \"...\", \"lastName\": \"...\", \"company\": \"...\", \"phone\": \"...\", \"email\": \"...\", \"street\": \"...\", \"zipCity\": \"...\"}";

        const imageParts = [{ inlineData: { data: base64Image, mimeType: mimeType } }];
        const result = await model.generateContent([prompt, ...imageParts]);
        let cleanedJson = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanedJson);
    } catch (error) {
        console.error("Backend Error Log - VCard:", error.message);
        throw new HttpsError('internal', 'KI-Verbindungsfehler: ' + error.message);
    }
});

// ============================================================================
// 2. BELEG & RECHNUNGS SCANNER (Bestehend)
// ============================================================================
exports.analyzeReceipt = onCall({ 
    region: 'europe-west1',
    maxInstances: 10,
    invoker: 'public' 
}, async (request) => {
    const data = request.data;
    const base64Image = data.base64Image;
    const mimeType = data.mimeType || 'image/jpeg';

    if (!base64Image) throw new HttpsError('invalid-argument', 'Fehler: Kein Beleg empfangen.');

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        
        const prompt = "Analysiere diesen Kassenbeleg oder diese Rechnung. Gib exakt ein JSON-Objekt zurück, ohne Formatierungszeichen drumherum. " +
                       "Struktur: {\"vendor\": \"Name des Händlers/Firma\", \"date\": \"YYYY-MM-DD\", \"total\": 0.00, \"vat\": 0.00, \"category\": \"z.B. Verpflegung, Material, Transport\"}. " +
                       "Achte darauf, dass total und vat als Zahlen (Numbers) ohne Währungssymbol zurückgegeben werden.";

        const imageParts = [{ inlineData: { data: base64Image, mimeType: mimeType } }];
        const result = await model.generateContent([prompt, ...imageParts]);
        let cleanedJson = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanedJson);
    } catch (error) {
        console.error("Backend Error Log - Receipt:", error.message);
        throw new HttpsError('internal', 'KI-Verbindungsfehler: ' + error.message);
    }
});

// ============================================================================
// 3. NEU: CUSTOM CLAIMS (Mandantenfähigkeit & Performance)
// ============================================================================

// Setzt den Stempel, wenn das User-Dokument aktualisiert wird (z.B. Rollen-Wechsel)
exports.setCompanyClaims = functions.firestore
    .document('users/{userId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const oldData = change.before.data();
        
        if (newData.companyId !== oldData.companyId || newData.role !== oldData.role) {
            await admin.auth().setCustomUserClaims(context.params.userId, {
                companyId: newData.companyId,
                role: newData.role
            });
            console.log(`Claims aktualisiert für User: ${context.params.userId}`);
        }
    });

// Setzt den Stempel direkt bei der Erstellung des Users (z.B. nach Invite)
exports.setInitialClaims = functions.firestore
    .document('users/{userId}')
    .onCreate(async (snap, context) => {
        const data = snap.data();
        if (data.companyId && data.role) {
            await admin.auth().setCustomUserClaims(context.params.userId, {
                companyId: data.companyId,
                role: data.role
            });
            console.log(`Initiale Claims gesetzt für User: ${context.params.userId}`);
        }
    });