import { supabase } from '../lib/supabase';

export const profileService = {
  /** Get profile by user id (current user only via RLS). */
  async getByUserId(userId) {
    if (!userId) return { data: null, error: null };
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  /** Create profile (e.g. for existing users who don't have one yet). */
  async create(profile) {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();
    return { data, error };
  },

  /** Update username. */
  async updateUsername(userId, username) {
    const trimmed = String(username).trim();
    if (trimmed.length < 2 || trimmed.length > 32) {
      return { data: null, error: { message: 'Username must be 2–32 characters.' } };
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      return { data: null, error: { message: 'Username can only contain letters, numbers, underscore and hyphen.' } };
    }
    const { data, error } = await supabase
      .from('profiles')
      .update({ username: trimmed, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();
    return { data, error };
  },
};
