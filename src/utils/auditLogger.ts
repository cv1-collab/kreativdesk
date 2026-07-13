import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

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
  resourceId?: string; // e.g., projectId or documentId
}

/**
 * Logs an action to the auditLogs collection for compliance and governance.
 */
export async function logAuditAction(entry: AuditLogEntry) {
  try {
    if (!db) return;
    const auditRef = collection(db, 'auditLogs');
    await addDoc(auditRef, {
      ...entry,
      timestamp: entry.timestamp || new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
