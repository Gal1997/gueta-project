export type CapitalCurrency = "ILS" | "USD" | "EUR";

import { MONEY_DECIMAL_SCALE, roundMoney } from "./money";

export const CURRENCY_OPTIONS = [
  { value: "ILS", label: "₪ שקל" },
  { value: "USD", label: "$ דולר" },
  { value: "EUR", label: "€ אירו" },
] as const;

const formatters = new Map<CapitalCurrency, Intl.NumberFormat>();

export function formatMoney(
  amount: number,
  currency: CapitalCurrency = "ILS",
): string {
  let formatter = formatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: MONEY_DECIMAL_SCALE,
    });
    formatters.set(currency, formatter);
  }
  return formatter.format(amount);
}

export function convertToIls(
  amount: number,
  currency: CapitalCurrency,
  rates: Record<CapitalCurrency, number>,
): number {
  return roundMoney(amount * rates[currency]);
}
