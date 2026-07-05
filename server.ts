import 'dotenv/config'; // Läd die .env Datei für den Server
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import Stripe from 'stripe';
import admin from 'firebase-admin';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === FIREBASE ADMIN INIT ===
function getFirebaseAdmin() {
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      console.warn('Firebase Admin API keys missing. Some features might not work.');
      return null;
    }

    try {
      privateKey = privateKey.replace(/\\n/g, '\n');
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        })
      });
      console.log('Firebase Admin initialized perfectly!');
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
      return null;
    }
  }
  return admin;
}

const firebaseAdmin = getFirebaseAdmin();
const db = firebaseAdmin ? getFirestore() : null;

// === STRIPE INIT ===
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia' as any,
});

async function startServer() {
  const app = express();
  
  // Wichtig für den Stripe Webhook (braucht raw body)
  app.use((req, res, next) => {
    if (req.originalUrl === '/api/webhook') {
      next();
    } else {
      express.json()(req, res, next);
    }
  });

  // --- 0. TENANT CLAIM (Sitzplatz-Architektur) ---
  app.post('/api/set-tenant-claim', async (req, res) => {
    try {
      const { uid, companyId } = req.body;
      if (!uid || !companyId) return res.status(400).json({ error: 'Missing uid or companyId' });
      if (!firebaseAdmin) return res.status(500).json({ error: 'Firebase Admin not initialized' });

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
      }

      const idToken = authHeader.split('Bearer ')[1];
      let decodedToken;
      try {
        decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
      } catch (err) {
        return res.status(401).json({ error: 'Unauthorized: Token verification failed' });
      }

      const SUPER_ADMIN_EMAILS = [
        'cv1@gmx.ch',
        'carlo@vesciodesign.ch'
      ];

      if (decodedToken.uid !== uid && !SUPER_ADMIN_EMAILS.includes(decodedToken.email?.toLowerCase() || '')) {
        return res.status(403).json({ error: 'Forbidden: You can only set your own tenant claims' });
      }

      const userRecord = await firebaseAdmin.auth().getUser(uid);
      const currentClaims = userRecord.customClaims || {};

      await firebaseAdmin.auth().setCustomUserClaims(uid, {
        ...currentClaims,
        companyId: companyId
      });

      res.status(200).json({ success: true, message: `Tenant claim ${companyId} set for user ${uid}` });
    } catch (error: any) {
      console.error("Custom Claim Error:", error);
      res.status(500).json({ error: 'Failed to set custom claims', details: error.message });
    }
  });

  // --- 1. STRIPE CHECKOUT SESSION (Kugelsicher mit priceId & Gutscheinen) ---
  app.post('/api/create-checkout-session', async (req, res) => {
    try {
      const { email, planName, uid, priceId } = req.body;
      const domainURL = req.headers.origin || 'http://localhost:3000';

      if (!priceId) return res.status(400).json({ error: 'Missing Stripe priceId' });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: email,
        client_reference_id: uid,
        allow_promotion_codes: true, // Gutscheine aktiviert
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${domainURL}/success?session_id={CHECKOUT_SESSION_ID}&plan=${planName}`,
        cancel_url: `${domainURL}/pricing?canceled=true`,
        metadata: { firebaseUID: uid, plan: planName }
      });
      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Checkout Session Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- 2. STRIPE CUSTOMER PORTAL ---
  app.post('/api/create-portal-session', async (req, res) => {
    try {
      const { customerId } = req.body;
      if (!customerId) return res.status(400).json({ error: 'Customer ID missing' });
      
      const domainURL = req.headers.origin || 'http://localhost:3000';
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${domainURL}/settings`,
      });
      res.json({ url: portalSession.url });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- 3. GET USER STATUS ---
  app.get('/api/get-user-status', async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId || typeof userId !== 'string' || !db) return res.status(400).json({ error: 'Invalid config' });

      const userDocRef = db.collection('users').doc(userId);
      const userDoc = await userDocRef.get();

      if (!userDoc.exists) {
        const newCompanyId = `comp_${userId}`;
        const timestamp = new Date();
        const trialEndDate = new Date(timestamp.getTime() + (30 * 24 * 60 * 60 * 1000));

        const newUserData = {
          email: 'unknown@user.com',
          role: 'owner',
          companyId: newCompanyId,
          hasActiveSubscription: true,
          plan: 'Expert Trial',
          trialEndsAt: trialEndDate.toISOString(),
          createdAt: timestamp.toISOString()
        };
        await userDocRef.set(newUserData);
        await db.collection('companies').doc(newCompanyId).set({
          id: newCompanyId,
          name: `Workspace ${userId.substring(0,5)}`,
          plan: 'Expert Trial',
          maxSeats: 1,
          usedSeats: 1,
          ownerId: userId,
          trialEndsAt: trialEndDate.toISOString(),
          createdAt: timestamp.toISOString()
        });
        return res.json(newUserData);
      }
      res.json(userDoc.data());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- 4. STRIPE WEBHOOK (INKLUSIVE KÜNDIGUNGS-FIX 1.2) ---
  app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // A) Kauf abgeschlossen
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const userId = session.client_reference_id || session.metadata?.firebaseUID;
      const planName = session.metadata?.plan || 'Pro';

      if (userId && db) {
        try {
          const userRef = db.collection('users').doc(userId);
          await userRef.update({ 
            hasActiveSubscription: true, 
            plan: planName,
            stripeCustomerId: session.customer,
            subscriptionId: session.subscription,
            subscriptionStatus: 'active'
          });
          const userData = (await userRef.get()).data();
          if (userData?.companyId) {
            let newMaxSeats = 1;
            const p = planName.toLowerCase();
            if (p.includes('studio')) newMaxSeats = 5;
            else if (p.includes('agency')) newMaxSeats = 15;
            else if (p.includes('enterprise')) newMaxSeats = 30;
            
            await db.collection('companies').doc(userData.companyId).update({ plan: planName, maxSeats: newMaxSeats });
          }
        } catch (error) { console.error(error); }
      }
    } 
    // B) Kündigung / Zahlungsausfall (Der Fix)
    else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as any;
      const customerId = subscription.customer;

      if (db && customerId) {
        try {
          const usersRef = db.collection('users');
          const snapshot = await usersRef.where('stripeCustomerId', '==', customerId).get();

          if (!snapshot.empty) {
            const userDoc = snapshot.docs[0];
            const userData = userDoc.data();

            await userDoc.ref.update({
              hasActiveSubscription: false,
              subscriptionStatus: 'canceled',
              plan: 'Free Trial',
              updatedAt: new Date()
            });

            if (userData.companyId) {
              await db.collection('companies').doc(userData.companyId).update({
                plan: 'Free Trial',
                maxSeats: 1,
                updatedAt: new Date()
              });
            }
            console.log(`Server.ts: Abo-Kündigung erfolgreich verarbeitet für Customer ${customerId}`);
          }
        } catch (error) {
          console.error(`Server.ts: Firebase Write Error bei Kündigung:`, error);
        }
      }
    }
    
    res.status(200).send();
  });

  // --- 5. LEAD WEBHOOK ---
  app.post('/api/send-lead-webhook', async (req, res) => {
    try {
      const { companyId, leadData } = req.body;
      if (!companyId || !leadData) return res.status(400).json({ error: 'Missing data' });
      if (!firebaseAdmin) return res.status(500).json({ error: 'Firebase Admin not initialized' });

      // Fetch company profile
      const companySnap = await firebaseAdmin.firestore().collection('companies').doc(companyId).get();
      if (!companySnap.exists) return res.status(404).json({ error: 'Company not found' });
      
      const companyData = companySnap.data();
      const webhookUrl = companyData?.webhookUrl;

      if (webhookUrl) {
         await fetch(webhookUrl, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ ...leadData, event: 'new_lead' })
         });
         console.log(`Lead Webhook erfolgreich gesendet an: ${webhookUrl}`);
      } else {
         console.log(`Kein Webhook für Company ${companyId} hinterlegt.`);
      }

      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("Lead Webhook Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- 5.1 WELCOME WEBHOOK (MAKE.COM / n8n) ---
  app.post('/api/send-welcome-webhook', async (req, res) => {
    try {
      const { email, name, uid } = req.body;
      if (!email) return res.status(400).json({ error: 'Email missing' });
      if (!firebaseAdmin) return res.status(500).json({ error: 'Firebase Admin not initialized' });

      const formattedName = name ? name.charAt(0).toUpperCase() + name.slice(1) : 'Neuer Nutzer';
      const verificationLink = await firebaseAdmin.auth().generateEmailVerificationLink(email);
      const webhookUrl = process.env.WELCOME_WEBHOOK_URL; 
      
      if (webhookUrl) {
         await fetch(webhookUrl, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             email,
             name: formattedName,
             uid,
             verificationLink, 
             source: 'interacTV'
           })
         });
         console.log(`Welcome Webhook erfolgreich gesendet an: ${email}`);
      } else {
         console.warn('Achtung: WELCOME_WEBHOOK_URL ist nicht in der .env hinterlegt!');
      }

      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("Welcome Webhook Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- 6. PASSWORD RESET WEBHOOK (MAKE.COM / n8n) ---
  app.post('/api/send-reset-webhook', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email missing' });
      if (!firebaseAdmin) return res.status(500).json({ error: 'Firebase Admin not initialized' });

      const resetLink = await firebaseAdmin.auth().generatePasswordResetLink(email);
      const webhookUrl = process.env.RESET_WEBHOOK_URL; 
      
      if (webhookUrl) {
         await fetch(webhookUrl, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             email,
             resetLink, 
             source: 'interacTV'
           })
         });
         console.log(`Reset Webhook erfolgreich gesendet an: ${email}`);
      } else {
         console.warn('Achtung: RESET_WEBHOOK_URL ist nicht in der .env hinterlegt!');
      }

      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("Reset Webhook Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- 7. GEMINI AI PROXY (Sicherheit für den API Key) ---
  app.post('/api/generate', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY; 
      if (!apiKey) return res.status(500).json({ error: 'Gemini API key not configured' });
      
      const ai = new GoogleGenAI({ apiKey });
      const { model, contents, config } = req.body;

      const response = await ai.models.generateContent({
        model,
        contents,
        config
      });
      
      res.status(200).json({
        text: response.text,
        candidates: response.candidates
      });
    } catch (error: any) {
      console.error("AI Proxy Error:", error);
      res.status(500).json({ error: 'Server error during generation', details: error.message });
    }
  });

  // --- 7a. GEMINI IMAGE GENERATION PROXY ---
  app.post('/api/generate-image', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY; 
      if (!apiKey) return res.status(500).json({ error: 'Gemini API key not configured' });
      
      const ai = new GoogleGenAI({ apiKey });
      const { prompt } = req.body;

      // Note: We use Imagen 3 for text-to-image generation
      const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-001',
        prompt: prompt || 'A creative architectural design',
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png'
        }
      });
      
      const base64Image = response.generatedImages?.[0]?.image?.imageBytes;
      if (!base64Image) throw new Error("No image generated");

      res.status(200).json({
        imageBytes: base64Image
      });
    } catch (error: any) {
      console.error("AI Image Gen Error:", error);
      res.status(500).json({ error: 'Server error during image generation', details: error.message });
    }
  });

// --- 7b. GEMINI AI EMBEDDING PROXY ---
  app.post('/api/embed', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY; 
      if (!apiKey) return res.status(500).json({ error: 'Gemini API key not configured' });
      
      const ai = new GoogleGenAI({ apiKey });
      const { model, contents } = req.body;

      const response = await ai.models.embedContent({ model, contents });
      
      res.status(200).json({ embeddings: response.embeddings });
    } catch (error: any) {
      console.error("AI Embed Proxy Error:", error);
      res.status(500).json({ error: 'Server error during embedding', details: error.message });
    }
  });

  // --- 8. VITE / STATIC FALLBACK ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => res.sendFile(path.join(process.cwd(), 'dist', 'index.html')));
  }

  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server läuft auf Port ${process.env.PORT || 3000}`);
  });
}
startServer();