import dayjs from "dayjs";
import type { StoredExpense } from "../auth/authApi";
import { roundMoney } from "./money";

export const INFINITE_REMAINING_PAYMENTS = -1;
export const REMAINING_PAYMENTS_INFINITE_LABEL = "אין סוף";

export function isInfiniteRemainingPayments(value: number): boolean {
  return value === INFINITE_REMAINING_PAYMENTS;
}

export function formatRemainingPayments(value: number): string {
  return isInfiniteRemainingPayments(value)
    ? REMAINING_PAYMENTS_INFINITE_LABEL
    : String(value);
}

export function formatExpenseBilling(expense: StoredExpense): string {
  if (expense.recurrence === "once") {
    return dayjs(expense.billingDate).format("DD/MM/YYYY");
  }
  return `${dayjs(expense.billingDate).date()} לחודש`;
}

export function isActiveExpense(expense: StoredExpense): boolean {
  if (expense.recurrence === "once") {
    const billing = dayjs(expense.billingDate);
    const now = dayjs();
    return billing.year() === now.year() && billing.month() === now.month();
  }
  return (
    expense.remainingPayments > 0 ||
    isInfiniteRemainingPayments(expense.remainingPayments)
  );
}

/** Original payment count for debt; falls back to remaining for legacy rows. */
export function debtTotalPayments(
  expense: Pick<StoredExpense, "totalPayments" | "remainingPayments"> | {
    totalPayments?: number | string | null;
    remainingPayments?: number | string;
  },
): number {
  const total = Number(expense.totalPayments);
  if (Number.isFinite(total) && total > 0) return total;

  const remaining = Number(expense.remainingPayments);
  if (Number.isFinite(remaining) && remaining > 0) return remaining;

  return 0;
}

/** Default monthly charge for debt: total ÷ total payments (not remaining). */
export function defaultDebtMonthlyCharge(
  total: number,
  totalPayments: number,
): number {
  if (!Number.isFinite(total) || !Number.isFinite(totalPayments)) {
    return 0;
  }
  if (totalPayments <= 0) return 0;
  return roundMoney(total / totalPayments);
}

type DebtMonthlyChargeSource = Pick<
  StoredExpense,
  "kind" | "amount" | "totalPayments" | "remainingPayments" | "monthlyCharge"
>;

/** Whether stored חיוב החודש matches the default (total ÷ total payments). */
export function isDebtMonthlyChargeDefault(
  expense: DebtMonthlyChargeSource | null | undefined,
): boolean {
  if (!expense || expense.kind !== "debt") return true;
  const totalPayments = debtTotalPayments(expense);
  if (totalPayments <= 0) return true;

  const expected = defaultDebtMonthlyCharge(expense.amount, totalPayments);
  if (expense.monthlyCharge == null) return true;
  if (
    expense.monthlyCharge === expense.amount &&
    totalPayments > 1
  ) {
    return true;
  }
  return expense.monthlyCharge === expected;
}

/** Monthly charge shown in debt expense forms. */
export function debtMonthlyChargeForForm(
  expense: DebtMonthlyChargeSource | null | undefined,
): number | string {
  if (!expense || expense.kind !== "debt") return "";
  const totalPayments = debtTotalPayments(expense);
  if (totalPayments <= 0) return "";

  if (isDebtMonthlyChargeDefault(expense)) {
    return defaultDebtMonthlyCharge(expense.amount, totalPayments);
  }
  return expense.monthlyCharge ?? "";
}

/** Monthly budget impact for dashboards and charts. Debt uses stored חיוב החודש only. */
export function monthlyExpenseAmount(expense: StoredExpense): number {
  if (expense.recurrence === "recurring" && expense.kind === "debt") {
    return expense.monthlyCharge ?? 0;
  }
  return expense.amount;
}
