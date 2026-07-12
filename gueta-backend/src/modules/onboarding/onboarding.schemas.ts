import { z } from "zod";
import {
  availableCashSchema,
  capitalInvestmentSchema,
  futureMoneySchema,
} from "../capital/capital.schemas";
import {
  expenseSchema,
  goalSchema,
  incomeSchema,
} from "../finance/finance.schemas";

export { expenseSchema, goalSchema, incomeSchema };

export const onboardingSchema = z.object({
  availableCash: z.array(availableCashSchema).default([]),
  investments: z.array(capitalInvestmentSchema).default([]),
  futureMoney: z.array(futureMoneySchema).default([]),
  incomes: z.array(incomeSchema).default([]),
  expenses: z.array(expenseSchema).default([]),
  goals: z.array(goalSchema).default([]),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
