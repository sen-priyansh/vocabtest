📋 **Database Setup Instructions**

1. Go to https://app.supabase.com
2. Select your project: hejlxuqmsablnfimijux  
3. Click "SQL Editor" in the sidebar
4. Copy and paste this SQL code:

```sql
-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- 2. Create test_results table  
CREATE TABLE IF NOT EXISTS test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  difficulty TEXT NOT NULL,
  time_taken INTEGER NOT NULL,
  answers JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create user_stats table
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  total_tests INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  accuracy_percentage DECIMAL(5,2) DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

5. Click "Run" to execute the SQL
6. Then run the security policies (copy full database_setup.sql file)

🌐 **Your app is ready at**: http://localhost:3001