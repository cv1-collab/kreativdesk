import { checkIsSuperAdmin } from '../config/admins';
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { jsPDF } from 'jspdf';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, Mail, Building, Phone, Shield, 
  Search, UserPlus, CheckCircle2, ShieldAlert,
  X, Loader2, FileUp, Camera, Smartphone, Globe, MapPin, FileText, Briefcase,
  Edit2, Trash2, Contact, Download, CheckSquare, ListChecks, PenTool, Image as ImageIcon, ZoomOut, ZoomIn, Cloud
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { cn } from '../utils';
import { db, storage } from '../firebase';
import { doc, collection, addDoc, setDoc, onSnapshot, query, where, deleteDoc, updateDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { usePermissions } from '../hooks/usePermissions';
import { logAuditAction } from '../utils/auditLogger';
import { offboardCompanyUser } from '../services/userService';

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
    internal_notes: 'Internal Notes', selection_mode_active: 'Selection Mode Active', no_contact_selected: 'No Contact Selected',
    selection_mode_desc: 'Select contacts in the left list for mass actions.', no_contact_selected_desc: 'Select an entry on the left to edit details.',
    create_contact: 'Create Contact', profile_pic_logo: 'Profile Picture / Logo', click_to_upload: 'Click to upload',
    live_qr_scanner: 'Live QR Scanner', qr_scan_desc: 'Scan this code with your phone camera to capture a physical business card.',
    contact_type: 'Contact Type', internal_team: 'Internal (Team)', external_client_partner: 'External (Client / Partner)',
    first_name: 'First Name', last_name: 'Last Name', company: 'Company', email: 'Email', phone: 'Phone',
    street_number: 'Street & Number', zip_code: 'ZIP', city: 'City', website: 'Website', uid_number: 'UID Number',
    vat_number: 'VAT Number', cancel: 'Cancel', save_changes: 'Save Changes', save_contact: 'Save Contact',
    vcard_received: 'Business card data received from smartphone!', delete_user_confirm: 'Permanently delete this contact and free all assignments?',
    completed: 'completed', upload_failed: 'Action failed.', save: 'Save', role: 'Role', name_or_company_required: 'Please provide a name or company.',
    unknown: 'Unknown', vcf_extracted: 'VCF data successfully extracted.', no_export_data: 'No data available to export.',
    select_external_to_delete: 'Please select external contacts to delete.', confirm_delete_multiple: 'contacts permanently?',
    contacts_deleted: 'contacts deleted.', contacts_updated: 'contacts updated.', no_company: 'No Company',
    export_pdf_title: 'PDF Studio', company_logo: 'Company Logo', upload_logo: 'Click to upload logo', logo_loaded: 'Logo loaded.',
    color: 'Accent Color', format: 'Format', orientation: 'Orientation', portrait: 'Portrait', landscape: 'Landscape',
    scale_preview: 'Scale Preview', saving_cloud: 'Saving to Cloud...', save_cloud: 'Save to Data Room', download_local: 'Download Locally',
    generating_pdf: 'Generating PDF...', pdf_exported: 'PDF successfully exported!', title: 'Title', project: 'Project'
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
    internal_notes: 'Interne Notizen', selection_mode_active: 'Auswahlmodus aktiv', no_contact_selected: 'Kein Kontakt ausgewählt',
    selection_mode_desc: 'Markiere Kontakte in der linken Liste für Massenaktionen.', no_contact_selected_desc: 'Wähle links einen Eintrag, um Details zu bearbeiten.',
    create_contact: 'Kontakt erfassen', profile_pic_logo: 'Profilbild / Logo', click_to_upload: 'Klicken zum Hochladen',
    live_qr_scanner: 'Live QR-Scanner', qr_scan_desc: 'Scanne diesen Code mit der Handy-Kamera, um eine physische Visitenkarte abzufotografieren.',
    contact_type: 'Kontakt-Typ', internal_team: 'Intern (Team)', external_client_partner: 'Extern (Kunde / Partner)',
    first_name: 'Vorname', last_name: 'Nachname', company: 'Firma', email: 'E-Mail', phone: 'Telefon',
    street_number: 'Straße & Hausnummer', zip_code: 'PLZ', city: 'Ort', website: 'Webseite', uid_number: 'UID-Nummer',
    vat_number: 'MwSt.-Nummer', cancel: 'Abbrechen', save_changes: 'Änderungen speichern', save_contact: 'Kontakt speichern',
    vcard_received: 'Visitenkarten-Daten vom Smartphone empfangen!', delete_user_confirm: 'Diesen Kontakt wirklich unwiderruflich löschen und alle Verknüpfungen freigeben?',
    completed: 'erfolgreich', upload_failed: 'Aktion fehlgeschlagen.', save: 'Speichern', role: 'Rolle', name_or_company_required: 'Bitte Name oder Firma angeben.',
    unknown: 'Unbekannt', vcf_extracted: 'VCF Daten erfolgreich extrahiert.', no_export_data: 'Keine Daten zum Exportieren vorhanden.',
    select_external_to_delete: 'Bitte wähle externe Kontakte zum Löschen aus.', confirm_delete_multiple: 'Kontakte unwiderruflich löschen?',
    contacts_deleted: 'Kontakte gelöscht.', contacts_updated: 'Kontakte aktualisiert.', no_company: 'Keine Firma',
    export_pdf_title: 'PDF Studio', company_logo: 'Firmenlogo für PDF', upload_logo: 'Klicken um Bild hochzuladen', logo_loaded: 'Logo geladen.',
    color: 'Akzentfarbe', format: 'Format', orientation: 'Ausrichtung', portrait: 'Hochformat', landscape: 'Querformat',
    scale_preview: 'Zoom Vorschau', saving_cloud: 'Speichert in Cloud...', save_cloud: 'In Bau-Akte speichern', download_local: 'Lokal herunterladen',
    generating_pdf: 'Wird erstellt...', pdf_exported: 'PDF erfolgreich exportiert!', title: 'Titel', project: 'Projekt'
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
  const { language, t: globalT } = useLanguage();
  const { hasPermission } = usePermissions();
  
  // Dummy Toast for UI
  const addToast = (msg: string, type: string) => console.log(msg);

  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;
  
  const [activeFilter, setActiveFilter] = useState<'alle' | 'team' | 'neu' | 'lead' | 'partner'>('alle');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [realUsers, setRealUsers] = useState<any[]>([]);
  useEffect(() => {
    if (!db || !currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    const q = query(collection(db, 'users'), where('companyId', '==', safeCompanyId));
    const unsub = onSnapshot(q, (snap) => setRealUsers(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [currentUser]);

  const [crmUsers, setCrmUsers] = useState<any[]>([]);
  useEffect(() => {
    if (!db || !currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    const q = query(collection(db, 'companyUsers'), where('companyId', '==', safeCompanyId));
    const unsub = onSnapshot(q, (snap) => setCrmUsers(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [currentUser]);

  const vcfInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const [newContact, setNewContact] = useState<any>({
    id: null, firstName: '', lastName: '', email: '', phone: '', company: '',
    street: '', zipCity: '', website: '', uid: '', vat: '', description: '',
    isExternal: false, status: 'neu'
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
    if (!db || !isAddModalOpen) return;
    const q = query(collection(db, 'temp_receipts'), where('sessionId', '==', vcardSessionId));
    const unsub = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if (data.contactData) {
            setNewContact((prev: any) => ({ ...prev, ...data.contactData, status: 'neu' }));
            addToast(t('vcard_received'), 'success');
          }
          deleteDoc(doc(db, 'temp_receipts', change.doc.id)).catch(console.error);
        }
      });
    });
    return () => unsub();
  }, [vcardSessionId, isAddModalOpen, t]);

  const isSuperAdmin = checkIsSuperAdmin(currentUser?.email);

  // 🔥 NEU: Der Master-Key zum Löschen von Geister-Usern!
  const handleDeleteContact = async (contactId: string) => {
    if (window.confirm(t('delete_user_confirm'))) {
      try {
        const safeCompanyId = currentUser?.companyId || `comp_${currentUser?.uid}`;
        
        // Versucht das saubere Offboarding
        await offboardCompanyUser(contactId, safeCompanyId);
        
        // Zwingt Firebase dazu, die Geister-Einträge auch direkt aus den Basis-Tabellen zu werfen!
        await deleteDoc(doc(db, 'users', contactId));
        await deleteDoc(doc(db, 'companyUsers', contactId));
        
        await logAuditAction({
          action: 'USER_REMOVED',
          userId: currentUser.uid,
          companyId: safeCompanyId,
          details: { removedUserId: contactId }
        });
        
        if (selectedContact?.id === contactId) setSelectedContact(null);
        addToast(t('delete') + ' ' + t('completed'), 'success');
      } catch (error) { 
        addToast(t('upload_failed'), 'error'); 
        console.error("Delete Error:", error);
      }
    }
  };

  const handleUpdateStatus = async (contactId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'companyUsers', contactId), { status: newStatus });
      if (selectedContact?.id === contactId) setSelectedContact({ ...selectedContact, status: newStatus });
      addToast(t('save') + ' ' + t('completed'), 'success');
    } catch (error) { addToast(t('upload_failed'), 'error'); }
  };

  const handleToggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // 🔥 NEU: Auch der Batch-Delete (Auswählen & Löschen) ignoriert jetzt den "Real User" Lock
  const handleBatchDelete = async () => {
    const deletableIds = selectedIds.filter(id => id !== currentUser?.uid);
    if (deletableIds.length === 0) { addToast(t('select_external_to_delete'), 'info'); return; }
    
    if (window.confirm(`${deletableIds.length} ${t('confirm_delete_multiple')}`)) {
      try {
        const safeCompanyId = currentUser?.companyId || `comp_${currentUser?.uid}`;
        await Promise.all(deletableIds.map(async (id) => {
          await offboardCompanyUser(id, safeCompanyId);
          await deleteDoc(doc(db, 'users', id));
          await deleteDoc(doc(db, 'companyUsers', id));
        }));
        
        setSelectedIds([]); 
        setIsSelectionMode(false);
        if (selectedContact && deletableIds.includes(selectedContact.id)) setSelectedContact(null);
        addToast(`${deletableIds.length} ${t('contacts_deleted')}`, 'success');
      } catch (e) { 
        addToast(t('upload_failed'), 'error'); 
      }
    }
  };

  const handleBatchStatus = async (newStatus: string) => {
    const updatableIds = selectedIds.filter(id => id !== currentUser?.uid);
    if (updatableIds.length === 0) return;
    try {
      await Promise.all(updatableIds.map(id => updateDoc(doc(db, 'companyUsers', id), { status: newStatus })));
      setSelectedIds([]); setIsSelectionMode(false);
      addToast(`${updatableIds.length} ${t('contacts_updated')}`, 'success');
    } catch (e) { addToast(t('upload_failed'), 'error'); }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await setDoc(doc(db, 'users', userId), { role: newRole }, { merge: true });
      await setDoc(doc(db, 'companyUsers', userId), { role: newRole }, { merge: true });
      addToast(`${t('role')} "${newRole}" ${t('completed')}`, 'success');
    } catch (error) { addToast(t('upload_failed'), 'error'); }
  };

  const openEditModal = () => {
    if (!selectedContact) return;
    setNewContact({
      id: selectedContact.id, firstName: selectedContact.firstName || '', lastName: selectedContact.lastName || '',
      email: selectedContact.email || '', phone: selectedContact.phone || '', company: selectedContact.company || '',
      street: selectedContact.street || '', zipCity: selectedContact.zipCity || '', website: selectedContact.website || '',
      uid: selectedContact.uid || '', vat: selectedContact.vat || '', description: selectedContact.description || '',
      isExternal: selectedContact.isExternal !== false, status: selectedContact.status || 'neu'
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
    if (!newContact.lastName && !newContact.company && !newContact.firstName) {
      addToast(t('name_or_company_required'), 'error'); return;
    }
    if (!currentUser || !currentUser.uid) return;
    
    setIsSubmitting(true);
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;

    try {
      let photoURL = newContact.id ? selectedContact?.photoURL : null; 
      
      if (avatarFile) {
        const storageRef = ref(storage, `crm_avatars/${Date.now()}_${avatarFile.name}`);
        await uploadBytes(storageRef, avatarFile);
        photoURL = await getDownloadURL(storageRef);
      }

      const fullName = [newContact.firstName, newContact.lastName].filter(Boolean).join(' ');

      const contactData: any = {
        firstName: newContact.firstName, lastName: newContact.lastName, email: newContact.email, phone: newContact.phone,
        company: newContact.company, street: newContact.street, zipCity: newContact.zipCity, website: newContact.website,
        uid: newContact.uid, vat: newContact.vat, description: newContact.description, isExternal: newContact.isExternal,
        status: newContact.status, name: fullName || newContact.company || t('unknown'),
        companyId: safeCompanyId 
      };

      if (photoURL) contactData.photoURL = photoURL;

      if (newContact.id) {
        await updateDoc(doc(db, 'companyUsers', newContact.id), contactData);
        setSelectedContact((prev: any) => prev ? { ...prev, ...contactData } : null);
        addToast(t('save') + ' ' + t('completed'), 'success');
      } else {
        contactData.role = newContact.isExternal ? null : 'employee';
        contactData.createdAt = new Date().toISOString();
        const docRef = await addDoc(collection(db, 'companyUsers'), contactData);
        
        await logAuditAction({
          action: 'USER_INVITED',
          userId: currentUser.uid,
          companyId: safeCompanyId,
          details: { invitedUserId: docRef.id, isExternal: newContact.isExternal }
        });
        
        // Trigger Make.com Webhook für die Einladungs-E-Mail
        if (!newContact.isExternal) {
          try {
            await fetch('/api/send-invite-webhook', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                email: newContact.email, 
                name: fullName, 
                role: 'employee',
                inviterName: currentUser.name || 'Dein Team'
              })
            });
          } catch (e) {
            console.error("Fehler beim Senden des Invite-Webhooks:", e);
          }
        }
        
        addToast(t('save') + ' ' + t('completed'), 'success');
      }
      
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
      isExternal: activeFilter !== 'team', status: 'neu'
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

  const allContacts = [
    ...realUsers.map(u => ({ ...u, isAppUser: true, status: 'team' })),
    ...crmUsers.filter(cu => !realUsers.some(ru => ru.email === cu.email))
  ];

  const filteredContacts = allContacts.filter(u => {
    const searchString = `${formatName(u)} ${u.company || ''} ${u.email || ''}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    
    let matchesFilter = false;
    const cStatus = u.status || 'neu';

    if (activeFilter === 'alle') matchesFilter = true;
    else if (activeFilter === 'team') matchesFilter = u.isAppUser || !u.isExternal || cStatus === 'team';
    else matchesFilter = cStatus === activeFilter && u.isExternal !== false && !u.isAppUser;

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
    if (!currentUser || !currentUser.uid) return '';
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    const docsRef = collection(db, 'documents');
    const folderQ = query(docsRef, where('name', '==', folderName), where('isFolder', '==', true), where('projectId', '==', 'global'), where('companyId', '==', safeCompanyId));
    const folderSnap = await getDocs(folderQ);
    if (!folderSnap.empty) return folderSnap.docs[0].id;
    const newFolderRef = await addDoc(docsRef, { name: folderName, isFolder: true, category: 'company', ownerId: currentUser.uid, companyId: safeCompanyId, projectId: 'global', createdAt: new Date().toISOString() });
    return newFolderRef.id;
  };

  const executeStudioPDFExportCloud = async () => {
    if (!currentUser || !currentUser.uid) return;
    setIsUploadingToCloud(true);
    try {
      const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
      await new Promise(r => setTimeout(r, 200)); 
      const pdf = await generateNativePdfDocument();
      const fileName = `CRM_Report_${Date.now()}.pdf`;
      const pdfBlobOut = pdf.output('blob');

      const storageRef = ref(storage, `${safeCompanyId}/pdf_exports/${fileName}`);
      await uploadBytes(storageRef, pdfBlobOut);
      const downloadUrl = await getDownloadURL(storageRef);
      const targetFolderId = await ensureFolder("04_SALES");

      await addDoc(collection(db, 'documents'), {
        name: fileName, url: downloadUrl, projectId: 'global', folderId: targetFolderId, category: 'company', 
        ownerId: currentUser.uid, companyId: safeCompanyId, type: 'application/pdf', size: (pdfBlobOut.size / (1024 * 1024)).toFixed(2) + ' MB', 
        isFolder: false, createdAt: new Date().toISOString()
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
    } catch (error: any) { addToast(t('upload_failed'), "error"); } finally { setIsGeneratingPdf(false); }
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-300 text-text-primary">
      
      {/* HEADER & TOP BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div><h2 className="text-2xl font-bold tracking-tight text-text-primary">{t('smart_crm')}</h2></div>
        
        <div className="flex flex-wrap items-center gap-3">
          <input type="file" accept=".vcf" ref={vcfInputRef} className="hidden" onChange={handleVcfImport} />
          <button onClick={() => { setDocHeader(prev => ({...prev, title: (selectedContact && !isSelectionMode) ? 'Contact Dossier' : 'CRM Report'})); setIsPrintModalOpen(true); }} className="px-4 py-2 bg-surface border border-border text-text-primary rounded-lg text-sm font-bold hover:bg-background transition-all flex items-center gap-2 shadow-sm"><Download size={16} /> <span className="hidden sm:inline">{t('export_pdf')}</span></button>
          <button onClick={handleExportCSV} className="px-4 py-2 bg-surface border border-border text-text-primary rounded-lg text-sm font-bold hover:bg-background transition-all flex items-center gap-2 shadow-sm"><FileText size={16} /> <span className="hidden sm:inline">{t('export_csv')}</span></button>
          <button onClick={() => vcfInputRef.current?.click()} className="px-4 py-2 bg-surface border border-border text-text-primary rounded-lg text-sm font-bold hover:bg-background transition-all flex items-center gap-2 shadow-sm"><FileUp size={16} /> <span className="hidden sm:inline">{t('vcf_import')}</span></button>
          <button onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedIds([]); }} className={cn("px-4 py-2 border rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-sm", isSelectionMode ? "bg-accent-ai/20 border-accent-ai text-accent-ai" : "bg-surface border-border text-text-primary hover:bg-background")}><ListChecks size={16} /> <span className="hidden sm:inline">{isSelectionMode ? t('cancel_selection') : t('select')}</span></button>
          {hasPermission('canManageUsers') && (
            <button onClick={() => { setNewContact((prev: any) => ({ ...prev, isExternal: true })); setIsAddModalOpen(true); }} className="px-4 py-2 bg-accent-ai text-white rounded-lg text-sm font-bold shadow-lg hover:bg-accent-ai/90 transition-all flex items-center gap-2"><UserPlus size={16} /> <span className="hidden sm:inline">{t('new_contact')}</span></button>
          )}
        </div>
      </div>

      {/* SPLIT VIEW ARCHITEKTUR */}
      <div className="flex flex-1 gap-6 overflow-hidden min-h-[600px]">
        
        {/* LINKE SPALTE */}
        <div className="w-full md:w-[380px] bg-surface border border-border rounded-3xl flex flex-col overflow-hidden shadow-sm relative">
          <div className="p-5 border-b border-border bg-surface/80 backdrop-blur-md space-y-4 z-10">
            <div className="relative"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" /><input type="text" placeholder={t('search_contacts')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-accent-ai transition-colors placeholder:text-text-muted text-text-primary" /></div>
            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
              {[{ id: 'alle', label: t('filter_all') }, { id: 'team', label: t('filter_team') }, { id: 'neu', label: t('filter_new_scanned') }, { id: 'lead', label: t('filter_leads') }, { id: 'partner', label: t('filter_partners') }].map(f => (
                <button key={f.id} onClick={() => setActiveFilter(f.id as any)} className={cn("px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300", activeFilter === f.id ? "bg-accent-ai/10 text-accent-ai border border-accent-ai/20 shadow-sm" : "bg-background text-text-muted border border-border/50 hover:bg-white/5 hover:text-text-primary")}>{f.label}</button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1 pb-24 bg-background">
            {filteredContacts.map(contact => {
              const isSelected = selectedContact?.id === contact.id; const isChecked = selectedIds.includes(contact.id); const isTeam = contact.isAppUser || contact.status === 'team' || !contact.isExternal;
              return (
                <div key={contact.id} onClick={() => isSelectionMode ? handleToggleSelection(contact.id, {stopPropagation: () => {}} as any) : setSelectedContact(contact)} className={cn("p-3 rounded-2xl cursor-pointer transition-all duration-200 flex items-center justify-between group border", (isSelected && !isSelectionMode) ? "bg-accent-ai/10 border-accent-ai/20 shadow-sm" : "hover:bg-white/5 border-transparent", (isChecked && isSelectionMode) ? "bg-accent-ai/10 border-accent-ai/30 shadow-sm" : "")}>
                  <div className="flex items-center gap-3 overflow-hidden">
                    {isSelectionMode && <div className={cn("w-5 h-5 rounded flex items-center justify-center border shrink-0 transition-colors bg-surface", isChecked ? "bg-accent-ai border-accent-ai text-white" : "border-border")}>{isChecked && <CheckSquare size={12} />}</div>}
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold overflow-hidden shrink-0 border border-border/50", isTeam ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500")}>
                      {contact.photoURL ? <img src={contact.photoURL} className="w-full h-full object-cover" /> : formatName(contact).charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden"><div className={cn("font-bold text-sm truncate", (isSelected && !isSelectionMode) ? "text-accent-ai" : "text-text-primary")}>{formatName(contact)}</div><div className="text-xs text-text-muted truncate mt-0.5 font-medium">{contact.company || contact.email || t('no_company')}</div></div>
                  </div>
                  {contact.status === 'neu' && !isTeam && !isSelectionMode && <div className="w-2 h-2 rounded-full bg-accent-ai shadow-[0_0_8px_rgba(59,130,246,0.5)] shrink-0 ml-2" />}
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
                  <button onClick={handleBatchDelete} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"><Trash2 size={16} /></button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RECHTE SPALTE */}
        <div className="hidden md:flex flex-col flex-1 bg-surface border border-border rounded-3xl p-10 overflow-y-auto custom-scrollbar relative shadow-sm">
          {selectedContact && !isSelectionMode ? (
            <motion.div key={selectedContact.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 w-full">
              <div className="absolute top-8 right-8 flex items-center gap-2 bg-background border border-border p-1.5 rounded-xl shadow-sm">
                {(!selectedContact.isAppUser && selectedContact.isExternal !== false) && (
                  <select onChange={(e) => handleUpdateStatus(selectedContact.id, e.target.value)} value={selectedContact.status || 'neu'} className="appearance-none bg-transparent text-xs font-bold px-3 py-1.5 outline-none cursor-pointer text-text-muted hover:text-text-primary transition-colors">
                    <option value="neu" className="bg-surface">{t('status_new_scan')}</option><option value="lead" className="bg-surface">{t('status_lead')}</option><option value="partner" className="bg-surface">{t('status_partner')}</option><option value="team" className="bg-surface">{t('status_team')}</option>
                  </select>
                )}
                {/* 🔥 MASTER KEY VERBAUT: Zeige Mülleimer immer an, außer beim eigenen Account */}
                {selectedContact.email !== currentUser?.email && <div className="h-4 w-px bg-border mx-1" />}
                {hasPermission('canManageUsers') && (
                  <>
                    <button onClick={openEditModal} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors" title={t('edit_contact')}><Edit2 size={16} /></button>
                    {selectedContact.email !== currentUser?.email && <button onClick={() => handleDeleteContact(selectedContact.id)} className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title={t('delete')}><Trash2 size={16} /></button>}
                  </>
                )}
              </div>

              <div className="flex items-center gap-8 pt-2">
                <div className="w-28 h-28 rounded-[2rem] bg-background border border-border flex items-center justify-center text-4xl font-bold text-text-muted shadow-sm overflow-hidden">
                  {selectedContact.photoURL ? <img src={selectedContact.photoURL} className="w-full h-full object-cover" /> : formatName(selectedContact).charAt(0).toUpperCase()}
                </div>
                <div className="space-y-2">
                  <h2 className="text-4xl font-bold text-text-primary tracking-tight">{formatName(selectedContact)}</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedContact.company && <span className="text-blue-500 font-bold bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-sm flex items-center gap-2"><Building size={14} /> {selectedContact.company}</span>}
                    {selectedContact.jobTitle && <span className="text-text-muted font-bold bg-background border border-border px-3 py-1 rounded-full text-sm flex items-center gap-2"><Briefcase size={14} /> {selectedContact.jobTitle}</span>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-12 gap-y-10 pt-10 border-t border-border/50">
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
                    <div className="flex items-start gap-4"><div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-text-muted shrink-0"><MapPin size={14}/></div><div className="pt-1.5 leading-relaxed">{selectedContact.street ? <>{selectedContact.street}<br/>{selectedContact.zipCity}</> : <span className="text-text-muted italic">{t('no_address_data')}</span>}</div></div>
                    {(selectedContact.uid || selectedContact.vat) && <div className="mt-4 pt-4 border-t border-border/50 space-y-2"><div className="flex justify-between"><span className="text-text-muted font-bold">{t('uid_number')}:</span> <span className="font-medium">{selectedContact.uid || '-'}</span></div><div className="flex justify-between"><span className="text-text-muted font-bold">{t('vat_number')}:</span> <span className="font-medium">{selectedContact.vat || '-'}</span></div></div>}
                  </div>
                </div>

                {(selectedContact.isAppUser || selectedContact.role) && hasPermission('canManageUsers') && (
                  <div className="col-span-2 space-y-4 pt-4 border-t border-border/50">
                     <h3 className="text-[10px] uppercase font-bold text-text-muted tracking-widest">{t('role_management_system')}</h3>
                     <select value={selectedContact.role || 'employee'} onChange={(e) => handleRoleChange(selectedContact.id, e.target.value)} disabled={selectedContact.id === currentUser?.uid && isSuperAdmin} className="w-full max-w-xs px-4 py-2.5 rounded-xl text-sm font-bold border outline-none cursor-pointer bg-background hover:bg-white/5 border-border text-text-primary focus:border-accent-ai transition-colors">
                        <option value="employee" className="bg-surface">{t('employee')}</option><option value="management" className="bg-surface">{t('management')}</option><option value="owner" className="bg-surface">{t('owner')}</option>
                      </select>
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

      {/* KONTAKT ERFASSEN / BEARBEITEN MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-4xl my-auto overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-4 border-b border-border/50 flex items-center justify-between bg-surface/80 shrink-0">
                <h3 className="font-bold text-lg flex items-center gap-2 text-text-primary"><UserPlus className="text-accent-ai" size={20} /> {newContact.id ? t('edit_contact') : t('create_contact')}</h3>
                <button onClick={closeAddModal} className="text-text-muted hover:text-text-primary transition-colors"><X size={20}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-background custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-surface border border-border/50 rounded-xl p-6 flex flex-col items-center text-center shadow-sm">
                      <div onClick={() => avatarInputRef.current?.click()} className="relative w-24 h-24 rounded-full bg-background border border-border flex items-center justify-center cursor-pointer group overflow-hidden mb-4 hover:border-accent-ai transition-colors">
                        {avatarPreview ? <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" /> : <Camera size={32} className="text-text-muted group-hover:text-accent-ai transition-colors" />}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera size={20} className="text-white"/></div>
                      </div>
                      <input type="file" accept="image/*" ref={avatarInputRef} onChange={handleAvatarSelect} className="hidden" />
                      <h4 className="text-sm font-bold text-text-primary">{t('profile_pic_logo')}</h4>
                      <p className="text-xs text-text-muted mt-1 font-medium">{t('click_to_upload')}</p>
                    </div>
                    {!newContact.id && (
                      <div className="bg-surface border border-accent-ai/20 rounded-xl p-6 flex flex-col items-center text-center relative overflow-hidden group shadow-sm">
                        <div className="absolute inset-0 bg-accent-ai/5 group-hover:bg-accent-ai/10 transition-colors"></div>
                        <h4 className="text-sm font-bold text-accent-ai mb-2 flex items-center gap-2 relative z-10"><Smartphone size={16}/> {t('live_qr_scanner')}</h4>
                        <p className="text-xs text-text-muted mb-4 relative z-10 font-medium">{t('qr_scan_desc')}</p>
                        <div className="bg-white p-2 rounded-lg relative z-10 shadow-lg"><QRCode value={mobileUploadUrl} size={120} /></div>
                      </div>
                    )}
                  </div>
                  <div className="lg:col-span-2">
                    <form id="contact-form" onSubmit={handleAddContact} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('contact_type')}</label>
                        <div className="flex bg-surface border border-border/50 rounded-lg p-1">
                          <button type="button" onClick={() => setNewContact((prev: any) => ({...prev, isExternal: false, status: 'team'}))} className={cn("flex-1 py-2 text-sm font-bold rounded-md transition-all", !newContact.isExternal ? "bg-accent-ai text-white shadow-md" : "text-text-muted hover:text-text-primary")}>{t('internal_team')}</button>
                          <button type="button" onClick={() => setNewContact((prev: any) => ({...prev, isExternal: true, status: newContact.id ? newContact.status : 'neu'}))} className={cn("flex-1 py-2 text-sm font-bold rounded-md transition-all", newContact.isExternal ? "bg-blue-500 text-white shadow-md" : "text-text-muted hover:text-text-primary")}>{t('external_client_partner')}</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('first_name')}</label><input type="text" value={newContact.firstName} onChange={e => setNewContact((prev: any) => ({...prev, firstName: e.target.value}))} className="w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" /></div>
                        <div className="space-y-2"><label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('last_name')}</label><input type="text" value={newContact.lastName} onChange={e => setNewContact((prev: any) => ({...prev, lastName: e.target.value}))} className="w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2"><label className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2"><Building size={14}/> {t('company')}</label><input type="text" value={newContact.company} onChange={e => setNewContact((prev: any) => ({...prev, company: e.target.value}))} className="w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent-ai font-bold text-text-primary" /></div>
                        <div className="space-y-2"><label className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2"><Mail size={14}/> {t('email')}</label><input type="email" value={newContact.email} onChange={e => setNewContact((prev: any) => ({...prev, email: e.target.value}))} className="w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" /></div>
                        <div className="space-y-2"><label className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2"><Phone size={14}/> {t('phone')}</label><input type="text" value={newContact.phone} onChange={e => setNewContact((prev: any) => ({...prev, phone: e.target.value}))} className="w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-border/50 bg-surface/50 shadow-sm">
                        <div className="space-y-2 col-span-2"><label className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2"><MapPin size={14}/> {t('street_number')}</label><input type="text" value={newContact.street} onChange={e => setNewContact((prev: any) => ({...prev, street: e.target.value}))} className="w-full bg-background border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" /></div>
                        <div className="space-y-2 col-span-2"><label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('zip_code')} & {t('city')}</label><input type="text" value={newContact.zipCity} onChange={e => setNewContact((prev: any) => ({...prev, zipCity: e.target.value}))} className="w-full bg-background border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" /></div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2"><label className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2"><Globe size={14}/> {t('website')}</label><input type="text" value={newContact.website} onChange={e => setNewContact((prev: any) => ({...prev, website: e.target.value}))} placeholder="www..." className="w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" /></div>
                        <div className="space-y-2"><label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('uid_number')}</label><input type="text" value={newContact.uid} onChange={e => setNewContact((prev: any) => ({...prev, uid: e.target.value}))} placeholder="CHE-..." className="w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" /></div>
                        <div className="space-y-2"><label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('vat_number')}</label><input type="text" value={newContact.vat} onChange={e => setNewContact((prev: any) => ({...prev, vat: e.target.value}))} placeholder="..." className="w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" /></div>
                      </div>
                      <div className="space-y-2"><label className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2"><FileText size={14}/> {t('internal_notes')}</label><textarea value={newContact.description} onChange={e => setNewContact((prev: any) => ({...prev, description: e.target.value}))} rows={3} className="w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent-ai resize-none custom-scrollbar text-text-primary font-medium" placeholder="..."></textarea></div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-border/50 bg-surface/80 shrink-0 flex justify-end gap-3">
                <button type="button" onClick={closeAddModal} className="px-6 py-2.5 text-sm font-bold text-text-muted hover:text-text-primary transition-colors">{t('cancel')}</button>
                <button form="contact-form" type="submit" disabled={isSubmitting} className="px-8 py-2.5 bg-accent-ai text-white rounded-lg text-sm font-bold shadow-lg hover:bg-accent-ai/90 transition-all flex items-center gap-2 disabled:opacity-50">{isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} {newContact.id ? t('save_changes') : t('save_contact')}</button>
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
    </div>
  );
}