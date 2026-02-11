import { supabase } from '../lib/supabase';

export const activityMemberService = {
  /** Fetch all members of an activity. */
  async getByActivityId(activityId) {
    const { data, error } = await supabase
      .from('activity_members')
      .select('*')
      .eq('activity_id', activityId)
      .order('created_at', { ascending: true });
    return { data, error };
  },

  /** Create a new member. */
  async create(member) {
    const { data, error } = await supabase
      .from('activity_members')
      .insert(member)
      .select()
      .single();
    return { data, error };
  },

  /** Update a member. */
  async update(id, updates) {
    const { data, error } = await supabase
      .from('activity_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  /** Delete a member. Only safe if they have no expense_splits (caller should check). */
  async remove(id) {
    const { error } = await supabase.from('activity_members').delete().eq('id', id);
    return { error };
  },
};
