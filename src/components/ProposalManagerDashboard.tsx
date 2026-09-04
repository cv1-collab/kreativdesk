import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus, Search, Filter, Clock, Eye, CheckCircle2, Share2, Copy,
  ExternalLink, Trash2, Calendar, FileText, Sparkles, RefreshCw,
  TrendingUp, AlertCircle, ArrowUpRight, MessageSquare, Mail, Play, Check,
  Smartphone, Monitor, X, ShieldCheck, Lock
} from 'lucide-react';
import { getCompanyProposals, extendProposalExpiry, deleteProposal, SmartProposal } from '../services/proposalService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { cn, copyToClipboard } from '../utils';
import { audioFeedback } from '../utils/audioFeedback';

export default function ProposalManagerDashboard({ onCreateNew }: { onCreateNew?: () => void }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [proposals, setProposals] = useState<SmartProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'accepted' | 'expired'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewProposal, setPreviewProposal] = useState<SmartProposal | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const companyId = currentUser?.companyId || currentUser?.uid || 'default-company';

  const loadProposals = React.useCallback(async () => {
    setIsLoading(true);
    const data = await getCompanyProposals(companyId);
    setProposals(data);
    setIsLoading(false);
  }, [companyId]);

  useEffect(() => {
    loadProposals();
  }, [loadProposals]);

  const handleCopyLink = async (proposal: SmartProposal) => {
    audioFeedback.playTouchClick();
    const url = `${window.location.origin}/p/${proposal.shareToken}`;
    await copyToClipboard(url);
    setCopiedId(proposal.id);
    addToast('Kunden-Landingpage Link kopiert!', 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleExtend = async (proposalId: string) => {
    const updated = await extendProposalExpiry(proposalId, 30);
    if (updated) {
      addToast('Gültigkeit erfolgreich um 30 Tage verlängert!', 'success');
      loadProposals();
    }
  };

  const handleDelete = async (proposalId: string) => {
    if (window.confirm('Möchten Sie diese Kunden-Landingpage wirklich löschen?')) {
      await deleteProposal(proposalId);
      addToast('Landingpage gelöscht.', 'info');
      loadProposals();
    }
  };

  const filteredProposals = proposals.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.clientCompany || '').toLowerCase().includes(searchQuery.toLowerCase());

    const isExp = new Date(p.expiresAt).getTime() < Date.now();
    let currentStatus = p.status;
    if (isExp && currentStatus !== 'accepted') currentStatus = 'expired';

    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'expired') return matchesSearch && currentStatus === 'expired';
    if (statusFilter === 'accepted') return matchesSearch && currentStatus === 'accepted';
    if (statusFilter === 'active') return matchesSearch && currentStatus === 'active';
    return matchesSearch;
  });

  const totalProposals = proposals.length;
  const activeCount = proposals.filter(p => new Date(p.expiresAt).getTime() >= Date.now() && p.status !== 'accepted').length;
  const acceptedCount = proposals.filter(p => p.status === 'accepted').length;
  const expiredCount = proposals.filter(p => (new Date(p.expiresAt).getTime() < Date.now() || p.status === 'expired') && p.status !== 'accepted').length;
  const totalVolume = proposals.filter(p => p.status === 'accepted').reduce((sum, p) => sum + (p.acceptedBy?.finalPrice || p.basePrice || 0), 0);

  return (
    <div className="p-4 sm:p-8 space-y-8 bg-background min-h-full">
      {/* HEADER & STATS */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary flex items-center gap-2.5">
            <Sparkles className="text-blue-500" size={28} />
            Pitch & Offerten Landingpages
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Zentrale Übersicht aller versendeten Kunden-Links mit Video, interaktivem Konfigurator und 30-Tage Expiration
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck size={12} /> Mandanten-Tresor: Vollständig isoliert
            </span>
            <span className="text-[11px] text-text-muted">
              Nur autorisierte Nutzer Ihrer Firma können diese Offerten einsehen & verwalten.
            </span>
          </div>
        </div>

        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Neue Offerte & Landingpage erstellen
          </button>
        )}
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-border bg-surface shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-text-muted">Aktive Links</div>
            <div className="text-2xl font-black text-text-primary mt-1">{activeCount}</div>
            <div className="text-[11px] text-emerald-500 font-semibold mt-0.5">30-Tage Cloud aktiv</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Clock size={24} />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-surface shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-text-muted">Digital Angenommen</div>
            <div className="text-2xl font-black text-text-primary mt-1">{acceptedCount}</div>
            <div className="text-[11px] text-blue-500 font-semibold mt-0.5">Freigegebene Offerten</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-surface shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-text-muted">Abschluss-Volumen</div>
            <div className="text-2xl font-black text-text-primary mt-1">CHF {totalVolume.toLocaleString('de-CH')}</div>
            <div className="text-[11px] text-purple-500 font-semibold mt-0.5">Aus digitaler Freigabe</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-surface shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-text-muted">Gesamt Erstellt</div>
            <div className="text-2xl font-black text-text-primary mt-1">{totalProposals}</div>
            <div className="text-[11px] text-text-muted mt-0.5">Landingpages im System</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <FileText size={24} />
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3.5 py-2 w-full max-w-sm">
          <Search size={16} className="text-text-muted shrink-0" />
          <input
            type="text"
            placeholder="Kunde, Projekt oder Firma suchen..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-text-primary outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-surface border border-border rounded-xl p-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all", statusFilter === 'all' ? "bg-accent-ai text-white shadow-sm" : "text-text-muted hover:text-text-primary")}
          >
            Alle ({proposals.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all", statusFilter === 'active' ? "bg-accent-ai text-white shadow-sm" : "text-text-muted hover:text-text-primary")}
          >
            Aktiv ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('accepted')}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all", statusFilter === 'accepted' ? "bg-accent-ai text-white shadow-sm" : "text-text-muted hover:text-text-primary")}
          >
            Angenommen ({acceptedCount})
          </button>
          <button
            onClick={() => setStatusFilter('expired')}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all", statusFilter === 'expired' ? "bg-accent-ai text-white shadow-sm" : "text-text-muted hover:text-text-primary")}
          >
            Abgelaufen ({expiredCount})
          </button>
        </div>
      </div>

      {/* PROPOSAL CARDS LIST */}
      {filteredProposals.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-3xl space-y-3 bg-surface/30">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto">
            <FileText size={28} />
          </div>
          <h3 className="text-base font-bold text-text-primary">Keine Offerten-Landingpages gefunden</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Erstellen Sie im Pitch Deck Studio eine neue Kunden-Landingpage mit Videos, Preisen und Team-Profilen.
          </p>
          {onCreateNew && (
            <div className="pt-2">
              <button
                onClick={onCreateNew}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus size={14} /> Erste Offerte erstellen
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProposals.map(proposal => {
            const isExpired = new Date(proposal.expiresAt).getTime() < Date.now();
            const daysLeft = Math.max(0, Math.ceil((new Date(proposal.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
            const isAccepted = proposal.status === 'accepted';

            return (
              <div
                key={proposal.id}
                className={cn(
                  "p-6 rounded-3xl border transition-all duration-200 bg-surface flex flex-col justify-between space-y-5 relative shadow-sm hover:shadow-md",
                  isAccepted ? "border-emerald-500/40 bg-emerald-500/5" : isExpired ? "border-border opacity-75" : "border-border hover:border-accent-ai/40"
                )}
              >
                <div>
                  {/* Top Status & Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {isAccepted ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center gap-1">
                        <Check size={11} /> Digital Angenommen
                      </span>
                    ) : isExpired ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                        Abgelaufen
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <Clock size={11} /> Noch {daysLeft} Tage
                      </span>
                    )}

                    <div className="flex items-center gap-1 text-[11px] text-text-muted">
                      <Eye size={13} /> {proposal.viewsCount || 0} Aufrufe
                    </div>
                  </div>

                  {/* Title & Customer */}
                  <h3 className="font-extrabold text-base text-text-primary leading-tight line-clamp-1">{proposal.title}</h3>
                  <div className="text-xs text-text-muted mt-1 flex items-center gap-1.5">
                    <span>Kunde:</span>
                    <strong className="text-text-primary font-bold">{proposal.clientName}</strong>
                    {proposal.clientCompany && <span className="truncate">({proposal.clientCompany})</span>}
                  </div>

                  {/* Investment Info */}
                  <div className="mt-4 p-3 rounded-2xl bg-background border border-border flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-text-muted">Investitionssumme</div>
                      <div className="text-base font-bold font-mono text-text-primary mt-0.5">
                        {proposal.currency} {(proposal.acceptedBy?.finalPrice || proposal.basePrice || 0).toLocaleString('de-CH')}
                      </div>
                    </div>
                    {proposal.heroVideoUrl && (
                      <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded-lg flex items-center gap-1">
                        <Play size={10} className="fill-current" /> Video
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-border flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => {
                        audioFeedback.playTouchClick();
                        setPreviewProposal(proposal);
                      }}
                      className="px-3 py-2 rounded-xl bg-blue-600/15 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      title="Interaktive Live-Vorschau öffnen"
                    >
                      <Eye size={14} /> Vorschau
                    </button>

                    <button
                      onClick={() => handleCopyLink(proposal)}
                      className="p-2 rounded-xl bg-background hover:bg-surface border border-border text-text-muted hover:text-text-primary transition-all cursor-pointer"
                      title="Kunden-Link kopieren"
                    >
                      {copiedId === proposal.id ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
                    </button>

                    <a
                      href={`/p/${proposal.shareToken}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-background hover:bg-surface border border-border text-text-muted hover:text-text-primary transition-all cursor-pointer"
                      title="In separatem Tab öffnen"
                    >
                      <ExternalLink size={15} />
                    </a>

                    <button
                      onClick={() => handleExtend(proposal.id)}
                      className="p-2 rounded-xl bg-background hover:bg-surface border border-border text-text-muted hover:text-text-primary transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                      title="+30 Tage Gültigkeit verlängern"
                    >
                      <RefreshCw size={14} /> +30d
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(proposal.id)}
                    className="p-2 text-text-muted hover:text-red-500 transition-colors cursor-pointer"
                    title="Löschen"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* INTERACTIVE LIVE PREVIEW MODAL (DESKTOP & MOBILE FRAME) */}
      {previewProposal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-6 animate-in fade-in duration-200" onClick={() => setPreviewProposal(null)}>
          <div className="bg-surface border border-border rounded-3xl w-full max-w-6xl h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            {/* Modal Header Bar */}
            <div className="p-4 sm:px-6 border-b border-border flex items-center justify-between gap-4 bg-surface/90 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <Eye size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm sm:text-base text-text-primary truncate">
                      Live-Vorschau: {previewProposal.title}
                    </h3>
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck size={11} /> Mandanten-Isolation Aktiv
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted truncate">
                    Kunde: <strong className="text-text-primary">{previewProposal.clientName}</strong> {previewProposal.clientCompany && `(${previewProposal.clientCompany})`} · Gültig bis: {new Date(previewProposal.expiresAt).toLocaleDateString('de-CH')}
                  </p>
                </div>
              </div>

              {/* Viewport Device Switcher */}
              <div className="hidden md:flex items-center bg-background border border-border rounded-xl p-1 gap-1">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                    previewDevice === 'desktop' ? "bg-blue-600 text-white shadow-sm" : "text-text-muted hover:text-text-primary"
                  )}
                >
                  <Monitor size={14} /> Desktop (100%)
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                    previewDevice === 'mobile' ? "bg-blue-600 text-white shadow-sm" : "text-text-muted hover:text-text-primary"
                  )}
                >
                  <Smartphone size={14} /> Mobile (390px)
                </button>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyLink(previewProposal)}
                  className="px-3 py-2 bg-background hover:bg-surface border border-border text-text-primary text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Link kopieren"
                >
                  {copiedId === previewProposal.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  <span className="hidden sm:inline">Link kopieren</span>
                </button>

                <a
                  href={`/p/${previewProposal.shareToken}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
                  title="In separatem Tab öffnen"
                >
                  <ExternalLink size={14} />
                  <span className="hidden sm:inline">Neuer Tab</span>
                </a>

                <button
                  onClick={() => setPreviewProposal(null)}
                  className="p-2 rounded-xl bg-background hover:bg-surface border border-border text-text-muted hover:text-text-primary transition-all cursor-pointer"
                  title="Schliessen"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body / Live Responsive Iframe */}
            <div className="flex-1 bg-black/40 p-2 sm:p-4 overflow-hidden flex items-center justify-center">
              <div
                className={cn(
                  "h-full bg-surface transition-all duration-300 overflow-hidden shadow-2xl border border-border",
                  previewDevice === 'mobile'
                    ? "w-[390px] rounded-[36px] border-[6px] border-zinc-800 shadow-2xl relative"
                    : "w-full rounded-2xl"
                )}
              >
                <iframe
                  src={`/p/${previewProposal.shareToken}`}
                  title="Offerten Live-Vorschau"
                  className="w-full h-full border-0 bg-background"
                />
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
