const CACHE_TTL_MS = 60 * 60 * 1000;
const DOLAR_API_BASE = 'https://dolarapi.com/v1/dolares';

let cached = null;

async function fetchUsdArsRate() {
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { rate: cached.rate, updatedAt: cached.updatedAt };
  }

  try {
    const res = await fetch(`${DOLAR_API_BASE}/blue`);
    if (!res.ok) throw new Error(`DolarAPI ${res.status}`);
    const data = await res.json();
    const rate = Number(data.venta);
    if (!Number.isFinite(rate) || rate <= 0) throw new Error('Invalid rate');
    const updatedAt = data.fechaActualizacion || new Date().toISOString();
    cached = { rate, updatedAt, timestamp: Date.now() };
    return { rate, updatedAt };
  } catch (err) {
    if (cached) return { rate: cached.rate, updatedAt: cached.updatedAt };
    throw err;
  }
}

const USD_PEGGED = new Set(['USD', 'USDT', 'USDC']);

export function convertToUsd(amount, currency, usdArsRate) {
  if (!Number.isFinite(amount)) return null;
  if (USD_PEGGED.has(currency)) return amount;
  if (currency === 'ARS') {
    if (usdArsRate == null || !Number.isFinite(usdArsRate) || usdArsRate <= 0) return null;
    return amount / usdArsRate;
  }
  return null;
}

export async function getUsdArsRate() {
  return fetchUsdArsRate();
}

export const exchangeRateService = {
  getUsdArsRate,
  convertToUsd,
  USD_PEGGED,
};
