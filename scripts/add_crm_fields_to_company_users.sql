-- ============================================================================
-- MIGRATION: ADD CRM & PERMISSION FIELDS TO PUBLIC.COMPANY_USERS
-- Führt alle notwendigen Spalten für Kontakte, CRM & Team-Berechtigungen ein.
-- Idempotent: Kann gefahrlos mehrfach im Supabase SQL Editor ausgeführt werden.
-- ============================================================================

ALTER TABLE public.company_users 
ADD COLUMN IF NOT EXISTS company text,
ADD COLUMN IF NOT EXISTS street text,
ADD COLUMN IF NOT EXISTS zip_city text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS uid_number text,
ADD COLUMN IF NOT EXISTS vat_number text,
ADD COLUMN IF NOT EXISTS is_external boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS photo_url text,
ADD COLUMN IF NOT EXISTS can_view_finance boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS can_approve_budget boolean DEFAULT false;

-- Kommentar zur Tabelle
COMMENT ON TABLE public.company_users IS 'Kontakte, CRM-Einträge und Workspace-Teammitglieder';

-- Index für schnellere Suche nach E-Mail und Firma
CREATE INDEX IF NOT EXISTS idx_company_users_email ON public.company_users(email);
CREATE INDEX IF NOT EXISTS idx_company_users_company ON public.company_users(company);
CREATE INDEX IF NOT EXISTS idx_company_users_status ON public.company_users(status);
