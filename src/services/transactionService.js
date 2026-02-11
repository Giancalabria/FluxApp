import { supabase } from '../lib/supabase';

export const transactionService = {
  /**
   * Fetch transactions, optionally filtered.
   * @param {{ accountId?: string, type?: string, dateFrom?: string, dateTo?: string }} filters
   */
  async getAll(filters = {}) {
    let query = supabase
      .from('transactions')
      .select('*, account:accounts(name, currency), category:categories(name, classification)')
      .order('date', { ascending: false });

    if (filters.accountId) query = query.eq('account_id', filters.accountId);
    if (filters.type) query = query.eq('type', filters.type);
    if (filters.dateFrom) query = query.gte('date', filters.dateFrom);
    if (filters.dateTo) query = query.lte('date', filters.dateTo);

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
