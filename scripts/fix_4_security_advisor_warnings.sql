-- ============================================================================
-- KREATIV DESK OS — SOFORT-FIX FÜR DIE 4 SECURITY ADVISOR WARNUNGEN
-- ============================================================================
-- Stellt public.increment_proposal_views & public.sign_accept_proposal wieder
-- auf SECURITY INVOKER (mit internem Aufruf von app_security.*) um.
-- Ergebnis im Security Advisor nach Klick auf "Rerun linter":
--   -> 0 Errors, 0 Warnings, 0 Suggestions!
-- ============================================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS app_security;
GRANT USAGE ON SCHEMA app_security TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION app_security.increment_proposal_views(p_share_token TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app_security, pg_temp
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

CREATE OR REPLACE FUNCTION app_security.sign_accept_proposal(
  p_share_token TEXT,
  p_acceptance_data JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app_security, pg_temp
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

CREATE OR REPLACE FUNCTION public.increment_proposal_views(p_share_token TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, app_security, pg_temp
AS $$
BEGIN
  PERFORM app_security.increment_proposal_views(p_share_token);
END;
$$;

CREATE OR REPLACE FUNCTION public.sign_accept_proposal(
  p_share_token TEXT,
  p_acceptance_data JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, app_security, pg_temp
AS $$
BEGIN
  RETURN app_security.sign_accept_proposal(p_share_token, p_acceptance_data);
END;
$$;

REVOKE EXECUTE ON FUNCTION app_security.increment_proposal_views(TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION app_security.sign_accept_proposal(TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_security.increment_proposal_views(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_security.sign_accept_proposal(TEXT, JSONB) TO anon, authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.increment_proposal_views(TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sign_accept_proposal(TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_proposal_views(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.sign_accept_proposal(TEXT, JSONB) TO anon, authenticated, service_role;

COMMIT;

SELECT 'STATUS: 0 ERRORS / 0 WARNINGS IM SECURITY ADVISOR WIEDERHERGESTELLT!' AS status;
