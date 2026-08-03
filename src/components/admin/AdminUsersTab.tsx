import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Shield, UserCheck, Trash2, Loader2, Mail, X, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';

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

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setUsers(data);
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
      supabase.removeChannel(channel);
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

  const handleEditClick = (user: any) => {
    setEditingUser({ ...user, maxSeats: user.maxSeats || 1 });
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
          name: editingUser.name
        })
        .eq('id', editingUser.id);

      if (editingUser.company_id && (editingUser.role === 'owner' || editingUser.role === 'management')) {
         await supabase
           .from('companies')
           .update({
             max_seats: parseInt(editingUser.maxSeats) || 1
           })
           .eq('id', editingUser.company_id);
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

  const filtered = users.filter(u => 
    (u.name?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (u.email?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface border border-border p-4 rounded-xl shadow-sm gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder={t('search_users')} 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border/50 rounded-lg text-sm font-medium text-text-primary focus:outline-none focus:border-blue-500 shadow-sm transition-colors"
          />
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
                          onClick={() => handleEditClick(user)}
                          className="px-3 py-1.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg text-xs font-bold transition-colors"
                        >
                          Bearbeiten
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

              <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-surface-hover">{t('cancel')}</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20">{isSubmitting ? 'Speichere...' : t('save_changes')}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}