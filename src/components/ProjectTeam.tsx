import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom'; 
import { useProject } from '../contexts/ProjectContext';
import { useLanguage } from '../contexts/LanguageContext'; 
import { 
  Users, UserPlus, Search, X, Shield, Mail, Building2, Loader2, Trash2
} from 'lucide-react';
import { cn } from '../utils';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    project_team: 'Project Team', team_desc: 'Manage project access and roles.', add_person: 'Add Person', name: 'Name',
    company_role: 'Company Role', project_role: 'Project Role', actions: 'Actions', viewer_role: 'Viewer (Read-only)',
    editor_role: 'Editor (Can edit data)', admin_role: 'Admin (Can manage team)', owner_role: 'Owner (Full control)',
    no_team_members: 'No team members yet.', remove: 'Remove', existing_user: 'Select existing', new_user: 'Invite new',
    search_contacts: 'Search contacts...', select_person: '-- Select Person --', email: 'Email', company_role_label: 'Company Role',
    cancel: 'Cancel', processing: 'Processing...', invite_and_add: 'Invite & Add', save: 'Save', upload_success: 'Successfully added!',
    upload_failed: 'Action failed.', delete_confirm: 'Are you sure?', completed: 'completed', role_external: 'External Partner',
    role_client: 'Client / Owner', role_internal: 'Internal Employee'
  },
  de: {
    project_team: 'Projekt Team', team_desc: 'Verwalte Projektzugriffe und Rollen.', add_person: 'Person hinzufügen', name: 'Name',
    company_role: 'Rolle (Firma)', project_role: 'Projekt-Rolle', actions: 'Aktionen', viewer_role: 'Viewer (Nur Lesezugriff)',
    editor_role: 'Editor (Darf Daten ändern)', admin_role: 'Admin (Darf Team verwalten)', owner_role: 'Owner (Volle Kontrolle)',
    no_team_members: 'Noch keine Teammitglieder.', remove: 'Entfernen', existing_user: 'Bestehenden wählen', new_user: 'Neuen einladen',
    search_contacts: 'Kontakte suchen...', select_person: '-- Person auswählen --', email: 'E-Mail', company_role_label: 'Firma Rolle',
    cancel: 'Abbrechen', processing: 'Verarbeite...', invite_and_add: 'Einladen & Hinzufügen', save: 'Speichern', upload_success: 'Erfolgreich hinzugefügt!',
    upload_failed: 'Aktion fehlgeschlagen.', delete_confirm: 'Bist du sicher?', completed: 'abgeschlossen', role_external: 'Externer Partner',
    role_client: 'Bauherr / Kunde', role_internal: 'Interner Mitarbeiter'
  }
};

// 🔥 FIX: Prop ID bevorzugen (für die Demo-App)
export default function ProjectTeam({ projectId: propProjectId }: { projectId?: string }) {
  const { projectId } = useParams();
  const { companyUsers = [], projectMembers = [], activeProjectId, addProjectMember, removeProjectMember } = useProject() as any;
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { language, t: globalT } = useLanguage();
  
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || (typeof globalT === 'function' ? globalT(key) : key);
  
  // 🔥 FIX: Zieht die ID aus Prop (Demo), URL oder Context!
  const currentProjectId = propProjectId || projectId || activeProjectId;
  const currentMembers = (projectMembers || []).filter((m: any) => m.projectId === currentProjectId);
  
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<'existing' | 'new'>('existing'); 
  const [selectedUserId, setSelectedUserId] = useState('');
  
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserCompanyRole, setNewUserCompanyRole] = useState<'Internal' | 'External Planner' | 'Client'>('External Planner');
  const [selectedRole, setSelectedRole] = useState<'Owner' | 'Admin' | 'Editor' | 'Viewer'>('Viewer');
  const [isProcessing, setIsProcessing] = useState(false);

  const availableCompanyUsers = (companyUsers || []).filter((cu: any) => !currentMembers.some((cm: any) => cm.userId === cu.id));

  const handleAddExistingUser = async () => {
    if (!selectedUserId || !currentProjectId || !currentUser?.companyId) return;
    setIsProcessing(true);
    try {
      const selectedUser = companyUsers.find((u: any) => u.id === selectedUserId);
      await addProjectMember(currentProjectId, {
        userId: selectedUserId,
        userEmail: selectedUser?.email || '',
        projectRole: selectedRole,
        companyRole: selectedUser?.role || 'External Partner'
      });
      addToast(t('upload_success'), 'success'); 
      setIsAddMemberModalOpen(false); 
      setSelectedUserId('');
    } catch (e) { 
      console.error(e);
      addToast(t('upload_failed'), 'error'); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const handleAddNewUser = async () => {
    if (!newUserName || !newUserEmail || !currentProjectId || !currentUser?.companyId) return;
    setIsProcessing(true);
    try {
      const newUserId = `user-${Date.now()}`;
      
      await setDoc(doc(db, 'companyUsers', newUserId), { 
        id: newUserId, 
        name: newUserName, 
        email: newUserEmail, 
        role: newUserCompanyRole,
        ownerId: currentUser.uid,
        companyId: currentUser.companyId 
      });
      
      await addProjectMember(currentProjectId, {
        userId: newUserId,
        userEmail: newUserEmail,
        projectRole: selectedRole,
        companyRole: newUserCompanyRole
      });
      
      addToast(t('upload_success'), 'success'); 
      setIsAddMemberModalOpen(false); 
      setNewUserName(''); 
      setNewUserEmail('');
    } catch (e) { 
      console.error(e);
      addToast(t('upload_failed'), 'error'); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (addMode === 'existing') handleAddExistingUser(); 
    else handleAddNewUser(); 
  };

  const handleRemoveMember = async (userId: string) => {
    if (!window.confirm(t('delete_confirm'))) return;
    try { 
      await removeProjectMember(currentProjectId, userId); 
      addToast(t('remove') + ' ' + t('completed'), 'success'); 
    } catch (e) { 
      addToast(t('upload_failed'), 'error'); 
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background text-text-primary min-h-0 relative">
      <div className="flex-1 flex flex-col p-4 md:p-6 space-y-6 overflow-hidden">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t('project_team')}</h1>
            <p className="text-text-muted text-sm mt-1">{t('team_desc')}</p>
          </div>
          <button onClick={() => setIsAddMemberModalOpen(true)} className="w-full md:w-auto px-5 py-3 md:py-2 bg-accent-ai text-white rounded-xl md:rounded-lg text-sm font-bold hover:bg-accent-ai/90 transition-all shadow-lg shadow-accent-ai/20 flex items-center justify-center gap-2">
            <UserPlus size={18} /> {t('add_person')}
          </button>
        </header>

        <div className="flex-1 overflow-auto bg-surface border border-border rounded-2xl shadow-lg custom-scrollbar">
          <table className="hidden md:table w-full text-sm text-left">
            <thead className="text-xs uppercase tracking-wider text-text-muted bg-surface/50 border-b border-border sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-semibold">{t('name')}</th>
                <th className="px-6 py-4 font-semibold">{t('company_role')}</th>
                <th className="px-6 py-4 font-semibold">{t('project_role')}</th>
                <th className="px-6 py-4 text-right font-semibold">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {currentMembers.map((member: any) => {
                const user = companyUsers.find((u: any) => u.id === member.userId);
                if (!user) return null; 
                return (
                  <tr key={member.id} className="hover:bg-background transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent-ai/10 text-accent-ai flex items-center justify-center font-bold text-xs border border-accent-ai/20 shrink-0">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-text-primary">{user.name}</div>
                          <div className="text-xs text-text-muted font-medium">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield size={14} className="text-text-muted" />
                        <span className={cn("px-2 py-0.5 rounded text-xs font-bold border tracking-wide uppercase", user.role === 'Internal' ? "bg-accent-ai/10 text-accent-ai border-accent-ai/20" : user.role === 'Client' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20")}>
                          {user.role === 'Internal' ? t('role_internal') : user.role === 'Client' ? t('role_client') : t('role_external')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select value={member.projectRole} onChange={(e) => setDoc(doc(db, 'projectMembers', member.id), { projectRole: e.target.value }, { merge: true })} className="bg-background border border-border/50 rounded-lg px-3 py-1.5 text-xs font-bold text-text-primary focus:outline-none focus:border-accent-ai cursor-pointer">
                        <option value="Viewer">{t('viewer_role')}</option><option value="Editor">{t('editor_role')}</option><option value="Admin">{t('admin_role')}</option><option value="Owner">{t('owner_role')}</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleRemoveMember(member.userId)} className="text-text-muted hover:text-red-500 p-2 rounded-md hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100" title={t('remove')}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                );
              })}
              {currentMembers.length === 0 && <tr><td colSpan={4} className="px-6 py-12 text-center text-text-muted font-medium">{t('no_team_members')}</td></tr>}
            </tbody>
          </table>

          <div className="md:hidden flex flex-col gap-4 p-4 pb-24">
            {currentMembers.length === 0 && <div className="text-center text-text-muted py-12 text-sm font-medium border-2 border-dashed border-border/50 rounded-2xl bg-surface/30">{t('no_team_members')}</div>}
            {currentMembers.map((member: any) => {
              const user = companyUsers.find((u: any) => u.id === member.userId);
              if (!user) return null;
              return (
                <div key={member.id} className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-4 shadow-sm relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-accent-ai/10 text-accent-ai flex items-center justify-center font-bold text-lg border border-accent-ai/20">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-text-primary truncate text-base">{user.name}</div>
                        <div className="text-xs text-text-muted truncate font-medium">{user.email}</div>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveMember(member.userId)} className="text-text-muted hover:text-red-500 p-2 bg-background rounded-xl border border-border/50 transition-colors shrink-0"><Trash2 size={18} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isAddMemberModalOpen && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface border-t sm:border border-border sm:rounded-3xl rounded-t-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            <div className="p-5 border-b border-border flex justify-between items-center bg-surface/50 shrink-0">
              <h3 className="font-bold text-text-primary flex items-center gap-2"><UserPlus size={20} className="text-accent-ai" /> {t('add_person')}</h3>
              <button onClick={() => setIsAddMemberModalOpen(false)} className="text-text-muted hover:text-text-primary transition-colors bg-background p-2 rounded-xl border border-border/50"><X size={20}/></button>
            </div>
            
            <div className="flex p-1.5 gap-1 bg-background border-b border-border shrink-0">
              <button type="button" onClick={() => setAddMode('existing')} className={cn("flex-1 py-2.5 text-xs font-bold transition-all rounded-xl", addMode === 'existing' ? "bg-surface text-text-primary shadow-sm border border-border/50" : "text-text-muted hover:text-text-primary")}>{t('existing_user')}</button>
              <button type="button" onClick={() => setAddMode('new')} className={cn("flex-1 py-2.5 text-xs font-bold transition-all rounded-xl", addMode === 'new' ? "bg-surface text-text-primary shadow-sm border border-border/50" : "text-text-muted hover:text-text-primary")}>{t('new_user')}</button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-6 bg-background/50 overflow-y-auto max-h-[60vh] custom-scrollbar">
              {addMode === 'existing' ? (
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">{t('search_contacts')}</label>
                  <div className="relative">
                    <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="w-full bg-background border border-border/50 rounded-xl px-4 py-3.5 text-sm focus:border-accent-ai text-text-primary font-bold appearance-none cursor-pointer shadow-inner">
                      <option value="" className="text-text-muted">{t('select_person')}</option>
                      {availableCompanyUsers.map((u: any) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div><label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">{t('name')}</label><input type="text" required value={newUserName} onChange={e => setNewUserName(e.target.value)} className="w-full bg-background border border-border/50 rounded-xl py-3.5 px-4 text-sm font-bold focus:border-accent-ai text-text-primary shadow-inner" /></div>
                  <div><label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">{t('email')}</label><input type="email" required value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="w-full bg-background border border-border/50 rounded-xl py-3.5 px-4 text-sm font-bold focus:border-accent-ai text-text-primary shadow-inner" /></div>
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">{t('company_role_label')}</label>
                    <div className="relative">
                      <select value={newUserCompanyRole} onChange={e => setNewUserCompanyRole(e.target.value as any)} className="w-full bg-background border border-border/50 rounded-xl py-3.5 px-4 text-sm font-bold focus:border-accent-ai text-text-primary appearance-none shadow-inner">
                        <option value="External Planner">{t('role_external')}</option><option value="Client">{t('role_client')}</option><option value="Internal">{t('role_internal')}</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-border/50">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2 mt-4">{t('project_role')}</label>
                <div className="relative">
                  <select value={selectedRole} onChange={e => setSelectedRole(e.target.value as any)} className="w-full bg-background text-text-primary font-bold border border-border/50 rounded-xl px-4 py-3.5 text-sm focus:border-accent-ai appearance-none cursor-pointer shadow-inner">
                    <option value="Viewer">{t('viewer_role')}</option><option value="Editor">{t('editor_role')}</option><option value="Admin">{t('admin_role')}</option><option value="Owner">{t('owner_role')}</option>
                  </select>
                </div>
              </div>
            </form>
            
            <div className="p-6 pt-2 border-t border-border/50 bg-surface flex flex-col sm:flex-row justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setIsAddMemberModalOpen(false)} className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-text-muted hover:text-text-primary transition-colors border border-border sm:border-transparent rounded-xl">{t('cancel')}</button>
                <button 
                  onClick={handleFormSubmit}
                  disabled={isProcessing || (addMode === 'existing' && !selectedUserId)} 
                  className="w-full sm:w-auto px-8 py-3.5 bg-accent-ai text-white rounded-xl text-sm font-bold hover:bg-accent-ai/90 transition-colors shadow-lg shadow-accent-ai/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing && <Loader2 size={18} className="animate-spin" />} {isProcessing ? t('processing') : (addMode === 'new' ? t('invite_and_add') : t('save'))}
                </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}