import { ActionIcon, Menu } from "@mantine/core";
import { IconDotsVertical, IconPlus, IconSearch } from "@tabler/icons-react";
import {
  FILTER_TOGGLE_LABEL,
  TABLE_ACTIONS_LABEL,
  TABLE_ADD_LABEL,
} from "./consts";
import classes from "./TableActionsMenu.module.css";

type TableActionsMenuProps = {
  onAdd?: () => void;
  searchOpen?: boolean;
  onToggleSearch?: () => void;
  buttonClassName?: string;
};

export function TableActionsMenu({
  onAdd,
  searchOpen = false,
  onToggleSearch,
  buttonClassName,
}: TableActionsMenuProps) {
  const hasAdd = Boolean(onAdd);
  const hasSearch = Boolean(onToggleSearch);

  if (!hasAdd && !hasSearch) return null;

  return (
    <Menu position="right-start" withinPortal>
      <Menu.Target>
        <ActionIcon
          variant="default"
          aria-label={TABLE_ACTIONS_LABEL}
          className={buttonClassName ?? classes.menuButton}
        >
          <IconDotsVertical />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {hasAdd && (
          <Menu.Item
            className={classes.menuItemIcon}
            leftSection={<IconPlus />}
            onClick={onAdd}
          >
            {TABLE_ADD_LABEL}
          </Menu.Item>
        )}
        {hasSearch && (
          <Menu.Item
            className={`${classes.menuItemIcon} ${
              searchOpen ? classes.menuItemActive : ""
            }`}
            leftSection={<IconSearch />}
            onClick={onToggleSearch}
          >
            {FILTER_TOGGLE_LABEL}
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
