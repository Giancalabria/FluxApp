-- ============================================================================
-- HOTFIX: Fix "Database error saving new user" on signup
-- ============================================================================
-- The set_user_id trigger was overwriting user_id with auth.uid() even when
-- user_id was already provided (e.g. by the category seeder during signup).
-- Since auth.uid() is NULL inside a database trigger, this caused a NOT NULL
-- violation that killed the entire signup transaction.
--
-- Run this in Supabase SQL Editor to fix it immediately.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
