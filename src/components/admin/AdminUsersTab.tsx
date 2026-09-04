import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Shield, UserCheck, Trash2, Loader2, Mail, X, CheckCircle2, Copy, ExternalLink, Building2, Sparkles, Eye } from 'lucide-react';
import { cn } from '../../utils';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { checkIsSuperAdmin } from '../../config/admins';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    search_users: 'Search users...', name_email: 'Name & Email', role_plan: 'Role & Plan', status: 'Status',
    actions: 'Actions', active: 'Active', unnamed: 'Unnamed', delete_user_confirm: 'Are you sure you want to delete this user?',
    no_users_found: 'No users found.', edit_user: 'Edit User Details', save_changes: 'Save Changes', cancel: 'Cancel',
    user_saved: 'User successfully updated.', role: 'Role', plan: 'Subscription Plan', max_seats: 'Purchased Licenses (maxSeats)',
    full_name: 'Full Name', email_address: 'Email Address',
    delete_test_users: 'Delete Test Users',
    preprovision_vip_customer: '🚀 Pre-provision Customer (VIP Concierge)',
    preview_workspace_tooltip: 'Test workspace from customer view',
    preview: 'Preview',
    edit: 'Edit',
    cleanup_confirm: 'Do you want to delete all demo and test users?',
    cleanup_success: 'Test users successfully deleted!',
    cleanup_error: 'Error cleaning up test users'
  },
  de: {
    search_users: 'Benutzer suchen...', name_email: 'Name & E-Mail', role_plan: 'Rolle & Plan', status: 'Status',
    actions: 'Aktionen', active: 'Aktiv', unnamed: 'Unbenannt', delete_user_confirm: 'Möchtest du diesen Nutzer wirklich löschen?',
    no_users_found: 'Keine Benutzer gefunden.', edit_user: 'Benutzer bearbeiten', save_changes: 'Änderungen speichern', cancel: 'Abbrechen',
    user_saved: 'Benutzer erfolgreich aktualisiert.', role: 'Rolle', plan: 'Abo / Plan', max_seats: 'Gekaufte Lizenzen (maxSeats)',
    full_name: 'Name', email_address: 'E-Mail Adresse',
    delete_test_users: 'Test-Nutzer löschen',
    preprovision_vip_customer: '🚀 Kunde vorab einrichten (VIP Concierge)',
    preview_workspace_tooltip: 'Workspace aus Kundensicht testen',
    preview: 'Vorschau',
    edit: 'Bearbeiten',
    cleanup_confirm: 'Möchtest du alle Demo- und Test-Nutzer löschen?',
    cleanup_success: 'Test-Nutzer erfolgreich gelöscht!',
    cleanup_error: 'Fehler beim Bereinigen'
  }
};

export default function AdminUsersTab() {
  const { language, t: globalT } = useLanguage();
  const { addToast } = useToast();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImpersonateWorkspace = (user: any) => {
    const companyId = user.company_id || user.companyId || user.id;
    const companyName = user.company_name || user.companyName || user.name || user.email || 'Workspace';
    sessionStorage.setItem('admin_preview_company_id', companyId);
    sessionStorage.setItem('admin_preview_company_name', companyName);
    addToast(`Mandanten-Vorschau aktiviert für: ${companyName}`, 'info');
    window.location.href = '/app';
  };

  // Preprovision VIP Concierge States
  const [isPreprovisionOpen, setIsPreprovisionOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [ceoName, setCeoName] = useState('');
  const [ceoEmail, setCeoEmail] = useState('');
  const [plan, setPlan] = useState('Enterprise');
  const [maxSeats, setMaxSeats] = useState(5);
  const [employeeEmailsStr, setEmployeeEmailsStr] = useState('');
  const [seedDemoProject, setSeedDemoProject] = useState(true);
  const [isPreprovisioning, setIsPreprovisioning] = useState(false);
  const [createdVipLink, setCreatedVipLink] = useState('');

  const handlePreprovisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !ceoEmail) return addToast('Bitte Firmenname und CEO E-Mail eingeben.', 'error');
    setIsPreprovisioning(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const employeeEmails = employeeEmailsStr
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0 && s.includes('@'));

      const response = await fetch('/api/preprovision-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          companyName,
          ceoName,
          ceoEmail,
          plan,
          maxSeats: Number(maxSeats),
          employeeEmails,
          seedDemoProject
        })
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || 'Fehler beim Erstellen');

      setCreatedVipLink(resData.vipLink);
      addToast('VIP Kunden-Workspace & Link erfolgreich erstellt!', 'success');
      await fetchUsers();
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Fehler beim Einrichten', 'error');
    } finally {
      setIsPreprovisioning(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        // Auto-sync super_admin status in Database and state
        data.forEach(async (u) => {
          if (checkIsSuperAdmin(u.email) && (u.role !== 'super_admin' || u.plan !== 'Enterprise')) {
            await supabase.from('profiles').update({ role: 'super_admin', plan: 'Enterprise' }).eq('id', u.id);
          }
        });

        const mapped = data.map(u => {
          if (checkIsSuperAdmin(u.email)) {
            return { ...u, role: 'Super_admin', plan: 'Enterprise' };
          }
          return u;
        });

        setUsers(mapped);
      }
    } catch (err) {
      console.error("Error fetching users for admin:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    const channel = supabase
      .channel('admin-users-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchUsers)
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel).catch(() => {});
    };
  }, []);

  const handleDeleteUser = async (user: any) => {
    if (!window.confirm(t('delete_user_confirm'))) return;
    try {
      await supabase.from('profiles').delete().eq('id', user.id);
      addToast(t('user_saved'), 'success');
      await fetchUsers();
    } catch (error) { 
      addToast('Fehler beim Löschen', 'error'); 
    }
  };

  const handleEditClick = async (user: any) => {
    let seats = user.maxSeats || user.max_seats;
    if (!seats && (user.company_id || user.id)) {
      const compId = user.company_id || user.id;
      const { data: comp } = await supabase.from('companies').select('max_seats').eq('id', compId).maybeSingle();
      if (comp?.max_seats) seats = comp.max_seats;
      else {
        const { data: ownerComp } = await supabase.from('companies').select('max_seats').eq('owner_id', user.id).maybeSingle();
        if (ownerComp?.max_seats) seats = ownerComp.max_seats;
      }
    }
    setEditingUser({ ...user, maxSeats: seats || 1 });
    setIsModalOpen(true);
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      await supabase
        .from('profiles')
        .update({
          role: editingUser.role,
          name: editingUser.name,
          plan: editingUser.plan || 'Pro',
          has_active_subscription: editingUser.plan ? editingUser.plan !== 'Free Trial' : true
        })
        .eq('id', editingUser.id);

      const seatsToSave = parseInt(editingUser.maxSeats) || 1;
      if (editingUser.company_id) {
         await supabase
           .from('companies')
           .update({
             max_seats: seatsToSave,
             plan: editingUser.plan || 'Enterprise'
           })
           .eq('id', editingUser.company_id);
      } else {
         await supabase
           .from('companies')
           .update({
             max_seats: seatsToSave,
             plan: editingUser.plan || 'Enterprise'
           })
           .or(`owner_id.eq.${editingUser.id},id.eq.${editingUser.id}`);
      }

      addToast(t('user_saved'), 'success');
      setIsModalOpen(false);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      addToast('Fehler beim Speichern', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCleanupTestUsers = async () => {
    if (!window.confirm('Möchtest du alle Demo- und Test-Nutzer löschen?')) return;
    const testEmails = [
      'kreativdesk999@yopmail.com', 'kreativdesk999@mailinator.com', 'kreativdesk12345@mailnesia.com',
      'test3@example.com', 'unique_user_12345@mailto.plus', 'faxpad@mailto.plus', 'test@example.com', 'tester@kreativdesk.ch'
    ];
    try {
      await supabase.from('profiles').delete().in('email', testEmails);
      addToast('Test-Nutzer erfolgreich gelöscht!', 'success');
      await fetchUsers();
    } catch (err) {
      console.error(err);
      addToast('Fehler beim Bereinigen', 'error');
    }
  };

  const filtered = users.filter(u => 
    (u.name?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (u.email?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-surface border border-border p-4 rounded-xl shadow-sm gap-4">
        <div className="relative w-full sm:w-80 md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder={t('search_users')} 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border/50 rounded-lg text-sm font-medium text-text-primary focus:outline-none focus:border-blue-500 shadow-sm transition-colors"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleCleanupTestUsers}
            className="w-full sm:w-auto px-4 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-all shadow-sm text-center"
          >
            {t('delete_test_users')}
          </button>
          <button
            onClick={() => setIsPreprovisionOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Shield size={16} /> {t('preprovision_vip_customer')}
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-background/50 text-xs uppercase font-bold text-text-muted">
                <th className="px-6 py-4">{t('name_email')}</th>
                <th className="px-6 py-4">{t('role_plan')}</th>
                <th className="px-6 py-4 text-center">{t('status')}</th>
                <th className="px-6 py-4 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-12">
                    <Loader2 className="animate-spin text-blue-500 mx-auto" size={24} />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-text-muted font-medium">
                    {t('no_users_found')}
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-500/20">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-text-primary">{user.name || t('unnamed')}</div>
                          <div className="text-xs text-text-muted flex items-center gap-1">
                            <Mail size={12} /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-text-primary capitalize">{user.role || 'Member'}</div>
                      <div className="text-xs text-text-muted">{user.plan || 'Free Trial'}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <CheckCircle2 size={12} /> {t('active')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleImpersonateWorkspace(user)}
                          className="px-3 py-1.5 bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                          title={t('preview_workspace_tooltip')}
                        >
                          <Eye size={14} /> {t('preview')}
                        </button>
                        <button 
                          onClick={() => handleEditClick(user)}
                          className="px-3 py-1.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg text-xs font-bold transition-colors"
                        >
                          {t('edit')}
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && editingUser && createPortal(
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-border bg-background/50">
              <h3 className="font-bold text-text-primary">{t('edit_user')}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-primary"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveChanges} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1 uppercase tracking-wider">{t('full_name')}</label>
                <input 
                  type="text"
                  value={editingUser.name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted mb-1 uppercase tracking-wider">{t('role')}</label>
                <select 
                  value={editingUser.role || 'member'}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:border-blue-500 capitalize"
                >
                  <option value="owner">Owner (Admin)</option>
                  <option value="management">Management</option>
                  <option value="employee">Mitarbeiter</option>
                  <option value="external">Externer Planer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted mb-1 uppercase tracking-wider">{t('plan')}</label>
                <select 
                  value={editingUser.plan || 'Pro'}
                  onChange={(e) => setEditingUser({ ...editingUser, plan: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="Free Trial">Free Trial</option>
                  <option value="Starter">Starter (CHF 39 / Mon)</option>
                  <option value="Pro">Pro (CHF 79 / Mon)</option>
                  <option value="Expert">Expert (CHF 189 / Mon)</option>
                  <option value="Studio">Kreativ Desk Studio (ab CHF 15'000)</option>
                  <option value="Agency">Kreativ Desk Agency (CHF 25'000)</option>
                  <option value="Enterprise">Kreativ Desk Enterprise (ab CHF 50'000.-)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted mb-1 uppercase tracking-wider">{t('max_seats')}</label>
                <input 
                  type="number"
                  min="1"
                  max="500"
                  value={editingUser.maxSeats || 1}
                  onChange={(e) => setEditingUser({ ...editingUser, maxSeats: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-surface-hover">{t('cancel')}</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20">{isSubmitting ? 'Speichere...' : t('save_changes')}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* VIP CONCIERGE PREPROVISION MODAL */}
      {isPreprovisionOpen && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121215] border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar p-6 shadow-2xl space-y-6 text-white">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white">VIP Concierge Akquise</h3>
                  <p className="text-xs text-zinc-400">Neuen Kunden-Workspace vorab einrichten & Einladung generieren</p>
                </div>
              </div>
              <button 
                onClick={() => { setIsPreprovisionOpen(false); setCreatedVipLink(''); }} 
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {createdVipLink ? (
              <div className="space-y-5 animate-in zoom-in-95 duration-300">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-2">
                  <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
                  <h4 className="font-bold text-white text-base">Workspace & VIP-Link sind bereit!</h4>
                  <p className="text-xs text-emerald-200">
                    Schicke diesen persönlichen Einladungslink jetzt an <strong>{ceoName || companyName}</strong> ({ceoEmail}):
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Persönlicher VIP Einladungslink</label>
                  <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-xl p-2.5">
                    <input 
                      type="text" 
                      readOnly 
                      value={createdVipLink} 
                      className="bg-transparent text-xs text-blue-400 flex-1 outline-none font-mono"
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(createdVipLink);
                        addToast('VIP Link in Zwischenablage kopiert!', 'success');
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <Copy size={14} /> Kopieren
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <a 
                    href={`https://wa.me/?text=${encodeURIComponent(`Hallo ${ceoName || ''}, Ihr Kreativ-Desk OS Workspace für ${companyName} ist fertig eingerichtet! Hier ist Ihr persönlicher VIP-Zugangslink: ${createdVipLink}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-600/20"
                  >
                    💬 Per WhatsApp
                  </a>
                  <a 
                    href={`mailto:${ceoEmail}?subject=${encodeURIComponent(`Ihr Kreativ-Desk OS Workspace für ${companyName}`)}&body=${encodeURIComponent(`Hallo ${ceoName || ''},\n\nIhr eigener Kreativ-Desk OS Workspace für ${companyName} wurde fertig eingerichtet!\n\nHier ist Ihr persönlicher VIP-Link zum Starten:\n${createdVipLink}\n\nBeste Grüsse,\nKreativ Desk OS Team`)}`}
                    className="py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
                  >
                    ✉️ Per E-Mail
                  </a>
                </div>

                <button 
                  onClick={() => {
                    setIsPreprovisionOpen(false);
                    setCreatedVipLink('');
                    setCompanyName('');
                    setCeoName('');
                    setCeoEmail('');
                    setEmployeeEmailsStr('');
                  }}
                  className="w-full py-2.5 border border-white/10 rounded-xl text-xs font-bold text-zinc-300 hover:bg-white/5 transition-colors"
                >
                  Schliessen
                </button>
              </div>
            ) : (
              <form onSubmit={handlePreprovisionSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase tracking-wider">Firmenname der Kunden-Firma *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="z.B. Muster Architekten AG"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm font-medium text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase tracking-wider">CEO / Ansprechpartner Name</label>
                    <input 
                      type="text" 
                      placeholder="z.B. Peter Muster"
                      value={ceoName}
                      onChange={e => setCeoName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm font-medium text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase tracking-wider">CEO E-Mail Adresse *</label>
                    <input 
                      type="email" 
                      required
                      placeholder="peter@muster.ch"
                      value={ceoEmail}
                      onChange={e => setCeoEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm font-medium text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase tracking-wider">Abo / Plan</label>
                    <select
                      value={plan}
                      onChange={e => setPlan(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Enterprise">Enterprise (Full OS - ab CHF 50'000.-)</option>
                      <option value="Pro">Pro (3D BIM & Mängel)</option>
                      <option value="Expert">Expert (Finanzen & API)</option>
                      <option value="Studio">Studio (CHF 15'000+)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase tracking-wider">Lizenzen (Seats)</label>
                    <input 
                      type="number"
                      min="1"
                      max="100"
                      value={maxSeats}
                      onChange={e => setMaxSeats(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase tracking-wider">Mitarbeiter E-Mails (Optional, Komma-getrennt)</label>
                  <input 
                    type="text" 
                    placeholder="mitarbeiter1@muster.ch, mitarbeiter2@muster.ch"
                    value={employeeEmailsStr}
                    onChange={e => setEmployeeEmailsStr(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm font-medium text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 text-xs font-mono"
                  />
                </div>

                <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <input 
                    type="checkbox"
                    id="seed-demo"
                    checked={seedDemoProject}
                    onChange={e => setSeedDemoProject(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="seed-demo" className="text-xs font-medium text-blue-200 cursor-pointer">
                    9 Firmenordner, Muster-Projekt & Baujournal vorab automatisch erstellen
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button 
                    type="button" 
                    onClick={() => setIsPreprovisionOpen(false)} 
                    className="px-4 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button 
                    type="submit" 
                    disabled={isPreprovisioning} 
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isPreprovisioning ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {isPreprovisioning ? 'Erstelle Workspace...' : '🚀 VIP Link Generieren'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}