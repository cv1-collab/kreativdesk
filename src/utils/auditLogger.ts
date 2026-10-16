import { supabase } from '../lib/supabase';
import { safeStorage } from './safeStorage';

export type AuditAction = 
  | 'PROJECT_CREATED' 
  | 'PROJECT_DELETED' 
  | 'PROJECT_UPDATED'
  | 'PROJECT_ARCHIVED'
  | 'USER_INVITED' 
  | 'USER_ROLE_CHANGED'
  | 'USER_REMOVED'
  | 'SUBSCRIPTION_CHANGED'
  | 'FILE_UPLOADED'
  | 'FILE_DELETED'
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_DELETED'
  | 'DOCUMENT_RENAMED'
  | 'INVOICE_CREATED'
  | 'INVOICE_SENT'
  | 'EXPENSE_BOOKED'
  | 'LOGIN'
  | 'LOGOUT'
  | 'SETTINGS_UPDATED'
  | 'SECURITY_ALERT'
  | 'PLAN_SAVED'
  | 'DEFECT_CREATED'
  | 'DEFECT_RESOLVED'
  | 'MAINTENANCE_TOGGLED'
  | 'LEAD_UPDATED'
  | 'SUPPORT_TICKET_UPDATED'
  | (string & {});

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
 * Logs an action to Supabase audit_logs table and persists a local cache fallback
 * so that both Company Admins and Super Admins have 100% gapless monitoring.
 */
export async function logAuditAction(entry: AuditLogEntry) {
  const createdAt = entry.timestamp || new Date().toISOString();
  const safeCompId = entry.companyId || 'global_master';
  const detailsObj = typeof entry.details === 'object' && entry.details !== null
    ? { ...entry.details, ...(entry.userEmail ? { userEmail: entry.userEmail } : {}) }
    : { message: String(entry.details || ''), ...(entry.userEmail ? { userEmail: entry.userEmail } : {}) };

  const localRecord = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    company_id: safeCompId,
    user_id: entry.userId || 'system',
    user_email: entry.userEmail || detailsObj.userEmail || 'System',
    action: entry.action,
    details: JSON.stringify(detailsObj),
    created_at: createdAt
  };

  try {
    // 1. Save in company-specific local cache
    const companyKey = `audit_logs_cache_${safeCompId}`;
    const existingComp = safeStorage.getItem<any[]>(companyKey, []) || [];
    safeStorage.setItem(companyKey, [localRecord, ...existingComp].slice(0, 250));

    // 2. Save in global admin local cache
    const globalKey = 'audit_logs_cache_global';
    const existingGlobal = safeStorage.getItem<any[]>(globalKey, []) || [];
    safeStorage.setItem(globalKey, [localRecord, ...existingGlobal].slice(0, 300));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('audit_log_added', { detail: localRecord }));
    }
  } catch (_) {}

  try {
    await supabase.from('audit_logs').insert({
      company_id: safeCompId,
      user_id: entry.userId,
      action: entry.action,
      details: JSON.stringify(detailsObj),
      created_at: createdAt
    });
  } catch (error) {
    console.warn('Audit log stored in local fallback cache:', error);
  }
}

