import { supabase } from '../lib/supabase';

export const accountService = {
  /** Fetch all accounts for the authenticated user. */
  async getAll() {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  /** Get a single account by id. */
  async getById(id) {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  /** Create a new account. */
  async create(account) {
    const { data, error } = await supabase
      .from('accounts')
      .insert(account)
      .select()
      .single();
    return { data, error };
  },

  /** Update an existing account. */
  async update(id, updates) {
    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  /** Delete an account by id. */
  async remove(id) {
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    return { error };
  },
};
