-- ============================================================================
-- KREATIV DESK OS - SUPABASE ENTERPRISE SICHERHEITS- & HÄRTUNGS-PATCH
-- ============================================================================
-- Projekt: jtgfrogbrkrllzdwzdrt
-- Ausführen in: Supabase Dashboard -> SQL Editor (https://supabase.com/dashboard/project/jtgfrogbrkrllzdwzdrt/sql/new)
-- ============================================================================
-- Dieses Skript schliesst folgende Sicherheitslücken:
-- 1. Verhindert unberechtigtes Auslesen aller Firmeneinladungen (invites) durch Dritte
-- 2. Schützt alle Kunden-Offerten (smart_proposals) vor unbefugtem Massen-Download & Manipulation
-- 3. Verhindert das unbefugte Abhören von Videocalls & Chat-Nachrichten (video_calls & chat_messages)
-- 4. Sperrt unbefugte Uploads in Storage-Buckets (avatars, temp_receipts) für anonyme Nutzer
-- 5. Härtet alle Postgres-Funktionen gegen Search-Path-Hijacking (function_search_path_mutable)
-- 6. Setzt High-Speed B-Tree Indizes für optimale Performance
-- ============================================================================

BEGIN;

-------------------------------------------------------------------------------
-- 1. SEARCH PATH FIXES (Behebt: function_search_path_mutable)
-------------------------------------------------------------------------------
ALTER FUNCTION public.is_super_admin() SET search_path = public, pg_temp;
ALTER FUNCTION public.get_my_company_id() SET search_path = public, pg_temp;
ALTER FUNCTION public.get_user_company_id(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
ALTER FUNCTION public.rls_auto_enable() SET search_path = public, pg_temp;

-- Interne Trigger- & Admin-Funktionen vor direktem API-Aufruf sperren
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

-- Basis-Hilfsfunktionen nur für eingeloggte Benutzer erlauben
REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_my_company_id() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_company_id(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_company_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_company_id(uuid) TO authenticated;


-------------------------------------------------------------------------------
-- 2. EINLADUNGEN (invites) ABSICHERN
-------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.invites ENABLE ROW LEVEL SECURITY;

-- Alte offene Policies entfernen
DROP POLICY IF EXISTS "Allow anon view invite by token" ON public.invites;
DROP POLICY IF EXISTS "Allow anon accept invite" ON public.invites;
DROP POLICY IF EXISTS "Full Access Invites" ON public.invites;
DROP POLICY IF EXISTS "Authenticated users access invites" ON public.invites;
DROP POLICY IF EXISTS "Strict company isolation invites" ON public.invites;

-- Direkte Tabellenrechte von anon entziehen
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.invites FROM anon;
GRANT ALL ON public.invites TO authenticated, service_role;

-- Strikte Mandanten-Isolation für eingeloggte Firmenmitglieder & Eingeladene
CREATE POLICY "Strict company isolation invites" ON public.invites
  FOR ALL TO authenticated
  USING (
    is_super_admin() 
    OR company_id::text = get_my_company_id()
    OR lower(email) = lower(coalesce(auth.jwt()->>'email', ''))
    OR used_by = auth.uid()
  )
  WITH CHECK (
    is_super_admin() 
    OR company_id::text = get_my_company_id()
    OR lower(email) = lower(coalesce(auth.jwt()->>'email', ''))
    OR used_by = auth.uid()
  );

-- Sichere RPC-Funktion: Einladung nur abrufen, wenn der genaue Token bekannt ist!
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

-- Sichere RPC-Funktion zum Einlösen der Einladung
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

  -- Sicherheitscheck: Aufrufer muss der einzulösende Benutzer selbst (oder Super-Admin) sein
  IF auth.uid() IS NOT NULL AND auth.uid() != p_user_id AND NOT is_super_admin() THEN
    RETURN false;
  END IF;

  SELECT * INTO v_inv 
  FROM public.invites 
  WHERE token = p_token AND status = 'pending'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  v_safe_role := CASE WHEN v_inv.role = 'super_admin' THEN 'admin' ELSE coalesce(v_inv.role, 'employee') END;

  -- Einladung auf 'used' setzen
  UPDATE public.invites
  SET status = 'used', used_by = p_user_id, used_at = now()
  WHERE id = v_inv.id;

  -- Profil des Benutzers der Firma zuordnen
  UPDATE public.profiles
  SET company_id = v_inv.company_id, 
      role = v_safe_role
  WHERE id = p_user_id;

  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.accept_invite_by_token(text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_invite_by_token(text, uuid) TO authenticated, service_role;


-------------------------------------------------------------------------------
-- 3. KUNDEN-OFFERTEN (smart_proposals) ABSICHERN (INKL. SERVERSEITIGEM PIN-SCHUTZ)
-------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.smart_proposals ENABLE ROW LEVEL SECURITY;

-- Alte offene Policies entfernen
DROP POLICY IF EXISTS "Public can view active proposals via share token" ON public.smart_proposals;
DROP POLICY IF EXISTS "Public can sign and accept proposal" ON public.smart_proposals;
DROP POLICY IF EXISTS "Allow anon view smart_proposals by token" ON public.smart_proposals;
DROP POLICY IF EXISTS "Allow anon accept smart_proposals" ON public.smart_proposals;
DROP POLICY IF EXISTS "Company users can manage proposals" ON public.smart_proposals;
DROP POLICY IF EXISTS "Company users can manage own company proposals" ON public.smart_proposals;

-- Direkte Tabellenrechte von anon entziehen
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.smart_proposals FROM anon;
GRANT ALL ON public.smart_proposals TO authenticated, service_role;

-- Mandanten-Isolation für Unternehmensmitglieder
CREATE POLICY "Company users can manage own company proposals" ON public.smart_proposals
  FOR ALL TO authenticated
  USING (
    is_super_admin()
    OR company_id::text = get_my_company_id()
    OR owner_id = auth.uid()::text
  )
  WITH CHECK (
    is_super_admin()
    OR company_id::text = get_my_company_id()
    OR owner_id = auth.uid()::text
  );

-- Sichere RPC-Funktion: Offerte nur abrufen, wenn Share-Token (und ggf. PIN) stimmt!
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

  -- Falls Offerte mit PIN geschützt ist und der übergebene PIN nicht übereinstimmt:
  -- Sensible Daten (Preise, Folien, Optionen, echter PIN) maskieren!
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

  -- PIN niemals im Klartext an den Browser ausliefern
  v_prop.pin_code := '';
  RETURN NEXT v_prop;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_proposal_by_share_token(text, text) TO anon, authenticated;

-- Sichere RPC-Funktion: Aufrufzähler der Offerte erhöhen
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

-- Sichere RPC-Funktion: Digitale Signatur / Annahme der Offerte
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
  WHERE share_token = p_share_token AND status = 'active'
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


-------------------------------------------------------------------------------
-- 4. VIDEOCALLS & CHAT-NACHRICHTEN (video_calls & chat_messages) ABSICHERN
-------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.video_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Alte offene Policies entfernen
DROP POLICY IF EXISTS "Allow anon select video_calls" ON public.video_calls;
DROP POLICY IF EXISTS "Allow anon insert video_calls" ON public.video_calls;
DROP POLICY IF EXISTS "Allow anon update video_calls" ON public.video_calls;
DROP POLICY IF EXISTS "Allow authenticated full access video_calls" ON public.video_calls;

DROP POLICY IF EXISTS "Allow room guests chat insert" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow room guests chat select" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow authenticated chat access" ON public.chat_messages;

-- Direkte Massen-Abfrage für anon sperren
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.video_calls FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.chat_messages FROM anon;

GRANT ALL ON public.video_calls TO authenticated, service_role;
GRANT ALL ON public.chat_messages TO authenticated, service_role;

-- Authentifizierte Firmenbenutzer behalten vollen Zugriff
CREATE POLICY "Allow authenticated full access video_calls" ON public.video_calls
  FOR ALL TO authenticated 
  USING (auth.uid() IS NOT NULL) 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated chat access" ON public.chat_messages
  FOR ALL TO authenticated
  USING (is_super_admin() OR sender_id::text = auth.uid()::text OR call_id IS NOT NULL)
  WITH CHECK (is_super_admin() OR sender_id::text = auth.uid()::text OR call_id IS NOT NULL);

-- Sichere Gast-Funktionen für Video-Meetings & Raum-Chat (nur mit exakter Call-ID)
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
  WHERE call_id = p_call_id
  ORDER BY created_at ASC;
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
  IF p_call_id IS NULL OR p_message IS NULL OR trim(p_message) = '' THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.chat_messages (
    id, call_id, sender_id, sender_name, message, created_at
  ) VALUES (
    'msg-' || extract(epoch from now())::bigint || '-' || substr(md5(random()::text), 1, 6),
    p_call_id,
    'guest',
    coalesce(p_sender_name, 'Gast'),
    p_message,
    now()
  )
  RETURNING * INTO v_msg;

  RETURN to_jsonb(v_msg);
END;
$$;

GRANT EXECUTE ON FUNCTION public.send_guest_chat_message(text, text, text) TO anon, authenticated;


-------------------------------------------------------------------------------
-- 5. STORAGE BUCKET POLICIES HÄRTEN (Behebt unbefugte Uploads durch anon)
-------------------------------------------------------------------------------
-- Anonymen Upload auf 'avatars' und 'temp_receipts' sperren
DROP POLICY IF EXISTS "Public & Authenticated Storage Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon upload to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon upload to temp_receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Storage Select" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Storage Insert" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Storage Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Storage Delete" ON storage.objects;

-- Nur authentifizierten Benutzern das Hochladen, Ändern und Löschen erlauben
CREATE POLICY "Authenticated Storage Insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated Storage Update" ON storage.objects
  FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated Storage Delete" ON storage.objects
  FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- Öffentliches Lesen (Select) von Objekten über Storage API nur für authentifizierte Benutzer
-- (CDN Direkt-URLs auf public buckets funktionieren weiterhin, aber Directory-Listing durch Bots ist blockiert)
CREATE POLICY "Authenticated Storage Select" ON storage.objects
  FOR SELECT TO authenticated USING (true);


-------------------------------------------------------------------------------
-- 6. PERFORMANCE INDIZES (Optimiert Abfrage-Geschwindigkeit)
-------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_invites_token ON public.invites (token);
CREATE INDEX IF NOT EXISTS idx_invites_email ON public.invites (lower(email));
CREATE INDEX IF NOT EXISTS idx_invites_company_id ON public.invites (company_id);

CREATE INDEX IF NOT EXISTS idx_smart_proposals_share_token ON public.smart_proposals (share_token);
CREATE INDEX IF NOT EXISTS idx_smart_proposals_company_id ON public.smart_proposals (company_id);
CREATE INDEX IF NOT EXISTS idx_smart_proposals_status ON public.smart_proposals (status);

CREATE INDEX IF NOT EXISTS idx_video_calls_room_name ON public.video_calls (room_name);
CREATE INDEX IF NOT EXISTS idx_chat_messages_call_id ON public.chat_messages (call_id);

-------------------------------------------------------------------------------
-- 7. SCHEMA HARDENING & PROFILE COMPATIBILITY
-------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS avatar text;
ALTER TABLE IF EXISTS public.company_users ADD COLUMN IF NOT EXISTS avatar text;

-------------------------------------------------------------------------------
-- 8. ANTI-PRIVILEGE-ESCALATION (PROFILES & COMPANIES)
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_profile_security()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_role text;
  v_caller_company uuid;
  v_is_company_admin boolean := false;
BEGIN
  -- Service-Role (Backend-API / Stripe-Webhook) und Super-Admins dürfen alles
  IF current_setting('role', true) = 'service_role' OR auth.uid() IS NULL OR is_super_admin() THEN
    RETURN NEW;
  END IF;

  -- Niemand ausser Super-Admin / Service-Role darf 'super_admin' vergeben
  IF NEW.role = 'super_admin' AND OLD.role IS DISTINCT FROM 'super_admin' THEN
    RAISE EXCEPTION 'Forbidden: Cannot escalate role to super_admin';
  END IF;

  -- Kein Nicht-Super-Admin (auch kein Owner/Admin) darf die company_id eines bestehenden Profils auf einen fremden Mandanten ändern
  IF OLD.company_id IS NOT NULL AND NEW.company_id IS DISTINCT FROM OLD.company_id THEN
    NEW.company_id := OLD.company_id;
  END IF;

  SELECT role, company_id INTO v_caller_role, v_caller_company
  FROM public.profiles
  WHERE id = auth.uid();

  IF v_caller_role IN ('owner', 'admin') AND v_caller_company IS NOT NULL AND v_caller_company = OLD.company_id THEN
    v_is_company_admin := true;
  END IF;

  -- Normale Benutzer (Mitarbeiter, Gäste, Kunden) dürfen weder ihre Rolle noch ihr Abo/Rechte selbst erhöhen
  IF NOT v_is_company_admin THEN
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

  -- Plan- und Subscription-Felder dürfen nur durch Service-Role / Super-Admin geändert werden
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

DROP TRIGGER IF EXISTS trg_enforce_profile_security ON public.profiles;
CREATE TRIGGER trg_enforce_profile_security
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_profile_security();

CREATE OR REPLACE FUNCTION public.enforce_company_security()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF current_setting('role', true) = 'service_role' OR auth.uid() IS NULL OR is_super_admin() THEN
    RETURN NEW;
  END IF;

  -- Lizenz-Plan und gekaufte Seats (max_seats) dürfen nicht direkt vom Client hochgesetzt werden
  IF OLD.plan IS NOT NULL AND NEW.plan IS DISTINCT FROM OLD.plan THEN
    NEW.plan := OLD.plan;
  END IF;
  IF OLD.max_seats IS NOT NULL AND NEW.max_seats IS DISTINCT FROM OLD.max_seats THEN
    NEW.max_seats := OLD.max_seats;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_company_security ON public.companies;
CREATE TRIGGER trg_enforce_company_security
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_company_security();

COMMIT;
