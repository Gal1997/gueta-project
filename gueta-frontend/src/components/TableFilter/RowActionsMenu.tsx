import { ActionIcon, Menu } from "@mantine/core";
import { IconDotsVertical } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { TABLE_ACTIONS_LABEL } from "./consts";
import classes from "./TableActionsMenu.module.css";

export type RowAction = {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  itemClassName?: string;
};

type RowActionsMenuProps = {
  actions: RowAction[];
  buttonClassName?: string;
};

export function RowActionsMenu({
  actions,
  buttonClassName,
}: RowActionsMenuProps) {
  if (actions.length === 0) return null;

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
        {actions.map((action) => (
          <Menu.Item
            key={action.label}
            className={`${classes.menuItemIcon} ${action.itemClassName ?? ""}`}
            leftSection={action.icon}
            onClick={action.onClick}
          >
            {action.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
