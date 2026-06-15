import React, { useState, useEffect } from 'react';
import { Search, FolderOpen, Trash2, Loader2 } from 'lucide-react';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';

export default function AdminProjectsTab() {
  const [search, setSearch] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, 'projects'), (snapshot) => {
      const loaded = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        // 🔥 NEU: Wir filtern das Demo-Projekt heraus, damit niemand es aus Versehen löscht!
        .filter((proj: any) => proj.companyId !== 'demo-company');
        
      setProjects(loaded);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm("Achtung: Soll dieses Projekt wirklich gelöscht werden?")) return;
    try { await deleteDoc(doc(db, 'projects', projectId)); } catch (error) { console.error("Fehler beim Löschen", error); }
  };

  const filtered = projects.filter(p => (p.name?.toLowerCase() || '').includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface border border-border p-4 rounded-xl shadow-sm gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Projekte durchsuchen..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border/50 rounded-lg text-sm font-medium text-text-primary focus:outline-none focus:border-blue-500 shadow-sm transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
            <div className="col-span-full text-center py-12"><Loader2 className="animate-spin text-blue-500 mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full text-center py-12 text-text-muted font-medium bg-surface rounded-xl border border-border">Keine Projekte gefunden.</div>
          ) : (
            filtered.map(proj => (
              <div key={proj.id} className="bg-surface border border-border rounded-xl p-4 shadow-sm flex flex-col gap-3 group hover:border-blue-500/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="font-bold text-text-primary text-sm flex items-center gap-2">
                    <FolderOpen size={16} className="text-blue-500" /> {proj.name}
                  </div>
                  <button onClick={() => handleDeleteProject(proj.id)} className="text-text-muted hover:text-red-500 p-2 bg-background rounded-lg border border-border shrink-0 transition-colors shadow-sm opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                </div>
                <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-1 text-sm">
                  <span className="text-xs font-bold text-text-muted">Status:</span>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">{proj.status || 'Aktiv'}</span>
                </div>
              </div>
            ))
          )}
      </div>
    </div>
  );
}