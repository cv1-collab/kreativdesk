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
  
  // Wichtig für den Stripe Webhook & Sentry Tunnel (brauchen raw body)
  app.use((req, res, next) => {
    if (req.originalUrl === '/api/webhook' || req.originalUrl.startsWith('/api/sentry-tunnel')) {
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

  // --- 0.2 AUTH OR PUBLIC MIDDLEWARE (FOR AI PROXY) ---
  const verifyAuthOrPublic = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const isPublic = req.body?.isPublic === true;
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (isPublic) return next();
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    try {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(idToken);
      if (error || !user) {
        if (isPublic) return next();
        return res.status(401).json({ error: 'Unauthorized: Token verification failed' });
      }
      (req as any).user = { ...user, uid: user.id };
      next();
    } catch (err) {
      if (isPublic) return next();
      return res.status(401).json({ error: 'Unauthorized: Token verification failed' });
    }
  };

  const verifySubscriptionOrPublic = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const isPublic = req.body?.isPublic === true;
    const user = (req as any).user;
    if (!user && isPublic) {
      return next();
    }
    return verifySubscription(req, res, next);
  };

  // --- 1. STRIPE CHECKOUT SESSION ---
  app.post('/api/create-checkout-session', async (req, res) => {
    try {
      const handler = (await import('./api/_handlers/create-checkout-session.js')).default;
      return handler(req as any, res as any);
    } catch (err: any) {
      console.error('create-checkout-session route error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // --- 2. STRIPE CUSTOMER PORTAL ---
  app.post('/api/create-portal-session', async (req, res) => {
    try {
      const handler = (await import('./api/_handlers/create-portal-session.js')).default;
      return handler(req as any, res as any);
    } catch (err: any) {
      console.error('create-portal-session route error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // --- 3. GET USER STATUS ---
  app.all('/api/get-user-status', async (req, res) => {
    try {
      const handler = (await import('./api/_handlers/get-user-status.js')).default;
      return handler(req as any, res as any);
    } catch (err: any) {
      console.error('get-user-status route error:', err);
      return res.status(500).json({ error: err.message });
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

  // --- 5. LEAD WEBHOOK ---
  app.post('/api/send-lead-webhook', async (req, res) => {
    try {
      const handler = (await import('./api/_handlers/send-lead-webhook.js')).default;
      return handler(req as any, res as any);
    } catch (err: any) {
      console.error('send-lead-webhook route error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // --- 5.1 WELCOME WEBHOOK ---
  app.post('/api/send-welcome-webhook', async (req, res) => {
    try {
      const handler = (await import('./api/_handlers/send-welcome-webhook.js')).default;
      return handler(req as any, res as any);
    } catch (err: any) {
      console.error('send-welcome-webhook route error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // --- 6. PASSWORD RESET WEBHOOK ---
  app.post('/api/send-reset-webhook', async (req, res) => {
    try {
      const handler = (await import('./api/_handlers/send-reset-webhook.js')).default;
      return handler(req as any, res as any);
    } catch (err: any) {
      console.error('send-reset-webhook route error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // --- 6.1 VIDEOCALL INVITE WEBHOOK ---
  app.post('/api/send-invite-webhook', async (req, res) => {
    try {
      const handler = (await import('./api/_handlers/send-invite-webhook.js')).default;
      return handler(req as any, res as any);
    } catch (err: any) {
      console.error('send-invite-webhook route error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // --- 6.2 SUPER ADMIN MAINTENANCE TOGGLE ---
  app.post(['/api/admin/set-maintenance', '/api/set-maintenance'], async (req, res) => {
    try {
      const handler = (await import('./api/_handlers/set-maintenance.js')).default;
      return handler(req as any, res as any);
    } catch (err: any) {
      console.error('set-maintenance route error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // --- 7. GEMINI AI PROXY ---
  app.post('/api/generate', async (req, res) => {
    try {
      const handler = (await import('./api/_handlers/generate.js')).default;
      return handler(req as any, res as any);
    } catch (err: any) {
      console.error('generate route error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // --- 7a. GEMINI IMAGE GENERATION PROXY ---
  app.post('/api/generate-image', async (req, res) => {
    try {
      const handler = (await import('./api/_handlers/generate-image.js')).default;
      return handler(req as any, res as any);
    } catch (err: any) {
      console.error('generate-image route error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // --- 7a.1 FAL FLUX IMAGE-TO-IMAGE RENDERING PROXY ---
  app.all(['/api/render-image', '/api/render/image'], async (req, res) => {
    try {
      const handler = (await import('./api/_handlers/render-image.js')).default;
      return handler(req as any, res as any);
    } catch (err: any) {
      console.error('render-image route error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // --- 7b. GEMINI AI EMBEDDING PROXY ---
  app.post('/api/embed', async (req, res) => {
    try {
      const handler = (await import('./api/_handlers/embed.js')).default;
      return handler(req as any, res as any);
    } catch (err: any) {
      console.error('embed route error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // --- 7c. FAL AI PROXY ---
  app.all(['/api/fal/proxy', '/api/fal-proxy'], async (req, res) => {
    try {
      const handler = (await import('./api/_handlers/fal-proxy.js')).default;
      return handler(req as any, res as any);
    } catch (err: any) {
      console.error('fal-proxy route error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // --- 7d. PROPOSAL AI CHAT ---
  app.all(['/api/proposal/ai-chat', '/api/proposal-ai-chat'], async (req, res) => {
    try {
      const handler = (await import('./api/_handlers/proposal-ai-chat.js')).default;
      return handler(req as any, res as any);
    } catch (err: any) {
      console.error('proposal-ai-chat route error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // --- 7e. EMAIL SEND & PROPOSAL WEBHOOKS ---
  app.post(['/api/email/send', '/api/email-send'], async (req, res) => {
    try {
      const handler = (await import('./api/_handlers/email-send.js')).default;
      return handler(req as any, res as any);
    } catch (err: any) {
      console.error('email-send route error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  app.post(['/api/webhook/lead', '/api/webhook-lead'], async (req, res) => {
    try {
      const handler = (await import('./api/_handlers/webhook-lead.js')).default;
      return handler(req as any, res as any);
    } catch (err: any) {
      console.error('webhook-lead route error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  app.post(['/api/quote/send-email', '/api/quote-send-email'], async (req, res) => {
    try {
      const handler = (await import('./api/_handlers/quote-send-email.js')).default;
      return handler(req as any, res as any);
    } catch (err: any) {
      console.error('quote-send-email route error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  app.post(['/api/bexio/test-connection', '/api/bexio-test-connection'], async (req, res) => {
    try {
      const handler = (await import('./api/_handlers/bexio-test-connection.js')).default;
      return handler(req as any, res as any);
    } catch (err: any) {
      console.error('bexio-test-connection route error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  app.post(['/api/bexio/sync-proposal', '/api/bexio-sync-proposal'], async (req, res) => {
    try {
      const handler = (await import('./api/_handlers/bexio-sync-proposal.js')).default;
      return handler(req as any, res as any);
    } catch (err: any) {
      console.error('bexio-sync-proposal route error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  app.post(['/api/bexio/sync-leads', '/api/bexio-sync-leads'], async (req, res) => {
    try {
      const handler = (await import('./api/_handlers/bexio-sync-leads.js')).default;
      return handler(req as any, res as any);
    } catch (err: any) {
      console.error('bexio-sync-leads route error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // --- DELETE ACCOUNT ---
  app.post('/api/delete-account', async (req, res) => {
    try {
      const handler = (await import('./api/_handlers/delete-account.js')).default;
      return handler(req as any, res as any);
    } catch (err: any) {
      console.error('delete-account route error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // --- PREPROVISION COMPANY ---
  app.post('/api/preprovision-company', async (req, res) => {
    try {
      const handler = (await import('./api/_handlers/preprovision-company.js')).default;
      return handler(req as any, res as any);
    } catch (err: any) {
      console.error('preprovision-company route error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // --- SEND INVITATION ---
  app.post('/api/send-invitation', async (req, res) => {
    try {
      const handler = (await import('./api/_handlers/send-invitation.js')).default;
      return handler(req as any, res as any);
    } catch (err: any) {
      console.error('send-invitation route error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // --- SET TENANT CLAIM ---
  app.post('/api/set-tenant-claim', async (req, res) => {
    try {
      const handler = (await import('./api/_handlers/set-tenant-claim.js')).default;
      return handler(req as any, res as any);
    } catch (err: any) {
      console.error('set-tenant-claim route error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // --- SUBMIT PUBLIC LEAD ---
  app.post(['/api/public/lead', '/api/public-lead', '/api/submit-lead'], async (req, res) => {
    try {
      const handler = (await import('./api/_handlers/submit-public-lead.js')).default;
      return handler(req as any, res as any);
    } catch (err: any) {
      console.error('submit-public-lead route error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // --- ADMIN CLEANUP TEST USERS ---
  app.post(['/api/admin/cleanup-test-users', '/api/admin-cleanup-test-users'], async (req, res) => {
    try {
      const handler = (await import('./api/_handlers/admin-cleanup-test-users.js')).default;
      return handler(req as any, res as any);
    } catch (err: any) {
      console.error('admin-cleanup-test-users route error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // --- FINANCIAL LEDGER ---
  app.all(['/api/financial/ledger', '/api/financial-ledger'], async (req, res) => {
    try {
      const handler = (await import('./api/_handlers/financial-ledger.js')).default;
      return handler(req as any, res as any);
    } catch (err: any) {
      console.error('financial-ledger route error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // --- REGISTER COMPANY ---
  app.post('/api/register-company', async (req, res) => {
    try {
      const handler = (await import('./api/_handlers/register-company.js')).default;
      return handler(req as any, res as any);
    } catch (err: any) {
      console.error('register-company route error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // --- SENTRY TUNNEL (Bypasses adblockers/Firefox tracking protection) ---
  app.all(['/api/sentry-tunnel', '/api/sentry/tunnel'], express.raw({ type: '*/*', limit: '10mb' }), async (req, res) => {
    try {
      const handler = (await import('./api/_handlers/sentry-tunnel.js')).default;
      return handler(req as any, res as any);
    } catch (err: any) {
      console.error('sentry-tunnel route error:', err);
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