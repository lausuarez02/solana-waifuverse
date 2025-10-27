-- Allow uploads to waifus bucket
-- Run this in Supabase SQL Editor

-- Allow anyone to upload (INSERT)
CREATE POLICY "Allow uploads to waifus bucket"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'waifus');

-- Allow anyone to read (SELECT) - already should be public
CREATE POLICY "Allow public read access to waifus bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'waifus');

-- Allow updates/deletes (optional, for admin management)
CREATE POLICY "Allow updates to waifus bucket"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'waifus');

CREATE POLICY "Allow deletes from waifus bucket"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'waifus');
