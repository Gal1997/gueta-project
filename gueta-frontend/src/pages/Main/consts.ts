import type {
  ExpenseKind,
  FinanceData,
  StoredExpense,
  StoredGoal,
  StoredIncome,
} from "../../auth/authApi";
import type { FinanceEntity } from "./FinanceModal/consts";

export const PIE_PALETTE = [
  "#4f8cff",
  "#3ecf8e",
  "#b197fc",
  "#ffa94d",
  "#ff6b6b",
  "#22b8cf",
  "#f783ac",
  "#ffd43b",
  "#748ffc",
  "#63e6be",
];

export const EXPENSE_TYPE_COLORS = {
  once: "#ffd43b",
  fixed: "#3ecf8e",
  debt: "#ff6b6b",
} as const;

export const SAVINGS_CHART_COLORS = {
  income: "#3ecf8e",
  expenses: "#ff6b6b",
  goals: "#b197fc",
  savingsPositive: "#4f8cff",
  savingsNegative: "#ff6b6b",
} as const;

import { MONEY_DECIMAL_SCALE } from "../../finance/money";

export const numberFormat = new Intl.NumberFormat("he-IL", {
  minimumFractionDigits: 0,
  maximumFractionDigits: MONEY_DECIMAL_SCALE,
});

export const currency = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  minimumFractionDigits: 0,
  maximumFractionDigits: MONEY_DECIMAL_SCALE,
});

export const monthLabel = new Intl.DateTimeFormat("he-IL", {
  month: "long",
  year: "numeric",
}).format(new Date());

export const CHART_TICK = { fill: "var(--mantine-color-dimmed)", fontSize: 12 };

export const BAR_CHART_MARGIN = { top: 12, right: 16, left: 4, bottom: 8 };

export const ERRORS = {
  loadFailed: "טעינת הנתונים נכשלה.",
  deleteFailed: "מחיקה נכשלה.",
  refreshFailed: "רענון הנתונים נכשל.",
} as const;

export const EXPENSE_BOX_CONFIG = [
  {
    key: "once",
    title: "הוצאות חד פעמיות",
    variant: "once" as const,
    emptyText: "אין הוצאות חד-פעמיות החודש.",
    filter: (expense: StoredExpense) => expense.kind === "once",
  },
  {
    key: "fixed",
    title: "הוצאות קבועות",
    variant: "recurring" as const,
    emptyText: "אין הוצאות קבועות.",
    filter: (expense: StoredExpense) => expense.kind === "fixed",
  },
  {
    key: "debt",
    title: "חוב",
    variant: "recurring" as const,
    emptyText: "אין חובות.",
    filter: (expense: StoredExpense) => expense.kind === "debt",
    showMonthlyCharge: true,
  },
];

export type ModalState = {
  entity: FinanceEntity;
  mode: "add" | "edit";
  recordId?: string;
  expensePreset?: ExpenseKind;
  income?: StoredIncome;
  expense?: StoredExpense;
  goal?: StoredGoal;
};

export type DeleteState = {
  entity: FinanceEntity;
  recordId: string;
  label: string;
};

export type KpiItem = {
  label: string;
  value: number;
  className: string;
};

export type ChartEntry = {
  name: string;
  value: number;
  color?: string;
};

export type ExpenseBoxItem = {
  key: string;
  title: string;
  expenses: StoredExpense[];
  variant: "once" | "recurring";
  emptyText: string;
  showMonthlyCharge?: boolean;
};

export type MainViewModel = {
  data: FinanceData | null;
  loading: boolean;
  error: string;
  loggingOut: boolean;
  modal: ModalState | null;
  deleteTarget: DeleteState | null;
  deleting: boolean;
  incomes: StoredIncome[];
  goals: StoredGoal[];
  orderedExpenseBoxes: ExpenseBoxItem[];
  kpis: KpiItem[];
  spendingData: ChartEntry[];
  savingsData: ChartEntry[];
  expenseTypeData: ChartEntry[];
  totalIncome: number;
  totalExpenses: number;
  totalGoals: number;
  savings: number;
  accumulated: number;
};
