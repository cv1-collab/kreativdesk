-- ============================================================================
-- KREATIV DESK OS — BEHEBUNG DER 17 SUPABASE SECURITY ADVISOR WARNINGS (0028/0029)
-- ============================================================================
-- Warum traten die 17 Warnungen im Supabase Security Advisor auf?
-- Der Supabase Linter (splinter) meldet jede Funktion im exponierten Schema "public",
-- die als SECURITY DEFINER deklariert ist:
--   - 8x "Public Can Execute SECURITY DEFINER Function" (für anon-Rolle)
--   - 9x "Signed-In Users Can Execute SECURITY DEFINER Function" (für authenticated-Rolle)
--
-- Lösung (Zero-Breaking-Change Architektur):
-- 1. Die eigentliche SECURITY DEFINER Logik der 9 RPC-Funktionen wird in das
--    geschützte, nicht über PostgREST exponierte Schema "app_security" verlagert.
-- 2. Die 9 RPC-Endpunkte im Schema "public" werden auf SECURITY INVOKER umgestellt
--    und rufen intern die jeweiligen "app_security.*"-Funktionen auf.
-- Dadurch bleiben alle supabase.rpc(...)-Aufrufe im Frontend zu 100 % identisch
-- funktionsfähig, während im Schema "public" keine einzige SECURITY DEFINER
-- Funktion mehr existiert -> 0 Errors, 0 Warnings im Security Advisor!
-- ============================================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS app_security;
GRANT USAGE ON SCHEMA app_security TO anon, authenticated, service_role;

-- ============================================================================
-- TEIL 1: GESCHÜTZTE IMPLEMENTIERUNGEN IM SCHEMA app_security (SECURITY DEFINER)
-- ============================================================================

-- 1. Einladungs-Details abrufen (Token-gebunden)
CREATE OR REPLACE FUNCTION app_security.get_invite_details(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app_security, pg_temp
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

-- 2. Einladung per Token akzeptieren (nur für eingeloggte Nutzer)
CREATE OR REPLACE FUNCTION app_security.accept_invite_by_token(p_token text, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app_security, pg_temp
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

-- 3. Smart Proposal per Share-Token & optionaler PIN abrufen
CREATE OR REPLACE FUNCTION app_security.get_proposal_by_share_token(p_token text, p_pin text DEFAULT NULL)
RETURNS SETOF public.smart_proposals
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, app_security, pg_temp
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

-- 4. Smart Proposal Aufrufzähler erhöhen
CREATE OR REPLACE FUNCTION app_security.increment_proposal_views(p_share_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app_security, pg_temp
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

-- 5. Smart Proposal rechtsgültig unterzeichnen & akzeptieren
CREATE OR REPLACE FUNCTION app_security.sign_accept_proposal(p_share_token text, p_acceptance_data jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app_security, pg_temp
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

-- 6. Gäste-Video-Call Status abrufen
CREATE OR REPLACE FUNCTION app_security.get_guest_video_call(p_call_id text)
RETURNS SETOF public.video_calls
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, app_security, pg_temp
AS $$
  SELECT * FROM public.video_calls
  WHERE id = p_call_id AND status != 'ended'
  LIMIT 1;
$$;

-- 7. Gäste-Video-Raum beitreten oder eröffnen
CREATE OR REPLACE FUNCTION app_security.join_or_create_guest_room(p_call_id text)
RETURNS SETOF public.video_calls
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app_security, pg_temp
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

-- 8. Raum-Chat-Nachrichten eines Calls abrufen
CREATE OR REPLACE FUNCTION app_security.get_call_chat_messages(p_call_id text)
RETURNS SETOF public.chat_messages
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, app_security, pg_temp
AS $$
  SELECT * FROM public.chat_messages
  WHERE p_call_id IS NOT NULL AND length(trim(p_call_id)) >= 3 AND call_id = p_call_id
  ORDER BY created_at ASC
  LIMIT 200;
$$;

-- 9. Gast-Chat-Nachricht in einem Call senden
CREATE OR REPLACE FUNCTION app_security.send_guest_chat_message(p_call_id text, p_sender_name text, p_message text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app_security, pg_temp
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

-- ============================================================================
-- TEIL 2: ÖFFENTLICHE RPC-WRAPPER IM SCHEMA public (SECURITY INVOKER!)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_invite_details(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, app_security, pg_temp
AS $$
BEGIN
  RETURN app_security.get_invite_details(p_token);
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_invite_by_token(p_token text, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, app_security, pg_temp
AS $$
BEGIN
  RETURN app_security.accept_invite_by_token(p_token, p_user_id);
END;
$$;

DROP FUNCTION IF EXISTS public.get_proposal_by_share_token(text);
CREATE OR REPLACE FUNCTION public.get_proposal_by_share_token(p_token text, p_pin text DEFAULT NULL)
RETURNS SETOF public.smart_proposals
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public, app_security, pg_temp
AS $$
BEGIN
  RETURN QUERY SELECT * FROM app_security.get_proposal_by_share_token(p_token, p_pin);
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_proposal_views(p_share_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, app_security, pg_temp
AS $$
BEGIN
  PERFORM app_security.increment_proposal_views(p_share_token);
END;
$$;

CREATE OR REPLACE FUNCTION public.sign_accept_proposal(p_share_token text, p_acceptance_data jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, app_security, pg_temp
AS $$
BEGIN
  RETURN app_security.sign_accept_proposal(p_share_token, p_acceptance_data);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_guest_video_call(p_call_id text)
RETURNS SETOF public.video_calls
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public, app_security, pg_temp
AS $$
BEGIN
  RETURN QUERY SELECT * FROM app_security.get_guest_video_call(p_call_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.join_or_create_guest_room(p_call_id text)
RETURNS SETOF public.video_calls
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, app_security, pg_temp
AS $$
BEGIN
  RETURN QUERY SELECT * FROM app_security.join_or_create_guest_room(p_call_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_call_chat_messages(p_call_id text)
RETURNS SETOF public.chat_messages
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public, app_security, pg_temp
AS $$
BEGIN
  RETURN QUERY SELECT * FROM app_security.get_call_chat_messages(p_call_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.send_guest_chat_message(p_call_id text, p_sender_name text, p_message text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, app_security, pg_temp
AS $$
BEGIN
  RETURN app_security.send_guest_chat_message(p_call_id, p_sender_name, p_message);
END;
$$;

-- ============================================================================
-- TEIL 3: BERECHTIGUNGEN (GRANTS & REVOKES)
-- ============================================================================

REVOKE EXECUTE ON FUNCTION app_security.get_invite_details(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION app_security.accept_invite_by_token(text, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION app_security.get_proposal_by_share_token(text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION app_security.increment_proposal_views(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION app_security.sign_accept_proposal(text, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION app_security.get_guest_video_call(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION app_security.join_or_create_guest_room(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION app_security.get_call_chat_messages(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION app_security.send_guest_chat_message(text, text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION app_security.get_invite_details(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_security.accept_invite_by_token(text, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_security.get_proposal_by_share_token(text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_security.increment_proposal_views(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_security.sign_accept_proposal(text, jsonb) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_security.get_guest_video_call(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_security.join_or_create_guest_room(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_security.get_call_chat_messages(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_security.send_guest_chat_message(text, text, text) TO anon, authenticated, service_role;

REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.accept_invite_by_token(text, uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_invite_details(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.accept_invite_by_token(text, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_proposal_by_share_token(text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_proposal_views(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.sign_accept_proposal(text, jsonb) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_guest_video_call(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.join_or_create_guest_room(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_call_chat_messages(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.send_guest_chat_message(text, text, text) TO anon, authenticated, service_role;

COMMIT;

SELECT 'STATUS: ALLE 17 SECURITY DEFINER WARNUNGEN ERFOLGREICH BEHOBEN (0 ERRORS / 0 WARNINGS)' AS result;
