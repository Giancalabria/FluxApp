import { useCallback, useEffect, useState } from 'react';
import { profileService } from '../services/profileService';

export function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: err } = await profileService.getByUserId(userId);
    if (err) {
      if (err.code === 'PGRST116') {
        const { data: created } = await profileService.create({
          user_id: userId,
          username: 'user_' + Math.random().toString(36).slice(2, 10),
        });
        setProfile(created);
        setError(null);
      } else {
        setError(err.message);
        setProfile(null);
      }
    } else {
      setProfile(data);
      setError(null);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const updateUsername = useCallback(async (username) => {
    if (!userId) return { data: null, error: { message: 'Not signed in.' } };
    const { data, error: err } = await profileService.updateUsername(userId, username);
    if (!err) setProfile(data);
    return { data, error: err };
  }, [userId]);

  return { profile, loading, error, refetch: fetch, updateUsername };
}
