import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import type {
  InvestmentUpdateMode,
  StoredAvailableCash,
  StoredCapitalInvestment,
  StoredFutureMoney,
} from "../../../auth/authApi";
import type { CapitalEntity } from "../consts";
import { ENTITY_TITLES } from "./consts";
import {
  ERRORS,
  submitAvailableForm,
  submitFutureForm,
  submitInvestmentForm,
} from "./utils";
import { isValidInvestmentUrl } from "./investmentUrl";

interface UseCapitalModalParams {
  opened: boolean;
  entity: CapitalEntity;
  mode: "add" | "edit";
  recordId?: string;
  initialAvailable?: StoredAvailableCash | null;
  initialInvestment?: StoredCapitalInvestment | null;
  investmentUpdateMode?: InvestmentUpdateMode;
  initialFuture?: StoredFutureMoney | null;
  onSaved: () => void;
  onClose: () => void;
}

export function useCapitalModal({
  opened,
  entity,
  mode,
  recordId,
  initialAvailable,
  initialInvestment,
  investmentUpdateMode = "valuation",
  initialFuture,
  onSaved,
  onClose,
}: UseCapitalModalParams) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const availableForm = useForm({
    initialValues: {
      type: "",
      amount: "" as number | string,
      currency: "ILS",
      description: "",
    },
    validate: {
      type: (value) => (value ? null : "נדרש סוג"),
      amount: (value) =>
        value === "" || Number(value) < 0 ? "נדרש סכום תקין" : null,
      description: (value) =>
        value.trim().length <= 200 ? null : "התיאור ארוך מדי",
    },
  });

  const investmentForm = useForm({
    initialValues: {
      type: "",
      amount: "" as number | string,
      principalAmount: "" as number | string,
      currency: "ILS",
      url: "",
      description: "",
      updateMode: "valuation" as InvestmentUpdateMode,
      contribution: "" as number | string,
      valuationAmount: "" as number | string,
    },
    validate: {
      type: (value) => (value ? null : "נדרש סוג"),
      amount: (value) => {
        if (mode === "edit") return null;
        return value === "" || Number(value) < 0 ? "נדרש סכום תקין" : null;
      },
      url: (value, values) => {
        const shouldValidate =
          mode === "add" || (mode === "edit" && values.updateMode === "link");
        if (!shouldValidate) return null;
        return isValidInvestmentUrl(value) ? null : "נדרש קישור תקין";
      },
      description: (value, values) => {
        const shouldValidate =
          mode === "add" ||
          (mode === "edit" && values.updateMode === "description");
        if (!shouldValidate) return null;
        return value.trim().length <= 200 ? null : "התיאור ארוך מדי";
      },
      contribution: (value, values) => {
        if (mode !== "edit" || values.updateMode !== "contribution") return null;
        if (value === "" || Number(value) === 0) {
          return "נדרש סכום שונה מאפס";
        }

        const delta = Number(value);
        const currentAmount = Number(values.amount) || 0;
        const currentPrincipal = Number(values.principalAmount) || 0;

        if (delta < 0) {
          const maxWithdrawal = Math.min(currentAmount, currentPrincipal);
          if (-delta > maxWithdrawal) {
            return "סכום המשיכה גבוה מהיתרה";
          }
        }

        return null;
      },
      valuationAmount: (value, values) => {
        if (mode !== "edit" || values.updateMode !== "valuation") return null;
        return value === "" || Number(value) < 0 ? "נדרש סכום תקין" : null;
      },
    },
  });

  const futureForm = useForm({
    initialValues: {
      description: "",
      amount: "" as number | string,
      currency: "ILS",
      expectedPaymentDate: null as string | null,
    },
    validate: {
      description: (value) =>
        value.trim().length > 0 ? null : "נדרש תיאור",
      amount: (value) =>
        value === "" || Number(value) < 0 ? "נדרש סכום תקין" : null,
    },
  });

  useEffect(() => {
    if (!opened) return;

    setError("");
    availableForm.clearErrors();
    investmentForm.clearErrors();
    futureForm.clearErrors();

    if (entity === "available") {
      availableForm.setValues({
        type: initialAvailable?.type ?? "",
        amount: initialAvailable?.amount ?? "",
        currency: initialAvailable?.currency ?? "ILS",
        description: initialAvailable?.description ?? "",
      });
    } else if (entity === "investment") {
      investmentForm.setValues({
        type: initialInvestment?.type ?? "",
        amount: initialInvestment?.amount ?? "",
        principalAmount: initialInvestment?.principalAmount ?? "",
        currency: initialInvestment?.currency ?? "ILS",
        url: initialInvestment?.url ?? "",
        description: initialInvestment?.description ?? "",
        updateMode: investmentUpdateMode,
        contribution: "",
        valuationAmount: initialInvestment?.amount ?? "",
      });
    } else {
      futureForm.setValues({
        description: initialFuture?.description ?? "",
        amount: initialFuture?.amount ?? "",
        currency: initialFuture?.currency ?? "ILS",
        expectedPaymentDate: initialFuture?.expectedPaymentDate ?? null,
      });
    }
  }, [
    opened,
    entity,
    mode,
    initialAvailable,
    initialInvestment,
    investmentUpdateMode,
    initialFuture,
  ]);

  const title = ENTITY_TITLES[entity][mode];

  async function handleSubmit() {
    setError("");
    setSaving(true);
    try {
      if (entity === "available") {
        const validation = availableForm.validate();
        if (validation.hasErrors) return;
        await submitAvailableForm(mode, recordId, availableForm.getValues());
      } else if (entity === "investment") {
        const validation = investmentForm.validate();
        if (validation.hasErrors) return;
        await submitInvestmentForm(mode, recordId, investmentForm.getValues());
      } else {
        const validation = futureForm.validate();
        if (validation.hasErrors) return;
        await submitFutureForm(mode, recordId, futureForm.getValues());
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : ERRORS.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  return {
    title,
    saving,
    error,
    availableForm,
    investmentForm,
    futureForm,
    handleSubmit,
  };
}
