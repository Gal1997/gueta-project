import type { Expense, Goal, Income } from "@prisma/client";
import type { ExchangeRates } from "../../lib/exchangeRates";

export interface FinanceData {
  incomes: Income[];
  expenses: Expense[];
  goals: Goal[];
  monthlySavings: number;
  accumulatedSavings: number;
  exchangeRates: ExchangeRates;
}
