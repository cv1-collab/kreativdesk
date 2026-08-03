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
    await supabase.from('audit_logs').insert({
      company_id: entry.companyId,
      user_id: entry.userId,
      user_email: entry.userEmail,
      action: entry.action,
      details: typeof entry.details === 'object' ? JSON.stringify(entry.details) : entry.details,
      created_at: entry.timestamp || new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
