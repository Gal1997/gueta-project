export const INCOME_TYPE_LABELS: Record<string, string> = {
  salary: "משכורת",
  investments: "השקעות",
  other: "אחר",
};

export const EXPENSE_KIND_LABELS: Record<string, string> = {
  debt: "חוב",
  fixed: "הוצאה קבועה",
  once: "חד פעמי",
};

export const EXPENSE_RECURRENCE_LABELS: Record<string, string> = {
  recurring: "חוזר",
  once: "חד פעמי",
};

export const INCOME_TYPES = [
  { value: "salary", label: "משכורת" },
  { value: "investments", label: "השקעות" },
  { value: "other", label: "אחר" },
];

export const EXPENSE_RECURRING_KINDS = [
  { value: "debt", label: "חוב" },
  { value: "fixed", label: "הוצאה קבועה" },
];

export const EXPENSE_RECURRENCES = [
  { value: "recurring", label: "חוזר" },
  { value: "once", label: "חד פעמי" },
];

export const REQUIRED = "שדה חובה";

export const REMAINING_PAYMENTS_INFO =
  "אין צורך לעדכן במעבר חודש, זה יפגע בחישובים. צריך לעדכן שדה זה רק כאשר העסקה הכוללת השתנתה, לדוגמא אם בסוף פרסנו לפחות או יותר תשלומים.";

export {
  INFINITE_REMAINING_PAYMENTS,
  REMAINING_PAYMENTS_INFINITE_LABEL,
} from "./expenseUtils";

export function billingDayToDate(day: number): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const safeDay = String(Math.min(31, Math.max(1, day))).padStart(2, "0");
  return `${year}-${month}-${safeDay}`;
}

export function dateToBillingDay(value: string): number {
  return new Date(value).getDate();
}
