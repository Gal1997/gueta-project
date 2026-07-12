import { z } from "zod";
import {
  moneyAmountSchema,
  positiveMoneyAmountSchema,
  signedMoneyAmountSchema,
} from "../../lib/money";

const optionalUrlSchema = z.preprocess(
  (value) => {
    if (value == null) return null;
    const trimmed = String(value).trim();
    return trimmed === "" ? null : trimmed;
  },
  z
    .string()
    .max(2048)
    .nullable()
    .refine(
      (value) => value === null || /^https?:\/\/.+/i.test(value),
      "URL must start with http:// or https://",
    ),
);

const optionalDescriptionSchema = z.preprocess(
  (value) => {
    if (value == null) return null;
    const trimmed = String(value).trim();
    return trimmed === "" ? null : trimmed;
  },
  z.string().max(200).nullable(),
);

const currencySchema = z.enum(["ILS", "USD", "EUR"]).default("ILS");

export const availableCashSchema = z.object({
  type: z.enum(["cash", "checking", "bit", "paybox", "daily_deposit", "other"]),
  amount: moneyAmountSchema(),
  currency: currencySchema.optional(),
  description: optionalDescriptionSchema.optional(),
});

export const capitalInvestmentSchema = z.object({
  type: z.enum([
    "deposit",
    "investments",
    "pension_fund",
    "real_estate",
    "other",
  ]),
  amount: moneyAmountSchema(),
  currency: currencySchema.optional(),
  url: optionalUrlSchema.optional(),
  description: optionalDescriptionSchema.optional(),
});

export const updateCapitalInvestmentSchema = z.discriminatedUnion("updateMode", [
  z.object({
    updateMode: z.literal("contribution"),
    contribution: signedMoneyAmountSchema(),
  }),
  z.object({
    updateMode: z.literal("valuation"),
    amount: moneyAmountSchema(),
  }),
  z.object({
    updateMode: z.literal("link"),
    url: optionalUrlSchema,
  }),
  z.object({
    updateMode: z.literal("description"),
    description: optionalDescriptionSchema,
  }),
]);

export const futureMoneySchema = z.object({
  description: z.string().trim().min(1, "Description is required"),
  amount: moneyAmountSchema(),
  currency: currencySchema.optional(),
  expectedPaymentDate: z.coerce.date().nullish(),
});

export const withdrawToCheckingSchema = z.object({
  amount: positiveMoneyAmountSchema(),
});

export type AvailableCashInput = z.infer<typeof availableCashSchema>;
export type CapitalInvestmentInput = z.infer<typeof capitalInvestmentSchema>;
export type UpdateCapitalInvestmentInput = z.infer<
  typeof updateCapitalInvestmentSchema
>;
export type FutureMoneyInput = z.infer<typeof futureMoneySchema>;
export type WithdrawToCheckingInput = z.infer<typeof withdrawToCheckingSchema>;
