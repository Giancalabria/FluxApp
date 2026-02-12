import { supabase } from '../lib/supabase';

const YMD = /^\d{4}-\d{2}-\d{2}$/;

export const transactionService = {
  async getAll(filters = {}) {
    let query = supabase
      .from('transactions')
      .select(`
        *,
        account:accounts!account_id(name, currency_code),
        category:categories!category_id(name, classification)
      `)
      .order('date', { ascending: false });

    if (filters.accountId) query = query.eq('account_id', filters.accountId);
    if (filters.accountIds?.length) query = query.in('account_id', filters.accountIds);
    if (filters.type) query = query.eq('type', filters.type);

    const rawFrom = filters.dateFrom && String(filters.dateFrom).trim();
    const rawTo = filters.dateTo && String(filters.dateTo).trim();
    if (rawFrom && rawTo && YMD.test(rawFrom) && YMD.test(rawTo)) {
      const [dateFrom, dateTo] = rawFrom <= rawTo ? [rawFrom, rawTo] : [rawTo, rawFrom];
      query = query.gte('date', dateFrom).lte('date', dateTo);
    }

    const { data, error } = await query;
    return { data, error };
  },

  async create(tx) {
    const { data, error } = await supabase
      .from('transactions')
      .insert(tx)
      .select()
      .single();
    return { data, error };
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async remove(id) {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    return { error };
  },
};
