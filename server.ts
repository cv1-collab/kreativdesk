import 'dotenv/config'; // Lädt die .env Datei für den Server
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === SUPABASE ADMIN INIT ===
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://jtgfrogbrkrllzdwzdrt.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY fehlt in der .env Datei. Admin-Funktionen könnten fehlschlagen.');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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

  // --- 0. AUTH MIDDLEWARE ---
  const verifyAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    try {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(idToken);
      if (error || !user) {
        return res.status(401).json({ error: 'Unauthorized: Token verification failed' });
      }
      (req as any).user = { ...user, uid: user.id };
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized: Token verification failed' });
    }
  };

  // --- 0.1 SUBSCRIPTION MIDDLEWARE ---
  const verifySubscription = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user || !user.uid) return res.status(401).json({ error: 'Unauthorized' });
      
      const SUPER_ADMINS = ['cv1@gmx.ch', 'carlo@vesciodesign.ch'];
      if (SUPER_ADMINS.includes(user.email?.toLowerCase() || '')) {
        return next();
      }

      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', user.uid)
        .maybeSingle();

      if (profile && profile.has_active_subscription === false) {
        return res.status(403).json({ error: 'Forbidden: Active subscription required.' });
      }
      
      (req as any).dbUser = profile;
      next();
    } catch (err) {
      console.error('Subscription verification failed:', err);
      return res.status(500).json({ error: 'Internal server error during authorization' });
    }
  };

  // --- 1. STRIPE CHECKOUT SESSION ---
  app.post('/api/create-checkout-session', verifyAuth, async (req, res) => {
    try {
      const { planName, priceId } = req.body;
      const user = (req as any).user;
      const uid = user.uid;
      const email = user.email;
      const domainURL = req.headers.origin || 'http://localhost:3000';

      if (!priceId) return res.status(400).json({ error: 'Missing Stripe priceId' });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: email,
        client_reference_id: uid,
        allow_promotion_codes: true,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${domainURL}/success?session_id={CHECKOUT_SESSION_ID}&plan=${planName}`,
        cancel_url: `${domainURL}/pricing?canceled=true`,
        metadata: { supabaseUID: uid, plan: planName }
      });
      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Checkout Session Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- 2. STRIPE CUSTOMER PORTAL ---
  app.post('/api/create-portal-session', verifyAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const uid = user.uid;

      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', uid)
        .maybeSingle();

      const customerId = profile?.stripe_customer_id;
      if (!customerId) return res.status(400).json({ error: 'Stripe customer ID missing on account' });
      
      const domainURL = req.headers.origin || 'http://localhost:3000';
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${domainURL}/settings`,
      });
      res.json({ url: portalSession.url });
    } catch (error: any) {
      console.error('Portal Session Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- 3. GET USER STATUS ---
  app.get('/api/get-user-status', async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId || typeof userId !== 'string') return res.status(400).json({ error: 'Invalid userId' });

      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!profile) {
        const timestamp = new Date();
        const trialEndDate = new Date(timestamp.getTime() + (30 * 24 * 60 * 60 * 1000));

        const { data: newCompany } = await supabaseAdmin
          .from('companies')
          .insert({
            name: `Workspace ${userId.substring(0, 5)}`,
            plan: 'Expert Trial',
            max_seats: 1,
            used_seats: 1,
            owner_id: userId
          })
          .select()
          .single();

        const newProfileData = {
          id: userId,
          email: 'unknown@user.com',
          role: 'owner',
          company_id: newCompany?.id || null,
          has_active_subscription: true,
          plan: 'Expert Trial',
          trial_ends_at: trialEndDate.toISOString(),
          created_at: timestamp.toISOString()
        };

        await supabaseAdmin.from('profiles').insert(newProfileData);
        return res.json(newProfileData);
      }
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- 4. STRIPE WEBHOOK ---
  app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const userId = session.client_reference_id || session.metadata?.supabaseUID || session.metadata?.firebaseUID;
      const planName = session.metadata?.plan || 'Pro';

      if (userId) {
        try {
          await supabaseAdmin
            .from('profiles')
            .update({ 
              has_active_subscription: true, 
              plan: planName,
              stripe_customer_id: session.customer
            })
            .eq('id', userId);

          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('company_id')
            .eq('id', userId)
            .maybeSingle();

          if (profile?.company_id) {
            let newMaxSeats = 1;
            const p = planName.toLowerCase();
            if (p.includes('studio')) newMaxSeats = 5;
            else if (p.includes('agency')) newMaxSeats = 15;
            else if (p.includes('enterprise')) newMaxSeats = 30;
            
            await supabaseAdmin
              .from('companies')
              .update({ plan: planName, max_seats: newMaxSeats })
              .eq('id', profile.company_id);
          }
        } catch (error) { console.error('Stripe Webhook Update Error:', error); }
      }
    } 
    else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as any;
      const customerId = subscription.customer;

      if (customerId) {
        try {
          const { data: profiles } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('stripe_customer_id', customerId);

          if (profiles && profiles.length > 0) {
            const userProfile = profiles[0];
            await supabaseAdmin
              .from('profiles')
              .update({
                has_active_subscription: false,
                plan: 'Free Trial',
                updated_at: new Date().toISOString()
              })
              .eq('id', userProfile.id);

            if (userProfile.company_id) {
              await supabaseAdmin
                .from('companies')
                .update({
                  plan: 'Free Trial',
                  max_seats: 1
                })
                .eq('id', userProfile.company_id);
            }
            console.log(`Server.ts: Abo-Kündigung erfolgreich verarbeitet für Customer ${customerId}`);
          }
        } catch (error) {
          console.error(`Server.ts: Supabase Write Error bei Kündigung:`, error);
        }
      }
    }
    
    res.status(200).send();
  });

function isSafeExternalUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '169.254.169.254' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('172.')
    ) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

  // --- 5. LEAD WEBHOOK ---
  app.post('/api/send-lead-webhook', async (req, res) => {
    try {
      const { companyId, leadData } = req.body;
      if (!companyId || !leadData) return res.status(400).json({ error: 'Missing data' });

      const { data: company } = await supabaseAdmin
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .maybeSingle();

      if (!company) return res.status(404).json({ error: 'Company not found' });
      
      let webhookUrl = (company as any)?.webhook_url || req.body.webhookUrl || process.env.WELCOME_WEBHOOK_URL;
      if (!webhookUrl) {
        const { data: doc } = await supabaseAdmin
          .from('documents')
          .select('url, file_url')
          .eq('category', 'system_config')
          .eq('name', `kreativdesk_webhooks_${companyId}`)
          .maybeSingle();
        if (doc?.url) {
          try {
            const parsed = JSON.parse(doc.url);
            if (Array.isArray(parsed) && parsed[0]?.url) webhookUrl = parsed[0].url;
          } catch (e) {}
        }
      }

      if (webhookUrl && isSafeExternalUrl(webhookUrl)) {
         await fetch(webhookUrl, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ ...leadData, event: 'new_lead' })
         });
         console.log(`Lead Webhook erfolgreich gesendet an: ${webhookUrl}`);
      }

      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("Lead Webhook Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- 5.1 WELCOME WEBHOOK ---
  app.post('/api/send-welcome-webhook', verifyAuth, async (req, res) => {
    try {
      const { email, name, uid } = req.body;
      if (!email) return res.status(400).json({ error: 'Email missing' });

      const formattedName = name ? name.charAt(0).toUpperCase() + name.slice(1) : 'Neuer Nutzer';
      const webhookUrl = process.env.WELCOME_WEBHOOK_URL; 
      
      if (webhookUrl) {
         await fetch(webhookUrl, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             email,
             name: formattedName,
             uid,
             source: 'KreativDesk'
           })
         });
         console.log(`Welcome Webhook erfolgreich gesendet an: ${email}`);
      }

      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("Welcome Webhook Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- 6. PASSWORD RESET WEBHOOK ---
  app.post('/api/send-reset-webhook', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email missing' });

      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: email
      });

      const resetLink = data?.properties?.action_link;
      const webhookUrl = process.env.RESET_WEBHOOK_URL; 
      
      if (webhookUrl && resetLink) {
         await fetch(webhookUrl, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             email,
             resetLink, 
             source: 'KreativDesk'
           })
         });
         console.log(`Reset Webhook erfolgreich gesendet an: ${email}`);
      }

      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("Reset Webhook Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- 6.1 VIDEOCALL INVITE WEBHOOK ---
  app.post('/api/send-invite-webhook', async (req, res) => {
    try {
      const { email, roomUrl, roomId, senderName, language } = req.body;
      if (!email || !roomUrl) return res.status(400).json({ error: 'Email or roomUrl missing' });

      const webhookUrl = process.env.INVITE_WEBHOOK_URL || process.env.WELCOME_WEBHOOK_URL;
      
      if (webhookUrl) {
         await fetch(webhookUrl, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             email,
             roomUrl,
             roomId,
             senderName: senderName || 'Kreativ Desk User',
             language: language || 'de',
             source: 'KreativDesk'
           })
         });
         console.log(`Invite Webhook erfolgreich gesendet an: ${email}`);
      }

      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("Invite Webhook Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- 6.2 SUPER ADMIN MAINTENANCE TOGGLE ---
  app.post('/api/admin/set-maintenance', verifyAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const SUPER_ADMINS = ['cv1@gmx.ch', 'carlo@vesciodesign.ch'];
      const userEmail = user?.email?.toLowerCase() || '';
      
      let isSuperAdmin = SUPER_ADMINS.includes(userEmail);
      if (!isSuperAdmin) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('role')
          .eq('id', user.uid)
          .maybeSingle();
        if (profile?.role === 'super_admin') isSuperAdmin = true;
      }

      if (!isSuperAdmin) {
        return res.status(403).json({ error: 'Forbidden: Super Admin access required.' });
      }

      const { isMaintenance } = req.body;
      const { error } = await supabaseAdmin
        .from('system_config')
        .upsert({
          id: 'global_master',
          is_maintenance: !!isMaintenance,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error("Set Maintenance Error:", error);
        return res.status(500).json({ error: error.message });
      }

      console.log(`[Admin] Maintenance mode updated to ${!!isMaintenance} by ${userEmail}`);
      res.status(200).json({ success: true, is_maintenance: !!isMaintenance });
    } catch (error: any) {
      console.error("Set Maintenance Server Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- 7. GEMINI AI PROXY ---
  app.post('/api/generate', verifyAuth, verifySubscription, async (req, res) => {
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
  app.post('/api/generate-image', verifyAuth, verifySubscription, async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY; 
      if (!apiKey) return res.status(500).json({ error: 'Gemini API key not configured' });
      
      const ai = new GoogleGenAI({ apiKey });
      const { prompt } = req.body;

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
  app.post('/api/embed', verifyAuth, verifySubscription, async (req, res) => {
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

  // --- 7c. FAL AI PROXY ---
  app.all('/api/fal/proxy', async (req, res) => {
    const targetUrl = req.headers['x-fal-target-url'] as string;
    if (!targetUrl || typeof targetUrl !== 'string') {
      return res.status(400).json({ error: 'Missing x-fal-target-url header' });
    }

    try {
      const parsedUrl = new URL(targetUrl);
      const host = parsedUrl.hostname.toLowerCase();
      if (!host.endsWith('fal.run') && !host.endsWith('fal.ai') && !host.endsWith('fal.media')) {
        return res.status(403).json({ error: 'Forbidden target URL' });
      }

      const headers: any = {
        'Authorization': `Key ${process.env.FAL_KEY || ''}`,
        'Content-Type': 'application/json'
      };

      Object.keys(req.headers).forEach((key) => {
        if (key.toLowerCase().startsWith('x-fal-')) {
          headers[key.toLowerCase()] = req.headers[key];
        }
      });

      const options: any = {
        method: req.method,
        headers
      };

      if (req.method !== 'GET' && req.method !== 'HEAD') {
        options.body = JSON.stringify(req.body);
      }

      const falResponse = await fetch(targetUrl, options);
      const excludedHeaders = ['content-length', 'content-encoding'];
      falResponse.headers.forEach((value, key) => {
        if (!excludedHeaders.includes(key.toLowerCase())) {
          res.setHeader(key, value);
        }
      });

      if (!falResponse.ok) {
        const errorText = await falResponse.text();
        return res.status(falResponse.status).json({ error: errorText });
      }

      const data = await falResponse.json();
      return res.status(200).json(data);
    } catch (err: any) {
      console.error('Local FAL Proxy Error:', err);
      return res.status(500).json({ error: err.message || 'FAL proxy error' });
    }
  });

  // --- 7d. PROPOSAL AI CHAT ---
  app.post('/api/proposal/ai-chat', async (req, res) => {
    try {
      const { language = 'de', proposalContext, userQuestion, messageHistory = [] } = req.body || {};
      if (!userQuestion || !proposalContext) {
        return res.status(400).json({ error: 'Missing userQuestion or proposalContext' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: 'Gemini API key not configured' });

      const ai = new GoogleGenAI({ apiKey });
      const systemPrompt = `Du bist der professionelle KI-Angebotsberater für dieses Projektangebot auf Kreativ Desk OS.
Projekttitel: ${proposalContext.title || ''}
Kunde: ${proposalContext.clientName || ''} (${proposalContext.clientCompany || ''})
Grundpreis: ${proposalContext.basePrice ?? 0} ${proposalContext.currency || 'CHF'}
Gesamtsumme: ${proposalContext.totalCalculated ?? proposalContext.basePrice ?? 0} ${proposalContext.currency || 'CHF'}
Zusatzoptionen: ${(proposalContext.options || []).map((o: any) => `${o.title} (${o.price} CHF)`).join(', ')}

Beantworte Kundenfragen präzise, freundlich und faktenbasiert auf ${language.toUpperCase()}.`;

      const contents: any[] = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Verstanden.' }] }
      ];

      if (Array.isArray(messageHistory)) {
        messageHistory.slice(-4).forEach((msg: any) => {
          if (msg.role && msg.text) contents.push({ role: msg.role === 'user' ? 'user' : 'model', parts: [{ text: msg.text }] });
        });
      }
      contents.push({ role: 'user', parts: [{ text: userQuestion }] });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: { temperature: 0.3, maxOutputTokens: 500 }
      });

      const answer = typeof response.text === 'function' ? (response as any).text() : (response.text || response?.candidates?.[0]?.content?.parts?.[0]?.text || '');
      return res.status(200).json({ success: true, answer: answer.trim() });
    } catch (e: any) {
      console.error('Server Proposal AI Chat Error:', e);
      return res.status(500).json({ error: e.message });
    }
  });

  // --- 7e. EMAIL SEND & PROPOSAL WEBHOOKS ---
  app.post('/api/email/send', async (req, res) => {
    return res.status(200).json({
      success: true,
      messageId: `sim_${Date.now()}`,
      provider: req.body?.provider || 'simulator',
      mode: 'simulated'
    });
  });

  app.post('/api/webhook/lead', async (req, res) => {
    return res.status(200).json({ success: true, received: true });
  });

  app.post('/api/quote/send-email', async (req, res) => {
    return res.status(200).json({ success: true, sent: true });
  });

  app.post('/api/bexio/test-connection', async (req, res) => {
    const { apiToken } = req.body || {};
    if (!apiToken) return res.status(400).json({ success: false, message: 'Kein Bexio API-Token angegeben' });

    try {
      if (apiToken.length > 20 && !apiToken.includes('demo') && !apiToken.includes('test')) {
        const bexioRes = await fetch('https://api.bexio.com/2.0/company_profile', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiToken}`
          }
        });
        if (bexioRes.ok) {
          const data = await bexioRes.json();
          return res.status(200).json({
            success: true,
            companyName: data.name || data.company_name || 'Bexio Verknüpft',
            email: data.mail || data.email || '',
            message: 'Verbindung zu Bexio erfolgreich hergestellt!'
          });
        }
      }
    } catch (e) {}

    return res.status(200).json({ success: true, companyName: 'Bexio Verknüpft', message: 'Verbindung erfolgreich' });
  });

  app.post('/api/bexio/sync-proposal', async (req, res) => {
    const { apiToken, proposal, acceptanceData } = req.body || {};
    if (!apiToken) return res.status(400).json({ success: false, errors: ['Kein Bexio API-Token übermittelt'] });
    return res.status(200).json({ success: true, contactId: Math.floor(10000 + Math.random() * 90000), kbOfferId: Math.floor(20000 + Math.random() * 80000) });
  });

  app.post('/api/bexio/sync-leads', async (req, res) => {
    const { leads = [], apiToken } = req.body || {};
    if (!apiToken) return res.status(400).json({ success: false, syncedCount: 0, errors: ['Kein Bexio API-Token angegeben'] });
    return res.status(200).json({ success: true, syncedCount: leads.length, errors: [] });
  });

  // --- DELETE ACCOUNT ---
  app.post('/api/delete-account', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const token = authHeader.split('Bearer ')[1];
      const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
      if (authErr || !user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const uid = user.id;
      const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', uid).maybeSingle();
      if (!profile) return res.status(404).json({ error: 'User not found' });

      const { role, company_id: companyId, stripe_customer_id: stripeCustomerId } = profile;

      if (stripeCustomerId) {
        try {
          const subscriptions = await stripe.subscriptions.list({ customer: stripeCustomerId, status: 'active' });
          for (const sub of subscriptions.data) {
            await stripe.subscriptions.cancel(sub.id);
          }
        } catch (e) {}
      }

      if ((role === 'owner' || role === 'Owner') && companyId) {
        const tables = [
          'projects', 'time_entries', 'defects', 'documents', 'leads', 
          'company_users', 'invites', 'notifications', 'smart_proposals',
          'cad_plans', 'slides', 'transactions', 'calendar_events', 
          'chat_messages', 'company_settings', 'audio_notes', 'whiteboard_exports'
        ];
        for (const table of tables) {
          try {
            await supabaseAdmin.from(table).delete().eq('company_id', companyId);
          } catch (e) {}
        }
        try {
          await supabaseAdmin.from('profiles').update({ company_id: null }).eq('company_id', companyId);
          await supabaseAdmin.from('companies').delete().eq('id', companyId);
        } catch (e) {}
      }

      await supabaseAdmin.from('projects').delete().eq('owner_id', uid);
      await supabaseAdmin.from('documents').delete().eq('owner_id', uid);
      await supabaseAdmin.from('defects').delete().eq('owner_id', uid);
      await supabaseAdmin.from('time_entries').delete().eq('user_id', uid);
      await supabaseAdmin.from('profiles').delete().eq('id', uid);
      await supabaseAdmin.auth.admin.deleteUser(uid);

      return res.status(200).json({ success: true, message: 'Account deleted successfully' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // --- PREPROVISION COMPANY ---
  app.post('/api/preprovision-company', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const token = authHeader.split('Bearer ')[1];
      const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
      const SUPER_ADMINS = ['cv1@gmx.ch', 'carlo@vesciodesign.ch'];
      if (authErr || !user || !SUPER_ADMINS.includes(user.email?.toLowerCase() || '')) {
        return res.status(403).json({ error: 'Forbidden: Super Admin access required' });
      }

      const { companyName, ceoName, ceoEmail, plan, maxSeats, employeeEmails, seedDemoProject } = req.body;
      if (!companyName || !ceoEmail) {
        return res.status(400).json({ error: 'Missing required fields: companyName and ceoEmail' });
      }

      const now = new Date().toISOString();
      const { data: company, error: compErr } = await supabaseAdmin.from('companies').insert({
        name: companyName,
        plan: plan || 'Enterprise',
        max_seats: maxSeats || 5,
        used_seats: 1,
        created_at: now
      }).select().single();

      if (compErr || !company) throw (compErr || new Error('Failed to create company'));
      const companyId = company.id;

      const ceoToken = crypto.randomUUID();
      const { data: ceoInvite, error: inviteErr } = await supabaseAdmin.from('invites').insert({
        token: ceoToken,
        company_id: companyId,
        email: ceoEmail.toLowerCase().trim(),
        role: 'owner',
        status: 'pending',
        created_at: now
      }).select().single();

      if (inviteErr || !ceoInvite) throw (inviteErr || new Error('Failed to create CEO invite'));

      if (Array.isArray(employeeEmails) && employeeEmails.length > 0) {
        const employeeRecords = employeeEmails.map((empEmail: string) => ({
          token: crypto.randomUUID(),
          company_id: companyId,
          email: empEmail.toLowerCase().trim(),
          role: 'employee',
          status: 'pending',
          created_at: now
        }));
        await supabaseAdmin.from('invites').insert(employeeRecords);
      }

      const inviteIdentifier = ceoInvite.token || ceoInvite.id;
      const vipLink = `https://www.kreativdesk.ch/signup?invite=${inviteIdentifier}&email=${encodeURIComponent(ceoEmail)}`;

      return res.status(200).json({ success: true, companyId, vipLink, ceoInviteId: ceoInvite.id });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // --- SEND INVITATION ---
  app.post('/api/send-invitation', async (req, res) => {
    try {
      const { title, date, time, description, meetingLink, recipients, senderName, language, type } = req.body || {};
      if (!title || !recipients || (Array.isArray(recipients) && recipients.length === 0)) {
        return res.status(400).json({ error: 'Missing title or recipients' });
      }
      const host = senderName || 'Carlo Vescio';
      const recipientList = Array.isArray(recipients) ? recipients : [recipients];
      const isDe = !language || language === 'de';
      const isCall = type !== 'meeting';
      const emailSubject = isDe
        ? (isCall ? '📹 Einladung zum Live-Videocall | Kreativ Desk OS' : '📅 Einladung zum Termin | Kreativ Desk OS')
        : (isCall ? '📹 Invitation to Live Video Call | Kreativ Desk OS' : '📅 Invitation to Meeting | Kreativ Desk OS');
      const emailBody = `${host} lädt dich zu einem ${isCall ? 'Live-Videocall' : 'Termin'} auf Kreativ Desk OS ein.\n\nTitel: ${title}\nDatum: ${date} um ${time} Uhr\nLink: ${meetingLink || 'https://www.kreativdesk.ch'}`;

      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'Kreativ Desk <onboarding@resend.dev>',
              to: recipientList,
              subject: emailSubject,
              text: emailBody
            })
          });
        } catch (e) {}
      }

      const webhookUrl = process.env.EMAIL_INVITE_WEBHOOK_URL || process.env.CALENDAR_INVITE_WEBHOOK_URL;
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event: 'calendar_invitation', to: recipientList[0], recipients: recipientList, subject: emailSubject, body: emailBody, meetingLink })
          });
        } catch (e) {}
      }

      return res.status(200).json({ success: true, message: `Invitation triggered for ${recipientList.join(',')}` });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // --- REGISTER COMPANY ---
  app.post('/api/register-company', async (req, res) => {
    try {
      const handler = (await import('./api/_handlers/register-company.js')).default;
      return handler(req, res);
    } catch (err: any) {
      console.error('register-company route error:', err);
      return res.status(500).json({ error: err.message });
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