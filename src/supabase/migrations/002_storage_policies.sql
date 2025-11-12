-- =====================================================
-- STORAGE BUCKET RLS POLICIES
-- =====================================================
-- This migration sets up the necessary policies for Supabase Storage
-- to allow uploads and downloads for authenticated users

-- First, ensure the buckets exist and are configured properly
-- Note: These will be created by the backend if they don't exist

-- =====================================================
-- Video Bucket Policies
-- =====================================================

-- Allow service role to do everything (backend uploads use service role)
CREATE POLICY "Service role can do everything on videos"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'make-148a8522-dorphin-videos')
WITH CHECK (bucket_id = 'make-148a8522-dorphin-videos');

-- Allow authenticated users to upload their own videos
CREATE POLICY "Users can upload their own videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'make-148a8522-dorphin-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read all videos
CREATE POLICY "Anyone can read videos"
ON storage.objects FOR SELECT
TO authenticated, anon
USING (bucket_id = 'make-148a8522-dorphin-videos');

-- Allow users to delete their own videos
CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'make-148a8522-dorphin-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- Thumbnail Bucket Policies
-- =====================================================

-- Allow service role to do everything (backend uploads use service role)
CREATE POLICY "Service role can do everything on thumbnails"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'make-148a8522-dorphin-thumbnails')
WITH CHECK (bucket_id = 'make-148a8522-dorphin-thumbnails');

-- Allow authenticated users to upload their own thumbnails
CREATE POLICY "Users can upload their own thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'make-148a8522-dorphin-thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read all thumbnails
CREATE POLICY "Anyone can read thumbnails"
ON storage.objects FOR SELECT
TO authenticated, anon
USING (bucket_id = 'make-148a8522-dorphin-thumbnails');

-- Allow users to delete their own thumbnails
CREATE POLICY "Users can delete their own thumbnails"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'make-148a8522-dorphin-thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- Profile Bucket Policies
-- =====================================================

-- Allow service role to do everything (backend uploads use service role)
CREATE POLICY "Service role can do everything on profiles"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'make-148a8522-dorphin-profiles')
WITH CHECK (bucket_id = 'make-148a8522-dorphin-profiles');

-- Allow authenticated users to upload their own profile pictures
CREATE POLICY "Users can upload their own profile pictures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'make-148a8522-dorphin-profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own profile pictures
CREATE POLICY "Users can update their own profile pictures"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'make-148a8522-dorphin-profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow anyone to read profile pictures
CREATE POLICY "Anyone can read profile pictures"
ON storage.objects FOR SELECT
TO authenticated, anon
USING (bucket_id = 'make-148a8522-dorphin-profiles');

-- Allow users to delete their own profile pictures
CREATE POLICY "Users can delete their own profile pictures"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'make-148a8522-dorphin-profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
