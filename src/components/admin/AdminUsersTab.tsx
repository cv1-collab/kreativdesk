import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Shield, UserCheck, Trash2, Loader2, Mail, X, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';

// Import the offboarding service if you have one, else standard deleteDoc
import { offboardCompanyUser } from '../../services/userService';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    search_users: 'Search users...', name_email: 'Name & Email', role_plan: 'Role & Plan', status: 'Status',
    actions: 'Actions', active: 'Active', unnamed: 'Unnamed', delete_user_confirm: 'Are you sure you want to delete this user?',
    no_users_found: 'No users found.', edit_user: 'Edit User Details', save_changes: 'Save Changes', cancel: 'Cancel',
    user_saved: 'User successfully updated.', role: 'Role', plan: 'Subscription Plan', max_seats: 'Purchased Licenses (maxSeats)',
    full_name: 'Full Name', email_address: 'Email Address'
  },
  de: {
    search_users: 'Benutzer suchen...', name_email: 'Name & E-Mail', role_plan: 'Rolle & Plan', status: 'Status',
    actions: 'Aktionen', active: 'Aktiv', unnamed: 'Unbenannt', delete_user_confirm: 'Möchtest du diesen Nutzer wirklich löschen?',
    no_users_found: 'Keine Benutzer gefunden.', edit_user: 'Benutzer bearbeiten', save_changes: 'Änderungen speichern', cancel: 'Abbrechen',
    user_saved: 'Benutzer erfolgreich aktualisiert.', role: 'Rolle', plan: 'Abo / Plan', max_seats: 'Gekaufte Lizenzen (maxSeats)',
    full_name: 'Name', email_address: 'E-Mail Adresse'
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

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const handleDeleteUser = async (user: any) => {
    if (!window.confirm(t('delete_user_confirm'))) return;
    try {
      if (typeof offboardCompanyUser === 'function') {
        await offboardCompanyUser(user.companyId, user.id);
      } else {
        await deleteDoc(doc(db, 'users', user.id));
      }
      addToast(t('user_saved'), 'success');
    } catch (error) { addToast('Fehler beim Löschen', 'error'); }
  };

  const handleEditClick = (user: any) => {
    setEditingUser({ ...user, maxSeats: user.maxSeats || 1 });
    setIsModalOpen(true);
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !db) return;
    setIsSubmitting(true);
    try {
      // 1. Update the User profile
      await updateDoc(doc(db, 'users', editingUser.id), {
        role: editingUser.role,
        plan: editingUser.plan
      });

      // 2. 🔥 Update the Company's MaxSeats & Plan
      if (editingUser.companyId && (editingUser.role === 'owner' || editingUser.role === 'management')) {
         await updateDoc(doc(db, 'companies', editingUser.companyId), {
           plan: editingUser.plan,
           maxSeats: parseInt(editingUser.maxSeats) || 1
         });
      }

      addToast(t('user_saved'), 'success');
      setIsModalOpen(false);
    } catch (error) { addToast('Fehler beim Speichern', 'error'); }
    finally { setIsSubmitting(false); }
  };

  const filtered = users.filter(u => 
    (u.email?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (u.displayName?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input type="text" placeholder={t('search_users')} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="bg-background/50 border-b border-border text-xs uppercase text-text-muted">
              <tr>
                <th className="px-6 py-4 font-bold tracking-widest">{t('name_email')}</th>
                <th className="px-6 py-4 font-bold tracking-widest">{t('role_plan')}</th>
                <th className="px-6 py-4 font-bold tracking-widest">{t('status')}</th>
                <th className="px-6 py-4 font-bold tracking-widest text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-text-muted"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-text-muted">{t('no_users_found')}</td></tr>
              ) : (
                filtered.map(user => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-xs shrink-0">
                          {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-text-primary">{user.displayName || t('unnamed')}</div>
                          <div className="text-xs text-text-muted flex items-center gap-1 mt-0.5"><Mail size={12}/> {user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className={cn("inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider", user.role === 'owner' ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-surface border border-border text-text-muted")}>
                          {user.role === 'owner' ? <Shield size={10}/> : <UserCheck size={10}/>} {user.role || 'user'}
                        </span>
                        <span className="text-xs font-medium text-text-muted">{user.plan || 'Free Trial'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 text-emerald-500 text-xs font-bold"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"/> {t('active')}</span></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEditClick(user)} className="px-3 py-1.5 text-xs font-bold text-text-primary bg-surface border border-border hover:border-blue-500/50 rounded-lg transition-colors">Edit</button>
                        <button onClick={() => handleDeleteUser(user)} className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16}/></button>
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
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <div className="bg-surface border-t md:border border-border/50 md:rounded-2xl w-full max-w-lg shadow-2xl flex flex-col h-[100dvh] md:h-auto animate-in slide-in-from-bottom md:zoom-in-95 mt-auto md:mt-0" onClick={e => e.stopPropagation()}>
            <div className="p-4 md:p-6 border-b border-border/50 flex items-center justify-between bg-surface/90 backdrop-blur-md shrink-0">
              <h3 className="font-bold text-lg text-text-primary">{t('edit_user')}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-primary p-2 bg-background rounded-lg border border-border transition-colors"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
              <form id="edit-user-form" onSubmit={handleSaveChanges} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('full_name')}</label>
                  <input type="text" value={editingUser.displayName || ''} disabled className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm text-text-primary opacity-50 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('email_address')}</label>
                  <input type="email" value={editingUser.email || ''} disabled className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm text-text-primary opacity-50 cursor-not-allowed" />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('role')}</label>
                    <select value={editingUser.role || 'user'} onChange={(e) => setEditingUser({...editingUser, role: e.target.value})} className="w-full bg-surface border border-border/50 rounded-lg px-4 py-3 text-sm font-bold text-text-primary focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer">
                      <option value="user">User</option>
                      <option value="management">Management</option>
                      <option value="owner">Owner (Admin)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('plan')}</label>
                    <select value={editingUser.plan || 'Free'} onChange={(e) => setEditingUser({...editingUser, plan: e.target.value})} className="w-full bg-surface border border-border/50 rounded-lg px-4 py-3 text-sm font-bold text-text-primary focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer">
                      <option value="Free">Free</option>
                      <option value="Starter">Starter</option>
                      <option value="Pro">Pro</option>
                      <option value="Expert">Expert</option>
                      <option value="Studio">Kreativ Desk Studio</option>
                      <option value="Agency">Kreativ Desk Agency</option>
                      <option value="Enterprise">Kreativ Desk Enterprise</option>
                    </select>
                  </div>
                </div>

                {/* 🔥 LIZENZ-VERWALTUNG (Nur sinnvoll für Owner) */}
                {(editingUser.role === 'owner' || editingUser.role === 'management') && (
                  <div className="pt-2">
                    <label className="text-xs font-bold text-purple-400 uppercase tracking-widest block mb-2">{t('max_seats')}</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="1000" 
                      value={editingUser.maxSeats} 
                      onChange={(e) => setEditingUser({...editingUser, maxSeats: e.target.value})} 
                      className="w-full bg-purple-500/10 border border-purple-500/30 rounded-lg px-4 py-3 text-sm font-black text-purple-400 focus:outline-none focus:border-purple-500 shadow-sm" 
                    />
                    <p className="text-[10px] text-text-muted mt-2">Legt fest, wie viele Teammitglieder in diesen Workspace eingeladen werden dürfen (B2B Enterprise Logik).</p>
                  </div>
                )}
              </form>
            </div>

            <div className="p-4 md:p-6 border-t border-border bg-surface/90 backdrop-blur-md flex flex-col sm:flex-row justify-end gap-3 shrink-0 sticky bottom-0 z-30">
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-text-primary border border-border sm:border-transparent rounded-lg transition-colors">{t('cancel')}</button>
              <button form="edit-user-form" type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {isSubmitting && <Loader2 size={16} className="animate-spin"/>} 
                <CheckCircle2 size={18} /> {t('save_changes')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}