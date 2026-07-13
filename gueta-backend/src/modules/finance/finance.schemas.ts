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

export const expenseSchema = z
  .object({
    recurrence: z.enum(["recurring", "once"]).default("recurring"),
    kind: z.enum(["debt", "fixed", "once"]),
    categoryId: z.string().trim().min(1, "Category is required"),
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
    if (data.recurrence === "once" && data.kind !== "once") {
      ctx.addIssue({
        code: "custom",
        message: "One-time expenses must use kind once",
        path: ["kind"],
      });
    }

    if (data.recurrence === "recurring" && data.kind === "once") {
      ctx.addIssue({
        code: "custom",
        message: "Recurring expenses must be debt or fixed",
        path: ["kind"],
      });
    }

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
      data.kind !== "fixed"
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Infinite remaining payments are only allowed for fixed expenses",
        path: ["remainingPayments"],
      });
    }
  })
  .transform((data) => {
    const remainingPayments =
      data.recurrence === "once" ? 1 : (data.remainingPayments as number);

    let monthlyCharge: number | null = null;
    if (
      data.kind === "debt" &&
      data.recurrence === "recurring" &&
      remainingPayments > 0
    ) {
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

export const categoryAllocationSchema = z.object({
  categoryId: z.string().trim().min(1, "Category is required"),
  amount: moneyAmountSchema(),
  currency: currencySchema.optional(),
});

export const categoryAllocationUpdateSchema = categoryAllocationSchema.partial().refine(
  (data) =>
    data.categoryId !== undefined ||
    data.amount !== undefined ||
    data.currency !== undefined,
  { message: "At least one field is required" },
);

export type CategoryAllocationInput = z.infer<typeof categoryAllocationSchema>;
export type CategoryAllocationUpdate = z.infer<
  typeof categoryAllocationUpdateSchema
>;
