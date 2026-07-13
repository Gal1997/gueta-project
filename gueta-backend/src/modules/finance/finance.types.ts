import type { Goal, Income, SpendingCategory } from "@prisma/client";
import type { ExchangeRates } from "../../lib/exchangeRates";
import type {
  MappedCategoryAllocation,
  MappedExpense,
} from "../../lib/moneyMappers";

export interface FinanceData {
  categories: SpendingCategory[];
  allocations: MappedCategoryAllocation[];
  incomes: Income[];
  expenses: MappedExpense[];
  goals: Goal[];
  monthlySavings: number;
  accumulatedSavings: number;
  exchangeRates: ExchangeRates;
}
