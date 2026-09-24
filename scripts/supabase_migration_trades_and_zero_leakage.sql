-- ============================================================================
-- KREATIV DESK OS: OPTIONALE SUPABASE NATIVE SPALTEN-ERWEITERUNG
-- ============================================================================
-- Hinweis: Dein Code funktioniert dank intelligenter Fallbacks (CRM-Notes) 
-- bereits 100% ohne diesen Script. Wenn du diese Spalten dennoch nativ in
-- PostgreSQL anlegen möchtest, führe dieses Script einfach 1x im 
-- Supabase Dashboard -> SQL Editor aus (dauert nur 2 Sekunden).
-- ============================================================================

-- 1. Tabelle public.company_users (Kontakte & Teammitglieder)
ALTER TABLE public.company_users 
ADD COLUMN IF NOT EXISTS trade text,
ADD COLUMN IF NOT EXISTS is_external boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS can_view_finance boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS can_approve_budget boolean DEFAULT false;

-- 2. Tabelle public.defects (Mängel & Tickets)
ALTER TABLE public.defects 
ADD COLUMN IF NOT EXISTS trade text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS due_date text,
ADD COLUMN IF NOT EXISTS image_url text;

-- 3. Tabelle public.project_members (Projekt-Zuweisungen)
ALTER TABLE public.project_members 
ADD COLUMN IF NOT EXISTS trade text,
ADD COLUMN IF NOT EXISTS is_external boolean DEFAULT false;

-- 4. Tabelle public.profiles (Benutzerprofile)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS trade text;

-- 5. Performance-Indizes
CREATE INDEX IF NOT EXISTS idx_company_users_trade ON public.company_users(trade);
CREATE INDEX IF NOT EXISTS idx_defects_trade ON public.defects(trade);
CREATE INDEX IF NOT EXISTS idx_project_members_trade ON public.project_members(trade);

-- Bestätigungsausgabe
SELECT 'Erfolgreich migriert: Alle Trade- und Handwerker-Spalten sind aktiv!' AS status;
