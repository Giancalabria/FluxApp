import { supabase } from '../lib/supabase';

export async function getAllCurrencies() {
  const { data, error } = await supabase
    .from('currencies')
    .select('code, name, symbol, is_crypto')
    .order('code');
  return { data, error };
}

export const currencyService = {
  getAll: getAllCurrencies,
};
