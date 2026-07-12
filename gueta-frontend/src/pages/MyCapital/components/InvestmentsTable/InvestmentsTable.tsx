import { ActionIcon, Box, Group, Table, Text } from "@mantine/core";
import {
  IconCash,
  IconExternalLink,
  IconLink,
  IconNotes,
  IconTrash,
  IconTrendingUp,
} from "@tabler/icons-react";
import { RowActionsMenu } from "../../../../components/TableFilter/RowActionsMenu";
import { TableActionsMenu } from "../../../../components/TableFilter/TableActionsMenu";
import { TableFilterBar } from "../../../../components/TableFilter/TableFilterBar";
import {
  FILTER_NO_RESULTS,
  ROW_CONTRIBUTION_LABEL,
  ROW_DELETE_LABEL,
  ROW_DESCRIPTION_LABEL,
  ROW_LINK_LABEL,
  ROW_VALUATION_LABEL,
} from "../../../../components/TableFilter/consts";
import { useTableFilter } from "../../../../components/TableFilter/useTableFilter";
import type {
  InvestmentUpdateMode,
  StoredCapitalInvestment,
} from "../../../../auth/authApi";
import { CAPITAL_INVESTMENT_TYPE_LABELS } from "../../../../finance/capitalConstants";
import { TABLE_TITLES } from "../../consts";
import { formatMoney } from "../../../../finance/currency";
import { formatDate } from "../../utils";
import shared from "../../../Main/components/shared/TableCard.module.css";
import { InvestmentReturnCard } from "../InvestmentReturnCard/InvestmentReturnCard";

type InvestmentsTableProps = {
  items: StoredCapitalInvestment[];
  totalReturn: number;
  totalDeposits: number;
  onAdd: () => void;
  onEdit: (
    item: StoredCapitalInvestment,
    updateMode: InvestmentUpdateMode,
  ) => void;
  onDelete: (item: StoredCapitalInvestment) => void;
};

function formatOptionalDescription(value: string | null | undefined): string {
  return value?.trim() ? value : "—";
}

function getInvestmentSearchText(item: StoredCapitalInvestment): string {
  return [
    CAPITAL_INVESTMENT_TYPE_LABELS[item.type] ?? item.type,
    item.description ?? "",
    String(item.amount),
    String(item.amount - item.principalAmount),
    item.url ?? "",
    formatDate(item.updatedAt),
  ].join(" ");
}

export function InvestmentsTable({
  items,
  totalReturn,
  totalDeposits,
  onAdd,
  onEdit,
  onDelete,
}: InvestmentsTableProps) {
  const {
    search,
    setSearch,
    searchOpen,
    toggleSearch,
    filteredItems,
  } = useTableFilter(items, getInvestmentSearchText);

  return (
    <Box className={shared.tableCard}>
      <Group className={shared.cardHeader}>
        <Text className={shared.cardTitle}>{TABLE_TITLES.investments}</Text>
        <TableActionsMenu
          onAdd={onAdd}
          searchOpen={searchOpen}
          onToggleSearch={items.length > 0 ? toggleSearch : undefined}
        />
      </Group>

      <InvestmentReturnCard
        totalReturn={totalReturn}
        totalDeposits={totalDeposits}
      />

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
                    <Table.Th>קישור</Table.Th>
                    <Table.Th>עודכן לאחרונה</Table.Th>
                    <Table.Th className={shared.actionsCol}>פעולות</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredItems.map((item) => (
                    <Table.Tr key={item.id}>
                      <Table.Td>
                        {CAPITAL_INVESTMENT_TYPE_LABELS[item.type] ?? item.type}
                      </Table.Td>
                      <Table.Td>{formatOptionalDescription(item.description)}</Table.Td>
                      <Table.Td>{formatMoney(item.amount, item.currency)}</Table.Td>
                      <Table.Td>
                        {item.url ? (
                          <ActionIcon
                            component="a"
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="subtle"
                            aria-label="פתיחת קישור להשקעה"
                          >
                            <IconExternalLink size={18} />
                          </ActionIcon>
                        ) : (
                          <Text c="dimmed" size="sm">
                            —
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td>{formatDate(item.updatedAt)}</Table.Td>
                      <Table.Td>
                        <RowActionsMenu
                          actions={[
                            {
                              label: ROW_CONTRIBUTION_LABEL,
                              icon: <IconCash />,
                              onClick: () => onEdit(item, "contribution"),
                            },
                            {
                              label: ROW_VALUATION_LABEL,
                              icon: <IconTrendingUp />,
                              onClick: () => onEdit(item, "valuation"),
                            },
                            {
                              label: ROW_LINK_LABEL,
                              icon: <IconLink />,
                              onClick: () => onEdit(item, "link"),
                            },
                            {
                              label: ROW_DESCRIPTION_LABEL,
                              icon: <IconNotes />,
                              onClick: () => onEdit(item, "description"),
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
        <Text className={shared.emptyText}>אין רשומות השקעות.</Text>
      )}
    </Box>
  );
}
