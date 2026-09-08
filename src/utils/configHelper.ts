import { supabase } from '../lib/supabase';
import { safeStorage } from './safeStorage';

export async function fetchSystemConfigJSON<T = any>(configKey: string, companyId: string = 'global'): Promise<T | null> {
  try {
    const { data: doc } = await supabase
      .from('documents')
      .select('url, file_url')
      .eq('category', 'system_config')
      .eq('name', configKey)
      .maybeSingle();

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

    const { data: existingDoc } = await supabase
      .from('documents')
      .select('id')
      .eq('category', 'system_config')
      .eq('name', configKey)
      .maybeSingle();

    if (existingDoc?.id) {
      await supabase.from('documents').update({
        url: payloadStr,
        file_url: payloadStr,
        uploaded_at: new Date().toISOString()
      }).eq('id', existingDoc.id);
    } else {
      await supabase.from('documents').insert({
        company_id: companyId,
        project_id: 'global',
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
