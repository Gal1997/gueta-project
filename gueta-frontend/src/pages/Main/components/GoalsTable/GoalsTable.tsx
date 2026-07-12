import { Box, Group, Table, Text } from "@mantine/core";
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
import { formatMoney } from "../../../../finance/currency";
import type { CapitalCurrency, ExchangeRates, StoredGoal } from "../../../../auth/authApi";
import { currency, formatDate, monthlyForGoal } from "../../utils";
import shared from "../shared/TableCard.module.css";

type GoalsTableProps = {
  goals: StoredGoal[];
  exchangeRates?: ExchangeRates;
  onAdd: () => void;
  onEdit: (goal: StoredGoal) => void;
  onDelete: (goal: StoredGoal) => void;
};

function getGoalSearchText(
  goal: StoredGoal,
  rates: Record<CapitalCurrency, number>,
): string {
  return [
    goal.description,
    formatMoney(goal.targetAmount, goal.currency),
    formatDate(goal.targetDate),
    String(monthlyForGoal(goal, rates)),
  ].join(" ");
}

export function GoalsTable({
  goals,
  exchangeRates,
  onAdd,
  onEdit,
  onDelete,
}: GoalsTableProps) {
  const rates = exchangeRates?.toIls ?? { ILS: 1, USD: 1, EUR: 1 };
  const {
    search,
    setSearch,
    searchOpen,
    toggleSearch,
    filteredItems,
  } = useTableFilter(goals, (goal) => getGoalSearchText(goal, rates));

  return (
    <Box className={shared.tableCard}>
      <Group className={shared.cardHeader}>
        <Text className={shared.cardTitle}>מטרות</Text>
        <TableActionsMenu
          onAdd={onAdd}
          searchOpen={searchOpen}
          onToggleSearch={goals.length > 0 ? toggleSearch : undefined}
        />
      </Group>
      {goals.length > 0 ? (
        <>
          {searchOpen && (
            <TableFilterBar search={search} onSearchChange={setSearch} />
          )}
          {filteredItems.length > 0 ? (
            <Table.ScrollContainer className={shared.tableScroll} minWidth={500}>
              <Table className={shared.table}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>תיאור</Table.Th>
                    <Table.Th>סכום דרוש</Table.Th>
                    <Table.Th>תאריך יעד</Table.Th>
                    <Table.Th>הפרשה חודשית</Table.Th>
                    <Table.Th className={shared.actionsCol}>פעולות</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredItems.map((goal) => (
                    <Table.Tr key={goal.id}>
                      <Table.Td>{goal.description}</Table.Td>
                      <Table.Td>
                        {formatMoney(goal.targetAmount, goal.currency)}
                      </Table.Td>
                      <Table.Td>{formatDate(goal.targetDate)}</Table.Td>
                      <Table.Td>
                        {currency.format(monthlyForGoal(goal, rates))}
                      </Table.Td>
                      <Table.Td>
                        <RowActionsMenu
                          actions={[
                            {
                              label: ROW_EDIT_LABEL,
                              icon: <IconPencil />,
                              onClick: () => onEdit(goal),
                            },
                            {
                              label: ROW_DELETE_LABEL,
                              icon: <IconTrash />,
                              onClick: () => onDelete(goal),
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
        <Text className={shared.emptyText}>אין מטרות.</Text>
      )}
    </Box>
  );
}
