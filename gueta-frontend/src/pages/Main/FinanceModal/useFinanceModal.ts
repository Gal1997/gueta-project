import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import type {
  SpendingCategory,
  StoredExpense,
  StoredGoal,
  StoredIncome,
} from "../../../auth/authApi";
import { dateToBillingDay } from "../../../finance/constants";
import {
  debtMonthlyChargeForForm,
  isDebtMonthlyChargeDefault,
  isInfiniteRemainingPayments,
} from "../../../finance/expenseUtils";
import { ENTITY_TITLES, ERRORS, type FinanceEntity } from "./consts";
import {
  submitExpenseForm,
  submitGoalForm,
  submitIncomeForm,
} from "./utils";

interface UseFinanceModalParams {
  opened: boolean;
  entity: FinanceEntity;
  mode: "add" | "edit";
  recordId?: string;
  initialIncome?: StoredIncome | null;
  initialExpense?: StoredExpense | null;
  initialGoal?: StoredGoal | null;
  categories: SpendingCategory[];
  onSaved: () => void;
  onClose: () => void;
}

export function useFinanceModal({
  opened,
  entity,
  mode,
  recordId,
  initialIncome,
  initialExpense,
  initialGoal,
  categories,
  onSaved,
  onClose,
}: UseFinanceModalParams) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [expenseRecurrence, setExpenseRecurrence] = useState("recurring");

  const incomeForm = useForm({
    initialValues: {
      type: "",
      source: "",
      description: "",
      currency: "ILS",
      amount: "" as number | string,
    },
  });

  const expenseForm = useForm({
    initialValues: {
      recurrence: "recurring",
      kind: "fixed",
      categoryId: "",
      name: "",
      currency: "ILS",
      amount: "" as number | string,
      description: "",
      remainingPayments: "" as number | string,
      remainingPaymentsInfinite: false,
      totalPayments: "" as number | string,
      monthlyCharge: "" as number | string,
      monthlyChargeUseDefault: true,
      billingDay: "" as number | string,
      billingDate: null as string | null,
    },
  });

  const goalForm = useForm({
    initialValues: {
      description: "",
      currency: "ILS",
      targetAmount: "" as number | string,
      targetDate: null as string | null,
    },
  });

  useEffect(() => {
    if (!opened) return;

    setError("");
    incomeForm.clearErrors();
    expenseForm.clearErrors();
    goalForm.clearErrors();

    if (entity === "income") {
      incomeForm.setValues({
        type: initialIncome?.type ?? "",
        source: initialIncome?.source ?? "",
        description: initialIncome?.description ?? "",
        currency: initialIncome?.currency ?? "ILS",
        amount: initialIncome?.amount ?? "",
      });
    }

    if (entity === "expense") {
      const recurrence = initialExpense?.recurrence ?? "recurring";
      setExpenseRecurrence(recurrence);
      expenseForm.setValues({
        recurrence,
        kind: initialExpense?.kind ?? (recurrence === "once" ? "once" : "fixed"),
        categoryId: initialExpense?.categoryId ?? categories[0]?.id ?? "",
        name: initialExpense?.name ?? "",
        currency: initialExpense?.currency ?? "ILS",
        amount: initialExpense?.amount ?? "",
        description: initialExpense?.description ?? "",
        remainingPayments: initialExpense &&
          isInfiniteRemainingPayments(initialExpense.remainingPayments)
          ? ""
          : (initialExpense?.remainingPayments ?? ""),
        remainingPaymentsInfinite: initialExpense
          ? isInfiniteRemainingPayments(initialExpense.remainingPayments)
          : false,
        totalPayments:
          initialExpense?.totalPayments ??
          initialExpense?.remainingPayments ??
          "",
        monthlyCharge: debtMonthlyChargeForForm(initialExpense),
        monthlyChargeUseDefault: isDebtMonthlyChargeDefault(initialExpense),
        billingDay: initialExpense
          ? dateToBillingDay(initialExpense.billingDate)
          : "",
        billingDate:
          recurrence === "once" && initialExpense
            ? initialExpense.billingDate
            : null,
      });
    }

    if (entity === "goal") {
      goalForm.setValues({
        description: initialGoal?.description ?? "",
        currency: initialGoal?.currency ?? "ILS",
        targetAmount: initialGoal?.targetAmount ?? "",
        targetDate: initialGoal?.targetDate ?? null,
      });
    }
  }, [opened, entity, mode, initialIncome, initialExpense, initialGoal, categories]);

  async function handleSubmit() {
    setError("");
    setSaving(true);

    try {
      let saved = false;

      if (entity === "income") {
        saved = await submitIncomeForm(incomeForm, mode, recordId);
      } else if (entity === "expense") {
        saved = await submitExpenseForm(expenseForm, mode, recordId);
      } else {
        saved = await submitGoalForm(goalForm, mode, recordId);
      }

      if (!saved) return;

      onSaved();
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : ERRORS.submitFailed,
      );
    } finally {
      setSaving(false);
    }
  }

  function handleRecurrenceChange(value: string | null) {
    const next = value ?? "recurring";
    setExpenseRecurrence(next);
    expenseForm.setFieldValue("recurrence", next);
    expenseForm.setFieldValue("kind", next === "once" ? "once" : "fixed");
    expenseForm.setFieldValue("remainingPaymentsInfinite", false);
    expenseForm.setFieldValue("monthlyChargeUseDefault", true);
    expenseForm.setFieldValue("totalPayments", "");
    expenseForm.setFieldValue("monthlyCharge", "");
  }

  const title = ENTITY_TITLES[entity][mode];
  const isRecurringExpense = expenseRecurrence === "recurring";

  return {
    title,
    saving,
    error,
    expenseRecurrence,
    isRecurringExpense,
    incomeForm,
    expenseForm,
    goalForm,
    handleSubmit,
    handleRecurrenceChange,
  };
}
