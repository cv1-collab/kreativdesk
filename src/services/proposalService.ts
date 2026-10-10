import { supabase } from '../lib/supabase';
import { safeStorage } from '../utils/safeStorage';
import { demoSmartProposal } from '../data/demoProjectData';

export interface ProposalConfigOption {
  id: string;
  title: string;
  description?: string;
  price: number;
  selectedByDefault: boolean;
}

export interface ProposalAttachment {
  id: string;
  name: string;
  url: string;
  size?: string;
  type: 'pdf' | 'plan' | 'image' | 'doc' | 'website';
}

export interface ProposalLegalDoc {
  id: string;
  name: string;
  type: 'agb' | 'werkvertrag' | 'kooperation' | 'nda' | 'custom';
  url: string;
  size?: string;
  isRequired: boolean;
  uploadedAt: string;
}

export interface PaymentMilestone {
  id: string;
  phase: string;
  percentage: number;
  description: string;
}

export interface SmartProposal {
  id: string;
  projectId: string;
  companyId: string;
  ownerId: string;
  shareToken: string;
  title: string;
  clientName: string;
  clientCompany?: string;
  clientEmail?: string;
  clientPhone?: string;
  introText?: string;
  heroVideoUrl?: string;
  heroImageUrl?: string;
  websiteUrl?: string;
  mediaType?: 'video' | 'image' | 'pdf' | 'website';
  basePrice: number;
  currency: string;
  options: ProposalConfigOption[];
  attachments: ProposalAttachment[];
  legalDocuments?: ProposalLegalDoc[]; // AGB, Werkverträge, Kooperationsverträge, NDA
  paymentMilestones?: PaymentMilestone[]; // SIA 102 / 108 / 118 Zahlungsplan
  themeStyle: 'keynote' | 'architecture' | 'photography' | 'scenography' | 'swiss' | 'neo-brutalism' | 'glassmorphism' | 'cyberpunk' | 'minimal-tech' | 'notebooklm';
  themeColor: string;
  colorMode?: 'dark' | 'light' | 'auto';
  slides: any[];
  status: 'active' | 'expired' | 'accepted' | 'draft';
  expiresAt: string; // ISO date string (default 30 days)
  pinCode?: string; // Optional password protection
  viewsCount: number;
  lastViewedAt?: string;
  acceptedAt?: string;
  acceptedBy?: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    signatureDataUrl?: string; // E-Signatur Canvas Bild
    signatureNote?: string;
    selectedOptionIds: string[];
    finalPrice: number;
    acceptedAgbs?: boolean;
    clientIp?: string;
    acceptedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'kreativdesk_smart_proposals_v1';

/**
 * Holt alle Proposals für ein Unternehmen (Mandantentrennung gewährleistet, optional projektspezifisch)
 */
export async function getCompanyProposals(companyId: string, projectId?: string, ownerId?: string): Promise<SmartProposal[]> {
  // Purge obsolete local dummy proposals like "Siemens History Wall"
  try {
    const rawLocal = safeStorage.getItem<SmartProposal[]>(STORAGE_KEY, []);
    const cleanLocal = rawLocal.filter(p => !p.title?.toLowerCase().includes('siemens'));
    if (cleanLocal.length !== rawLocal.length) {
      safeStorage.setItem(STORAGE_KEY, cleanLocal);
    }
  } catch (_) {}

  let dbProposals: SmartProposal[] = [];

  try {
    if (supabase) {
      let query = supabase.from('smart_proposals').select('*');

      const conditions: string[] = [];
      if (companyId && companyId !== 'default-company') {
        conditions.push(`company_id.eq.${companyId}`);
        conditions.push(`owner_id.eq.${companyId}`);
      }
      if (ownerId && ownerId !== companyId && ownerId !== 'default-user') {
        conditions.push(`owner_id.eq.${ownerId}`);
        conditions.push(`company_id.eq.${ownerId}`);
      }

      if (conditions.length > 0) {
        query = query.or(conditions.join(','));
      }

      if (projectId && projectId !== 'global') {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        dbProposals = data.map(mapDbToProposal);
      }
    }
  } catch (e) {
    console.warn('Supabase fetch proposals error, checking local storage', e);
  }

  // LocalStorage Fallback & Sync: Sicherstellen, dass lokale Entwürfe nicht verloren gehen
  const localList = safeStorage.getItem<SmartProposal[]>(STORAGE_KEY, []).filter(p => !p.title?.toLowerCase().includes('siemens'));

  if (dbProposals.length > 0) {
    const mergedMap = new Map<string, SmartProposal>();
    dbProposals.forEach(p => mergedMap.set(p.id, p));
    localList.forEach(p => {
      const matchComp = !companyId || companyId === 'default-company' ||
        p.companyId === companyId || p.ownerId === companyId ||
        (ownerId && (p.ownerId === ownerId || p.companyId === ownerId));
      const matchProj = !projectId || projectId === 'global' || p.projectId === projectId;
      if (!mergedMap.has(p.id) && matchComp && matchProj) {
        mergedMap.set(p.id, p);
      }
    });
    const result = Array.from(mergedMap.values());
    safeStorage.setItem(STORAGE_KEY, result);
    return result;
  }

  return localList.filter(p => {
    const matchComp = !companyId || companyId === 'default-company' ||
      p.companyId === companyId || p.ownerId === companyId ||
      (ownerId && (p.ownerId === ownerId || p.companyId === ownerId));
    const matchProj = !projectId || projectId === 'global' || p.projectId === projectId;
    return matchComp && matchProj;
  });
}

/**
 * Holt eine Proposal anhand ihres unikalen Share-Tokens (öffentlich für Kunden)
 */
export async function getProposalByShareToken(shareToken: string): Promise<SmartProposal | null> {
  try {
    if (supabase) {
      // 1. Secure RPC lookup first (prevents public table scans)
      try {
        const { data: rpcData, error: rpcErr } = await supabase.rpc('get_proposal_by_share_token', { p_token: shareToken });
        const rows: any = rpcData;
        const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : (rows && !Array.isArray(rows) ? rows : null);
        if (!rpcErr && row) {
          incrementProposalViews(row.id, row.views_count || 0);
          return mapDbToProposal(row);
        }
      } catch {
        // Fallback to direct query below
      }

      // 2. Direct query fallback
      const { data, error } = await supabase
        .from('smart_proposals')
        .select('*')
        .eq('share_token', shareToken)
        .maybeSingle();

      if (!error && data) {
        // Increment view count asynchronously
        incrementProposalViews(data.id, data.views_count || 0);
        return mapDbToProposal(data);
      }
    }
  } catch (e) {
    console.warn('Supabase fetch proposal by token error, using local fallback', e);
  }

  // Demo Proposal Preset Fallback for Architektur & Smart Proposals
  if (shareToken === 'demo-proposal' || shareToken === 'interactv' || shareToken === 'interactv-offerte' || shareToken === 'demo' || !supabase) {
    return {
      ...demoSmartProposal,
      shareToken: shareToken || 'demo-proposal',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    } as SmartProposal;
  }

  // Local storage lookup by shareToken
  const all = safeStorage.getItem<SmartProposal[]>(STORAGE_KEY, []);
  const found = all.find(p => p.shareToken === shareToken);
  if (found) {
    return found;
  }

  return null;
}

/**
 * Erstellt oder aktualisiert eine Smart Proposal
 */
export async function saveSmartProposal(proposal: Partial<SmartProposal> & { projectId: string; companyId: string }): Promise<SmartProposal> {
  const now = new Date();
  const expiresAt = proposal.expiresAt || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  
  const token = proposal.shareToken || `${proposal.projectId.replace(/[^a-zA-Z0-9]/g, '-')}-${Math.random().toString(36).substring(2, 7)}`;

  const effectiveMediaType: 'video' | 'image' | 'pdf' | 'website' = proposal.mediaType || 
    (proposal.websiteUrl ? 'website' : 
    (proposal.heroImageUrl?.toLowerCase().includes('.pdf') ? 'pdf' : 
    (proposal.heroImageUrl ? 'image' : 'video')));

  const fullProposal: SmartProposal = {
    id: proposal.id || `prop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    projectId: proposal.projectId,
    companyId: proposal.companyId,
    ownerId: proposal.ownerId || 'owner',
    shareToken: token,
    title: proposal.title || 'Projekt Präsentation & Offerte',
    clientName: proposal.clientName || 'Sehr geehrte Damen und Herren',
    clientCompany: proposal.clientCompany || '',
    clientEmail: proposal.clientEmail || '',
    clientPhone: proposal.clientPhone || '',
    introText: proposal.introText || 'Vielen Dank für das Vertrauen in unser Team. Nachfolgend präsentieren wir Ihnen das massgeschneiderte Konzept, alle Projekt-Videos, Meilensteine und die verbindliche Kostenaufstellung.',
    heroVideoUrl: effectiveMediaType === 'website' ? (proposal.websiteUrl || '') : (proposal.heroVideoUrl || ''),
    heroImageUrl: proposal.heroImageUrl || '',
    websiteUrl: proposal.websiteUrl || (effectiveMediaType === 'website' ? proposal.heroVideoUrl : undefined),
    mediaType: effectiveMediaType,
    basePrice: proposal.basePrice || 0,
    currency: proposal.currency || 'CHF',
    options: proposal.options || [],
    attachments: proposal.attachments || [],
    legalDocuments: proposal.legalDocuments || [],
    paymentMilestones: proposal.paymentMilestones || [],
    themeStyle: proposal.themeStyle || 'scenography',
    themeColor: proposal.themeColor || '#3b82f6',
    colorMode: proposal.colorMode || 'dark',
    slides: proposal.slides || [],
    status: proposal.status || 'active',
    expiresAt,
    pinCode: proposal.pinCode || '',
    viewsCount: proposal.viewsCount || 0,
    createdAt: proposal.createdAt || now.toISOString(),
    updatedAt: now.toISOString(),
    acceptedAt: proposal.acceptedAt,
    acceptedBy: proposal.acceptedBy
  };

  // 1. In Supabase speichern mit schema-konformen Spalten
  try {
    if (supabase) {
      // Encode colorMode in theme_style to ensure compatibility without requiring schema alter
      const encodedThemeStyle = fullProposal.colorMode 
        ? `${fullProposal.themeStyle || 'scenography'}__mode__${fullProposal.colorMode}`
        : (fullProposal.themeStyle || 'scenography');

      const cleanProjectId = (fullProposal.projectId && fullProposal.projectId !== 'global') ? fullProposal.projectId : null;
      const dbPayload: Record<string, any> = {
        id: fullProposal.id,
        project_id: cleanProjectId,
        company_id: fullProposal.companyId,
        owner_id: fullProposal.ownerId,
        share_token: fullProposal.shareToken,
        title: fullProposal.title,
        client_name: fullProposal.clientName,
        client_company: fullProposal.clientCompany,
        client_email: fullProposal.clientEmail,
        client_phone: fullProposal.clientPhone,
        intro_text: fullProposal.introText,
        hero_video_url: fullProposal.heroVideoUrl || fullProposal.websiteUrl || '',
        hero_image_url: fullProposal.heroImageUrl || '',
        base_price: fullProposal.basePrice,
        currency: fullProposal.currency,
        options: fullProposal.options,
        attachments: fullProposal.attachments,
        legal_documents: fullProposal.legalDocuments,
        payment_milestones: fullProposal.paymentMilestones,
        theme_style: encodedThemeStyle,
        theme_color: fullProposal.themeColor,
        slides: fullProposal.slides,
        status: fullProposal.status,
        expires_at: fullProposal.expiresAt,
        pin_code: fullProposal.pinCode,
        views_count: fullProposal.viewsCount,
        created_at: fullProposal.createdAt,
        updated_at: fullProposal.updatedAt,
        accepted_at: fullProposal.acceptedAt,
        accepted_by: fullProposal.acceptedBy
      };

      const { error: upsertErr } = await (supabase.from('smart_proposals') as any).upsert(dbPayload);
      if (upsertErr) {
        console.warn('Supabase upsert proposal warning:', upsertErr);
      }
    }
  } catch (e) {
    console.warn('Supabase upsert proposal warning:', e);
  }

  // 2. Im LocalStorage persistieren
  saveProposalLocally(fullProposal);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('proposal_saved', { detail: fullProposal }));
  }

  return fullProposal;
}

export const saveProposal = saveSmartProposal;

/**
 * Verlängert eine Offerte um zusätzliche 30 Tage
 */
export async function extendProposalExpiry(proposalId: string, days: number = 30): Promise<SmartProposal | null> {
  const newDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  
  try {
    if (supabase) {
      await supabase
        .from('smart_proposals')
        .update({ expires_at: newDate, status: 'active', updated_at: new Date().toISOString() })
        .eq('id', proposalId);
    }
  } catch (e) {}

  const all = safeStorage.getItem<SmartProposal[]>(STORAGE_KEY, []);
  const item = all.find(p => p.id === proposalId);
  if (item) {
    item.expiresAt = newDate;
    item.status = 'active';
    item.updatedAt = new Date().toISOString();
    safeStorage.setItem(STORAGE_KEY, all);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('proposal_saved', { detail: item }));
    }
    return item;
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('proposal_saved', { detail: { id: proposalId, extended: true } }));
  }

  return null;
}

/**
 * Digitale Freigabe / Annahme durch den Kunden
 */
export async function acceptProposalByClient(
  proposalId: string, 
  acceptanceData: { name: string; email: string; signatureNote?: string; selectedOptionIds: string[]; finalPrice: number }
): Promise<boolean> {
  const now = new Date().toISOString();
  const all = safeStorage.getItem<SmartProposal[]>(STORAGE_KEY, []);
  const item = all.find(p => p.id === proposalId);

  try {
    if (supabase) {
      const { data: propRow } = await supabase
        .from('smart_proposals')
        .select('company_id, title, project_id, share_token')
        .eq('id', proposalId)
        .maybeSingle();

      const shareToken = (propRow as any)?.share_token || (item as any)?.shareToken;

      let rpcSuccess = false;
      if (shareToken) {
        try {
          const { data: res, error: rpcErr } = await supabase.rpc('sign_accept_proposal', {
            p_share_token: shareToken,
            p_acceptance_data: acceptanceData
          });
          if (!rpcErr && res === true) {
            rpcSuccess = true;
          }
        } catch {
          // Fallback to direct update below
        }
      }

      if (!rpcSuccess) {
        await supabase
          .from('smart_proposals')
          .update({
            status: 'accepted',
            accepted_at: now,
            accepted_by: acceptanceData,
            updated_at: now
          })
          .eq('id', proposalId);
      }

      const targetCompanyId = propRow?.company_id || item?.companyId;
      if (targetCompanyId) {
        const priceText = typeof acceptanceData.finalPrice === 'number'
          ? ` (CHF ${acceptanceData.finalPrice.toLocaleString('de-CH')})`
          : '';
        await supabase.from('notifications').insert({
          company_id: targetCompanyId,
          title: 'Offerte digital angenommen',
          message: `${acceptanceData.name} hat die Offerte «${propRow?.title || item?.title || 'Offerte'}»${priceText} digital unterzeichnet.`,
          type: 'proposal_accepted',
          read: false,
          created_at: now
        });
      }
    }
  } catch (e) {
    console.warn('Supabase accept error:', e);
  }

  if (item) {
    item.status = 'accepted';
    item.acceptedAt = now;
    item.acceptedBy = acceptanceData;
    item.updatedAt = now;
    safeStorage.setItem(STORAGE_KEY, all);
  }

  // Trigger Webhook Event for Outbound CRM & Team Notification
  try {
    const customWebhookUrl = safeStorage.getString('interactv_webhook_url', '') || null;
    fetch('/api/webhook/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'PROPOSAL_ACCEPTED',
        proposalId,
        acceptanceData,
        acceptedAt: now,
        webhookUrl: customWebhookUrl
      })
    }).catch(err => console.warn('Outbound webhook notification warning:', err));
  } catch (err) {}

  // Trigger Automatic Signed Offer Confirmation E-Mail
  try {
    if (acceptanceData.email) {
      fetch('/api/quote/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: acceptanceData.email,
          quoteData: {
            quoteNumber: `OFF-${proposalId.slice(-6)}`,
            customer: {
              name: acceptanceData.name,
              email: acceptanceData.email,
            },
            totalCHF: acceptanceData.finalPrice,
            status: 'ACCEPTED_SIGNED'
          }
        })
      }).catch(err => console.warn('Acceptance email dispatch note:', err));
    }
  } catch (err) {}

  return true;
}

/**
 * Löscht eine Proposal
 */
export async function deleteProposal(proposalId: string): Promise<boolean> {
  try {
    if (supabase) {
      await supabase.from('smart_proposals').delete().eq('id', proposalId);
    }
  } catch (e) {}

  const all = safeStorage.getItem<SmartProposal[]>(STORAGE_KEY, []);
  const filtered = all.filter(p => p.id !== proposalId);
  safeStorage.setItem(STORAGE_KEY, filtered);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('proposal_saved', { detail: { id: proposalId, deleted: true } }));
  }

  return true;
}

function incrementProposalViews(id: string, currentViews: number) {
  try {
    if (supabase) {
      supabase
        .from('smart_proposals')
        .update({ views_count: currentViews + 1, last_viewed_at: new Date().toISOString() })
        .eq('id', id)
        .then();
    }
  } catch (e) {}
}

function saveProposalLocally(proposal: SmartProposal) {
  const all = safeStorage.getItem<SmartProposal[]>(STORAGE_KEY, []);
  const idx = all.findIndex(p => p.id === proposal.id);
  if (idx >= 0) {
    all[idx] = proposal;
  } else {
    all.unshift(proposal);
  }
  safeStorage.setItem(STORAGE_KEY, all);
}

function mapDbToProposal(d: any): SmartProposal {
  const rawThemeStyle = d.theme_style || d.themeStyle || 'scenography';
  let themeStyle: any = rawThemeStyle;
  let parsedColorMode: 'dark' | 'light' | 'auto' = 'dark';

  if (typeof rawThemeStyle === 'string' && rawThemeStyle.includes('__mode__')) {
    const parts = rawThemeStyle.split('__mode__');
    themeStyle = parts[0];
    parsedColorMode = (parts[1] as any) || 'dark';
  } else if (d.color_mode || d.colorMode) {
    parsedColorMode = (d.color_mode || d.colorMode) as any;
  }

  const rawAttachments = Array.isArray(d.attachments) ? d.attachments : [];
  const webAttachment = rawAttachments.find((a: any) => a.type === 'website');
  const isDirectWebUrl = typeof d.hero_video_url === 'string' && 
    (d.hero_video_url.startsWith('http://') || d.hero_video_url.startsWith('https://')) &&
    !d.hero_video_url.match(/\.(mp4|webm|mov|ogg|m4v)($|\?)/i);

  const websiteUrl = d.website_url || d.websiteUrl || webAttachment?.url || (isDirectWebUrl ? d.hero_video_url : undefined);

  let mediaType: 'video' | 'image' | 'pdf' | 'website' = d.media_type || d.mediaType || 'video';
  if (websiteUrl || webAttachment || isDirectWebUrl) {
    mediaType = 'website';
  } else if (d.hero_image_url && (d.hero_image_url.toLowerCase().includes('.pdf') || rawAttachments.some((a: any) => a.type === 'pdf'))) {
    mediaType = 'pdf';
  } else if (d.hero_image_url && !d.hero_video_url) {
    mediaType = 'image';
  }

  return {
    id: d.id,
    projectId: d.project_id || d.projectId,
    companyId: d.company_id || d.companyId,
    ownerId: d.owner_id || d.ownerId,
    shareToken: d.share_token || d.shareToken,
    title: d.title || 'Projekt Präsentation',
    clientName: d.client_name || d.clientName,
    clientCompany: d.client_company || d.clientCompany,
    clientEmail: d.client_email || d.clientEmail,
    clientPhone: d.client_phone || d.clientPhone,
    introText: d.intro_text || d.introText,
    heroVideoUrl: mediaType === 'website' ? '' : (d.hero_video_url || d.heroVideoUrl),
    heroImageUrl: d.hero_image_url || d.heroImageUrl,
    websiteUrl,
    mediaType,
    basePrice: Number(d.base_price || d.basePrice || 0),
    currency: d.currency || 'CHF',
    options: Array.isArray(d.options) ? d.options : [],
    attachments: rawAttachments,
    legalDocuments: Array.isArray(d.legal_documents || d.legalDocuments) ? (d.legal_documents || d.legalDocuments) : [],
    paymentMilestones: Array.isArray(d.payment_milestones || d.paymentMilestones) ? (d.payment_milestones || d.paymentMilestones) : [],
    themeStyle,
    themeColor: d.theme_color || d.themeColor || '#3b82f6',
    colorMode: parsedColorMode,
    slides: Array.isArray(d.slides) ? d.slides : [],
    status: d.status || 'active',
    expiresAt: d.expires_at || d.expiresAt,
    pinCode: d.pin_code || d.pinCode,
    viewsCount: Number(d.views_count || d.viewsCount || 0),
    lastViewedAt: d.last_viewed_at || d.lastViewedAt,
    acceptedAt: d.accepted_at || d.acceptedAt,
    acceptedBy: d.accepted_by || d.acceptedBy,
    createdAt: d.created_at || d.createdAt,
    updatedAt: d.updated_at || d.updatedAt
  };
}
