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
import { SortableTableHeader } from "../../components/TableFilter/SortableTableHeader";
import { FILTER_NO_RESULTS } from "../../components/TableFilter/consts";
import { useTableFilter } from "../../components/TableFilter/useTableFilter";
import { useTableSort } from "../../components/TableFilter/useTableSort";
import type { StoredExpense } from "../../auth/authApi";
import {
  EXPENSE_KIND_LABELS,
  EXPENSE_RECURRENCE_LABELS,
} from "../../finance/constants";
import {
  formatExpenseBilling,
  formatRemainingPayments,
} from "../../finance/expenseUtils";
import { ExpenseBillingCell } from "../../finance/ExpenseBillingCell";
import {
  expenseSortComparators,
  type ExpenseSortColumn,
} from "../../finance/expenseTableSort";
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

  const { sort, toggleSort, sortedItems } = useTableSort(
    filteredItems,
    expenseSortComparators,
  );

  const sortColumn = sort?.column ?? null;
  const sortDirection = sort?.direction ?? null;

  function handleSort(column: ExpenseSortColumn) {
    toggleSort(column);
  }

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
            {sortedItems.length > 0 ? (
              <Table.ScrollContainer className={classes.tableScroll} minWidth={560}>
                <Table className={classes.table}>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>סוג</Table.Th>
                      <SortableTableHeader
                        label="קטגוריה"
                        column="category"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      />
                      <Table.Th>שם</Table.Th>
                      <SortableTableHeader
                        label="סכום"
                        column="amount"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      />
                      <Table.Th>תיאור</Table.Th>
                      <SortableTableHeader
                        label="תשלומים שנותרו"
                        column="remainingPayments"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                        className={classes.remainingCol}
                        centered
                      />
                      <SortableTableHeader
                        label="חיוב"
                        column="billing"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                        className={classes.billingCol}
                      />
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {sortedItems.map((expense) => (
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
                          <ExpenseBillingCell expense={expense} />
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
