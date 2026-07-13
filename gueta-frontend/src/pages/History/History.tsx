import {
  Box,
  Center,
  Group,
  Loader,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { TableActionsMenu } from "../../components/TableFilter/TableActionsMenu";
import { TableFilterBar } from "../../components/TableFilter/TableFilterBar";
import { FILTER_NO_RESULTS } from "../../components/TableFilter/consts";
import { useTableFilter } from "../../components/TableFilter/useTableFilter";
import type { StoredExpense } from "../../auth/authApi";
import {
  EXPENSE_KIND_LABELS,
  EXPENSE_RECURRENCE_LABELS,
} from "../../finance/constants";
import {
  formatExpenseBilling,
  formatRemainingPayments,
} from "../../finance/expenseUtils";
import classes from "./History.module.css";
import { COPY } from "./consts";
import { formatMoney } from "../../finance/currency";
import { useHistory } from "./useHistory";

function getHistorySearchText(expense: StoredExpense): string {
  return [
    EXPENSE_RECURRENCE_LABELS[expense.recurrence] ?? expense.recurrence,
    EXPENSE_KIND_LABELS[expense.kind] ?? expense.kind,
    expense.category.name,
    expense.name,
    expense.description,
    formatMoney(expense.amount, expense.currency),
    formatExpenseBilling(expense),
    formatRemainingPayments(expense.remainingPayments),
  ].join(" ");
}

export default function History() {
  const { user, expenses, loading, error } = useHistory();
  const {
    search,
    setSearch,
    searchOpen,
    toggleSearch,
    filteredItems,
  } = useTableFilter(expenses, getHistorySearchText);

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
        <Text className={classes.subtitle}>
          {user ? `${user.name} · ${COPY.subtitleSuffix}` : COPY.subtitleSuffix}
        </Text>
      </Stack>

      {error && <Text className={classes.error}>{error}</Text>}

      <Box className={classes.tableCard}>
        <Group className={classes.cardHeader}>
          <Text className={classes.cardTitle}>{COPY.cardTitle}</Text>
          <TableActionsMenu
            searchOpen={searchOpen}
            onToggleSearch={expenses.length > 0 ? toggleSearch : undefined}
          />
        </Group>
        {expenses.length > 0 ? (
          <>
            {searchOpen && (
              <TableFilterBar search={search} onSearchChange={setSearch} />
            )}
            {filteredItems.length > 0 ? (
              <Table.ScrollContainer className={classes.tableScroll} minWidth={560}>
                <Table className={classes.table}>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>סוג</Table.Th>
                      <Table.Th>קטגוריה</Table.Th>
                      <Table.Th>שם</Table.Th>
                      <Table.Th>סכום</Table.Th>
                      <Table.Th>תיאור</Table.Th>
                      <Table.Th className={classes.remainingCol}>
                        תשלומים שנותרו
                      </Table.Th>
                      <Table.Th className={classes.billingCol}>חיוב</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredItems.map((expense) => (
                      <Table.Tr key={expense.id}>
                        <Table.Td>
                          {EXPENSE_RECURRENCE_LABELS[expense.recurrence] ??
                            expense.recurrence}
                        </Table.Td>
                        <Table.Td>{expense.category.name}</Table.Td>
                        <Table.Td>{expense.name}</Table.Td>
                        <Table.Td>
                          {formatMoney(expense.amount, expense.currency)}
                        </Table.Td>
                        <Table.Td>{expense.description}</Table.Td>
                        <Table.Td className={classes.remainingCol}>
                          {expense.recurrence === "once"
                            ? COPY.onceRemaining
                            : formatRemainingPayments(expense.remainingPayments)}
                        </Table.Td>
                        <Table.Td className={classes.billingCol}>
                          {formatExpenseBilling(expense)}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            ) : (
              <Text className={classes.noResultsText}>{FILTER_NO_RESULTS}</Text>
            )}
          </>
        ) : (
          <Text className={classes.emptyText}>{COPY.empty}</Text>
        )}
      </Box>
    </Box>
  );
}
