import { supabase } from '../lib/supabase';
import { DEFAULT_CATEGORIES } from '../constants';

export const categoryService = {
  async getAll(financialProfileId) {
    let q = supabase.from('categories').select('*').order('name', { ascending: true });
    if (financialProfileId) q = q.eq('financial_profile_id', financialProfileId);
    const { data, error } = await q;
    return { data, error };
  },

  async seedDefaultsForProfile(userId, financialProfileId) {
    if (!userId || !financialProfileId) return { data: null, error: { message: 'Missing user or profile.' } };
    const rows = DEFAULT_CATEGORIES.map((c) => ({
      name: c.name,
      classification: c.classification,
      user_id: userId,
      financial_profile_id: financialProfileId,
    }));
    const { data, error } = await supabase.from('categories').insert(rows).select();
    return { data, error };
  },

  async create(category) {
    const { data, error } = await supabase.from('categories').insert(category).select().single();
    return { data, error };
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async remove(id) {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    return { error };
  },
};
