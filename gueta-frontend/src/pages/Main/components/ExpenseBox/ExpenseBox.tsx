import {
  Box,
  Group,
  Table,
  Text,
} from "@mantine/core";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { RowActionsMenu } from "../../../../components/TableFilter/RowActionsMenu";
import { TableActionsMenu } from "../../../../components/TableFilter/TableActionsMenu";
import { TableFilterBar } from "../../../../components/TableFilter/TableFilterBar";
import {
  FILTER_NO_RESULTS,
  ROW_DELETE_LABEL,
  ROW_EDIT_LABEL,
} from "../../../../components/TableFilter/consts";
import { useTableFilter } from "../../../../components/TableFilter/useTableFilter";
import type { StoredExpense } from "../../../../auth/authApi";
import { EXPENSE_CATEGORY_LABELS } from "../../../../finance/constants";
import { formatMoney } from "../../../../finance/currency";
import {
  formatExpenseBilling,
  formatRemainingPayments,
} from "../../../../finance/expenseUtils";
import shared from "../shared/TableCard.module.css";

type ExpenseBoxProps = {
  title: string;
  expenses: StoredExpense[];
  variant: "once" | "recurring";
  emptyText: string;
  className: string;
  showMonthlyCharge?: boolean;
  onAdd: () => void;
  onEdit: (expense: StoredExpense) => void;
  onDelete: (expense: StoredExpense) => void;
};

function getExpenseSearchText(expense: StoredExpense): string {
  return [
    EXPENSE_CATEGORY_LABELS[expense.category] ?? expense.category,
    expense.name,
    expense.description,
    formatMoney(expense.amount, expense.currency),
    formatExpenseBilling(expense),
    formatRemainingPayments(expense.remainingPayments),
    formatMoney(expense.monthlyCharge ?? 0, expense.currency),
  ].join(" ");
}

export function ExpenseBox({
  title,
  expenses,
  variant,
  emptyText,
  className,
  showMonthlyCharge = false,
  onAdd,
  onEdit,
  onDelete,
}: ExpenseBoxProps) {
  const showCategory = variant === "once";
  const showRemaining = variant === "recurring";

  const {
    search,
    setSearch,
    searchOpen,
    toggleSearch,
    filteredItems,
  } = useTableFilter(expenses, getExpenseSearchText);

  return (
    <Box className={`${shared.tableCard} ${className}`}>
      <Group className={shared.cardHeader}>
        <Text className={shared.cardTitle}>{title}</Text>
        <TableActionsMenu
          onAdd={onAdd}
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
            <Table.ScrollContainer
              className={shared.tableScroll}
              minWidth={showMonthlyCharge ? 560 : showCategory ? 460 : 480}
            >
              <Table className={shared.table}>
                <Table.Thead>
                  <Table.Tr>
                    {showCategory && <Table.Th>קטגוריה</Table.Th>}
                    <Table.Th>שם</Table.Th>
                    <Table.Th>{showMonthlyCharge ? "סך חוב" : "סכום"}</Table.Th>
                    {showMonthlyCharge && (
                      <Table.Th className={shared.remainingCol}>
                        חיוב החודש
                      </Table.Th>
                    )}
                    <Table.Th>תיאור</Table.Th>
                    {showRemaining && (
                      <Table.Th className={shared.remainingCol}>
                        תשלומים שנותרו
                      </Table.Th>
                    )}
                    <Table.Th className={shared.billingCol}>חיוב</Table.Th>
                    <Table.Th className={shared.actionsCol}>פעולות</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredItems.map((expense) => (
                    <Table.Tr key={expense.id}>
                      {showCategory && (
                        <Table.Td>
                          {EXPENSE_CATEGORY_LABELS[expense.category] ??
                            expense.category}
                        </Table.Td>
                      )}
                      <Table.Td>{expense.name}</Table.Td>
                      <Table.Td>
                        {formatMoney(expense.amount, expense.currency)}
                      </Table.Td>
                      {showMonthlyCharge && (
                        <Table.Td className={shared.remainingCol}>
                          {formatMoney(
                            expense.monthlyCharge ?? 0,
                            expense.currency,
                          )}
                        </Table.Td>
                      )}
                      <Table.Td>{expense.description}</Table.Td>
                      {showRemaining && (
                        <Table.Td className={shared.remainingCol}>
                          {formatRemainingPayments(expense.remainingPayments)}
                        </Table.Td>
                      )}
                      <Table.Td className={shared.billingCol}>
                        {formatExpenseBilling(expense)}
                      </Table.Td>
                      <Table.Td>
                        <RowActionsMenu
                          actions={[
                            {
                              label: ROW_EDIT_LABEL,
                              icon: <IconPencil />,
                              onClick: () => onEdit(expense),
                            },
                            {
                              label: ROW_DELETE_LABEL,
                              icon: <IconTrash />,
                              onClick: () => onDelete(expense),
                            },
                          ]}
                        />
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          ) : (
            <Text className={shared.noResultsText}>{FILTER_NO_RESULTS}</Text>
          )}
        </>
      ) : (
        <Text className={shared.emptyText}>{emptyText}</Text>
      )}
    </Box>
  );
}
