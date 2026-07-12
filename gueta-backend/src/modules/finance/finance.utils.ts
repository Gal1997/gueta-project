import type { Currency, Expense, Goal, Income } from "@prisma/client";
import type { ExchangeRates } from "../../lib/exchangeRates";
import { convertToIls } from "../../lib/exchangeRates";
import {
  INFINITE_REMAINING_PAYMENTS,
  isInfiniteRemainingPayments,
} from "./finance.constants";

export function currentMonthKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function nextMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  return `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
}

export function monthsRemaining(targetDate: Date): number {
  const now = new Date();
  let months =
    (targetDate.getFullYear() - now.getFullYear()) * 12 +
    (targetDate.getMonth() - now.getMonth());
  if (targetDate.getDate() > now.getDate()) {
    months += 1;
  }
  return Math.max(1, months);
}

export function monthlyForGoal(goal: Goal, rates: ExchangeRates): number {
  const ilsAmount = convertToIls(goal.targetAmount, goal.currency, rates);
  return Math.ceil(ilsAmount / monthsRemaining(goal.targetDate));
}

export function isActiveExpense(expense: Expense, now = new Date()): boolean {
  if (expense.recurrence === "once") {
    const billing = expense.billingDate;
    return (
      billing.getFullYear() === now.getFullYear() &&
      billing.getMonth() === now.getMonth()
    );
  }
  return (
    expense.remainingPayments > 0 ||
    isInfiniteRemainingPayments(expense.remainingPayments)
  );
}

/** Default monthly charge for debt: total ÷ total payments (not remaining). */
export function debtMonthlyChargeFromTotal(
  amountMinor: number,
  totalPayments: number,
): number {
  if (totalPayments <= 0) return 0;
  return Math.round(amountMinor / totalPayments);
}

/** Monthly budget impact for dashboards and charts. Debt uses stored חיוב החודש only. */
export function monthlyExpenseAmount(expense: Expense): number {
  if (expense.recurrence === "recurring" && expense.category === "debt") {
    return expense.monthlyCharge ?? 0;
  }
  return expense.amount;
}

function amountInIls(
  amount: number,
  currency: Currency,
  rates: ExchangeRates,
): number {
  return convertToIls(amount, currency, rates);
}

export function computeMonthlySavings(
  incomes: Income[],
  expenses: Expense[],
  goals: Goal[],
  rates: ExchangeRates,
): number {
  const totalIncome = incomes.reduce(
    (sum, item) => sum + amountInIls(item.amount, item.currency, rates),
    0,
  );
  const totalExpenses = expenses
    .filter((item) => isActiveExpense(item))
    .reduce(
      (sum, item) =>
        sum +
        amountInIls(monthlyExpenseAmount(item), item.currency, rates),
      0,
    );
  const totalGoals = goals.reduce(
    (sum, goal) => sum + monthlyForGoal(goal, rates),
    0,
  );
  return totalIncome - totalExpenses - totalGoals;
}

export function toIlsAmount(
  item: { amount: number; currency: Currency },
  rates: ExchangeRates,
): number {
  return amountInIls(item.amount, item.currency, rates);
}
