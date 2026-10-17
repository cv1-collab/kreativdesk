-- ============================================================================
-- KREATIV DESK OS V2.0 — GO-LIVE SECURITY, TRIGGER & RLS HARDENING SCRIPT
-- ============================================================================
-- Anleitung:
-- 1. Öffne das Supabase Dashboard -> SQL Editor -> "New query"
-- 2. Kopiere dieses gesamte Skript hinein und klicke auf "Run"
-- 3. Es erledigt automatisch in einem Durchlauf:
--    a) Aktualisierung des Auth-Triggers (14-Tage Pro-Trial, Einladungen & Gäste)
--    b) Aktivierung von Row Level Security (RLS) auf allen Kerntabellen
--    c) Sichere RPC-Funktionen für öffentliche Offerten-Annahme & View-Counter
--    d) Diagnose-Abfrage am Ende (zeigt dir sofort an, dass alle Tabellen geschützt sind)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TEIL 1: ROBUSTER AUTH-TRIGGER FÜR REGISTRIERUNG, TEAM-INVITES & EXTERNE GÄSTE
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

  v_inv_id UUID := NULL;
  v_inv_company_id UUID := NULL;
  v_inv_role TEXT := NULL;

  v_cu_id UUID := NULL;
  v_cu_company_id UUID := NULL;
  v_cu_role TEXT := NULL;

  target_company_id UUID := NULL;
  target_role TEXT := NULL;
  target_plan TEXT := NULL;
  company_owner_id UUID := NULL;

  inv_token TEXT;
BEGIN
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  company_name := split_part(NEW.email, '@', 1) || '''s Organization';
  inv_token := NEW.raw_user_meta_data->>'inviteToken';

  BEGIN
    -- 1. STUFE 1: Einladung per Token suchen (nur status = 'pending')
    IF inv_token IS NOT NULL AND inv_token != '' THEN
      SELECT id, company_id, role
      INTO v_inv_id, v_inv_company_id, v_inv_role
      FROM public.invites
      WHERE token = inv_token
        AND status = 'pending'
      ORDER BY created_at DESC
      LIMIT 1;
    END IF;

    -- 2. STUFE 2: Einladung per E-Mail suchen (falls per Token nicht gefunden)
    IF v_inv_id IS NULL AND NEW.email IS NOT NULL THEN
      SELECT id, company_id, role
      INTO v_inv_id, v_inv_company_id, v_inv_role
      FROM public.invites
      WHERE lower(email) = lower(NEW.email)
        AND status = 'pending'
      ORDER BY created_at DESC
      LIMIT 1;
    END IF;

    -- 3. STUFE 3: Vorregistrierter Kontakt in company_users (CRM) suchen
    IF NEW.email IS NOT NULL THEN
      SELECT id, company_id, role
      INTO v_cu_id, v_cu_company_id, v_cu_role
      FROM public.company_users
      WHERE lower(email) = lower(NEW.email)
        AND (v_inv_company_id IS NULL OR company_id = v_inv_company_id)
        AND company_id IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 1;
    END IF;

    -- A: NUTZER WURDE IN EIN BESTEHENDES UNTERNEHMEN EINGELADEN
    IF v_inv_id IS NOT NULL OR v_cu_id IS NOT NULL THEN
      IF v_inv_id IS NOT NULL THEN
        target_company_id := v_inv_company_id;
        target_role := COALESCE(v_inv_role, 'employee');
      ELSIF v_cu_id IS NOT NULL THEN
        target_company_id := v_cu_company_id;
        target_role := COALESCE(v_cu_role, 'employee');
      ELSE
        target_role := 'employee';
      END IF;

      SELECT plan, owner_id INTO target_plan, company_owner_id
      FROM public.companies
      WHERE id = target_company_id LIMIT 1;

      target_role := CASE
        WHEN lower(target_role) IN ('owner', 'admin', 'management', 'project_lead', 'employee', 'client', 'guest')
          THEN lower(target_role)
        WHEN lower(target_role) IN ('bauherr')
          THEN 'client'
        WHEN lower(target_role) IN ('external', 'partner', 'subcontractor', 'field guest', 'external planner', 'handwerker')
          THEN 'guest'
        ELSE 'employee'
      END;

      INSERT INTO public.profiles (id, email, name, role, company_id, has_active_subscription, plan)
      VALUES (
        NEW.id,
        NEW.email,
        user_full_name,
        target_role,
        target_company_id,
        true,
        COALESCE(target_plan, 'Pro')
      )
      ON CONFLICT (id) DO UPDATE
        SET company_id = EXCLUDED.company_id,
            role = EXCLUDED.role,
            plan = EXCLUDED.plan;

      IF v_inv_id IS NOT NULL THEN
        UPDATE public.invites
        SET status = 'used', used_by = NEW.id, email = NEW.email, used_at = now()
        WHERE id = v_inv_id;
      END IF;

      IF target_role = 'owner' AND company_owner_id IS NULL THEN
        UPDATE public.companies
        SET owner_id = NEW.id
        WHERE id = target_company_id AND owner_id IS NULL;
      END IF;

      -- Interne Lizenz-Plätze synchronisieren (externe Gäste zählen nicht als Seat)
      UPDATE public.companies
      SET used_seats = GREATEST(1, (
        SELECT count(DISTINCT lower(COALESCE(p.email, p.id::text)))
        FROM public.profiles p
        WHERE p.company_id = target_company_id
          AND lower(COALESCE(p.role, 'employee')) NOT IN ('guest', 'client', 'external', 'partner', 'subcontractor', 'field guest', 'external planner', 'bauherr', 'handwerker')
      ))
      WHERE id = target_company_id;

      IF v_cu_id IS NOT NULL THEN
        UPDATE public.company_users
        SET user_id = NEW.id,
            status = CASE WHEN target_role IN ('guest', 'client') THEN 'external' ELSE 'team' END,
            is_external = CASE WHEN target_role IN ('guest', 'client') THEN true ELSE false END,
            role = target_role
        WHERE id = v_cu_id;

        BEGIN
          UPDATE public.project_members
          SET user_id = NEW.id::text
          WHERE company_id = target_company_id
            AND user_id = v_cu_id::text;
        EXCEPTION WHEN OTHERS THEN
          NULL;
        END;
      ELSE
        INSERT INTO public.company_users (company_id, name, email, role, status, is_external, user_id)
        VALUES (
          target_company_id,
          user_full_name,
          NEW.email,
          target_role,
          CASE WHEN target_role IN ('guest', 'client') THEN 'external' ELSE 'team' END,
          CASE WHEN target_role IN ('guest', 'client') THEN true ELSE false END,
          NEW.id
        )
        ON CONFLICT DO NOTHING;
      END IF;

    -- B: STANDARD-NEUREGISTRIERUNG (EIGENE FIRMA MIT 14-TAGE PRO-TRIAL)
    ELSE
      INSERT INTO public.companies (name, plan, max_seats, used_seats, owner_id)
      VALUES (company_name, 'Pro', 1, 1, NEW.id)
      RETURNING id INTO new_company_id;

      INSERT INTO public.profiles (id, email, name, role, company_id, has_active_subscription, plan, trial_ends_at)
      VALUES (
        NEW.id,
        NEW.email,
        user_full_name,
        'owner',
        new_company_id,
        false,
        'Pro',
        now() + interval '14 days'
      )
      ON CONFLICT (id) DO UPDATE
        SET company_id = COALESCE(public.profiles.company_id, EXCLUDED.company_id),
            role = COALESCE(public.profiles.role, EXCLUDED.role),
            trial_ends_at = COALESCE(public.profiles.trial_ends_at, EXCLUDED.trial_ends_at);

      INSERT INTO public.company_users (company_id, name, email, role, status, user_id)
      VALUES (new_company_id, user_full_name, NEW.email, 'owner', 'Aktiv', NEW.id)
      ON CONFLICT DO NOTHING;
    END IF;

  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user error: %', SQLERRM;
    INSERT INTO public.profiles (id, email, name, role, has_active_subscription)
    VALUES (NEW.id, NEW.email, user_full_name, 'employee', false)
    ON CONFLICT (id) DO NOTHING;
  END;

  RETURN NEW;
END;
$$;

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
  NULL;
END $$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- ----------------------------------------------------------------------------
-- TEIL 2: RPC-FUNKTIONEN FÜR SMART PROPOSALS (DIGITALE FREIGABE & VIEW COUNTER)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_proposal_views(p_share_token TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_share_token IS NULL OR length(trim(p_share_token)) < 6 THEN
    RETURN;
  END IF;
  UPDATE public.smart_proposals
  SET views_count = COALESCE(views_count, 0) + 1,
      last_viewed_at = now()
  WHERE share_token = p_share_token;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_proposal_views(TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.sign_accept_proposal(
  p_share_token TEXT,
  p_acceptance_data JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_updated INTEGER := 0;
BEGIN
  IF p_share_token IS NULL OR length(trim(p_share_token)) < 6 THEN
    RETURN FALSE;
  END IF;

  UPDATE public.smart_proposals
  SET status = 'accepted',
      accepted_at = now(),
      accepted_by = p_acceptance_data,
      updated_at = now()
  WHERE share_token = p_share_token
    AND (status IS NULL OR status != 'accepted');

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION public.sign_accept_proposal(TEXT, JSONB) TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- TEIL 3: ROW LEVEL SECURITY (RLS) AUF ALLEN KERNTABELLEN SICHERSTELLEN
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  t TEXT;
  core_tables TEXT[] := ARRAY[
    'companies', 'profiles', 'company_users', 'projects', 'project_members',
    'project_tasks', 'project_schedules', 'documents', 'transactions',
    'time_entries', 'defects', 'leads', 'invites', 'notifications',
    'smart_proposals', 'cad_plans', 'slides', 'calendar_events',
    'company_settings', 'audio_notes', 'whiteboard_exports', 'audit_logs',
    'knowledge_docs', 'goals', 'api_keys', 'site_data', 'support_tickets', 'tasks'
  ];
BEGIN
  FOREACH t IN ARRAY core_tables LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    END IF;
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- TEIL 4: STATUS-CHECK (ZEIGT DIR DEN AKTUELLEN RLS-SCHUTZ ALLER TABELLEN)
-- ----------------------------------------------------------------------------
SELECT
  schemaname AS schema,
  tablename AS table_name,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
