import { Box, Center, Loader, Stack, Text, Title } from "@mantine/core";
import CapitalModal from "./CapitalModal/CapitalModal";
import { AvailableCashTable } from "./components/AvailableCashTable/AvailableCashTable";
import { CapitalChartsGrid } from "./components/CapitalChartsGrid/CapitalChartsGrid";
import { CapitalKpiGrid } from "./components/CapitalKpiGrid/CapitalKpiGrid";
import { WithdrawToCheckingModal } from "./components/WithdrawToCheckingModal/WithdrawToCheckingModal";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal/DeleteConfirmModal";
import { ReceiveConfirmModal } from "./components/ReceiveConfirmModal/ReceiveConfirmModal";
import { FutureMoneyTable } from "./components/FutureMoneyTable/FutureMoneyTable";
import { InvestmentsTable } from "./components/InvestmentsTable/InvestmentsTable";
import { COPY } from "./consts";
import classes from "./MyCapital.module.css";
import { useMyCapital } from "./useMyCapital";

export default function MyCapital() {
  const {
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
    available,
    investments,
    investmentReturnTotal,
    investmentPrincipalTotal,
    future,
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
  } = useMyCapital();

  if (loading) {
    return (
      <Center className={classes.fullPage}>
        <Loader />
      </Center>
    );
  }

  return (
    <Box className={classes.page}>
      <Stack className={classes.header}>
        <Title className={classes.title} order={1}>
          {COPY.title}
        </Title>
        <Text className={classes.subtitle}>{COPY.subtitle}</Text>
      </Stack>

      {error && <Text className={classes.error}>{error}</Text>}

      <Stack className={classes.dashboard}>
        <CapitalKpiGrid kpis={kpis} />
        <CapitalChartsGrid
          totalData={distributionData}
          availableData={availableDistributionData}
          investmentData={investmentDistributionData}
        />

        <Box className={classes.tablesGrid}>
          <Box className={classes.futurePanel}>
            <FutureMoneyTable
              items={future}
              onAdd={() => openAdd("future")}
              onEdit={openEditFuture}
              onDelete={openDeleteFuture}
              onReceive={openReceiveFuture}
            />
          </Box>
          <Stack className={classes.tablesColumn}>
            <Box className={classes.availablePanel}>
              <AvailableCashTable
                items={available}
                onAdd={() => openAdd("available")}
                onEdit={openEditAvailable}
                onDelete={openDeleteAvailable}
                onWithdraw={openWithdraw}
              />
            </Box>
            <Box className={classes.investmentsPanel}>
              <InvestmentsTable
                items={investments}
                totalReturn={investmentReturnTotal}
                totalDeposits={investmentPrincipalTotal}
                onAdd={() => openAdd("investment")}
                onEdit={openEditInvestment}
                onDelete={openDeleteInvestment}
              />
            </Box>
          </Stack>
        </Box>
      </Stack>

      {modal && (
        <CapitalModal
          opened
          onClose={closeModal}
          entity={modal.entity}
          mode={modal.mode}
          recordId={modal.recordId}
          initialAvailable={modal.available}
          initialInvestment={modal.investment}
          investmentUpdateMode={modal.investmentUpdateMode}
          initialFuture={modal.future}
          onSaved={() => void handleSaved()}
        />
      )}

      <DeleteConfirmModal
        deleteTarget={deleteTarget}
        deleting={deleting}
        onClose={closeDeleteDialog}
        onConfirm={() => void confirmDelete()}
      />

      <ReceiveConfirmModal
        receiveTarget={receiveTarget}
        receiving={receiving}
        onClose={closeReceiveDialog}
        onConfirm={() => void confirmReceive()}
      />

      <WithdrawToCheckingModal
        withdrawTarget={withdrawTarget}
        withdrawing={withdrawing}
        onClose={closeWithdrawDialog}
        onConfirm={(amount) => void confirmWithdraw(amount)}
      />
    </Box>
  );
}
