import React, { useState } from 'react';
import { Network, Key, Link as LinkIcon, Plus, Copy, CheckCircle2, Trash2, Webhook, RefreshCw, Settings } from 'lucide-react';
import { cn } from '../utils';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

export default function API() {
  const { language, t: globalT } = useLanguage();
  const { addToast } = useToast();
  const isDe = language === 'de';
  const t = (key: string) => globalT(key) || key;

  const [keys, setKeys] = useState<{ id: string; name: string; key: string; created: string; lastUsed: string }[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    addToast(isDe ? 'Kopiert!' : 'Copied!', 'success');
  };

  const handleCreateKey = () => {
    const newKey = {
      id: Math.random().toString(),
      name: isDe ? 'Neue Integration' : 'New Integration',
      key: 'kd_live_' + Math.random().toString(36).substring(2, 15),
      created: new Date().toLocaleDateString(isDe ? 'de-CH' : 'en-US'),
      lastUsed: isDe ? 'Noch nie' : 'Never'
    };
    setKeys([newKey, ...keys]);
    addToast(isDe ? 'Neuer Key generiert!' : 'New key generated!', 'success');
  };

  const handleDeleteKey = (id: string) => {
    setKeys(keys.filter(k => k.id !== id));
    addToast(isDe ? 'Key gelöscht' : 'Key deleted', 'info');
  };

  const roadmap = [
    { q: isDe ? 'Q3 2026' : 'Q3 2026', desc: isDe ? 'BIM 360 / Revit Direktsynchronisation' : 'BIM 360 / Revit Direct Sync' },
    { q: isDe ? 'Q4 2026' : 'Q4 2026', desc: isDe ? 'Slack & Microsoft Teams Bot' : 'Slack & Microsoft Teams Bot' },
    { q: isDe ? 'Q1 2027' : 'Q1 2027', desc: isDe ? 'Miro & Figma Whiteboard Einbindung' : 'Miro & Figma Whiteboard Integration' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface border border-border p-6 rounded-2xl shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-text-primary"><Network className="text-blue-500" size={24} /> {isDe ? 'API & Schnittstellen' : 'API & Integrations'}</h2>
          <p className="text-sm text-text-muted mt-1 font-medium">{isDe ? 'Verwalte deine API-Schlüssel für externe Tools.' : 'Manage your API keys for external tools.'}</p>
        </div>
        <button onClick={handleCreateKey} className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-blue-500 transition-all flex items-center justify-center gap-2"><Plus size={16} /> {isDe ? 'Neuer Key' : 'New Key'}</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1">{isDe ? 'Aktive API Keys' : 'Active API Keys'}</h3>
          
          {/* DESKTOP TABLE */}
          <div className="hidden md:block bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
            {keys.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] uppercase tracking-wider text-text-muted bg-surface/50 border-b border-border">
                  <tr><th className="px-6 py-5 font-bold">Integration</th><th className="px-6 py-5 font-bold">API Key</th><th className="px-6 py-5 font-bold">Status</th><th className="px-6 py-5 text-right font-bold">Aktionen</th></tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {keys.map(k => (
                    <tr key={k.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4"><div className="font-bold text-text-primary flex items-center gap-2"><Webhook size={14} className="text-text-muted"/> {k.name}</div><div className="text-[10px] text-text-muted mt-1 uppercase">Erstellt: {k.created}</div></td>
                      <td className="px-6 py-4"><div className="flex items-center gap-2"><code className="bg-background border border-border/50 px-2 py-1 rounded text-xs text-text-muted">{k.key}</code><button onClick={() => handleCopy(k.id, k.key)} className="p-1.5 text-text-muted hover:text-text-primary transition-colors">{copiedId === k.id ? <CheckCircle2 size={14} className="text-emerald-500"/> : <Copy size={14}/>}</button></div></td>
                      <td className="px-6 py-4 text-[10px] font-bold text-emerald-500 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Active</td>
                      <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => handleDeleteKey(k.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 size={16} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-text-muted text-sm">{isDe ? 'Keine API Keys vorhanden. Erstelle einen neuen Key, um zu starten.' : 'No API keys found. Create a new key to get started.'}</div>
            )}
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden flex flex-col gap-3">
            {keys.length > 0 ? keys.map(k => (
              <div key={k.id} className="bg-surface border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div><div className="font-bold text-text-primary text-sm flex items-center gap-2"><Webhook size={14} className="text-blue-500"/> {k.name}</div><div className="text-[10px] text-text-muted mt-1 uppercase tracking-widest">Erstellt: {k.created}</div></div>
                  <button onClick={() => handleDeleteKey(k.id)} className="text-text-muted hover:text-red-500 p-2 bg-background rounded-xl border border-border shrink-0"><Trash2 size={16}/></button>
                </div>
                <div className="bg-background border border-border/50 rounded-lg p-3 flex items-center justify-between"><code className="text-xs text-text-muted font-mono">{k.key}</code><button onClick={() => handleCopy(k.id, k.key)} className="p-2 bg-surface border border-border rounded-md shadow-sm">{copiedId === k.id ? <CheckCircle2 size={14} className="text-emerald-500"/> : <Copy size={14}/>}</button></div>
                <div className="text-xs text-text-muted font-bold pt-2 border-t border-border/50 flex justify-between items-center"><span>Zuletzt verwendet:</span> <span className="text-text-primary">{k.lastUsed}</span></div>
              </div>
            )) : (
              <div className="p-6 text-center text-text-muted text-sm bg-surface border border-border rounded-2xl shadow-sm">{isDe ? 'Keine API Keys vorhanden.' : 'No API keys found.'}</div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1">{isDe ? 'Integration Roadmap' : 'Integration Roadmap'}</h3>
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-6 relative overflow-hidden">
            {roadmap.map((item, i) => (
              <div key={i} className="relative pl-6 border-l-2 border-border/50 group hover:border-blue-500 transition-colors">
                <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-background border-2 border-border group-hover:border-blue-500 transition-colors"></div>
                <h4 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{item.q}</h4>
                <p className="text-sm font-medium text-text-primary mt-1 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}