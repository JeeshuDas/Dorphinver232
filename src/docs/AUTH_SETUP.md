# Dorphin Authentication Setup Guide

## 🗄️ Database Schema

Run this SQL in your Supabase SQL Editor to create the users table:

```sql
-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Policy: Users can view all public profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.users FOR SELECT
  USING (true);

-- Policy: Users can update only their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile during signup
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete own profile"
  ON public.users FOR DELETE
  USING (auth.uid() = id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on users table
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

## 🔐 Supabase Auth Configuration

### 1. Email Settings
In Supabase Dashboard → Authentication → Settings:
- Enable "Enable email confirmations" (recommended for production)
- For development, you can disable it temporarily
- Configure email templates for signup confirmation, password reset, etc.

### 2. Password Requirements
In Supabase Dashboard → Authentication → Settings → Password:
- Minimum password length: 8 characters
- (Supabase handles password hashing automatically with bcrypt)

### 3. Social Auth Providers

#### Google OAuth Setup:
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Follow: https://supabase.com/docs/guides/auth/social-login/auth-google
4. Add your Google Client ID and Secret

#### Apple OAuth Setup (Optional):
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Apple provider
3. Follow: https://supabase.com/docs/guides/auth/social-login/auth-apple
4. Add your Apple Service ID and Key

### 4. Storage Bucket for Avatars

Run this SQL to create storage bucket:

```sql
-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view avatars (public bucket)
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Policy: Users can upload their own avatar
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

## 🔑 Environment Variables

Your `.env` file should have:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**⚠️ IMPORTANT:** Never expose SUPABASE_SERVICE_ROLE_KEY to the frontend!

## 📋 Rate Limiting (Optional - Advanced)

To prevent brute-force attacks, you can implement rate limiting in your Edge Function or use Supabase's built-in rate limiting features.

## ✅ Verification Checklist

- [ ] Database schema created
- [ ] RLS policies enabled
- [ ] Storage bucket created for avatars
- [ ] Email confirmation configured
- [ ] Google OAuth configured (if using)
- [ ] Apple OAuth configured (if using)
- [ ] Environment variables set

## 🧪 Testing

After setup, test:
1. Sign up with email/password
2. Check email for verification link
3. Sign in with verified account
4. Upload profile picture
5. Sign out and sign back in
6. Try Google/Apple login (if configured)

## 📚 Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Social Login](https://supabase.com/docs/guides/auth/social-login)
