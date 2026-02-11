import { supabase } from '../lib/supabase';

export const categoryService = {
  /** Fetch all categories for the authenticated user. */
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    return { data, error };
  },

  /** Create a new category. */
  async create(category) {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();
    return { data, error };
  },

  /** Update an existing category. */
  async update(id, updates) {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  /** Delete a category. */
  async remove(id) {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    return { error };
  },
};
