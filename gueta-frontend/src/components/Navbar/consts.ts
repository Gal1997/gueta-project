import {
  IconHistory,
  IconLayoutDashboard,
  IconLogout,
  IconWallet,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";

export const NAV_ITEMS: {
  label: string;
  path: string;
  icon: Icon;
}[] = [
  { label: "לוח בקרה", path: "/main", icon: IconLayoutDashboard },
  { label: "ההון שלי", path: "/my-capital", icon: IconWallet },
  { label: "היסטוריה", path: "/history", icon: IconHistory },
];

export const LOGOUT_LABEL = "התנתקות";
export const LOGOUT_ICON = IconLogout;

export const MOBILE_NAV_MAX_WIDTH = "(max-width: 47.9375em)";

export const MENU_BUTTON_LABEL = "תפריט ניווט";
export const DRAWER_TITLE = "ניווט";
