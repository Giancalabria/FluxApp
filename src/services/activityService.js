import { supabase } from '../lib/supabase';

export const activityService = {
  /** Fetch all activities for the authenticated user (RLS enforces created_by). */
  async getAll() {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  /** Get a single activity by id. */
  async getById(id) {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  /** Create a new activity. Pass created_by or let trigger set from auth.uid(). */
  async create(activity) {
    const { data, error } = await supabase
      .from('activities')
      .insert(activity)
      .select()
      .single();
    return { data, error };
  },

  /** Update an existing activity. */
  async update(id, updates) {
    const { data, error } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  /** Delete an activity by id (cascades to members, expenses, splits). */
  async remove(id) {
    const { error } = await supabase.from('activities').delete().eq('id', id);
    return { error };
  },
};
