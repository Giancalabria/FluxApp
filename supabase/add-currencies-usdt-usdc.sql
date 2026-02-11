-- ============================================================================
-- Add USDT and USDC to allowed account currencies
-- ============================================================================
-- Run this in Supabase SQL Editor: https://app.supabase.com → Your project → SQL Editor
-- Your app already has these in src/constants (CURRENCIES); this updates the DB constraint.
-- ============================================================================

-- Drop the existing CHECK that only allowed ARS and USD
ALTER TABLE public.accounts
  DROP CONSTRAINT IF EXISTS accounts_currency_check;

-- Allow ARS, USD, USDT, USDC (and any future code you add here)
ALTER TABLE public.accounts
  ADD CONSTRAINT accounts_currency_check
  CHECK (currency IN ('ARS', 'USD', 'USDT', 'USDC'));
