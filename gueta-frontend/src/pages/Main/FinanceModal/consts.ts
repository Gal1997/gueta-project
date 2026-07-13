export type FinanceEntity = "income" | "expense" | "goal";

export const ENTITY_TITLES: Record<FinanceEntity, { add: string; edit: string }> = {
  income: { add: "הוספת הכנסה", edit: "עריכת הכנסה" },
  expense: { add: "הוספת הוצאה", edit: "עריכת הוצאה" },
  goal: { add: "הוספת מטרה", edit: "עריכת מטרה" },
};

export const ERRORS = {
  submitFailed: "אירעה שגיאה. נסו שוב.",
  billingDayRange: "יום בין 1 ל-31",
} as const;

export interface IncomeFormValues {
  type: string;
  source: string;
  description: string;
  currency: string;
  amount: number | string;
}

export interface ExpenseFormValues {
  recurrence: string;
  kind: string;
  categoryId: string;
  name: string;
  currency: string;
  amount: number | string;
  description: string;
  remainingPayments: number | string;
  remainingPaymentsInfinite: boolean;
  totalPayments: number | string;
  monthlyCharge: number | string;
  monthlyChargeUseDefault: boolean;
  billingDay: number | string;
  billingDate: string | null;
}

export interface GoalFormValues {
  description: string;
  currency: string;
  targetAmount: number | string;
  targetDate: string | null;
}
