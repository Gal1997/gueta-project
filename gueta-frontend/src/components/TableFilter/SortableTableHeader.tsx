import { Table, UnstyledButton } from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import classes from "./SortableTableHeader.module.css";
import type { SortDirection } from "./useTableSort";

type SortableTableHeaderProps<K extends string> = {
  label: string;
  column: K;
  sortColumn: K | null;
  sortDirection: SortDirection | null;
  onSort: (column: K) => void;
  className?: string;
  centered?: boolean;
};

export function SortableTableHeader<K extends string>({
  label,
  column,
  sortColumn,
  sortDirection,
  onSort,
  className,
  centered = false,
}: SortableTableHeaderProps<K>) {
  const active = sortColumn === column;
  const SortIcon = sortDirection === "desc" ? IconChevronDown : IconChevronUp;

  return (
    <Table.Th className={className}>
      <UnstyledButton
        className={`${classes.button} ${active ? classes.active : ""} ${
          centered ? classes.center : ""
        }`}
        onClick={() => onSort(column)}
        type="button"
      >
        <span>{label}</span>
        {active ? (
          <SortIcon size={14} stroke={1.75} className={classes.icon} />
        ) : null}
      </UnstyledButton>
    </Table.Th>
  );
}
