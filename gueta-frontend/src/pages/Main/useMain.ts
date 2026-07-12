import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import {
  deleteExpense,
  deleteGoal,
  deleteIncome,
  getFinanceData,
} from "../../auth/authApi";
import type {
  FinanceData,
  StoredExpense,
  StoredGoal,
  StoredIncome,
} from "../../auth/authApi";
import kpiClasses from "./components/KpiGrid/KpiGrid.module.css";
import expenseSectionClasses from "./components/ExpensesSection/ExpensesSection.module.css";
import { ERRORS, type DeleteState, type ModalState } from "./consts";
import type { FinanceEntity } from "./FinanceModal/consts";
import { buildKpis, computeFinanceSummary } from "./utils";

export function useMain() {
  const { user } = useAuth();
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<ModalState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteState | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    const result = await getFinanceData();
    setData(result);
  }, []);

  useEffect(() => {
    let active = true;
    loadData()
      .catch(() => {
        if (active) setError(ERRORS.loadFailed);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadData]);

  const summary = useMemo(() => computeFinanceSummary(data), [data]);

  const kpis = useMemo(
    () =>
      buildKpis(
        summary.totalIncome,
        summary.totalExpenses,
        summary.totalGoals,
        summary.savings,
        summary.accumulated,
        {
          income: kpiClasses.kpiIncome,
          expense: kpiClasses.kpiExpense,
          goal: kpiClasses.kpiGoal,
          savings: kpiClasses.kpiSavings,
          accumulated: kpiClasses.kpiAccumulated,
        },
      ),
    [summary],
  );

  const boxPlacement = [
    expenseSectionClasses.leftBox,
    expenseSectionClasses.rightTopBox,
    expenseSectionClasses.rightBottomBox,
  ];

  function openAdd(entity: FinanceEntity) {
    setModal({ entity, mode: "add" });
  }

  function openEdit(
    entity: FinanceEntity,
    record: StoredIncome | StoredExpense | StoredGoal,
  ) {
    if (entity === "income") {
      setModal({
        entity,
        mode: "edit",
        recordId: record.id,
        income: record as StoredIncome,
      });
    } else if (entity === "expense") {
      setModal({
        entity,
        mode: "edit",
        recordId: record.id,
        expense: record as StoredExpense,
      });
    } else {
      setModal({
        entity,
        mode: "edit",
        recordId: record.id,
        goal: record as StoredGoal,
      });
    }
  }

  function openDelete(entity: FinanceEntity, recordId: string, label: string) {
    setDeleteTarget({ entity, recordId, label });
  }

  function closeModal() {
    setModal(null);
  }

  function closeDeleteDialog() {
    setDeleteTarget(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.entity === "income") {
        await deleteIncome(deleteTarget.recordId);
      } else if (deleteTarget.entity === "expense") {
        await deleteExpense(deleteTarget.recordId);
      } else {
        await deleteGoal(deleteTarget.recordId);
      }
      setDeleteTarget(null);
      await loadData();
    } catch {
      setError(ERRORS.deleteFailed);
    } finally {
      setDeleting(false);
    }
  }

  async function handleSaved() {
    try {
      await loadData();
    } catch {
      setError(ERRORS.refreshFailed);
    }
  }

  return {
    user,
    loading,
    error,
    modal,
    deleteTarget,
    deleting,
    kpis,
    boxPlacement,
    incomes: summary.incomes,
    goals: summary.goals,
    orderedExpenseBoxes: summary.orderedExpenseBoxes,
    spendingData: summary.spendingData,
    savingsData: summary.savingsData,
    expenseTypeData: summary.expenseTypeData,
    openAdd,
    openEdit,
    openDelete,
    closeModal,
    closeDeleteDialog,
    confirmDelete,
    handleSaved,
    exchangeRates: data?.exchangeRates,
  };
}
