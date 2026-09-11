-- ============================================================================
-- QUICK FIX: AUTH TRIGGER & USER REGISTRATION (FOREIGN KEY SAFE)
-- ============================================================================
-- Dieses Skript im Supabase Dashboard unter "SQL Editor" ausführen.
-- Es behebt den Foreign-Key-Fehler 'companies_owner_id_fkey' bei Neuregistrierungen.
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
  inv_record RECORD;
  target_company_id UUID;
  target_role TEXT;
  inv_token TEXT;
BEGIN
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  company_name := split_part(NEW.email, '@', 1) || '''s Organization';
  inv_token := NEW.raw_user_meta_data->>'inviteToken';

  -- 1. Prüfen ob eine Einladung vorliegt (per Token oder per E-Mail)
  IF inv_token IS NOT NULL AND inv_token != '' THEN
    SELECT * INTO inv_record FROM public.invites WHERE token = inv_token AND status = 'pending' LIMIT 1;
  ELSE
    SELECT * INTO inv_record FROM public.invites WHERE lower(email) = lower(NEW.email) AND status = 'pending' LIMIT 1;
  END IF;

  IF inv_record.id IS NOT NULL THEN
    target_company_id := inv_record.company_id::uuid;
    target_role := COALESCE(inv_record.role, 'employee');

    -- Einladung als verwendet markieren
    UPDATE public.invites 
    SET status = 'used', used_by = NEW.id, email = NEW.email, used_at = now() 
    WHERE id = inv_record.id;

    -- Firmen-Lizenz-Zähler aktualisieren
    UPDATE public.companies 
    SET used_seats = COALESCE(used_seats, 1) + 1 
    WHERE id = target_company_id;

    -- Profil direkt mit der einladenden Firma anlegen
    INSERT INTO public.profiles (id, email, name, role, company_id, has_active_subscription)
    VALUES (
      NEW.id,
      NEW.email,
      user_full_name,
      target_role,
      target_company_id,
      true
    )
    ON CONFLICT (id) DO UPDATE 
      SET company_id = EXCLUDED.company_id,
          role = EXCLUDED.role;

    -- Eintrag in company_users anlegen
    INSERT INTO public.company_users (company_id, name, email, role, status)
    VALUES (target_company_id, user_full_name, NEW.email, target_role, 'Aktiv')
    ON CONFLICT DO NOTHING;

  ELSE
    -- Standard: Neuer Firmeninhaber
    -- 1. Zuerst Firma anlegen mit owner_id = NULL, um den Foreign-Key-Constraint companies_owner_id_fkey auf profiles(id) zu wahren
    INSERT INTO public.companies (name, plan, max_seats, used_seats, owner_id)
    VALUES (company_name, 'Free Trial', 1, 1, NULL)
    RETURNING id INTO new_company_id;

    -- 2. Profil erstellen, das auf die soeben erstellte Firma verweist
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

    -- 3. owner_id der Firma nachträglich auf NEW.id setzen (nun existiert profiles(id))
    UPDATE public.companies
    SET owner_id = NEW.id
    WHERE id = new_company_id;

    -- 4. Eintrag in company_users anlegen
    INSERT INTO public.company_users (company_id, name, email, role, status)
    VALUES (new_company_id, user_full_name, NEW.email, 'owner', 'Aktiv')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger an auth.users binden (falls noch nicht vorhanden)
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

-- REST-API-Sicherheit: Verhindert manuellen RPC-Aufruf von handle_new_user()
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
