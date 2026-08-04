import React, { useState, useEffect } from 'react';
import { Network, Key, Link as LinkIcon, Plus, Copy, CheckCircle2, Trash2, Webhook, RefreshCw, Settings } from 'lucide-react';
import { cn } from '../utils';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function API() {
  const { language, t: globalT } = useLanguage();
  const { addToast } = useToast();
  const { currentUser } = useAuth();
  const isDe = language === 'de';

  const [keys, setKeys] = useState<{ id: string; name: string; key: string; created: string; lastUsed: string }[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchKeys = async () => {
    if (!currentUser?.companyId) return;
    try {
      const { data } = await supabase
        .from('api_keys')
        .select('*')
        .eq('company_id', currentUser.companyId)
        .order('created_at', { ascending: false });

      if (data) {
        setKeys(data.map(d => ({
          id: d.id,
          name: d.name || 'API Integration',
          key: d.key,
          created: d.created_at ? new Date(d.created_at).toLocaleDateString(isDe ? 'de-CH' : 'en-US') : new Date().toLocaleDateString(),
          lastUsed: d.last_used ? new Date(d.last_used).toLocaleDateString(isDe ? 'de-CH' : 'en-US') : (isDe ? 'Noch nie' : 'Never')
        })));
      }
    } catch (err) {
      console.error("Error fetching API keys:", err);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, [currentUser, isDe]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast(isDe ? 'API Key kopiert!' : 'API Key copied!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateKey = async () => {
    if (!currentUser?.companyId) return;
    try {
      const newKey = `kd_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      await supabase.from('api_keys').insert({
        name: `API Key ${keys.length + 1}`,
        key: newKey,
        company_id: currentUser.companyId,
        created_at: new Date().toISOString()
      });
      addToast(isDe ? 'Neuer API Key erstellt!' : 'New API Key generated!', 'success');
      fetchKeys();
    } catch (err) {
      addToast('Fehler beim Erstellen', 'error');
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      await supabase.from('api_keys').delete().eq('id', id);
      addToast(isDe ? 'API Key gelöscht.' : 'API Key deleted.', 'info');
      fetchKeys();
    } catch (err) {
      addToast('Fehler beim Löschen', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-surface border border-border p-6 rounded-3xl shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-xl font-black text-text-primary flex items-center gap-2">
              <Key className="text-blue-500" size={24} />
              {isDe ? 'API Schlüssel & Webhooks' : 'API Keys & Webhooks'}
            </h3>
            <p className="text-text-muted text-sm font-medium">
              {isDe ? 'Verwalte deine API-Zugänge zur Anbindung externer Systeme.' : 'Manage your API credentials for external integrations.'}
            </p>
          </div>
          <button 
            onClick={handleCreateKey}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all"
          >
            <Plus size={16} /> {isDe ? 'Neuen Key erstellen' : 'Create New Key'}
          </button>
        </div>

        <div className="space-y-3">
          {keys.length === 0 ? (
            <div className="text-center py-12 text-text-muted font-medium bg-background rounded-2xl border border-border/50">
              {isDe ? 'Keine aktiven API Schlüssel vorhanden.' : 'No active API keys found.'}
            </div>
          ) : (
            keys.map(k => (
              <div key={k.id} className="p-4 bg-background border border-border/50 rounded-2xl flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-sm text-text-primary">{k.name}</div>
                  <div className="font-mono text-xs text-text-muted mt-1">{k.key.substring(0, 12)}...</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleCopy(k.id, k.key)} className="p-2 hover:bg-surface rounded-lg text-text-muted hover:text-text-primary">
                    {copiedId === k.id ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                  <button onClick={() => handleDeleteKey(k.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-text-muted hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* WEBHOOK AUTOMATION SECTION */}
      <div className="bg-surface border border-border p-6 rounded-3xl shadow-sm space-y-4">
        <h3 className="text-xl font-black text-text-primary flex items-center gap-2">
          <Webhook className="text-emerald-500" size={24} />
          {isDe ? 'Outgoing Webhooks (Slack / Teams / Zapier)' : 'Outgoing Webhooks'}
        </h3>
        <p className="text-text-muted text-sm font-medium">
          {isDe ? 'Erhalte automatische Benachrichtigungen in Slack oder MS Teams, sobald Mängel, Rechnungen oder Leads erstellt werden.' : 'Receive automated alerts in Slack or MS Teams on new defects, invoices, or leads.'}
        </p>

        <div className="flex gap-3">
          <input 
            type="url" 
            placeholder="https://hooks.slack.com/services/..." 
            id="webhook-url-input"
            className="flex-1 px-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm font-medium text-text-primary"
          />
          <button 
            type="button" 
            onClick={() => {
              const input = document.getElementById('webhook-url-input') as HTMLInputElement;
              if (input && input.value) {
                const urls = JSON.parse(localStorage.getItem('kreativdesk_webhook_urls') || '[]');
                urls.push(input.value);
                localStorage.setItem('kreativdesk_webhook_urls', JSON.stringify(urls));
                input.value = '';
                addToast(isDe ? 'Webhook URL gespeichert!' : 'Webhook URL saved!', 'success');
              }
            }}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20"
          >
            {isDe ? 'Webhook Speichern' : 'Save Webhook'}
          </button>
        </div>
      </div>
    </div>
  );
}