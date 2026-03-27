import { supabase } from '../lib/supabase';

export const bankImportService = {
  async create(row) {
    const { data, error } = await supabase.from('bank_imports').insert(row).select().single();
    return { data, error };
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('bank_imports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async listForProfile(financialProfileId, limit = 20) {
    const { data, error } = await supabase
      .from('bank_imports')
      .select('*')
      .eq('financial_profile_id', financialProfileId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data: data ?? [], error };
  },
};
