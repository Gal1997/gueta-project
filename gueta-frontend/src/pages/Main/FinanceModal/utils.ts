import type { UseFormReturnType } from "@mantine/form";
import {
  createExpense,
  createGoal,
  createIncome,
  updateExpense,
  updateGoal,
  updateIncome,
} from "../../../auth/authApi";
import type {
  ExpenseCategory,
  ExpenseRecurrence,
  IncomeType,
  CapitalCurrency,
} from "../../../auth/authApi";
import { billingDayToDate, INFINITE_REMAINING_PAYMENTS, REQUIRED } from "../../../finance/constants";
import { defaultDebtMonthlyCharge, debtTotalPayments } from "../../../finance/expenseUtils";
import { ERRORS, type ExpenseFormValues, type GoalFormValues, type IncomeFormValues } from "./consts";

function resolveSubmitDebtMonthlyCharge(values: ExpenseFormValues): number {
  const amount = Number(values.amount);
  const totalPayments = debtTotalPayments(values);
  if (values.monthlyChargeUseDefault) {
    return defaultDebtMonthlyCharge(amount, totalPayments);
  }
  return Number(values.monthlyCharge);
}

export function isBlank(value: number | string | null): boolean {
  return value === "" || value === null || value === undefined;
}

export async function submitIncomeForm(
  form: UseFormReturnType<IncomeFormValues>,
  mode: "add" | "edit",
  recordId?: string,
): Promise<boolean> {
  form.clearErrors();
  const values = form.getValues();
  let valid = true;

  if (!values.type) {
    form.setFieldError("type", REQUIRED);
    valid = false;
  }
  if (!values.source.trim()) {
    form.setFieldError("source", REQUIRED);
    valid = false;
  }
  if (isBlank(values.amount)) {
    form.setFieldError("amount", REQUIRED);
    valid = false;
  }
  if (!valid) return false;

  const payload = {
    type: values.type as IncomeType,
    source: values.source.trim(),
    description: values.description.trim(),
    amount: Number(values.amount),
    currency: values.currency as CapitalCurrency,
  };

  if (mode === "edit" && recordId) {
    await updateIncome(recordId, payload);
  } else {
    await createIncome(payload);
  }

  return true;
}

export async function submitExpenseForm(
  form: UseFormReturnType<ExpenseFormValues>,
  mode: "add" | "edit",
  recordId?: string,
): Promise<boolean> {
  form.clearErrors();
  const values = form.getValues();
  let valid = true;

  if (!values.recurrence) {
    form.setFieldError("recurrence", REQUIRED);
    valid = false;
  }
  if (!values.category) {
    form.setFieldError("category", REQUIRED);
    valid = false;
  }
  if (!values.name.trim()) {
    form.setFieldError("name", REQUIRED);
    valid = false;
  }
  if (isBlank(values.amount)) {
    form.setFieldError("amount", REQUIRED);
    valid = false;
  }

  const isRecurring = values.recurrence === "recurring";
  if (isRecurring) {
    if (!values.remainingPaymentsInfinite && isBlank(values.remainingPayments)) {
      form.setFieldError("remainingPayments", REQUIRED);
      valid = false;
    }
    if (isBlank(values.billingDay)) {
      form.setFieldError("billingDay", REQUIRED);
      valid = false;
    } else {
      const day = Number(values.billingDay);
      if (day < 1 || day > 31) {
        form.setFieldError("billingDay", ERRORS.billingDayRange);
        valid = false;
      }
    }
    if (
      values.category === "debt" &&
      !values.monthlyChargeUseDefault &&
      isBlank(values.monthlyCharge)
    ) {
      form.setFieldError("monthlyCharge", REQUIRED);
      valid = false;
    }
  } else if (!values.billingDate) {
    form.setFieldError("billingDate", REQUIRED);
    valid = false;
  }

  if (!valid) return false;

  const payload = {
    recurrence: values.recurrence as ExpenseRecurrence,
    category: values.category as ExpenseCategory,
    name: values.name.trim(),
    amount: Number(values.amount),
    currency: values.currency as CapitalCurrency,
    description: values.description.trim(),
    billingDate: isRecurring
      ? billingDayToDate(Number(values.billingDay))
      : (values.billingDate as string),
    ...(isRecurring
      ? {
          remainingPayments: values.remainingPaymentsInfinite
            ? INFINITE_REMAINING_PAYMENTS
            : Number(values.remainingPayments),
          ...(values.category === "debt"
            ? {
                monthlyCharge: resolveSubmitDebtMonthlyCharge(values),
              }
            : {}),
        }
      : {}),
  };

  if (mode === "edit" && recordId) {
    await updateExpense(recordId, payload);
  } else {
    await createExpense(payload);
  }

  return true;
}

export async function submitGoalForm(
  form: UseFormReturnType<GoalFormValues>,
  mode: "add" | "edit",
  recordId?: string,
): Promise<boolean> {
  form.clearErrors();
  const values = form.getValues();
  let valid = true;

  if (!values.description.trim()) {
    form.setFieldError("description", REQUIRED);
    valid = false;
  }
  if (isBlank(values.targetAmount)) {
    form.setFieldError("targetAmount", REQUIRED);
    valid = false;
  }
  if (!values.targetDate) {
    form.setFieldError("targetDate", REQUIRED);
    valid = false;
  }
  if (!valid) return false;

  const payload = {
    description: values.description.trim(),
    targetAmount: Number(values.targetAmount),
    currency: values.currency as CapitalCurrency,
    targetDate: values.targetDate as string,
  };

  if (mode === "edit" && recordId) {
    await updateGoal(recordId, payload);
  } else {
    await createGoal(payload);
  }

  return true;
}
