import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteAvailableCash,
  deleteCapitalInvestment,
  deleteFutureMoney,
  getCapitalData,
  receiveFutureMoney,
  withdrawToChecking,
} from "../../auth/authApi";
import type {
  CapitalData,
  InvestmentUpdateMode,
  StoredAvailableCash,
  StoredCapitalInvestment,
  StoredFutureMoney,
} from "../../auth/authApi";
import {
  AVAILABLE_CASH_TYPE_LABELS,
  CAPITAL_INVESTMENT_TYPE_LABELS,
  WITHDRAWABLE_CASH_TYPES,
} from "../../finance/capitalConstants";
import kpiClasses from "./components/CapitalKpiGrid/CapitalKpiGrid.module.css";
import {
  ERRORS,
  type CapitalDeleteState,
  type CapitalEntity,
  type CapitalModalState,
  type CapitalReceiveState,
  type CapitalWithdrawState,
} from "./consts";
import { buildAvailableDistributionData, buildDistributionData, buildInvestmentDistributionData, buildKpis } from "./utils";

export function useMyCapital() {
  const [data, setData] = useState<CapitalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<CapitalModalState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CapitalDeleteState | null>(
    null,
  );
  const [receiveTarget, setReceiveTarget] = useState<CapitalReceiveState | null>(
    null,
  );
  const [withdrawTarget, setWithdrawTarget] =
    useState<CapitalWithdrawState | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const loadData = useCallback(async () => {
    const result = await getCapitalData();
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

  const kpis = useMemo(
    () =>
      data
        ? buildKpis(data.summary, {
            total: kpiClasses.kpiTotal,
            available: kpiClasses.kpiAvailable,
            investments: kpiClasses.kpiInvestments,
            future: kpiClasses.kpiFuture,
          })
        : [],
    [data],
  );

  const distributionData = useMemo(
    () => (data ? buildDistributionData(data.summary) : []),
    [data],
  );

  const availableDistributionData = useMemo(
    () =>
      data
        ? buildAvailableDistributionData(data.available, data.exchangeRates)
        : [],
    [data],
  );

  const investmentDistributionData = useMemo(
    () =>
      data
        ? buildInvestmentDistributionData(data.investments, data.exchangeRates)
        : [],
    [data],
  );

  function openAdd(entity: CapitalEntity) {
    setModal({ entity, mode: "add" });
  }

  function openEditAvailable(item: StoredAvailableCash) {
    setModal({
      entity: "available",
      mode: "edit",
      recordId: item.id,
      available: item,
    });
  }

  function openEditInvestment(
    item: StoredCapitalInvestment,
    updateMode: InvestmentUpdateMode = "valuation",
  ) {
    setModal({
      entity: "investment",
      mode: "edit",
      recordId: item.id,
      investment: item,
      investmentUpdateMode: updateMode,
    });
  }

  function openEditFuture(item: StoredFutureMoney) {
    setModal({
      entity: "future",
      mode: "edit",
      recordId: item.id,
      future: item,
    });
  }

  function openDelete(
    entity: CapitalEntity,
    recordId: string,
    label: string,
  ) {
    setDeleteTarget({ entity, recordId, label });
  }

  function openDeleteAvailable(item: StoredAvailableCash) {
    const label =
      AVAILABLE_CASH_TYPE_LABELS[item.type] ?? item.type;
    openDelete("available", item.id, label);
  }

  function openDeleteInvestment(item: StoredCapitalInvestment) {
    const label =
      CAPITAL_INVESTMENT_TYPE_LABELS[item.type] ?? item.type;
    openDelete("investment", item.id, label);
  }

  function openDeleteFuture(item: StoredFutureMoney) {
    openDelete("future", item.id, item.description);
  }

  function openReceiveFuture(item: StoredFutureMoney) {
    setReceiveTarget({
      recordId: item.id,
      label: item.description,
      amount: item.amount,
      currency: item.currency,
    });
  }

  function openWithdraw(item: StoredAvailableCash) {
    if (
      !WITHDRAWABLE_CASH_TYPES.includes(
        item.type as (typeof WITHDRAWABLE_CASH_TYPES)[number],
      ) ||
      item.amount <= 0
    ) {
      return;
    }

    setWithdrawTarget({
      recordId: item.id,
      maxAmount: item.amount,
      currency: item.currency,
      sourceLabel: AVAILABLE_CASH_TYPE_LABELS[item.type] ?? item.type,
    });
  }

  function closeModal() {
    setModal(null);
  }

  function closeDeleteDialog() {
    setDeleteTarget(null);
  }

  function closeReceiveDialog() {
    setReceiveTarget(null);
  }

  function closeWithdrawDialog() {
    setWithdrawTarget(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.entity === "available") {
        await deleteAvailableCash(deleteTarget.recordId);
      } else if (deleteTarget.entity === "investment") {
        await deleteCapitalInvestment(deleteTarget.recordId);
      } else {
        await deleteFutureMoney(deleteTarget.recordId);
      }
      setDeleteTarget(null);
      await loadData();
    } catch {
      setError(ERRORS.deleteFailed);
    } finally {
      setDeleting(false);
    }
  }

  async function confirmReceive() {
    if (!receiveTarget) return;
    setReceiving(true);
    try {
      await receiveFutureMoney(receiveTarget.recordId);
      setReceiveTarget(null);
      await loadData();
    } catch {
      setError(ERRORS.receiveFailed);
    } finally {
      setReceiving(false);
    }
  }

  async function confirmWithdraw(amount: number) {
    if (!withdrawTarget) return;
    setWithdrawing(true);
    try {
      await withdrawToChecking(withdrawTarget.recordId, amount);
      setWithdrawTarget(null);
      await loadData();
    } catch {
      setError(ERRORS.withdrawFailed);
    } finally {
      setWithdrawing(false);
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
    loading,
    error,
    modal,
    deleteTarget,
    receiveTarget,
    withdrawTarget,
    deleting,
    receiving,
    withdrawing,
    kpis,
    distributionData,
    availableDistributionData,
    investmentDistributionData,
    available: data?.available ?? [],
    investments: data?.investments ?? [],
    investmentReturnTotal: data?.summary.investmentReturnTotal ?? 0,
    investmentPrincipalTotal: data?.summary.investmentPrincipalTotal ?? 0,
    future: data?.future ?? [],
    openAdd,
    openEditAvailable,
    openEditInvestment,
    openEditFuture,
    openDeleteAvailable,
    openDeleteInvestment,
    openDeleteFuture,
    openReceiveFuture,
    openWithdraw,
    closeModal,
    closeDeleteDialog,
    closeReceiveDialog,
    closeWithdrawDialog,
    confirmDelete,
    confirmReceive,
    confirmWithdraw,
    handleSaved,
  };
}
