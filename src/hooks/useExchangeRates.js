import { useCallback, useEffect, useState } from 'react';
import { exchangeRateService } from '../services/exchangeRateService';
import { toISODate } from '../lib/dateRangePresets';

export function useExchangeRates() {
  const [usdArsRate, setUsdArsRate] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    exchangeRateService
      .getUsdArsRate()
      .then(({ rate, updatedAt: at }) => {
        if (!cancelled) {
          setUsdArsRate(rate);
          setUpdatedAt(at);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load exchange rate');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const convertToUsd = useCallback(
    (amount, currency) => exchangeRateService.convertToUsd(amount, currency, usdArsRate),
    [usdArsRate]
  );

  const totalBalanceUsd = useCallback(
    (accounts) => {
      if (!accounts?.length) return null;
      let total = 0;
      let hasUnknown = false;
      for (const a of accounts) {
        const currency = a.currency_code ?? a.currency;
        const usd = convertToUsd(Number(a.balance || 0), currency);
        if (usd != null) total += usd;
        else hasUnknown = true;
      }
      return hasUnknown && total === 0 ? null : total;
    },
    [convertToUsd]
  );

  const monthTotalsUsd = useCallback(
    (transactions) => {
      const now = new Date();
      const monthStart = toISODate(new Date(now.getFullYear(), now.getMonth(), 1));
      let income = 0;
      let expense = 0;
      for (const t of transactions || []) {
        if (t.date < monthStart) continue;
        let usd = null;
        const storedUsd = t.amount_in_usd ?? t.amount_usd;
        if (storedUsd != null && Number.isFinite(Number(storedUsd))) {
          usd = Number(storedUsd);
        } else {
          const currency = (t.account?.currency_code ?? t.account?.currency) || 'ARS';
          usd = convertToUsd(Number(t.amount || 0), currency);
        }
        if (usd == null) continue;
        if (t.type === 'income') income += usd;
        if (t.type === 'expense') expense += usd;
      }
      return { income, expense };
    },
    [convertToUsd]
  );

  return {
    usdArsRate,
    updatedAt,
    loading,
    error,
    convertToUsd,
    totalBalanceUsd,
    monthTotalsUsd,
  };
}
