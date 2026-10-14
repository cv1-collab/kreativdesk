import { supabase } from '../lib/supabase';
import { safeStorage } from './safeStorage';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (v?: string | null): boolean => Boolean(v && UUID_REGEX.test(v));

export async function fetchSystemConfigJSON<T = any>(configKey: string, companyId: string = 'global'): Promise<T | null> {
  try {
    const validCompanyId = isUuid(companyId) ? companyId : null;
    let query = supabase
      .from('documents')
      .select('url, file_url, company_id')
      .eq('category', 'system_config')
      .eq('name', configKey)
      .order('uploaded_at', { ascending: false })
      .limit(1);

    if (validCompanyId) {
      query = query.eq('company_id', validCompanyId);
    } else if (companyId === 'global') {
      query = query.is('company_id', null);
    }

    const { data: rows } = await query;
    let doc = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

    // Legacy fallback if document was previously saved without company_id filter
    if (!doc && ((validCompanyId && configKey.includes(validCompanyId)) || companyId === 'global')) {
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

    const validCompanyId = isUuid(companyId) ? companyId : null;
    const validOwnerId = isUuid(ownerId) ? ownerId : null;
    if (!validCompanyId && companyId !== 'global') {
      return;
    }

    let findQuery = supabase
      .from('documents')
      .select('id')
      .eq('category', 'system_config')
      .eq('name', configKey);

    if (validCompanyId) {
      findQuery = findQuery.eq('company_id', validCompanyId);
    } else if (companyId === 'global') {
      findQuery = findQuery.is('company_id', null);
    }

    const { data: existingRows } = await findQuery
      .order('uploaded_at', { ascending: false })
      .limit(1);
    const existingDoc = Array.isArray(existingRows) && existingRows.length > 0 ? existingRows[0] : null;

    if (existingDoc?.id) {
      await supabase.from('documents').update({
        company_id: validCompanyId,
        url: payloadStr,
        file_url: payloadStr,
        uploaded_at: new Date().toISOString()
      }).eq('id', existingDoc.id);
    } else {
      await supabase.from('documents').insert({
        company_id: validCompanyId,
        project_id: null,
        owner_id: validOwnerId,
        uploaded_by: validOwnerId,
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
