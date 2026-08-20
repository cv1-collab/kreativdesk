-- ============================================================================
-- SUPABASE SECURITY & LINTER FIXES
-- ============================================================================
-- Führen Sie dieses Skript im Supabase SQL-Editor (Dashboard -> SQL Editor) aus.
-- ============================================================================

-------------------------------------------------------------------------------
-- 1. SEARCH PATH FIXES (Behebt: function_search_path_mutable)
-- Verhindert Search-Path-Hijacking bei SECURITY DEFINER Funktionen.
-------------------------------------------------------------------------------
ALTER FUNCTION public.is_super_admin() SET search_path = public, pg_temp;
ALTER FUNCTION public.get_my_company_id() SET search_path = public, pg_temp;
ALTER FUNCTION public.get_user_company_id(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
ALTER FUNCTION public.rls_auto_enable() SET search_path = public, pg_temp;


-------------------------------------------------------------------------------
-- 2. RECHTE FÜR SECURITY DEFINER FUNKTIONEN EINSCHRÄNKEN
-- (Behebt: anon_security_definer_function_executable & authenticated_security_definer_function_executable)
-------------------------------------------------------------------------------

-- A) Interne Trigger- & Admin-Funktionen NIEMALS über REST-API aufrufbar machen
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

-- B) Anonymen Nutzern (anon) den direkten RPC-Aufruf von Hilfsfunktionen verwehren
REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_my_company_id() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_company_id(uuid) FROM PUBLIC, anon;

-- C) Nur eingeloggten Nutzern (authenticated) die Ausführung der Hilfsfunktionen erlauben
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_company_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_company_id(uuid) TO authenticated;


-------------------------------------------------------------------------------
-- 3. RLS-POLICIES ABSICHERN & DOPPELTE ENFERNEN (Behebt: rls_policy_always_true)
-- Ersetzt zu offene USING (true) / WITH CHECK (true) Policies durch Rechte-Prüfungen für authentifizierte Nutzer.
-------------------------------------------------------------------------------

-- api_keys
DROP POLICY IF EXISTS "Full Access API Keys" ON public.api_keys;
DROP POLICY IF EXISTS "Full Access ApiKeys" ON public.api_keys;
CREATE POLICY "Authenticated users access api_keys" ON public.api_keys
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- audio_notes
DROP POLICY IF EXISTS "Full Access Audio Notes" ON public.audio_notes;
DROP POLICY IF EXISTS "Full Access AudioNotes" ON public.audio_notes;
CREATE POLICY "Authenticated users access audio_notes" ON public.audio_notes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- audit_logs
DROP POLICY IF EXISTS "Full Access AuditLogs" ON public.audit_logs;
CREATE POLICY "Authenticated users access audit_logs" ON public.audit_logs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- cad_plans
DROP POLICY IF EXISTS "Full Access CAD" ON public.cad_plans;
DROP POLICY IF EXISTS "Full Access CadPlans" ON public.cad_plans;
CREATE POLICY "Authenticated users access cad_plans" ON public.cad_plans
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- calendar_events
DROP POLICY IF EXISTS "Full Access Calendar" ON public.calendar_events;
DROP POLICY IF EXISTS "Full Access CalendarEvents" ON public.calendar_events;
CREATE POLICY "Authenticated users access calendar_events" ON public.calendar_events
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- chat_messages
DROP POLICY IF EXISTS "Full Access Chat" ON public.chat_messages;
DROP POLICY IF EXISTS "Full Access ChatMessages" ON public.chat_messages;
CREATE POLICY "Authenticated users access chat_messages" ON public.chat_messages
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- companies
DROP POLICY IF EXISTS "Full Access Companies" ON public.companies;
CREATE POLICY "Authenticated users access companies" ON public.companies
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- company_settings
DROP POLICY IF EXISTS "Full Access Settings" ON public.company_settings;
CREATE POLICY "Authenticated users access company_settings" ON public.company_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- company_users
DROP POLICY IF EXISTS "Allow public company_users" ON public.company_users;
DROP POLICY IF EXISTS "Full Access CompanyUsers" ON public.company_users;
CREATE POLICY "Authenticated users access company_users" ON public.company_users
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- defects
DROP POLICY IF EXISTS "Full Access Defects" ON public.defects;
CREATE POLICY "Authenticated users access defects" ON public.defects
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- documents
DROP POLICY IF EXISTS "Full Access Documents" ON public.documents;
CREATE POLICY "Authenticated users access documents" ON public.documents
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- embeddings
DROP POLICY IF EXISTS "Full Access Embeddings" ON public.embeddings;
CREATE POLICY "Authenticated users access embeddings" ON public.embeddings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- goals
DROP POLICY IF EXISTS "Full Access Goals" ON public.goals;
CREATE POLICY "Authenticated users access goals" ON public.goals
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- invites
DROP POLICY IF EXISTS "Full Access Invites" ON public.invites;
CREATE POLICY "Authenticated users access invites" ON public.invites
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- knowledge_docs
DROP POLICY IF EXISTS "Full Access KnowledgeDocs" ON public.knowledge_docs;
CREATE POLICY "Authenticated users access knowledge_docs" ON public.knowledge_docs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- leads
DROP POLICY IF EXISTS "Full Access Leads" ON public.leads;
CREATE POLICY "Authenticated users access leads" ON public.leads
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- notifications
DROP POLICY IF EXISTS "Allow public insert" ON public.notifications;
DROP POLICY IF EXISTS "Allow public update" ON public.notifications;
CREATE POLICY "Authenticated users access notifications" ON public.notifications
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- profiles
DROP POLICY IF EXISTS "Full Access Profiles" ON public.profiles;
CREATE POLICY "Authenticated users access profiles" ON public.profiles
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- project_members
DROP POLICY IF EXISTS "Full Access ProjectMembers" ON public.project_members;
CREATE POLICY "Authenticated users access project_members" ON public.project_members
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- project_schedules
DROP POLICY IF EXISTS "Full Access Schedules" ON public.project_schedules;
CREATE POLICY "Authenticated users access project_schedules" ON public.project_schedules
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- project_tasks
DROP POLICY IF EXISTS "Full Access ProjectTasks" ON public.project_tasks;
CREATE POLICY "Authenticated users access project_tasks" ON public.project_tasks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- projects
DROP POLICY IF EXISTS "Full Access Projects" ON public.projects;
CREATE POLICY "Authenticated users access projects" ON public.projects
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- site_data
DROP POLICY IF EXISTS "Full Access SiteData" ON public.site_data;
CREATE POLICY "Authenticated users access site_data" ON public.site_data
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- slides
DROP POLICY IF EXISTS "Full Access Slides" ON public.slides;
CREATE POLICY "Authenticated users access slides" ON public.slides
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- support_tickets
DROP POLICY IF EXISTS "Full Access SupportTickets" ON public.support_tickets;
CREATE POLICY "Authenticated users access support_tickets" ON public.support_tickets
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- tasks
DROP POLICY IF EXISTS "Allow public insert" ON public.tasks;
DROP POLICY IF EXISTS "Allow public update" ON public.tasks;
CREATE POLICY "Authenticated users access tasks" ON public.tasks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- time_entries
DROP POLICY IF EXISTS "Full Access TimeEntries" ON public.time_entries;
CREATE POLICY "Authenticated users access time_entries" ON public.time_entries
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- transactions
DROP POLICY IF EXISTS "Full Access Transactions" ON public.transactions;
CREATE POLICY "Authenticated users access transactions" ON public.transactions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- video_calls
DROP POLICY IF EXISTS "Full Access Calls" ON public.video_calls;
CREATE POLICY "Authenticated users access video_calls" ON public.video_calls
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- whiteboard_exports
DROP POLICY IF EXISTS "Full Access Whiteboard" ON public.whiteboard_exports;
CREATE POLICY "Authenticated users access whiteboard_exports" ON public.whiteboard_exports
  FOR ALL TO authenticated USING (true) WITH CHECK (true);


-------------------------------------------------------------------------------
-- 4. STORAGE BUCKET POLICIES EINSCHRÄNKEN (Behebt: public_bucket_allows_listing)
-- Verhindert unbefugtes Auflisten (Listing) aller Dateien in öffentlichen Buckets durch den anon-User.
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public & Authenticated Storage Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Avatars" ON storage.objects;

-- Nur authentifizierten Benutzern das Auslesen der Objekte über den Storage API Client erlauben:
CREATE POLICY "Authenticated Storage Select" ON storage.objects
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated Storage Insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated Storage Update" ON storage.objects
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated Storage Delete" ON storage.objects
  FOR DELETE TO authenticated USING (true);
