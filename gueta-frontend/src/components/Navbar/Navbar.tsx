import { Burger, Button, Drawer, Group, Stack } from "@mantine/core";
import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import {
  DRAWER_TITLE,
  LOGOUT_ICON,
  LOGOUT_LABEL,
  MENU_BUTTON_LABEL,
  NAV_ITEMS,
} from "./consts";
import classes from "./Navbar.module.css";
import { useNavbar } from "./useNavbar";

export function Navbar() {
  const navigate = useNavigate();
  const {
    user,
    pathname,
    loggingOut,
    handleLogout,
    isMobileNav,
    menuOpened,
    closeMenu,
    toggleMenu,
  } = useNavbar();

  function handleNavigate(path: string) {
    navigate(path);
    closeMenu();
  }

  return (
    <>
      <Group className={classes.navbar}>
        <Group className={classes.inner}>
          {user?.onboarded ? (
            <>
              <Burger
                className={classes.menuButton}
                opened={menuOpened}
                onClick={toggleMenu}
                aria-label={MENU_BUTTON_LABEL}
              />
              <Group className={classes.navLinks}>
                {NAV_ITEMS.map((item, index) => {
                  const TabIcon = item.icon;
                  return (
                    <Fragment key={item.path}>
                      {index > 0 ? (
                        <span className={classes.navDivider} aria-hidden />
                      ) : null}
                      <Button
                        className={
                          pathname === item.path
                            ? classes.navButtonActive
                            : classes.navButton
                        }
                        leftSection={<TabIcon />}
                        onClick={() => handleNavigate(item.path)}
                      >
                        {item.label}
                      </Button>
                    </Fragment>
                  );
                })}
              </Group>
            </>
          ) : null}

          <Button
            className={classes.logoutButton}
            leftSection={<LOGOUT_ICON />}
            loading={loggingOut}
            onClick={() => void handleLogout()}
          >
            {LOGOUT_LABEL}
          </Button>
        </Group>
      </Group>

      {user?.onboarded && isMobileNav ? (
        <Drawer
          classNames={{
            content: classes.drawerContent,
            header: classes.drawerHeader,
            title: classes.drawerTitle,
          }}
          opened={menuOpened}
          onClose={closeMenu}
          position="right"
          title={DRAWER_TITLE}
        >
          <Stack className={classes.drawerLinks}>
            {NAV_ITEMS.map((item) => {
              const TabIcon = item.icon;
              return (
                <Button
                  key={item.path}
                  className={
                    pathname === item.path
                      ? classes.drawerLinkActive
                      : classes.drawerLink
                  }
                  leftSection={<TabIcon />}
                  onClick={() => handleNavigate(item.path)}
                >
                  {item.label}
                </Button>
              );
            })}
          </Stack>
        </Drawer>
      ) : null}
    </>
  );
}
