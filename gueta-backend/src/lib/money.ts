import { z } from "zod";

export const MONEY_SCALE = 100;

export function toMinorUnits(amount: number): number {
  return Math.round(amount * MONEY_SCALE);
}

export function fromMinorUnits(minor: number): number {
  return minor / MONEY_SCALE;
}

export function hasAtMostTwoDecimalPlaces(amount: number): boolean {
  if (!Number.isFinite(amount)) return false;
  return Math.abs(Math.round(amount * MONEY_SCALE) - amount * MONEY_SCALE) < 1e-6;
}

const TWO_DECIMALS_MESSAGE = "Amount can have at most 2 decimal places";

export function moneyAmountSchema() {
  return z
    .number()
    .nonnegative("Amount must be zero or more")
    .refine(hasAtMostTwoDecimalPlaces, TWO_DECIMALS_MESSAGE)
    .transform(toMinorUnits);
}

export function positiveMoneyAmountSchema() {
  return z
    .number()
    .positive("Amount must be greater than zero")
    .refine(hasAtMostTwoDecimalPlaces, TWO_DECIMALS_MESSAGE)
    .transform(toMinorUnits);
}

export function signedMoneyAmountSchema() {
  return z
    .number()
    .refine(hasAtMostTwoDecimalPlaces, TWO_DECIMALS_MESSAGE)
    .refine((value) => value !== 0, "Amount cannot be zero")
    .transform(toMinorUnits);
}

export function optionalMoneyAmountSchema() {
  return z
    .number()
    .nonnegative("Amount must be zero or more")
    .refine(hasAtMostTwoDecimalPlaces, TWO_DECIMALS_MESSAGE)
    .transform(toMinorUnits)
    .optional();
}
