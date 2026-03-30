import { useCallback, useEffect, useState } from "react";
import { profileService } from "../services/profileService";

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
    if (err?.code === "PGRST116") {
      // No profile yet (new user hasn't onboarded)
      setProfile(null);
      setError(null);
    } else if (err) {
      setError(err.message);
    } else {
      setProfile(data);
      setError(null);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const updateUsername = async (username) => {
    const { data, error: err } = await profileService.updateUsername(
      userId,
      username,
    );
    if (!err && data) setProfile(data);
    return { data, error: err };
  };

  return { profile, loading, error, refetch: fetch, updateUsername };
}
