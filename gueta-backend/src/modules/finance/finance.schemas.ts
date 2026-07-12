import { z } from "zod";
import { moneyAmountSchema, optionalMoneyAmountSchema } from "../../lib/money";
import { INFINITE_REMAINING_PAYMENTS } from "./finance.constants";

const currencySchema = z.enum(["ILS", "USD", "EUR"]).default("ILS");

export const incomeSchema = z.object({
  type: z.enum(["salary", "investments", "other"]),
  source: z.string().trim().min(1, "Source is required"),
  description: z.string().trim().default(""),
  amount: moneyAmountSchema(),
  currency: currencySchema.optional(),
});

const RECURRING_CATEGORIES = ["debt", "fixed"] as const;
const ONCE_CATEGORIES = ["food", "shopping", "fuel", "other"] as const;

export const expenseSchema = z
  .object({
    recurrence: z.enum(["recurring", "once"]).default("recurring"),
    category: z.enum(["debt", "fixed", "food", "shopping", "fuel", "other"]),
    name: z.string().trim().min(1, "Name is required"),
    amount: moneyAmountSchema(),
    currency: currencySchema.optional(),
    description: z.string().trim().default(""),
    remainingPayments: z
      .number()
      .int()
      .refine(
        (value) => value === INFINITE_REMAINING_PAYMENTS || value >= 0,
        "Remaining payments must be zero or more, or -1 for infinite",
      )
      .optional(),
    monthlyCharge: optionalMoneyAmountSchema(),
    billingDate: z.coerce.date(),
  })
  .superRefine((data, ctx) => {
    if (data.recurrence === "recurring" && data.remainingPayments === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "Remaining payments is required for recurring expenses",
        path: ["remainingPayments"],
      });
    }

    if (
      data.recurrence === "recurring" &&
      data.remainingPayments === INFINITE_REMAINING_PAYMENTS &&
      data.category !== "fixed"
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Infinite remaining payments are only allowed for fixed expenses",
        path: ["remainingPayments"],
      });
    }

    const allowed =
      data.recurrence === "once" ? ONCE_CATEGORIES : RECURRING_CATEGORIES;
    if (!(allowed as readonly string[]).includes(data.category)) {
      ctx.addIssue({
        code: "custom",
        message: "Category is not valid for this expense type",
        path: ["category"],
      });
    }
  })
  .transform((data) => {
    const remainingPayments =
      data.recurrence === "once" ? 1 : (data.remainingPayments as number);

    let monthlyCharge: number | null = null;
    if (
      data.category === "debt" &&
      data.recurrence === "recurring" &&
      remainingPayments > 0
    ) {
      // On create, remaining equals total; service stores totalPayments separately.
      monthlyCharge =
        data.monthlyCharge ??
        Math.round(data.amount / remainingPayments);
    }

    return {
      ...data,
      remainingPayments,
      monthlyCharge,
    };
  });

export const goalSchema = z.object({
  description: z.string().trim().min(1, "Description is required"),
  targetAmount: moneyAmountSchema(),
  currency: currencySchema.optional(),
  targetDate: z.coerce.date(),
});

export type IncomeInput = z.infer<typeof incomeSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type GoalInput = z.infer<typeof goalSchema>;
