import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { financialProfileService } from '../services/financialProfileService';

const STORAGE_KEY = 'finanzas_active_financial_profile_id';

const FinancialProfileContext = createContext(null);

export function FinancialProfileProvider({ children }) {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeProfileId, setActiveProfileIdState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  const fetchProfiles = useCallback(async () => {
    if (!user?.id) {
      setProfiles([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    const { data, error: err } = await financialProfileService.listByUser(user.id);
    if (err) {
      setError(err.message);
      setProfiles([]);
    } else {
      setError(null);
      setProfiles(data ?? []);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  useEffect(() => {
    if (!profiles.length) return;
    const exists = activeProfileId && profiles.some((p) => p.id === activeProfileId);
    if (!exists) {
      const first = profiles[0].id;
      setActiveProfileIdState(first);
      try {
        localStorage.setItem(STORAGE_KEY, first);
      } catch {}
    }
  }, [profiles, activeProfileId]);

  const setActiveProfileId = useCallback((id) => {
    setActiveProfileIdState(id);
    try {
      if (id) localStorage.setItem(STORAGE_KEY, id);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const activeProfile = useMemo(
    () => profiles.find((p) => p.id === activeProfileId) ?? null,
    [profiles, activeProfileId]
  );

  const value = useMemo(
    () => ({
      profiles,
      loading,
      error,
      refetchProfiles: fetchProfiles,
      activeProfile,
      activeProfileId,
      setActiveProfileId,
    }),
    [profiles, loading, error, fetchProfiles, activeProfile, activeProfileId, setActiveProfileId]
  );

  return <FinancialProfileContext.Provider value={value}>{children}</FinancialProfileContext.Provider>;
}

export function useFinancialProfile() {
  const ctx = useContext(FinancialProfileContext);
  if (!ctx) throw new Error('useFinancialProfile must be used within FinancialProfileProvider');
  return ctx;
}
