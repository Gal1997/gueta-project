import {
  createAvailableCash,
  createCapitalInvestment,
  createFutureMoney,
  updateAvailableCash,
  updateCapitalInvestment,
  updateFutureMoney,
} from "../../../auth/authApi";
import type {
  AvailableCashInput,
  AvailableCashType,
  CapitalCurrency,
  CapitalInvestmentType,
  FutureMoneyInput,
} from "../../../auth/authApi";
import { ERRORS } from "./consts";
import { normalizeInvestmentUrl } from "./investmentUrl";
import { normalizeOptionalText } from "./optionalText";
import type {
  AvailableFormValues,
  FutureFormValues,
  InvestmentFormValues,
} from "./consts";

export async function submitAvailableForm(
  mode: "add" | "edit",
  recordId: string | undefined,
  values: AvailableFormValues,
): Promise<void> {
  const payload: AvailableCashInput = {
    type: values.type as AvailableCashType,
    amount: Number(values.amount),
    currency: values.currency as CapitalCurrency,
    description: normalizeOptionalText(values.description),
  };
  if (mode === "add") {
    await createAvailableCash(payload);
  } else if (recordId) {
    await updateAvailableCash(recordId, payload);
  }
}

export async function submitInvestmentForm(
  mode: "add" | "edit",
  recordId: string | undefined,
  values: InvestmentFormValues,
): Promise<void> {
  if (mode === "add") {
    await createCapitalInvestment({
      type: values.type as CapitalInvestmentType,
      amount: Number(values.amount),
      currency: values.currency as CapitalCurrency,
      url: normalizeInvestmentUrl(values.url),
      description: normalizeOptionalText(values.description),
    });
    return;
  }

  if (!recordId) return;

  if (values.updateMode === "contribution") {
    await updateCapitalInvestment(recordId, {
      updateMode: "contribution",
      contribution: Number(values.contribution),
    });
    return;
  }

  if (values.updateMode === "link") {
    await updateCapitalInvestment(recordId, {
      updateMode: "link",
      url: normalizeInvestmentUrl(values.url),
    });
    return;
  }

  if (values.updateMode === "description") {
    await updateCapitalInvestment(recordId, {
      updateMode: "description",
      description: normalizeOptionalText(values.description),
    });
    return;
  }

  await updateCapitalInvestment(recordId, {
    updateMode: "valuation",
    amount: Number(values.valuationAmount),
  });
}

export async function submitFutureForm(
  mode: "add" | "edit",
  recordId: string | undefined,
  values: FutureFormValues,
): Promise<void> {
  const payload: FutureMoneyInput = {
    description: values.description.trim(),
    amount: Number(values.amount),
    currency: values.currency as CapitalCurrency,
    expectedPaymentDate: values.expectedPaymentDate ?? null,
  };
  if (mode === "add") {
    await createFutureMoney(payload);
  } else if (recordId) {
    await updateFutureMoney(recordId, payload);
  }
}

export { ERRORS };
