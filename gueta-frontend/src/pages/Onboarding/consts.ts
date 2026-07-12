import type {
  ExpenseCategory,
  ExpenseRecurrence,
  IncomeType,
  AvailableCashType,
  CapitalInvestmentType,
  CapitalCurrency,
} from "../../auth/authApi";

export interface IncomeRow {
  type: string;
  source: string;
  description: string;
  currency: string;
  amount: number | string;
}

export interface AvailableCashRow {
  type: string;
  currency: string;
  amount: number | string;
}

export interface InvestmentRow {
  type: string;
  currency: string;
  amount: number | string;
}

export interface FutureMoneyRow {
  description: string;
  currency: string;
  amount: number | string;
  expectedPaymentDate: string | null;
}

export interface ExpenseRow {
  recurrence: string;
  category: string;
  name: string;
  currency: string;
  amount: number | string;
  description: string;
  remainingPayments: number | string;
  remainingPaymentsInfinite: boolean;
  totalPayments: number | string;
  monthlyCharge: number | string;
  billingDay: number | string;
  billingDate: string | null;
}

export interface GoalRow {
  description: string;
  currency: string;
  targetAmount: number | string;
  targetDate: string | null;
}

export interface OnboardingFormValues {
  availableCash: AvailableCashRow[];
  investments: InvestmentRow[];
  futureMoney: FutureMoneyRow[];
  incomes: IncomeRow[];
  expenses: ExpenseRow[];
  goals: GoalRow[];
}

export const INITIAL_OPEN_SECTIONS: string[] = [];

export const ONBOARDING_SECTIONS = [
  "capital",
  "incomes",
  "expenses",
  "goals",
] as const;

export type OnboardingSectionId = (typeof ONBOARDING_SECTIONS)[number];

export const CONTINUE_LABEL = "המשך";

export const ERRORS = {
  submitFailed: "אירעה שגיאה. נסו שוב.",
  skipFailed: "דילוג נכשל. נסו שוב.",
  billingDayRange: "יום בין 1 ל-31",
} as const;

export const makeIncome = (): IncomeRow => ({
  type: "",
  source: "",
  description: "",
  currency: "ILS",
  amount: "",
});

export const makeAvailableCash = (): AvailableCashRow => ({
  type: "",
  currency: "ILS",
  amount: "",
});

export const makeInvestment = (): InvestmentRow => ({
  type: "",
  currency: "ILS",
  amount: "",
});

export const makeFutureMoney = (): FutureMoneyRow => ({
  description: "",
  currency: "ILS",
  amount: "",
  expectedPaymentDate: null,
});

export const makeExpense = (): ExpenseRow => ({
  recurrence: "recurring",
  category: "",
  name: "",
  currency: "ILS",
  amount: "",
  description: "",
  remainingPayments: "",
  remainingPaymentsInfinite: false,
  totalPayments: "",
  monthlyCharge: "",
  billingDay: "",
  billingDate: null,
});

export const makeGoal = (): GoalRow => ({
  description: "",
  currency: "ILS",
  targetAmount: "",
  targetDate: null,
});

export type OnboardingPayload = {
  availableCash: {
    type: AvailableCashType;
    amount: number;
    currency?: CapitalCurrency;
  }[];
  investments: {
    type: CapitalInvestmentType;
    amount: number;
    currency?: CapitalCurrency;
  }[];
  futureMoney: {
    description: string;
    amount: number;
    currency?: CapitalCurrency;
    expectedPaymentDate?: string | null;
  }[];
  incomes: {
    type: IncomeType;
    source: string;
    description: string;
    amount: number;
    currency?: CapitalCurrency;
  }[];
  expenses: {
    recurrence: ExpenseRecurrence;
    category: ExpenseCategory;
    name: string;
    amount: number;
    currency?: CapitalCurrency;
    description: string;
    billingDate: string;
    remainingPayments?: number;
    monthlyCharge?: number;
  }[];
  goals: {
    description: string;
    targetAmount: number;
    currency?: CapitalCurrency;
    targetDate: string;
  }[];
};

export type OnboardingValidationResult =
  | { ok: true; payload: OnboardingPayload; openSections: string[] }
  | { ok: false; openSections: string[] };
