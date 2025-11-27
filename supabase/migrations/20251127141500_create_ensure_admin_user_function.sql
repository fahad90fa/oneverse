DROP FUNCTION IF EXISTS public.ensure_admin_user();

CREATE OR REPLACE FUNCTION public.ensure_admin_user()
RETURNS admin_users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  claims jsonb := auth.jwt();
  current_email text;
  current_full_name text;
  inserted_row admin_users;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  current_email := COALESCE(claims->>'email', '');
  current_full_name := COALESCE(
    claims#>>'{user_metadata,full_name}',
    claims#>>'{app_metadata,full_name}',
    current_email
  );

  INSERT INTO admin_users (user_id, email, full_name)
  VALUES (current_user_id, current_email, current_full_name)
  ON CONFLICT (user_id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = now()
  RETURNING * INTO inserted_row;

  RETURN inserted_row;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_admin_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_admin_user() TO authenticated;
