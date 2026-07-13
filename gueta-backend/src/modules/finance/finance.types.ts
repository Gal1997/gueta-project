import type { Goal, Income, SpendingCategory } from "@prisma/client";
import type { ExchangeRates } from "../../lib/exchangeRates";
import type { MappedExpense } from "../../lib/moneyMappers";

export interface FinanceData {
  categories: SpendingCategory[];
  incomes: Income[];
  expenses: MappedExpense[];
  goals: Goal[];
  monthlySavings: number;
  accumulatedSavings: number;
  exchangeRates: ExchangeRates;
}
