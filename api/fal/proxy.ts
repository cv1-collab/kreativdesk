import { createPageRouterHandler } from '@fal-ai/server-proxy/nextjs';

const handler = createPageRouterHandler();

export default async function (req: any, res: any) {
  return handler(req, res);
}
