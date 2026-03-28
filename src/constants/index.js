export const CURRENCIES = [
  { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
  { code: 'USD', name: 'US Dollar', symbol: 'US$' },
  {code: 'USDT', name: 'Tether', symbol: 'USDT'},
  {code: 'USDC', name: 'USD Coin', symbol: 'USDC'},
];

export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
  TRANSFER: 'transfer',
};

export const TRANSACTION_TYPE_OPTIONS = [
  { value: 'income', label: 'Income', color: 'success' },
  { value: 'expense', label: 'Expense', color: 'error' },
  { value: 'transfer', label: 'Transfer', color: 'secondary' },
];

export const EXPENSE_CLASSIFICATIONS = {
  FIXED: 'fixed',
  VARIABLE: 'variable',
  ESSENTIAL: 'essential',
};

export const EXPENSE_CLASS_OPTIONS = [
  { value: 'fixed', label: 'Fixed', description: 'Recurring & constant (rent, insurance)' },
  { value: 'variable', label: 'Variable', description: 'Discretionary (leisure, shopping)' },
  { value: 'essential', label: 'Essential', description: 'Mandatory but variable (groceries, transport)' },
];

export const PAY_FREQUENCY_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every two weeks' },
];

export const FINANCIAL_GOAL_OPTIONS = [
  { value: 'spend_less', label: 'Spend less' },
  { value: 'save_for_goal', label: 'Save for something' },
];

/** Parser `bank` field; PDF parsers match your sample exports (Patagonia / Macro / Santander Río). */
export const BANK_IMPORT_OPTIONS = [
  { value: 'generic', label: 'Generic / unknown bank' },
  { value: 'patagonia', label: 'Banco Patagonia' },
  { value: 'macro', label: 'Banco Macro' },
  { value: 'santander', label: 'Santander Río' },
  { value: 'bbva', label: 'BBVA' },
  { value: 'galicia', label: 'Galicia' },
  { value: 'nacion', label: 'Banco Nación' },
];

export const DEFAULT_CATEGORIES = [
  { name: 'Rent', classification: 'fixed' },
  { name: 'Insurance', classification: 'fixed' },
  { name: 'Subscriptions', classification: 'fixed' },
  { name: 'Groceries', classification: 'essential' },
  { name: 'Transport', classification: 'essential' },
  { name: 'Utilities', classification: 'essential' },
  { name: 'Healthcare', classification: 'essential' },
  { name: 'Dining Out', classification: 'variable' },
  { name: 'Entertainment', classification: 'variable' },
  { name: 'Shopping', classification: 'variable' },
  { name: 'Travel', classification: 'variable' },
  { name: 'Salary', classification: null },
  { name: 'Freelance', classification: null },
  { name: 'Other Income', classification: null },
];
