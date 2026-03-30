import { supabase } from '../lib/supabase';

export const profileService = {
  async getByUserId(userId) {
    if (!userId) return { data: null, error: null };
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  async create(profile) {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();
    return { data, error };
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async updateUsername(userId, username) {
    const trimmed = String(username).trim();
    if (trimmed.length < 2 || trimmed.length > 32) {
      return { data: null, error: { message: 'El nombre debe tener entre 2 y 32 caracteres.' } };
    }
    if (!/^[a-zA-Z0-9_\-\s]+$/.test(trimmed)) {
      return { data: null, error: { message: 'Solo letras, números, guiones y espacios.' } };
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
