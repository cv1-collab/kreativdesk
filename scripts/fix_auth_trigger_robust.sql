-- ============================================================================
-- ROBUST AUTH TRIGGER FOR USER REGISTRATION (CRASH-PROOF & FOREIGN-KEY SAFE)
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
  inv_record RECORD;
  target_company_id UUID;
  target_role TEXT;
  inv_token TEXT;
BEGIN
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  company_name := split_part(NEW.email, '@', 1) || '''s Organization';
  inv_token := NEW.raw_user_meta_data->>'inviteToken';

  BEGIN
    -- 1. Prüfen ob eine Einladung vorliegt (per Token oder per E-Mail)
    IF inv_token IS NOT NULL AND inv_token != '' THEN
      SELECT * INTO inv_record FROM public.invites WHERE token = inv_token AND status = 'pending' LIMIT 1;
    ELSE
      SELECT * INTO inv_record FROM public.invites WHERE lower(email) = lower(NEW.email) AND status = 'pending' LIMIT 1;
    END IF;

    IF inv_record.id IS NOT NULL THEN
      target_company_id := inv_record.company_id::uuid;
      -- Normalisiere Rolle (z. B. 'Internal' -> 'employee')
      target_role := CASE 
        WHEN lower(COALESCE(inv_record.role, '')) IN ('owner', 'super_admin', 'management', 'employee', 'client', 'guest') 
          THEN lower(inv_record.role)
        ELSE 'employee'
      END;

      -- WICHTIG: Zuerst Profil anlegen, damit profiles(id = NEW.id) existiert!
      INSERT INTO public.profiles (id, email, name, role, company_id, has_active_subscription, plan)
      VALUES (
        NEW.id,
        NEW.email,
        user_full_name,
        target_role,
        target_company_id,
        true,
        'Enterprise'
      )
      ON CONFLICT (id) DO UPDATE 
        SET company_id = EXCLUDED.company_id,
            role = EXCLUDED.role;

      -- Jetzt erst Einladung als verwendet markieren (FK invites_used_by_fkey ist nun erfüllt)
      UPDATE public.invites 
      SET status = 'used', used_by = NEW.id, email = NEW.email, used_at = now() 
      WHERE id = inv_record.id;

      -- Firmen-Lizenz-Zähler aktualisieren
      UPDATE public.companies 
      SET used_seats = COALESCE(used_seats, 1) + 1 
      WHERE id = target_company_id;

      -- Eintrag in company_users anlegen/aktualisieren
      INSERT INTO public.company_users (company_id, name, email, role, status, user_id)
      VALUES (target_company_id, user_full_name, NEW.email, target_role, 'Aktiv', NEW.id)
      ON CONFLICT DO NOTHING;

    ELSE
      -- Standard: Neuer Firmeninhaber
      INSERT INTO public.companies (name, plan, max_seats, used_seats, owner_id)
      VALUES (company_name, 'Free Trial', 5, 1, NULL)
      RETURNING id INTO new_company_id;

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

      UPDATE public.companies
      SET owner_id = NEW.id
      WHERE id = new_company_id;

      INSERT INTO public.company_users (company_id, name, email, role, status, user_id)
      VALUES (new_company_id, user_full_name, NEW.email, 'owner', 'Aktiv', NEW.id)
      ON CONFLICT DO NOTHING;
    END IF;

  EXCEPTION WHEN OTHERS THEN
    -- Fallback: Selbst wenn etwas Unvorhergesehenes schiefgeht, darf die Registrierung NIEMALS abbrechen
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
END $$;
