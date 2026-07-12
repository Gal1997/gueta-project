import dayjs from "dayjs";
import type { StoredExpense } from "../../auth/authApi";
import { isActiveExpense } from "../../finance/expenseUtils";

export function getInactiveExpenses(expenses: StoredExpense[]): StoredExpense[] {
  return expenses
    .filter((expense) => !isActiveExpense(expense))
    .sort(
      (a, b) => dayjs(b.billingDate).valueOf() - dayjs(a.billingDate).valueOf(),
    );
}
