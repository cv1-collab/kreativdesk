import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { supabaseAdmin, verifySuperAdmin } from '../_auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user || !(await verifySuperAdmin(user))) {
      return res.status(403).json({ error: 'Forbidden: Super Admin access required' });
    }

    const { companyName, ceoName, ceoEmail, plan, maxSeats, employeeEmails, seedDemoProject } = req.body;
    if (!companyName || !ceoEmail) {
      return res.status(400).json({ error: 'Missing required fields: companyName and ceoEmail' });
    }

    const now = new Date().toISOString();

    // 1. Create Company Workspace (Let PostgreSQL generate the UUID id)
    const effectivePlan = plan || 'Enterprise';
    const effectiveMaxSeats = Number(maxSeats) || (effectivePlan.toLowerCase().includes('enterprise') ? 50 : 5);
    const { data: company, error: compErr } = await supabaseAdmin.from('companies').insert({
      name: companyName,
      plan: effectivePlan,
      max_seats: effectiveMaxSeats,
      used_seats: 1,
      created_at: now
    }).select().maybeSingle();

    if (compErr || !company) throw (compErr || new Error('Failed to create company'));
    const companyId = company.id;

    // 2. Create Invite Token for CEO / Owner
    const ceoToken = crypto.randomUUID();
    const { data: ceoInvite, error: inviteErr } = await supabaseAdmin.from('invites').insert({
      token: ceoToken,
      company_id: companyId,
      email: ceoEmail.toLowerCase().trim(),
      role: 'owner',
      status: 'pending',
      created_at: now
    }).select().maybeSingle();

    if (inviteErr || !ceoInvite) throw (inviteErr || new Error('Failed to create CEO invite'));

    // 2.1 Pre-insert CEO into company_users
    await supabaseAdmin.from('company_users').insert({
      company_id: companyId,
      name: ceoName || ceoEmail.split('@')[0],
      email: ceoEmail.toLowerCase().trim(),
      role: 'owner',
      status: 'team',
      is_external: false,
      can_view_finance: true,
      can_approve_budget: true,
      created_at: now
    });

    // 3. Pre-seed Default 9 Folders
    const defaultFolders = [
      '01_FINANZEN', '02_RECHTLICHES', '03_HR_MITARBEITER',
      '04_SALES', '05_MARKETING', '06_OPERATIONS',
      '07_ASSETS', '08_PLÄNE', '09_DOKUMENTATION'
    ];

    const folderRecords = defaultFolders.map(name => ({
      name,
      is_folder: true,
      category: 'company',
      project_id: null,
      folder_id: 'root',
      company_id: companyId,
      created_at: now
    }));

    await supabaseAdmin.from('documents').insert(folderRecords);

    // 4. Pre-seed Demo Project if selected
    if (seedDemoProject) {
      const { data: project } = await supabaseAdmin.from('projects').insert({
        name: `Projekt ${companyName.split(' ')[0] || 'Neubau'}`,
        description: 'Vorkonfiguriertes Ausführungsprojekt mit 2D/3D Plan-Ordner & Mängel-Tracking.',
        status: 'active',
        company_id: companyId,
        created_at: now
      }).select().maybeSingle();

      if (project) {
        await supabaseAdmin.from('defects').insert([
          { project_id: project.id, prompt: 'Rohbauabnahme & Betongefüge prüfen', description: 'Rohbauabnahme & Betongefüge prüfen', status: 'Erledigt', severity: 'High', company_id: companyId, created_at: now },
          { project_id: project.id, prompt: 'BIM 3D-Modell & HKLS-Trassen abgleichen', description: 'BIM 3D-Modell & HKLS-Trassen abgleichen', status: 'In Arbeit', severity: 'High', company_id: companyId, created_at: now },
          { project_id: project.id, prompt: 'Abnahme Brandschutzklappen OG1-OG3', description: 'Abnahme Brandschutzklappen OG1-OG3', status: 'Offen', severity: 'Medium', company_id: companyId, created_at: now }
        ]);
      }
    }

    // 5. Pre-invite employees if provided
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

      const employeeCrmRecords = employeeEmails.map((empEmail: string) => {
        const cleanEmp = empEmail.toLowerCase().trim();
        return {
          company_id: companyId,
          name: cleanEmp.split('@')[0],
          email: cleanEmp,
          role: 'employee',
          status: 'invited',
          is_external: false,
          can_view_finance: true,
          can_approve_budget: false,
          created_at: now
        };
      });
      await supabaseAdmin.from('company_users').insert(employeeCrmRecords);
    }

    const inviteIdentifier = ceoInvite.token || ceoInvite.id;
    const vipLink = `https://www.kreativdesk.ch/signup?invite=${inviteIdentifier}&companyId=${companyId}&email=${encodeURIComponent(ceoEmail)}`;

    try {
      await supabaseAdmin.from('audit_logs').insert({
        company_id: companyId,
        user_id: user.id,
        user_email: user.email || 'Admin',
        action: 'SETTINGS_UPDATED',
        details: {
          title: `B2B Workspace provisioniert: ${companyName}`,
          ceoEmail,
          plan: effectivePlan,
          maxSeats: effectiveMaxSeats
        },
        created_at: now
      });
    } catch (_) {}

    return res.status(200).json({
      success: true,
      companyId,
      vipLink,
      ceoInviteId: ceoInvite.id,
      ceoToken: ceoInvite.token
    });

  } catch (error: any) {
    console.error('Preprovision Error:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}
