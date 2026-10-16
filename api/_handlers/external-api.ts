import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { verifyAuth, supabaseAdmin } from '../_auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, X-API-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const authUser = await verifyAuth(req, res);
    if (!authUser || !authUser.companyId) {
      return res.status(401).json({
        error: 'Unauthorized: Valid API Key (x-api-key: kd_live_... or Authorization: Bearer kd_live_...) required.'
      });
    }

    const companyId = String(authUser.companyId);
    const rawUrl = req.url || '';
    const pathResourceMatch = rawUrl.match(/\/api\/(?:v1|external)\/([a-z_-]+)/i);
    const resource = String(
      req.query?.resource ||
      req.body?.resource ||
      req.body?.entity ||
      pathResourceMatch?.[1] ||
      'status'
    ).toLowerCase().trim();

    if (req.method === 'GET') {
      const limit = Math.min(Math.max(Number(req.query?.limit) || 50, 1), 200);

      if (resource === 'status' || resource === 'ping') {
        return res.status(200).json({
          success: true,
          status: 'connected',
          companyId,
          plan: authUser.plan,
          endpoints: ['projects', 'leads', 'contacts', 'defects', 'transactions', 'proposals'],
          timestamp: new Date().toISOString()
        });
      }

      const tableMap: Record<string, string> = {
        projects: 'projects',
        project: 'projects',
        leads: 'leads',
        lead: 'leads',
        contacts: 'company_users',
        contact: 'company_users',
        defects: 'defects',
        defect: 'defects',
        transactions: 'transactions',
        invoices: 'transactions',
        proposals: 'smart_proposals',
        quotes: 'smart_proposals'
      };

      const targetTable = tableMap[resource];
      if (!targetTable) {
        return res.status(400).json({
          error: `Unsupported resource '${resource}'. Use one of: projects, leads, contacts, defects, transactions, proposals.`
        });
      }

      const { data, error } = await supabaseAdmin
        .from(targetTable)
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({
        success: true,
        resource,
        companyId,
        count: data?.length || 0,
        data: data || []
      });
    }

    if (req.method === 'POST') {
      const payload = req.body?.data || req.body || {};
      const now = new Date().toISOString();
      const logApiAudit = async (action: string, title: string, meta?: Record<string, any>) => {
        try {
          await supabaseAdmin.from('audit_logs').insert({
            company_id: companyId,
            user_id: String(authUser.id || 'api'),
            action,
            details: { title, source: 'Open REST API', userEmail: authUser.email || 'Open REST API', ...meta },
            created_at: now
          });
        } catch (_) {}
      };

      if (resource === 'leads' || resource === 'lead' || payload.event === 'lead.create') {
        const record = {
          company_id: companyId,
          name: payload.name || payload.contact_name || 'Externe Anfrage',
          company: payload.company || payload.company_name || '',
          email: payload.email || '',
          phone: payload.phone || '',
          project_type: payload.project_type || payload.category || 'Allgemein',
          budget: Number(payload.budget || payload.value || 0),
          status: payload.status || 'Neu',
          notes: payload.notes || payload.description || payload.message || '',
          source: payload.source || 'Open API / Webhook',
          created_at: now
        };
        const { data, error } = await supabaseAdmin.from('leads').insert([record]).select().single();
        if (error) return res.status(500).json({ error: error.message });
        await logApiAudit('LEAD_CREATED', `API Lead erstellt: ${record.name}`, { email: record.email });
        return res.status(201).json({ success: true, resource: 'leads', data });
      }

      if (resource === 'contacts' || resource === 'contact' || payload.event === 'contact.create') {
        const record = {
          company_id: companyId,
          name: payload.name || 'Neuer Kontakt',
          company: payload.company || null,
          role: payload.role || 'client',
          email: payload.email || '',
          phone: payload.phone || '',
          street: payload.street || '',
          zip_city: payload.location || payload.city || payload.zip_city || '',
          notes: payload.notes || payload.description || '',
          is_external: payload.is_external !== false,
          status: payload.is_external === false ? 'team' : 'external',
          created_at: now
        };
        const { data, error } = await supabaseAdmin.from('company_users').insert([record]).select().single();
        if (error) return res.status(500).json({ error: error.message });
        await logApiAudit('CONTACT_CREATED', `API Kontakt erstellt: ${record.name}`, { email: record.email });
        return res.status(201).json({ success: true, resource: 'contacts', data });
      }

      if (resource === 'defects' || resource === 'defect' || payload.event === 'defect.create') {
        const record = {
          company_id: companyId,
          project_id: payload.project_id || payload.projectId || null,
          title: payload.title || 'Externe Mängelmeldung',
          description: payload.description || '',
          status: payload.status || 'Open',
          priority: payload.priority || 'Medium',
          location: payload.location || '',
          assignee: payload.assignee || '',
          created_at: now
        };
        const { data, error } = await supabaseAdmin.from('defects').insert([record]).select().single();
        if (error) return res.status(500).json({ error: error.message });
        await logApiAudit('DEFECT_CREATED', `API Mangel erstellt: ${record.title}`, { priority: record.priority });
        return res.status(201).json({ success: true, resource: 'defects', data });
      }

      if (resource === 'transactions' || resource === 'invoices' || resource === 'invoice' || payload.event === 'invoice.create') {
        const record = {
          id: crypto.randomUUID(),
          company_id: companyId,
          project_id: payload.project_id || payload.projectId || null,
          description: payload.description || payload.title || 'Externe Buchung (API)',
          amount: Number(payload.amount || 0),
          type: payload.type === 'expense' ? 'expense' : 'income',
          category: payload.category || 'API Sync',
          status: payload.status || 'open',
          date: payload.date || now.split('T')[0],
          created_at: now
        };
        const { data, error } = await supabaseAdmin.from('transactions').insert([record]).select().single();
        if (error) return res.status(500).json({ error: error.message });
        await logApiAudit('INVOICE_CREATED', `API Transaktion gebucht: ${record.description}`, { amount: record.amount, type: record.type });
        return res.status(201).json({ success: true, resource: 'transactions', data });
      }

      if (resource === 'projects' || resource === 'project' || payload.event === 'project.create') {
        const record = {
          company_id: companyId,
          owner_id: authUser.id,
          name: payload.name || payload.title || 'Neues API-Projekt',
          description: payload.description || '',
          status: payload.status || 'Planung',
          budget: Number(payload.budget || 0),
          client: payload.client || payload.client_name || '',
          location: payload.location || '',
          created_at: now
        };
        const { data, error } = await supabaseAdmin.from('projects').insert([record]).select().single();
        if (error) return res.status(500).json({ error: error.message });
        await logApiAudit('PROJECT_CREATED', `API Projekt erstellt: ${record.name}`, { budget: record.budget });
        return res.status(201).json({ success: true, resource: 'projects', data });
      }

      return res.status(400).json({
        error: `Unsupported POST resource '${resource}'. Specify 'resource' as one of: leads, contacts, defects, transactions, projects.`
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('External Open API Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
