// ─── Supported currencies ────────────────────────────────────────────────────
export const CURRENCIES = [
  { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
  { code: 'USD', name: 'US Dollar', symbol: 'US$' },
];

// ─── Transaction types ──────────────────────────────────────────────────────
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

// ─── Expense classification ─────────────────────────────────────────────────
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

// ─── Default categories ─────────────────────────────────────────────────────
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
