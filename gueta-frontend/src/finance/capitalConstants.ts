export const AVAILABLE_CASH_TYPE_LABELS: Record<string, string> = {
  cash: "מזומן",
  checking: 'עו"ש',
  bit: "ביט",
  paybox: "פייבוקס",
  daily_deposit: "פיקדון יומי",
  other: "אחר",
};

export const CAPITAL_INVESTMENT_TYPE_LABELS: Record<string, string> = {
  deposit: "פיקדון",
  investments: "השקעות",
  pension_fund: "קופת גמל",
  real_estate: 'נדל"ן',
  other: "אחר",
};

export const WITHDRAWABLE_CASH_TYPES = ["bit", "paybox"] as const;

export type WithdrawableCashType = (typeof WITHDRAWABLE_CASH_TYPES)[number];

export const AVAILABLE_CASH_TYPES = [
  { value: "cash", label: "מזומן" },
  { value: "checking", label: 'עו"ש' },
  { value: "bit", label: "ביט" },
  { value: "paybox", label: "פייבוקס" },
  { value: "daily_deposit", label: "פיקדון יומי" },
  { value: "other", label: "אחר" },
];

export const CAPITAL_INVESTMENT_TYPES = [
  { value: "deposit", label: "פיקדון" },
  { value: "investments", label: "השקעות" },
  { value: "pension_fund", label: "קופת גמל" },
  { value: "real_estate", label: 'נדל"ן' },
  { value: "other", label: "אחר" },
];

export const DISTRIBUTION_COLORS = {
  available: "#3ecf8e",
  investments: "#4f8cff",
  future: "#b197fc",
} as const;

export const AVAILABLE_CASH_TYPE_COLORS: Record<string, string> = {
  cash: "#3ecf8e",
  checking: "#4f8cff",
  bit: "#ffa94d",
  paybox: "#b197fc",
  daily_deposit: "#22b8cf",
  other: "#ff6b6b",
};

export const CAPITAL_INVESTMENT_TYPE_COLORS: Record<string, string> = {
  deposit: "#4f8cff",
  investments: "#ffa94d",
  pension_fund: "#b197fc",
  real_estate: "#3ecf8e",
  other: "#ff6b6b",
};
