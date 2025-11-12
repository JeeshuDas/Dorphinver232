-- =====================================================
-- DISABLE RLS ON STORAGE BUCKETS
-- =====================================================
-- Since we're using the service role key for uploads in the backend,
-- and all access is controlled through the backend API with authentication,
-- we can safely disable RLS on storage buckets to simplify the setup.

-- The backend will handle all authorization logic.

-- This is a simpler approach than managing complex RLS policies,
-- especially since all uploads go through the backend anyway.

-- Note: This assumes the buckets have already been created by the backend.
-- If the migration fails because buckets don't exist yet, that's okay -
-- the backend will create them without RLS enabled.

-- For direct SQL access, you would run:
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- However, for bucket-specific control, we'll use storage policies.
-- The simplest fix is to ensure buckets are created with public=false
-- but without RLS enforcement, which is handled by the backend initialization.

-- Alternative: Grant full access to service role
GRANT ALL ON storage.objects TO service_role;
GRANT ALL ON storage.buckets TO service_role;
