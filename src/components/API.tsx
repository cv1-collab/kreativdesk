import React, { useState, useEffect } from 'react';
import { Network, Key, Link as LinkIcon, Plus, Copy, CheckCircle2, Trash2, Webhook, RefreshCw, Send, ShieldCheck, AlertCircle, Play, Check, X } from 'lucide-react';
import { cn } from '../utils';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { webhookNotifier, WebhookEndpoint, WebhookEventType, WebhookTestResult } from '../utils/webhookNotifier';

export default function API() {
  const { language } = useLanguage();
  const { addToast } = useToast();
  const { currentUser } = useAuth();
  const isDe = language === 'de';

  const [keys, setKeys] = useState<{ id: string; name: string; key: string; created: string; lastUsed: string }[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Webhooks State
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [secretKey, setSecretKey] = useState<string>('');
  const [isSecretCopied, setIsSecretCopied] = useState(false);

  // Test Webhook Modal/State
  const [testingEndpointId, setTestingEndpointId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ endpointName: string; result: WebhookTestResult } | null>(null);

  // Add/Edit Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEndpointName, setNewEndpointName] = useState('');
  const [newEndpointUrl, setNewEndpointUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<WebhookEventType[]>([
    'lead.created', 'defect.created', 'invoice.created', 'document.uploaded'
  ]);

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

  const loadWebhooks = () => {
    const companyId = currentUser?.companyId;
    const epList = webhookNotifier.getWebhooks(companyId);
    setEndpoints(epList);
    const sec = webhookNotifier.getSecretKey(companyId);
    setSecretKey(sec);
  };

  useEffect(() => {
    fetchKeys();
    loadWebhooks();
  }, [currentUser?.companyId, isDe]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast(isDe ? 'Kopiert!' : 'Copied!', 'success');
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

  const handleRegenerateSecret = () => {
    const newSec = webhookNotifier.regenerateSecretKey(currentUser?.companyId);
    setSecretKey(newSec);
    addToast(isDe ? 'Neuer Webhook Secret Key generiert!' : 'New Webhook Secret Key generated!', 'success');
  };

  const handleToggleEndpoint = (id: string) => {
    const updated = endpoints.map(ep => ep.id === id ? { ...ep, active: !ep.active } : ep);
    setEndpoints(updated);
    webhookNotifier.saveWebhooks(updated, currentUser?.companyId);
    addToast(isDe ? 'Webhook-Status aktualisiert' : 'Webhook status updated', 'success');
  };

  const handleDeleteEndpoint = (id: string) => {
    const updated = endpoints.filter(ep => ep.id !== id);
    setEndpoints(updated);
    webhookNotifier.saveWebhooks(updated, currentUser?.companyId);
    addToast(isDe ? 'Webhook gelöscht' : 'Webhook deleted', 'info');
  };

  const handleTestEndpoint = async (ep: WebhookEndpoint) => {
    setTestingEndpointId(ep.id);
    try {
      const res = await webhookNotifier.testWebhook(ep.url, secretKey, ep.events[0] || 'lead.created');
      setTestResult({ endpointName: ep.name, result: res });
      if (res.success) {
        addToast(isDe ? `Test erfolgreich! (${res.status} OK in ${res.durationMs}ms)` : `Test successful! (${res.status} OK in ${res.durationMs}ms)`, 'success');
      } else {
        addToast(isDe ? `Webhook Test fehlgeschlagen (${res.status || 'Fehler'})` : `Webhook Test failed (${res.status || 'Error'})`, 'error');
      }
    } catch (e: any) {
      addToast(e.message || 'Fehler beim Testen', 'error');
    } finally {
      setTestingEndpointId(null);
    }
  };

  const handleAddEndpointSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEndpointUrl.trim()) return;

    let formattedUrl = newEndpointUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const newEp: WebhookEndpoint = {
      id: `wh_${Date.now()}`,
      name: newEndpointName.trim() || (formattedUrl.includes('slack') ? 'Slack Integration' : 'Webhook Endpoint'),
      url: formattedUrl,
      events: selectedEvents.length > 0 ? selectedEvents : ['lead.created', 'defect.created', 'invoice.created'],
      active: true,
      created_at: new Date().toISOString()
    };

    const updated = [...endpoints, newEp];
    setEndpoints(updated);
    webhookNotifier.saveWebhooks(updated, currentUser?.companyId);

    setNewEndpointName('');
    setNewEndpointUrl('');
    setShowAddModal(false);
    addToast(isDe ? 'Webhook erfolgreich hinzugefügt!' : 'Webhook endpoint added!', 'success');
  };

  const toggleEventSelection = (ev: WebhookEventType) => {
    if (selectedEvents.includes(ev)) {
      setSelectedEvents(selectedEvents.filter(e => e !== ev));
    } else {
      setSelectedEvents([...selectedEvents, ev]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* API KEYS CARD */}
      <div className="bg-surface border border-border/60 p-6 rounded-3xl shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-xl font-black text-text-primary flex items-center gap-2">
              <Key className="text-blue-500" size={24} />
              {isDe ? 'API Schlüssel' : 'API Keys'}
            </h3>
            <p className="text-text-muted text-sm font-medium">
              {isDe ? 'Verwalte deine API-Zugänge zur sicheren Anbindung externer Systeme.' : 'Manage your API credentials for secure integrations.'}
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
            <div className="text-center py-8 text-text-muted font-medium bg-background rounded-2xl border border-border/50 text-sm">
              {isDe ? 'Keine aktiven API Schlüssel vorhanden.' : 'No active API keys found.'}
            </div>
          ) : (
            keys.map(k => (
              <div key={k.id} className="p-4 bg-background border border-border/50 rounded-2xl flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-sm text-text-primary">{k.name}</div>
                  <div className="font-mono text-xs text-text-muted mt-1">{k.key.substring(0, 16)}...</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleCopy(k.id, k.key)} className="p-2 hover:bg-surface rounded-lg text-text-muted hover:text-text-primary transition-colors">
                    {copiedId === k.id ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                  <button onClick={() => handleDeleteKey(k.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-text-muted hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* WEBHOOK AUTOMATION SECTION */}
      <div className="bg-surface border border-border/60 p-6 rounded-3xl shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-black text-text-primary flex items-center gap-2">
              <Webhook className="text-emerald-500" size={24} />
              {isDe ? 'Outgoing Webhooks & Integrationen' : 'Outgoing Webhooks'}
            </h3>
            <p className="text-text-muted text-sm font-medium">
              {isDe ? 'Sende Echtzeit-Events an Slack, Make, Zapier oder deine eigenen Server.' : 'Send real-time event payloads to Slack, Make, Zapier, or your custom endpoints.'}
            </p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
          >
            <Plus size={16} /> {isDe ? 'Webhook hinzufügen' : 'Add Webhook'}
          </button>
        </div>

        {/* SECRET KEY DISPLAY CARD */}
        <div className="p-4 bg-background/80 border border-border/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" /> Webhook Signing Secret Key (HMAC-SHA256)
            </div>
            <div className="font-mono text-xs text-text-primary font-bold">{secretKey}</div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleCopy('wh_sec', secretKey)}
              className="px-3 py-1.5 bg-surface hover:bg-border/40 text-text-primary rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-border/50"
            >
              {copiedId === 'wh_sec' ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
              {isDe ? 'Kopieren' : 'Copy'}
            </button>
            <button 
              onClick={handleRegenerateSecret}
              title={isDe ? 'Secret neu generieren' : 'Regenerate secret'}
              className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface rounded-lg transition-colors"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* ENDPOINTS LIST */}
        <div className="space-y-3">
          {endpoints.length === 0 ? (
            <div className="text-center py-10 text-text-muted font-medium bg-background rounded-2xl border border-border/50 text-sm">
              {isDe ? 'Noch keine Webhook-Endpunkte angelegt.' : 'No webhook endpoints configured.'}
            </div>
          ) : (
            endpoints.map(ep => (
              <div key={ep.id} className="p-4 bg-background border border-border/50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", ep.active ? "bg-emerald-500 shadow-sm shadow-emerald-500/50" : "bg-text-muted/40")} />
                    <span className="font-bold text-sm text-text-primary truncate">{ep.name}</span>
                  </div>
                  <div className="font-mono text-xs text-text-muted truncate">{ep.url}</div>
                  
                  {/* EVENTS BADGES */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {ep.events.map(ev => (
                      <span key={ev} className="px-2 py-0.5 bg-surface text-text-muted text-[10px] font-bold rounded-md border border-border/40">
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleTestEndpoint(ep)}
                    disabled={testingEndpointId === ep.id}
                    className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    {testingEndpointId === ep.id ? (
                      <RefreshCw size={14} className="animate-spin text-blue-500" />
                    ) : (
                      <Play size={14} />
                    )}
                    {isDe ? 'Webhook testen' : 'Test Webhook'}
                  </button>

                  <button
                    onClick={() => handleToggleEndpoint(ep.id)}
                    className={cn("px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors", 
                      ep.active 
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                        : "bg-surface text-text-muted border-border/50"
                    )}
                  >
                    {ep.active ? (isDe ? 'Aktiv' : 'Active') : (isDe ? 'Inaktiv' : 'Inactive')}
                  </button>

                  <button 
                    onClick={() => handleDeleteEndpoint(ep.id)} 
                    className="p-2 hover:bg-red-500/10 rounded-lg text-text-muted hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* TEST RESULT MODAL / BANNER */}
      {testResult && (
        <div className="p-5 bg-surface border border-border/80 rounded-3xl shadow-lg animate-in slide-in-from-bottom-4 duration-300 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-text-primary">
              {testResult.result.success ? (
                <CheckCircle2 className="text-emerald-500" size={18} />
              ) : (
                <AlertCircle className="text-red-500" size={18} />
              )}
              Test-Ergebnis für <span className="text-accent-ai">{testResult.endpointName}</span>
            </div>
            <button onClick={() => setTestResult(null)} className="p-1 text-text-muted hover:text-text-primary">
              <X size={16} />
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className={cn("px-2 py-0.5 rounded-md font-bold text-white", testResult.result.success ? "bg-emerald-600" : "bg-red-600")}>
              HTTP {testResult.result.status || 'ERR'}
            </span>
            <span className="text-text-muted">Latenz: {testResult.result.durationMs} ms</span>
            <span className="text-text-muted">Status: {testResult.result.statusText}</span>
          </div>

          <div className="bg-background border border-border/50 rounded-xl p-3 text-xs font-mono text-text-primary max-h-40 overflow-y-auto whitespace-pre-wrap">
            {testResult.result.responseBody || '(Keine Antwortdaten)'}
          </div>
        </div>
      )}

      {/* ADD WEBHOOK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
                <Webhook size={20} className="text-emerald-500" />
                {isDe ? 'Neuen Outgoing Webhook anlegen' : 'Add Outgoing Webhook'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-text-muted hover:text-text-primary">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddEndpointSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  {isDe ? 'Webhook Name' : 'Endpoint Name'}
                </label>
                <input 
                  type="text" 
                  value={newEndpointName} 
                  onChange={e => setNewEndpointName(e.target.value)} 
                  placeholder={isDe ? "z. B. Zapier Lead Connector" : "e.g. Zapier Connector"} 
                  className="w-full px-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm font-medium text-text-primary outline-none focus:border-accent-ai transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  {isDe ? 'Target Webhook URL' : 'Target Webhook URL'}
                </label>
                <input 
                  type="text" 
                  required
                  value={newEndpointUrl} 
                  onChange={e => setNewEndpointUrl(e.target.value)} 
                  placeholder="https://hooks.slack.com/services/... oder https://hooks.zapier.com/..." 
                  className="w-full px-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm font-medium text-text-primary outline-none focus:border-accent-ai transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                  {isDe ? 'Auslösende Events' : 'Trigger Events'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['lead.created', 'defect.created', 'invoice.created', 'document.uploaded'] as WebhookEventType[]).map(ev => (
                    <label key={ev} className="flex items-center gap-2 p-2.5 bg-background/50 border border-border/40 rounded-xl cursor-pointer hover:border-accent-ai/50 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={selectedEvents.includes(ev)}
                        onChange={() => toggleEventSelection(ev)}
                        className="w-4 h-4 rounded border-border text-accent-ai bg-background"
                      />
                      <span className="text-xs font-bold text-text-primary">{ev}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-background hover:bg-surface text-text-muted rounded-xl text-xs font-bold transition-all"
                >
                  {isDe ? 'Abbrechen' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                >
                  {isDe ? 'Webhook Speichern' : 'Save Webhook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}