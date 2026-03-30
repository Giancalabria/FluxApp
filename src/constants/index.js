export const CURRENCIES = [
  { code: 'ARS', name: 'Peso Argentino', symbol: '$' },
  { code: 'USD', name: 'Dólar', symbol: 'US$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USDT', name: 'Tether', symbol: 'USDT' },
  { code: 'USDC', name: 'USD Coin', symbol: 'USDC' },
];

export const EXPENSE_CLASSIFICATIONS = {
  FIXED: 'fixed',
  VARIABLE: 'variable',
  ESSENTIAL: 'essential',
};

export const EXPENSE_CLASS_OPTIONS = [
  { value: 'fixed', label: 'Fijo', description: 'Recurrente y constante (alquiler, seguro)' },
  { value: 'variable', label: 'Variable', description: 'Discrecional (salidas, compras)' },
  { value: 'essential', label: 'Esencial', description: 'Necesario pero variable (supermercado, transporte)' },
];

/** Parser `bank` field; PDF parsers match your sample exports. */
export const BANK_IMPORT_OPTIONS = [
  { value: 'generic', label: 'Genérico / desconocido' },
  { value: 'patagonia', label: 'Banco Patagonia' },
  { value: 'macro', label: 'Banco Macro' },
  { value: 'santander', label: 'Santander Río' },
  { value: 'bbva', label: 'BBVA' },
  { value: 'galicia', label: 'Galicia' },
  { value: 'nacion', label: 'Banco Nación' },
];

export const DEFAULT_CATEGORIES = [
  { name: 'Alquiler', classification: 'fixed' },
  { name: 'Seguros', classification: 'fixed' },
  { name: 'Suscripciones', classification: 'fixed' },
  { name: 'Supermercado', classification: 'essential' },
  { name: 'Transporte', classification: 'essential' },
  { name: 'Servicios', classification: 'essential' },
  { name: 'Salud', classification: 'essential' },
  { name: 'Salidas', classification: 'variable' },
  { name: 'Entretenimiento', classification: 'variable' },
  { name: 'Compras', classification: 'variable' },
  { name: 'Viajes', classification: 'variable' },
  { name: 'Otros', classification: 'variable' },
];

export const CHART_PALETTE = ['#2C5F2D', '#97BC62', '#D97964', '#4A7C4B', '#A8C877', '#3D6B3E', '#F59E0B', '#6366F1'];
