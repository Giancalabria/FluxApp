-- ============================================================================
-- Store USD amount at transaction time for accurate historical USD totals
-- ============================================================================
-- Run in Supabase SQL Editor. This adds amount_usd so we use the exchange rate
-- at the time of the transaction, not the current rate, when showing income/
-- expense in USD. Existing rows stay NULL (we fall back to current-rate conversion).
-- ============================================================================

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS amount_usd NUMERIC(15,4) NULL;

COMMENT ON COLUMN public.transactions.amount_usd IS 'USD equivalent at transaction time (from account currency using dólar blue for ARS). Used for historical USD totals.';
