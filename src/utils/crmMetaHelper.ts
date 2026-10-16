/**
 * Zentrale Abstraktion für CRM-Zusatzfelder auf `public.company_users`.
 *
 * Unterstützt sowohl echte PostgreSQL-Spalten (`department`, `hourly_rate`, `trade`,
 * `job_title`, `workload`, `project_roles`, `assigned_projects`, `documents`, etc.)
 * als auch den rückwärtskompatiblen `__CRM_META__:` JSON-Block im Feld `notes`.
 */

import type { Database } from '../types/database.types';

export type CompanyUserUpdate = Database['public']['Tables']['company_users']['Update'];

export interface CrmMetaFields {
  department?: string | null;
  hourlyRate?: number | string | null;
  trade?: string | null;
  jobTitle?: string | null;
  workload?: string | null;
  initials?: string | null;
  partnerCategory?: string | null;
  contactPersonRole?: string | null;
  paymentTerms?: string | null;
  assignedProjectId?: string | null;
  projectRoles?: Record<string, string>;
  assignedProjects?: any[];
  documents?: any[];
  [key: string]: any;
}

export const CRM_META_DELIMITER = '__CRM_META__:';

/**
 * Extrahiert den bereinigten Notiztext sowie das strukturierte CRM-Metadaten-Objekt
 * aus einem `notes`-String oder einem kompletten `company_users`-Datensatz.
 * Echte SQL-Spalten haben Vorrang vor Werten im `__CRM_META__`-Block.
 */
export function parseCrmMeta(rowOrNotes: any): { cleanNotes: string; meta: CrmMetaFields } {
  const isObject = rowOrNotes !== null && typeof rowOrNotes === 'object';
  const rawNotes: string = isObject
    ? String(rowOrNotes.notes ?? rowOrNotes.description ?? '')
    : String(rowOrNotes ?? '');

  let cleanNotes = rawNotes;
  let parsedJson: Record<string, any> = {};

  if (rawNotes && rawNotes.includes(CRM_META_DELIMITER)) {
    const parts = rawNotes.split(CRM_META_DELIMITER);
    cleanNotes = (parts[0] || '').trim();
    const jsonPart = parts.slice(1).join(CRM_META_DELIMITER).trim();
    if (jsonPart) {
      try {
        const parsed = JSON.parse(jsonPart);
        if (parsed && typeof parsed === 'object') {
          parsedJson = parsed;
        }
      } catch {
        // Fallback: falls nach dem JSON noch Text folgt, erste geschweifte Klammer extrahieren
        const match = jsonPart.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            parsedJson = JSON.parse(match[0]);
          } catch {
            // Ignorieren bei defektem JSON
          }
        }
      }
    }
  }

  if (!isObject) {
    return { cleanNotes, meta: parsedJson };
  }

  const row = rowOrNotes;
  const sqlHourlyRate =
    row.hourly_rate !== undefined && row.hourly_rate !== null && row.hourly_rate !== ''
      ? Number(row.hourly_rate)
      : undefined;

  const meta: CrmMetaFields = {
    ...parsedJson,
    department: row.department || parsedJson.department || undefined,
    hourlyRate:
      sqlHourlyRate !== undefined && !Number.isNaN(sqlHourlyRate) && sqlHourlyRate > 0
        ? sqlHourlyRate
        : parsedJson.hourlyRate ?? sqlHourlyRate ?? undefined,
    trade: row.trade || parsedJson.trade || undefined,
    jobTitle: row.job_title || parsedJson.jobTitle || undefined,
    workload: row.workload || parsedJson.workload || undefined,
    initials: row.initials || parsedJson.initials || undefined,
    partnerCategory: row.partner_category || parsedJson.partnerCategory || undefined,
    contactPersonRole: row.contact_person_role || parsedJson.contactPersonRole || undefined,
    paymentTerms: row.payment_terms || parsedJson.paymentTerms || undefined,
    assignedProjectId: row.project_id || parsedJson.assignedProjectId || undefined,
    projectRoles:
      row.project_roles && typeof row.project_roles === 'object' && Object.keys(row.project_roles).length > 0
        ? { ...(parsedJson.projectRoles || {}), ...row.project_roles }
        : parsedJson.projectRoles || {},
    assignedProjects:
      Array.isArray(row.assigned_projects) && row.assigned_projects.length > 0
        ? row.assigned_projects
        : Array.isArray(parsedJson.assignedProjects)
        ? parsedJson.assignedProjects
        : undefined,
    documents:
      Array.isArray(row.documents) && row.documents.length > 0
        ? row.documents
        : Array.isArray(parsedJson.documents)
        ? parsedJson.documents
        : undefined
  };

  return { cleanNotes, meta };
}

/**
 * Erzeugt den kombinierten `notes`-String aus Freitext und `__CRM_META__`-JSON.
 */
export function serializeCrmNotes(cleanText: string | null | undefined, meta: CrmMetaFields): string {
  const trimmedText = (cleanText || '').split(CRM_META_DELIMITER)[0].trim();
  const serializedMeta = `${CRM_META_DELIMITER}${JSON.stringify(meta)}`;
  return trimmedText ? `${trimmedText}\n\n${serializedMeta}` : serializedMeta;
}

/**
 * Aktualisiert bestehende `notes` (oder einen `company_users`-Datensatz) mit neuen Metadaten-Feldern.
 */
export function mergeCrmNotes(existingRowOrNotes: any, metaPatch: Partial<CrmMetaFields>, overrideCleanText?: string): string {
  const { cleanNotes, meta } = parseCrmMeta(existingRowOrNotes);
  const mergedProjectRoles = {
    ...(meta.projectRoles || {}),
    ...(metaPatch.projectRoles || {})
  };
  const nextMeta: CrmMetaFields = {
    ...meta,
    ...metaPatch
  };
  if (Object.keys(mergedProjectRoles).length > 0 || metaPatch.projectRoles) {
    nextMeta.projectRoles = mergedProjectRoles;
  }
  const finalCleanText = overrideCleanText !== undefined ? overrideCleanText : cleanNotes;
  return serializeCrmNotes(finalCleanText, nextMeta);
}

/**
 * Übersetzt `CrmMetaFields` in die nativen PostgreSQL-Spaltennamen von `public.company_users`.
 */
export function buildNativeCrmColumns(meta: Partial<CrmMetaFields>): CompanyUserUpdate {
  const cols: CompanyUserUpdate = {};
  if (meta.department !== undefined) cols.department = meta.department || null;
  if (meta.hourlyRate !== undefined) {
    const parsedRate = Number(meta.hourlyRate);
    cols.hourly_rate = !Number.isNaN(parsedRate) ? parsedRate : 0;
  }
  if (meta.trade !== undefined) cols.trade = meta.trade || null;
  if (meta.jobTitle !== undefined) cols.job_title = meta.jobTitle || null;
  if (meta.workload !== undefined) cols.workload = meta.workload || null;
  if (meta.initials !== undefined) cols.initials = meta.initials || null;
  if (meta.partnerCategory !== undefined) cols.partner_category = meta.partnerCategory || null;
  if (meta.contactPersonRole !== undefined) cols.contact_person_role = meta.contactPersonRole || null;
  if (meta.paymentTerms !== undefined) cols.payment_terms = meta.paymentTerms || null;
  if (meta.projectRoles !== undefined) cols.project_roles = meta.projectRoles || {};
  if (meta.assignedProjects !== undefined) cols.assigned_projects = meta.assignedProjects || [];
  if (meta.documents !== undefined) cols.documents = meta.documents || [];
  return cols;
}
