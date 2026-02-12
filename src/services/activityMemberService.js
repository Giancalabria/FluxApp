import { supabase } from '../lib/supabase';

export const activityMemberService = {
  async getByActivityId(activityId) {
    const { data, error } = await supabase
      .from('activity_members')
      .select('*')
      .eq('activity_id', activityId)
      .order('created_at', { ascending: true });
    return { data, error };
  },

  async create(member) {
    const { data, error } = await supabase
      .from('activity_members')
      .insert(member)
      .select()
      .single();
    return { data, error };
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('activity_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async remove(id) {
    const { error } = await supabase.from('activity_members').delete().eq('id', id);
    return { error };
  },
};
