-- ============================================================================
-- Profiles: username (random by default, user can change in Settings)
-- ============================================================================
-- Run in Supabase SQL Editor. Creates profiles table and ensures new users
-- get a row with a random username. Existing users: run the backfill at the end
-- once, or the app will create profile on first Settings load.
-- ============================================================================

-- ─── 1. Profiles table ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username  TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT profiles_username_length CHECK (char_length(username) >= 2 AND char_length(username) <= 32),
  CONSTRAINT profiles_username_valid CHECK (username ~ '^[a-zA-Z0-9_-]+$')
);

-- Optional: auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_profiles_updated_at();

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- No DELETE policy: users don't delete their profile; it goes with auth.users.

-- ─── 2. Extend handle_new_user to create profile with random username ──────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_username TEXT;
  attempt INT := 0;
BEGIN
  PERFORM public.seed_default_categories(NEW.id);
  new_username := 'user_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = new_username) AND attempt < 5 LOOP
    new_username := 'user_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8) || substr(attempt::text, 1, 1);
    attempt := attempt + 1;
  END LOOP;
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, new_username);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─── 3. Backfill profiles for existing users (run once if needed) ──────────
-- Uncomment and run in SQL Editor if you have users created before this migration:
--
INSERT INTO public.profiles (user_id, username)
SELECT id, 'user_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles)
ON CONFLICT (user_id) DO NOTHING;