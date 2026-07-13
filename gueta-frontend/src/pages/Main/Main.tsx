import { Box, Center, Loader, Stack, Text } from "@mantine/core";
import type { StoredExpense, StoredGoal, StoredIncome } from "../../auth/authApi";
import FinanceModal from "./FinanceModal/FinanceModal";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal/DeleteConfirmModal";
import { DashboardCharts } from "./components/DashboardCharts/DashboardCharts";
import { ExpensesSection } from "./components/ExpensesSection/ExpensesSection";
import { GoalsTable } from "./components/GoalsTable/GoalsTable";
import { IncomesTable } from "./components/IncomesTable/IncomesTable";
import { KpiGrid } from "./components/KpiGrid/KpiGrid";
import { MainHeader } from "./components/MainHeader/MainHeader";
import classes from "./Main.module.css";
import { useMain } from "./useMain";

export default function Main() {
  const {
    user,
    loading,
    error,
    modal,
    deleteTarget,
    deleting,
    kpis,
    boxPlacement,
    incomes,
    goals,
    categories,
    exchangeRates,
    orderedExpenseBoxes,
    spendingData,
    savingsData,
    expenseTypeData,
    openAdd,
    openEdit,
    openDelete,
    closeModal,
    closeDeleteDialog,
    confirmDelete,
    handleSaved,
  } = useMain();

  if (loading) {
    return (
      <Center className={classes.fullPage}>
        <Loader />
      </Center>
    );
  }

  return (
    <Box className={classes.page}>
      <MainHeader user={user} />

      {error && <Text className={classes.error}>{error}</Text>}

      <Stack className={classes.dashboard}>
        <KpiGrid kpis={kpis} />

        <DashboardCharts
          spendingData={spendingData}
          savingsData={savingsData}
          expenseTypeData={expenseTypeData}
        />

        <Stack className={classes.tablesStack}>
          <IncomesTable
            incomes={incomes}
            onAdd={() => openAdd("income")}
            onEdit={(income: StoredIncome) => openEdit("income", income)}
            onDelete={(income: StoredIncome) =>
              openDelete("income", income.id, income.source)
            }
          />

          <ExpensesSection
            orderedExpenseBoxes={orderedExpenseBoxes}
            boxPlacement={boxPlacement}
            onAdd={() => openAdd("expense")}
            onEdit={(expense: StoredExpense) => openEdit("expense", expense)}
            onDelete={(expense: StoredExpense) =>
              openDelete("expense", expense.id, expense.name)
            }
          />

          <GoalsTable
            goals={goals}
            exchangeRates={exchangeRates}
            onAdd={() => openAdd("goal")}
            onEdit={(goal: StoredGoal) => openEdit("goal", goal)}
            onDelete={(goal: StoredGoal) =>
              openDelete("goal", goal.id, goal.description)
            }
          />
        </Stack>
      </Stack>

      {modal && (
        <FinanceModal
          opened
          onClose={closeModal}
          entity={modal.entity}
          mode={modal.mode}
          recordId={modal.recordId}
          initialIncome={modal.income}
          initialExpense={modal.expense}
          initialGoal={modal.goal}
          categories={categories}
          onSaved={() => void handleSaved()}
        />
      )}

      <DeleteConfirmModal
        deleteTarget={deleteTarget}
        deleting={deleting}
        onClose={closeDeleteDialog}
        onConfirm={() => void confirmDelete()}
      />
    </Box>
  );
}
