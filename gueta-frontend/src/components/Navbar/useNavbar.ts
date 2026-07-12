import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { MOBILE_NAV_MAX_WIDTH } from "./consts";

export function useNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const isMobileNav = useMediaQuery(MOBILE_NAV_MAX_WIDTH);
  const [menuOpened, { close: closeMenu, toggle: toggleMenu }] =
    useDisclosure(false);

  useEffect(() => {
    closeMenu();
  }, [location.pathname, closeMenu]);

  useEffect(() => {
    if (!isMobileNav) {
      closeMenu();
    }
  }, [isMobileNav, closeMenu]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      navigate("/");
    } finally {
      setLoggingOut(false);
    }
  }

  return {
    user,
    pathname: location.pathname,
    loggingOut,
    handleLogout,
    isMobileNav,
    menuOpened,
    closeMenu,
    toggleMenu,
  };
}
