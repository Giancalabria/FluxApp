import { supabase } from '../lib/supabase';

export const activityService = {
  async getAll() {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  async create(activity) {
    const { data, error } = await supabase
      .from('activities')
      .insert(activity)
      .select()
      .single();
    return { data, error };
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async remove(id) {
    const { error } = await supabase.from('activities').delete().eq('id', id);
    return { error };
  },
};
