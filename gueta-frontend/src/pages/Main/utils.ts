import dayjs from "dayjs";
import type { CapitalCurrency, FinanceData, StoredExpense, StoredGoal } from "../../auth/authApi";
import { convertToIls } from "../../finance/currency";
import { isActiveExpense, monthlyExpenseAmount } from "../../finance/expenseUtils";
import {
  currency,
  EXPENSE_BOX_CONFIG,
  EXPENSE_TYPE_COLORS,
  numberFormat,
  SAVINGS_CHART_COLORS,
  type ChartEntry,
  type ExpenseBoxItem,
  type KpiItem,
} from "./consts";

const DEFAULT_RATES: Record<CapitalCurrency, number> = {
  ILS: 1,
  USD: 1,
  EUR: 1,
};

function getRates(data: FinanceData | null): Record<CapitalCurrency, number> {
  return data?.exchangeRates?.toIls ?? DEFAULT_RATES;
}

export function formatAxisTick(value: number): string {
  const abs = Math.abs(value);
  const prefix = value < 0 ? "-" : "";
  if (abs >= 1000) return `${prefix}${Math.round(abs / 1000)}k`;
  return `${prefix}${abs}`;
}

export function formatTooltipAmount(value: unknown): string {
  const amount = numberFormat.format(Number(value));
  return `\u2066${amount} ₪\u2069`;
}

export function monthlyForGoal(
  goal: StoredGoal,
  rates: Record<CapitalCurrency, number> = DEFAULT_RATES,
): number {
  const ilsAmount = convertToIls(goal.targetAmount, goal.currency, rates);
  const months = Math.max(
    1,
    Math.ceil(dayjs(goal.targetDate).diff(dayjs(), "month", true)),
  );
  return Math.ceil(ilsAmount / months);
}

export function formatDate(value: string): string {
  return dayjs(value).format("DD/MM/YYYY");
}

export function sumAmount(
  items: StoredExpense[],
  rates: Record<CapitalCurrency, number> = DEFAULT_RATES,
): number {
  return items.reduce(
    (sum, item) =>
      sum +
      convertToIls(monthlyExpenseAmount(item), item.currency, rates),
    0,
  );
}

export function buildExpenseBoxes(activeExpenses: StoredExpense[]): ExpenseBoxItem[] {
  return EXPENSE_BOX_CONFIG.map((config) => ({
    key: config.key,
    title: config.title,
  variant: config.variant,
  emptyText: config.emptyText,
  showMonthlyCharge: config.showMonthlyCharge,
  expenses: activeExpenses.filter(config.filter),
  }));
}

export function orderExpenseBoxes(boxes: ExpenseBoxItem[]): ExpenseBoxItem[] {
  return [...boxes].sort((a, b) => b.expenses.length - a.expenses.length);
}

export function buildKpis(
  totalIncome: number,
  totalExpenses: number,
  totalGoals: number,
  savings: number,
  accumulated: number,
  kpiClasses: {
    income: string;
    expense: string;
    goal: string;
    savings: string;
    accumulated: string;
  },
): KpiItem[] {
  return [
    { label: "הכנסה חודשית", value: totalIncome, className: kpiClasses.income },
    { label: "הוצאה חודשית", value: totalExpenses, className: kpiClasses.expense },
    { label: "הפרשה למטרות", value: totalGoals, className: kpiClasses.goal },
    {
      label: "חיסכון חודשי",
      value: savings,
      className: savings >= 0 ? kpiClasses.savings : kpiClasses.expense,
    },
    {
      label: "חיסכון נצבר",
      value: accumulated,
      className: accumulated >= 0 ? kpiClasses.accumulated : kpiClasses.expense,
    },
  ];
}

export function buildSpendingData(
  expenses: StoredExpense[],
  rates: Record<CapitalCurrency, number> = DEFAULT_RATES,
): ChartEntry[] {
  return expenses.map((expense) => ({
    name: expense.name,
    value: convertToIls(
      monthlyExpenseAmount(expense),
      expense.currency,
      rates,
    ),
  }));
}

export function buildSavingsData(
  totalIncome: number,
  totalExpenses: number,
  totalGoals: number,
  savings: number,
): ChartEntry[] {
  return [
    { name: "הכנסות", value: totalIncome, color: SAVINGS_CHART_COLORS.income },
    { name: "הוצאות", value: totalExpenses, color: SAVINGS_CHART_COLORS.expenses },
    { name: "מטרות", value: totalGoals, color: SAVINGS_CHART_COLORS.goals },
    {
      name: "חיסכון",
      value: savings,
      color:
        savings >= 0
          ? SAVINGS_CHART_COLORS.savingsPositive
          : SAVINGS_CHART_COLORS.savingsNegative,
    },
  ];
}

export function buildExpenseTypeData(
  boxes: ExpenseBoxItem[],
  rates: Record<CapitalCurrency, number> = DEFAULT_RATES,
): ChartEntry[] {
  const once = boxes.find((box) => box.key === "once")?.expenses ?? [];
  const fixed = boxes.find((box) => box.key === "fixed")?.expenses ?? [];
  const debt = boxes.find((box) => box.key === "debt")?.expenses ?? [];

  return [
    { name: "חד פעמי", value: sumAmount(once, rates), color: EXPENSE_TYPE_COLORS.once },
    {
      name: "הוצאות קבועות",
      value: sumAmount(fixed, rates),
      color: EXPENSE_TYPE_COLORS.fixed,
    },
    { name: "חוב", value: sumAmount(debt, rates), color: EXPENSE_TYPE_COLORS.debt },
  ].filter((entry) => entry.value > 0);
}

export function computeFinanceSummary(data: FinanceData | null) {
  const rates = getRates(data);
  const incomes = data?.incomes ?? [];
  const expenses = data?.expenses ?? [];
  const goals = data?.goals ?? [];
  const activeExpenses = expenses.filter(isActiveExpense);
  const expenseBoxes = buildExpenseBoxes(activeExpenses);
  const orderedExpenseBoxes = orderExpenseBoxes(expenseBoxes);

  const totalIncome = incomes.reduce(
    (sum, item) => sum + convertToIls(item.amount, item.currency, rates),
    0,
  );
  const totalExpenses = activeExpenses.reduce(
    (sum, item) =>
      sum +
      convertToIls(monthlyExpenseAmount(item), item.currency, rates),
    0,
  );
  const totalGoals = goals.reduce(
    (sum, goal) => sum + monthlyForGoal(goal, rates),
    0,
  );
  const savings = data?.monthlySavings ?? totalIncome - totalExpenses - totalGoals;
  const accumulated = data?.accumulatedSavings ?? 0;

  return {
    incomes,
    goals,
    activeExpenses,
    orderedExpenseBoxes,
    totalIncome,
    totalExpenses,
    totalGoals,
    savings,
    accumulated,
    spendingData: buildSpendingData(activeExpenses, rates),
    expenseTypeData: buildExpenseTypeData(expenseBoxes, rates),
    savingsData: buildSavingsData(totalIncome, totalExpenses, totalGoals, savings),
  };
}

export { currency };
