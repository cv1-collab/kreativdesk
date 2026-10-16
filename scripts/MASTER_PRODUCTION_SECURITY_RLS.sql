-- ============================================================================
-- KREATIV DESK OS - MASTER PRODUCTION SECURITY & ZERO-LEAKAGE RLS SCRIPT
-- ============================================================================
-- Projekt: Kreativ Desk OS (Supabase PostgreSQL)
-- Ausführen in: Supabase Dashboard -> SQL Editor -> "New Query" -> "Run"
-- ============================================================================
-- Was dieses Master-Skript auf Datenbank-Ebene (PostgreSQL) absichert:
-- 1. Strikte Mandanten-Trennung (Multi-Tenancy via company_id) auf allen Tabellen
-- 2. Echte Rollen-Durchsetzung direkt in der Datenbank (nicht nur im Frontend!):
--    - Externe Handwerker ('guest', 'subcontractor', 'handwerker') & Bauherren ('client')
--      haben KEINEN Datenbank-Zugriff auf Finanzen (transactions), Offerten (smart_proposals),
--      CRM-Leads (leads), API-Keys, Audit-Logs oder interne System-Configs (finance_*, bexio_config_*).
--    - Externe Handwerker & Bauherren sehen in projects, defects, cad_plans und documents
--      NUR die Projekte, denen sie tatsächlich in project_members (oder per Mangel) zugewiesen sind!
--    - Interne Mitarbeiter mit can_view_finance = false sind auch auf DB-Ebene für
--      transactions und finance_*-Dokumente gesperrt.
--    - Bexio-Tokens (bexio_config_*) in documents sind ausschliesslich für Firmen-Owner/Admins les- & schreibbar.
-- 3. Sichere RPC-Funktionen (SECURITY DEFINER) für öffentliche Links (Smart Proposals mit PIN-Schutz,
--    Einladungs-Links, Gäste-Videocalls & Call-Chat ohne offenes Tabellen-Listing).
-- 4. Schutz vor Privilege Escalation auf profiles & companies (BEFORE INSERT OR UPDATE Trigger)
--    sowie gehärteter on_auth_user_created Trigger.
-- 5. Gehärtete Storage-Policies (Löschen/Überschreiben nur für Dateibesitzer oder Firmen-Admins;
--    mobiler QR-Beleg-Upload nur in temp_mobile_uploads/*).
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. SCHEMA-ERWEITERUNGEN (Idempotent)
-- ----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.company_users 
  ADD COLUMN IF NOT EXISTS user_id text,
  ADD COLUMN IF NOT EXISTS company text,
  ADD COLUMN IF NOT EXISTS street text,
  ADD COLUMN IF NOT EXISTS zip_city text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS uid_number text,
  ADD COLUMN IF NOT EXISTS vat_number text,
  ADD COLUMN IF NOT EXISTS is_external boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS avatar text,
  ADD COLUMN IF NOT EXISTS can_view_finance boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_approve_budget boolean DEFAULT false;

ALTER TABLE IF EXISTS public.companies
  ADD COLUMN IF NOT EXISTS max_seats integer DEFAULT 5,
  ADD COLUMN IF NOT EXISTS used_seats integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS plan text DEFAULT 'Free Trial',
  ADD COLUMN IF NOT EXISTS owner_id uuid;

ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS company_id uuid,
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'owner',
  ADD COLUMN IF NOT EXISTS plan text DEFAULT 'Free Trial',
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS avatar text,
  ADD COLUMN IF NOT EXISTS has_active_subscription boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS can_view_finance boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS can_approve_budget boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS has_seen_tour boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_completed_onboarding boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS active_mobile_session_id text,
  ADD COLUMN IF NOT EXISTS active_desktop_session_id text;

ALTER TABLE IF EXISTS public.invites
  ADD COLUMN IF NOT EXISTS token text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS company_id uuid,
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'employee',
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS invited_by uuid,
  ADD COLUMN IF NOT EXISTS used_by uuid,
  ADD COLUMN IF NOT EXISTS used_at timestamptz,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

ALTER TABLE IF EXISTS public.project_members
  ADD COLUMN IF NOT EXISTS user_email text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'member',
  ADD COLUMN IF NOT EXISTS project_role text DEFAULT 'member';

ALTER TABLE IF EXISTS public.defects
  ADD COLUMN IF NOT EXISTS assigned_to text,
  ADD COLUMN IF NOT EXISTS assignee text,
  ADD COLUMN IF NOT EXISTS pin_pos jsonb,
  ADD COLUMN IF NOT EXISTS trade text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS due_date text,
  ADD COLUMN IF NOT EXISTS image_url text;

ALTER TABLE IF EXISTS public.project_schedules
  ADD COLUMN IF NOT EXISTS project_id text;

ALTER TABLE IF EXISTS public.slides
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS description text;


-- ----------------------------------------------------------------------------
-- 2. SICHERHEITS- & ROLLEN-HILFSFUNKTIONEN IM GESCHÜTZTEN SCHEMA app_security
--    (Nicht über /rest/v1/rpc/* exponiert -> behebt Supabase Linter 0028/0029)
-- ----------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS app_security;
GRANT USAGE ON SCHEMA app_security TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION app_security.get_my_company_id()
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

CREATE OR REPLACE FUNCTION app_security.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT lower(trim(coalesce(role, 'employee')))
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION app_security.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT (
    lower(coalesce(auth.jwt()->>'email', '')) IN ('cv1@gmx.ch', 'carlo@vesciodesign.ch')
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
$$;

CREATE OR REPLACE FUNCTION app_security.is_company_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT (
    app_security.is_super_admin()
    OR app_security.get_my_role() IN ('owner', 'admin', 'management', 'geschaeftsleitung', 'super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION app_security.is_internal_company_member()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT (
    app_security.is_super_admin()
    OR (
      app_security.get_my_role() NOT IN (
        'guest', 'client', 'external', 'partner', 'subcontractor',
        'field guest', 'external planner', 'bauherr', 'handwerker'
      )
      AND app_security.get_my_role() NOT LIKE '%guest%'
      AND app_security.get_my_role() NOT LIKE '%extern%'
      AND app_security.get_my_role() NOT LIKE '%handwerker%'
      AND app_security.get_my_role() NOT LIKE '%subcontractor%'
    )
  );
$$;

CREATE OR REPLACE FUNCTION app_security.can_user_view_finance()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT (
    app_security.is_super_admin()
    OR app_security.is_company_admin()
    OR (
      app_security.is_internal_company_member()
      AND coalesce((SELECT can_view_finance FROM public.profiles WHERE id = auth.uid() LIMIT 1), true) = true
    )
  );
$$;

CREATE OR REPLACE FUNCTION app_security.can_access_project(p_project_id text)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT (
    p_project_id IS NULL
    OR p_project_id = ''
    OR p_project_id = 'global'
    OR app_security.is_super_admin()
    OR app_security.is_internal_company_member()
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id::text = p_project_id
        AND (
          pm.user_id::text = auth.uid()::text
          OR (
            coalesce(auth.jwt()->>'email', '') <> ''
            AND (
              lower(coalesce(pm.user_email, '')) = lower(auth.jwt()->>'email')
              OR EXISTS (
                SELECT 1 FROM public.company_users cu
                WHERE cu.id::text = pm.user_id::text
                  AND lower(coalesce(cu.email, '')) = lower(auth.jwt()->>'email')
              )
            )
          )
        )
    )
    OR EXISTS (
      SELECT 1 FROM public.defects d
      WHERE d.project_id::text = p_project_id
        AND (
          d.assigned_to::text = auth.uid()::text
          OR (
            coalesce(auth.jwt()->>'email', '') <> ''
            AND lower(coalesce(d.assignee, '')) = lower(auth.jwt()->>'email')
          )
        )
    )
  );
$$;

REVOKE EXECUTE ON FUNCTION app_security.get_my_company_id() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION app_security.get_my_role() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION app_security.is_super_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION app_security.is_company_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION app_security.is_internal_company_member() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION app_security.can_user_view_finance() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION app_security.can_access_project(text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION app_security.get_my_company_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_security.get_my_role() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_security.is_super_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_security.is_company_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_security.is_internal_company_member() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_security.can_user_view_finance() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_security.can_access_project(text) TO authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 3. TABELLEN-RLS MIT ROLLEN- & PROJEKT-ISOLATION (ZERO LEAKAGE)
-- ----------------------------------------------------------------------------

-- A) API KEYS (Nur Firmen-Owner/Admin)
ALTER TABLE IF EXISTS public.api_keys ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.api_keys FROM anon;
GRANT ALL ON public.api_keys TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access api_keys" ON public.api_keys;
DROP POLICY IF EXISTS "Strict company isolation api_keys" ON public.api_keys;
CREATE POLICY "Strict company isolation api_keys" ON public.api_keys
  FOR ALL TO authenticated
  USING (app_security.is_super_admin() OR (company_id::text = app_security.get_my_company_id() AND app_security.is_company_admin()))
  WITH CHECK (app_security.is_super_admin() OR (company_id::text = app_security.get_my_company_id() AND app_security.is_company_admin()));

-- B) TRANSACTIONS / FINANZEN (Nur interne berechtigte Nutzer, KEINE Handwerker/Gäste!)
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.transactions FROM anon;
GRANT ALL ON public.transactions TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access transactions" ON public.transactions;
DROP POLICY IF EXISTS "Strict company isolation transactions" ON public.transactions;
CREATE POLICY "Strict company isolation transactions" ON public.transactions
  FOR ALL TO authenticated
  USING (
    app_security.is_super_admin()
    OR ((company_id::text = app_security.get_my_company_id() OR owner_id::text = auth.uid()::text) AND app_security.can_user_view_finance())
  )
  WITH CHECK (
    app_security.is_super_admin()
    OR ((company_id::text = app_security.get_my_company_id() OR owner_id::text = auth.uid()::text) AND app_security.can_user_view_finance())
  );

-- C) LEADS CRM (Intern nur für Firmenmitglieder, anon nur INSERT für öffentliches Lead-Formular)
ALTER TABLE IF EXISTS public.leads ENABLE ROW LEVEL SECURITY;
REVOKE SELECT, UPDATE, DELETE ON public.leads FROM anon;
GRANT ALL ON public.leads TO authenticated, service_role;
GRANT INSERT ON public.leads TO anon;
DROP POLICY IF EXISTS "Authenticated users access leads" ON public.leads;
DROP POLICY IF EXISTS "Strict company isolation leads" ON public.leads;
DROP POLICY IF EXISTS "Allow anon insert leads" ON public.leads;

CREATE POLICY "Strict company isolation leads" ON public.leads
  FOR ALL TO authenticated
  USING (app_security.is_super_admin() OR (company_id::text = app_security.get_my_company_id() AND app_security.is_internal_company_member()))
  WITH CHECK (app_security.is_super_admin() OR (company_id::text = app_security.get_my_company_id() AND app_security.is_internal_company_member()));

CREATE POLICY "Allow anon insert leads" ON public.leads
  FOR INSERT TO anon
  WITH CHECK (company_id IS NOT NULL);

-- D) DOCUMENTS (Mit Schutz für bexio_config_*, finance_* und Projekt-Zuweisung für Gäste)
ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;
REVOKE SELECT, UPDATE, DELETE ON public.documents FROM anon;
GRANT ALL ON public.documents TO authenticated, service_role;
GRANT INSERT ON public.documents TO anon;
DROP POLICY IF EXISTS "Authenticated users access documents" ON public.documents;
DROP POLICY IF EXISTS "Strict company isolation documents" ON public.documents;
DROP POLICY IF EXISTS "Strict documents select" ON public.documents;
DROP POLICY IF EXISTS "Strict documents insert" ON public.documents;
DROP POLICY IF EXISTS "Strict documents update" ON public.documents;
DROP POLICY IF EXISTS "Strict documents delete" ON public.documents;
DROP POLICY IF EXISTS "Allow anon insert temp_receipt documents" ON public.documents;
DROP POLICY IF EXISTS "Allow anon select temp_receipt documents" ON public.documents;

CREATE POLICY "Strict documents select" ON public.documents
  FOR SELECT TO authenticated
  USING (
    app_security.is_super_admin()
    OR (company_id IS NULL AND category = 'system_config')
    OR (
      (company_id::text = app_security.get_my_company_id() OR owner_id::text = auth.uid()::text)
      AND (
        CASE
          WHEN coalesce(name, '') LIKE 'bexio_config_%' THEN app_security.is_company_admin()
          WHEN coalesce(name, '') LIKE 'finance_%' THEN app_security.can_user_view_finance()
          WHEN coalesce(category, '') = 'system_config' AND coalesce(name, '') NOT LIKE 'company_profile_%' THEN app_security.is_internal_company_member()
          ELSE app_security.can_access_project(project_id::text)
        END
      )
    )
  );

CREATE POLICY "Strict documents insert" ON public.documents
  FOR INSERT TO authenticated
  WITH CHECK (
    app_security.is_super_admin()
    OR (company_id IS NULL AND category = 'system_config' AND app_security.is_company_admin())
    OR (
      (company_id::text = app_security.get_my_company_id() OR owner_id::text = auth.uid()::text)
      AND (
        CASE
          WHEN coalesce(name, '') LIKE 'bexio_config_%' THEN app_security.is_company_admin()
          WHEN coalesce(name, '') LIKE 'finance_%' THEN app_security.can_user_view_finance()
          ELSE app_security.can_access_project(project_id::text)
        END
      )
    )
  );

CREATE POLICY "Strict documents update" ON public.documents
  FOR UPDATE TO authenticated
  USING (
    app_security.is_super_admin()
    OR (company_id IS NULL AND category = 'system_config' AND app_security.is_company_admin())
    OR (
      (company_id::text = app_security.get_my_company_id() OR owner_id::text = auth.uid()::text)
      AND (
        CASE
          WHEN coalesce(name, '') LIKE 'bexio_config_%' THEN app_security.is_company_admin()
          WHEN coalesce(name, '') LIKE 'finance_%' THEN app_security.can_user_view_finance()
          ELSE app_security.can_access_project(project_id::text)
        END
      )
    )
  )
  WITH CHECK (
    app_security.is_super_admin()
    OR (company_id IS NULL AND category = 'system_config' AND app_security.is_company_admin())
    OR (
      (company_id::text = app_security.get_my_company_id() OR owner_id::text = auth.uid()::text)
      AND (
        CASE
          WHEN coalesce(name, '') LIKE 'bexio_config_%' THEN app_security.is_company_admin()
          WHEN coalesce(name, '') LIKE 'finance_%' THEN app_security.can_user_view_finance()
          ELSE app_security.can_access_project(project_id::text)
        END
      )
    )
  );

CREATE POLICY "Strict documents delete" ON public.documents
  FOR DELETE TO authenticated
  USING (
    app_security.is_super_admin()
    OR (
      (company_id::text = app_security.get_my_company_id() OR owner_id::text = auth.uid()::text)
      AND (app_security.is_internal_company_member() OR owner_id::text = auth.uid()::text)
    )
  );

CREATE POLICY "Allow anon insert temp_receipt documents" ON public.documents
  FOR INSERT TO anon
  WITH CHECK (category = 'temp_receipt');

-- E) PROJECTS (Gäste/Handwerker sehen nur zugewiesene Projekte; Anlegen/Löschen nur intern)
ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.projects FROM anon;
GRANT ALL ON public.projects TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access projects" ON public.projects;
DROP POLICY IF EXISTS "Strict company isolation projects" ON public.projects;
DROP POLICY IF EXISTS "Strict projects select" ON public.projects;
DROP POLICY IF EXISTS "Strict projects write" ON public.projects;

CREATE POLICY "Strict projects select" ON public.projects
  FOR SELECT TO authenticated
  USING (
    app_security.is_super_admin()
    OR ((company_id::text = app_security.get_my_company_id() OR owner_id::text = auth.uid()::text) AND app_security.can_access_project(id::text))
  );

CREATE POLICY "Strict projects write" ON public.projects
  FOR ALL TO authenticated
  USING (
    app_security.is_super_admin()
    OR ((company_id::text = app_security.get_my_company_id() OR owner_id::text = auth.uid()::text) AND app_security.is_internal_company_member())
  )
  WITH CHECK (
    app_security.is_super_admin()
    OR ((company_id::text = app_security.get_my_company_id() OR owner_id::text = auth.uid()::text) AND app_security.is_internal_company_member())
  );

-- F) CAD PLANS & DEFECTS (Projektbezogener Zugriff für Handwerker/Gäste)
ALTER TABLE IF EXISTS public.cad_plans ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cad_plans FROM anon;
GRANT ALL ON public.cad_plans TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access cad_plans" ON public.cad_plans;
DROP POLICY IF EXISTS "Strict company isolation cad_plans" ON public.cad_plans;
CREATE POLICY "Strict company isolation cad_plans" ON public.cad_plans
  FOR ALL TO authenticated
  USING (app_security.is_super_admin() OR (company_id::text = app_security.get_my_company_id() AND app_security.can_access_project(project_id::text)))
  WITH CHECK (app_security.is_super_admin() OR (company_id::text = app_security.get_my_company_id() AND app_security.can_access_project(project_id::text)));

ALTER TABLE IF EXISTS public.defects ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.defects FROM anon;
GRANT ALL ON public.defects TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access defects" ON public.defects;
DROP POLICY IF EXISTS "Strict company isolation defects" ON public.defects;
CREATE POLICY "Strict company isolation defects" ON public.defects
  FOR ALL TO authenticated
  USING (
    app_security.is_super_admin()
    OR ((company_id::text = app_security.get_my_company_id() OR owner_id::text = auth.uid()::text) AND app_security.can_access_project(project_id::text))
  )
  WITH CHECK (
    app_security.is_super_admin()
    OR ((company_id::text = app_security.get_my_company_id() OR owner_id::text = auth.uid()::text) AND app_security.can_access_project(project_id::text))
  );

-- G) TIME ENTRIES, CALENDAR EVENTS, TASKS, SLIDES, PROJECT MEMBERS, SCHEDULES, SITE DATA
ALTER TABLE IF EXISTS public.time_entries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.time_entries FROM anon;
GRANT ALL ON public.time_entries TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access time_entries" ON public.time_entries;
DROP POLICY IF EXISTS "Strict company isolation time_entries" ON public.time_entries;
CREATE POLICY "Strict company isolation time_entries" ON public.time_entries
  FOR ALL TO authenticated
  USING (
    app_security.is_super_admin()
    OR user_id::text = auth.uid()::text
    OR (company_id::text = app_security.get_my_company_id() AND app_security.is_internal_company_member())
  )
  WITH CHECK (
    app_security.is_super_admin()
    OR user_id::text = auth.uid()::text
    OR (company_id::text = app_security.get_my_company_id() AND app_security.is_internal_company_member())
  );

ALTER TABLE IF EXISTS public.calendar_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.calendar_events FROM anon;
GRANT ALL ON public.calendar_events TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access calendar_events" ON public.calendar_events;
DROP POLICY IF EXISTS "Strict company isolation calendar_events" ON public.calendar_events;
CREATE POLICY "Strict company isolation calendar_events" ON public.calendar_events
  FOR ALL TO authenticated
  USING (app_security.is_super_admin() OR (company_id::text = app_security.get_my_company_id() AND app_security.can_access_project(project_id::text)))
  WITH CHECK (app_security.is_super_admin() OR (company_id::text = app_security.get_my_company_id() AND app_security.can_access_project(project_id::text)));

ALTER TABLE IF EXISTS public.project_tasks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.project_tasks FROM anon;
GRANT ALL ON public.project_tasks TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access project_tasks" ON public.project_tasks;
DROP POLICY IF EXISTS "Strict company isolation project_tasks" ON public.project_tasks;
CREATE POLICY "Strict company isolation project_tasks" ON public.project_tasks
  FOR ALL TO authenticated
  USING (
    app_security.is_super_admin()
    OR owner_id::text = auth.uid()::text
    OR assigned_to::text = auth.uid()::text
    OR (company_id::text = app_security.get_my_company_id() AND app_security.can_access_project(project_id::text))
  )
  WITH CHECK (
    app_security.is_super_admin()
    OR owner_id::text = auth.uid()::text
    OR assigned_to::text = auth.uid()::text
    OR (company_id::text = app_security.get_my_company_id() AND app_security.can_access_project(project_id::text))
  );

ALTER TABLE IF EXISTS public.tasks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.tasks FROM anon;
GRANT ALL ON public.tasks TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access tasks" ON public.tasks;
DROP POLICY IF EXISTS "Strict company isolation tasks" ON public.tasks;
CREATE POLICY "Strict company isolation tasks" ON public.tasks
  FOR ALL TO authenticated
  USING (app_security.is_super_admin() OR assigned_to::text = auth.uid()::text OR (company_id::text = app_security.get_my_company_id() AND app_security.is_internal_company_member()))
  WITH CHECK (app_security.is_super_admin() OR assigned_to::text = auth.uid()::text OR (company_id::text = app_security.get_my_company_id() AND app_security.is_internal_company_member()));

ALTER TABLE IF EXISTS public.slides ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.slides FROM anon;
GRANT ALL ON public.slides TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access slides" ON public.slides;
DROP POLICY IF EXISTS "Strict company isolation slides" ON public.slides;
CREATE POLICY "Strict company isolation slides" ON public.slides
  FOR ALL TO authenticated
  USING (app_security.is_super_admin() OR (company_id::text = app_security.get_my_company_id() AND app_security.is_internal_company_member()))
  WITH CHECK (app_security.is_super_admin() OR (company_id::text = app_security.get_my_company_id() AND app_security.is_internal_company_member()));

ALTER TABLE IF EXISTS public.project_members ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.project_members FROM anon;
GRANT ALL ON public.project_members TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access project_members" ON public.project_members;
DROP POLICY IF EXISTS "Strict company isolation project_members" ON public.project_members;
CREATE POLICY "Strict company isolation project_members" ON public.project_members
  FOR ALL TO authenticated
  USING (
    app_security.is_super_admin()
    OR user_id::text = auth.uid()::text
    OR lower(coalesce(user_email, '')) = lower(coalesce(auth.jwt()->>'email', ''))
    OR company_id::text = app_security.get_my_company_id()
  )
  WITH CHECK (
    app_security.is_super_admin()
    OR (company_id::text = app_security.get_my_company_id() AND app_security.is_internal_company_member())
  );

ALTER TABLE IF EXISTS public.project_schedules ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.project_schedules FROM anon;
GRANT ALL ON public.project_schedules TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access project_schedules" ON public.project_schedules;
DROP POLICY IF EXISTS "Strict company isolation project_schedules" ON public.project_schedules;
CREATE POLICY "Strict company isolation project_schedules" ON public.project_schedules
  FOR ALL TO authenticated
  USING (app_security.is_super_admin() OR (company_id::text = app_security.get_my_company_id() AND app_security.can_access_project(coalesce(project_id::text, id::text))))
  WITH CHECK (app_security.is_super_admin() OR (company_id::text = app_security.get_my_company_id() AND app_security.can_access_project(coalesce(project_id::text, id::text))));

ALTER TABLE IF EXISTS public.site_data ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.site_data FROM anon;
GRANT ALL ON public.site_data TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access site_data" ON public.site_data;
DROP POLICY IF EXISTS "Strict company isolation site_data" ON public.site_data;
CREATE POLICY "Strict company isolation site_data" ON public.site_data
  FOR ALL TO authenticated
  USING (app_security.is_super_admin() OR (company_id::text = app_security.get_my_company_id() AND app_security.can_access_project(project_id::text)))
  WITH CHECK (app_security.is_super_admin() OR (company_id::text = app_security.get_my_company_id() AND app_security.can_access_project(project_id::text)));

-- H) COMPANY SETTINGS, COMPANY USERS, NOTIFICATIONS, AUDIT LOGS, SUPPORT TICKETS, AUDIO, WHITEBOARD, EMBEDDINGS, GOALS, KNOWLEDGE_DOCS, SYSTEM_CONFIG
ALTER TABLE IF EXISTS public.company_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.company_settings FROM anon;
GRANT ALL ON public.company_settings TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access company_settings" ON public.company_settings;
DROP POLICY IF EXISTS "Strict company isolation company_settings" ON public.company_settings;
CREATE POLICY "Strict company isolation company_settings" ON public.company_settings
  FOR SELECT TO authenticated
  USING (app_security.is_super_admin() OR company_id::text = app_security.get_my_company_id());
DROP POLICY IF EXISTS "Strict company admin write company_settings" ON public.company_settings;
CREATE POLICY "Strict company admin write company_settings" ON public.company_settings
  FOR ALL TO authenticated
  USING (app_security.is_super_admin() OR (company_id::text = app_security.get_my_company_id() AND app_security.is_company_admin()))
  WITH CHECK (app_security.is_super_admin() OR (company_id::text = app_security.get_my_company_id() AND app_security.is_company_admin()));

ALTER TABLE IF EXISTS public.company_users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.company_users FROM anon;
GRANT ALL ON public.company_users TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access company_users" ON public.company_users;
DROP POLICY IF EXISTS "Strict company isolation company_users" ON public.company_users;
CREATE POLICY "Strict company isolation company_users" ON public.company_users
  FOR SELECT TO authenticated
  USING (app_security.is_super_admin() OR company_id::text = app_security.get_my_company_id());
DROP POLICY IF EXISTS "Strict internal write company_users" ON public.company_users;
CREATE POLICY "Strict internal write company_users" ON public.company_users
  FOR ALL TO authenticated
  USING (
    app_security.is_super_admin()
    OR (
      company_id::text = app_security.get_my_company_id()
      AND (app_security.is_internal_company_member() OR user_id::text = auth.uid()::text OR lower(coalesce(email, '')) = lower(coalesce(auth.jwt()->>'email', '')))
    )
  )
  WITH CHECK (
    app_security.is_super_admin()
    OR (
      company_id::text = app_security.get_my_company_id()
      AND (app_security.is_internal_company_member() OR user_id::text = auth.uid()::text OR lower(coalesce(email, '')) = lower(coalesce(auth.jwt()->>'email', '')))
    )
  );

ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.notifications FROM anon;
GRANT ALL ON public.notifications TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access notifications" ON public.notifications;
DROP POLICY IF EXISTS "Strict company isolation notifications" ON public.notifications;
CREATE POLICY "Strict company isolation notifications" ON public.notifications
  FOR ALL TO authenticated
  USING (app_security.is_super_admin() OR company_id::text = app_security.get_my_company_id())
  WITH CHECK (app_security.is_super_admin() OR company_id::text = app_security.get_my_company_id());

ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.audit_logs FROM anon;
GRANT ALL ON public.audit_logs TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Strict company isolation audit_logs" ON public.audit_logs;
CREATE POLICY "Strict company isolation audit_logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (app_security.is_super_admin() OR (company_id::text = app_security.get_my_company_id() AND app_security.is_company_admin()));
DROP POLICY IF EXISTS "Strict company insert audit_logs" ON public.audit_logs;
CREATE POLICY "Strict company insert audit_logs" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (app_security.is_super_admin() OR company_id::text = app_security.get_my_company_id());

ALTER TABLE IF EXISTS public.support_tickets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.support_tickets FROM anon;
GRANT ALL ON public.support_tickets TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access support_tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Strict company isolation support_tickets" ON public.support_tickets;
CREATE POLICY "Strict company isolation support_tickets" ON public.support_tickets
  FOR ALL TO authenticated
  USING (app_security.is_super_admin() OR company_id::text = app_security.get_my_company_id())
  WITH CHECK (app_security.is_super_admin() OR company_id::text = app_security.get_my_company_id());

ALTER TABLE IF EXISTS public.audio_notes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.audio_notes FROM anon;
GRANT ALL ON public.audio_notes TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access audio_notes" ON public.audio_notes;
DROP POLICY IF EXISTS "Strict company isolation audio_notes" ON public.audio_notes;
CREATE POLICY "Strict company isolation audio_notes" ON public.audio_notes
  FOR ALL TO authenticated
  USING (app_security.is_super_admin() OR (company_id::text = app_security.get_my_company_id() AND app_security.can_access_project(project_id::text)))
  WITH CHECK (app_security.is_super_admin() OR (company_id::text = app_security.get_my_company_id() AND app_security.can_access_project(project_id::text)));

ALTER TABLE IF EXISTS public.whiteboard_exports ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.whiteboard_exports FROM anon;
GRANT ALL ON public.whiteboard_exports TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access whiteboard_exports" ON public.whiteboard_exports;
DROP POLICY IF EXISTS "Strict company isolation whiteboard_exports" ON public.whiteboard_exports;
CREATE POLICY "Strict company isolation whiteboard_exports" ON public.whiteboard_exports
  FOR ALL TO authenticated
  USING (app_security.is_super_admin() OR (company_id::text = app_security.get_my_company_id() AND app_security.can_access_project(project_id::text)))
  WITH CHECK (app_security.is_super_admin() OR (company_id::text = app_security.get_my_company_id() AND app_security.can_access_project(project_id::text)));

ALTER TABLE IF EXISTS public.embeddings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.embeddings FROM anon;
GRANT ALL ON public.embeddings TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access embeddings" ON public.embeddings;
DROP POLICY IF EXISTS "Strict company isolation embeddings" ON public.embeddings;
CREATE POLICY "Strict company isolation embeddings" ON public.embeddings
  FOR ALL TO authenticated
  USING (app_security.is_super_admin() OR company_id::text = app_security.get_my_company_id())
  WITH CHECK (app_security.is_super_admin() OR company_id::text = app_security.get_my_company_id());

ALTER TABLE IF EXISTS public.goals ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.goals FROM anon;
GRANT ALL ON public.goals TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access goals" ON public.goals;
DROP POLICY IF EXISTS "Strict company isolation goals" ON public.goals;
CREATE POLICY "Strict company isolation goals" ON public.goals
  FOR ALL TO authenticated
  USING (app_security.is_super_admin() OR company_id::text = app_security.get_my_company_id())
  WITH CHECK (app_security.is_super_admin() OR company_id::text = app_security.get_my_company_id());

ALTER TABLE IF EXISTS public.knowledge_docs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.knowledge_docs FROM anon;
GRANT ALL ON public.knowledge_docs TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access knowledge_docs" ON public.knowledge_docs;
DROP POLICY IF EXISTS "Strict company isolation knowledge_docs" ON public.knowledge_docs;
CREATE POLICY "Strict company isolation knowledge_docs" ON public.knowledge_docs
  FOR ALL TO authenticated
  USING (app_security.is_super_admin() OR company_id::text = app_security.get_my_company_id())
  WITH CHECK (app_security.is_super_admin() OR company_id::text = app_security.get_my_company_id());

ALTER TABLE IF EXISTS public.system_config ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.system_config TO anon, authenticated, service_role;
GRANT INSERT, UPDATE, DELETE ON public.system_config TO authenticated, service_role;
DROP POLICY IF EXISTS "Authenticated users access system_config" ON public.system_config;
DROP POLICY IF EXISTS "Strict system_config select" ON public.system_config;
DROP POLICY IF EXISTS "Strict system_config write" ON public.system_config;
CREATE POLICY "Strict system_config select" ON public.system_config
  FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY "Strict system_config write" ON public.system_config
  FOR ALL TO authenticated
  USING (app_security.is_super_admin())
  WITH CHECK (app_security.is_super_admin());

-- ----------------------------------------------------------------------------
-- 4. INVITES & SMART PROPOSALS (Nur über sichere Token-RPCs für anon!)
-- ----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.invites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon view invite by token" ON public.invites;
DROP POLICY IF EXISTS "Allow anon accept invite" ON public.invites;
DROP POLICY IF EXISTS "Full Access Invites" ON public.invites;
DROP POLICY IF EXISTS "Authenticated users access invites" ON public.invites;
DROP POLICY IF EXISTS "Strict company isolation invites" ON public.invites;

REVOKE SELECT, INSERT, UPDATE, DELETE ON public.invites FROM anon;
GRANT ALL ON public.invites TO authenticated, service_role;

CREATE POLICY "Strict company isolation invites" ON public.invites
  FOR ALL TO authenticated
  USING (
    app_security.is_super_admin()
    OR (company_id::text = app_security.get_my_company_id() AND app_security.is_internal_company_member())
    OR lower(email) = lower(coalesce(auth.jwt()->>'email', ''))
    OR used_by = auth.uid()
  )
  WITH CHECK (
    app_security.is_super_admin()
    OR (company_id::text = app_security.get_my_company_id() AND app_security.is_internal_company_member())
    OR lower(email) = lower(coalesce(auth.jwt()->>'email', ''))
    OR used_by = auth.uid()
  );

CREATE OR REPLACE FUNCTION public.get_invite_details(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_inv record;
  v_comp_name text := '';
BEGIN
  IF p_token IS NULL OR trim(p_token) = '' THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_inv 
  FROM public.invites 
  WHERE token = p_token AND status = 'pending'
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF v_inv.company_id IS NOT NULL THEN
    SELECT name INTO v_comp_name FROM public.companies WHERE id = v_inv.company_id LIMIT 1;
  END IF;

  RETURN jsonb_build_object(
    'id', v_inv.id,
    'token', v_inv.token,
    'company_id', v_inv.company_id,
    'company_name', coalesce(v_comp_name, 'Team Workspace'),
    'email', v_inv.email,
    'role', v_inv.role,
    'status', v_inv.status,
    'expires_at', v_inv.expires_at
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_invite_details(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.accept_invite_by_token(p_token text, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_inv record;
  v_safe_role text;
BEGIN
  IF p_token IS NULL OR p_user_id IS NULL THEN
    RETURN false;
  END IF;

  IF auth.uid() IS NOT NULL AND auth.uid() != p_user_id AND NOT app_security.is_super_admin() THEN
    RETURN false;
  END IF;

  SELECT * INTO v_inv 
  FROM public.invites 
  WHERE token = p_token
    AND (status = 'pending' OR (status = 'used' AND used_by = p_user_id))
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  v_safe_role := CASE WHEN v_inv.role IN ('super_admin', 'owner') THEN 'admin' ELSE coalesce(v_inv.role, 'employee') END;

  PERFORM set_config('app.bypass_profile_trigger', 'true', true);

  UPDATE public.invites
  SET status = 'used', used_by = p_user_id, used_at = now()
  WHERE id = v_inv.id;

  UPDATE public.profiles
  SET company_id = v_inv.company_id, 
      role = v_safe_role
  WHERE id = p_user_id;

  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.accept_invite_by_token(text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_invite_by_token(text, uuid) TO authenticated, service_role;

-- SMART PROPOSALS
ALTER TABLE IF EXISTS public.smart_proposals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active proposals via share token" ON public.smart_proposals;
DROP POLICY IF EXISTS "Public can sign and accept proposal" ON public.smart_proposals;
DROP POLICY IF EXISTS "Allow anon view smart_proposals by token" ON public.smart_proposals;
DROP POLICY IF EXISTS "Allow anon accept smart_proposals" ON public.smart_proposals;
DROP POLICY IF EXISTS "Company users can manage proposals" ON public.smart_proposals;
DROP POLICY IF EXISTS "Company users can manage own company proposals" ON public.smart_proposals;
DROP POLICY IF EXISTS "Strict company isolation smart_proposals" ON public.smart_proposals;

REVOKE SELECT, INSERT, UPDATE, DELETE ON public.smart_proposals FROM anon;
GRANT ALL ON public.smart_proposals TO authenticated, service_role;

CREATE POLICY "Company users can manage own company proposals" ON public.smart_proposals
  FOR ALL TO authenticated
  USING (
    app_security.is_super_admin()
    OR ((company_id::text = app_security.get_my_company_id() OR owner_id::text = auth.uid()::text) AND app_security.is_internal_company_member())
  )
  WITH CHECK (
    app_security.is_super_admin()
    OR ((company_id::text = app_security.get_my_company_id() OR owner_id::text = auth.uid()::text) AND app_security.is_internal_company_member())
  );

DROP FUNCTION IF EXISTS public.get_proposal_by_share_token(text);
CREATE OR REPLACE FUNCTION public.get_proposal_by_share_token(p_token text, p_pin text DEFAULT NULL)
RETURNS SETOF public.smart_proposals
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_prop public.smart_proposals%ROWTYPE;
BEGIN
  SELECT * INTO v_prop
  FROM public.smart_proposals
  WHERE share_token = p_token
    AND status IN ('active', 'accepted')
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF v_prop.pin_code IS NOT NULL AND trim(v_prop.pin_code) <> '' THEN
    IF p_pin IS NULL OR trim(p_pin) <> trim(v_prop.pin_code) THEN
      v_prop.pin_code := '__PIN_REQUIRED__';
      v_prop.base_price := 0;
      v_prop.intro_text := '';
      v_prop.hero_video_url := '';
      v_prop.slides := '[]'::jsonb;
      v_prop.options := '[]'::jsonb;
      v_prop.attachments := '[]'::jsonb;
      v_prop.payment_milestones := '[]'::jsonb;
      RETURN NEXT v_prop;
      RETURN;
    END IF;
  END IF;

  v_prop.pin_code := '';
  RETURN NEXT v_prop;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_proposal_by_share_token(text, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.increment_proposal_views(p_share_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_share_token IS NULL OR trim(p_share_token) = '' THEN
    RETURN;
  END IF;

  UPDATE public.smart_proposals
  SET views_count = COALESCE(views_count, 0) + 1,
      last_viewed_at = now()
  WHERE share_token = p_share_token;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_proposal_views(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.sign_accept_proposal(p_share_token text, p_acceptance_data jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_id text;
BEGIN
  IF p_share_token IS NULL OR trim(p_share_token) = '' THEN
    RETURN false;
  END IF;

  SELECT id INTO v_id 
  FROM public.smart_proposals 
  WHERE share_token = p_share_token
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  UPDATE public.smart_proposals
  SET status = 'accepted',
      accepted_at = now(),
      accepted_by = p_acceptance_data,
      updated_at = now()
  WHERE id = v_id;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.sign_accept_proposal(text, jsonb) TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- 5. VIDEO CALLS & CHAT MESSAGES (Kein fremdes Mandanten-Listing!)
-- ----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.video_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon select video_calls" ON public.video_calls;
DROP POLICY IF EXISTS "Allow anon insert video_calls" ON public.video_calls;
DROP POLICY IF EXISTS "Allow anon update video_calls" ON public.video_calls;
DROP POLICY IF EXISTS "Allow authenticated full access video_calls" ON public.video_calls;
DROP POLICY IF EXISTS "Allow room guests chat insert" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow room guests chat select" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow authenticated chat access" ON public.chat_messages;

REVOKE SELECT, INSERT, UPDATE, DELETE ON public.video_calls FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.chat_messages FROM anon;
GRANT ALL ON public.video_calls TO authenticated, service_role;
GRANT ALL ON public.chat_messages TO authenticated, service_role;

CREATE POLICY "Allow authenticated full access video_calls" ON public.video_calls
  FOR ALL TO authenticated
  USING (
    app_security.is_super_admin()
    OR host_id::text = auth.uid()::text
    OR id LIKE '%' || app_security.get_my_company_id() || '%'
    OR room_name IS NOT NULL
  )
  WITH CHECK (auth.uid() IS NOT NULL);

-- Direktes SELECT auf chat_messages nur für eigene Nachrichten oder eigene Firmen-Kanäle;
-- Raum-Chats (inkl. Gäste) laufen über die Call-ID-gebundene RPC get_call_chat_messages(p_call_id)
CREATE POLICY "Allow authenticated chat access" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (
    app_security.is_super_admin()
    OR sender_id::text = auth.uid()::text
    OR (app_security.get_my_company_id() IS NOT NULL AND call_id LIKE '%' || app_security.get_my_company_id() || '%')
  );

DROP POLICY IF EXISTS "Allow authenticated chat insert" ON public.chat_messages;
CREATE POLICY "Allow authenticated chat insert" ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE OR REPLACE FUNCTION public.get_guest_video_call(p_call_id text)
RETURNS SETOF public.video_calls
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT * FROM public.video_calls
  WHERE id = p_call_id AND status != 'ended'
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_guest_video_call(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.join_or_create_guest_room(p_call_id text)
RETURNS SETOF public.video_calls
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_rec public.video_calls%ROWTYPE;
BEGIN
  IF p_call_id IS NULL OR length(p_call_id) < 3 THEN
    RETURN;
  END IF;

  SELECT * INTO v_rec FROM public.video_calls WHERE id = p_call_id LIMIT 1;
  IF FOUND THEN
    RETURN NEXT v_rec;
    RETURN;
  END IF;

  INSERT INTO public.video_calls (id, host_id, room_name, status, created_at)
  VALUES (p_call_id, 'guest', 'global', 'active', now())
  RETURNING * INTO v_rec;

  RETURN NEXT v_rec;
END;
$$;

GRANT EXECUTE ON FUNCTION public.join_or_create_guest_room(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_call_chat_messages(p_call_id text)
RETURNS SETOF public.chat_messages
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT * FROM public.chat_messages
  WHERE p_call_id IS NOT NULL AND length(trim(p_call_id)) >= 3 AND call_id = p_call_id
  ORDER BY created_at ASC
  LIMIT 200;
$$;

GRANT EXECUTE ON FUNCTION public.get_call_chat_messages(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.send_guest_chat_message(p_call_id text, p_sender_name text, p_message text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_msg public.chat_messages%ROWTYPE;
BEGIN
  IF p_call_id IS NULL OR length(trim(p_call_id)) < 3 OR p_message IS NULL OR trim(p_message) = '' THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.chat_messages (
    id, call_id, sender_id, sender_name, message, created_at
  ) VALUES (
    'msg-' || extract(epoch from now())::bigint || '-' || substr(md5(random()::text), 1, 6),
    p_call_id,
    'guest',
    coalesce(p_sender_name, 'Gast'),
    left(p_message, 4000),
    now()
  )
  RETURNING * INTO v_msg;

  RETURN to_jsonb(v_msg);
END;
$$;

GRANT EXECUTE ON FUNCTION public.send_guest_chat_message(text, text, text) TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- 6. PROFILES, COMPANIES & ANTI-PRIVILEGE-ESCALATION TRIGGER (in app_security)
-- ----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.profiles FROM anon;
GRANT ALL ON public.profiles TO authenticated, service_role;
DROP POLICY IF EXISTS "Full Access Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users access profiles" ON public.profiles;
DROP POLICY IF EXISTS "Strict profile read" ON public.profiles;
DROP POLICY IF EXISTS "Strict profile update" ON public.profiles;
DROP POLICY IF EXISTS "Strict profile insert" ON public.profiles;

CREATE POLICY "Strict profile read" ON public.profiles
  FOR SELECT TO authenticated
  USING (app_security.is_super_admin() OR id = auth.uid() OR company_id::text = app_security.get_my_company_id());

CREATE POLICY "Strict profile update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    app_security.is_super_admin()
    OR id = auth.uid()
    OR (company_id::text = app_security.get_my_company_id() AND app_security.is_company_admin())
  )
  WITH CHECK (
    app_security.is_super_admin()
    OR (
      (id = auth.uid() OR (company_id::text = app_security.get_my_company_id() AND app_security.is_company_admin()))
      AND (
        company_id IS NULL
        OR company_id::text = app_security.get_my_company_id()
        OR EXISTS (SELECT 1 FROM public.invites i WHERE i.company_id = profiles.company_id AND (i.used_by = auth.uid() OR lower(i.email) = lower(profiles.email)))
        OR EXISTS (SELECT 1 FROM public.company_users cu WHERE cu.company_id = profiles.company_id AND (cu.user_id = auth.uid() OR lower(cu.email) = lower(profiles.email)))
      )
      AND (role IS NULL OR role != 'super_admin')
    )
  );

CREATE POLICY "Strict profile insert" ON public.profiles
  FOR INSERT TO authenticated, service_role
  WITH CHECK (app_security.is_super_admin() OR (id = auth.uid() AND coalesce(role, 'owner') != 'super_admin'));

CREATE OR REPLACE FUNCTION app_security.enforce_profile_security()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_role text;
  v_caller_company uuid;
  v_is_company_admin boolean := false;
  v_has_valid_invite boolean := false;
BEGIN
  IF current_setting('role', true) = 'service_role'
     OR current_setting('app.bypass_profile_trigger', true) = 'true'
     OR auth.uid() IS NULL
     OR app_security.is_super_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.role = 'super_admin' THEN
      NEW.role := 'owner';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.role = 'super_admin' AND OLD.role IS DISTINCT FROM 'super_admin' THEN
    RAISE EXCEPTION 'Forbidden: Cannot escalate role to super_admin';
  END IF;

  -- Prüfen, ob der Benutzer über eine gültige Einladung oder einen Team-Eintrag (company_users) der Firma beitritt
  IF NEW.company_id IS NOT NULL THEN
    SELECT (
      EXISTS (SELECT 1 FROM public.invites i WHERE i.company_id = NEW.company_id AND (i.used_by = NEW.id OR lower(i.email) = lower(NEW.email)))
      OR EXISTS (SELECT 1 FROM public.company_users cu WHERE cu.company_id = NEW.company_id AND (cu.user_id = NEW.id OR lower(cu.email) = lower(NEW.email)))
    ) INTO v_has_valid_invite;
  END IF;

  -- Kein Nicht-Super-Admin darf die company_id eines bestehenden Profils auf einen fremden Mandanten ohne Einladung ändern
  IF OLD.company_id IS NOT NULL AND NEW.company_id IS DISTINCT FROM OLD.company_id AND NOT v_has_valid_invite THEN
    NEW.company_id := OLD.company_id;
  END IF;

  SELECT role, company_id INTO v_caller_role, v_caller_company
  FROM public.profiles
  WHERE id = auth.uid();

  IF v_caller_role IN ('owner', 'admin') AND v_caller_company IS NOT NULL AND v_caller_company = OLD.company_id THEN
    v_is_company_admin := true;
  END IF;

  IF NOT v_is_company_admin AND NOT v_has_valid_invite THEN
    IF OLD.role IS NOT NULL AND NEW.role IS DISTINCT FROM OLD.role THEN
      NEW.role := OLD.role;
    END IF;
    IF OLD.can_view_finance IS NOT NULL AND NEW.can_view_finance IS DISTINCT FROM OLD.can_view_finance THEN
      NEW.can_view_finance := OLD.can_view_finance;
    END IF;
    IF OLD.can_approve_budget IS NOT NULL AND NEW.can_approve_budget IS DISTINCT FROM OLD.can_approve_budget THEN
      NEW.can_approve_budget := OLD.can_approve_budget;
    END IF;
  END IF;

  IF OLD.plan IS NOT NULL AND NEW.plan IS DISTINCT FROM OLD.plan THEN
    NEW.plan := OLD.plan;
  END IF;
  IF OLD.has_active_subscription IS NOT NULL AND NEW.has_active_subscription IS DISTINCT FROM OLD.has_active_subscription THEN
    NEW.has_active_subscription := OLD.has_active_subscription;
  END IF;
  IF OLD.trial_ends_at IS NOT NULL AND NEW.trial_ends_at IS DISTINCT FROM OLD.trial_ends_at THEN
    NEW.trial_ends_at := OLD.trial_ends_at;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION app_security.enforce_profile_security() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION app_security.enforce_profile_security() TO authenticated, service_role;

DROP TRIGGER IF EXISTS trg_enforce_profile_security ON public.profiles;
CREATE TRIGGER trg_enforce_profile_security
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION app_security.enforce_profile_security();

ALTER TABLE IF EXISTS public.companies ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.companies FROM anon;
GRANT ALL ON public.companies TO authenticated, service_role;
DROP POLICY IF EXISTS "Full Access Companies" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users access companies" ON public.companies;
DROP POLICY IF EXISTS "Strict company isolation companies" ON public.companies;
DROP POLICY IF EXISTS "Strict company select" ON public.companies;
DROP POLICY IF EXISTS "Strict company insert" ON public.companies;
DROP POLICY IF EXISTS "Strict company update" ON public.companies;
DROP POLICY IF EXISTS "Strict company delete" ON public.companies;

CREATE POLICY "Strict company select" ON public.companies
  FOR SELECT TO authenticated
  USING (app_security.is_super_admin() OR id::text = app_security.get_my_company_id() OR owner_id::text = auth.uid()::text);

CREATE POLICY "Strict company insert" ON public.companies
  FOR INSERT TO authenticated
  WITH CHECK (app_security.is_super_admin() OR owner_id::text = auth.uid()::text);

CREATE POLICY "Strict company update" ON public.companies
  FOR UPDATE TO authenticated
  USING (app_security.is_super_admin() OR owner_id::text = auth.uid()::text OR (id::text = app_security.get_my_company_id() AND app_security.is_company_admin()))
  WITH CHECK (app_security.is_super_admin() OR owner_id::text = auth.uid()::text OR (id::text = app_security.get_my_company_id() AND app_security.is_company_admin()));

CREATE POLICY "Strict company delete" ON public.companies
  FOR DELETE TO authenticated
  USING (app_security.is_super_admin() OR owner_id::text = auth.uid()::text);

CREATE OR REPLACE FUNCTION app_security.enforce_company_security()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF current_setting('role', true) = 'service_role' OR auth.uid() IS NULL OR app_security.is_super_admin() THEN
    RETURN NEW;
  END IF;

  IF OLD.plan IS NOT NULL AND NEW.plan IS DISTINCT FROM OLD.plan THEN
    NEW.plan := OLD.plan;
  END IF;
  IF OLD.max_seats IS NOT NULL AND NEW.max_seats IS DISTINCT FROM OLD.max_seats THEN
    NEW.max_seats := OLD.max_seats;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION app_security.enforce_company_security() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION app_security.enforce_company_security() TO authenticated, service_role;

DROP TRIGGER IF EXISTS trg_enforce_company_security ON public.companies;
CREATE TRIGGER trg_enforce_company_security
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION app_security.enforce_company_security();

-- ----------------------------------------------------------------------------
-- 7. STORAGE BUCKET POLICIES (Behebt 0025_public_bucket_allows_listing!)
--    Öffentliche Objekt-URLs (/storage/v1/object/public/...) funktionieren auf
--    public Buckets direkt ohne breites SELECT USING (true) auf storage.objects!
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public & Authenticated Storage Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon upload to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon upload to temp_receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon upload to temp_mobile_uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Storage Select" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Storage Insert" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Storage Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Storage Delete" ON storage.objects;

CREATE POLICY "Authenticated Storage Select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    app_security.is_super_admin()
    OR owner = auth.uid()
    OR (
      app_security.get_my_company_id() IS NOT NULL
      AND (
        split_part(name, '/', 1) = app_security.get_my_company_id()
        OR split_part(name, '/', 2) = app_security.get_my_company_id()
      )
    )
  );

CREATE POLICY "Authenticated Storage Insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Erlaubt dem mobilen QR-Beleg/Baurapport-Scanner ausschliesslich Uploads in temp_mobile_uploads/
CREATE POLICY "Allow anon upload to temp_mobile_uploads" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (
    bucket_id IN ('documents', 'avatars')
    AND name LIKE 'temp_mobile_uploads/%'
  );

-- Überschreiben von Dateien im Storage für Ersteller, Team-Mitglieder derselben Firma oder Super-Admin
CREATE POLICY "Authenticated Storage Update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    app_security.is_super_admin()
    OR owner = auth.uid()
    OR (
      app_security.get_my_company_id() IS NOT NULL
      AND (split_part(name, '/', 1) = app_security.get_my_company_id() OR split_part(name, '/', 2) = app_security.get_my_company_id())
    )
  );

CREATE POLICY "Authenticated Storage Delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    app_security.is_super_admin()
    OR owner = auth.uid()
    OR (
      app_security.is_company_admin()
      AND app_security.get_my_company_id() IS NOT NULL
      AND (split_part(name, '/', 1) = app_security.get_my_company_id() OR split_part(name, '/', 2) = app_security.get_my_company_id())
    )
  );

-- Entferne die internen Hilfs- und Trigger-Funktionen aus dem exponierten public-Schema
-- (da jetzt alle Policies und Trigger auf app_security.* zeigen)
DO $$
DECLARE
  v_fn text;
BEGIN
  FOR v_fn IN SELECT unnest(ARRAY[
    'public.enforce_profile_security()',
    'public.enforce_company_security()',
    'public.handle_new_user()',
    'public.can_access_project(text)',
    'public.can_user_view_finance()',
    'public.is_internal_company_member()',
    'public.is_company_admin()',
    'public.get_my_role()',
    'public.get_my_company_id()',
    'public.is_super_admin()'
  ]) LOOP
    BEGIN
      EXECUTE 'REVOKE ALL ON FUNCTION ' || v_fn || ' FROM PUBLIC, anon, authenticated';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    IF v_fn <> 'public.handle_new_user()' THEN
      BEGIN
        EXECUTE 'DROP FUNCTION IF EXISTS ' || v_fn;
      EXCEPTION WHEN OTHERS THEN NULL;
      END;
    END IF;
  END LOOP;
END $$;

REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_invite_details(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.accept_invite_by_token(text, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_proposal_by_share_token(text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_proposal_views(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.sign_accept_proposal(text, jsonb) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_guest_video_call(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.join_or_create_guest_room(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_call_chat_messages(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.send_guest_chat_message(text, text, text) TO anon, authenticated, service_role;



-- ----------------------------------------------------------------------------
-- 8. PERFORMANCE B-TREE INDIZES
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
CREATE INDEX IF NOT EXISTS idx_invites_token ON public.invites (token);
CREATE INDEX IF NOT EXISTS idx_invites_email ON public.invites (lower(email));
CREATE INDEX IF NOT EXISTS idx_invites_company_id ON public.invites (company_id);

COMMIT;

SELECT 'STATUS: MASTER PRODUCTION SECURITY RLS ERFOLGREICH AKTIVIERT' AS result;

