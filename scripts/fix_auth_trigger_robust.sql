-- ============================================================================
-- ROBUST & TYPE-SAFE AUTH TRIGGER FOR USER REGISTRATION (MULTI-STAGE INVITE & OWNER SYNC)
-- ============================================================================
-- Anleitung:
-- 1. Öffne das Supabase Dashboard (https://supabase.com/dashboard)
-- 2. Wähle dein Projekt "Kreativ Desk"
-- 3. Gehe links auf "SQL Editor" -> "New query"
-- 4. Füge diesen Code ein und klicke auf "Run"
-- ============================================================================

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
  
  -- Typensichere skalare Variablen (Verhindert "record is not assigned yet" Abstürze!)
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
  meta_company_id TEXT;
BEGIN
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  company_name := split_part(NEW.email, '@', 1) || '''s Organization';
  inv_token := NEW.raw_user_meta_data->>'inviteToken';
  meta_company_id := NEW.raw_user_meta_data->>'companyId';

  BEGIN
    -- 1. STUFE 1: Einladung per Token suchen
    IF inv_token IS NOT NULL AND inv_token != '' THEN
      SELECT id, company_id, role 
      INTO v_inv_id, v_inv_company_id, v_inv_role 
      FROM public.invites 
      WHERE token = inv_token 
      ORDER BY created_at DESC 
      LIMIT 1;
    END IF;

    -- 2. STUFE 2: Einladung per E-Mail suchen (falls per Token nicht gefunden)
    IF v_inv_id IS NULL AND NEW.email IS NOT NULL THEN
      SELECT id, company_id, role 
      INTO v_inv_id, v_inv_company_id, v_inv_role 
      FROM public.invites 
      WHERE lower(email) = lower(NEW.email) 
      ORDER BY created_at DESC 
      LIMIT 1;
    END IF;

    -- 3. STUFE 3: Vorregistrierter Kontakt in company_users (CRM) suchen
    IF v_inv_id IS NULL AND NEW.email IS NOT NULL THEN
      SELECT id, company_id, role 
      INTO v_cu_id, v_cu_company_id, v_cu_role 
      FROM public.company_users 
      WHERE lower(email) = lower(NEW.email) 
        AND company_id IS NOT NULL 
      ORDER BY created_at DESC 
      LIMIT 1;
    END IF;

    -- 4. STUFE 4: Fallback auf metadata companyId
    IF v_inv_id IS NULL AND v_cu_id IS NULL AND meta_company_id IS NOT NULL AND meta_company_id != '' THEN
      BEGIN
        target_company_id := meta_company_id::uuid;
      EXCEPTION WHEN OTHERS THEN
        target_company_id := NULL;
      END;
    END IF;

    -- ========================================================================
    -- A: NUTZER WURDE IN EIN BESTEHENDES UNTERNEHMEN EINGELADEN
    -- ========================================================================
    IF v_inv_id IS NOT NULL OR v_cu_id IS NOT NULL OR target_company_id IS NOT NULL THEN
      IF v_inv_id IS NOT NULL THEN
        target_company_id := v_inv_company_id;
        target_role := COALESCE(v_inv_role, 'employee');
      ELSIF v_cu_id IS NOT NULL THEN
        target_company_id := v_cu_company_id;
        target_role := COALESCE(v_cu_role, 'employee');
      ELSE
        target_role := 'employee';
      END IF;

      -- Plan und aktuellen Owner des Zielunternehmens ermitteln
      SELECT plan, owner_id INTO target_plan, company_owner_id 
      FROM public.companies 
      WHERE id = target_company_id LIMIT 1;

      -- Normalisiere Rolle
      target_role := CASE 
        WHEN lower(target_role) IN ('owner', 'super_admin', 'management', 'project_lead', 'employee', 'client', 'guest') 
          THEN lower(target_role)
        ELSE 'employee'
      END;

      -- Profil erstellen/aktualisieren (gebunden an die Zielfirma!)
      INSERT INTO public.profiles (id, email, name, role, company_id, has_active_subscription, plan)
      VALUES (
        NEW.id,
        NEW.email,
        user_full_name,
        target_role,
        target_company_id,
        true,
        COALESCE(target_plan, 'Enterprise')
      )
      ON CONFLICT (id) DO UPDATE 
        SET company_id = EXCLUDED.company_id,
            role = EXCLUDED.role,
            plan = EXCLUDED.plan;

      -- Einladung als verwendet markieren (falls vorhanden)
      IF v_inv_id IS NOT NULL THEN
        UPDATE public.invites 
        SET status = 'used', used_by = NEW.id, email = NEW.email, used_at = now() 
        WHERE id = v_inv_id;
      END IF;

      -- WICHTIG: Wenn der Nutzer als Owner registriert wird (z. B. VIP Preprovisioning)
      -- oder die Firma noch keinen owner_id hat:
      IF target_role = 'owner' OR company_owner_id IS NULL THEN
        UPDATE public.companies 
        SET owner_id = NEW.id 
        WHERE id = target_company_id AND (owner_id IS NULL OR target_role = 'owner');
      END IF;

      -- Firmen-Lizenz-Zähler dynamisch und fehlerfrei synchronisieren:
      UPDATE public.companies 
      SET used_seats = GREATEST(1, (
        SELECT count(DISTINCT lower(COALESCE(p.email, p.id::text)))
        FROM public.profiles p
        WHERE p.company_id = target_company_id
      ))
      WHERE id = target_company_id;

      -- Eintrag in company_users aktualisieren oder anlegen
      IF v_cu_id IS NOT NULL THEN
        UPDATE public.company_users
        SET user_id = NEW.id,
            status = 'team',
            role = target_role
        WHERE id = v_cu_id;
      ELSE
        INSERT INTO public.company_users (company_id, name, email, role, status, user_id)
        VALUES (target_company_id, user_full_name, NEW.email, target_role, 'team', NEW.id)
        ON CONFLICT DO NOTHING;
      END IF;

    -- ========================================================================
    -- B: STANDARD-NEUREGISTRIERUNG: EIGENE FIRMA MIT EXAKT 1 LIZENZ!
    -- ========================================================================
    ELSE
      -- Firma anlegen mit max_seats = 1 (Standard Free Trial)
      INSERT INTO public.companies (name, plan, max_seats, used_seats, owner_id)
      VALUES (company_name, 'Free Trial', 1, 1, NEW.id)
      RETURNING id INTO new_company_id;

      -- Profil als Owner der neuen Firma anlegen
      INSERT INTO public.profiles (id, email, name, role, company_id, has_active_subscription, plan)
      VALUES (
        NEW.id,
        NEW.email,
        user_full_name,
        'owner',
        new_company_id,
        true,
        'Free Trial'
      )
      ON CONFLICT (id) DO UPDATE 
        SET company_id = COALESCE(public.profiles.company_id, EXCLUDED.company_id),
            role = COALESCE(public.profiles.role, EXCLUDED.role);

      -- Eintrag in company_users anlegen
      INSERT INTO public.company_users (company_id, name, email, role, status, user_id)
      VALUES (new_company_id, user_full_name, NEW.email, 'owner', 'Aktiv', NEW.id)
      ON CONFLICT DO NOTHING;
    END IF;

  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user error: %', SQLERRM;
    INSERT INTO public.profiles (id, email, name, role, has_active_subscription)
    VALUES (NEW.id, NEW.email, user_full_name, 'employee', true)
    ON CONFLICT (id) DO NOTHING;
  END;

  RETURN NEW;
END;
$$;

-- Trigger sicherstellen
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
