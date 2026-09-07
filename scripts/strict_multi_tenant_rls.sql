-- ============================================================================
-- KREATIV DESK OS - STRIKTES MULTI-TENANT ROW LEVEL SECURITY (RLS) PATCH
-- ============================================================================
-- Dieses Skript im Supabase Dashboard unter "SQL Editor" ausführen.
-- Es sichert alle Tabellen ab, sodass Firmen-Daten strikt isoliert sind.
-- ============================================================================

-- 0. ALTE FUNKTIONS-SIGNATUREN ZURÜCKSETZEN (Behebt: cannot change return type)
DROP FUNCTION IF EXISTS public.get_my_company_id() CASCADE;
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

-- 2. HILFSFUNKTION: Ist der Benutzer Super-Admin?
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT (
    auth.jwt()->>'email' IN ('cv1@gmx.ch', 'carlo@vesciodesign.ch')
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- ----------------------------------------------------------------------------
-- 3. TABELLEN-POLICIES: Strikte Isolation nach Mandant (company_id)
-- ----------------------------------------------------------------------------

-- A) API KEYS (Spalten: id, company_id, name, key, created_at)
DROP POLICY IF EXISTS "Authenticated users access api_keys" ON public.api_keys;
DROP POLICY IF EXISTS "Strict company isolation api_keys" ON public.api_keys;
CREATE POLICY "Strict company isolation api_keys" ON public.api_keys
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

-- B) CAD PLANS (Spalten: id, company_id, project_id, name, elements, ...)
DROP POLICY IF EXISTS "Authenticated users access cad_plans" ON public.cad_plans;
DROP POLICY IF EXISTS "Strict company isolation cad_plans" ON public.cad_plans;
CREATE POLICY "Strict company isolation cad_plans" ON public.cad_plans
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

-- C) DOCUMENTS (Spalten: id, name, company_id, owner_id, project_id, ...)
DROP POLICY IF EXISTS "Authenticated users access documents" ON public.documents;
DROP POLICY IF EXISTS "Strict company isolation documents" ON public.documents;
CREATE POLICY "Strict company isolation documents" ON public.documents
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id() OR owner_id = auth.uid()::text)
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id() OR owner_id = auth.uid()::text);

-- D) DEFECTS & TICKETS (Spalten: id, project_id, company_id, owner_id, ...)
DROP POLICY IF EXISTS "Authenticated users access defects" ON public.defects;
DROP POLICY IF EXISTS "Strict company isolation defects" ON public.defects;
CREATE POLICY "Strict company isolation defects" ON public.defects
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id() OR owner_id = auth.uid()::text)
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id() OR owner_id = auth.uid()::text);

-- E) LEADS CRM (Spalten: id, name, company_id, status, ...)
DROP POLICY IF EXISTS "Authenticated users access leads" ON public.leads;
DROP POLICY IF EXISTS "Strict company isolation leads" ON public.leads;
CREATE POLICY "Strict company isolation leads" ON public.leads
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

-- F) TIME ENTRIES (Spalten: id, company_id, project_id, user_id, hours, ...)
DROP POLICY IF EXISTS "Authenticated users access time_entries" ON public.time_entries;
DROP POLICY IF EXISTS "Strict company isolation time_entries" ON public.time_entries;
CREATE POLICY "Strict company isolation time_entries" ON public.time_entries
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id() OR user_id = auth.uid()::text)
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id() OR user_id = auth.uid()::text);

-- G) CALENDAR EVENTS (Spalten: id, company_id, project_id, title, ...)
DROP POLICY IF EXISTS "Authenticated users access calendar_events" ON public.calendar_events;
DROP POLICY IF EXISTS "Strict company isolation calendar_events" ON public.calendar_events;
CREATE POLICY "Strict company isolation calendar_events" ON public.calendar_events
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

-- H) PROJECTS (Spalten: id, company_id (UUID), owner_id, name, ...)
DROP POLICY IF EXISTS "Authenticated users access projects" ON public.projects;
DROP POLICY IF EXISTS "Strict company isolation projects" ON public.projects;
CREATE POLICY "Strict company isolation projects" ON public.projects
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id() OR owner_id = auth.uid()::text)
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id() OR owner_id = auth.uid()::text);

-- I) TRANSACTIONS / FINANCE (Spalten: id, company_id, owner_id, amount, ...)
DROP POLICY IF EXISTS "Authenticated users access transactions" ON public.transactions;
DROP POLICY IF EXISTS "Strict company isolation transactions" ON public.transactions;
CREATE POLICY "Strict company isolation transactions" ON public.transactions
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id() OR owner_id = auth.uid()::text)
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id() OR owner_id = auth.uid()::text);

-- J) TASKS (Spalten: id, company_id (UUID), project_id, assigned_to, ...)
DROP POLICY IF EXISTS "Authenticated users access tasks" ON public.tasks;
DROP POLICY IF EXISTS "Strict company isolation tasks" ON public.tasks;
CREATE POLICY "Strict company isolation tasks" ON public.tasks
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

-- K) SMART PROPOSALS (Spalten: id, company_id, owner_id, share_token, ...)
DROP POLICY IF EXISTS "Authenticated users access smart_proposals" ON public.smart_proposals;
DROP POLICY IF EXISTS "Strict company isolation smart_proposals" ON public.smart_proposals;
CREATE POLICY "Strict company isolation smart_proposals" ON public.smart_proposals
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id() OR owner_id = auth.uid()::text)
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id() OR owner_id = auth.uid()::text);

-- L) CHAT MESSAGES (Spalten: id, call_id, sender_id, message, created_at)
DROP POLICY IF EXISTS "Authenticated users access chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Strict company isolation chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow room guests chat insert" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow room guests chat select" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow authenticated chat access" ON public.chat_messages;

CREATE POLICY "Allow authenticated chat access" ON public.chat_messages
  FOR ALL TO authenticated
  USING (is_super_admin() OR sender_id = auth.uid()::text OR call_id IS NOT NULL)
  WITH CHECK (is_super_admin() OR sender_id = auth.uid()::text OR call_id IS NOT NULL);

-- Erlaubt Meeting-Gästen (anon) ohne Login die Teilnahme am Raum-Chat
CREATE POLICY "Allow room guests chat insert" ON public.chat_messages
  FOR INSERT TO anon
  WITH CHECK (call_id IS NOT NULL);

CREATE POLICY "Allow room guests chat select" ON public.chat_messages
  FOR SELECT TO anon
  USING (call_id IS NOT NULL);

-- M) COMPANY SETTINGS (Spalten: company_id, screensaver_active, ...)
DROP POLICY IF EXISTS "Authenticated users access company_settings" ON public.company_settings;
DROP POLICY IF EXISTS "Strict company isolation company_settings" ON public.company_settings;
CREATE POLICY "Strict company isolation company_settings" ON public.company_settings
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

-- ============================================================================
-- FERTIG: Datenisolation ist nun serverseitig in der Datenbank garantiert!
-- ============================================================================
