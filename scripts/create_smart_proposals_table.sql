-- ============================================================================
-- SMART PROPOSALS (KUNDEN-LANDINGPAGES & DIGITALES OFFERTENSYSTEM)
-- ============================================================================
-- Dieses Skript kann im Supabase Dashboard unter "SQL Editor" ausgeführt werden.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.smart_proposals (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    company_id TEXT,
    project_id TEXT,
    owner_id TEXT,
    share_token VARCHAR(64) UNIQUE NOT NULL,
    title TEXT NOT NULL DEFAULT 'Projekt Präsentation & Offerte',
    client_name TEXT NOT NULL DEFAULT 'Sehr geehrte Damen und Herren',
    client_company TEXT,
    client_email TEXT,
    client_phone TEXT,
    intro_text TEXT,
    hero_video_url TEXT,
    hero_image_url TEXT,
    base_price NUMERIC(12, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'CHF',
    options JSONB DEFAULT '[]'::jsonb,
    attachments JSONB DEFAULT '[]'::jsonb,
    legal_documents JSONB DEFAULT '[]'::jsonb,
    payment_milestones JSONB DEFAULT '[]'::jsonb,
    theme_style VARCHAR(30) DEFAULT 'scenography',
    theme_color VARCHAR(30) DEFAULT '#3b82f6',
    slides JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(20) DEFAULT 'active',
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
    pin_code VARCHAR(20),
    views_count INT DEFAULT 0,
    last_viewed_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    accepted_by JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security (RLS) aktivieren
ALTER TABLE public.smart_proposals ENABLE ROW LEVEL SECURITY;

-- 1. Unternehmens-Mitglieder & Admins können Proposals ihres Unternehmens verwalten
DROP POLICY IF EXISTS "Company users can manage proposals" ON public.smart_proposals;
CREATE POLICY "Company users can manage proposals" ON public.smart_proposals
    FOR ALL USING (
        auth.role() = 'authenticated'
    );

-- 2. Öffentlicher Lesezugriff für Kunden über den Share-Token (nur aktive & angenommene Offerten)
DROP POLICY IF EXISTS "Public can view active proposals via share token" ON public.smart_proposals;
CREATE POLICY "Public can view active proposals via share token" ON public.smart_proposals
    FOR SELECT USING (
        status IN ('active', 'accepted')
    );

-- 3. Kunde kann eine Offerte digital annehmen und signieren (Update auf status='accepted')
DROP POLICY IF EXISTS "Public can sign and accept proposal" ON public.smart_proposals;
CREATE POLICY "Public can sign and accept proposal" ON public.smart_proposals
    FOR UPDATE USING (
        status = 'active'
    ) WITH CHECK (
        status IN ('active', 'accepted')
    );

-- Indizes für maximale Performance
CREATE INDEX IF NOT EXISTS idx_smart_proposals_share_token ON public.smart_proposals(share_token);
CREATE INDEX IF NOT EXISTS idx_smart_proposals_company ON public.smart_proposals(company_id);
CREATE INDEX IF NOT EXISTS idx_smart_proposals_owner ON public.smart_proposals(owner_id);

-- Supabase Realtime Replikation aktivieren
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.smart_proposals;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;
