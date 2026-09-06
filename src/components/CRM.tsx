import React, { useState, useEffect } from 'react';
import { Users, FileText, Search, Plus, Trash2, UserPlus, Loader2 } from 'lucide-react';
import { cn } from '../utils';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    crm_docs: 'CRM & Contacts', crm_docs_desc: 'Manage contact partners and stakeholders for your company.',
    contacts: 'Contacts', add_contact: 'Add Contact', search_contacts: 'Search contacts...',
    name: 'Name', role: 'Role', company: 'Company', email: 'Email', phone: 'Phone', actions: 'Actions',
    no_contacts: 'No contacts found.', cancel: 'Cancel', save: 'Save'
  },
  de: {
    crm_docs: 'CRM & Kontakte', crm_docs_desc: 'Verwalte Ansprechpartner und Stakeholder für dein Unternehmen.',
    contacts: 'Kontakte', add_contact: 'Kontakt hinzufügen', search_contacts: 'Kontakte durchsuchen...',
    name: 'Name', role: 'Rolle', company: 'Firma', email: 'E-Mail', phone: 'Telefon', actions: 'Aktionen',
    no_contacts: 'Keine Kontakte vorhanden.', cancel: 'Abbrechen', save: 'Speichern', contact_added: 'Kontakt gespeichert!'
  }
};

interface Contact { id: string; name: string; role: string; company: string; email: string; phone: string; }

export default function CRM() {
  const { currentUser } = useAuth();
  const { fetchCompanyUsers, isDemoMode } = useProject() as any;
  const isDemo = isDemoMode || currentUser?.uid === 'demo-user-id';
  const { addToast } = useToast();
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', role: '', company: '', email: '', phone: '' });

  const DEMO_CRM_CONTACTS: Contact[] = [
    { id: 'c1', name: 'Sarah Meier', role: 'Architektin SIA', company: 'Atelier Meier & Partner AG', email: 's.meier@atelier-meier.ch', phone: '+41 44 210 33 44' },
    { id: 'c2', name: 'Michael Chen', role: 'Bauingenieur ETH', company: 'Chen Statik GmbH', email: 'm.chen@chen-statik.ch', phone: '+41 44 880 12 34' },
    { id: 'c3', name: 'Elena Rossi', role: 'Bauleiterin', company: 'Rossi Bauleitungen AG', email: 'elena@rossi-bau.ch', phone: '+41 79 555 43 21' },
    { id: 'c4', name: 'Thomas Widmer', role: 'Elektro-Ingenieur', company: 'Widmer Elektro AG', email: 't.widmer@widmer-elektro.ch', phone: '+41 52 300 77 88' }
  ];

  const fetchContacts = async () => {
    if (isDemo) {
      setContacts(DEMO_CRM_CONTACTS);
      return;
    }
    if (!currentUser) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;
    try {
      const { data, error } = await supabase
        .from('company_users')
        .select('*')
        .eq('company_id', safeCompanyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching CRM contacts:", error);
        return;
      }

      if (data) {
        const mapped = data.map((u: any) => ({
          id: u.id,
          name: u.name || [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email || 'Kontakt',
          role: u.role || 'partner',
          company: u.company || '',
          email: u.email || '',
          phone: u.phone || ''
        }));
        setContacts(mapped);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [currentUser, isDemo]);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo) {
      addToast('Kontakterstellung ist in der Demo deaktiviert.', 'info');
      setIsModalOpen(false);
      return;
    }
    if (!currentUser) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;
    const nameParts = newContact.name.trim().split(' ');
    const firstName = nameParts[0] || newContact.name;
    const lastName = nameParts.slice(1).join(' ') || '';

    try {
      const { error } = await supabase.from('company_users').insert({
        name: newContact.name,
        first_name: firstName,
        last_name: lastName,
        role: newContact.role || 'partner',
        email: newContact.email || null,
        phone: newContact.phone || null,
        company_id: safeCompanyId,
        status: 'neu',
        created_at: new Date().toISOString()
      });

      if (error) {
        console.error("Error adding contact:", error);
        addToast('Fehler beim Speichern', 'error');
        return;
      }

      setIsModalOpen(false);
      setNewContact({ name: '', role: '', company: '', email: '', phone: '' });
      addToast('Kontakt gespeichert!', 'success');
      fetchContacts();
    } catch (error) {
      addToast('Fehler beim Speichern', 'error');
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm('Kontakt wirklich löschen?')) return;
    try {
      setContacts(prev => prev.filter(c => c.id !== id));
      await supabase.from('company_users').delete().eq('id', id);
      await supabase.from('profiles').delete().eq('id', id);
      addToast('Kontakt gelöscht', 'info');
      fetchContacts();
      fetchCompanyUsers?.();
    } catch (error) {
      addToast('Fehler beim Löschen', 'error');
    }
  };

  const filteredContacts = contacts.filter(c => (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (c.company || '').toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface border border-border p-6 rounded-3xl shadow-sm gap-4">
        <div>
          <h3 className="text-xl font-black text-text-primary flex items-center gap-2">
            <Users className="text-blue-500" size={24} />
            {t('crm_docs')}
          </h3>
          <p className="text-text-muted text-sm font-medium">{t('crm_docs_desc')}</p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2">
          <UserPlus size={16} /> {t('add_contact')}
        </button>
      </div>

      <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm">
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder={t('search_contacts')} 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm font-medium text-text-primary"
          />
        </div>

        <div className="divide-y divide-border/50">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-12 text-text-muted">{t('no_contacts')}</div>
          ) : (
            filteredContacts.map(contact => (
              <div key={contact.id} className="py-3.5 px-4 flex items-center justify-between hover:bg-background/50 rounded-xl">
                <div>
                  <div className="font-bold text-sm text-text-primary">{contact.name}</div>
                  <div className="text-xs text-text-muted">{contact.role} {contact.company ? `@ ${contact.company}` : ''}</div>
                  <div className="text-xs text-blue-500 mt-0.5">{contact.email} {contact.phone ? `• ${contact.phone}` : ''}</div>
                </div>

                <button onClick={() => handleDeleteContact(contact.id)} className="p-2 text-text-muted hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddContact} className="bg-surface border border-border p-6 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-text-primary">{t('add_contact')}</h3>
            <input type="text" placeholder={t('name')} required value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} className="w-full px-4 py-2 bg-background border border-border/50 rounded-xl text-sm text-text-primary" />
            <input type="text" placeholder={t('role')} value={newContact.role} onChange={e => setNewContact({...newContact, role: e.target.value})} className="w-full px-4 py-2 bg-background border border-border/50 rounded-xl text-sm text-text-primary" />
            <input type="text" placeholder={t('company')} value={newContact.company} onChange={e => setNewContact({...newContact, company: e.target.value})} className="w-full px-4 py-2 bg-background border border-border/50 rounded-xl text-sm text-text-primary" />
            <input type="email" placeholder={t('email')} value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} className="w-full px-4 py-2 bg-background border border-border/50 rounded-xl text-sm text-text-primary" />
            <input type="tel" placeholder={t('phone')} value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} className="w-full px-4 py-2 bg-background border border-border/50 rounded-xl text-sm text-text-primary" />
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-text-muted">{t('cancel')}</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl">{t('save')}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}