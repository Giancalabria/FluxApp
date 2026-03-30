import { useCallback, useEffect, useState } from "react";
import { userCurrencyService } from "../services/userCurrencyService";

export function useUserCurrencies(userId) {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!userId) {
      setCurrencies([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: err } = await userCurrencyService.getAll(userId);
    if (err) {
      setError(err.message);
      setCurrencies([]);
    } else {
      setError(null);
      setCurrencies(data ?? []);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const addCurrency = async (currencyCode) => {
    const { data, error: err } = await userCurrencyService.add(
      userId,
      currencyCode,
    );
    if (!err) await fetch();
    return { data, error: err };
  };

  const removeCurrency = async (currencyCode) => {
    const { error: err } = await userCurrencyService.remove(
      userId,
      currencyCode,
    );
    if (!err) await fetch();
    return { error: err };
  };

  return {
    currencies,
    loading,
    error,
    refetch: fetch,
    addCurrency,
    removeCurrency,
  };
}
