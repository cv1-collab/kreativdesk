import { checkIsSuperAdmin } from '../config/admins';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { jsPDF } from 'jspdf';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import { useToast } from '../contexts/ToastContext';
import { 
  Users, Mail, Building, Phone, Shield, 
  Search, UserPlus, CheckCircle2, ShieldAlert,
  X, Loader2, FileUp, Camera, Smartphone, Globe, MapPin, FileText, Briefcase,
  Edit2, Trash2, Contact, Download, CheckSquare, ListChecks, PenTool, Image as ImageIcon, ZoomOut, ZoomIn, Cloud,
  Link as LinkIcon, Send, UserCheck, Copy,
  Building2, Hammer, Compass, Package, Landmark, Sparkles, Percent, DollarSign, Award, FolderKanban, ShieldCheck, UserCog, BadgePercent, Clock, Tag, User, Layers
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { cn, sanitizeUrl } from '../utils';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { usePermissions } from '../hooks/usePermissions';
import { logAuditAction } from '../utils/auditLogger';
import { offboardCompanyUser } from '../services/userService';
import { uploadFileWithFallback, uploadPdfBlobWithFallback } from '../utils/cloudStorageHelper';
import { callGeminiAPI } from '../utils/geminiClient';
import { safeStorage } from '../utils/safeStorage';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    smart_crm: 'CRM & Team', export_csv: 'Export CSV', export_pdf: 'PDF', cancel_selection: 'Cancel Selection',
    select: 'Select', vcf_import: 'VCF Import', new_contact: 'New Contact', search_contacts: 'Search contacts...',
    filter_all: 'All', filter_team: 'Team', filter_new_scanned: 'New Scanned', filter_leads: 'Leads',
    filter_partners: 'Partners', no_filter_results: 'No entries for this filter.', selected: 'selected',
    change_status: 'Change status...', mark_as_lead: 'Mark as Lead', mark_as_partner: 'Mark as Partner',
    status_new_scan: '🟢 New (Scan)', status_lead: '🟡 Lead', status_partner: '🟣 Partner', status_team: '🔵 Internal Team',
    edit_contact: 'Edit Contact', delete: 'Delete', contact_methods: 'Contact Methods', no_email: 'No Email',
    no_phone: 'No Phone', no_website: 'No Website', location_business: 'Location & Business', no_address_data: 'No address data',
    role_management_system: 'Role Management (System)', employee: 'Employee', management: 'Management', owner: 'Owner',
    owner_management: 'Owner / Management', mitarbeiter: 'Internal Employee', partner: 'Partner / Subcontractor', guest: 'Guest / Client', viewer: 'Viewer (Read-Only)',
    internal_notes: 'Internal Notes', selection_mode_active: 'Selection Mode Active', no_contact_selected: 'No Contact Selected',
    selection_mode_desc: 'Select contacts in the left list for mass actions.', no_contact_selected_desc: 'Select an entry on the left to edit details.',
    create_contact: 'Create Contact', profile_pic_logo: 'Profile Picture / Logo', click_to_upload: 'Click to upload',
    live_qr_scanner: 'Live QR Scanner', qr_scan_desc: 'Scan this code with your phone camera to capture a physical business card.',
    contact_type: 'Contact Type', internal_team: 'Internal (Team)', external_client_partner: 'External (Client / Partner)',
    first_name: 'First Name', last_name: 'Last Name', company: 'Company', email: 'Email', phone: 'Phone',
    street_number: 'Street & Number', zip_code: 'ZIP', city: 'City', website: 'Website', uid_number: 'UID Number',
    vat_number: 'VAT Number', cancel: 'Cancel', save_changes: 'Save Changes', save_contact: 'Save Contact',
    vcard_received: 'Business card data received from smartphone!', delete_user_confirm: 'Permanently delete this contact and free all assignments?',
    completed: 'completed', upload_failed: 'Action failed.', delete_failed: 'Failed to delete contact.', update_failed: 'Failed to update contact.', pdf_export_failed: 'Failed to export PDF.', save: 'Save', role: 'Role', name_or_company_required: 'Please provide a name or company.',
    unknown: 'Unknown', vcf_extracted: 'VCF data successfully extracted.', no_export_data: 'No data available to export.',
    select_external_to_delete: 'Please select external contacts to delete.', confirm_delete_multiple: 'contacts permanently?',
    contacts_deleted: 'contacts deleted.', contacts_updated: 'contacts updated.', no_company: 'No Company',
    export_pdf_title: 'PDF Studio', company_logo: 'Company Logo', upload_logo: 'Click to upload logo', logo_loaded: 'Logo loaded.',
    color: 'Accent Color', format: 'Format', orientation: 'Orientation', portrait: 'Portrait', landscape: 'Landscape',
    scale_preview: 'Scale Preview', saving_cloud: 'Saving to Cloud...', save_cloud: 'Save to Data Room', download_local: 'Download Locally',
    generating_pdf: 'Generating PDF...', pdf_exported: 'PDF successfully exported!', title: 'Title', project: 'Project',
    internal_team_title: 'Internal Team Member', internal_team_desc: 'Add an employee of your company with workspace permissions & rate.',
    external_partner_title: 'External Partner & Client', external_partner_desc: 'Add clients, planners, subcontractors, suppliers or authorities.',
    department: 'Department / Area', position_job: 'Position / Job Title', hourly_rate: 'Internal Hourly Rate (CHF/h)',
    workload: 'Workload / Pensum', employee_initials: 'Initials', partner_category: 'Partner Category',
    category_client: 'Client / Owner', category_planner: 'Specialist Planner', category_craftsman: 'Craftsman / Subcontractor',
    category_supplier: 'Supplier / Vendor', category_authority: 'Authority / Municipality', category_lead: 'Lead / Prospect',
    trade_field: 'Trade / Specialization', contact_person_function: 'Function of Contact Person', payment_terms: 'Payment Terms',
    assigned_project: 'Assigned Project', team_photo: 'Employee Photo', company_logo_label: 'Company / Partner Logo',
    role_employee_desc: 'Tasks, time tracking & site log', role_project_lead_desc: 'Full project management, budget & plans',
    role_owner_desc: 'Full access incl. company finance & settings', role_viewer_desc: 'Read-only access to assigned projects',
    no_project_assigned: 'No specific project assigned', workspace_access_hint: 'An invite link can be generated immediately after creation.',
    workspace_access_title: 'Workspace Access & Invite',
    date: 'Date',
    system_access_role: 'System Access Role'
  },
  de: {
    smart_crm: 'CRM & Team', export_csv: 'CSV Export', export_pdf: 'PDF', cancel_selection: 'Abbrechen',
    select: 'Auswählen', vcf_import: 'VCF Import', new_contact: 'Neuer Kontakt', search_contacts: 'Kontakte suchen...',
    filter_all: 'Alle', filter_team: 'Team', filter_new_scanned: 'Neu gescannt', filter_leads: 'Leads',
    filter_partners: 'Partner', no_filter_results: 'Keine Einträge für diesen Filter.', selected: 'markiert',
    change_status: 'Status ändern...', mark_as_lead: 'Als Lead markieren', mark_as_partner: 'Als Partner markieren',
    status_new_scan: '🟢 Neu (Scan)', status_lead: '🟡 Lead', status_partner: '🟣 Partner', status_team: '🔵 Internes Team',
    edit_contact: 'Kontakt bearbeiten', delete: 'Löschen', contact_methods: 'Kontaktwege', no_email: 'Keine E-Mail',
    no_phone: 'Keine Nummer', no_website: 'Keine Webseite', location_business: 'Standort & Business', no_address_data: 'Keine Adressdaten',
    role_management_system: 'Rollen-Verwaltung (System)', employee: 'Mitarbeiter', management: 'Management', owner: 'Owner',
    owner_management: 'Inhaber & Geschäftsleitung', mitarbeiter: 'Interner Mitarbeiter', partner: 'Partner / Fachplaner / Subunternehmer', guest: 'Gast / Kunde', viewer: 'Betrachter (Lesezugriff)',
    internal_notes: 'Interne Notizen', selection_mode_active: 'Auswahlmodus aktiv', no_contact_selected: 'Kein Kontakt ausgewählt',
    selection_mode_desc: 'Markiere Kontakte in der linken Liste für Massenaktionen.', no_contact_selected_desc: 'Wähle links einen Eintrag, um Details zu bearbeiten.',
    create_contact: 'Kontakt erfassen', profile_pic_logo: 'Profilbild / Logo', click_to_upload: 'Klicken zum Hochladen',
    live_qr_scanner: 'Live QR-Scanner', qr_scan_desc: 'Scanne diesen Code mit der Handy-Kamera, um eine physische Visitenkarte abzufotografieren.',
    contact_type: 'Kontakt-Typ', internal_team: 'Intern (Team)', external_client_partner: 'Extern (Kunde / Partner)',
    first_name: 'Vorname', last_name: 'Nachname', company: 'Firma', email: 'E-Mail', phone: 'Telefon',
    street_number: 'Straße & Hausnummer', zip_code: 'PLZ', city: 'Ort', website: 'Webseite', uid_number: 'UID-Nummer',
    vat_number: 'MwSt.-Nummer', cancel: 'Abbrechen', save_changes: 'Änderungen speichern', save_contact: 'Kontakt speichern',
    vcard_received: 'Visitenkarten-Daten vom Smartphone empfangen!', delete_user_confirm: 'Diesen Kontakt wirklich unwiderruflich löschen und alle Verknüpfungen freigeben?',
    completed: 'erfolgreich', upload_failed: 'Aktion fehlgeschlagen.', delete_failed: 'Fehler beim Löschen des Kontakts.', update_failed: 'Fehler beim Aktualisieren.', pdf_export_failed: 'Fehler beim Exportieren des PDFs.', save: 'Speichern', role: 'Rolle', name_or_company_required: 'Bitte Name oder Firma angeben.',
    unknown: 'Unbekannt', vcf_extracted: 'VCF Daten erfolgreich extrahiert.', no_export_data: 'Keine Daten zum Exportieren vorhanden.',
    select_external_to_delete: 'Bitte wähle externe Kontakte zum Löschen aus.', confirm_delete_multiple: 'Kontakte unwiderruflich löschen?',
    contacts_deleted: 'Kontakte gelöscht.', contacts_updated: 'Kontakte aktualisiert.', no_company: 'Keine Firma',
    export_pdf_title: 'PDF Studio', company_logo: 'Firmenlogo für PDF', upload_logo: 'Klicken um Bild hochzuladen', logo_loaded: 'Logo geladen.',
    color: 'Akzentfarbe', format: 'Format', orientation: 'Ausrichtung', portrait: 'Hochformat', landscape: 'Querformat',
    scale_preview: 'Zoom Vorschau', saving_cloud: 'Speichert in Cloud...', save_cloud: 'In Bau-Akte speichern', download_local: 'Lokal herunterladen',
    generating_pdf: 'Wird erstellt...', pdf_exported: 'PDF erfolgreich exportiert!', title: 'Titel', project: 'Projekt',
    internal_team_title: 'Internes Teammitglied', internal_team_desc: 'Mitarbeiter deines Unternehmens mit Workspace-Zugriffsrechten & Stundensatz erfassen.',
    external_partner_title: 'Externer Partner & Kunde', external_partner_desc: 'Kunden, Fachplaner, Handwerker, Lieferanten oder Behörden für Projekte erfassen.',
    department: 'Abteilung / Bereich', position_job: 'Position / Job-Titel', hourly_rate: 'Interner Stundensatz (CHF/h)',
    workload: 'Beschäftigungsgrad / Pensum', employee_initials: 'Kürzel (Initialen)', partner_category: 'Partner-Kategorie',
    category_client: 'Kunde / Bauherr', category_planner: 'Fachplaner', category_craftsman: 'Handwerker / Subunternehmer',
    category_supplier: 'Lieferant / Händler', category_authority: 'Behörde / Gemeinde', category_lead: 'Lead / Interessent',
    trade_field: 'Gewerk / Spezialisierung', contact_person_function: 'Funktion der Ansprechperson', payment_terms: 'Zahlungskonditionen',
    assigned_project: 'Zugeordnetes Projekt', team_photo: 'Mitarbeiterfoto', company_logo_label: 'Firmen-Logo / Partner',
    role_employee_desc: 'Aufgaben, Zeiterfassung & Bautagebuch', role_project_lead_desc: 'Volle Projektleitung, Budget & Pläne',
    role_owner_desc: 'Vollzugriff inkl. Finanzen & Einstellungen', role_viewer_desc: 'Nur Lesezugriff auf zugewiesene Projekte',
    no_project_assigned: 'Keinem spezifischen Projekt zugewiesen', workspace_access_hint: 'Nach dem Erfassen kann direkt ein Einladungslink generiert werden.',
    workspace_access_title: 'Workspace-Zugang & Berechtigungen',
    date: 'Datum',
    system_access_role: 'System-Zugriffsrolle'
  }
};

interface TeamCrmTabProps {
  companyUsers: any[];
  userRole?: string;
}

const safeStr = (str: any, maxLen: number) => {
  if (!str) return '-';
  return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
};

export default function TeamCrmTab({ companyUsers, userRole }: TeamCrmTabProps) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { fetchCompanyUsers, isDemoMode, projects = [], activeProjectId } = useProject() as any;
  const isDemo = isDemoMode || currentUser?.uid === 'demo-user-id';
  const { language, t: globalT } = useLanguage();
  const { hasPermission } = usePermissions();

  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;
  
  const [activeFilter, setActiveFilter] = useState<'alle' | 'team' | 'neu' | 'lead' | 'partner'>('alle');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [realUsers, setRealUsers] = useState<any[]>([]);
  const [crmUsers, setCrmUsers] = useState<any[]>([]);

  // Email Invite Modal States (DE & EN, Internal & External)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteModalContact, setInviteModalContact] = useState<any>(null);
  const [inviteModalUrl, setInviteModalUrl] = useState('');
  const [inviteModalLang, setInviteModalLang] = useState<'de' | 'en'>('de');
  const [inviteModalType, setInviteModalType] = useState<'internal' | 'external'>('internal');

  const fetchAllContacts = useCallback(async () => {
    if (!currentUser || !currentUser.uid) return;
    let profilesData: any[] = [];
    const companyId = currentUser.companyId;

    if (companyId) {
      const { data } = await supabase.from('profiles').select('*').eq('company_id', companyId);
      profilesData = data || [];
    }

    if (!profilesData.some(p => p.id === currentUser.uid)) {
      const { data: myProfile } = await supabase.from('profiles').select('*').eq('id', currentUser.uid).maybeSingle();
      if (myProfile) {
        profilesData.push(myProfile);
      }
    }

    const safeCompanyId = companyId || currentUser.uid;
    const { data: crmData } = await supabase.from('company_users').select('*').eq('company_id', safeCompanyId);
    
    // Fallback local metadata if Postgres columns are still being migrated
    const localCrmCache: Record<string, any> = safeStorage.getItem<Record<string, any>>(`crm_metadata_${safeCompanyId}`, {});

    const mappedCrm = (crmData || []).map((u: any) => {
      const fallback = localCrmCache[u.id] || (u.email ? localCrmCache[u.email] : null) || {};
      const fullName = u.name || [u.first_name, u.last_name].filter(Boolean).join(' ') || fallback.name || u.email || 'Kontakt';
      const isExternalVal = u.is_external !== undefined && u.is_external !== null
        ? u.is_external
        : (fallback.isExternal !== undefined
            ? fallback.isExternal
            : (u.role === 'partner' || u.role === 'client' || u.role === 'guest' || u.role === 'external' || (u.status && u.status !== 'team')));

      let extraMeta: any = {};
      let cleanNotes = u.notes || u.description || fallback.description || '';
      if (cleanNotes && cleanNotes.includes('__CRM_META__:')) {
        try {
          const parts = cleanNotes.split('__CRM_META__:');
          extraMeta = JSON.parse(parts[1]);
          cleanNotes = parts[0].trim();
        } catch (_) {}
      }

      return {
        id: u.id,
        firstName: u.first_name || u.firstName || fallback.firstName || fullName.split(' ')[0] || '',
        lastName: u.last_name || u.lastName || fallback.lastName || fullName.split(' ').slice(1).join(' ') || '',
        name: fullName,
        email: u.email || fallback.email || '',
        phone: u.phone || fallback.phone || '',
        company: u.company || fallback.company || '',
        street: u.street || fallback.street || '',
        zipCity: u.zip_city || u.zipCity || fallback.zipCity || '',
        website: u.website || fallback.website || '',
        uid: u.uid_number || u.uid || fallback.uid || '',
        vat: u.vat_number || u.vat || fallback.vat || '',
        description: cleanNotes,
        photoURL: u.photo_url || u.photoURL || fallback.photoURL || null,
        status: u.status || fallback.status || (isExternalVal ? 'neu' : 'team'),
        role: u.role || fallback.role || (isExternalVal ? 'partner' : 'employee'),
        isExternal: Boolean(isExternalVal),
        isAppUser: false,
        canViewFinance: u.can_view_finance ?? fallback.canViewFinance ?? false,
        canApproveBudget: u.can_approve_budget ?? fallback.canApproveBudget ?? false,
        jobTitle: u.job_title || extraMeta.jobTitle || fallback.jobTitle || '',
        department: u.department || extraMeta.department || fallback.department || '',
        hourlyRate: u.hourly_rate || extraMeta.hourlyRate || fallback.hourlyRate || '',
        workload: u.workload || extraMeta.workload || fallback.workload || '100%',
        initials: u.initials || extraMeta.initials || fallback.initials || '',
        partnerCategory: u.partner_category || extraMeta.partnerCategory || fallback.partnerCategory || (isExternalVal ? 'partner' : ''),
        trade: u.trade || extraMeta.trade || fallback.trade || '',
        contactPersonRole: u.contact_person_role || extraMeta.contactPersonRole || fallback.contactPersonRole || '',
        paymentTerms: u.payment_terms || extraMeta.paymentTerms || fallback.paymentTerms || '30 Tage netto',
        assignedProjectId: u.project_id || extraMeta.assignedProjectId || fallback.assignedProjectId || ''
      };
    });

    const mappedProfiles = (profilesData || []).map((p: any) => ({
      id: p.id,
      firstName: p.name?.split(' ')[0] || p.name || 'Team',
      lastName: p.name?.split(' ').slice(1).join(' ') || '',
      name: p.name || p.email || 'Team Member',
      email: p.email || '',
      company: p.company_name || 'Kreativ Desk',
      status: 'team',
      role: p.role || 'owner',
      isExternal: false,
      isAppUser: true,
      canViewFinance: p.can_view_finance ?? false,
      canApproveBudget: p.can_approve_budget ?? false
    }));

    const combinedMap = new Map();
    // Profiles first
    mappedProfiles.forEach(p => { 
      const key = (p.email || p.id || '').toLowerCase();
      if (key) combinedMap.set(key, p); 
    });
    // Merge or add CRM contacts
    mappedCrm.forEach(c => { 
      const key = (c.email || c.id || '').toLowerCase();
      if (key) {
        const existing = combinedMap.get(key);
        if (existing) {
          combinedMap.set(key, { 
            ...existing, 
            ...c, 
            isAppUser: true, // If it had a profile, it is an active app user
            company: c.company || existing.company,
            street: c.street || existing.street,
            zipCity: c.zipCity || existing.zipCity,
            phone: c.phone || existing.phone
          });
        } else {
          combinedMap.set(key, c);
        }
      }
    });

    const combined = Array.from(combinedMap.values());
    setCrmUsers(combined);
    setRealUsers(profilesData || []);
  }, [currentUser]);

  useEffect(() => {
    fetchAllContacts();
  }, [fetchAllContacts]);

  const vcfInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const [newContact, setNewContact] = useState<any>({
    id: null, firstName: '', lastName: '', email: '', phone: '', company: '',
    street: '', zipCity: '', website: '', uid: '', vat: '', description: '',
    isExternal: true, status: 'neu', role: 'partner',
    jobTitle: '', department: '', hourlyRate: '', workload: '100%', initials: '',
    partnerCategory: 'partner', trade: '', contactPersonRole: '', paymentTerms: '30 Tage netto',
    assignedProjectId: ''
  });

  const [vcardSessionId] = useState(() => Math.random().toString(36).substring(2, 15));
  const mobileUploadUrl = `${window.location.origin}/mobile-upload/vcard/${vcardSessionId}`;

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printSettings, setPrintSettings] = useState({ format: 'a4', orientation: 'portrait', scale: 0.85 });
  const [pdfLogo, setPdfLogo] = useState<string | null>(null);
  const [themeColor, setThemeColor] = useState<string>('#3b82f6');
  const [docHeader, setDocHeader] = useState({ title: 'Contact Report', project: 'Kreativ-Desk', date: new Date().toISOString().split('T')[0], version: 'v1.0' });
  const [isUploadingToCloud, setIsUploadingToCloud] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    if (isDemo || !vcardSessionId) return;

    const channel = supabase.channel(`vcard_upload_${vcardSessionId}`)
      .on('broadcast', { event: 'vcard_scanned' }, ({ payload }) => {
        if (payload) {
          setScannedContactData({
            firstName: payload.firstName || '',
            lastName: payload.lastName || '',
            company: payload.company || '',
            email: payload.email || '',
            phone: payload.phone || '',
            street: payload.street || '',
            zipCity: payload.zipCity || '',
            website: payload.website || '',
            description: payload.description || 'Gefunden per Smartphone-Visitenkartenscan'
          });
          setIsScannerModalOpen(true);
        }
      })
      .subscribe();

    let pollFailed = false;
    const interval = setInterval(async () => {
      if (isDemo || pollFailed || !vcardSessionId) return;
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('category', 'temp_receipt')
          .eq('company_id', vcardSessionId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          pollFailed = true;
          return;
        }

        if (data && data.length > 0) {
          const rec = data[0];
          let parsed: any = null;
          try { parsed = JSON.parse(rec.name || (rec as any).file_name || '{}'); } catch (e) {}
          if (parsed && (parsed.firstName || parsed.company || parsed.email || parsed.lastName)) {
            setScannedContactData({
              firstName: parsed.firstName || '',
              lastName: parsed.lastName || '',
              company: parsed.company || '',
              email: parsed.email || '',
              phone: parsed.phone || '',
              street: parsed.street || '',
              zipCity: parsed.zipCity || '',
              website: parsed.website || '',
              description: parsed.description || 'Gefunden per Smartphone-Visitenkartenscan'
            });
            setIsScannerModalOpen(true);
            pollFailed = true;
            try { await supabase.from('documents').delete().eq('id', rec.id); } catch (e) {}
          }
        }
      } catch (err) {
        pollFailed = true;
      }
    }, 4000);

    return () => {
      clearInterval(interval);
      if (channel) {
        supabase.removeChannel(channel).catch(() => {});
      }
    };
  }, [vcardSessionId, isDemo]);

  const isSuperAdmin = checkIsSuperAdmin(currentUser?.email);

  const handleDeleteContact = async (contactId: string) => {
    if (window.confirm(t('delete_user_confirm'))) {
      try {
        const safeCompanyId = currentUser?.companyId || currentUser?.uid;
        
        await offboardCompanyUser(contactId, safeCompanyId);
        
        await supabase.from('company_users').delete().eq('id', contactId);
        await supabase.from('profiles').delete().eq('id', contactId);
        
        await logAuditAction({
          action: 'USER_REMOVED',
          userId: currentUser?.uid || '',
          companyId: safeCompanyId,
          details: { removedUserId: contactId }
        });
        
        setCrmUsers((prev: any[]) => prev.filter(u => u.id !== contactId));
        setRealUsers((prev: any[]) => prev.filter(u => u.id !== contactId));
        if (selectedContact?.id === contactId) setSelectedContact(null);

        // Clean up local cache
        if (safeCompanyId) {
          try {
            const cacheKey = `crm_metadata_${safeCompanyId}`;
            const currentCache = safeStorage.getItem<Record<string, any>>(cacheKey, {});
            if (currentCache[contactId]) {
              delete currentCache[contactId];
              safeStorage.setItem(cacheKey, currentCache);
            }
          } catch (_) {}
        }

        addToast(t('delete') + ' ' + t('completed'), 'success');
        fetchCompanyUsers?.();
        fetchAllContacts();
      } catch (error) { 
        addToast(t('delete_failed'), 'error'); 
      }
    }
  };

  const handleUpdateStatus = async (contactId: string, newStatus: string) => {
    try {
      const isExt = newStatus !== 'team';
      const newRole = newStatus === 'team' ? 'employee' : 'partner';
      
      const payload: any = {
        status: newStatus,
        is_external: isExt,
        role: newRole
      };
      
      const { error } = await supabase.from('company_users').update(payload).eq('id', contactId);
      if (error) {
        // Fallback if is_external does not exist in DB yet
        await supabase.from('company_users').update({ status: newStatus, role: newRole }).eq('id', contactId);
      }
      
      // Update local storage cache
      const safeCompanyId = currentUser?.companyId || currentUser?.uid;
      if (safeCompanyId) {
        try {
          const cacheKey = `crm_metadata_${safeCompanyId}`;
          const currentCache = safeStorage.getItem<Record<string, any>>(cacheKey, {});
          if (currentCache[contactId]) {
            currentCache[contactId] = { ...currentCache[contactId], status: newStatus, isExternal: isExt, role: newRole };
            safeStorage.setItem(cacheKey, currentCache);
          }
        } catch (_) {}
      }

      setCrmUsers((prev: any[]) => prev.map(u => u.id === contactId ? { ...u, status: newStatus, isExternal: isExt, role: newRole } : u));
      if (selectedContact?.id === contactId) {
        setSelectedContact((prev: any) => prev ? { ...prev, status: newStatus, isExternal: isExt, role: newRole } : null);
      }
      addToast(t('save') + ' ' + t('completed'), 'success');
    } catch (error) { addToast(t('update_failed'), 'error'); }
  };

  const handleToggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBatchDelete = async () => {
    const deletableIds = selectedIds.filter(id => id !== currentUser?.uid);
    if (deletableIds.length === 0) { addToast(t('select_external_to_delete'), 'info'); return; }
    
    if (window.confirm(`${deletableIds.length} ${t('confirm_delete_multiple')}`)) {
      try {
        const safeCompanyId = currentUser?.companyId || currentUser?.uid;
        await Promise.all(deletableIds.map(async (id) => {
          await offboardCompanyUser(id, safeCompanyId);
          await supabase.from('company_users').delete().eq('id', id);
          await supabase.from('profiles').delete().eq('id', id);
        }));
        
        setCrmUsers((prev: any[]) => prev.filter(u => !deletableIds.includes(u.id)));
        setRealUsers((prev: any[]) => prev.filter(u => !deletableIds.includes(u.id)));
        setSelectedIds([]); 
        setIsSelectionMode(false);
        if (selectedContact && deletableIds.includes(selectedContact.id)) setSelectedContact(null);

        // Clean up local cache
        if (safeCompanyId) {
          try {
            const cacheKey = `crm_metadata_${safeCompanyId}`;
            const currentCache = safeStorage.getItem<Record<string, any>>(cacheKey, {});
            let modified = false;
            deletableIds.forEach(id => {
              if (currentCache[id]) {
                delete currentCache[id];
                modified = true;
              }
            });
            if (modified) {
              safeStorage.setItem(cacheKey, currentCache);
            }
          } catch (_) {}
        }

        addToast(`${deletableIds.length} ${t('contacts_deleted')}`, 'success');
        fetchCompanyUsers?.();
        fetchAllContacts();
      } catch (e) { 
        addToast(t('delete_failed'), 'error'); 
      }
    }
  };

  const handleBatchStatus = async (newStatus: string) => {
    const updatableIds = selectedIds.filter(id => id !== currentUser?.uid);
    if (updatableIds.length === 0) return;
    try {
      await Promise.all(updatableIds.map(id => supabase.from('company_users').update({ status: newStatus }).eq('id', id)));
      setSelectedIds([]); setIsSelectionMode(false);
      addToast(`${updatableIds.length} ${t('contacts_updated')}`, 'success');
    } catch (e) { addToast(t('update_failed'), 'error'); }
  };

  const formatRoleLabel = (role?: string) => {
    if (!role) return t('mitarbeiter');
    const r = role.toLowerCase();
    if (r === 'owner' || r === 'admin') return 'Admin / Inhaber';
    if (r === 'management') return 'Geschäftsleitung';
    if (r === 'employee' || r === 'internal') return 'Interner Mitarbeiter';
    if (r === 'partner' || r === 'external planner' || r === 'external') return 'Externer Planer / Partner';
    if (r === 'client') return 'Kunde / Bauherr';
    if (r === 'guest') return 'Gast';
    if (r === 'viewer') return 'Betrachter';
    return role;
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const isExt = newRole === 'partner' || newRole === 'guest' || newRole === 'viewer';
      await supabase.from('company_users').update({ role: newRole, is_external: isExt } as any).eq('id', userId);
      await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      
      setCrmUsers((prev: any[]) => prev.map(u => u.id === userId ? { ...u, role: newRole, isExternal: isExt } : u));
      if (selectedContact?.id === userId) {
        setSelectedContact((prev: any) => prev ? { ...prev, role: newRole, isExternal: isExt } : null);
      }
      addToast(`${t('role')} "${newRole}" ${t('completed')}`, 'success');
    } catch (error) { 
      console.error("Role update error:", error);
      addToast(t('update_failed'), 'error'); 
    }
  };

  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);

  const handleGenerateInvite = async (contact: any) => {
    if (!contact?.email) {
      addToast('Für die Einladung wird eine gültige E-Mail-Adresse benötigt.', 'error');
      return null;
    }
    setIsGeneratingInvite(true);
    const safeCompanyId = currentUser?.companyId || currentUser?.uid;
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    try {
      if (safeCompanyId) {
        const { data: comp } = await supabase
          .from('companies')
          .select('used_seats, max_seats')
          .eq('id', safeCompanyId)
          .maybeSingle();

        if (!isSuperAdmin && comp && comp.max_seats && (comp.used_seats || 1) >= comp.max_seats) {
          addToast('Lizenzlimit erreicht. Bitte upgrade deinen Plan für weitere Mitarbeiter.', 'error');
          return null;
        }

        const { error: insertErr } = await supabase.from('invites').insert({
          token,
          company_id: safeCompanyId,
          email: contact.email,
          role: contact.role || 'employee',
          status: 'pending',
          created_at: new Date().toISOString()
        });

        if (insertErr) {
          console.error("Invite insert error:", insertErr);
          throw insertErr;
        }
      }
      
      const inviteUrl = `${window.location.origin}/signup?invite=${token}&companyId=${safeCompanyId}`;
      await navigator.clipboard.writeText(inviteUrl);
      addToast(`Einladungslink für ${formatName(contact)} in die Zwischenablage kopiert!`, 'success');
      return inviteUrl;
    } catch (err) {
      console.error("Invite generation failed:", err);
      addToast('Fehler beim Erstellen des Einladungslinks.', 'error');
      return null;
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  const getInviteEmailTemplate = (contact: any, inviteUrl: string, lang: 'de' | 'en', type: 'internal' | 'external') => {
    const name = formatName(contact);
    const host = currentUser?.displayName || currentUser?.name || currentUser?.email?.split('@')[0] || 'Carlo Vescio';
    const companyName = (currentUser as any)?.companyName || (currentUser as any)?.company || 'Kreativ Desk';
    const roleTitle = contact?.jobTitle || (contact?.role === 'Internal' || contact?.role === 'employee' ? 'Interner Mitarbeiter' : contact?.role || 'Projektpartner');

    if (lang === 'de') {
      if (type === 'external') {
        const subject = `📐 Einladung zur Projekt-Kollaboration | Kreativ Desk OS`;
        const body = 
          `Guten Tag ${name},\n\n` +
          `${host} lädt Sie zur digitalen Projekt-Zusammenarbeit auf Kreativ Desk OS ein.\n\n` +
          `🏢 PROJEKT- & KOLLABORATIONS-DETAILS:\n` +
          `• Organisation: ${companyName}\n` +
          `• Funktion: Externer Fachplaner / Projektpartner\n` +
          `• Direkter Zugangs-Link: ${inviteUrl}\n\n` +
          `✨ HINWEIS FÜR EXTERNE PARTNER:\n` +
          `1. Über den Link oben gelangen Sie direkt in unsere gemeinsame Projektumgebung.\n` +
          `2. Sie können aktuelle CAD- und 3D-BIM-Pläne einsehen, Mängelprotokolle bearbeiten und Freigaben ohne Medienbrüche austauschen.\n` +
          `3. Es ist keine Software-Installation erforderlich – der Zugriff erfolgt direkt und sicher im Browser.\n\n` +
          `Freundliche Grüsse,\n` +
          `${host}\n` +
          `Kreativ Desk OS\n` +
          `https://www.kreativdesk.ch`;
        return { subject, body };
      } else {
        const subject = `🚀 Einladung zu Kreativ-Desk OS | Dein Workspace-Zugang`;
        const body = 
          `Hallo ${name},\n\n` +
          `${host} lädt dich ein, unserem Workspace auf Kreativ Desk OS beizutreten!\n\n` +
          `🏢 WORKSPACE & ZUGANGS-DETAILS:\n` +
          `• Plattform: Kreativ Desk OS (Schweizer Architektur- & Projekt-Betriebssystem)\n` +
          `• Workspace: ${companyName}\n` +
          `• Rolle / Funktion: ${roleTitle}\n` +
          `• Direkter Einladungs-Link: ${inviteUrl}\n\n` +
          `✨ NÄCHSTE SCHRITTE:\n` +
          `1. Klicke einfach auf den Link oben, um dein Konto zu erstellen und dein persönliches Passwort festzulegen.\n` +
          `2. Nach der Aktivierung hast du sofortigen Zugriff auf deine Projekte, Bautagebücher, 3D-BIM-Modelle und Aufgaben.\n\n` +
          `Freundliche Grüsse,\n` +
          `${host}\n` +
          `Kreativ Desk OS\n` +
          `https://www.kreativdesk.ch`;
        return { subject, body };
      }
    } else {
      if (type === 'external') {
        const subject = `📐 Invitation to Project Collaboration | Kreativ Desk OS`;
        const body = 
          `Hello ${name},\n\n` +
          `${host} invites you to collaborate on Kreativ Desk OS.\n\n` +
          `🏢 PROJECT & COLLABORATION DETAILS:\n` +
          `• Organization: ${companyName}\n` +
          `• Role: External Planner / Project Partner\n` +
          `• Direct Access Link: ${inviteUrl}\n\n` +
          `✨ NOTE FOR EXTERNAL PARTNERS:\n` +
          `1. Click the link above to access our shared project workspace.\n` +
          `2. View current CAD and 3D BIM plans, track defects, and exchange approvals with zero media friction.\n` +
          `3. No software installation required – access is instant and secure directly in your browser.\n\n` +
          `Best regards,\n` +
          `${host}\n` +
          `Kreativ Desk OS\n` +
          `https://www.kreativdesk.ch`;
        return { subject, body };
      } else {
        const subject = `🚀 Invitation to Kreativ Desk OS | Your Workspace Access`;
        const body = 
          `Hello ${name},\n\n` +
          `${host} invites you to join our workspace on Kreativ Desk OS!\n\n` +
          `🏢 WORKSPACE & ACCESS DETAILS:\n` +
          `• Platform: Kreativ Desk OS (Swiss Architecture & Project Operating System)\n` +
          `• Workspace: ${companyName}\n` +
          `• Role / Title: ${roleTitle}\n` +
          `• Direct Invitation Link: ${inviteUrl}\n\n` +
          `✨ NEXT STEPS:\n` +
          `1. Simply click the link above to create your account and set your secure password.\n` +
          `2. Once activated, you have immediate access to your projects, site diaries, 3D BIM models, and tasks.\n\n` +
          `Best regards,\n` +
          `${host}\n` +
          `Kreativ Desk OS\n` +
          `https://www.kreativdesk.ch`;
        return { subject, body };
      }
    }
  };

  const handleSendInviteEmail = async (contact: any) => {
    const inviteUrl = await handleGenerateInvite(contact);
    if (!inviteUrl) return;
    const isExt = contact.isExternal || contact.role === 'partner' || contact.role === 'External Planner' || (contact.status && contact.status !== 'team');
    setInviteModalContact(contact);
    setInviteModalUrl(inviteUrl);
    setInviteModalType(isExt ? 'external' : 'internal');
    setInviteModalLang(currentLang === 'de' ? 'de' : 'en');
    setIsInviteModalOpen(true);
  };

  const openEditModal = () => {
    if (!selectedContact) return;
    const isExt = selectedContact.isExternal !== false && selectedContact.status !== 'team';
    setNewContact({
      id: selectedContact.id,
      firstName: selectedContact.firstName || '',
      lastName: selectedContact.lastName || '',
      email: selectedContact.email || '',
      phone: selectedContact.phone || '',
      company: selectedContact.company || '',
      street: selectedContact.street || '',
      zipCity: selectedContact.zipCity || '',
      website: selectedContact.website || '',
      uid: selectedContact.uid || '',
      vat: selectedContact.vat || '',
      description: selectedContact.description || '',
      isExternal: isExt,
      status: selectedContact.status || (isExt ? 'neu' : 'team'),
      role: selectedContact.role || (isExt ? 'partner' : 'employee'),
      jobTitle: selectedContact.jobTitle || '',
      department: selectedContact.department || '',
      hourlyRate: selectedContact.hourlyRate || '',
      workload: selectedContact.workload || '100%',
      initials: selectedContact.initials || '',
      partnerCategory: selectedContact.partnerCategory || (isExt ? 'partner' : ''),
      trade: selectedContact.trade || '',
      contactPersonRole: selectedContact.contactPersonRole || '',
      paymentTerms: selectedContact.paymentTerms || '30 Tage netto',
      assignedProjectId: selectedContact.assignedProjectId || ''
    });
    setAvatarPreview(selectedContact.photoURL || null);
    setIsAddModalOpen(true);
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.isExternal) {
      if (!newContact.firstName && !newContact.lastName && !newContact.email) {
        addToast(t('first_name') + ', ' + t('last_name') + ' oder ' + t('email') + ' erforderlich.', 'error');
        return;
      }
    } else {
      if (!newContact.lastName && !newContact.company && !newContact.firstName) {
        addToast(t('name_or_company_required'), 'error');
        return;
      }
    }
    if (!currentUser || !currentUser.uid) return;
    
    setIsSubmitting(true);
    const safeCompanyId = currentUser.companyId || currentUser.uid;

    try {
      let photoURL = newContact.id ? selectedContact?.photoURL : null; 
      
      if (avatarFile) {
        photoURL = await uploadFileWithFallback(avatarFile, avatarFile.name, safeCompanyId, 'crm_avatars');
      }

      const fullName = [newContact.firstName, newContact.lastName].filter(Boolean).join(' ');
      const isExt = Boolean(newContact.isExternal);
      const finalRole = newContact.role || (isExt ? 'partner' : 'employee');
      const finalStatus = newContact.status || (isExt ? 'neu' : 'team');

      const extraMeta = {
        jobTitle: newContact.jobTitle || null,
        department: newContact.department || null,
        hourlyRate: newContact.hourlyRate || null,
        workload: newContact.workload || null,
        initials: newContact.initials || null,
        partnerCategory: newContact.partnerCategory || null,
        trade: newContact.trade || null,
        contactPersonRole: newContact.contactPersonRole || null,
        paymentTerms: newContact.paymentTerms || null,
        assignedProjectId: newContact.assignedProjectId || null
      };

      const serializedNotes = newContact.description 
        ? `${newContact.description}\n\n__CRM_META__:${JSON.stringify(extraMeta)}`
        : `__CRM_META__:${JSON.stringify(extraMeta)}`;

      // Full payload with all CRM fields
      const fullDbPayload: any = {
        company_id: safeCompanyId,
        first_name: newContact.firstName || null,
        last_name: newContact.lastName || null,
        name: fullName || newContact.company || t('unknown'),
        email: newContact.email || null,
        phone: newContact.phone || null,
        company: newContact.company || (!isExt ? ((currentUser as any)?.companyName || (currentUser as any)?.company || 'Kreativ Desk') : null),
        street: newContact.street || null,
        zip_city: newContact.zipCity || null,
        website: newContact.website || null,
        uid_number: newContact.uid || null,
        vat_number: newContact.vat || null,
        notes: serializedNotes,
        photo_url: photoURL || null,
        is_external: isExt,
        role: finalRole,
        status: finalStatus
      };

      // Base payload in case Postgres columns are not migrated yet
      const baseDbPayload: any = {
        company_id: safeCompanyId,
        first_name: newContact.firstName || null,
        last_name: newContact.lastName || null,
        name: fullName || newContact.company || t('unknown'),
        email: newContact.email || null,
        phone: newContact.phone || null,
        notes: serializedNotes,
        role: finalRole,
        status: finalStatus
      };

      const fullContactObject = {
        ...newContact,
        ...fullDbPayload,
        ...extraMeta,
        firstName: newContact.firstName,
        lastName: newContact.lastName,
        company: newContact.company || (!isExt ? ((currentUser as any)?.companyName || (currentUser as any)?.company || 'Kreativ Desk') : ''),
        street: newContact.street,
        zipCity: newContact.zipCity,
        website: newContact.website,
        uid: newContact.uid,
        vat: newContact.vat,
        description: newContact.description,
        companyId: safeCompanyId,
        photoURL,
        isExternal: isExt,
        role: finalRole,
        status: finalStatus,
        isAppUser: selectedContact?.isAppUser || false
      };

      const updateLocalCache = (cid: string) => {
        try {
          const cacheKey = `crm_metadata_${safeCompanyId}`;
          const currentCache = safeStorage.getItem<Record<string, any>>(cacheKey, {});
          currentCache[cid] = fullContactObject;
          if (newContact.email) currentCache[newContact.email] = fullContactObject;
          safeStorage.setItem(cacheKey, currentCache);
        } catch (_) {}
      };

      if (newContact.id) {
        let updateRes = await supabase.from('company_users').update(fullDbPayload).eq('id', newContact.id);
        if (updateRes.error) {
          console.warn("Full update failed, trying base update:", updateRes.error);
          updateRes = await supabase.from('company_users').update(baseDbPayload).eq('id', newContact.id);
        }
        
        updateLocalCache(newContact.id);
        const updatedContact = { ...selectedContact, ...fullContactObject };
        setCrmUsers((prev: any[]) => prev.map(u => u.id === newContact.id ? updatedContact : u));
        setSelectedContact(updatedContact);
        addToast(t('save') + ' ' + t('completed'), 'success');
      } else {
        fullDbPayload.created_at = new Date().toISOString();
        baseDbPayload.created_at = fullDbPayload.created_at;
        
        let { data: created, error: insertErr } = await supabase.from('company_users').insert(fullDbPayload).select().maybeSingle();
        if (insertErr) {
          console.warn("Full insert failed, trying base insert:", insertErr);
          const baseRes = await supabase.from('company_users').insert(baseDbPayload).select().maybeSingle();
          created = baseRes.data;
          insertErr = baseRes.error;
        }
        
        if (insertErr) {
          console.error("Error inserting contact into company_users:", insertErr);
          addToast(t('upload_failed'), 'error');
          setIsSubmitting(false);
          return;
        }

        const newId = created ? created.id : `user-${Date.now()}`;
        updateLocalCache(newId);
        const finalContact = {
          ...fullContactObject,
          id: newId
        };

        setCrmUsers((prev: any[]) => [finalContact, ...prev]);
        setSelectedContact(finalContact);
        
        await logAuditAction({
          action: 'USER_INVITED',
          userId: currentUser.uid,
          companyId: safeCompanyId,
          details: { invitedUserId: finalContact.id, isExternal: isExt }
        });
        
        addToast(t('save') + ' ' + t('completed'), 'success');
      }
      
      fetchCompanyUsers?.();
      closeAddModal();
    } catch (err) { 
      console.error("Fehler beim Speichern:", err); addToast(t('upload_failed'), 'error'); 
    } finally { setIsSubmitting(false); }
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false); setAvatarFile(null); setAvatarPreview(null);
    setNewContact({
      id: null, firstName: '', lastName: '', email: '', phone: '', company: '',
      street: '', zipCity: '', website: '', uid: '', vat: '', description: '',
      isExternal: activeFilter !== 'team', status: activeFilter === 'team' ? 'team' : 'neu',
      role: activeFilter === 'team' ? 'employee' : 'partner',
      jobTitle: '', department: '', hourlyRate: '', workload: '100%', initials: '',
      partnerCategory: 'partner', trade: '', contactPersonRole: '',
      paymentTerms: '30 Tage netto', assignedProjectId: activeProjectId || ''
    });
  };

  const handleVcfImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      let firstName = '', lastName = '', email = '', phone = '', company = '';
      
      content.split('\n').forEach(line => {
        if (line.startsWith('N:')) {
          const parts = line.replace('N:', '').split(';');
          lastName = parts[0]?.trim() || ''; firstName = parts[1]?.trim() || '';
        }
        if (line.startsWith('FN:') && !lastName) lastName = line.replace('FN:', '').trim();
        if (line.startsWith('EMAIL:')) email = line.replace('EMAIL:', '').replace(/.*:/, '').trim();
        if (line.startsWith('TEL:')) phone = line.replace('TEL:', '').replace(/.*:/, '').trim();
        if (line.startsWith('ORG:')) company = line.replace('ORG:', '').trim();
      });
      
      if (lastName || firstName || company) {
        setNewContact((prev: any) => ({ ...prev, firstName, lastName, email, phone, company, isExternal: true, status: 'neu' }));
        setIsAddModalOpen(true); addToast(t('vcf_extracted'), 'info');
      }
    };
    reader.readAsText(file);
    if (vcfInputRef.current) vcfInputRef.current.value = '';
  };

  const formatName = (u: any) => {
    if (u.firstName || u.lastName) return `${u.firstName || ''} ${u.lastName || ''}`.trim();
    return u.displayName || u.name || t('unknown');
  };

  const allContacts = crmUsers;

  const filteredContacts = allContacts.filter(u => {
    const searchString = `${formatName(u)} ${u.company || ''} ${u.email || ''}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    
    let matchesFilter = false;
    const cStatus = u.status || 'neu';

    if (activeFilter === 'alle') matchesFilter = true;
    else if (activeFilter === 'team') matchesFilter = u.isAppUser || !u.isExternal || cStatus === 'team';
    else if (activeFilter === 'lead') matchesFilter = (cStatus === 'lead') && Boolean(u.isExternal);
    else if (activeFilter === 'partner') matchesFilter = (cStatus === 'partner' || u.role === 'partner') && Boolean(u.isExternal);
    else if (activeFilter === 'neu') matchesFilter = (cStatus === 'neu' || !u.status) && Boolean(u.isExternal);
    else matchesFilter = cStatus === activeFilter;

    return matchesSearch && matchesFilter;
  }).sort((a, b) => formatName(a).localeCompare(formatName(b)));

  const handleExportCSV = () => {
    if (filteredContacts.length === 0) { addToast(t('no_export_data'), 'info'); return; }

    const headers = ['Name', 'Firma', 'Email', 'Telefon', 'Status', 'Typ', 'Strasse', 'PLZ_Ort'];
    const rows = filteredContacts.map(c => [
      `"${formatName(c)}"`, `"${c.company || ''}"`, `"${c.email || ''}"`, `"${c.phone || ''}"`,
      `"${c.status || 'neu'}"`, `"${c.isExternal ? 'Extern' : 'Intern'}"`, `"${c.street || ''}"`, `"${c.zipCity || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `kreativ_desk_crm_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(t('export_csv') + ' ' + t('completed'), 'success');
  };

  const handlePdfLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPdfLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generateNativePdfDocument = async (): Promise<jsPDF> => {
    const isPortrait = printSettings.orientation === 'portrait';
    const format = printSettings.format.toLowerCase();
    const pdf = new jsPDF({ orientation: isPortrait ? 'p' : 'l', unit: 'mm', format });
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 14;
    
    pdf.setFillColor(themeColor);
    pdf.rect(0, 0, pageWidth, 40, 'F');
    pdf.setFontSize(22);
    pdf.setTextColor('#ffffff');
    pdf.setFont("helvetica", "bold");
    
    if (selectedContact && !isSelectionMode) {
      pdf.text("Contact Dossier", margin, 25);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.text(`${t('project').toUpperCase()}: ${docHeader.project}   |   ${t('date').toUpperCase()}: ${new Date(docHeader.date).toLocaleDateString('de-CH')}`, margin, 32);
      
      if (pdfLogo) {
        const imgProps = pdf.getImageProperties(pdfLogo);
        const imgRatio = imgProps.width / imgProps.height;
        const maxW = 40; const maxH = 15;
        let finalW = maxW; let finalH = finalW / imgRatio;
        if (finalH > maxH) { finalH = maxH; finalW = finalH * imgRatio; }
        pdf.addImage(pdfLogo, 'PNG', pageWidth - margin - finalW, 10 + (maxH - finalH)/2, finalW, finalH, '', 'FAST');
      }

      let cursorY = 55;
      pdf.setTextColor('#000000'); pdf.setFontSize(16); pdf.setFont('helvetica', 'bold');
      pdf.text(formatName(selectedContact), margin, cursorY);
      
      cursorY += 15; pdf.setFontSize(10); pdf.setFont('helvetica', 'bold'); pdf.setTextColor('#555555');
      pdf.text(t('company') + ":", margin, cursorY); pdf.setFont('helvetica', 'normal'); pdf.setTextColor('#000000');
      pdf.text(selectedContact.company || '-', margin + 40, cursorY);
      
      cursorY += 10; pdf.setFont('helvetica', 'bold'); pdf.setTextColor('#555555');
      pdf.text(t('email') + ":", margin, cursorY); pdf.setFont('helvetica', 'normal'); pdf.setTextColor('#000000');
      pdf.text(selectedContact.email || '-', margin + 40, cursorY);

      cursorY += 10; pdf.setFont('helvetica', 'bold'); pdf.setTextColor('#555555');
      pdf.text(t('phone') + ":", margin, cursorY); pdf.setFont('helvetica', 'normal'); pdf.setTextColor('#000000');
      pdf.text(selectedContact.phone || '-', margin + 40, cursorY);

      cursorY += 10; pdf.setFont('helvetica', 'bold'); pdf.setTextColor('#555555');
      pdf.text(t('location_business') + ":", margin, cursorY); pdf.setFont('helvetica', 'normal'); pdf.setTextColor('#000000');
      pdf.text(`${selectedContact.street || ''} ${selectedContact.zipCity || ''}`, margin + 40, cursorY);

      if (selectedContact.description) {
        cursorY += 20; pdf.setFont('helvetica', 'bold'); pdf.setTextColor('#555555');
        pdf.text(t('internal_notes') + ":", margin, cursorY); cursorY += 10; pdf.setFont('helvetica', 'normal'); pdf.setTextColor('#000000');
        const descLines = pdf.splitTextToSize(selectedContact.description, pageWidth - (margin * 2));
        pdf.text(descLines, margin, cursorY);
      }

    } else {
      pdf.text(docHeader.title, margin, 25);
      pdf.setFontSize(11); pdf.setFont("helvetica", "normal");
      pdf.text(`${t('project').toUpperCase()}: ${docHeader.project}   |   ${t('date').toUpperCase()}: ${new Date(docHeader.date).toLocaleDateString('de-CH')}`, margin, 32);
      
      if (pdfLogo) {
        const imgProps = pdf.getImageProperties(pdfLogo);
        const imgRatio = imgProps.width / imgProps.height;
        const maxW = 40; const maxH = 15;
        let finalW = maxW; let finalH = finalW / imgRatio;
        if (finalH > maxH) { finalH = maxH; finalW = finalH * imgRatio; }
        pdf.addImage(pdfLogo, 'PNG', pageWidth - margin - finalW, 10 + (maxH - finalH)/2, finalW, finalH, '', 'FAST');
      }

      let cursorY = 50; pdf.setFillColor(245, 245, 245); pdf.rect(margin, cursorY, pageWidth - (margin * 2), 10, 'F');
      
      const c1 = margin + 2; const c2 = margin + (isPortrait ? 45 : 70); const c3 = margin + (isPortrait ? 95 : 150); const c4 = pageWidth - margin - (isPortrait ? 25 : 25);

      pdf.setFontSize(9); pdf.setFont('helvetica', 'bold'); pdf.setTextColor('#000000');
      pdf.text("Name", c1, cursorY + 7); pdf.text("Firma", c2, cursorY + 7); pdf.text("E-Mail / Telefon", c3, cursorY + 7); pdf.text("Status", c4, cursorY + 7);
      cursorY += 15;
      
      filteredContacts.forEach((contact) => {
         if (cursorY > pageHeight - margin - 15) { pdf.addPage(); cursorY = margin + 10; }
         pdf.setTextColor('#000000'); pdf.setFontSize(9); pdf.setFont('helvetica', 'bold');
         pdf.text(safeStr(formatName(contact), 25), c1, cursorY);
         pdf.setFont('helvetica', 'normal'); pdf.setTextColor('#555555');
         pdf.text(safeStr(contact.company, 25), c2, cursorY);
         pdf.text(`${safeStr(contact.email, 30)}\n${safeStr(contact.phone, 20)}`, c3, cursorY);
         pdf.setFont('helvetica', 'bold'); pdf.text(safeStr(contact.status, 15), c4, cursorY);
         cursorY += 10; pdf.setDrawColor(230, 230, 230); pdf.line(margin, cursorY, pageWidth - margin, cursorY); cursorY += 5;
      });
    }
    return pdf;
  };

  const ensureFolder = async (folderName: string) => {
    if (!currentUser || !currentUser.uid) return 'root';
    const safeCompanyId = currentUser.companyId || currentUser.uid;
    const { data: existing } = await supabase
      .from('documents')
      .select('id')
      .eq('name', folderName)
      .eq('is_folder', true)
      .eq('company_id', safeCompanyId)
      .maybeSingle();
    if (existing) return existing.id;
    const { data: newF } = await supabase.from('documents').insert({ name: folderName, is_folder: true, category: 'company', owner_id: currentUser.uid, company_id: safeCompanyId, project_id: 'global', created_at: new Date().toISOString() }).select().maybeSingle();
    return newF ? newF.id : 'root';
  };

  const executeStudioPDFExportCloud = async () => {
    if (!currentUser || !currentUser.uid) return;
    setIsUploadingToCloud(true);
    try {
      const safeCompanyId = currentUser.companyId || currentUser.uid;
      await new Promise(r => setTimeout(r, 200)); 
      const pdf = await generateNativePdfDocument();
      const fileName = `CRM_Report_${Date.now()}.pdf`;
      const pdfBlobOut = pdf.output('blob');

      const downloadUrl = await uploadPdfBlobWithFallback(pdfBlobOut, fileName, safeCompanyId);
      const targetFolderId = await ensureFolder("04_SALES");

      await supabase.from('documents').insert({
        name: fileName, url: downloadUrl, project_id: 'global', folder_id: targetFolderId, category: 'company', 
        owner_id: currentUser.uid, company_id: safeCompanyId, type: 'application/pdf', size: (pdfBlobOut.size / (1024 * 1024)).toFixed(2) + ' MB', 
        is_folder: false, created_at: new Date().toISOString()
      });

      addToast(t('pdf_exported'), 'success'); setIsPrintModalOpen(false);
    } catch (error) { addToast(t('upload_failed'), 'error'); } finally { setIsUploadingToCloud(false); }
  };

  const executeStudioPDFExportLocal = async () => {
    setIsGeneratingPdf(true);
    try {
      await new Promise(r => setTimeout(r, 200)); 
      const pdf = await generateNativePdfDocument();
      const fileName = `CRM_Report_${Date.now()}.pdf`;
      pdf.save(fileName);
      addToast(t('pdf_exported'), "success"); setIsPrintModalOpen(false);
    } catch (error: any) { addToast(t('pdf_export_failed'), "error"); } finally { setIsGeneratingPdf(false); }
  };

  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isScanningCard, setIsScanningCard] = useState(false);
  const [scannedCardPreview, setScannedCardPreview] = useState<string | null>(null);
  const scannerInputRef = useRef<HTMLInputElement>(null);

  const [scannedContactData, setScannedContactData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phone: '',
    street: '',
    zipCity: '',
    website: '',
    description: ''
  });

  const handleBusinessCardScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningCard(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      setScannedCardPreview(dataUrl);
      const base64Data = dataUrl.split(',')[1];

      const prompt = `Analysiere diese Visitenkarte. Extrahiere alle Kontaktdaten als striktes JSON-Objekt mit exakt folgenden Schlüsselnamen:
"firstName" (Vorname), "lastName" (Nachname), "company" (Firma), "email", "phone" (Telefon), "street" (Strasse & Hausnummer), "zipCity" (PLZ & Ort), "website", "description" (Jobtitel, Position oder Notizen).
Antworte AUSSCHLIESSLICH mit dem validen JSON-Code ohne Markdown-Formatierung oder Erklärungen.`;

      try {
        const response = await callGeminiAPI('gemini-2.5-flash', [
          { inlineData: { data: base64Data, mimeType: file.type } },
          { text: prompt }
        ]);

        let text = typeof response === 'string' ? response : (response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const data = JSON.parse(text);
        setScannedContactData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          company: data.company || '',
          email: data.email || '',
          phone: data.phone || '',
          street: data.street || '',
          zipCity: data.zipCity || '',
          website: data.website || '',
          description: data.description || 'Gefunden per KI-Visitenkartenscan'
        });
        addToast('Visitenkarte erfolgreich per KI ausgelesen!', 'success');
      } catch (err) {
        console.error('OCR Error:', err);
        addToast('Fehler beim KI-Auslesen der Visitenkarte. Bitte Daten manuell überprüfen.', 'error');
      } finally {
        setIsScanningCard(false);
        if (scannerInputRef.current) scannerInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveScannedContactToCRM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedContactData.lastName && !scannedContactData.company && !scannedContactData.firstName) {
      addToast(t('name_or_company_required'), 'error');
      return;
    }
    if (!currentUser || !currentUser.uid) return;

    setIsSubmitting(true);
    const safeCompanyId = currentUser.companyId || currentUser.uid;

    try {
      let photoURL = null;
      if (scannedCardPreview) {
        try {
          const blob = await (await fetch(scannedCardPreview)).blob();
          const file = new File([blob], `business_card_${Date.now()}.jpg`, { type: 'image/jpeg' });
          photoURL = await uploadFileWithFallback(file, file.name, safeCompanyId, 'crm_avatars');
        } catch (e) {
          console.warn('Avatar upload fallback handled:', e);
        }
      }

      const fullName = [scannedContactData.firstName, scannedContactData.lastName].filter(Boolean).join(' ');
      const displayName = fullName 
        ? (scannedContactData.company ? `${fullName} (${scannedContactData.company})` : fullName)
        : (scannedContactData.company || t('unknown'));

      const fullDbPayload: any = {
        company_id: safeCompanyId,
        first_name: scannedContactData.firstName || null,
        last_name: scannedContactData.lastName || null,
        name: displayName,
        email: scannedContactData.email || null,
        phone: scannedContactData.phone || null,
        company: scannedContactData.company || null,
        street: scannedContactData.street || null,
        zip_city: scannedContactData.zipCity || null,
        website: scannedContactData.website || null,
        notes: scannedContactData.description || null,
        photo_url: photoURL || null,
        role: 'partner',
        status: 'neu',
        is_external: true,
        created_at: new Date().toISOString()
      };

      const baseDbPayload: any = {
        company_id: safeCompanyId,
        first_name: scannedContactData.firstName || null,
        last_name: scannedContactData.lastName || null,
        name: displayName,
        email: scannedContactData.email || null,
        phone: scannedContactData.phone || null,
        role: 'partner',
        status: 'neu',
        created_at: fullDbPayload.created_at
      };

      let { data: created, error: insertErr } = await supabase.from('company_users').insert(fullDbPayload).select().maybeSingle();
      if (insertErr) {
        console.warn("Full scanned contact insert failed, trying base:", insertErr);
        const baseRes = await supabase.from('company_users').insert(baseDbPayload).select().maybeSingle();
        created = baseRes.data;
        insertErr = baseRes.error;
      }

      if (insertErr) {
        console.error("Error inserting contact:", insertErr);
        addToast(currentLang === 'de' ? 'Fehler beim Speichern des Kontakts.' : 'Failed to save contact.', 'error');
        setIsSubmitting(false);
        return;
      }

      const newId = created ? created.id : `user-${Date.now()}`;
      const finalContact = {
        ...scannedContactData,
        ...fullDbPayload,
        id: newId,
        photoURL,
        isExternal: true
      };

      const cacheKey = `crm_metadata_${safeCompanyId}`;
      const currentCache = safeStorage.getItem<Record<string, any>>(cacheKey, {});
      currentCache[newId] = finalContact;
      if (scannedContactData.email) currentCache[scannedContactData.email] = finalContact;
      safeStorage.setItem(cacheKey, currentCache);

      setCrmUsers((prev: any[]) => [finalContact, ...prev]);
      setSelectedContact(finalContact);

      await logAuditAction({
        action: 'USER_INVITED',
        userId: currentUser.uid,
        companyId: safeCompanyId,
        details: { invitedUserId: finalContact.id, isExternal: true, source: 'ai_card_scan' }
      });

      addToast('Kontakt erfolgreich per Visitenkartenscan im CRM gespeichert!', 'success');
      setIsScannerModalOpen(false);
      setScannedCardPreview(null);
      setScannedContactData({
        firstName: '', lastName: '', company: '', email: '', phone: '',
        street: '', zipCity: '', website: '', description: ''
      });
      fetchCompanyUsers?.();
    } catch (err) {
      console.error("Save scanned contact error:", err);
      addToast(t('upload_failed'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 md:gap-6 animate-in fade-in duration-300 text-text-primary">
      
      {/* HEADER & TOP BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shrink-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-text-primary">{t('smart_crm')}</h2>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 w-full md:w-auto">
          {/* Visitenkarte KI Scanner Button */}
          <button 
            onClick={() => setIsScannerModalOpen(true)} 
            className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs md:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            title="Visitenkarte scannen & per KI auslesen"
          >
            <Camera size={16} /> <span>Visitenkarte scannen</span>
          </button>

          <input type="file" accept=".vcf" ref={vcfInputRef} className="hidden" onChange={handleVcfImport} />
          <button onClick={() => { setDocHeader(prev => ({...prev, title: (selectedContact && !isSelectionMode) ? 'Contact Dossier' : 'CRM Report'})); setIsPrintModalOpen(true); }} className="px-3 py-2 bg-surface border border-border text-text-primary rounded-xl text-xs md:text-sm font-bold hover:bg-background transition-all flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"><Download size={15} /> <span className="hidden sm:inline">{t('export_pdf')}</span></button>
          <button onClick={handleExportCSV} className="px-3 py-2 bg-surface border border-border text-text-primary rounded-xl text-xs md:text-sm font-bold hover:bg-background transition-all flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"><FileText size={15} /> <span className="hidden sm:inline">{t('export_csv')}</span></button>
          <button onClick={() => vcfInputRef.current?.click()} className="px-3 py-2 bg-surface border border-border text-text-primary rounded-xl text-xs md:text-sm font-bold hover:bg-background transition-all flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"><FileUp size={15} /> <span className="hidden sm:inline">{t('vcf_import')}</span></button>
          <button onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedIds([]); }} className={cn("px-3 py-2 border rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer", isSelectionMode ? "bg-accent-ai/20 border-accent-ai text-accent-ai" : "bg-surface border-border text-text-primary hover:bg-background")}><ListChecks size={15} /> <span className="hidden sm:inline">{isSelectionMode ? t('cancel_selection') : t('select')}</span></button>
          {hasPermission('canManageUsers') && (
            <button 
              onClick={() => { 
                setAvatarFile(null);
                setAvatarPreview(null);
                setNewContact({
                  id: null,
                  firstName: '',
                  lastName: '',
                  email: '',
                  phone: '',
                  company: '',
                  street: '',
                  zipCity: '',
                  website: '',
                  uid: '',
                  vat: '',
                  description: '',
                  isExternal: activeFilter !== 'team',
                  status: activeFilter === 'team' ? 'team' : 'neu',
                  role: activeFilter === 'team' ? 'employee' : 'partner',
                  jobTitle: '',
                  department: '',
                  hourlyRate: '',
                  workload: '100%',
                  initials: '',
                  partnerCategory: 'partner',
                  trade: '',
                  contactPersonRole: '',
                  paymentTerms: '30 Tage netto',
                  assignedProjectId: activeProjectId || ''
                });
                setIsAddModalOpen(true); 
              }} 
              className="px-3.5 py-2 bg-accent-ai text-white rounded-xl text-xs md:text-sm font-bold shadow-md hover:bg-accent-ai/90 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <UserPlus size={16} /> <span>{t('new_contact')}</span>
            </button>
          )}
        </div>
      </div>

      {/* SPLIT VIEW ARCHITEKTUR */}
      <div className="flex flex-1 gap-6 overflow-hidden min-h-[500px]">
        
        {/* LINKE SPALTE / MOBILES GRID */}
        <div className="w-full md:w-[380px] bg-surface border border-border rounded-2xl md:rounded-3xl flex flex-col overflow-hidden shadow-sm relative shrink-0">
          <div className="p-4 md:p-5 border-b border-border bg-surface/80 backdrop-blur-md space-y-3 z-10">
            <div className="relative"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" /><input type="text" placeholder={t('search_contacts')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-accent-ai transition-colors placeholder:text-text-muted text-text-primary font-medium" /></div>
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
              {[{ id: 'alle', label: t('filter_all') }, { id: 'team', label: t('filter_team') }, { id: 'neu', label: t('filter_new_scanned') }, { id: 'lead', label: t('filter_leads') }, { id: 'partner', label: t('filter_partners') }].map(f => (
                <button key={f.id} onClick={() => setActiveFilter(f.id as any)} className={cn("px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 cursor-pointer", activeFilter === f.id ? "bg-accent-ai/10 text-accent-ai border border-accent-ai/20 shadow-sm" : "bg-background text-text-muted border border-border/50 hover:bg-white/5 hover:text-text-primary")}>{f.label}</button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 pb-24 bg-background">
            {filteredContacts.map(contact => {
              const isSelected = selectedContact?.id === contact.id; const isChecked = selectedIds.includes(contact.id); const isTeam = contact.isAppUser || contact.status === 'team' || !contact.isExternal;
              return (
                <div 
                  key={contact.id} 
                  onClick={() => {
                    if (isSelectionMode) {
                      handleToggleSelection(contact.id, {stopPropagation: () => {}} as any);
                    } else {
                      setSelectedContact(contact);
                      setIsMobileDetailOpen(true);
                    }
                  }} 
                  className={cn(
                    "p-3 rounded-2xl cursor-pointer transition-all duration-200 flex items-center justify-between group border",
                    (isSelected && !isSelectionMode) ? "bg-accent-ai/10 border-accent-ai/20 shadow-sm" : "hover:bg-white/5 bg-surface md:bg-transparent border-border/40 md:border-transparent",
                    (isChecked && isSelectionMode) ? "bg-accent-ai/10 border-accent-ai/30 shadow-sm" : ""
                  )}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {isSelectionMode && <div className={cn("w-5 h-5 rounded flex items-center justify-center border shrink-0 transition-colors bg-surface", isChecked ? "bg-accent-ai border-accent-ai text-white" : "border-border")}>{isChecked && <CheckSquare size={12} />}</div>}
                    <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center font-bold overflow-hidden shrink-0 border border-border/50 shadow-sm text-base", isTeam ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500")}>
                      {sanitizeUrl(contact.photoURL) ? <img src={sanitizeUrl(contact.photoURL)} className="w-full h-full object-cover" /> : formatName(contact).charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <div className={cn("font-bold text-sm truncate", (isSelected && !isSelectionMode) ? "text-accent-ai" : "text-text-primary")}>{formatName(contact)}</div>
                      <div className="text-xs text-text-muted truncate mt-0.5 font-medium">{contact.company || contact.email || t('no_company')}</div>
                      {contact.phone && <div className="text-[11px] text-text-muted/70 truncate md:hidden flex items-center gap-1 mt-0.5"><Phone size={10}/> {contact.phone}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {contact.status === 'neu' && !isTeam && !isSelectionMode && <div className="w-2.5 h-2.5 rounded-full bg-accent-ai shadow-[0_0_8px_rgba(59,130,246,0.5)] shrink-0 ml-1" />}
                    {!isSelectionMode && contact.email !== currentUser?.email && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteContact(contact.id); }} 
                        className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all md:opacity-0 md:group-hover:opacity-100 cursor-pointer" 
                        title={t('delete')}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredContacts.length === 0 && <div className="p-8 text-center text-text-muted font-medium text-sm">{t('no_filter_results')}</div>}
          </div>
          <AnimatePresence>
            {isSelectionMode && selectedIds.length > 0 && (
              <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="absolute bottom-4 left-4 right-4 bg-surface border border-border rounded-2xl p-3 shadow-2xl flex flex-col gap-2">
                <div className="text-xs font-bold text-text-muted px-1">{selectedIds.length} {t('selected')}</div>
                <div className="flex gap-2">
                  <select onChange={(e) => { if(e.target.value) handleBatchStatus(e.target.value); }} className="flex-1 bg-background border border-border text-xs font-bold px-2 py-2 rounded-lg outline-none text-text-primary">
                    <option value="">{t('change_status')}</option><option value="lead">{t('mark_as_lead')}</option><option value="partner">{t('mark_as_partner')}</option>
                  </select>
                  <button onClick={handleBatchDelete} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer"><Trash2 size={16} /></button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RECHTE SPALTE (DESKTOP) */}
        <div className="hidden md:flex flex-col flex-1 bg-surface border border-border rounded-3xl p-10 overflow-y-auto custom-scrollbar relative shadow-sm">
          {selectedContact && !isSelectionMode ? (
            <motion.div key={selectedContact.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 w-full">
              <div className="absolute top-8 right-8 flex items-center gap-2 bg-background border border-border p-1.5 rounded-xl shadow-sm">
                {(!selectedContact.isAppUser && selectedContact.isExternal !== false) && (
                  <select onChange={(e) => handleUpdateStatus(selectedContact.id, e.target.value)} value={selectedContact.status || 'neu'} className="appearance-none bg-transparent text-xs font-bold px-3 py-1.5 outline-none cursor-pointer text-text-muted hover:text-text-primary transition-colors">
                    <option value="neu" className="bg-surface">{t('status_new_scan')}</option><option value="lead" className="bg-surface">{t('status_lead')}</option><option value="partner" className="bg-surface">{t('status_partner')}</option><option value="team" className="bg-surface">{t('status_team')}</option>
                  </select>
                )}
                {selectedContact.email !== currentUser?.email && <div className="h-4 w-px bg-border mx-1" />}
                {hasPermission('canManageUsers') && (
                  <>
                    <button onClick={openEditModal} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors cursor-pointer" title={t('edit_contact')}><Edit2 size={16} /></button>
                    {selectedContact.email !== currentUser?.email && <button onClick={() => handleDeleteContact(selectedContact.id)} className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer" title={t('delete')}><Trash2 size={16} /></button>}
                  </>
                )}
              </div>

              <div className="flex items-center gap-8 pt-2">
                <div className="w-28 h-28 rounded-[2rem] bg-background border border-border flex items-center justify-center text-4xl font-bold text-text-muted shadow-sm overflow-hidden">
                  {sanitizeUrl(selectedContact.photoURL) ? <img src={sanitizeUrl(selectedContact.photoURL)} className="w-full h-full object-cover" /> : formatName(selectedContact).charAt(0).toUpperCase()}
                </div>
                <div className="space-y-2">
                  <h2 className="text-4xl font-bold text-text-primary tracking-tight">{formatName(selectedContact)}</h2>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {!selectedContact.isExternal ? (
                      <>
                        <span className="text-purple-600 dark:text-purple-400 font-bold bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
                          <Users size={13} /> {t('internal_team')}
                        </span>
                        {selectedContact.jobTitle && (
                          <span className="text-text-primary font-bold bg-surface border border-border px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
                            <Briefcase size={13} className="text-accent-ai" /> {selectedContact.jobTitle}
                          </span>
                        )}
                        {selectedContact.department && (
                          <span className="text-text-muted font-bold bg-background border border-border px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
                            <Layers size={13} /> {selectedContact.department}
                          </span>
                        )}
                        {selectedContact.workload && (
                          <span className="text-text-muted font-bold bg-background border border-border px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
                            <BadgePercent size={13} /> {selectedContact.workload}
                          </span>
                        )}
                        {selectedContact.hourlyRate && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
                            <DollarSign size={13} /> CHF {selectedContact.hourlyRate}/h
                          </span>
                        )}
                        {selectedContact.initials && (
                          <span className="text-text-muted font-sans font-bold bg-background border border-border px-2.5 py-1 rounded-full text-xs">
                            [{selectedContact.initials}]
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        {selectedContact.partnerCategory && (
                          <span className="text-blue-600 dark:text-blue-400 font-bold bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
                            {selectedContact.partnerCategory === 'planner' ? <Compass size={13} /> : selectedContact.partnerCategory === 'craftsman' ? <Hammer size={13} /> : selectedContact.partnerCategory === 'client' ? <Building2 size={13} /> : selectedContact.partnerCategory === 'supplier' ? <Package size={13} /> : selectedContact.partnerCategory === 'authority' ? <Landmark size={13} /> : <Contact size={13} />}
                            {selectedContact.partnerCategory === 'planner' ? t('category_planner') : selectedContact.partnerCategory === 'craftsman' ? t('category_craftsman') : selectedContact.partnerCategory === 'client' ? t('category_client') : selectedContact.partnerCategory === 'supplier' ? t('category_supplier') : selectedContact.partnerCategory === 'authority' ? t('category_authority') : selectedContact.partnerCategory === 'lead' ? t('category_lead') : t('partner')}
                          </span>
                        )}
                        {selectedContact.company && (
                          <span className="text-blue-500 font-bold bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
                            <Building size={13} /> {selectedContact.company}
                          </span>
                        )}
                        {selectedContact.trade && (
                          <span className="text-text-primary font-bold bg-surface border border-border px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
                            <Tag size={13} className="text-blue-500" /> {selectedContact.trade}
                          </span>
                        )}
                        {selectedContact.contactPersonRole && (
                          <span className="text-text-muted font-bold bg-background border border-border px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
                            <UserCheck size={13} /> {selectedContact.contactPersonRole}
                          </span>
                        )}
                        {selectedContact.paymentTerms && (
                          <span className="text-text-muted font-bold bg-background border border-border px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
                            <Clock size={13} /> {selectedContact.paymentTerms}
                          </span>
                        )}
                        {selectedContact.assignedProjectId && (
                          <span className="text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
                            <FolderKanban size={13} /> {projects.find((p: any) => p.id === selectedContact.assignedProjectId)?.name || 'Projekt'}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* TEAM INVITATION BANNER & QUICK ACTIONS */}
              {(!selectedContact.isExternal || selectedContact.status === 'team') && selectedContact.email !== currentUser?.email && (
                <div className="bg-accent-ai/5 border border-accent-ai/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {selectedContact.isAppUser ? (
                        <>
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                          <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5"><UserCheck size={14} /> Aktiver Workspace-Nutzer (In Supabase Auth registriert)</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                          <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5">Noch nicht in Auth registriert (Einladung ausstehend)</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed">
                      {selectedContact.isAppUser 
                        ? 'Dieses Teammitglied besitzt bereits ein aktives Login und vollen Zugriff auf den Workspace.'
                        : `${formatName(selectedContact)} erscheint in der Supabase auth.users Tabelle, sobald die Person den Einladungslink öffnet und ihr Passwort setzt.`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleGenerateInvite(selectedContact)}
                      disabled={isGeneratingInvite}
                      className="px-4 py-2.5 bg-surface border border-border hover:border-accent-ai text-text-primary rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer hover:bg-white/5"
                      title="Kopiert den Registrierungslink in die Zwischenablage"
                    >
                      <LinkIcon size={14} className="text-accent-ai" /> {isGeneratingInvite ? 'Erstelle...' : 'Einladungslink kopieren'}
                    </button>
                    {selectedContact.email && (
                      <button
                        type="button"
                        onClick={() => handleSendInviteEmail(selectedContact)}
                        className="px-4 py-2.5 bg-accent-ai hover:bg-accent-ai/90 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                        title="Öffnet dein E-Mail-Programm mit vorausgefüllter Einladung"
                      >
                        <Send size={14} /> Per E-Mail einladen
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-x-12 gap-y-10 pt-6 border-t border-border/50">
                <div className="space-y-6">
                  <h3 className="text-[10px] uppercase font-bold text-text-muted tracking-widest border-b border-border pb-2">{t('contact_methods')}</h3>
                  <div className="space-y-4 text-sm font-medium text-text-primary">
                    <div className="flex items-center gap-4 group"><div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-text-muted group-hover:text-accent-ai transition-colors"><Mail size={14}/></div>{selectedContact.email ? <a href={`mailto:${selectedContact.email}`} className="hover:text-accent-ai transition-colors">{selectedContact.email}</a> : <span className="text-text-muted italic">{t('no_email')}</span>}</div>
                    <div className="flex items-center gap-4 group"><div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-text-muted group-hover:text-accent-ai transition-colors"><Phone size={14}/></div>{selectedContact.phone ? <a href={`tel:${selectedContact.phone}`} className="hover:text-accent-ai transition-colors">{selectedContact.phone}</a> : <span className="text-text-muted italic">{t('no_phone')}</span>}</div>
                    <div className="flex items-center gap-4 group"><div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-text-muted group-hover:text-accent-ai transition-colors"><Globe size={14}/></div>{selectedContact.website ? <a href={`https://${selectedContact.website}`} target="_blank" rel="noreferrer" className="hover:text-accent-ai transition-colors">{selectedContact.website}</a> : <span className="text-text-muted italic">{t('no_website')}</span>}</div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-[10px] uppercase font-bold text-text-muted tracking-widest border-b border-border pb-2">{t('location_business')}</h3>
                  <div className="space-y-4 text-sm font-medium text-text-primary">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-text-muted shrink-0"><MapPin size={14}/></div>
                      <div className="pt-1.5 leading-relaxed">{selectedContact.street ? <>{selectedContact.street}<br/>{selectedContact.zipCity}</> : <span className="text-text-muted italic">{t('no_address_data')}</span>}</div>
                    </div>
                    {selectedContact.isExternal && (selectedContact.uid || selectedContact.vat || selectedContact.paymentTerms) && (
                      <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
                        {selectedContact.uid && <div className="flex justify-between"><span className="text-text-muted font-bold">{t('uid_number')}:</span> <span className="font-medium">{selectedContact.uid}</span></div>}
                        {selectedContact.vat && <div className="flex justify-between"><span className="text-text-muted font-bold">{t('vat_number')}:</span> <span className="font-medium">{selectedContact.vat}</span></div>}
                        {selectedContact.paymentTerms && <div className="flex justify-between"><span className="text-text-muted font-bold">{t('payment_terms')}:</span> <span className="font-medium">{selectedContact.paymentTerms}</span></div>}
                      </div>
                    )}
                  </div>
                </div>

                {(selectedContact.isAppUser || selectedContact.role) && (
                  <div className="col-span-2 space-y-3 pt-4 border-t border-border/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-[10px] uppercase font-bold text-text-muted tracking-widest flex items-center gap-1.5">
                        <Shield size={12} className="text-accent-ai" /> {t('role_management_system')}
                      </h3>
                      {hasPermission('canManageUsers') && (
                        <button
                          type="button"
                          onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-tab', { detail: 'settings' }))}
                          className="text-xs font-bold text-accent-ai hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          Rollen & Rechte in Einstellungen verwalten →
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between p-3.5 bg-background border border-border/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent-ai/10 border border-accent-ai/20 flex items-center justify-center text-accent-ai font-bold shrink-0">
                          <UserCheck size={16} />
                        </div>
                        <div>
                          <p className="text-[11px] text-text-muted font-semibold">Aktuelle Rolle im Unternehmen</p>
                          <p className="text-sm font-bold text-text-primary">
                            {formatRoleLabel(selectedContact.role)}
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-surface border border-border/60 rounded-lg text-xs font-bold text-text-muted">
                        Unternehmensebene
                      </span>
                    </div>
                  </div>
                )}
                {selectedContact.description && (
                  <div className="col-span-2 space-y-4">
                    <h3 className="text-[10px] uppercase font-bold text-text-muted tracking-widest flex items-center gap-2"><FileText size={12}/> {t('internal_notes')}</h3>
                    <div className="bg-background border border-border/50 p-5 rounded-2xl text-sm leading-relaxed text-text-primary whitespace-pre-wrap font-medium">{selectedContact.description}</div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 w-full flex flex-col items-center justify-center text-text-muted text-sm text-center my-auto h-full">
              <div className="w-24 h-24 rounded-full bg-background border border-border flex items-center justify-center mb-6 shadow-sm">{isSelectionMode ? <ListChecks size={32} className="opacity-50 text-accent-ai" /> : <Contact size={32} className="opacity-50" />}</div>
              <p className="font-bold text-lg text-text-primary">{isSelectionMode ? t('selection_mode_active') : t('no_contact_selected')}</p><p className="mt-2 font-medium max-w-xs mx-auto">{isSelectionMode ? t('selection_mode_desc') : t('no_contact_selected_desc')}</p>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE KONTAKT DETAIL MODAL */}
      <AnimatePresence>
        {isMobileDetailOpen && selectedContact && (
          <div className="fixed inset-0 z-[150] flex md:hidden items-end justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }} 
              className="bg-surface border-t border-border rounded-t-3xl sm:rounded-3xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative text-text-primary"
            >
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center font-bold text-lg overflow-hidden text-accent-ai shrink-0">
                    {sanitizeUrl(selectedContact.photoURL) ? <img src={sanitizeUrl(selectedContact.photoURL)} className="w-full h-full object-cover" /> : formatName(selectedContact).charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-base text-text-primary truncate">{formatName(selectedContact)}</h3>
                    <p className="text-xs text-text-muted truncate">{selectedContact.company || t('no_company')}</p>
                  </div>
                </div>
                <button onClick={() => setIsMobileDetailOpen(false)} className="p-2 text-text-muted hover:text-text-primary bg-background rounded-full border border-border cursor-pointer shrink-0">
                  <X size={20} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {selectedContact.phone ? (
                  <a href={`tel:${selectedContact.phone}`} className="py-3 px-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                    <Phone size={16} /> Anrufen
                  </a>
                ) : (
                  <div className="py-3 px-4 bg-background text-text-muted border border-border/50 rounded-xl font-bold text-xs text-center opacity-50">
                    Keine Nummer
                  </div>
                )}
                {selectedContact.email ? (
                  <a href={`mailto:${selectedContact.email}`} className="py-3 px-4 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                    <Mail size={16} /> E-Mail senden
                  </a>
                ) : (
                  <div className="py-3 px-4 bg-background text-text-muted border border-border/50 rounded-xl font-bold text-xs text-center opacity-50">
                    Keine E-Mail
                  </div>
                )}
              </div>

              {/* Mobile Team Member Invitation */}
              {(!selectedContact.isExternal || selectedContact.status === 'team') && selectedContact.email !== currentUser?.email && (
                <div className="p-3.5 bg-accent-ai/5 border border-accent-ai/20 rounded-2xl space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-primary">
                      {selectedContact.isAppUser ? '✅ In Supabase registriert' : '⏳ Einladung ausstehend'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleGenerateInvite(selectedContact)}
                      disabled={isGeneratingInvite}
                      className="flex-1 py-2.5 bg-surface border border-border rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 text-text-primary cursor-pointer hover:bg-white/5"
                    >
                      <LinkIcon size={14} className="text-accent-ai" /> Link kopieren
                    </button>
                    {selectedContact.email && (
                      <button
                        type="button"
                        onClick={() => handleSendInviteEmail(selectedContact)}
                        className="flex-1 py-2.5 bg-accent-ai text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Send size={14} /> Per E-Mail
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Status Picker & Actions */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest block">Status & Bearbeitung</label>
                {(!selectedContact.isAppUser && selectedContact.isExternal !== false) && (
                  <select 
                    onChange={(e) => handleUpdateStatus(selectedContact.id, e.target.value)} 
                    value={selectedContact.status || 'neu'} 
                    className="w-full bg-background border border-border text-xs font-bold px-4 py-3 rounded-xl outline-none text-text-primary cursor-pointer"
                  >
                    <option value="neu">{t('status_new_scan')}</option>
                    <option value="lead">{t('mark_as_lead')}</option>
                    <option value="partner">{t('mark_as_partner')}</option>
                    <option value="team">{t('status_team')}</option>
                  </select>
                )}

                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => { setIsMobileDetailOpen(false); openEditModal(); }} 
                    className="flex-1 py-3 bg-background border border-border rounded-xl font-bold text-xs flex items-center justify-center gap-2 text-text-primary cursor-pointer"
                  >
                    <Edit2 size={16} /> {t('edit_contact')}
                  </button>
                  {selectedContact.email !== currentUser?.email && (
                    <button 
                      onClick={() => { setIsMobileDetailOpen(false); handleDeleteContact(selectedContact.id); }} 
                      className="py-3 px-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4 pt-2 border-t border-border/50 text-xs">
                {selectedContact.email && (
                  <div>
                    <span className="text-text-muted font-medium block">E-Mail</span>
                    <span className="font-bold text-text-primary">{selectedContact.email}</span>
                  </div>
                )}
                {selectedContact.phone && (
                  <div>
                    <span className="text-text-muted font-medium block">Telefon</span>
                    <span className="font-bold text-text-primary">{selectedContact.phone}</span>
                  </div>
                )}
                {(selectedContact.street || selectedContact.zipCity) && (
                  <div>
                    <span className="text-text-muted font-medium block">Adresse</span>
                    <span className="font-bold text-text-primary">{selectedContact.street} {selectedContact.zipCity}</span>
                  </div>
                )}
                {selectedContact.description && (
                  <div>
                    <span className="text-text-muted font-medium block">Notizen</span>
                    <p className="font-medium text-text-primary bg-background p-3 rounded-xl border border-border mt-1 whitespace-pre-wrap">{selectedContact.description}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* KONTAKT ERFASSEN / BEARBEITEN MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-4xl my-auto overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-4 sm:p-5 border-b border-border/60 flex items-center justify-between bg-surface/90 shrink-0">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-sm transition-colors",
                    !newContact.isExternal ? "bg-accent-ai/10 text-accent-ai border border-accent-ai/20" : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                  )}>
                    {!newContact.isExternal ? <Users size={20} /> : <Building2 size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-text-primary leading-tight">
                      {newContact.id 
                        ? (!newContact.isExternal ? 'Teammitglied bearbeiten' : 'Partner / Kunde bearbeiten') 
                        : (!newContact.isExternal ? 'Neues Teammitglied anlegen' : 'Neuen Partner / Kunden erfassen')}
                    </h3>
                    <p className="text-xs text-text-muted">
                      {!newContact.isExternal 
                        ? t('internal_team_desc') 
                        : t('external_partner_desc')}
                    </p>
                  </div>
                </div>
                <button onClick={closeAddModal} className="text-text-muted hover:text-text-primary p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <X size={20}/>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-background custom-scrollbar">
                {/* 2-WEGE MODUS SCHALTER */}
                <div className="mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-surface border border-border/70 rounded-2xl p-1.5 shadow-inner">
                    <button 
                      type="button" 
                      onClick={() => setNewContact((prev: any) => ({
                        ...prev, 
                        isExternal: false, 
                        status: 'team', 
                        role: prev.role === 'partner' ? 'employee' : (prev.role || 'employee')
                      }))} 
                      className={cn(
                        "py-3 px-4 text-sm font-bold rounded-xl transition-all flex items-center gap-3 cursor-pointer text-left", 
                        !newContact.isExternal 
                          ? "bg-gradient-to-r from-accent-ai to-indigo-600 text-white shadow-md" 
                          : "text-text-muted hover:text-text-primary hover:bg-white/5"
                      )}
                    >
                      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", !newContact.isExternal ? "bg-white/20 text-white" : "bg-surface border border-border text-text-muted")}>
                        <Users size={18} />
                      </div>
                      <div>
                        <div className="font-bold leading-tight text-sm">{t('internal_team_title')}</div>
                        <div className={cn("text-[11px] font-medium mt-0.5", !newContact.isExternal ? "text-white/80" : "text-text-muted")}>
                          Mitarbeiter, Zugriffsrechte & Stundensatz
                        </div>
                      </div>
                    </button>

                    <button 
                      type="button" 
                      onClick={() => setNewContact((prev: any) => ({
                        ...prev, 
                        isExternal: true, 
                        status: (prev.status === 'team' ? 'partner' : (prev.status || 'neu')), 
                        role: 'partner'
                      }))} 
                      className={cn(
                        "py-3 px-4 text-sm font-bold rounded-xl transition-all flex items-center gap-3 cursor-pointer text-left", 
                        newContact.isExternal 
                          ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md" 
                          : "text-text-muted hover:text-text-primary hover:bg-white/5"
                      )}
                    >
                      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", newContact.isExternal ? "bg-white/20 text-white" : "bg-surface border border-border text-text-muted")}>
                        <Building2 size={18} />
                      </div>
                      <div>
                        <div className="font-bold leading-tight text-sm">{t('external_partner_title')}</div>
                        <div className={cn("text-[11px] font-medium mt-0.5", newContact.isExternal ? "text-white/80" : "text-text-muted")}>
                          Kunden, Fachplaner, Handwerker & Firmen
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* LINKE SPALTE: BILD / SCANNER / INFO */}
                  <div className="lg:col-span-1 space-y-5">
                    <div className="bg-surface border border-border/60 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm">
                      <div onClick={() => avatarInputRef.current?.click()} className={cn("relative w-24 h-24 bg-background border border-border flex items-center justify-center cursor-pointer group overflow-hidden mb-4 hover:border-accent-ai transition-colors", !newContact.isExternal ? "rounded-full" : "rounded-2xl")}>
                        {sanitizeUrl(avatarPreview) ? <img src={sanitizeUrl(avatarPreview)} alt="Preview" className="w-full h-full object-cover" /> : <Camera size={32} className="text-text-muted group-hover:text-accent-ai transition-colors" />}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera size={20} className="text-white"/></div>
                      </div>
                      <input type="file" accept="image/*" ref={avatarInputRef} onChange={handleAvatarSelect} className="hidden" />
                      <h4 className="text-sm font-bold text-text-primary">
                        {!newContact.isExternal ? t('team_photo') : t('company_logo_label')}
                      </h4>
                      <p className="text-xs text-text-muted mt-1 font-medium">{t('click_to_upload')}</p>
                    </div>

                    {!newContact.isExternal ? (
                      /* INTERNE INFO-BOXEN */
                      <>
                        <div className="bg-accent-ai/5 border border-accent-ai/20 rounded-2xl p-4 space-y-2">
                          <h4 className="text-xs font-bold text-accent-ai flex items-center gap-1.5">
                            <ShieldCheck size={16}/> {t('workspace_access_title')}
                          </h4>
                          <p className="text-[11px] text-text-muted leading-relaxed font-medium">
                            {t('workspace_access_hint')}
                          </p>
                        </div>

                        <div className="bg-surface border border-border/60 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-2.5">
                            <Award size={16} className="text-accent-ai" />
                            <div>
                              <div className="text-xs font-bold text-text-primary">Kürzel auf Plänen</div>
                              <div className="text-[11px] text-text-muted">Für Freigaben & Baustellenprotokolle</div>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 bg-background border border-border rounded-lg text-xs font-sans font-bold text-text-primary">
                            {newContact.initials || (newContact.firstName ? (newContact.firstName.charAt(0) + (newContact.lastName ? newContact.lastName.charAt(0) : '')).toUpperCase() : 'MA')}
                          </span>
                        </div>
                      </>
                    ) : (
                      /* EXTERNE INFO-BOXEN & LIVE QR SCANNER */
                      <>
                        {!newContact.id && (
                          <div className="bg-surface border border-blue-500/20 rounded-2xl p-5 flex flex-col items-center text-center relative overflow-hidden group shadow-sm">
                            <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
                            <h4 className="text-sm font-bold text-blue-500 mb-1 flex items-center gap-2 relative z-10"><Smartphone size={16}/> {t('live_qr_scanner')}</h4>
                            <p className="text-xs text-text-muted mb-4 relative z-10 font-medium">Scanne Visitenkarten mit dem Handy – KI füllt Firma, Name & Telefon direkt aus!</p>
                            <div className="bg-white p-2 rounded-xl relative z-10 shadow-lg"><QRCode value={mobileUploadUrl} size={120} /></div>
                          </div>
                        )}
                        <div className="bg-surface border border-border/60 rounded-2xl p-4 space-y-1 text-left shadow-sm">
                          <div className="text-xs font-bold text-text-primary flex items-center gap-1.5"><Tag size={13} className="text-blue-500" /> Projekt-Verknüpfung</div>
                          <p className="text-[11px] text-text-muted leading-relaxed font-medium">
                            Partner können direkt Bauprojekten zugewiesen werden, um Mängel, Aufgaben und Abnahmen zu koordinieren.
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* RECHTE SPALTE: FORMULAR-FELDER */}
                  <div className="lg:col-span-2">
                    <form id="contact-form" onSubmit={handleAddContact} className="space-y-5">
                      
                      {!newContact.isExternal ? (
                        /* ============================================================ */
                        /* FORMULAR FÜR INTERNES TEAMMITGLIED                          */
                        /* ============================================================ */
                        <div className="space-y-5">
                          {/* Info Banner */}
                          <div className="bg-accent-ai/5 border border-accent-ai/20 rounded-xl p-3 flex items-center gap-2.5">
                            <UserCheck size={16} className="text-accent-ai shrink-0" />
                            <p className="text-xs font-medium text-text-primary">
                              Internes Mitarbeiter-Profil. Firmenangaben wie UID und MwSt.-Nummer werden hier nicht benötigt.
                            </p>
                          </div>

                          {/* Vorname & Nachname */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{t('first_name')} *</label>
                              <input type="text" value={newContact.firstName} onChange={e => setNewContact((prev: any) => ({...prev, firstName: e.target.value}))} placeholder="z. B. Max" className="w-full bg-surface border border-border/60 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{t('last_name')} *</label>
                              <input type="text" value={newContact.lastName} onChange={e => setNewContact((prev: any) => ({...prev, lastName: e.target.value}))} placeholder="z. B. Muster" className="w-full bg-surface border border-border/60 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" />
                            </div>
                          </div>

                          {/* Position & Abteilung */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5"><Briefcase size={14}/> {t('position_job')}</label>
                              <input type="text" list="positions-list" value={newContact.jobTitle} onChange={e => setNewContact((prev: any) => ({...prev, jobTitle: e.target.value}))} placeholder="z. B. Projektleiter, Architekt FH" className="w-full bg-surface border border-border/60 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" />
                              <datalist id="positions-list">
                                <option value="Projektleiter / Projektleiterin" />
                                <option value="Architekt FH / ETH" />
                                <option value="Bauleiter / Bauleiterin" />
                                <option value="Junior Architekt / Architektin" />
                                <option value="Zeichner EFZ Architektur" />
                                <option value="Interior Designer" />
                                <option value="Geschäftsleitung / Partner" />
                                <option value="Administration & Finanzen" />
                              </datalist>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5"><Layers size={14}/> {t('department')}</label>
                              <input type="text" list="departments-list" value={newContact.department} onChange={e => setNewContact((prev: any) => ({...prev, department: e.target.value}))} placeholder="z. B. Architektur & Planung" className="w-full bg-surface border border-border/60 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" />
                              <datalist id="departments-list">
                                <option value="Architektur & Entwurf" />
                                <option value="Bauleitung & Realisierung" />
                                <option value="Geschäftsleitung" />
                                <option value="Projektmanagement" />
                                <option value="Administration & Finanzen" />
                              </datalist>
                            </div>
                          </div>

                          {/* E-Mail & Telefon */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
                                <span className="flex items-center gap-1.5"><Mail size={14}/> {t('email')} *</span>
                                <span className="text-[10px] text-accent-ai font-semibold">Workspace-Login</span>
                              </label>
                              <input type="email" value={newContact.email} onChange={e => setNewContact((prev: any) => ({...prev, email: e.target.value}))} placeholder="m.muster@firma.ch" className="w-full bg-surface border border-border/60 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5"><Phone size={14}/> {t('phone')}</label>
                              <input type="text" value={newContact.phone} onChange={e => setNewContact((prev: any) => ({...prev, phone: e.target.value}))} placeholder="+41 79 123 45 67" className="w-full bg-surface border border-border/60 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" />
                            </div>
                          </div>

                          {/* System-Rolle & Zugriffsrechte */}
                          <div className="space-y-2 pt-1">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                              <Shield size={14} className="text-accent-ai" /> {t('system_access_role')}
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {[
                                { id: 'employee', label: t('mitarbeiter'), desc: t('role_employee_desc'), icon: <UserCheck size={16} className="text-accent-ai" /> },
                                { id: 'project_lead', label: 'Projektleiter', desc: t('role_project_lead_desc'), icon: <Briefcase size={16} className="text-indigo-400" /> },
                                { id: 'owner', label: t('owner_management'), desc: t('role_owner_desc'), icon: <Award size={16} className="text-amber-400" /> },
                                { id: 'viewer', label: t('viewer'), desc: t('role_viewer_desc'), icon: <Shield size={16} className="text-emerald-400" /> }
                              ].map(r => (
                                <div 
                                  key={r.id} 
                                  onClick={() => setNewContact((prev: any) => ({...prev, role: r.id}))} 
                                  className={cn(
                                    "p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3",
                                    newContact.role === r.id 
                                      ? "bg-accent-ai/10 border-accent-ai shadow-sm" 
                                      : "bg-surface border-border/60 hover:bg-white/5"
                                  )}
                                >
                                  <div className="mt-0.5 shrink-0">{r.icon}</div>
                                  <div>
                                    <div className="text-xs font-bold text-text-primary">{r.label}</div>
                                    <div className="text-[11px] text-text-muted leading-tight mt-0.5">{r.desc}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Kalkulation & Anstellung */}
                          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl border border-border/60 bg-surface/40 shadow-sm">
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1"><DollarSign size={13}/> Stundensatz</label>
                              <div className="relative">
                                <input type="number" min="0" step="5" value={newContact.hourlyRate} onChange={e => setNewContact((prev: any) => ({...prev, hourlyRate: e.target.value}))} placeholder="140" className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-xs outline-none focus:border-accent-ai text-text-primary font-bold pr-14" />
                                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-text-muted font-bold">CHF/h</span>
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1"><BadgePercent size={13}/> Pensum</label>
                              <select value={newContact.workload || '100%'} onChange={e => setNewContact((prev: any) => ({...prev, workload: e.target.value}))} className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-xs outline-none focus:border-accent-ai text-text-primary font-bold">
                                <option value="100%">100% (Vollzeit)</option>
                                <option value="80%">80%</option>
                                <option value="60%">60%</option>
                                <option value="50%">50% (Teilzeit)</option>
                                <option value="40%">40%</option>
                                <option value="20%">20%</option>
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1"><Award size={13}/> Kürzel</label>
                              <input type="text" maxLength={4} value={newContact.initials} onChange={e => setNewContact((prev: any) => ({...prev, initials: e.target.value.toUpperCase()}))} placeholder="z. B. MM" className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-xs outline-none focus:border-accent-ai text-text-primary font-sans font-bold uppercase text-center" />
                            </div>
                          </div>

                          {/* Interne Notizen */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5"><FileText size={14}/> {t('internal_notes')}</label>
                            <textarea value={newContact.description} onChange={e => setNewContact((prev: any) => ({...prev, description: e.target.value}))} rows={2} placeholder="Spezialisierungen, Zertifikate, interne Aufgabenbereiche..." className="w-full bg-surface border border-border/60 rounded-xl px-4 py-2 text-sm outline-none focus:border-accent-ai resize-none custom-scrollbar text-text-primary font-medium" />
                          </div>
                        </div>
                      ) : (
                        /* ============================================================ */
                        /* FORMULAR FÜR EXTERNEN PARTNER / KUNDE / FACHPLANER           */
                        /* ============================================================ */
                        <div className="space-y-5">
                          {/* Partner-Kategorie Chips */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                              <Building2 size={14} className="text-blue-500" /> {t('partner_category')} *
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {[
                                { id: 'client', label: t('category_client'), icon: <Building2 size={14} /> },
                                { id: 'planner', label: t('category_planner'), icon: <Compass size={14} /> },
                                { id: 'craftsman', label: t('category_craftsman'), icon: <Hammer size={14} /> },
                                { id: 'supplier', label: t('category_supplier'), icon: <Package size={14} /> },
                                { id: 'authority', label: t('category_authority'), icon: <Landmark size={14} /> },
                                { id: 'lead', label: t('category_lead'), icon: <Sparkles size={14} /> },
                              ].map(cat => (
                                <button
                                  type="button"
                                  key={cat.id}
                                  onClick={() => setNewContact((prev: any) => ({
                                    ...prev,
                                    partnerCategory: cat.id,
                                    role: cat.id === 'client' ? 'client' : (cat.id === 'lead' ? 'guest' : 'partner'),
                                    status: cat.id === 'lead' ? 'lead' : (cat.id === 'client' ? 'partner' : 'partner')
                                  }))}
                                  className={cn(
                                    "py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer",
                                    newContact.partnerCategory === cat.id 
                                      ? "bg-blue-500/10 border-blue-500 text-blue-500 shadow-sm" 
                                      : "bg-surface border-border/60 text-text-muted hover:text-text-primary hover:bg-white/5"
                                  )}
                                >
                                  <span className="shrink-0">{cat.icon}</span>
                                  <span className="truncate">{cat.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Firma & Gewerk */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5"><Building size={14}/> {t('company')} *</label>
                              <input type="text" value={newContact.company} onChange={e => setNewContact((prev: any) => ({...prev, company: e.target.value}))} placeholder="z. B. Keller Holzbau AG" className="w-full bg-surface border border-border/60 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent-ai font-bold text-text-primary" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5"><Tag size={14}/> {t('trade_field')}</label>
                              <input type="text" list="trades-list" value={newContact.trade} onChange={e => setNewContact((prev: any) => ({...prev, trade: e.target.value}))} placeholder="z. B. Sanitär & Heizung, Holzbau" className="w-full bg-surface border border-border/60 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" />
                              <datalist id="trades-list">
                                <option value="Sanitär & Heizung" />
                                <option value="Elektroinstallation" />
                                <option value="Holzbau & Zimmerei" />
                                <option value="Baumeister / Rohbau" />
                                <option value="Tragwerksplanung / Statik" />
                                <option value="HLKS Ingenieur" />
                                <option value="Fassadenbau & Fenster" />
                                <option value="Gipser & Maler" />
                                <option value="Landschaftsarchitektur" />
                                <option value="Bauherrschaft / Kunde" />
                              </datalist>
                            </div>
                          </div>

                          {/* Ansprechperson */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{t('first_name')}</label>
                              <input type="text" value={newContact.firstName} onChange={e => setNewContact((prev: any) => ({...prev, firstName: e.target.value}))} placeholder="Vorname Ansprechperson" className="w-full bg-surface border border-border/60 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{t('last_name')}</label>
                              <input type="text" value={newContact.lastName} onChange={e => setNewContact((prev: any) => ({...prev, lastName: e.target.value}))} placeholder="Nachname Ansprechperson" className="w-full bg-surface border border-border/60 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5"><UserCheck size={14}/> Funktion</label>
                              <input type="text" value={newContact.contactPersonRole} onChange={e => setNewContact((prev: any) => ({...prev, contactPersonRole: e.target.value}))} placeholder="z. B. Bauführer, GF" className="w-full bg-surface border border-border/60 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" />
                            </div>
                          </div>

                          {/* Kommunikation */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5"><Mail size={14}/> {t('email')}</label>
                              <input type="email" value={newContact.email} onChange={e => setNewContact((prev: any) => ({...prev, email: e.target.value}))} placeholder="info@partner.ch" className="w-full bg-surface border border-border/60 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5"><Phone size={14}/> {t('phone')}</label>
                              <input type="text" value={newContact.phone} onChange={e => setNewContact((prev: any) => ({...prev, phone: e.target.value}))} placeholder="+41 44 123 45 67" className="w-full bg-surface border border-border/60 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5"><Globe size={14}/> {t('website')}</label>
                              <input type="text" value={newContact.website} onChange={e => setNewContact((prev: any) => ({...prev, website: e.target.value}))} placeholder="www.partner.ch" className="w-full bg-surface border border-border/60 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" />
                            </div>
                          </div>

                          {/* Adresse */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-border/60 bg-surface/40 shadow-sm">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5"><MapPin size={14}/> {t('street_number')}</label>
                              <input type="text" value={newContact.street} onChange={e => setNewContact((prev: any) => ({...prev, street: e.target.value}))} placeholder="Gewerbestrasse 10" className="w-full bg-background border border-border/60 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{t('zip_code')} & {t('city')}</label>
                              <input type="text" value={newContact.zipCity} onChange={e => setNewContact((prev: any) => ({...prev, zipCity: e.target.value}))} placeholder="8000 Zürich" className="w-full bg-background border border-border/60 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" />
                            </div>
                          </div>

                          {/* Rechtliche & Steuerliche Angaben */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{t('uid_number')}</label>
                              <input type="text" value={newContact.uid} onChange={e => setNewContact((prev: any) => ({...prev, uid: e.target.value}))} placeholder="CHE-123.456.789" className="w-full bg-surface border border-border/60 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{t('vat_number')}</label>
                              <input type="text" value={newContact.vat} onChange={e => setNewContact((prev: any) => ({...prev, vat: e.target.value}))} placeholder="CHE-123.456.789 MWST" className="w-full bg-surface border border-border/60 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5"><Clock size={14}/> {t('payment_terms')}</label>
                              <select value={newContact.paymentTerms || '30 Tage netto'} onChange={e => setNewContact((prev: any) => ({...prev, paymentTerms: e.target.value}))} className="w-full bg-surface border border-border/60 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium">
                                <option value="30 Tage netto">30 Tage netto</option>
                                <option value="10 Tage 2% Skonto, 30 Tage netto">10 Tage 2% Skonto, 30 netto</option>
                                <option value="14 Tage netto">14 Tage netto</option>
                                <option value="Sofort nach Erhalt">Sofort nach Erhalt</option>
                                <option value="Vorauskasse">Vorauskasse</option>
                              </select>
                            </div>
                          </div>

                          {/* Projektzuweisung & Notizen */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5"><FolderKanban size={14}/> {t('assigned_project')}</label>
                              <select value={newContact.assignedProjectId || ''} onChange={e => setNewContact((prev: any) => ({...prev, assignedProjectId: e.target.value}))} className="w-full bg-surface border border-border/60 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium">
                                <option value="">{t('no_project_assigned')}</option>
                                {projects.map((p: any) => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5"><FileText size={14}/> {t('internal_notes')}</label>
                              <textarea value={newContact.description} onChange={e => setNewContact((prev: any) => ({...prev, description: e.target.value}))} rows={2} placeholder="Konditionen, Notizen, Vereinbarungen..." className="w-full bg-surface border border-border/60 rounded-xl px-4 py-2 text-sm outline-none focus:border-accent-ai resize-none custom-scrollbar text-text-primary font-medium" />
                            </div>
                          </div>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 border-t border-border/60 bg-surface/90 shrink-0 flex justify-end gap-3">
                <button type="button" onClick={closeAddModal} className="px-5 py-2.5 text-sm font-bold text-text-muted hover:text-text-primary transition-colors cursor-pointer">{t('cancel')}</button>
                <button form="contact-form" type="submit" disabled={isSubmitting} className={cn("px-7 py-2.5 text-white rounded-xl text-sm font-bold shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer", !newContact.isExternal ? "bg-accent-ai hover:bg-accent-ai/90 shadow-accent-ai/20" : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20")}>
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} 
                  {newContact.id ? t('save_changes') : t('save_contact')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* UNIVERSAL PDF PRINT STUDIO - PORTAL */}
      {isPrintModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-background border border-border/50 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="w-80 border-r border-border/50 bg-surface/30 flex flex-col shrink-0">
              <div className="p-6 pb-4 border-b border-border/50 flex items-center justify-between">
                <h3 className="font-semibold text-lg text-text-primary flex items-center gap-2"><PenTool size={18} className="text-accent-ai" /> {t('export_pdf_title')}</h3>
                <button onClick={() => setIsPrintModalOpen(false)} className="text-text-muted hover:text-text-primary transition-colors"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('company_logo')}</label>
                  <div className="border-2 border-dashed border-border/50 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-surface transition-colors cursor-pointer relative">
                    <input type="file" accept="image/*" onChange={handlePdfLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    {pdfLogo ? <div className="text-xs text-emerald-400 font-bold">{t('logo_loaded')}</div> : <><ImageIcon size={24} className="text-text-muted mb-2" /><span className="text-xs text-text-muted font-medium">{t('upload_logo')}</span></>}
                  </div>
                </div>
                <div className="space-y-2"><label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('color')}</label><input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="w-full h-9 bg-background border border-border/50 rounded-lg cursor-pointer px-1 py-1" /></div>
                <div className="space-y-4">
                  <div className="space-y-2"><label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('title')}</label><input type="text" value={docHeader.title} onChange={e => setDocHeader({...docHeader, title: e.target.value})} className="w-full bg-background border border-border/50 rounded-md px-3 py-2 text-sm focus:border-accent-ai outline-none font-bold text-text-primary" /></div>
                  <div className="space-y-2"><label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('project')}</label><input type="text" value={docHeader.project} onChange={e => setDocHeader({...docHeader, project: e.target.value})} className="w-full bg-background border border-border/50 rounded-md px-3 py-2 text-sm focus:border-accent-ai outline-none font-bold text-text-primary" /></div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('format')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setPrintSettings({...printSettings, format: 'a4'})} className={cn("py-2 px-3 text-sm font-bold rounded-md border transition-colors", printSettings.format === 'a4' ? "bg-accent-ai/10 border-accent-ai text-accent-ai" : "bg-surface border-border/50 text-text-muted")}>A4</button>
                    <button onClick={() => setPrintSettings({...printSettings, format: 'a3'})} className={cn("py-2 px-3 text-sm font-bold rounded-md border transition-colors", printSettings.format === 'a3' ? "bg-accent-ai/10 border-accent-ai text-accent-ai" : "bg-surface border-border/50 text-text-muted")}>A3</button>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('orientation')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setPrintSettings({...printSettings, orientation: 'portrait'})} className={cn("py-2 px-3 text-sm font-bold rounded-md border transition-colors", printSettings.orientation === 'portrait' ? "bg-accent-ai/10 border-accent-ai text-accent-ai" : "bg-surface border-border/50 text-text-muted")}>{t('portrait')}</button>
                    <button onClick={() => setPrintSettings({...printSettings, orientation: 'landscape'})} className={cn("py-2 px-3 text-sm font-bold rounded-md border transition-colors", printSettings.orientation === 'landscape' ? "bg-accent-ai/10 border-accent-ai text-accent-ai" : "bg-surface border-border/50 text-text-muted")}>{t('landscape')}</button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('scale_preview')}</label><span className="text-xs text-text-muted font-bold">{Math.round(printSettings.scale * 100)}%</span></div>
                  <input type="range" min="0.5" max="1.5" step="0.05" value={printSettings.scale} onChange={(e) => setPrintSettings({...printSettings, scale: parseFloat(e.target.value)})} className="w-full accent-accent-ai [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
              </div>
              <div className="p-4 border-t border-border/50 bg-background flex flex-col gap-3">
                <button onClick={executeStudioPDFExportCloud} disabled={isUploadingToCloud || isGeneratingPdf} className="w-full py-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-sm font-bold hover:bg-indigo-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm">{isUploadingToCloud ? <Loader2 size={16} className="animate-spin" /> : <Cloud size={16} />} {isUploadingToCloud ? t('saving_cloud') : t('save_cloud')}</button>
                <button onClick={executeStudioPDFExportLocal} disabled={isGeneratingPdf || isUploadingToCloud} className="w-full py-3 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-500 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">{isGeneratingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} {isGeneratingPdf ? t('generating_pdf') : t('download_local')}</button>
              </div>
            </div>
            
            <div className="flex-1 bg-zinc-900/50 overflow-y-auto p-8 flex justify-center custom-scrollbar relative">
              <div className="absolute bottom-6 right-6 bg-surface border border-border/50 rounded-full shadow-2xl flex items-center p-1 z-[100]">
                 <button onClick={() => setPrintSettings(s => ({...s, scale: Math.max(0.4, s.scale - 0.1)}))} className="p-2 hover:bg-white/10 rounded-full text-text-muted hover:text-text-primary transition-colors"><ZoomOut size={18}/></button>
                 <span className="text-xs font-bold w-12 text-center text-text-primary">{Math.round(printSettings.scale * 100)}%</span>
                 <button onClick={() => setPrintSettings(s => ({...s, scale: Math.min(2.0, s.scale + 0.1)}))} className="p-2 hover:bg-white/10 rounded-full text-text-muted hover:text-text-primary transition-colors"><ZoomIn size={18}/></button>
               </div>
              <div className="bg-white text-black shadow-2xl transition-all duration-300 origin-top overflow-hidden flex flex-col shrink-0" style={{ width: printSettings.orientation === 'portrait' ? (printSettings.format === 'a4' ? '210mm' : '297mm') : (printSettings.format === 'a4' ? '297mm' : '420mm'), minHeight: printSettings.orientation === 'portrait' ? (printSettings.format === 'a4' ? '297mm' : '420mm') : (printSettings.format === 'a4' ? '210mm' : '297mm'), transform: `scale(${printSettings.scale})`, transformOrigin: 'top center', marginBottom: `${(printSettings.scale - 1) * 100}%` }}>
                <div className="relative flex flex-col p-12 min-h-full bg-white text-black">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-8 border-b-2 pb-6 shrink-0" style={{ borderColor: themeColor }}>
                    <div className="flex-1 flex flex-col gap-3 min-w-0 pr-4">
                       <h1 className="text-4xl font-extrabold text-black">{docHeader.title}</h1>
                       <div className="flex items-center gap-6 mt-2">
                          <div className="flex items-center gap-2"><span className="text-xs font-bold uppercase tracking-widest text-gray-500">{t('project')}:</span><span className="font-bold text-base text-black">{docHeader.project}</span></div>
                          <div className="flex items-center gap-2"><span className="text-xs font-bold uppercase tracking-widest text-gray-500">{t('date')}:</span><span className="font-bold text-base text-black">{new Date(docHeader.date).toLocaleDateString('de-CH')}</span></div>
                       </div>
                    </div>
                    {pdfLogo && <div className="h-20 w-48 flex items-center justify-end shrink-0 ml-4"><img src={pdfLogo} alt="Logo" className="h-full w-auto max-w-full object-contain object-right" /></div>}
                  </div>
                  
                  {selectedContact && !isSelectionMode ? (
                    <div className="flex-1 flex flex-col">
                      <h2 className="text-2xl font-bold mb-8 text-black">{formatName(selectedContact)}</h2>
                      <div className="grid grid-cols-2 gap-y-6">
                        <div><div className="text-xs font-bold uppercase tracking-widest text-gray-500">{t('company')}</div><div className="text-lg text-black">{selectedContact.company || '-'}</div></div>
                        <div><div className="text-xs font-bold uppercase tracking-widest text-gray-500">{t('email')}</div><div className="text-lg text-black">{selectedContact.email || '-'}</div></div>
                        <div><div className="text-xs font-bold uppercase tracking-widest text-gray-500">{t('phone')}</div><div className="text-lg text-black">{selectedContact.phone || '-'}</div></div>
                        <div><div className="text-xs font-bold uppercase tracking-widest text-gray-500">{t('location_business')}</div><div className="text-lg text-black">{selectedContact.street || ''} {selectedContact.zipCity || ''}</div></div>
                      </div>
                      {selectedContact.description && (
                        <div className="mt-10 pt-6 border-t border-gray-200">
                          <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">{t('internal_notes')}</div>
                          <div className="text-base text-black whitespace-pre-wrap">{selectedContact.description}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col min-h-0">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-gray-100 border-b border-gray-300">
                          <tr><th className="py-3 px-4 font-bold text-black">Name</th><th className="py-3 px-4 font-bold text-black">Firma</th><th className="py-3 px-4 font-bold text-black">Kontakt</th><th className="py-3 px-4 font-bold text-black text-right">Status</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredContacts.slice(0, 15).map((contact) => (
                            <tr key={contact.id}>
                              <td className="py-3 px-4 font-bold text-black">{safeStr(formatName(contact), 20)}</td>
                              <td className="py-3 px-4 text-gray-600">{safeStr(contact.company, 20)}</td>
                              <td className="py-3 px-4 text-gray-600">{safeStr(contact.email, 25)}<br/>{safeStr(contact.phone, 20)}</td>
                              <td className="py-3 px-4 font-bold text-black text-right">{safeStr(contact.status, 15) || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredContacts.length > 15 && <div className="text-center text-gray-400 mt-4 italic">+ {filteredContacts.length - 15} weitere Kontakte...</div>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* VISITENKARTE SCANNER MODAL */}
      {isScannerModalOpen && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-surface border border-border/50 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
            
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-surface/50">
              <h3 className="font-bold text-lg flex items-center gap-2 text-text-primary">
                <Camera size={20} className="text-accent-ai" /> Visitenkarte scannen & KI-Erfassung
              </h3>
              <button onClick={() => { setIsScannerModalOpen(false); setScannedCardPreview(null); }} className="text-text-muted hover:text-text-primary p-2">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">
              
              {/* AKTIONEN: FOTO NEHMEN / HOCHLADEN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-background border border-border/50 rounded-xl p-5 flex flex-col items-center justify-center text-center">
                  <input type="file" accept="image/*" capture="environment" ref={scannerInputRef} className="hidden" onChange={handleBusinessCardScan} />
                  <button
                    type="button"
                    onClick={() => scannerInputRef.current?.click()}
                    disabled={isScanningCard}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isScanningCard ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                    {isScanningCard ? 'Analysiere Visitenkarte...' : 'Visitenkarte fotografieren / Bild wählen'}
                  </button>
                  <p className="text-xs text-text-muted mt-2 font-medium">
                    Fotografiere eine Visitenkarte – KI liest Name, Firma, E-Mail & Telefon automatisch aus.
                  </p>
                </div>

                <div className="bg-background border border-blue-500/20 rounded-xl p-4 flex flex-col items-center text-center">
                  <h4 className="text-xs font-bold text-blue-500 mb-1 flex items-center gap-1.5"><Smartphone size={14} /> Smartphone QR-Scan</h4>
                  <p className="text-[11px] text-text-muted mb-2 font-medium">Scanne diesen Code mit der Handy-Kamera:</p>
                  <div className="bg-white p-2 rounded-lg border border-border shadow-sm">
                    <QRCode value={mobileUploadUrl} size={110} />
                  </div>
                </div>
              </div>

              {/* BILD VORSCHAU & KI STATUS */}
              {isScanningCard && (
                <div className="p-6 bg-accent-ai/10 border border-accent-ai/20 rounded-xl text-center flex flex-col items-center justify-center gap-3">
                  <Loader2 size={28} className="animate-spin text-accent-ai" />
                  <p className="text-sm font-bold text-accent-ai">Visitenkarte wird per KI analysiert und ausgelesen...</p>
                </div>
              )}

              {scannedCardPreview && !isScanningCard && (
                <div className="flex items-center gap-4 p-3 bg-background border border-border/50 rounded-xl">
                  <div className="w-24 h-16 rounded-lg overflow-hidden border border-border shrink-0 bg-black">
                    <img src={scannedCardPreview} alt="Scanned card" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-primary">Visitenkarten-Foto erfasst</p>
                    <p className="text-[11px] text-text-muted">Klicke unten auf "Kontakt im CRM speichern", um diesen Eintrag zu erstellen.</p>
                  </div>
                </div>
              )}

              {/* GESCANNTE FORMULAR DATEN */}
              <form onSubmit={handleSaveScannedContactToCRM} className="space-y-4 pt-2 border-t border-border/50">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest">Gescannte Kontaktdaten (KI-Vorausgefüllt)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase">Vorname</label>
                    <input type="text" value={scannedContactData.firstName} onChange={e => setScannedContactData({ ...scannedContactData, firstName: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none focus:border-accent-ai" placeholder="Vorname" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase">Nachname</label>
                    <input type="text" value={scannedContactData.lastName} onChange={e => setScannedContactData({ ...scannedContactData, lastName: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none focus:border-accent-ai" placeholder="Nachname" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase">Firma</label>
                    <input type="text" value={scannedContactData.company} onChange={e => setScannedContactData({ ...scannedContactData, company: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none focus:border-accent-ai" placeholder="Firma" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase">Position / Jobtitel</label>
                    <input type="text" value={scannedContactData.description} onChange={e => setScannedContactData({ ...scannedContactData, description: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none focus:border-accent-ai" placeholder="Position / Notizen" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase">E-Mail</label>
                    <input type="email" value={scannedContactData.email} onChange={e => setScannedContactData({ ...scannedContactData, email: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none focus:border-accent-ai" placeholder="email@firma.ch" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase">Telefon</label>
                    <input type="text" value={scannedContactData.phone} onChange={e => setScannedContactData({ ...scannedContactData, phone: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none focus:border-accent-ai" placeholder="+41 ..." />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase">Strasse & Hausnummer</label>
                    <input type="text" value={scannedContactData.street} onChange={e => setScannedContactData({ ...scannedContactData, street: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none focus:border-accent-ai" placeholder="Strasse 12" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase">PLZ & Ort</label>
                    <input type="text" value={scannedContactData.zipCity} onChange={e => setScannedContactData({ ...scannedContactData, zipCity: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none focus:border-accent-ai" placeholder="8000 Zürich" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase">Webseite</label>
                    <input type="text" value={scannedContactData.website} onChange={e => setScannedContactData({ ...scannedContactData, website: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none focus:border-accent-ai" placeholder="www.firma.ch" />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-border/50">
                  <button type="button" onClick={() => { setIsScannerModalOpen(false); setScannedCardPreview(null); }} className="px-5 py-2.5 text-sm font-bold text-text-muted hover:text-text-primary transition-colors">
                    {t('cancel')}
                  </button>
                  <button type="submit" disabled={isSubmitting || isScanningCard} className="px-7 py-2.5 bg-accent-ai text-white rounded-xl text-sm font-bold shadow-lg shadow-accent-ai/20 hover:bg-accent-ai/90 transition-all flex items-center gap-2 disabled:opacity-50">
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    {t('save_contact')}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* EINLADUNGS-E-MAIL VORLAGE MODAL (DE & EN, INTERN & EXTERN) */}
      {isInviteModalOpen && inviteModalContact && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto animate-in fade-in duration-200">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-surface border border-border/60 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-border/50 flex items-center justify-between bg-surface/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-ai/10 border border-accent-ai/20 text-accent-ai flex items-center justify-center">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-text-primary flex items-center gap-2">
                    E-Mail-Einladung vorbereiten
                  </h3>
                  <p className="text-xs text-text-muted font-medium">
                    Für {formatName(inviteModalContact)} ({inviteModalContact.email})
                  </p>
                </div>
              </div>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-text-muted hover:text-text-primary p-2 rounded-xl hover:bg-white/5 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-5 flex-1 text-left">
              
              {/* Sprache & Vorlagen-Typ Steuerung */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-background/60 border border-border/50 rounded-2xl">
                {/* Sprache Umschalten */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1.5">
                    Sprache / Language
                  </label>
                  <div className="flex gap-1.5 p-1 bg-surface border border-border/40 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setInviteModalLang('de')}
                      className={cn(
                        "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
                        inviteModalLang === 'de' ? "bg-accent-ai text-white shadow-sm" : "text-text-muted hover:text-text-primary"
                      )}
                    >
                      🇩🇪 Deutsch
                    </button>
                    <button
                      type="button"
                      onClick={() => setInviteModalLang('en')}
                      className={cn(
                        "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
                        inviteModalLang === 'en' ? "bg-accent-ai text-white shadow-sm" : "text-text-muted hover:text-text-primary"
                      )}
                    >
                      🇬🇧 English
                    </button>
                  </div>
                </div>

                {/* Vorlagen-Typ Umschalten */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1.5">
                    Empfänger-Typ / Rolle
                  </label>
                  <div className="flex gap-1.5 p-1 bg-surface border border-border/40 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setInviteModalType('internal')}
                      className={cn(
                        "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
                        inviteModalType === 'internal' ? "bg-accent-ai text-white shadow-sm" : "text-text-muted hover:text-text-primary"
                      )}
                    >
                      🏢 Internes Team
                    </button>
                    <button
                      type="button"
                      onClick={() => setInviteModalType('external')}
                      className={cn(
                        "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
                        inviteModalType === 'external' ? "bg-accent-ai text-white shadow-sm" : "text-text-muted hover:text-text-primary"
                      )}
                    >
                      📐 Externer Planer
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Preview Box */}
              {(() => {
                const { subject, body } = getInviteEmailTemplate(inviteModalContact, inviteModalUrl, inviteModalLang, inviteModalType);
                return (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">
                        Betreffzeile / Subject
                      </label>
                      <div className="p-3 bg-background border border-border/60 rounded-xl text-xs sm:text-sm font-bold text-text-primary select-all">
                        {subject}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">
                        Nachrichtentext / Body
                      </label>
                      <div className="p-4 bg-background border border-border/60 rounded-xl text-[13px] sm:text-sm font-sans font-normal leading-relaxed text-text-primary max-h-56 overflow-y-auto custom-scrollbar whitespace-pre-wrap select-all">
                        {body}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-border/50 bg-surface/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    const { body } = getInviteEmailTemplate(inviteModalContact, inviteModalUrl, inviteModalLang, inviteModalType);
                    navigator.clipboard.writeText(body);
                    addToast('📋 Einladungstext in Zwischenablage kopiert!', 'success');
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-surface border border-border/60 hover:bg-white/5 text-text-primary rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Copy size={14} /> Text kopieren
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(inviteModalUrl);
                    addToast('🔗 Einladungslink in Zwischenablage kopiert!', 'success');
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-surface border border-border/60 hover:bg-white/5 text-text-primary rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <LinkIcon size={14} /> Nur Link
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-text-muted hover:text-text-primary transition-colors"
                >
                  Schliessen
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const { subject, body } = getInviteEmailTemplate(inviteModalContact, inviteModalUrl, inviteModalLang, inviteModalType);
                    window.open(`mailto:${inviteModalContact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
                    addToast('✉️ E-Mail-Programm geöffnet!', 'success');
                    setIsInviteModalOpen(false);
                  }}
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-accent-ai hover:bg-accent-ai/90 text-white rounded-xl text-xs font-bold shadow-lg shadow-accent-ai/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send size={14} /> In Mailprogramm öffnen
                </button>
              </div>
            </div>

          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
}