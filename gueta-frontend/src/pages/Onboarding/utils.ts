import type { UseFormReturnType } from "@mantine/form";
import type {
  ExpenseKind,
  ExpenseRecurrence,
  IncomeType,
  AvailableCashType,
  CapitalInvestmentType,
  CapitalCurrency,
} from "../../auth/authApi";
import { billingDayToDate, INFINITE_REMAINING_PAYMENTS, REQUIRED } from "../../finance/constants";
import {
  ERRORS,
  type OnboardingFormValues,
  type OnboardingSectionId,
  type OnboardingValidationResult,
} from "./consts";

export function isBlank(value: number | string | null): boolean {
  return value === "" || value === null || value === undefined;
}

function validateAvailableCash(
  form: UseFormReturnType<OnboardingFormValues>,
  values: OnboardingFormValues,
) {
  const items = [];
  let hasError = false;

  for (const [index, row] of values.availableCash.entries()) {
    const empty = !row.type && isBlank(row.amount);
    if (empty) continue;

    let valid = true;
    if (!row.type) {
      form.setFieldError(`availableCash.${index}.type`, REQUIRED);
      valid = false;
    }
    if (isBlank(row.amount)) {
      form.setFieldError(`availableCash.${index}.amount`, REQUIRED);
      valid = false;
    }
    if (!valid) {
      hasError = true;
      continue;
    }
    items.push({
      type: row.type as AvailableCashType,
      amount: Number(row.amount),
      currency: (row.currency || "ILS") as CapitalCurrency,
    });
  }

  return { hasError, items };
}

function validateInvestments(
  form: UseFormReturnType<OnboardingFormValues>,
  values: OnboardingFormValues,
) {
  const items = [];
  let hasError = false;

  for (const [index, row] of values.investments.entries()) {
    const empty = !row.type && isBlank(row.amount);
    if (empty) continue;

    let valid = true;
    if (!row.type) {
      form.setFieldError(`investments.${index}.type`, REQUIRED);
      valid = false;
    }
    if (isBlank(row.amount)) {
      form.setFieldError(`investments.${index}.amount`, REQUIRED);
      valid = false;
    }
    if (!valid) {
      hasError = true;
      continue;
    }
    items.push({
      type: row.type as CapitalInvestmentType,
      amount: Number(row.amount),
      currency: (row.currency || "ILS") as CapitalCurrency,
    });
  }

  return { hasError, items };
}

function validateFutureMoney(
  form: UseFormReturnType<OnboardingFormValues>,
  values: OnboardingFormValues,
) {
  const items = [];
  let hasError = false;

  for (const [index, row] of values.futureMoney.entries()) {
    const empty = !row.description.trim() && isBlank(row.amount);
    if (empty) continue;

    let valid = true;
    if (!row.description.trim()) {
      form.setFieldError(`futureMoney.${index}.description`, REQUIRED);
      valid = false;
    }
    if (isBlank(row.amount)) {
      form.setFieldError(`futureMoney.${index}.amount`, REQUIRED);
      valid = false;
    }
    if (!valid) {
      hasError = true;
      continue;
    }
    items.push({
      description: row.description.trim(),
      amount: Number(row.amount),
      currency: (row.currency || "ILS") as CapitalCurrency,
      expectedPaymentDate: row.expectedPaymentDate ?? null,
    });
  }

  return { hasError, items };
}

function validateIncomes(
  form: UseFormReturnType<OnboardingFormValues>,
  values: OnboardingFormValues,
) {
  const items = [];
  let hasError = false;

  for (const [index, row] of values.incomes.entries()) {
    const empty =
      !row.type &&
      !row.source.trim() &&
      !row.description.trim() &&
      isBlank(row.amount);
    if (empty) continue;

    let valid = true;
    if (!row.type) {
      form.setFieldError(`incomes.${index}.type`, REQUIRED);
      valid = false;
    }
    if (!row.source.trim()) {
      form.setFieldError(`incomes.${index}.source`, REQUIRED);
      valid = false;
    }
    if (isBlank(row.amount)) {
      form.setFieldError(`incomes.${index}.amount`, REQUIRED);
      valid = false;
    }
    if (!valid) {
      hasError = true;
      continue;
    }
    items.push({
      type: row.type as IncomeType,
      source: row.source.trim(),
      description: row.description.trim(),
      amount: Number(row.amount),
      currency: (row.currency || "ILS") as CapitalCurrency,
    });
  }

  return { hasError, items };
}

function validateExpenses(
  form: UseFormReturnType<OnboardingFormValues>,
  values: OnboardingFormValues,
) {
  const items = [];
  let hasError = false;

  for (const [index, row] of values.expenses.entries()) {
    const isRecurring = row.recurrence !== "once";
    const empty =
      !row.categoryId &&
      !row.kind &&
      !row.name.trim() &&
      isBlank(row.amount) &&
      !row.description.trim() &&
      (isRecurring
        ? isBlank(row.remainingPayments) &&
          !row.remainingPaymentsInfinite &&
          isBlank(row.billingDay)
        : !row.billingDate);
    if (empty) continue;

    let valid = true;
    if (!row.recurrence) {
      form.setFieldError(`expenses.${index}.recurrence`, REQUIRED);
      valid = false;
    }
    if (!row.kind) {
      form.setFieldError(`expenses.${index}.kind`, REQUIRED);
      valid = false;
    }
    if (!row.categoryId) {
      form.setFieldError(`expenses.${index}.categoryId`, REQUIRED);
      valid = false;
    }
    if (!row.name.trim()) {
      form.setFieldError(`expenses.${index}.name`, REQUIRED);
      valid = false;
    }
    if (isBlank(row.amount)) {
      form.setFieldError(`expenses.${index}.amount`, REQUIRED);
      valid = false;
    }
    if (isRecurring) {
      if (!row.remainingPaymentsInfinite && isBlank(row.remainingPayments)) {
        form.setFieldError(`expenses.${index}.remainingPayments`, REQUIRED);
        valid = false;
      }
      if (row.kind === "debt" && isBlank(row.monthlyCharge)) {
        form.setFieldError(`expenses.${index}.monthlyCharge`, REQUIRED);
        valid = false;
      }
      if (isBlank(row.billingDay)) {
        form.setFieldError(`expenses.${index}.billingDay`, REQUIRED);
        valid = false;
      } else {
        const day = Number(row.billingDay);
        if (day < 1 || day > 31) {
          form.setFieldError(
            `expenses.${index}.billingDay`,
            ERRORS.billingDayRange,
          );
          valid = false;
        }
      }
    } else if (!row.billingDate) {
      form.setFieldError(`expenses.${index}.billingDate`, REQUIRED);
      valid = false;
    }
    if (!valid) {
      hasError = true;
      continue;
    }
    items.push({
      recurrence: row.recurrence as ExpenseRecurrence,
      kind: row.kind as ExpenseKind,
      categoryId: row.categoryId,
      name: row.name.trim(),
      amount: Number(row.amount),
      currency: (row.currency || "ILS") as CapitalCurrency,
      description: row.description.trim(),
      billingDate: isRecurring
        ? billingDayToDate(Number(row.billingDay))
        : (row.billingDate as string),
      ...(isRecurring
        ? {
            remainingPayments: row.remainingPaymentsInfinite
              ? INFINITE_REMAINING_PAYMENTS
              : Number(row.remainingPayments),
            ...(row.kind === "debt"
              ? {
                  monthlyCharge: Number(row.monthlyCharge),
                }
              : {}),
          }
        : {}),
    });
  }

  return { hasError, items };
}

function validateGoals(
  form: UseFormReturnType<OnboardingFormValues>,
  values: OnboardingFormValues,
) {
  const items = [];
  let hasError = false;

  for (const [index, row] of values.goals.entries()) {
    const empty =
      !row.description.trim() && isBlank(row.targetAmount) && !row.targetDate;
    if (empty) continue;

    let valid = true;
    if (!row.description.trim()) {
      form.setFieldError(`goals.${index}.description`, REQUIRED);
      valid = false;
    }
    if (isBlank(row.targetAmount)) {
      form.setFieldError(`goals.${index}.targetAmount`, REQUIRED);
      valid = false;
    }
    if (!row.targetDate) {
      form.setFieldError(`goals.${index}.targetDate`, REQUIRED);
      valid = false;
    }
    if (!valid) {
      hasError = true;
      continue;
    }
    items.push({
      description: row.description.trim(),
      targetAmount: Number(row.targetAmount),
      currency: (row.currency || "ILS") as CapitalCurrency,
      targetDate: row.targetDate as string,
    });
  }

  return { hasError, items };
}

export function validateOnboardingSection(
  form: UseFormReturnType<OnboardingFormValues>,
  values: OnboardingFormValues,
  section: OnboardingSectionId,
): boolean {
  if (section === "capital") {
    const available = validateAvailableCash(form, values);
    const investments = validateInvestments(form, values);
    const future = validateFutureMoney(form, values);
    return !available.hasError && !investments.hasError && !future.hasError;
  }

  if (section === "incomes") {
    return !validateIncomes(form, values).hasError;
  }

  if (section === "expenses") {
    return !validateExpenses(form, values).hasError;
  }

  return !validateGoals(form, values).hasError;
}

export function validateOnboardingForm(
  form: UseFormReturnType<OnboardingFormValues>,
  values: OnboardingFormValues,
  openSections: string[],
): OnboardingValidationResult {
  form.clearErrors();
  const openNext = new Set(openSections);
  let hasError = false;

  const availableCash = validateAvailableCash(form, values);
  if (availableCash.hasError) {
    hasError = true;
    openNext.add("capital");
  }

  const investments = validateInvestments(form, values);
  if (investments.hasError) {
    hasError = true;
    openNext.add("capital");
  }

  const futureMoney = validateFutureMoney(form, values);
  if (futureMoney.hasError) {
    hasError = true;
    openNext.add("capital");
  }

  const incomes = validateIncomes(form, values);
  if (incomes.hasError) {
    hasError = true;
    openNext.add("incomes");
  }

  const expenses = validateExpenses(form, values);
  if (expenses.hasError) {
    hasError = true;
    openNext.add("expenses");
  }

  const goals = validateGoals(form, values);
  if (goals.hasError) {
    hasError = true;
    openNext.add("goals");
  }

  if (hasError) {
    return { ok: false, openSections: [...openNext] };
  }

  return {
    ok: true,
    payload: {
      availableCash: availableCash.items,
      investments: investments.items,
      futureMoney: futureMoney.items,
      incomes: incomes.items,
      expenses: expenses.items,
      goals: goals.items,
    },
    openSections: [...openNext],
  };
}
