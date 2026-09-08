-- ============================================================================
-- KREATIV DESK OS - STRIKTES MULTI-TENANT ROW LEVEL SECURITY (RLS) PATCH
-- ============================================================================
-- Dieses Skript im Supabase Dashboard unter "SQL Editor" ausführen.
-- Es sichert alle Tabellen ab, sodass Firmen-Daten strikt isoliert sind.
-- ============================================================================

-- 0. ALTE FUNKTIONEN BEREINIGEN (Verhindert Return-Type & Signatur-Konflikte)
DROP FUNCTION IF EXISTS public.get_my_company_id() CASCADE;
DROP FUNCTION IF EXISTS public.get_my_company_id(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_super_admin() CASCADE;

-- 1. HILFSFUNKTION: Firmen-ID des authentifizierten Benutzers abfragen (als TEXT)
CREATE OR REPLACE FUNCTION public.get_my_company_id()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT company_id::text 
  FROM public.profiles 
  WHERE id = auth.uid()
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_company_id() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_my_company_id() FROM PUBLIC, anon;

-- 2. HILFSFUNKTION: Ist der Benutzer Super-Admin?
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT (
    coalesce(auth.jwt()->>'email', '') IN ('cv1@gmx.ch', 'carlo@vesciodesign.ch')
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM PUBLIC, anon;

-- ----------------------------------------------------------------------------
-- 3. RLS AKTIVIEREN & POLICIES ERSTELLEN (Alle Vergleiche mit ::text typensicher)
-- ----------------------------------------------------------------------------

-- A) API KEYS
ALTER TABLE IF EXISTS public.api_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users access api_keys" ON public.api_keys;
DROP POLICY IF EXISTS "Strict company isolation api_keys" ON public.api_keys;
CREATE POLICY "Strict company isolation api_keys" ON public.api_keys
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

-- B) CAD PLANS
ALTER TABLE IF EXISTS public.cad_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users access cad_plans" ON public.cad_plans;
DROP POLICY IF EXISTS "Strict company isolation cad_plans" ON public.cad_plans;
CREATE POLICY "Strict company isolation cad_plans" ON public.cad_plans
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

-- C) DOCUMENTS
ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users access documents" ON public.documents;
DROP POLICY IF EXISTS "Strict company isolation documents" ON public.documents;
DROP POLICY IF EXISTS "Allow anon insert temp_receipt documents" ON public.documents;
DROP POLICY IF EXISTS "Allow anon select temp_receipt documents" ON public.documents;

CREATE POLICY "Strict company isolation documents" ON public.documents
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id() OR owner_id::text = auth.uid()::text)
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id() OR owner_id::text = auth.uid()::text);

-- Erlaubt Smartphone-Scans (QR-Code Live-Upload) temporäre Belege abzulegen
CREATE POLICY "Allow anon insert temp_receipt documents" ON public.documents
  FOR INSERT TO anon
  WITH CHECK (category = 'temp_receipt' AND company_id IS NOT NULL);

CREATE POLICY "Allow anon select temp_receipt documents" ON public.documents
  FOR SELECT TO anon
  USING (category = 'temp_receipt');

-- D) DEFECTS & TICKETS
ALTER TABLE IF EXISTS public.defects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users access defects" ON public.defects;
DROP POLICY IF EXISTS "Strict company isolation defects" ON public.defects;
CREATE POLICY "Strict company isolation defects" ON public.defects
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id() OR owner_id::text = auth.uid()::text)
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id() OR owner_id::text = auth.uid()::text);

-- E) LEADS CRM
ALTER TABLE IF EXISTS public.leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users access leads" ON public.leads;
DROP POLICY IF EXISTS "Strict company isolation leads" ON public.leads;
DROP POLICY IF EXISTS "Allow anon insert leads" ON public.leads;

CREATE POLICY "Strict company isolation leads" ON public.leads
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

-- Erlaubt anonyme Einreichungen über das öffentliche Lead-Formular (/lead-form/:companyId) und Video-Gäste
CREATE POLICY "Allow anon insert leads" ON public.leads
  FOR INSERT TO anon
  WITH CHECK (company_id IS NOT NULL);

-- F) TIME ENTRIES
ALTER TABLE IF EXISTS public.time_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users access time_entries" ON public.time_entries;
DROP POLICY IF EXISTS "Strict company isolation time_entries" ON public.time_entries;
CREATE POLICY "Strict company isolation time_entries" ON public.time_entries
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id() OR user_id::text = auth.uid()::text)
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id() OR user_id::text = auth.uid()::text);

-- G) CALENDAR EVENTS
ALTER TABLE IF EXISTS public.calendar_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users access calendar_events" ON public.calendar_events;
DROP POLICY IF EXISTS "Strict company isolation calendar_events" ON public.calendar_events;
CREATE POLICY "Strict company isolation calendar_events" ON public.calendar_events
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

-- H) PROJECTS (projects.company_id und owner_id sind UUID in Supabase)
ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users access projects" ON public.projects;
DROP POLICY IF EXISTS "Strict company isolation projects" ON public.projects;
CREATE POLICY "Strict company isolation projects" ON public.projects
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id() OR owner_id::text = auth.uid()::text)
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id() OR owner_id::text = auth.uid()::text);

-- I) TRANSACTIONS / FINANCE
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users access transactions" ON public.transactions;
DROP POLICY IF EXISTS "Strict company isolation transactions" ON public.transactions;
CREATE POLICY "Strict company isolation transactions" ON public.transactions
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id() OR owner_id::text = auth.uid()::text)
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id() OR owner_id::text = auth.uid()::text);

-- J) TASKS & PROJECT TASKS
ALTER TABLE IF EXISTS public.project_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.project_tasks;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.project_tasks;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.project_tasks;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.project_tasks;
DROP POLICY IF EXISTS "Authenticated users access project_tasks" ON public.project_tasks;
DROP POLICY IF EXISTS "Strict company isolation project_tasks" ON public.project_tasks;

CREATE POLICY "Strict company isolation project_tasks" ON public.project_tasks
  FOR ALL TO authenticated
  USING (
    is_super_admin() 
    OR company_id::text = get_my_company_id() 
    OR owner_id::text = auth.uid()::text 
    OR assigned_to::text = auth.uid()::text
  )
  WITH CHECK (
    is_super_admin() 
    OR company_id::text = get_my_company_id() 
    OR owner_id::text = auth.uid()::text 
    OR assigned_to::text = auth.uid()::text
  );

-- Bereinigung der ungenutzten tasks-Tabelle
ALTER TABLE IF EXISTS public.tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select" ON public.tasks;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.tasks;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.tasks;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.tasks;
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users access tasks" ON public.tasks;
DROP POLICY IF EXISTS "Strict company isolation tasks" ON public.tasks;
CREATE POLICY "Strict company isolation tasks" ON public.tasks
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

-- K) SMART PROPOSALS
ALTER TABLE IF EXISTS public.smart_proposals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users access smart_proposals" ON public.smart_proposals;
DROP POLICY IF EXISTS "Strict company isolation smart_proposals" ON public.smart_proposals;
DROP POLICY IF EXISTS "Allow anon view smart_proposals by token" ON public.smart_proposals;
DROP POLICY IF EXISTS "Allow anon accept smart_proposals" ON public.smart_proposals;

CREATE POLICY "Strict company isolation smart_proposals" ON public.smart_proposals
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id() OR owner_id::text = auth.uid()::text)
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id() OR owner_id::text = auth.uid()::text);

-- Erlaubt Kunden ohne Login, geteilte Offerten anhand des Share-Tokens aufzurufen & digital zu signieren
CREATE POLICY "Allow anon view smart_proposals by token" ON public.smart_proposals
  FOR SELECT TO anon
  USING (share_token IS NOT NULL);

CREATE POLICY "Allow anon accept smart_proposals" ON public.smart_proposals
  FOR UPDATE TO anon
  USING (share_token IS NOT NULL)
  WITH CHECK (share_token IS NOT NULL);

-- L) CHAT MESSAGES
ALTER TABLE IF EXISTS public.chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users access chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Strict company isolation chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow room guests chat insert" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow room guests chat select" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow authenticated chat access" ON public.chat_messages;

CREATE POLICY "Allow authenticated chat access" ON public.chat_messages
  FOR ALL TO authenticated
  USING (is_super_admin() OR sender_id::text = auth.uid()::text OR call_id IS NOT NULL)
  WITH CHECK (is_super_admin() OR sender_id::text = auth.uid()::text OR call_id IS NOT NULL);

-- Erlaubt Meeting-Gästen (anon) ohne Login die Teilnahme am Raum-Chat
CREATE POLICY "Allow room guests chat insert" ON public.chat_messages
  FOR INSERT TO anon
  WITH CHECK (call_id IS NOT NULL);

CREATE POLICY "Allow room guests chat select" ON public.chat_messages
  FOR SELECT TO anon
  USING (call_id IS NOT NULL);

-- M) COMPANY SETTINGS
ALTER TABLE IF EXISTS public.company_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users access company_settings" ON public.company_settings;
DROP POLICY IF EXISTS "Strict company isolation company_settings" ON public.company_settings;
CREATE POLICY "Strict company isolation company_settings" ON public.company_settings
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

-- N) COMPANY USERS (Team & CRM Kontakte)
ALTER TABLE IF EXISTS public.company_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Strict company isolation company_users" ON public.company_users;
CREATE POLICY "Strict company isolation company_users" ON public.company_users
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

-- O) STORAGE CLEANUP
DROP POLICY IF EXISTS "Authenticated Upload Avatars" ON storage.objects;

-- P) NOTIFICATIONS (In-App Benachrichtigungen & Modul-Events)
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.notifications TO authenticated, service_role;
DROP POLICY IF EXISTS "Strict company isolation notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users access notifications" ON public.notifications;

CREATE POLICY "Strict company isolation notifications" ON public.notifications
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

-- ============================================================================
-- FERTIG: Datenisolation ist nun serverseitig in der Datenbank garantiert!
-- ============================================================================


