import { TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { FILTER_SEARCH_PLACEHOLDER } from "./consts";
import classes from "./TableFilterBar.module.css";

type TableFilterBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
};

export function TableFilterBar({
  search,
  onSearchChange,
  searchPlaceholder = FILTER_SEARCH_PLACEHOLDER,
}: TableFilterBarProps) {
  return (
    <TextInput
      className={classes.searchInput}
      placeholder={searchPlaceholder}
      leftSection={<IconSearch />}
      value={search}
      onChange={(event) => onSearchChange(event.currentTarget.value)}
    />
  );
}
