import { supabase } from '../lib/supabase';
import { demoTemplates } from '../utils/demoTemplates';

export async function ensureDefaultCompanyFolders(companyId: string, ownerId: string) {
  if (!companyId || !ownerId) return;

  const defaultFolders = [
    { name: '01_FINANZEN', category: 'company' },
    { name: '02_VERTRÄGE', category: 'company' },
    { name: '03_PERSONAL', category: 'company' },
    { name: '04_MARKETING', category: 'company' }
  ];

  for (const f of defaultFolders) {
    const { data: existing } = await supabase
      .from('documents')
      .select('id')
      .eq('company_id', companyId)
      .eq('name', f.name)
      .eq('is_folder', true)
      .maybeSingle();

    if (!existing) {
      await supabase.from('documents').insert({
        name: f.name,
        is_folder: true,
        category: f.category,
        project_id: 'global',
        folder_id: 'root',
        owner_id: ownerId,
        uploaded_by: ownerId,
        company_id: companyId,
        created_at: new Date().toISOString(),
        uploaded_at: new Date().toISOString()
      });
    }
  }
}

export async function seedDemoProjectToSupabase(companyId: string, ownerId: string, templateType: string = 'construction') {
  if (!companyId || !ownerId) return null;

  const template = (demoTemplates as any)[templateType] || demoTemplates.construction;
  const projData = template.project || {};

  // 1. Create or get Demo Project
  let projId: string = '';
  const { data: existingProj } = await supabase
    .from('projects')
    .select('id')
    .eq('company_id', companyId)
    .eq('name', projData.name || 'Quartier Neubau Süd')
    .maybeSingle();

  if (existingProj) {
    projId = existingProj.id;
  } else {
    const { data: newProj, error } = await supabase
      .from('projects')
      .insert({
        name: projData.name || 'Quartier Neubau Süd',
        description: projData.description || 'Zentrale Bauleitung, Mängelmanagement und Budgetkontrolle für das Wohnquartier.',
        status: 'active',
        company_id: companyId,
        owner_id: ownerId,
        site_location: { location: projData.siteLocation || 'Zürich' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error || !newProj) {
      console.error('Failed to seed demo project:', error);
      return null;
    }
    projId = newProj.id;
  }

  // 2. Seed Team Members (Avatars)
  if (Array.isArray(template.members)) {
    for (const m of template.members) {
      const { data: existingMem } = await supabase
        .from('project_members')
        .select('id')
        .eq('company_id', companyId)
        .eq('project_id', projId)
        .eq('user_id', m.name)
        .maybeSingle();

      if (!existingMem) {
        await supabase.from('project_members').insert({
          project_id: projId,
          user_id: m.name,
          company_id: companyId
        });
      }
    }
  }

  // 3. Seed Demo Documents / Plans
  if (Array.isArray(template.documents)) {
    for (const d of template.documents) {
      const { data: existingDoc } = await supabase
        .from('documents')
        .select('id')
        .eq('company_id', companyId)
        .eq('project_id', projId)
        .eq('name', d.name)
        .maybeSingle();

      if (!existingDoc) {
        await supabase.from('documents').insert({
          name: d.name,
          url: d.url,
          file_url: d.url,
          project_id: projId,
          folder_id: 'root',
          category: 'projects',
          type: d.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
          size: '1.2 MB',
          is_folder: false,
          owner_id: ownerId,
          uploaded_by: ownerId,
          company_id: companyId,
          created_at: new Date().toISOString(),
          uploaded_at: new Date().toISOString()
        });
      }
    }
  }

  // 4. Seed Defects
  if (Array.isArray(template.defects)) {
    for (const def of template.defects) {
      const { data: existingDef } = await supabase
        .from('defects')
        .select('id')
        .eq('company_id', companyId)
        .eq('project_id', projId)
        .eq('prompt', def.title)
        .maybeSingle();

      if (!existingDef) {
        await supabase.from('defects').insert({
          project_id: projId,
          company_id: companyId,
          owner_id: ownerId,
          prompt: def.title,
          description: def.description,
          status: def.status || 'Offen',
          severity: def.priority || 'High',
          position: { x: 0, y: 1.5, z: 0 },
          created_at: new Date().toISOString()
        });
      }
    }
  }

  // 5. Seed Transactions (Finanzen)
  if (Array.isArray(template.transactions)) {
    for (const tx of template.transactions) {
      const { data: existingTx } = await supabase
        .from('transactions')
        .select('id')
        .eq('company_id', companyId)
        .eq('description', tx.description)
        .maybeSingle();

      if (!existingTx) {
        await supabase.from('transactions').insert({
          type: tx.amount < 0 ? 'expense' : 'income',
          amount: Math.abs(tx.amount),
          category: tx.category || 'Baustellenkosten',
          description: tx.description,
          date: tx.date.split('T')[0],
          status: tx.status || 'Bezahlt',
          project_id: projId,
          owner_id: ownerId,
          company_id: companyId,
          created_at: new Date().toISOString()
        });
      }
    }
  }

  // 6. Seed Pitch Deck Slides
  if (template.pitchDeck && Array.isArray(template.pitchDeck.slides)) {
    for (const s of template.pitchDeck.slides) {
      const { data: existingSlide } = await supabase
        .from('slides')
        .select('id')
        .eq('company_id', companyId)
        .eq('project_id', projId)
        .eq('title', s.title)
        .maybeSingle();

      if (!existingSlide) {
        await supabase.from('slides').insert({
          project_id: projId,
          company_id: companyId,
          title: s.title,
          content: s.content,
          layout: s.layout,
          image_url: s.imageUrl || '',
          order_index: s.order_index || 0,
          created_at: new Date().toISOString()
        });
      }
    }
  }

  return projId;
}
