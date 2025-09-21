-- ================================================================
-- VOCABTEST DATABASE FRESH START - SIMPLIFIED VERSION
-- Since you manually deleted tables, this creates everything fresh
-- ================================================================

-- STEP 1: Clean up any remaining components (just in case)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_profile(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.ensure_user_profile(UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_profile_safe(UUID) CASCADE;

-- STEP 2: CREATE BRAND NEW TABLES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 1,
  difficulty TEXT NOT NULL DEFAULT 'easy',
  time_taken INTEGER NOT NULL DEFAULT 0,
  answers JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_tests INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  accuracy_percentage DECIMAL(5,2) DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 3: GRANT MAXIMUM PERMISSIONS
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Specific table permissions
GRANT ALL ON public.profiles TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.test_results TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.user_stats TO postgres, anon, authenticated, service_role;

-- STEP 4: CREATE SIMPLE TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, 'unknown'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  );
  
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
EXCEPTION 
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 5: CREATE TRIGGER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- STEP 6: DISABLE RLS (for development)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats DISABLE ROW LEVEL SECURITY;

-- STEP 7: FINAL PERMISSIONS
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;

-- STEP 8: SUCCESS VERIFICATION
DO $$
BEGIN
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'SUCCESS: FRESH DATABASE SETUP COMPLETED!';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Tables: profiles, test_results, user_stats';
  RAISE NOTICE 'Trigger: on_auth_user_created';
  RAISE NOTICE 'Security: RLS disabled for development';
  RAISE NOTICE 'Permissions: Full access granted to all roles';
  RAISE NOTICE 'Status: Ready for authentication!';
  RAISE NOTICE 'Setup completed at: %', NOW();
  RAISE NOTICE '====================================================';
END $$;