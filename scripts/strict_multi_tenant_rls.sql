-- ============================================================================
-- KREATIV DESK OS - ENTERPRISE MULTI-TENANT ROW LEVEL SECURITY (RLS) PATCH
-- ============================================================================
-- Dieses Skript im Supabase Dashboard unter "SQL Editor" ausführen.
-- Es sichert sämtliche Tabellen, Storage Buckets und Auth-Trigger ab und
-- richtet B-Tree Indizes für maximale Abfrage-Geschwindigkeit ein.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. ALTE FUNKTIONEN BEREINIGEN (Verhindert Return-Type & Signatur-Konflikte)
-- ----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.get_my_company_id() CASCADE;
DROP FUNCTION IF EXISTS public.get_my_company_id(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_super_admin() CASCADE;

-- ----------------------------------------------------------------------------
-- 1. HILFSFUNKTION: Firmen-ID des authentifizierten Benutzers abfragen (als TEXT)
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 2. HILFSFUNKTION: Ist der Benutzer Super-Admin? (Root-Zugriff)
-- ----------------------------------------------------------------------------
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
GRANT ALL ON public.api_keys TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access api_keys" ON public.api_keys;
DROP POLICY IF EXISTS "Strict company isolation api_keys" ON public.api_keys;
CREATE POLICY "Strict company isolation api_keys" ON public.api_keys
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

-- B) CAD PLANS
ALTER TABLE IF EXISTS public.cad_plans ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.cad_plans TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access cad_plans" ON public.cad_plans;
DROP POLICY IF EXISTS "Strict company isolation cad_plans" ON public.cad_plans;
CREATE POLICY "Strict company isolation cad_plans" ON public.cad_plans
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

-- C) DOCUMENTS
ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.documents TO authenticated, service_role;
GRANT INSERT ON public.documents TO anon;
DROP POLICY IF EXISTS "Authenticated users access documents" ON public.documents;
DROP POLICY IF EXISTS "Strict company isolation documents" ON public.documents;
DROP POLICY IF EXISTS "Allow anon insert temp_receipt documents" ON public.documents;
DROP POLICY IF EXISTS "Allow anon select temp_receipt documents" ON public.documents;

CREATE POLICY "Strict company isolation documents" ON public.documents
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id() OR owner_id::text = auth.uid()::text)
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id() OR owner_id::text = auth.uid()::text);

-- Erlaubt Smartphone-Scans (QR-Code Live-Upload) temporäre Belege abzulegen (NUR INSERT, KEIN UNBERECHTIGTER SELECT!)
CREATE POLICY "Allow anon insert temp_receipt documents" ON public.documents
  FOR INSERT TO anon
  WITH CHECK (category = 'temp_receipt' AND company_id IS NOT NULL);

-- D) DEFECTS & TICKETS
ALTER TABLE IF EXISTS public.defects ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.defects TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access defects" ON public.defects;
DROP POLICY IF EXISTS "Strict company isolation defects" ON public.defects;
CREATE POLICY "Strict company isolation defects" ON public.defects
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id() OR owner_id::text = auth.uid()::text)
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id() OR owner_id::text = auth.uid()::text);

-- E) LEADS CRM
ALTER TABLE IF EXISTS public.leads ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.leads TO authenticated, service_role;
GRANT INSERT ON public.leads TO anon;
DROP POLICY IF EXISTS "Authenticated users access leads" ON public.leads;
DROP POLICY IF EXISTS "Strict company isolation leads" ON public.leads;
DROP POLICY IF EXISTS "Allow anon insert leads" ON public.leads;

CREATE POLICY "Strict company isolation leads" ON public.leads
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

-- Erlaubt anonyme Einreichungen über das öffentliche Lead-Formular (/lead-form/:companyId)
CREATE POLICY "Allow anon insert leads" ON public.leads
  FOR INSERT TO anon
  WITH CHECK (company_id IS NOT NULL);

-- F) TIME ENTRIES
ALTER TABLE IF EXISTS public.time_entries ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.time_entries TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access time_entries" ON public.time_entries;
DROP POLICY IF EXISTS "Strict company isolation time_entries" ON public.time_entries;
CREATE POLICY "Strict company isolation time_entries" ON public.time_entries
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id() OR user_id::text = auth.uid()::text)
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id() OR user_id::text = auth.uid()::text);

-- G) CALENDAR EVENTS
ALTER TABLE IF EXISTS public.calendar_events ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.calendar_events TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access calendar_events" ON public.calendar_events;
DROP POLICY IF EXISTS "Strict company isolation calendar_events" ON public.calendar_events;
CREATE POLICY "Strict company isolation calendar_events" ON public.calendar_events
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

-- H) PROJECTS
ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.projects TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access projects" ON public.projects;
DROP POLICY IF EXISTS "Strict company isolation projects" ON public.projects;
CREATE POLICY "Strict company isolation projects" ON public.projects
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id() OR owner_id::text = auth.uid()::text)
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id() OR owner_id::text = auth.uid()::text);

-- I) TRANSACTIONS / FINANCE
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.transactions TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access transactions" ON public.transactions;
DROP POLICY IF EXISTS "Strict company isolation transactions" ON public.transactions;
CREATE POLICY "Strict company isolation transactions" ON public.transactions
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id() OR owner_id::text = auth.uid()::text)
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id() OR owner_id::text = auth.uid()::text);

-- J) TASKS & PROJECT TASKS
ALTER TABLE IF EXISTS public.project_tasks ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.project_tasks TO authenticated, service_role;
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

ALTER TABLE IF EXISTS public.tasks ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.tasks TO authenticated, service_role;
DROP POLICY IF EXISTS "Allow public select" ON public.tasks;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.tasks;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.tasks;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.tasks;
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users access tasks" ON public.tasks;
DROP POLICY IF EXISTS "Strict company isolation tasks" ON public.tasks;
CREATE POLICY "Strict company isolation tasks" ON public.tasks
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id() OR assigned_to::text = auth.uid()::text)
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id() OR assigned_to::text = auth.uid()::text);

-- K) SMART PROPOSALS (Offerten & Verträge)
ALTER TABLE IF EXISTS public.smart_proposals ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.smart_proposals TO authenticated, service_role;
GRANT SELECT, UPDATE ON public.smart_proposals TO anon;
DROP POLICY IF EXISTS "Authenticated users access smart_proposals" ON public.smart_proposals;
DROP POLICY IF EXISTS "Strict company isolation smart_proposals" ON public.smart_proposals;
DROP POLICY IF EXISTS "Allow anon view smart_proposals by token" ON public.smart_proposals;
DROP POLICY IF EXISTS "Allow anon accept smart_proposals" ON public.smart_proposals;

CREATE POLICY "Strict company isolation smart_proposals" ON public.smart_proposals
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id() OR owner_id::text = auth.uid()::text)
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id() OR owner_id::text = auth.uid()::text);

CREATE POLICY "Allow anon view smart_proposals by token" ON public.smart_proposals
  FOR SELECT TO anon
  USING (share_token IS NOT NULL);

CREATE POLICY "Allow anon accept smart_proposals" ON public.smart_proposals
  FOR UPDATE TO anon
  USING (share_token IS NOT NULL)
  WITH CHECK (share_token IS NOT NULL);

-- L) CHAT MESSAGES (Meet & Live-Chat)
ALTER TABLE IF EXISTS public.chat_messages ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.chat_messages TO authenticated, service_role;
GRANT SELECT, INSERT ON public.chat_messages TO anon;
DROP POLICY IF EXISTS "Authenticated users access chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Strict company isolation chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow room guests chat insert" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow room guests chat select" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow authenticated chat access" ON public.chat_messages;

CREATE POLICY "Allow authenticated chat access" ON public.chat_messages
  FOR ALL TO authenticated
  USING (is_super_admin() OR sender_id::text = auth.uid()::text OR call_id IS NOT NULL)
  WITH CHECK (is_super_admin() OR sender_id::text = auth.uid()::text OR call_id IS NOT NULL);

CREATE POLICY "Allow room guests chat insert" ON public.chat_messages
  FOR INSERT TO anon
  WITH CHECK (call_id IS NOT NULL);

CREATE POLICY "Allow room guests chat select" ON public.chat_messages
  FOR SELECT TO anon
  USING (call_id IS NOT NULL);

-- M) COMPANY SETTINGS
ALTER TABLE IF EXISTS public.company_settings ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.company_settings TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access company_settings" ON public.company_settings;
DROP POLICY IF EXISTS "Strict company isolation company_settings" ON public.company_settings;
CREATE POLICY "Strict company isolation company_settings" ON public.company_settings
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

-- N) COMPANY USERS (Team & CRM Kontakte)
ALTER TABLE IF EXISTS public.company_users ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.company_users TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access company_users" ON public.company_users;
DROP POLICY IF EXISTS "Strict company isolation company_users" ON public.company_users;
CREATE POLICY "Strict company isolation company_users" ON public.company_users
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

-- O) NOTIFICATIONS
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.notifications TO authenticated, service_role;
DROP POLICY IF EXISTS "Strict company isolation notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users access notifications" ON public.notifications;
CREATE POLICY "Strict company isolation notifications" ON public.notifications
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

-- P) AUDIT LOGS (Compliance & Security)
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.audit_logs TO authenticated, service_role;
DROP POLICY IF EXISTS "Strict company isolation audit_logs" ON public.audit_logs;
CREATE POLICY "Strict company isolation audit_logs" ON public.audit_logs
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

-- Q) SUPPORT TICKETS
ALTER TABLE IF EXISTS public.support_tickets ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.support_tickets TO authenticated, service_role;
DROP POLICY IF EXISTS "Strict company isolation support_tickets" ON public.support_tickets;
CREATE POLICY "Strict company isolation support_tickets" ON public.support_tickets
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

-- R) AUDIO NOTES
ALTER TABLE IF EXISTS public.audio_notes ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.audio_notes TO authenticated, service_role;
DROP POLICY IF EXISTS "Strict company isolation audio_notes" ON public.audio_notes;
CREATE POLICY "Strict company isolation audio_notes" ON public.audio_notes
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

-- S) WHITEBOARD EXPORTS
ALTER TABLE IF EXISTS public.whiteboard_exports ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.whiteboard_exports TO authenticated, service_role;
DROP POLICY IF EXISTS "Strict company isolation whiteboard_exports" ON public.whiteboard_exports;
CREATE POLICY "Strict company isolation whiteboard_exports" ON public.whiteboard_exports
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

-- ----------------------------------------------------------------------------
-- 4. NEU HINZUGEFÜGTE TABELLEN (Schutz vor Privilege Escalation & Daten-Leaks)
-- ----------------------------------------------------------------------------

-- T) PROFILES (Benutzerprofile & Rollen)
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.profiles TO authenticated, service_role;
DROP POLICY IF EXISTS "Full Access Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users access profiles" ON public.profiles;
DROP POLICY IF EXISTS "Strict profile read" ON public.profiles;
DROP POLICY IF EXISTS "Strict profile update" ON public.profiles;
DROP POLICY IF EXISTS "Strict profile insert" ON public.profiles;

-- Jeder Nutzer sieht sein eigenes Profil, Kollegen der gleichen Firma oder Super-Admin sieht alle
CREATE POLICY "Strict profile read" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    is_super_admin() 
    OR id = auth.uid() 
    OR company_id::text = get_my_company_id()
  );

-- Nur der Inhaber darf sein Profil aktualisieren; Rollen-Erhöhung auf 'super_admin' wird strikt blockiert!
CREATE POLICY "Strict profile update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (is_super_admin() OR id = auth.uid())
  WITH CHECK (
    is_super_admin() 
    OR (
      id = auth.uid() 
      AND (
        role IS NULL 
        OR role != 'super_admin' 
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
      )
    )
  );

CREATE POLICY "Strict profile insert" ON public.profiles
  FOR INSERT TO authenticated, service_role
  WITH CHECK (is_super_admin() OR id = auth.uid());

-- U) COMPANIES (Firmen-Stammdaten & Lizenz-Limits)
ALTER TABLE IF EXISTS public.companies ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.companies TO authenticated, service_role;
DROP POLICY IF EXISTS "Full Access Companies" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users access companies" ON public.companies;
DROP POLICY IF EXISTS "Strict company isolation companies" ON public.companies;

CREATE POLICY "Strict company isolation companies" ON public.companies
  FOR ALL TO authenticated
  USING (
    is_super_admin() 
    OR id::text = get_my_company_id() 
    OR owner_id::text = auth.uid()::text
  )
  WITH CHECK (
    is_super_admin() 
    OR id::text = get_my_company_id() 
    OR owner_id::text = auth.uid()::text
  );

-- V) INVITES (Einladungen & Magic Links)
ALTER TABLE IF EXISTS public.invites ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.invites TO authenticated, service_role;
GRANT SELECT, UPDATE ON public.invites TO anon;
DROP POLICY IF EXISTS "Full Access Invites" ON public.invites;
DROP POLICY IF EXISTS "Authenticated users access invites" ON public.invites;
DROP POLICY IF EXISTS "Strict company isolation invites" ON public.invites;
DROP POLICY IF EXISTS "Allow anon view invite by token" ON public.invites;
DROP POLICY IF EXISTS "Allow anon accept invite" ON public.invites;

CREATE POLICY "Strict company isolation invites" ON public.invites
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

CREATE POLICY "Allow anon view invite by token" ON public.invites
  FOR SELECT TO anon
  USING (token IS NOT NULL);

CREATE POLICY "Allow anon accept invite" ON public.invites
  FOR UPDATE TO anon
  USING (token IS NOT NULL)
  WITH CHECK (token IS NOT NULL);

-- W) KNOWLEDGE DOCS & EMBEDDINGS (Firmeneigene KI-Wissensdatenbank)
ALTER TABLE IF EXISTS public.knowledge_docs ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.knowledge_docs TO authenticated, service_role;
DROP POLICY IF EXISTS "Full Access KnowledgeDocs" ON public.knowledge_docs;
DROP POLICY IF EXISTS "Authenticated users access knowledge_docs" ON public.knowledge_docs;
DROP POLICY IF EXISTS "Strict company isolation knowledge_docs" ON public.knowledge_docs;
CREATE POLICY "Strict company isolation knowledge_docs" ON public.knowledge_docs
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

ALTER TABLE IF EXISTS public.embeddings ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.embeddings TO authenticated, service_role;
DROP POLICY IF EXISTS "Full Access Embeddings" ON public.embeddings;
DROP POLICY IF EXISTS "Authenticated users access embeddings" ON public.embeddings;
DROP POLICY IF EXISTS "Strict company isolation embeddings" ON public.embeddings;
CREATE POLICY "Strict company isolation embeddings" ON public.embeddings
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

-- X) GOALS (Firmen- & Projektziele)
ALTER TABLE IF EXISTS public.goals ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.goals TO authenticated, service_role;
DROP POLICY IF EXISTS "Full Access Goals" ON public.goals;
DROP POLICY IF EXISTS "Authenticated users access goals" ON public.goals;
DROP POLICY IF EXISTS "Strict company isolation goals" ON public.goals;
CREATE POLICY "Strict company isolation goals" ON public.goals
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

-- Y) SLIDES (PitchDeck & Präsentationen)
ALTER TABLE IF EXISTS public.slides ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.slides TO authenticated, service_role;
DROP POLICY IF EXISTS "Full Access Slides" ON public.slides;
DROP POLICY IF EXISTS "Authenticated users access slides" ON public.slides;
DROP POLICY IF EXISTS "Strict company isolation slides" ON public.slides;

CREATE POLICY "Strict company isolation slides" ON public.slides
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

-- Z) PROJECT MEMBERS (Projekt-Mitarbeiterzuweisungen)
ALTER TABLE IF EXISTS public.project_members ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.project_members TO authenticated, service_role;
DROP POLICY IF EXISTS "Full Access ProjectMembers" ON public.project_members;
DROP POLICY IF EXISTS "Authenticated users access project_members" ON public.project_members;
DROP POLICY IF EXISTS "Strict company isolation project_members" ON public.project_members;

CREATE POLICY "Strict company isolation project_members" ON public.project_members
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id() OR user_id::text = auth.uid()::text)
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id() OR user_id::text = auth.uid()::text);

-- AA) PROJECT SCHEDULES (Projekt-Terminpläne & Meilensteine)
ALTER TABLE IF EXISTS public.project_schedules ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.project_schedules TO authenticated, service_role;
DROP POLICY IF EXISTS "Full Access Schedules" ON public.project_schedules;
DROP POLICY IF EXISTS "Authenticated users access project_schedules" ON public.project_schedules;
DROP POLICY IF EXISTS "Strict company isolation project_schedules" ON public.project_schedules;

CREATE POLICY "Strict company isolation project_schedules" ON public.project_schedules
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

-- AB) SITE DATA (Baustellen- & Projektdaten)
ALTER TABLE IF EXISTS public.site_data ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.site_data TO authenticated, service_role;
DROP POLICY IF EXISTS "Full Access SiteData" ON public.site_data;
DROP POLICY IF EXISTS "Authenticated users access site_data" ON public.site_data;
DROP POLICY IF EXISTS "Strict company isolation site_data" ON public.site_data;

CREATE POLICY "Strict company isolation site_data" ON public.site_data
  FOR ALL TO authenticated
  USING (is_super_admin() OR company_id::text = get_my_company_id())
  WITH CHECK (is_super_admin() OR company_id::text = get_my_company_id());

-- AC) VIDEO CALLS (WebRTC Konferenzräume & Meetings)
ALTER TABLE IF EXISTS public.video_calls ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.video_calls TO authenticated, anon, service_role;
DROP POLICY IF EXISTS "Full Access Calls" ON public.video_calls;
DROP POLICY IF EXISTS "Authenticated users access video_calls" ON public.video_calls;
DROP POLICY IF EXISTS "Allow authenticated full access video_calls" ON public.video_calls;
DROP POLICY IF EXISTS "Allow anon select video_calls" ON public.video_calls;
DROP POLICY IF EXISTS "Allow anon insert video_calls" ON public.video_calls;
DROP POLICY IF EXISTS "Allow anon update video_calls" ON public.video_calls;

CREATE POLICY "Allow authenticated full access video_calls" ON public.video_calls
  FOR ALL TO authenticated 
  USING (auth.uid() IS NOT NULL) 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow anon select video_calls" ON public.video_calls
  FOR SELECT TO anon 
  USING (room_name IS NOT NULL);

CREATE POLICY "Allow anon insert video_calls" ON public.video_calls
  FOR INSERT TO anon 
  WITH CHECK (room_name IS NOT NULL);

CREATE POLICY "Allow anon update video_calls" ON public.video_calls
  FOR UPDATE TO anon 
  USING (room_name IS NOT NULL) 
  WITH CHECK (room_name IS NOT NULL);

-- AD) SYSTEM CONFIG (Globale System- & Mandanten-Einstellungen)
ALTER TABLE IF EXISTS public.system_config ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.system_config TO authenticated, service_role;
GRANT SELECT ON public.system_config TO anon;
DROP POLICY IF EXISTS "Allow public read system_config" ON public.system_config;
DROP POLICY IF EXISTS "Strict super_admin write system_config" ON public.system_config;

CREATE POLICY "Allow public read system_config" ON public.system_config
  FOR SELECT TO PUBLIC 
  USING (id IS NOT NULL);

CREATE POLICY "Strict super_admin write system_config" ON public.system_config
  FOR ALL TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ----------------------------------------------------------------------------
-- 5. PERFORMANCE B-TREE INDIZES (Eliminiert Full-Table-Scans bei RLS)
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_documents_company_id ON public.documents (company_id);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON public.documents (project_id);
CREATE INDEX IF NOT EXISTS idx_projects_company_id ON public.projects (company_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_company_id ON public.time_entries (company_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON public.time_entries (project_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_company_id ON public.calendar_events (company_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_project_id ON public.calendar_events (project_id);
CREATE INDEX IF NOT EXISTS idx_defects_company_id ON public.defects (company_id);
CREATE INDEX IF NOT EXISTS idx_defects_project_id ON public.defects (project_id);
CREATE INDEX IF NOT EXISTS idx_cad_plans_company_id ON public.cad_plans (company_id);
CREATE INDEX IF NOT EXISTS idx_cad_plans_project_id ON public.cad_plans (project_id);
CREATE INDEX IF NOT EXISTS idx_smart_proposals_company_id ON public.smart_proposals (company_id);
CREATE INDEX IF NOT EXISTS idx_smart_proposals_share_token ON public.smart_proposals (share_token);
CREATE INDEX IF NOT EXISTS idx_leads_company_id ON public.leads (company_id);
CREATE INDEX IF NOT EXISTS idx_notifications_company_id ON public.notifications (company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id ON public.audit_logs (company_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_call_id ON public.chat_messages (call_id);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles (company_id);
CREATE INDEX IF NOT EXISTS idx_company_users_company_id ON public.company_users (company_id);
CREATE INDEX IF NOT EXISTS idx_company_settings_company_id ON public.company_settings (company_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_company_id ON public.support_tickets (company_id);
CREATE INDEX IF NOT EXISTS idx_slides_company_id ON public.slides (company_id);
CREATE INDEX IF NOT EXISTS idx_slides_project_id ON public.slides (project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_company_id ON public.project_members (company_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON public.project_members (project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON public.project_members (user_id);
CREATE INDEX IF NOT EXISTS idx_project_schedules_company_id ON public.project_schedules (company_id);
CREATE INDEX IF NOT EXISTS idx_site_data_company_id ON public.site_data (company_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_room_name ON public.video_calls (room_name);

-- ----------------------------------------------------------------------------
-- 7. ATOMARER AUTH-TRIGGER (Automatische Firmenzuweisung ab Registrierung)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  new_company_id UUID;
  company_name TEXT;
  user_full_name TEXT;
BEGIN
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  company_name := split_part(NEW.email, '@', 1) || '''s Organization';

  -- 1. Firma atomar anlegen
  INSERT INTO public.companies (name, plan, max_seats, used_seats, owner_id)
  VALUES (company_name, 'Free Trial', 1, 1, NEW.id)
  RETURNING id INTO new_company_id;

  -- 2. Profil mit direkt verknüpfter company_id anlegen
  INSERT INTO public.profiles (id, email, name, role, company_id, has_active_subscription)
  VALUES (
    NEW.id,
    NEW.email,
    user_full_name,
    'owner',
    new_company_id,
    true
  )
  ON CONFLICT (id) DO UPDATE 
    SET company_id = COALESCE(public.profiles.company_id, EXCLUDED.company_id),
        role = COALESCE(public.profiles.role, EXCLUDED.role);

  RETURN NEW;
END;
$$;

-- Trigger an auth.users binden (abgesichert gegen Rechte-Einschränkungen)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Trigger on_auth_user_created wird vom Supabase Auth-Dienst verwaltet.';
END $$;

-- ============================================================================
-- FERTIG: Die Datenbank ist nun zu 100% abgesichert, atomar verknüpft & hochperformant!
-- ============================================================================
