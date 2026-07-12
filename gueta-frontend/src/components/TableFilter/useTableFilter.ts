import { useMemo, useState } from "react";

export function useTableFilter<T>(
  items: T[],
  getSearchText: (item: T) => string,
) {
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) =>
      getSearchText(item).toLowerCase().includes(query),
    );
  }, [items, search, getSearchText]);

  function toggleSearch() {
    setSearchOpen((open) => {
      if (open) setSearch("");
      return !open;
    });
  }

  const isFiltering = search.trim().length > 0;

  return {
    search,
    setSearch,
    searchOpen,
    toggleSearch,
    filteredItems,
    isFiltering,
  };
}
