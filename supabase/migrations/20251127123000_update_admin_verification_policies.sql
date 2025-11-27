-- Allow authenticated users to add themselves to admin_users so they can gain admin capabilities
DO $$
BEGIN
  DROP POLICY IF EXISTS "Admin users can be inserted by admins" ON admin_users;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Admin users can insert themselves" ON admin_users;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Admin users can insert themselves"
  ON admin_users FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DO $$
BEGIN
  DROP POLICY IF EXISTS "Admin users are viewable by admins" ON admin_users;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Admin users are viewable by themselves" ON admin_users;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Admin users are viewable by themselves"
  ON admin_users FOR SELECT
  USING (auth.uid() = user_id);

DO $$
BEGIN
  DROP POLICY IF EXISTS "Admin users can be deleted by admins" ON admin_users;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Admin users can delete themselves" ON admin_users;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Admin users can delete themselves"
  ON admin_users FOR DELETE
  USING (auth.uid() = user_id);

-- Update verification select policy to rely on admin_users membership
DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins can view all verifications" ON public.verifications;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Admins can view all verifications"
  ON public.verifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
    )
  );

-- Update verification update policy similarly
DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins can update verifications" ON public.verifications;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Admins can update verifications"
  ON public.verifications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
    )
  );
