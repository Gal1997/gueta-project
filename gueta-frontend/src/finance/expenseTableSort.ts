import dayjs from "dayjs";
import type { StoredExpense } from "../auth/authApi";
import { isInfiniteRemainingPayments } from "./expenseUtils";

export type ExpenseSortColumn =
  | "category"
  | "amount"
  | "monthlyCharge"
  | "remainingPayments"
  | "billing";

function compareRemainingPayments(a: number, b: number): number {
  const normalize = (value: number) =>
    isInfiniteRemainingPayments(value) ? Number.MAX_SAFE_INTEGER : value;
  return normalize(a) - normalize(b);
}

export const expenseSortComparators: Record<
  ExpenseSortColumn,
  (a: StoredExpense, b: StoredExpense) => number
> = {
  category: (a, b) =>
    a.category.name.localeCompare(b.category.name, "he"),
  amount: (a, b) => a.amount - b.amount,
  monthlyCharge: (a, b) =>
    (a.monthlyCharge ?? 0) - (b.monthlyCharge ?? 0),
  remainingPayments: (a, b) =>
    compareRemainingPayments(a.remainingPayments, b.remainingPayments),
  billing: (a, b) =>
    dayjs(a.billingDate).valueOf() - dayjs(b.billingDate).valueOf(),
};
