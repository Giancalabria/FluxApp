-- ============================================================================
-- FluxApp — Supabase Database Migration
-- ============================================================================
-- Run this in the Supabase SQL Editor (https://app.supabase.com → SQL Editor)
-- This creates all tables, enables RLS, and sets up policies so each user
-- can only access their own data.
-- ============================================================================

-- ─── 1. Accounts ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.accounts (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  currency    TEXT NOT NULL DEFAULT 'ARS' CHECK (currency IN ('ARS', 'USD')),
  balance     NUMERIC(15,2) NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own accounts"
  ON public.accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts"
  ON public.accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
  ON public.accounts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts"
  ON public.accounts FOR DELETE
  USING (auth.uid() = user_id);


-- ─── 2. Categories ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  classification  TEXT CHECK (classification IN ('fixed', 'variable', 'essential')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own categories"
  ON public.categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
  ON public.categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON public.categories FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON public.categories FOR DELETE
  USING (auth.uid() = user_id);


-- ─── 3. Transactions ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transactions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id      UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  to_account_id   UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  category_id     UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  type            TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  classification  TEXT CHECK (classification IN ('fixed', 'variable', 'essential')),
  amount          NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  description     TEXT,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  exchange_rate   NUMERIC(12,4),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);


-- ─── 4. Auto-update "updated_at" trigger ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ─── 5. Auto-set user_id from auth context ─────────────────────────────────
-- This trigger automatically fills user_id on INSERT so the frontend
-- doesn't need to send it explicitly.
CREATE OR REPLACE FUNCTION public.set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER accounts_set_user_id
  BEFORE INSERT ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER categories_set_user_id
  BEFORE INSERT ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER transactions_set_user_id
  BEFORE INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();


-- ─── 6. Indexes for performance ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);


-- ─── 7. Seed default categories for new users (optional function) ───────────
-- Call this after a user signs up to give them starter categories.
-- You can invoke it from a Supabase Edge Function or manually.
CREATE OR REPLACE FUNCTION public.seed_default_categories(target_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.categories (user_id, name, classification) VALUES
    (target_user_id, 'Rent', 'fixed'),
    (target_user_id, 'Insurance', 'fixed'),
    (target_user_id, 'Subscriptions', 'fixed'),
    (target_user_id, 'Groceries', 'essential'),
    (target_user_id, 'Transport', 'essential'),
    (target_user_id, 'Utilities', 'essential'),
    (target_user_id, 'Healthcare', 'essential'),
    (target_user_id, 'Dining Out', 'variable'),
    (target_user_id, 'Entertainment', 'variable'),
    (target_user_id, 'Shopping', 'variable'),
    (target_user_id, 'Travel', 'variable'),
    (target_user_id, 'Salary', NULL),
    (target_user_id, 'Freelance', NULL),
    (target_user_id, 'Other Income', NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─── 8. Auto-seed categories on new user signup ─────────────────────────────
-- This trigger fires when a new user is created in auth.users and
-- automatically gives them the default categories.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.seed_default_categories(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================================
-- Done! Your database is ready.
-- 
-- Next steps:
--   1. Go to Authentication → Settings and enable Email sign-ups
--   2. Deploy your frontend to Vercel/Netlify
--   3. Sign up in the app — categories will be auto-seeded
-- ============================================================================
