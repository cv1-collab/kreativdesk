import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { Mail, Building, Phone, Calendar, Trash2, Megaphone } from 'lucide-react';
import { cn } from '../../utils';
import { useToast } from '../../contexts/ToastContext';

// 🔥 NEU: Helfer-Funktion für sicheres Datum-Parsing
const parseDate = (dateData: any) => {
  if (!dateData) return new Date();
  if (typeof dateData.toDate === 'function') return dateData.toDate(); // Firebase Timestamp
  const d = new Date(dateData);
  return isNaN(d.getTime()) ? new Date() : d; // Fallback
};

export default function AdminLeadsTab() {
  const { addToast } = useToast();
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'leads'), where('companyId', '==', 'kreativ-desk-website'));
    const unsub = onSnapshot(q, (snapshot) => {
      const loaded = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // 🔥 NEU: Sichere Sortierung
      loaded.sort((a: any, b: any) => parseDate(b.createdAt).getTime() - parseDate(a.createdAt).getTime());
      
      setLeads(loaded);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'leads', id), { status: newStatus });
    } catch (e) {
      console.error(e);
    }
  };

  const handleProvisionEnterprise = async (lead: any) => {
    try {
      const inviteToken = `ent_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      await setDoc(doc(db, 'invites', inviteToken), {
        type: 'enterprise_workspace',
        companyName: lead.company || `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Enterprise Workspace',
        email: lead.email,
        role: 'owner',
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      const inviteLink = `${window.location.origin}/signup?invite=${inviteToken}`;
      
      await updateDoc(doc(db, 'leads', lead.id), { 
        status: 'Done',
        inviteLink: inviteLink
      });

      addToast('Workspace vorbereitet! Der Einladungslink wird nun angezeigt.', 'success');
    } catch (e) {
      console.error('Error provisioning:', e);
      addToast('Fehler beim Freischalten.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Anfrage wirklich löschen?')) {
      try {
        await deleteDoc(doc(db, 'leads', id));
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-text-primary"><Megaphone className="text-orange-500" size={24} /> B2B Anfragen (Leads)</h2>
          <p className="text-sm text-text-muted mt-1 font-medium">Alle Enterprise Setup-Anfragen von der öffentlichen Landingpage.</p>
        </div>
        <div className="bg-orange-500/10 text-orange-500 font-bold px-4 py-2 rounded-xl text-sm border border-orange-500/20">
          Total: {leads.length}
        </div>
      </div>

      <div className="bg-background md:bg-surface border-transparent md:border-border md:border rounded-xl shadow-none md:shadow-sm overflow-hidden">
        
        {/* DESKTOP TABLE */}
        <table className="w-full text-sm text-left border-collapse hidden md:table">
          <thead className="text-[10px] uppercase tracking-widest text-text-muted bg-background border-b border-border/50">
            <tr>
              <th className="px-6 py-4 font-bold">Datum & Kontakt</th>
              <th className="px-6 py-4 font-bold">Details</th>
              <th className="px-6 py-4 font-bold">Nachricht / Projekt</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-12 text-text-muted">Lade Anfragen...</td></tr>
            ) : leads.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-text-muted">Noch keine Anfragen vorhanden.</td></tr>
            ) : (
              leads.map(lead => (
                <React.Fragment key={lead.id}>
                <tr className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
                      <Calendar size={12}/> {parseDate(lead.createdAt).toLocaleDateString('de-CH')}
                    </div>
                    <div className="font-bold text-text-primary">{lead.firstName} {lead.lastName} {lead.name && !lead.firstName ? lead.name : ''}</div>
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold"><Building size={12} className="text-text-muted"/> {lead.company || '-'}</div>
                    <div className="flex items-center gap-2 text-xs text-text-muted"><Mail size={12}/> <a href={`mailto:${lead.email}`} className="hover:text-accent-ai transition-colors">{lead.email}</a></div>
                    <div className="flex items-center gap-2 text-xs text-text-muted"><Phone size={12}/> <a href={`tel:${lead.phone}`} className="hover:text-accent-ai transition-colors">{lead.phone || '-'}</a></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs bg-background border border-border/50 p-2 rounded-lg text-text-muted max-w-xs line-clamp-3 leading-relaxed" title={lead.message}>
                      {lead.message || 'Keine Nachricht hinterlassen.'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={lead.status || 'New'} 
                      onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                      className={cn("text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border outline-none cursor-pointer shadow-sm", 
                        lead.status === 'New' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : 
                        lead.status === 'Done' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                        "bg-blue-500/10 text-blue-500 border-blue-500/20")}
                    >
                      <option value="New">Neu</option>
                      <option value="Pending">In Kontakt</option>
                      <option value="Done">Erledigt</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {lead.status !== 'Done' && (
                        <button 
                          onClick={() => handleProvisionEnterprise(lead)} 
                          className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors opacity-0 group-hover:opacity-100"
                        >
                          Freischalten
                        </button>
                      )}
                      <button onClick={() => handleDelete(lead.id)} className="p-2 text-text-muted hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
                {lead.inviteLink && (
                  <tr>
                    <td colSpan={5} className="px-6 py-3 bg-emerald-500/5 border-t border-border/50">
                      <div className="flex items-center gap-2 text-xs text-emerald-500 font-medium">
                        <span className="font-bold">Einladungslink:</span> 
                        <input type="text" readOnly value={lead.inviteLink} className="bg-transparent border-none outline-none w-full cursor-text" onClick={(e) => (e.target as HTMLInputElement).select()} />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
              ))
            )}
          </tbody>
        </table>

        {/* MOBILE CARDS */}
        <div className="md:hidden flex flex-col gap-3 pb-8">
          {isLoading ? (
            <div className="text-center py-12 text-text-muted">Lade Anfragen...</div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12 text-text-muted bg-surface rounded-xl border border-border">Noch keine Anfragen vorhanden.</div>
          ) : (
            leads.map(lead => (
              <div key={lead.id} className="bg-surface border border-border rounded-xl p-4 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-text-primary text-base">{lead.firstName} {lead.lastName} {lead.name && !lead.firstName ? lead.name : ''}</div>
                    <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1">
                      <Calendar size={12}/> {parseDate(lead.createdAt).toLocaleDateString('de-CH')}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(lead.id)} className="text-text-muted hover:text-red-500 p-2 bg-background rounded-lg border border-border shrink-0 transition-colors shadow-sm"><Trash2 size={16}/></button>
                </div>
                
                <div className="flex flex-col gap-2 bg-background p-3 rounded-lg border border-border/50 text-xs">
                  <div className="font-bold text-text-primary flex items-center gap-2"><Building size={14} className="text-text-muted"/> {lead.company || 'Keine Firma'}</div>
                  <div className="flex items-center gap-2 text-text-muted"><Mail size={14}/> {lead.email}</div>
                  {lead.phone && <div className="flex items-center gap-2 text-text-muted"><Phone size={14}/> {lead.phone}</div>}
                </div>

                {lead.message && (
                  <div className="text-xs text-text-muted leading-relaxed bg-background/50 p-3 rounded-lg border border-border/30">
                    {lead.message}
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-1">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Status:</span>
                  <div className="flex items-center gap-2">
                    {lead.status !== 'Done' && (
                      <button 
                        onClick={() => handleProvisionEnterprise(lead)} 
                        className="px-3 py-1.5 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors"
                      >
                        Freischalten
                      </button>
                    )}
                    <select 
                      value={lead.status || 'New'} 
                      onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                      className={cn("text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border outline-none cursor-pointer shadow-sm", 
                        lead.status === 'New' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : 
                        lead.status === 'Done' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                        "bg-blue-500/10 text-blue-500 border-blue-500/20")}
                    >
                      <option value="New">Neu</option>
                      <option value="Pending">In Kontakt</option>
                      <option value="Done">Erledigt</option>
                    </select>
                  </div>
                </div>
                {lead.inviteLink && (
                  <div className="bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/20 mt-2">
                    <div className="text-[10px] font-bold text-emerald-500 mb-1">Einladungslink:</div>
                    <input type="text" readOnly value={lead.inviteLink} className="text-xs text-text-primary bg-transparent w-full outline-none" onClick={(e) => (e.target as HTMLInputElement).select()} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}