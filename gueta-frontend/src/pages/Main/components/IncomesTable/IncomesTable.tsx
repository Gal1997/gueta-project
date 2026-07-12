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
import type { StoredIncome } from "../../../../auth/authApi";
import { INCOME_TYPE_LABELS } from "../../../../finance/constants";
import { formatMoney } from "../../../../finance/currency";
import shared from "../shared/TableCard.module.css";

type IncomesTableProps = {
  incomes: StoredIncome[];
  onAdd: () => void;
  onEdit: (income: StoredIncome) => void;
  onDelete: (income: StoredIncome) => void;
};

function getIncomeSearchText(income: StoredIncome): string {
  return [
    INCOME_TYPE_LABELS[income.type] ?? income.type,
    income.source,
    income.description,
    formatMoney(income.amount, income.currency),
  ].join(" ");
}

export function IncomesTable({
  incomes,
  onAdd,
  onEdit,
  onDelete,
}: IncomesTableProps) {
  const {
    search,
    setSearch,
    searchOpen,
    toggleSearch,
    filteredItems,
  } = useTableFilter(incomes, getIncomeSearchText);

  return (
    <Box className={shared.tableCard}>
      <Group className={shared.cardHeader}>
        <Text className={shared.cardTitle}>הכנסות</Text>
        <TableActionsMenu
          onAdd={onAdd}
          searchOpen={searchOpen}
          onToggleSearch={incomes.length > 0 ? toggleSearch : undefined}
        />
      </Group>
      {incomes.length > 0 ? (
        <>
          {searchOpen && (
            <TableFilterBar search={search} onSearchChange={setSearch} />
          )}
          {filteredItems.length > 0 ? (
            <Table.ScrollContainer className={shared.tableScroll} minWidth={400}>
              <Table className={shared.table}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>סוג</Table.Th>
                    <Table.Th>מקור</Table.Th>
                    <Table.Th>תיאור</Table.Th>
                    <Table.Th>סכום</Table.Th>
                    <Table.Th className={shared.actionsCol}>פעולות</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredItems.map((income) => (
                    <Table.Tr key={income.id}>
                      <Table.Td>
                        {INCOME_TYPE_LABELS[income.type] ?? income.type}
                      </Table.Td>
                      <Table.Td>{income.source}</Table.Td>
                      <Table.Td>{income.description}</Table.Td>
                      <Table.Td>
                        {formatMoney(income.amount, income.currency)}
                      </Table.Td>
                      <Table.Td>
                        <RowActionsMenu
                          actions={[
                            {
                              label: ROW_EDIT_LABEL,
                              icon: <IconPencil />,
                              onClick: () => onEdit(income),
                            },
                            {
                              label: ROW_DELETE_LABEL,
                              icon: <IconTrash />,
                              onClick: () => onDelete(income),
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
        <Text className={shared.emptyText}>אין הכנסות.</Text>
      )}
    </Box>
  );
}
