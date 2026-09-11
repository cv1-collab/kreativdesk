import type { VercelRequest, VercelResponse } from '@vercel/node';
import sentryTunnelHandler from './_handlers/sentry-tunnel.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return sentryTunnelHandler(req, res);
}
