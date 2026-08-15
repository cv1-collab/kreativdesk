import { supabase } from '../lib/supabase';
import { demoTemplates } from '../utils/demoTemplates';

export function generateDemoTransactions(financeGroups: any[], projectId: string, companyId: string, ownerId: string) {
  const dummyTxs: any[] = [];
  let txId = 1;
  let totalPlan = 0;
  const today = new Date();

  if (Array.isArray(financeGroups)) {
    financeGroups.forEach((g: any) => {
      (g.items || []).forEach((item: any) => {
        const itemTotal = item.total || ((item.qty || item.quantity || 0) * (item.unitPrice || 0));
        totalPlan += itemTotal;
        if (txId % 2 !== 0) {
          const pastDate = new Date(today);
          pastDate.setDate(today.getDate() - (txId * 3));
          dummyTxs.push({
            project_id: projectId,
            company_id: companyId,
            owner_id: ownerId,
            description: `Teilrechnung: ${item.title || item.description}`,
            category: 'Kreditorenrechnung',
            amount: -(itemTotal * 0.65),
            status: 'Bezahlt',
            budget_pos_id: item.id,
            date: pastDate.toISOString().split('T')[0],
            created_at: pastDate.toISOString()
          });
        }
        txId++;
      });
    });
  }

  const revDate = new Date(today);
  revDate.setDate(today.getDate() - 2);
  dummyTxs.push({
    project_id: projectId,
    company_id: companyId,
    owner_id: ownerId,
    description: 'Akontozahlung Bauherr Phase 1',
    category: 'Debitorenrechnung',
    amount: totalPlan > 0 ? totalPlan * 0.7 : 721595,
    status: 'Bezahlt',
    date: revDate.toISOString().split('T')[0],
    created_at: revDate.toISOString()
  });

  return dummyTxs;
}

export async function getOrCreateRealCompanyId(companyId: string, ownerId: string): Promise<string> {
  if (!ownerId) return companyId;

  if (companyId) {
    const { data: comp } = await supabase.from('companies').select('id').eq('id', companyId).maybeSingle();
    if (comp?.id) return comp.id;
  }

  const { data: ownerComp } = await supabase.from('companies').select('id').eq('owner_id', ownerId).maybeSingle();
  if (ownerComp?.id) {
    await supabase.from('profiles').update({ company_id: ownerComp.id }).eq('id', ownerId);
    return ownerComp.id;
  }

  const { data: newComp } = await supabase
    .from('companies')
    .insert({
      name: 'Meine Organisation',
      plan: 'Free Trial',
      owner_id: ownerId
    })
    .select('id')
    .single();

  if (newComp?.id) {
    await supabase.from('profiles').update({ company_id: newComp.id }).eq('id', ownerId);
    return newComp.id;
  }

  return companyId;
}

const seededCompanyFoldersCache = new Set<string>();

export async function ensureDefaultCompanyFolders(companyId: string, ownerId: string) {
  if (!ownerId || !companyId) return;
  if (seededCompanyFoldersCache.has(companyId)) return;

  const realCompanyId = await getOrCreateRealCompanyId(companyId, ownerId);
  seededCompanyFoldersCache.add(companyId);
  seededCompanyFoldersCache.add(realCompanyId);

  const defaultFolders = [
    { name: '01_FINANZEN', category: 'company' },
    { name: '02_RECHTLICHES', category: 'company' },
    { name: '03_HR_MITARBEITER', category: 'company' },
    { name: '04_SALES', category: 'company' },
    { name: '05_MARKETING', category: 'company' },
    { name: '06_OPERATIONS', category: 'company' },
    { name: '07_ASSETS', category: 'company' },
    { name: '08_PLÄNE', category: 'company' },
    { name: '09_DOKUMENTATION', category: 'company' },
    { name: '10_KI_STUDIO', category: 'company' },
    { name: '11_WHITEBOARD_3D', category: 'company' }
  ];

  try {
    const { data: existingList } = await supabase
      .from('documents')
      .select('name')
      .eq('company_id', realCompanyId)
      .eq('is_folder', true);

    const existingNames = new Set((existingList || []).map((f: any) => f.name));
    const newFoldersToInsert = defaultFolders.filter(f => !existingNames.has(f.name));

    if (newFoldersToInsert.length > 0) {
      const records = newFoldersToInsert.map(f => ({
        name: f.name,
        is_folder: true,
        category: f.category,
        project_id: 'global',
        folder_id: 'root',
        owner_id: ownerId,
        uploaded_by: ownerId,
        company_id: realCompanyId,
        created_at: new Date().toISOString(),
        uploaded_at: new Date().toISOString()
      }));

      await supabase.from('documents').insert(records);
    }
  } catch (err) {
    console.error('Error ensuring default company folders:', err);
  }
}

export async function seedDemoProjectToSupabase(companyId: string, ownerId: string, templateType: string = 'construction') {
  if (!ownerId) return null;
  const realCompanyId = await getOrCreateRealCompanyId(companyId, ownerId);

  await ensureDefaultCompanyFolders(realCompanyId, ownerId);

  const template = (demoTemplates as any)[templateType] || demoTemplates.construction;
  const projData = template.project || {};

  // 1. Create or get Demo Project
  let projId: string = '';
  const { data: existingProjs } = await supabase
    .from('projects')
    .select('id, name')
    .eq('company_id', realCompanyId)
    .limit(10);

  const foundProj = (existingProjs || []).find((p: any) => 
    p.name.includes('Quartier') || p.name.includes('BAU') || p.name.includes('Bau') || p.name === projData.name
  ) || existingProjs?.[0];

  if (foundProj) {
    projId = foundProj.id;
  } else {
    const { data: newProj, error } = await supabase
      .from('projects')
      .insert({
        name: projData.name || 'Quartier Neubau Süd',
        description: projData.description || 'Zentrale Bauleitung, Mängelmanagement und Budgetkontrolle für das Wohnquartier.',
        status: 'active',
        company_id: realCompanyId,
        owner_id: ownerId,
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

function getDeterministicUUID(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(12, '0').slice(0, 12);
  return `00000000-0000-4000-8000-${hex}`;
}

  // 2. Seed Demo Team Members & Profiles (Avatars)
  if (Array.isArray(template.members)) {
    for (const m of template.members) {
      const demoUserId = getDeterministicUUID(m.name || m.email || 'demo_user');

      // Ensure profile exists with photoURL / avatar
      try {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', demoUserId)
          .maybeSingle();

        if (!existingProfile) {
          await supabase.from('profiles').insert({
            id: demoUserId,
            email: m.email,
            name: m.name,
            role: 'member',
            company_id: realCompanyId,
            photo_url: m.photoURL || '',
            created_at: new Date().toISOString()
          });
        }

        // Add to project_members
        const { data: existingMem } = await supabase
          .from('project_members')
          .select('id')
          .eq('company_id', realCompanyId)
          .eq('project_id', projId)
          .eq('user_id', demoUserId)
          .maybeSingle();

        if (!existingMem) {
          await supabase.from('project_members').insert({
            project_id: projId,
            user_id: demoUserId,
            company_id: realCompanyId
          });
        }
      } catch (e) {
        console.warn('Demo member seed fallback handled:', e);
      }
    }
  }

  // 3. Seed Demo Documents & CAD Plans
  if (Array.isArray(template.documents)) {
    for (const doc of template.documents) {
      const { data: existingDoc } = await supabase
        .from('documents')
        .select('id')
        .eq('company_id', realCompanyId)
        .eq('project_id', projId)
        .eq('name', doc.name)
        .maybeSingle();

      if (!existingDoc) {
        await supabase.from('documents').insert({
          company_id: realCompanyId,
          project_id: projId,
          owner_id: ownerId,
          uploaded_by: ownerId,
          name: doc.name,
          category: 'projects',
          url: doc.url,
          file_url: doc.url,
          size: doc.size || '780 KB',
          type: doc.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
          folder_id: 'root',
          is_folder: false,
          created_at: new Date().toISOString(),
          uploaded_at: new Date().toISOString()
        });
      }
    }
  }

  try {
    const { data: existingCad } = await supabase
      .from('cad_plans')
      .select('id')
      .eq('company_id', realCompanyId)
      .eq('project_id', projId)
      .maybeSingle();

    if (!existingCad) {
      await supabase.from('cad_plans').insert({
        project_id: projId,
        company_id: realCompanyId,
        plan_name: 'Grundriss EG - Architektur & Tragwerk',
        plan_image: '/demo-assets/bau_pitch_render.jpg',
        paper_format: 'A3',
        paper_orientation: 'landscape',
        plan_scale: 50,
        elements: [],
        layers: [{ id: 'default', name: 'Standard-Ebene', visible: true, locked: false, opacity: 1 }],
        active_layer_id: 'default',
        created_at: new Date().toISOString()
      });
    }
  } catch (e) {
    console.warn('CAD plan seed fallback handled:', e);
  }

  // 4. Seed Defects
  if (Array.isArray(template.defects)) {
    for (const def of template.defects) {
      const { data: existingDef } = await supabase
        .from('defects')
        .select('id')
        .eq('company_id', realCompanyId)
        .eq('project_id', projId)
        .eq('prompt', def.title)
        .maybeSingle();

      if (!existingDef) {
        await supabase.from('defects').insert({
          project_id: projId,
          company_id: realCompanyId,
          owner_id: ownerId,
          title: def.title,
          prompt: def.title,
          description: def.description,
          status: def.status || 'Offen',
          severity: def.priority || 'High',
          priority: def.priority || 'High',
          position: { x: 0, y: 1.5, z: 0 },
          created_at: new Date().toISOString()
        });
      }
    }
  }

  // 5. Seed Transactions & Time Entries
  const demoTxs = generateDemoTransactions(template.financeGroups || [], projId, realCompanyId, ownerId);
  for (const tx of demoTxs) {
    const { data: existingTx } = await supabase
      .from('transactions')
      .select('id')
      .eq('company_id', realCompanyId)
      .eq('project_id', projId)
      .eq('description', tx.description)
      .maybeSingle();

    if (!existingTx) {
      await supabase.from('transactions').insert(tx);
    }
  }

  if (Array.isArray(template.timeEntries)) {
    for (const te of template.timeEntries) {
      const { data: existingTe } = await supabase
        .from('time_entries')
        .select('id')
        .eq('company_id', realCompanyId)
        .eq('project_id', projId)
        .eq('description', te.description)
        .maybeSingle();

      if (!existingTe) {
        await supabase.from('time_entries').insert({
          company_id: realCompanyId,
          project_id: projId,
          owner_id: ownerId,
          user_id: ownerId,
          description: te.description,
          hours: te.hours,
          hourly_rate: te.hourlyRate || 150,
          date: te.date || new Date().toISOString().split('T')[0],
          is_billable: true,
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
        .eq('company_id', realCompanyId)
        .eq('project_id', projId)
        .eq('title', s.title)
        .maybeSingle();

      if (!existingSlide) {
        await supabase.from('slides').insert({
          project_id: projId,
          company_id: realCompanyId,
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

  // 7. Seed Schedule (Terminplan) to system_config
  const scheduleConfigId = `schedule_${projId}`;
  const { data: existingSchedule } = await supabase
    .from('system_config')
    .select('id')
    .eq('id', scheduleConfigId)
    .maybeSingle();

  if (!existingSchedule) {
    const today = new Date();
    let mappedTasks: any[] = [];
    if (Array.isArray(template.tasks)) {
      mappedTasks = template.tasks.map((t: any) => {
        const start = new Date(today); start.setDate(start.getDate() + (t.daysOffsetStart || 0) - 20);
        const end = new Date(today); end.setDate(end.getDate() + (t.daysOffsetEnd || 30) - 20);
        return {
          id: t.id,
          title: t.title,
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
          color: t.color,
          status: t.status || 'in_planning'
        };
      });
    }
    let mappedMarkers: any[] = [];
    if (Array.isArray(template.smartMarkers)) {
      mappedMarkers = template.smartMarkers.map((m: any) => {
        const date = new Date(today); date.setDate(date.getDate() + (m.daysOffset || 0) - 20);
        return {
          id: m.id,
          date: date.toISOString().split('T')[0],
          label: m.title || m.label,
          color: m.color,
          style: m.style || 'solid'
        };
      });
    }
    const demoSchedule = {
      id: `s-${projId}`,
      name: projData.name || 'Masterplan Bau',
      targetYear: today.getFullYear(),
      ganttTasks: mappedTasks,
      smartMarkers: mappedMarkers,
      shapes: []
    };
    const schedPayload = {
      schedules: [demoSchedule],
      activeScheduleId: demoSchedule.id,
      companyId: realCompanyId,
      projectId: projId
    };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`schedule_cache_${projId}`, JSON.stringify(schedPayload));
    }
    try {
      await supabase.from('system_config').upsert({
        id: scheduleConfigId,
        data: schedPayload
      });
    } catch (e) {}
  }

  // 8. Seed Finance (Budgetplan) to system_config
  const financeConfigId = `finance_${projId}`;
  let existingFinance: any = null;
  try {
    const res = await supabase
      .from('system_config')
      .select('*')
      .eq('id', financeConfigId)
      .maybeSingle();
    existingFinance = res.data;
  } catch (e) {}

  const existingGroups = (existingFinance as any)?.data?.versions?.[0]?.groups || existingFinance?.versions?.[0]?.groups;
  const hasGroups = Array.isArray(existingGroups) && existingGroups.length > 0;

  if ((!existingFinance || !hasGroups) && Array.isArray(template.financeGroups)) {
    const demoVersion = {
      id: `v-approved-${projId}`,
      name: 'Originalbudget',
      vatRate: 8.1,
      status: 'approved',
      groups: template.financeGroups
    };
    const finPayload = {
      versions: [demoVersion],
      activeVersionId: demoVersion.id,
      projectHeader: {
        project: projData.name || 'Quartier Neubau Süd',
        client: 'Bauherrschaft AG',
        date: new Date().toISOString().split('T')[0],
        version: 'Originalbudget'
      },
      includeOptions: false,
      ownerId: ownerId,
      companyId: realCompanyId,
      projectId: projId
    };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`finance_cache_${projId}`, JSON.stringify(finPayload));
    }
    try {
      await supabase.from('system_config').upsert({
        id: financeConfigId,
        data: finPayload
      });
    } catch (e) {}
  }

  return projId;
}

export async function purgeAllDummyData(companyId: string) {
  if (!companyId) return;

  try {
    // Delete auto-seeded dummy transactions
    await supabase
      .from('transactions')
      .delete()
      .eq('company_id', companyId)
      .or('description.ilike.%Akontozahlung%,description.ilike.%Teilrechnung%,description.ilike.%Demobuchung%');

    // Find and delete demo project "Quartier Neubau Süd" if auto-created
    const { data: demoProjs } = await supabase
      .from('projects')
      .select('id')
      .eq('company_id', companyId)
      .eq('name', 'Quartier Neubau Süd');

    if (demoProjs && demoProjs.length > 0) {
      for (const p of demoProjs) {
        await supabase.from('transactions').delete().eq('project_id', p.id);
        await supabase.from('defects').delete().eq('project_id', p.id);
        await supabase.from('time_entries').delete().eq('project_id', p.id);
        await supabase.from('slides').delete().eq('project_id', p.id);
        await supabase.from('project_members').delete().eq('project_id', p.id);
        await supabase.from('projects').delete().eq('id', p.id);
        await supabase.from('system_config').delete().eq('id', `finance_${p.id}`);
        await supabase.from('system_config').delete().eq('id', `schedule_${p.id}`);
      }
    }

    // Delete demo user profiles
    await supabase.from('profiles').delete().eq('company_id', companyId).like('id', 'demo_user_%');
  } catch (err) {
    console.error('Error purging dummy data:', err);
  }
}

