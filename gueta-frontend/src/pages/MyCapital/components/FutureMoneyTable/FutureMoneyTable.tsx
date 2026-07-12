import { Box, Group, Stack, Text } from "@mantine/core";
import { IconCurrencyDollar, IconPencil, IconPin, IconTrash } from "@tabler/icons-react";
import dayjs from "dayjs";
import { RowActionsMenu } from "../../../../components/TableFilter/RowActionsMenu";
import { TableFilterBar } from "../../../../components/TableFilter/TableFilterBar";
import { TableActionsMenu } from "../../../../components/TableFilter/TableActionsMenu";
import {
  FILTER_NO_RESULTS,
  ROW_DELETE_LABEL,
  ROW_EDIT_LABEL,
  ROW_RECEIVE_LABEL,
} from "../../../../components/TableFilter/consts";
import { useTableFilter } from "../../../../components/TableFilter/useTableFilter";
import type { StoredFutureMoney } from "../../../../auth/authApi";
import { TABLE_TITLES } from "../../consts";
import { formatMoney } from "../../../../finance/currency";
import { formatDate } from "../../utils";
import classes from "./FutureMoneyTable.module.css";

const HEBREW_MONTHS_SHORT = [
  "ינו",
  "פבר",
  "מרץ",
  "אפר",
  "מאי",
  "יונ",
  "יול",
  "אוג",
  "ספט",
  "אוק",
  "נוב",
  "דצמ",
];

type FutureMoneyTableProps = {
  items: StoredFutureMoney[];
  onAdd: () => void;
  onEdit: (item: StoredFutureMoney) => void;
  onDelete: (item: StoredFutureMoney) => void;
  onReceive: (item: StoredFutureMoney) => void;
};

function getFutureSearchText(item: StoredFutureMoney): string {
  const dateTag = formatDateTag(item.expectedPaymentDate);
  return [
    item.description,
    String(item.amount),
    dateTag ? `${dateTag.day} ${dateTag.month}` : "",
    formatDate(item.updatedAt),
  ].join(" ");
}

function formatDateTag(
  value: string | null | undefined,
): { day: string; month: string } | null {
  if (!value) return null;
  const date = dayjs(value);
  if (!date.isValid()) return null;
  return {
    day: date.format("DD"),
    month: HEBREW_MONTHS_SHORT[date.month()] ?? date.format("MM"),
  };
}

export function FutureMoneyTable({
  items,
  onAdd,
  onEdit,
  onDelete,
  onReceive,
}: FutureMoneyTableProps) {
  const {
    search,
    setSearch,
    searchOpen,
    toggleSearch,
    filteredItems,
  } = useTableFilter(items, getFutureSearchText);

  return (
    <Box className={classes.futureBoard}>
      <Group className={classes.boardHeader}>
        <Group className={classes.titleGroup}>
          <Box className={classes.nameplate}>
            <IconPin />
          </Box>
          <Stack gap={0}>
            <Text className={classes.boardTitle}>{TABLE_TITLES.future}</Text>
            <Text className={classes.boardSubtitle}>לוח מודעות לצפי תשלומים</Text>
          </Stack>
        </Group>
        <TableActionsMenu
          buttonClassName={classes.boardMenuButton}
          onAdd={onAdd}
          searchOpen={searchOpen}
          onToggleSearch={items.length > 0 ? toggleSearch : undefined}
        />
      </Group>

      {items.length > 0 ? (
        <>
          {searchOpen && (
            <Box className={classes.searchWrap}>
              <TableFilterBar search={search} onSearchChange={setSearch} />
            </Box>
          )}
          {filteredItems.length > 0 ? (
            <Stack className={classes.entriesList}>
              {filteredItems.map((item, index) => {
                const dateTag = formatDateTag(item.expectedPaymentDate);

                return (
                  <Box
                    key={item.id}
                    className={classes.entry}
                    data-note={index % 3}
                  >
                    <Box className={classes.pin} aria-hidden />

                    <Box className={classes.dateTag}>
                      {dateTag ? (
                        <>
                          <Text className={classes.dateDay}>{dateTag.day}</Text>
                          <Text className={classes.dateMonth}>{dateTag.month}</Text>
                        </>
                      ) : (
                        <Text className={classes.dateEmpty}>ללא צפי</Text>
                      )}
                    </Box>

                    <Stack className={classes.entryBody}>
                      <Text className={classes.entryDescription}>
                        {item.description}
                      </Text>
                      <Group className={classes.entryMeta}>
                        <Text className={classes.entryAmount}>
                          {formatMoney(item.amount, item.currency)}
                        </Text>
                        <Text className={classes.entryUpdated}>
                          עודכן {formatDate(item.updatedAt)}
                        </Text>
                      </Group>
                    </Stack>

                    <RowActionsMenu
                      buttonClassName={classes.rowMenuButton}
                      actions={[
                        {
                          label: ROW_RECEIVE_LABEL,
                          icon: <IconCurrencyDollar />,
                          onClick: () => onReceive(item),
                        },
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
                  </Box>
                );
              })}
            </Stack>
          ) : (
            <Text className={classes.noResultsText}>{FILTER_NO_RESULTS}</Text>
          )}
        </>
      ) : (
        <Text className={classes.emptyText}>איזה כיף, אף אחד לא חייב לך כסף</Text>
      )}
    </Box>
  );
}
