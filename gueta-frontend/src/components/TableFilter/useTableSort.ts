import { useMemo, useState } from "react";

export type SortDirection = "asc" | "desc";

export type TableSortState<K extends string> = {
  column: K;
  direction: SortDirection;
} | null;

export function useTableSort<T, K extends string>(
  items: T[],
  comparators: Record<K, (a: T, b: T) => number>,
) {
  const [sort, setSort] = useState<TableSortState<K>>(null);

  function toggleSort(column: K) {
    setSort((current) => {
      if (current?.column === column) {
        return {
          column,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }
      return { column, direction: "asc" };
    });
  }

  const sortedItems = useMemo(() => {
    if (!sort) return items;
    const compare = comparators[sort.column];
    const sorted = [...items].sort(compare);
    return sort.direction === "desc" ? sorted.reverse() : sorted;
  }, [items, sort, comparators]);

  return {
    sort,
    toggleSort,
    sortedItems,
  };
}
