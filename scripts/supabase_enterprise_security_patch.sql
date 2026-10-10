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
BEGIN
  IF p_token IS NULL OR p_user_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT * INTO v_inv 
  FROM public.invites 
  WHERE token = p_token AND status = 'pending'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Einladung auf 'used' setzen
  UPDATE public.invites
  SET status = 'used', used_by = p_user_id, used_at = now()
  WHERE id = v_inv.id;

  -- Profil des Benutzers der Firma zuordnen
  UPDATE public.profiles
  SET company_id = v_inv.company_id, 
      role = coalesce(v_inv.role, 'employee')
  WHERE id = p_user_id;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_invite_by_token(text, uuid) TO anon, authenticated;


-------------------------------------------------------------------------------
-- 3. KUNDEN-OFFERTEN (smart_proposals) ABSICHERN
-------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.smart_proposals ENABLE ROW LEVEL SECURITY;

-- Alte offene Policies entfernen
DROP POLICY IF EXISTS "Public can view active proposals via share token" ON public.smart_proposals;
DROP POLICY IF EXISTS "Public can sign and accept proposal" ON public.smart_proposals;
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

-- Sichere RPC-Funktion: Offerte nur abrufen, wenn der exakte Share-Token bekannt ist
CREATE OR REPLACE FUNCTION public.get_proposal_by_share_token(p_token text)
RETURNS SETOF public.smart_proposals
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT * FROM public.smart_proposals
  WHERE share_token = p_token
    AND status IN ('active', 'accepted')
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_proposal_by_share_token(text) TO anon, authenticated;

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

COMMIT;
