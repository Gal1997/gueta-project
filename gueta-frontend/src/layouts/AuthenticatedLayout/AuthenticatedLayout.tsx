import { Box } from "@mantine/core";
import { Outlet } from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import classes from "./AuthenticatedLayout.module.css";

export function AuthenticatedLayout() {
  return (
    <Box className={classes.layout}>
      <Navbar />
      <Outlet />
    </Box>
  );
}
