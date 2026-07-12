import { Box, Group, Table, Text } from "@mantine/core";
import { IconCurrencyDollar, IconPencil, IconTrash } from "@tabler/icons-react";
import { RowActionsMenu } from "../../../../components/TableFilter/RowActionsMenu";
import { TableActionsMenu } from "../../../../components/TableFilter/TableActionsMenu";
import { TableFilterBar } from "../../../../components/TableFilter/TableFilterBar";
import {
  FILTER_NO_RESULTS,
  ROW_DELETE_LABEL,
  ROW_EDIT_LABEL,
  ROW_WITHDRAW_LABEL,
} from "../../../../components/TableFilter/consts";
import { useTableFilter } from "../../../../components/TableFilter/useTableFilter";
import type { StoredAvailableCash } from "../../../../auth/authApi";
import { AVAILABLE_CASH_TYPE_LABELS, WITHDRAWABLE_CASH_TYPES } from "../../../../finance/capitalConstants";
import { TABLE_TITLES } from "../../consts";
import { formatMoney } from "../../../../finance/currency";
import { formatDate } from "../../utils";
import shared from "../../../Main/components/shared/TableCard.module.css";
import classes from "./AvailableCashTable.module.css";

type AvailableCashTableProps = {
  items: StoredAvailableCash[];
  onAdd: () => void;
  onEdit: (item: StoredAvailableCash) => void;
  onDelete: (item: StoredAvailableCash) => void;
  onWithdraw: (item: StoredAvailableCash) => void;
};

function formatOptionalDescription(value: string | null | undefined): string {
  return value?.trim() ? value : "—";
}

function getAvailableSearchText(item: StoredAvailableCash): string {
  return [
    AVAILABLE_CASH_TYPE_LABELS[item.type] ?? item.type,
    item.description ?? "",
    String(item.amount),
    formatDate(item.updatedAt),
  ].join(" ");
}

function canWithdrawToChecking(item: StoredAvailableCash): boolean {
  return (
    WITHDRAWABLE_CASH_TYPES.includes(
      item.type as (typeof WITHDRAWABLE_CASH_TYPES)[number],
    ) && item.amount > 0
  );
}

export function AvailableCashTable({
  items,
  onAdd,
  onEdit,
  onDelete,
  onWithdraw,
}: AvailableCashTableProps) {
  const {
    search,
    setSearch,
    searchOpen,
    toggleSearch,
    filteredItems,
  } = useTableFilter(items, getAvailableSearchText);

  return (
    <Box className={shared.tableCard}>
      <Group className={shared.cardHeader}>
        <Text className={shared.cardTitle}>{TABLE_TITLES.available}</Text>
        <TableActionsMenu
          onAdd={onAdd}
          searchOpen={searchOpen}
          onToggleSearch={items.length > 0 ? toggleSearch : undefined}
        />
      </Group>
      {items.length > 0 ? (
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
                    <Table.Th>תיאור</Table.Th>
                    <Table.Th>סכום</Table.Th>
                    <Table.Th>עודכן לאחרונה</Table.Th>
                    <Table.Th className={classes.actionsCol}>פעולות</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredItems.map((item) => (
                    <Table.Tr key={item.id}>
                      <Table.Td>
                        {AVAILABLE_CASH_TYPE_LABELS[item.type] ?? item.type}
                      </Table.Td>
                      <Table.Td>{formatOptionalDescription(item.description)}</Table.Td>
                      <Table.Td>{formatMoney(item.amount, item.currency)}</Table.Td>
                      <Table.Td>{formatDate(item.updatedAt)}</Table.Td>
                      <Table.Td>
                        <RowActionsMenu
                          actions={[
                            ...(canWithdrawToChecking(item)
                              ? [
                                  {
                                    label: ROW_WITHDRAW_LABEL,
                                    icon: <IconCurrencyDollar />,
                                    onClick: () => onWithdraw(item),
                                  },
                                ]
                              : []),
                            {
                              label: ROW_EDIT_LABEL,
                              icon: <IconPencil />,
                              onClick: () => onEdit(item),
                            },
                            {
                              label: ROW_DELETE_LABEL,
                              icon: <IconTrash />,
                              onClick: () => onDelete(item),
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
        <Text className={shared.emptyText}>אין רשומות כסף זמין.</Text>
      )}
    </Box>
  );
}
