import type {
  AvailableCash,
  CapitalInvestment,
  Expense,
  FutureMoney,
  Goal,
  Income,
} from "@prisma/client";
import { fromMinorUnits } from "./money";

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

export function mapExpense(record: Expense) {
  return mapExpenseAmounts(record);
}

export function mapGoal(record: Goal) {
  return mapGoalAmounts(record);
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
