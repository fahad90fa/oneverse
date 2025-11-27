insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do update set
  name = excluded.name,
  public = true;

-- Allow anyone (including anon) to read objects in the documents bucket
DO $$
BEGIN
  CREATE POLICY documents_public_read
    ON storage.objects FOR SELECT
    USING (bucket_id = 'documents');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Allow authenticated users to upload to the documents bucket
DO $$
BEGIN
  CREATE POLICY documents_authenticated_insert
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'documents' AND auth.uid() = owner);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Allow owners to update their own files
DO $$
BEGIN
  CREATE POLICY documents_owner_update
    ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'documents' AND auth.uid() = owner)
    WITH CHECK (bucket_id = 'documents' AND auth.uid() = owner);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Allow owners to delete their own files
DO $$
BEGIN
  CREATE POLICY documents_owner_delete
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'documents' AND auth.uid() = owner);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
