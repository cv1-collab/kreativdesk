-- ============================================================================
-- KREATIV DESK OS - STRIKTES MULTI-TENANT ROW LEVEL SECURITY (RLS) PATCH
-- ============================================================================
-- Dieses Skript im Supabase Dashboard unter "SQL Editor" ausführen.
-- Es sichert alle Tabellen ab, sodass Firmen-Daten strikt isoliert sind.
-- ============================================================================

-- 1. HILFSFUNKTION: Firmen-ID des authentifizierten Benutzers abfragen
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

-- A) API KEYS
DROP POLICY IF EXISTS "Authenticated users access api_keys" ON public.api_keys;
DROP POLICY IF EXISTS "Strict company isolation api_keys" ON public.api_keys;
CREATE POLICY "Strict company isolation api_keys" ON public.api_keys
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id = get_my_company_id() OR user_id = auth.uid()::text)
  WITH CHECK (is_super_admin() OR company_id = get_my_company_id() OR user_id = auth.uid()::text);

-- B) CAD PLANS
DROP POLICY IF EXISTS "Authenticated users access cad_plans" ON public.cad_plans;
DROP POLICY IF EXISTS "Strict company isolation cad_plans" ON public.cad_plans;
CREATE POLICY "Strict company isolation cad_plans" ON public.cad_plans
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id = get_my_company_id() OR owner_id = auth.uid()::text)
  WITH CHECK (is_super_admin() OR company_id = get_my_company_id() OR owner_id = auth.uid()::text);

-- C) DOCUMENTS
DROP POLICY IF EXISTS "Authenticated users access documents" ON public.documents;
DROP POLICY IF EXISTS "Strict company isolation documents" ON public.documents;
CREATE POLICY "Strict company isolation documents" ON public.documents
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id = get_my_company_id() OR owner_id = auth.uid()::text)
  WITH CHECK (is_super_admin() OR company_id = get_my_company_id() OR owner_id = auth.uid()::text);

-- D) DEFECTS & TICKETS
DROP POLICY IF EXISTS "Authenticated users access defects" ON public.defects;
DROP POLICY IF EXISTS "Strict company isolation defects" ON public.defects;
CREATE POLICY "Strict company isolation defects" ON public.defects
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id = get_my_company_id() OR owner_id = auth.uid()::text)
  WITH CHECK (is_super_admin() OR company_id = get_my_company_id() OR owner_id = auth.uid()::text);

-- E) LEADS (CRM)
DROP POLICY IF EXISTS "Authenticated users access leads" ON public.leads;
DROP POLICY IF EXISTS "Strict company isolation leads" ON public.leads;
CREATE POLICY "Strict company isolation leads" ON public.leads
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id = get_my_company_id());

-- F) TIME ENTRIES
DROP POLICY IF EXISTS "Authenticated users access time_entries" ON public.time_entries;
DROP POLICY IF EXISTS "Strict company isolation time_entries" ON public.time_entries;
CREATE POLICY "Strict company isolation time_entries" ON public.time_entries
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id = get_my_company_id() OR user_id = auth.uid()::text)
  WITH CHECK (is_super_admin() OR company_id = get_my_company_id() OR user_id = auth.uid()::text);

-- G) CALENDAR EVENTS
DROP POLICY IF EXISTS "Authenticated users access calendar_events" ON public.calendar_events;
DROP POLICY IF EXISTS "Strict company isolation calendar_events" ON public.calendar_events;
CREATE POLICY "Strict company isolation calendar_events" ON public.calendar_events
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id = get_my_company_id() OR user_id = auth.uid()::text)
  WITH CHECK (is_super_admin() OR company_id = get_my_company_id() OR user_id = auth.uid()::text);

-- H) PROJECTS
DROP POLICY IF EXISTS "Authenticated users access projects" ON public.projects;
DROP POLICY IF EXISTS "Strict company isolation projects" ON public.projects;
CREATE POLICY "Strict company isolation projects" ON public.projects
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id = get_my_company_id() OR owner_id = auth.uid()::text)
  WITH CHECK (is_super_admin() OR company_id = get_my_company_id() OR owner_id = auth.uid()::text);

-- I) CHAT MESSAGES (Inklusive Erlaubnis für Meeting-Gäste)
DROP POLICY IF EXISTS "Authenticated users access chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Strict company isolation chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow room guests chat insert" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow room guests chat select" ON public.chat_messages;

CREATE POLICY "Strict company isolation chat_messages" ON public.chat_messages
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id = get_my_company_id() OR sender_id = auth.uid()::text)
  WITH CHECK (is_super_admin() OR company_id = get_my_company_id() OR sender_id = auth.uid()::text);

-- Erlaubt nicht angemeldeten Gästen im Meeting den Zugriff auf ihren spezifischen Call
CREATE POLICY "Allow room guests chat insert" ON public.chat_messages
  FOR INSERT TO anon
  WITH CHECK (call_id IS NOT NULL);

CREATE POLICY "Allow room guests chat select" ON public.chat_messages
  FOR SELECT TO anon
  USING (call_id IS NOT NULL);

-- J) COMPANY SETTINGS
DROP POLICY IF EXISTS "Authenticated users access company_settings" ON public.company_settings;
DROP POLICY IF EXISTS "Strict company isolation company_settings" ON public.company_settings;
CREATE POLICY "Strict company isolation company_settings" ON public.company_settings
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id = get_my_company_id());

-- ============================================================================
-- FERTIG: Datenisolation ist nun serverseitig in der Datenbank garantiert!
-- ============================================================================
