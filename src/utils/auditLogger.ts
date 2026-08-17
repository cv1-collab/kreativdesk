import { supabase } from '../lib/supabase';

export type AuditAction = 
  | 'PROJECT_CREATED' 
  | 'PROJECT_DELETED' 
  | 'USER_INVITED' 
  | 'USER_REMOVED'
  | 'SUBSCRIPTION_CHANGED'
  | 'FILE_UPLOADED'
  | 'FILE_DELETED';

export interface AuditLogEntry {
  companyId: string;
  userId: string;
  userEmail?: string;
  action: AuditAction;
  details: string | any;
  timestamp?: string;
  resourceId?: string;
}

/**
 * Logs an action to Supabase audit_logs table.
 */
export async function logAuditAction(entry: AuditLogEntry) {
  try {
    const detailsObj = typeof entry.details === 'object' 
      ? { ...entry.details, userEmail: entry.userEmail }
      : { message: entry.details, userEmail: entry.userEmail };

    await supabase.from('audit_logs').insert({
      company_id: entry.companyId,
      user_id: entry.userId,
      action: entry.action,
      details: JSON.stringify(detailsObj),
      created_at: entry.timestamp || new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
