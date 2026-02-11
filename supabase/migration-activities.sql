-- ============================================================================
-- Activities (Tricount-style split expenses)
-- ============================================================================
-- Run in Supabase SQL Editor after the main migration.
-- Creates activities, activity_members, activity_expenses, expense_splits + RLS.
-- ============================================================================

-- ─── 1. Activities ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activities (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  currency    TEXT NOT NULL DEFAULT 'ARS' CHECK (currency IN ('ARS', 'USD', 'USDT', 'USDC')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activities"
  ON public.activities FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own activities"
  ON public.activities FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own activities"
  ON public.activities FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own activities"
  ON public.activities FOR DELETE
  USING (auth.uid() = created_by);

CREATE INDEX IF NOT EXISTS idx_activities_created_by ON public.activities(created_by);


-- ─── 2. Activity members ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_members (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view members of their activities"
  ON public.activity_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.activities a
      WHERE a.id = activity_members.activity_id AND a.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert members in their activities"
  ON public.activity_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.activities a
      WHERE a.id = activity_members.activity_id AND a.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update members of their activities"
  ON public.activity_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.activities a
      WHERE a.id = activity_members.activity_id AND a.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.activities a
      WHERE a.id = activity_members.activity_id AND a.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete members of their activities"
  ON public.activity_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.activities a
      WHERE a.id = activity_members.activity_id AND a.created_by = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_activity_members_activity_id ON public.activity_members(activity_id);


-- ─── 3. Activity expenses ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_expenses (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id         UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  paid_by_member_id   UUID NOT NULL REFERENCES public.activity_members(id) ON DELETE RESTRICT,
  amount              NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  description         TEXT,
  date                DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view expenses of their activities"
  ON public.activity_expenses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.activities a
      WHERE a.id = activity_expenses.activity_id AND a.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert expenses in their activities"
  ON public.activity_expenses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.activities a
      WHERE a.id = activity_expenses.activity_id AND a.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update expenses of their activities"
  ON public.activity_expenses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.activities a
      WHERE a.id = activity_expenses.activity_id AND a.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.activities a
      WHERE a.id = activity_expenses.activity_id AND a.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete expenses of their activities"
  ON public.activity_expenses FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.activities a
      WHERE a.id = activity_expenses.activity_id AND a.created_by = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_activity_expenses_activity_id ON public.activity_expenses(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_expenses_date ON public.activity_expenses(date DESC);


-- ─── 4. Expense splits ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.expense_splits (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id  UUID NOT NULL REFERENCES public.activity_expenses(id) ON DELETE CASCADE,
  member_id   UUID NOT NULL REFERENCES public.activity_members(id) ON DELETE RESTRICT,
  amount      NUMERIC(15,2) NOT NULL CHECK (amount >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(expense_id, member_id)
);

ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view splits of their activities' expenses"
  ON public.expense_splits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.activity_expenses e
      JOIN public.activities a ON a.id = e.activity_id
      WHERE e.id = expense_splits.expense_id AND a.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert splits in their activities' expenses"
  ON public.expense_splits FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.activity_expenses e
      JOIN public.activities a ON a.id = e.activity_id
      WHERE e.id = expense_splits.expense_id AND a.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update splits of their activities' expenses"
  ON public.expense_splits FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.activity_expenses e
      JOIN public.activities a ON a.id = e.activity_id
      WHERE e.id = expense_splits.expense_id AND a.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.activity_expenses e
      JOIN public.activities a ON a.id = e.activity_id
      WHERE e.id = expense_splits.expense_id AND a.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete splits of their activities' expenses"
  ON public.expense_splits FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.activity_expenses e
      JOIN public.activities a ON a.id = e.activity_id
      WHERE e.id = expense_splits.expense_id AND a.created_by = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_expense_splits_expense_id ON public.expense_splits(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_member_id ON public.expense_splits(member_id);


-- ─── 5. Optional: set created_by from auth ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_activity_created_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER activities_set_created_by
  BEFORE INSERT ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.set_activity_created_by();
