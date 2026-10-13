import { supabase } from '../lib/supabase';
import { safeStorage } from './safeStorage';

export async function fetchSystemConfigJSON<T = any>(configKey: string, companyId: string = 'global'): Promise<T | null> {
  try {
    let query = supabase
      .from('documents')
      .select('url, file_url, company_id')
      .eq('category', 'system_config')
      .eq('name', configKey)
      .order('uploaded_at', { ascending: false })
      .limit(1);

    if (companyId && companyId !== 'global') {
      query = query.eq('company_id', companyId);
    }

    let { data: rows } = await query;
    let doc = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

    // Legacy fallback if document was previously saved without company_id filter
    if (!doc && companyId && companyId !== 'global' && configKey.includes(companyId)) {
      const { data: legacyRows } = await supabase
        .from('documents')
        .select('url, file_url, company_id')
        .eq('category', 'system_config')
        .eq('name', configKey)
        .order('uploaded_at', { ascending: false })
        .limit(1);
      doc = Array.isArray(legacyRows) && legacyRows.length > 0 ? legacyRows[0] : null;
    }

    if (doc?.file_url || doc?.url) {
      try {
        return JSON.parse(doc.file_url || doc.url) as T;
      } catch (parseErr) {
        console.warn(`[configHelper] Failed to parse document JSON for ${configKey}:`, parseErr);
      }
    }

    // Fallback check localStorage
    return safeStorage.getItem<T | null>(`sys_cfg_${configKey}`, null);
  } catch (e) {
    console.warn(`[configHelper] Error reading config ${configKey}:`, e);
    return null;
  }
}

export async function saveSystemConfigJSON(configKey: string, payload: any, companyId: string = 'global', ownerId: string = 'global'): Promise<void> {
  try {
    const payloadStr = JSON.stringify(payload);
    safeStorage.setItem(`sys_cfg_${configKey}`, payloadStr);

    let findQuery = supabase
      .from('documents')
      .select('id')
      .eq('category', 'system_config')
      .eq('name', configKey)
      .order('uploaded_at', { ascending: false })
      .limit(1);

    if (companyId && companyId !== 'global') {
      findQuery = findQuery.eq('company_id', companyId);
    }

    const { data: existingRows } = await findQuery;
    const existingDoc = Array.isArray(existingRows) && existingRows.length > 0 ? existingRows[0] : null;

    if (existingDoc?.id) {
      await supabase.from('documents').update({
        company_id: companyId,
        url: payloadStr,
        file_url: payloadStr,
        uploaded_at: new Date().toISOString()
      }).eq('id', existingDoc.id);
    } else {
      await supabase.from('documents').insert({
        company_id: companyId,
        project_id: null,
        owner_id: ownerId,
        uploaded_by: ownerId,
        category: 'system_config',
        name: configKey,
        folder_id: 'root',
        is_folder: false,
        url: payloadStr,
        file_url: payloadStr,
        type: 'application/json'
      });
    }
  } catch (e) {
    console.warn(`[configHelper] Error saving config ${configKey}:`, e);
  }
}
