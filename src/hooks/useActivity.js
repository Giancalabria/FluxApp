import { useCallback, useEffect, useState } from 'react';
import { activityService } from '../services/activityService';
import { activityMemberService } from '../services/activityMemberService';

export function useActivity(activityId) {
  const [activity, setActivity] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!activityId) {
      setActivity(null);
      setMembers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [actRes, memRes] = await Promise.all([
      activityService.getById(activityId),
      activityMemberService.getByActivityId(activityId),
    ]);
    if (actRes.error) {
      setError(actRes.error.message);
      setActivity(null);
      setMembers([]);
    } else {
      setError(null);
      setActivity(actRes.data);
      setMembers(memRes.data ?? []);
    }
    setLoading(false);
  }, [activityId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const addMember = async (member) => {
    const { data, error: err } = await activityMemberService.create(member);
    if (!err) await fetch();
    return { data, error: err };
  };

  const removeMember = async (id) => {
    const { error: err } = await activityMemberService.remove(id);
    if (!err) await fetch();
    return { error: err };
  };

  return {
    activity,
    members,
    loading,
    error,
    refetch: fetch,
    addMember,
    removeMember,
  };
}
