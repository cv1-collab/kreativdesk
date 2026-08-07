import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from './_auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user || user.email !== 'cv1@gmx.ch') {
      return res.status(403).json({ error: 'Forbidden: Super Admin access required' });
    }

    const { companyName, ceoName, ceoEmail, plan, maxSeats, employeeEmails, seedDemoProject } = req.body;
    if (!companyName || !ceoEmail) {
      return res.status(400).json({ error: 'Missing required fields: companyName and ceoEmail' });
    }

    const companyId = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    // 1. Create Company Workspace
    const { data: company, error: compErr } = await supabaseAdmin.from('companies').insert({
      id: companyId,
      name: companyName,
      plan: plan || 'Enterprise',
      max_seats: maxSeats || 5,
      used_seats: 1,
      trial_ends_at: trialEndsAt,
      created_at: now
    }).select().single();

    if (compErr) throw compErr;

    // 2. Create Invite Token for CEO / Owner
    const { data: ceoInvite, error: inviteErr } = await supabaseAdmin.from('invites').insert({
      company_id: companyId,
      email: ceoEmail.toLowerCase().trim(),
      role: 'owner',
      status: 'pending',
      created_at: now
    }).select().single();

    if (inviteErr) throw inviteErr;

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
      project_id: 'global',
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
        status: 'in_progress',
        company_id: companyId,
        created_at: now
      }).select().single();

      if (project) {
        await supabaseAdmin.from('project_tasks').insert([
          { project_id: project.id, title: 'Rohbauabnahme & Betongefüge prüfen', status: 'done', priority: 'high', company_id: companyId },
          { project_id: project.id, title: 'BIM 3D-Modell & HKLS-Trassen abgleichen', status: 'in_progress', priority: 'high', company_id: companyId },
          { project_id: project.id, title: 'Abnahme Brandschutzklappen OG1-OG3', status: 'todo', priority: 'medium', company_id: companyId }
        ]);
      }
    }

    // 5. Pre-invite employees if provided
    if (Array.isArray(employeeEmails) && employeeEmails.length > 0) {
      const employeeRecords = employeeEmails.map((empEmail: string) => ({
        company_id: companyId,
        email: empEmail.toLowerCase().trim(),
        role: 'employee',
        status: 'pending',
        created_at: now
      }));
      await supabaseAdmin.from('invites').insert(employeeRecords);
    }

    const vipLink = `https://www.kreativdesk.ch/signup?invite=${ceoInvite.id}&email=${encodeURIComponent(ceoEmail)}`;

    return res.status(200).json({
      success: true,
      companyId,
      vipLink,
      ceoInviteId: ceoInvite.id
    });

  } catch (error: any) {
    console.error('Preprovision Error:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}
