import { supabase } from '../lib/supabase';

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
  type: 'pdf' | 'plan' | 'image' | 'doc';
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
  basePrice: number;
  currency: string;
  options: ProposalConfigOption[];
  attachments: ProposalAttachment[];
  legalDocuments?: ProposalLegalDoc[]; // AGB, Werkverträge, Kooperationsverträge, NDA
  paymentMilestones?: PaymentMilestone[]; // SIA 102 / 108 / 118 Zahlungsplan
  themeStyle: 'keynote' | 'architecture' | 'photography' | 'scenography' | 'swiss' | 'neo-brutalism' | 'glassmorphism' | 'cyberpunk' | 'minimal-tech';
  themeColor: string;
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
 * Holt alle Proposals für ein Unternehmen (Mandantentrennung gewährleistet)
 */
export async function getCompanyProposals(companyId: string): Promise<SmartProposal[]> {
  try {
    if (supabase) {
      let query = supabase.from('smart_proposals').select('*');
      if (companyId && companyId !== 'default-company') {
        query = query.or(`company_id.eq.${companyId},owner_id.eq.${companyId}`);
      }
      const { data, error } = await query.order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(mapDbToProposal);
      }
    }
  } catch (e) {
    console.warn('Supabase fetch proposals error, fallback to local storage', e);
  }

  // LocalStorage Fallback (Filter by companyId or ownerId)
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const all: SmartProposal[] = JSON.parse(raw);
      return all.filter(p => p.companyId === companyId || p.ownerId === companyId || !companyId || p.companyId === 'default-company');
    }
  } catch (e) {
    console.error('Error reading local proposals', e);
  }

  return [];
}

/**
 * Holt eine Proposal anhand ihres unikalen Share-Tokens (öffentlich für Kunden)
 */
export async function getProposalByShareToken(shareToken: string): Promise<SmartProposal | null> {
  try {
    if (supabase) {
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

  // Demo Proposal Preset Fallback for interacTV & General Demos
  if (shareToken === 'demo-proposal' || shareToken === 'interactv' || shareToken === 'interactv-offerte' || shareToken === 'demo' || !supabase) {
    return {
      id: 'prop-interactv-2026',
      projectId: 'proj-interactv-showcase',
      companyId: 'comp-interactv-swiss',
      ownerId: 'owner-interactv',
      shareToken: shareToken || 'interactv',
      title: 'interacTV 4K Smart Stelen & Spatial Suite 2026',
      clientName: 'Dr. Martin Keller',
      clientCompany: 'SwissTech Innovation AG',
      clientEmail: 'm.keller@swisstech.ch',
      clientPhone: '+41 44 820 90 00',
      introText: 'Vielen Dank für Ihr Interesse an der interacTV Smart Display & Wegeleitungs-Suite. Wir freuen uns, Ihnen nachfolgend das massgeschneiderte Gesamtkonzept inklusive 4K-Stelen, KI-Grundrissbereinigung und digitalem Lead-Management zu präsentieren.',
      heroVideoUrl: '/interactv/videos/interactv_brand_image_video.mp4',
      heroImageUrl: '/interactv/renders/interactv_luxury_station_hero.jpg',
      basePrice: 14800,
      currency: 'CHF',
      options: [
        { id: 'opt-1', title: '1x Event Pro 80" 4K Smart Stele (Carbon Edition)', price: 4200, selectedByDefault: true, description: '4K Ultra-HD Touchscreen, Infrarot-Sensorik, Transport & Montage vor Ort' },
        { id: 'opt-2', title: '1x Slimline 60" 4K Foyer Stele (Obsidian Black)', price: 2900, selectedByDefault: true, description: 'Elegantes Standgehäuse mit 24/7 Samsung/LG Panel für Eingang & Empfang' },
        { id: 'opt-3', title: 'KI-Gebäude- & 3D Wegeleitung mit Grundriss-Bereinigung', price: 1800, selectedByDefault: true, description: 'Automatische SIA-Wandbereinigung & 90°-Laser-Wegeleitung für Besucher' },
        { id: 'opt-4', title: 'Visitenkarten-Scanner & KI-OCR Lead-Cockpit', price: 1400, selectedByDefault: true, description: 'Echtzeit-Synchronisation mit Bexio, HubSpot & automatischer E-Mail-Zustellung' },
        { id: 'opt-5', title: 'Photobooth-Modul mit Thermobondrucker (80mm)', price: 1600, selectedByDefault: false, description: 'Sofortiger Belegdruck & interaktive QR-Code Smartphone Bildübergabe' },
        { id: 'opt-6', title: 'Custom Flightcase Schutz- & Transportsystem (Plywood)', price: 950, selectedByDefault: false, description: 'Massgefertigte Transportkiste mit Dämpfung und Butterfly-Schlössern' }
      ],
      attachments: [
        { id: 'att-1', name: 'interacTV_Hardware_Spezifikationen_4K.pdf', url: '#', size: '3.4 MB', type: 'pdf' },
        { id: 'att-2', name: 'Messe_Layout_3D_Architekturplan.pdf', url: '#', size: '6.1 MB', type: 'plan' }
      ],
      legalDocuments: [
        { id: 'doc-1', name: 'SIA 118 Allgemeine Bedingungen für Bau- und Montagearbeiten', type: 'werkvertrag', url: '#', isRequired: true, uploadedAt: new Date().toISOString() },
        { id: 'doc-2', name: 'interacTV SLA 24/7 Express Vor-Ort-Garantie & Supportvertrag', type: 'kooperation', url: '#', isRequired: true, uploadedAt: new Date().toISOString() },
        { id: 'doc-3', name: 'Schweizer Datenschutz & DSGVO Konformitätsnachweis (Zürich Host)', type: 'nda', url: '#', isRequired: false, uploadedAt: new Date().toISOString() }
      ],
      paymentMilestones: [
        { id: 'm-1', phase: '1. Phase: Projektierung, 3D Standlayout & Software-Setup', percentage: 30, description: 'Fällig bei digitaler Freigabe (TWINT / Swiss QR Bill)' },
        { id: 'm-2', phase: '2. Phase: Produktion, Stelen-Konfiguration & Endprüfung', percentage: 40, description: 'Fällig nach Werksprüfung vor Auslieferung' },
        { id: 'm-3', phase: '3. Phase: Anlieferung, Vor-Ort-Kalibrierung & Messebetrieb', percentage: 30, description: 'Fällig nach erfolgreicher Inbetriebnahme und Einweisung' }
      ],
      themeStyle: 'swiss',
      themeColor: '#00E5FF',
      slides: [
        {
          id: 'slide-1',
          title: 'interacTV 4K Smart Stelen & Spatial Suite 2026',
          content: 'Willkommen in der nächsten Generation der Raum- und Messe-Interaktion.\n\n• 4K Ultra-HD Displays mit brillanter Farbwiedergabe\n• Modulare Titan-, Carbon- & Alpine Wood-Gehäuse\n• Nahtlose Anbindung an Gebäudeleitsysteme & CRM',
          layout: 'split',
          imageUrl: '/interactv/renders/interactv_luxury_station_hero.jpg'
        },
        {
          id: 'slide-2',
          title: 'High-End Hardware & Schweizer Ingenieurskunst',
          content: 'Entwickelt für den 24/7 Dauereinsatz in Hotellerie, Foyers und auf Messen:\n\n• Integrierte Industrie-PCs mit lüfterloser Kühlung\n• Hochpräzise 10-Punkt Infrarot- & Kapazitiv-Touchscreens\n• Thermobondrucker, NFC-Reader & Visitenkarten-Scanner',
          layout: 'split',
          imageUrl: '/interactv/renders/interactv_flightcase_open_4k.jpg'
        },
        {
          id: 'slide-3',
          title: 'KI-Grundrissbereinigung & 90°-Laser Wegeleitung',
          content: 'Besucher finden ihr Ziel im Gebäude in Sekunden:\n\n• Automatisches Entfernen von Bemassungen & Texten aus alten Plänen\n• Rechtwinklige (90° Ecken) Architektur-Wegführung\n• 5 dynamische Linienstile (Perlen-Punkte, Laser-Dashes, Neon)',
          layout: 'split',
          imageUrl: '/interactv/renders/interactv_stand_hero_front.jpg'
        },
        {
          id: 'slide-4',
          title: 'Live Lead-Management & ERP-Synchronisation',
          content: 'Maximale Conversion für Ihren Vertrieb:\n\n• Visitenkarten per Kamera in 1.5 Sekunden digitalisiert\n• Automatische Dankes-E-Mails mit persönlichem PDF-Link\n• Direkter Export zu Bexio, HubSpot, Salesforce & Abacus',
          layout: 'split',
          imageUrl: '/interactv/renders/interactv_stele_detail_card_reader.jpg'
        },
        {
          id: 'slide-5',
          title: 'SIA 102/118 Zahlungsplan & Digitale E-Signatur',
          content: 'Transparenz und Rechtssicherheit auf Schweizer Niveau:\n\n• 30% Anzahlung per TWINT / Swiss QR-Rechnung\n• 40% Zwischenrechnung nach Fertigung\n• 30% Schlusszahlung nach erfolgreicher Abnahme',
          layout: 'split',
          imageUrl: '/interactv/renders/interactv_dual_stele_lounge_4k.jpg'
        }
      ],
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      viewsCount: 24,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
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
    heroVideoUrl: proposal.heroVideoUrl || '',
    heroImageUrl: proposal.heroImageUrl || '',
    basePrice: proposal.basePrice || 0,
    currency: proposal.currency || 'CHF',
    options: proposal.options || [],
    attachments: proposal.attachments || [],
    legalDocuments: proposal.legalDocuments || [],
    paymentMilestones: proposal.paymentMilestones || [],
    themeStyle: proposal.themeStyle || 'scenography',
    themeColor: proposal.themeColor || '#3b82f6',
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

  // 1. In Supabase speichern
  try {
    if (supabase) {
      const dbPayload = {
        id: fullProposal.id,
        project_id: fullProposal.projectId,
        company_id: fullProposal.companyId,
        owner_id: fullProposal.ownerId,
        share_token: fullProposal.shareToken,
        title: fullProposal.title,
        client_name: fullProposal.clientName,
        client_company: fullProposal.clientCompany,
        client_email: fullProposal.clientEmail,
        client_phone: fullProposal.clientPhone,
        intro_text: fullProposal.introText,
        hero_video_url: fullProposal.heroVideoUrl,
        hero_image_url: fullProposal.heroImageUrl,
        base_price: fullProposal.basePrice,
        currency: fullProposal.currency,
        options: fullProposal.options,
        attachments: fullProposal.attachments,
        legal_documents: fullProposal.legalDocuments,
        payment_milestones: fullProposal.paymentMilestones,
        theme_style: fullProposal.themeStyle,
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

      await supabase.from('smart_proposals').upsert(dbPayload);
    }
  } catch (e) {
    console.warn('Supabase upsert proposal warning:', e);
  }

  // 2. Im LocalStorage persistieren
  saveProposalLocally(fullProposal);

  return fullProposal;
}

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

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const all: SmartProposal[] = JSON.parse(raw);
      const item = all.find(p => p.id === proposalId);
      if (item) {
        item.expiresAt = newDate;
        item.status = 'active';
        item.updatedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        return item;
      }
    }
  } catch (e) {}

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

  try {
    if (supabase) {
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
  } catch (e) {
    console.warn('Supabase accept error:', e);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const all: SmartProposal[] = JSON.parse(raw);
      const item = all.find(p => p.id === proposalId);
      if (item) {
        item.status = 'accepted';
        item.acceptedAt = now;
        item.acceptedBy = acceptanceData;
        item.updatedAt = now;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      }
    }
  } catch (e) {}

  // Trigger Webhook Event for Outbound CRM & Team Notification
  try {
    const customWebhookUrl = typeof window !== 'undefined' ? localStorage.getItem('interactv_webhook_url') : null;
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

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const all: SmartProposal[] = JSON.parse(raw);
      const filtered = all.filter(p => p.id !== proposalId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch (e) {}

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
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: SmartProposal[] = raw ? JSON.parse(raw) : [];
    const idx = all.findIndex(p => p.id === proposal.id);
    if (idx >= 0) {
      all[idx] = proposal;
    } else {
      all.unshift(proposal);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (e) {}
}

function mapDbToProposal(d: any): SmartProposal {
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
    heroVideoUrl: d.hero_video_url || d.heroVideoUrl,
    heroImageUrl: d.hero_image_url || d.heroImageUrl,
    basePrice: Number(d.base_price || d.basePrice || 0),
    currency: d.currency || 'CHF',
    options: Array.isArray(d.options) ? d.options : [],
    attachments: Array.isArray(d.attachments) ? d.attachments : [],
    legalDocuments: Array.isArray(d.legal_documents || d.legalDocuments) ? (d.legal_documents || d.legalDocuments) : [],
    paymentMilestones: Array.isArray(d.payment_milestones || d.paymentMilestones) ? (d.payment_milestones || d.paymentMilestones) : [],
    themeStyle: d.theme_style || d.themeStyle || 'scenography',
    themeColor: d.theme_color || d.themeColor || '#3b82f6',
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
