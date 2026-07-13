import type {
  AvailableCash,
  CapitalInvestment,
  CategoryAllocation,
  Expense,
  FutureMoney,
  Goal,
  Income,
  SpendingCategory,
} from "@prisma/client";
import { fromMinorUnits } from "./money";

export interface MappedSpendingCategory {
  id: string;
  name: string;
  color: string;
  isSystem: boolean;
  sortOrder: number;
}

export type MappedExpense = ReturnType<typeof mapExpenseAmounts<Expense>> & {
  kind: Expense["kind"];
  categoryId: string;
  category: MappedSpendingCategory;
};

function mapSpendingCategory(category: SpendingCategory): MappedSpendingCategory {
  return {
    id: category.id,
    name: category.name,
    color: category.color,
    isSystem: category.isSystem,
    sortOrder: category.sortOrder,
  };
}

export function mapIncomeAmounts<T extends { amount: number }>(record: T): T {
  return { ...record, amount: fromMinorUnits(record.amount) };
}

export function mapExpenseAmounts<
  T extends { amount: number; monthlyCharge?: number | null },
>(record: T): T {
  return {
    ...record,
    amount: fromMinorUnits(record.amount),
    monthlyCharge:
      record.monthlyCharge != null
        ? fromMinorUnits(record.monthlyCharge)
        : null,
  };
}

export function mapGoalAmounts<T extends { targetAmount: number }>(record: T): T {
  return { ...record, targetAmount: fromMinorUnits(record.targetAmount) };
}

export function mapAvailableCashAmounts<T extends { amount: number }>(
  record: T,
): T {
  return { ...record, amount: fromMinorUnits(record.amount) };
}

export function mapInvestmentAmounts<
  T extends { amount: number; principalAmount: number },
>(record: T): T {
  return {
    ...record,
    amount: fromMinorUnits(record.amount),
    principalAmount: fromMinorUnits(record.principalAmount),
  };
}

export function mapFutureMoneyAmounts<T extends { amount: number }>(record: T): T {
  return { ...record, amount: fromMinorUnits(record.amount) };
}

export function mapCapitalSummary<
  T extends {
    totalCapital: number;
    availableTotal: number;
    investmentTotal: number;
    investmentReturnTotal: number;
    investmentPrincipalTotal: number;
    futureTotal: number;
    lastMonthTotal: number;
    totalDelta: number;
  },
>(summary: T): T {
  return {
    ...summary,
    totalCapital: fromMinorUnits(summary.totalCapital),
    availableTotal: fromMinorUnits(summary.availableTotal),
    investmentTotal: fromMinorUnits(summary.investmentTotal),
    investmentReturnTotal: fromMinorUnits(summary.investmentReturnTotal),
    investmentPrincipalTotal: fromMinorUnits(summary.investmentPrincipalTotal),
    futureTotal: fromMinorUnits(summary.futureTotal),
    lastMonthTotal: fromMinorUnits(summary.lastMonthTotal),
    totalDelta: fromMinorUnits(summary.totalDelta),
  };
}

export function mapIncome(record: Income) {
  return mapIncomeAmounts(record);
}

export function mapExpense(
  record: Expense & { category: SpendingCategory },
): MappedExpense {
  const { category, ...expense } = record;
  return {
    ...mapExpenseAmounts(expense),
    kind: expense.kind,
    categoryId: expense.categoryId,
    category: mapSpendingCategory(category),
  };
}

export function mapGoal(record: Goal) {
  return mapGoalAmounts(record);
}

export function mapCategoryAllocation(
  record: CategoryAllocation & { category: SpendingCategory },
) {
  const { category, ...allocation } = record;
  return {
    ...mapIncomeAmounts(allocation),
    categoryId: allocation.categoryId,
    currency: allocation.currency,
    category: mapSpendingCategory(category),
  };
}

export function mapAvailableCash(record: AvailableCash) {
  return mapAvailableCashAmounts(record);
}

export function mapInvestment(record: CapitalInvestment) {
  return mapInvestmentAmounts(record);
}

export function mapFutureMoney(record: FutureMoney) {
  return mapFutureMoneyAmounts(record);
}
