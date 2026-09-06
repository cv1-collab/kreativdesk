import type { VercelRequest, VercelResponse } from '@vercel/node';

import createCheckoutSession from './_handlers/create-checkout-session.js';
import createPortalSession from './_handlers/create-portal-session.js';
import getUserStatus from './_handlers/get-user-status.js';
import generate from './_handlers/generate.js';
import generateImage from './_handlers/generate-image.js';
import embed from './_handlers/embed.js';
import falProxy from './_handlers/fal-proxy.js';
import proposalAiChat from './_handlers/proposal-ai-chat.js';
import emailSend from './_handlers/email-send.js';
import quoteSendEmail from './_handlers/quote-send-email.js';
import webhookLead from './_handlers/webhook-lead.js';
import sendInviteWebhook from './_handlers/send-invite-webhook.js';
import sendLeadWebhook from './_handlers/send-lead-webhook.js';
import sendWelcomeWebhook from './_handlers/send-welcome-webhook.js';
import sendResetWebhook from './_handlers/send-reset-webhook.js';
import setMaintenance from './_handlers/set-maintenance.js';
import deleteAccount from './_handlers/delete-account.js';
import preprovisionCompany from './_handlers/preprovision-company.js';
import registerCompany from './_handlers/register-company.js';
import sendInvitation from './_handlers/send-invitation.js';
import setTenantClaim from './_handlers/set-tenant-claim.js';
import bexioSyncProposal from './_handlers/bexio-sync-proposal.js';
import bexioTestConnection from './_handlers/bexio-test-connection.js';
import bexioSyncLeads from './_handlers/bexio-sync-leads.js';

type RouteHandler = (req: VercelRequest | any, res: VercelResponse | any) => Promise<any> | any;

const handlers: Record<string, RouteHandler> = {
  'create-checkout-session': createCheckoutSession,
  'create-portal-session': createPortalSession,
  'get-user-status': getUserStatus,
  'generate': generate,
  'generate-image': generateImage,
  'embed': embed,
  'fal/proxy': falProxy,
  'fal-proxy': falProxy,
  'proposal/ai-chat': proposalAiChat,
  'proposal-ai-chat': proposalAiChat,
  'email/send': emailSend,
  'email-send': emailSend,
  'quote/send-email': quoteSendEmail,
  'quote-send-email': quoteSendEmail,
  'webhook/lead': webhookLead,
  'webhook-lead': webhookLead,
  'send-invite-webhook': sendInviteWebhook,
  'send-lead-webhook': sendLeadWebhook,
  'send-welcome-webhook': sendWelcomeWebhook,
  'send-reset-webhook': sendResetWebhook,
  'admin/set-maintenance': setMaintenance,
  'set-maintenance': setMaintenance,
  'delete-account': deleteAccount,
  'preprovision-company': preprovisionCompany,
  'register-company': registerCompany,
  'send-invitation': sendInvitation,
  'set-tenant-claim': setTenantClaim,
  'bexio/sync-proposal': bexioSyncProposal,
  'bexio-sync-proposal': bexioSyncProposal,
  'bexio/test-connection': bexioTestConnection,
  'bexio-test-connection': bexioTestConnection,
  'bexio/sync-leads': bexioSyncLeads,
  'bexio-sync-leads': bexioSyncLeads,
};

function extractRoute(req: VercelRequest): string {
  // 1. Check req.query.route
  const routeParam = req.query?.route;
  if (routeParam) {
    if (Array.isArray(routeParam)) {
      const joined = routeParam.join('/').replace(/^\/+/, '').replace(/\/+$/, '');
      if (joined && !joined.startsWith('[...route]')) return joined;
    } else if (typeof routeParam === 'string' && routeParam !== '[...route]') {
      const clean = routeParam.replace(/^\/+/, '').replace(/\/+$/, '');
      if (clean) return clean;
    }
  }

  // 2. Check req.url
  const rawUrl = req.url || '';
  try {
    const urlObj = new URL(rawUrl, 'http://localhost');
    const pathname = urlObj.pathname.replace(/^\/api\/?/, '').replace(/\/+$/, '');
    if (pathname && pathname !== '[...route]') {
      return pathname;
    }
  } catch {
    // fallback
  }

  // 3. Check Vercel routing headers
  const matchedPath = (req.headers['x-matched-path'] as string) || (req.headers['x-invoke-path'] as string);
  if (matchedPath) {
    try {
      const urlObj = new URL(matchedPath, 'http://localhost');
      const pathname = urlObj.pathname.replace(/^\/api\/?/, '').replace(/\/+$/, '');
      if (pathname && pathname !== '[...route]') {
        return pathname;
      }
    } catch {
      // fallback
    }
  }

  return '';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Global CORS handling
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-fal-target-url');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const route = extractRoute(req);
  const routeHandler = handlers[route];

  if (!routeHandler) {
    return res.status(404).json({
      error: `API route not found: /api/${route}`,
      availableRoutes: Object.keys(handlers)
    });
  }

  try {
    return await routeHandler(req, res);
  } catch (error: any) {
    console.error(`Error in route /api/${route}:`, error);
    if (!res.headersSent) {
      return res.status(500).json({
        error: error?.message || 'Internal Server Error',
        route
      });
    }
  }
}
