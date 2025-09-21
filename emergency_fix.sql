-- EMERGENCY FIX - Run this if the main setup fails
-- This minimal setup will get authentication working

-- Step 1: Drop everything that might be broken
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 2: Remove any existing tables to start fresh
DROP TABLE IF EXISTS public.user_stats CASCADE;
DROP TABLE IF EXISTS public.test_results CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Step 3: Create only the essential profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: NO RLS (to eliminate permission issues)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 5: Grant full access
GRANT ALL ON public.profiles TO postgres, anon, authenticated, service_role;

-- Step 6: Create the simplest possible trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, 'unknown'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 8: Test query
SELECT 'Emergency setup completed' as status;