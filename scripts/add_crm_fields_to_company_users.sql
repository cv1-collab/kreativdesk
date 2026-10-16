-- ============================================================================
-- MIGRATION: ADD CRM & PERMISSION FIELDS TO PUBLIC.COMPANY_USERS
-- Führt alle notwendigen Spalten für Kontakte, CRM & Team-Berechtigungen ein,
-- inklusive echter SQL-Spalten für __CRM_META__-Felder (department, hourly_rate,
-- trade, job_title, workload, project_roles, documents etc.) sowie automatischer
-- Daten-Migration aus bestehenden __CRM_META__-Notizen.
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
ADD COLUMN IF NOT EXISTS can_approve_budget boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS hourly_rate numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS trade text,
ADD COLUMN IF NOT EXISTS job_title text,
ADD COLUMN IF NOT EXISTS workload text DEFAULT '100%',
ADD COLUMN IF NOT EXISTS initials text,
ADD COLUMN IF NOT EXISTS partner_category text,
ADD COLUMN IF NOT EXISTS contact_person_role text,
ADD COLUMN IF NOT EXISTS payment_terms text DEFAULT '30 Tage netto',
ADD COLUMN IF NOT EXISTS project_id uuid,
ADD COLUMN IF NOT EXISTS project_roles jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS assigned_projects jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS documents jsonb DEFAULT '[]'::jsonb;

-- Automatische Backfill-Migration aus bestehenden __CRM_META__ JSON-Blöcken in notes
DO $$
DECLARE
  rec RECORD;
  raw_json text;
  meta jsonb;
BEGIN
  FOR rec IN
    SELECT id, notes
    FROM public.company_users
    WHERE notes IS NOT NULL AND position('__CRM_META__:' in notes) > 0
  LOOP
    BEGIN
      raw_json := split_part(rec.notes, '__CRM_META__:', 2);
      meta := raw_json::jsonb;

      UPDATE public.company_users
      SET
        department = COALESCE(NULLIF(department, ''), meta->>'department'),
        hourly_rate = CASE
          WHEN (hourly_rate IS NULL OR hourly_rate = 0) AND (meta->>'hourlyRate') ~ '^[0-9]+(\.[0-9]+)?$'
          THEN (meta->>'hourlyRate')::numeric
          ELSE hourly_rate
        END,
        trade = COALESCE(NULLIF(trade, ''), meta->>'trade'),
        job_title = COALESCE(NULLIF(job_title, ''), meta->>'jobTitle'),
        workload = COALESCE(NULLIF(workload, ''), meta->>'workload', '100%'),
        initials = COALESCE(NULLIF(initials, ''), meta->>'initials'),
        partner_category = COALESCE(NULLIF(partner_category, ''), meta->>'partnerCategory'),
        contact_person_role = COALESCE(NULLIF(contact_person_role, ''), meta->>'contactPersonRole'),
        payment_terms = COALESCE(NULLIF(payment_terms, ''), meta->>'paymentTerms', '30 Tage netto'),
        project_roles = CASE
          WHEN (project_roles IS NULL OR project_roles = '{}'::jsonb) AND jsonb_typeof(meta->'projectRoles') = 'object'
          THEN meta->'projectRoles'
          ELSE project_roles
        END,
        assigned_projects = CASE
          WHEN (assigned_projects IS NULL OR assigned_projects = '[]'::jsonb) AND jsonb_typeof(meta->'assignedProjects') = 'array'
          THEN meta->'assignedProjects'
          ELSE assigned_projects
        END,
        documents = CASE
          WHEN (documents IS NULL OR documents = '[]'::jsonb) AND jsonb_typeof(meta->'documents') = 'array'
          THEN meta->'documents'
          ELSE documents
        END
      WHERE id = rec.id;
    EXCEPTION WHEN OTHERS THEN
      -- Ungültiges JSON in einzelnen Zeilen überspringen, ohne die Migration abzubrechen
      CONTINUE;
    END;
  END LOOP;
END $$;

-- Kommentar zur Tabelle
COMMENT ON TABLE public.company_users IS 'Kontakte, CRM-Einträge und Workspace-Teammitglieder inkl. nativer CRM-Metadaten-Spalten';

-- Indizes für schnelle Suche & Filterung nach E-Mail, Firma, Status, Abteilung und Gewerk
CREATE INDEX IF NOT EXISTS idx_company_users_email ON public.company_users(email);
CREATE INDEX IF NOT EXISTS idx_company_users_company ON public.company_users(company);
CREATE INDEX IF NOT EXISTS idx_company_users_status ON public.company_users(status);
CREATE INDEX IF NOT EXISTS idx_company_users_department ON public.company_users(department);
CREATE INDEX IF NOT EXISTS idx_company_users_trade ON public.company_users(trade);
