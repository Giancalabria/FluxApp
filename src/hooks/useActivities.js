import { useCallback, useEffect, useState } from 'react';
import { activityService } from '../services/activityService';

export function useActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await activityService.getAll();
    if (err) {
      setError(err.message);
    } else {
      setActivities(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const createActivity = async (activity) => {
    const { data, error: err } = await activityService.create(activity);
    if (!err) await fetch();
    return { data, error: err };
  };

  const updateActivity = async (id, updates) => {
    const { data, error: err } = await activityService.update(id, updates);
    if (!err) await fetch();
    return { data, error: err };
  };

  const deleteActivity = async (id) => {
    const { error: err } = await activityService.remove(id);
    if (!err) await fetch();
    return { error: err };
  };

  return {
    activities,
    loading,
    error,
    refetch: fetch,
    createActivity,
    updateActivity,
    deleteActivity,
  };
}
