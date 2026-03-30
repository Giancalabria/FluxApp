import { supabase } from "../lib/supabase";

export const profileService = {
  async getByUserId(userId) {
    if (!userId) return { data: null, error: null };
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    return { data, error };
  },

  async create(profile) {
    const { data, error } = await supabase
      .from("profiles")
      .insert(profile)
      .select()
      .single();
    return { data, error };
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },

  async updateUsername(userId, username) {
    const trimmed = String(username).trim();
    if (trimmed.length < 2 || trimmed.length > 32) {
      return {
        data: null,
        error: { message: "El nombre debe tener entre 2 y 32 caracteres." },
      };
    }
    if (!/^[\p{L}\p{N}\s\-_]+$/u.test(trimmed)) {
      return {
        data: null,
        error: {
          message:
            "Usá letras (incluye tildes y ñ), números, espacios, guiones o guión bajo.",
        },
      };
    }
    const { data, error } = await supabase
      .from("profiles")
      .update({ username: trimmed, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .select()
      .single();
    return { data, error };
  },

  async setUsername(userId, username) {
    const trimmed = String(username).trim();
    if (trimmed.length < 2 || trimmed.length > 32) {
      return {
        data: null,
        error: { message: "El nombre debe tener entre 2 y 32 caracteres." },
      };
    }
    if (!/^[\p{L}\p{N}\s\-_]+$/u.test(trimmed)) {
      return {
        data: null,
        error: {
          message:
            "Usá letras (incluye tildes y ñ), números, espacios, guiones o guión bajo.",
        },
      };
    }
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        { user_id: userId, username: trimmed, updated_at: now },
        { onConflict: "user_id" },
      )
      .select()
      .single();
    return { data, error };
  },
};
