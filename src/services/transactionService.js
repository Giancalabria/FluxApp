import { supabase } from '../lib/supabase';
import { dateRangeToList } from '../lib/dateRangePresets';

const YMD = /^\d{4}-\d{2}-\d{2}$/;

export const transactionService = {
  /**
   * Fetch transactions, optionally filtered.
   * @param {{ accountId?: string, type?: string, dateFrom?: string, dateTo?: string }} filters
   */
  async getAll(filters = {}) {
    let query = supabase
      .from('transactions')
      .select(`
        *,
        account:accounts!account_id(name, currency),
        category:categories!category_id(name, classification)
      `)
      .order('date', { ascending: false });

    if (filters.accountId) query = query.eq('account_id', filters.accountId);
    if (filters.type) query = query.eq('type', filters.type);

    // Date filter: use single .in() for short ranges so one param is sent (avoids duplicate `date` keys).
    // DB `date` column is calendar date (YYYY-MM-DD), ranges are in user local time.
    const rawFrom = filters.dateFrom && String(filters.dateFrom).trim();
    const rawTo = filters.dateTo && String(filters.dateTo).trim();
    if (rawFrom && rawTo && YMD.test(rawFrom) && YMD.test(rawTo)) {
      const [dateFrom, dateTo] = rawFrom <= rawTo ? [rawFrom, rawTo] : [rawTo, rawFrom];
      const dateList = dateRangeToList(dateFrom, dateTo);
      if (dateList.length > 0) {
        if (dateList.length <= 93) {
          query = query.in('date', dateList);
        } else {
          query = query.gte('date', dateFrom).lte('date', dateTo);
        }
      }
    }

    const { data, error } = await query;
    return { data, error };
  },

  /** Create a transaction (income / expense / transfer). */
  async create(tx) {
    const { data, error } = await supabase
      .from('transactions')
      .insert(tx)
      .select()
      .single();
    return { data, error };
  },

  /** Update a transaction. */
  async update(id, updates) {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  /** Delete a transaction. */
  async remove(id) {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    return { error };
  },
};
