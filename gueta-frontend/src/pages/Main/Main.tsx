import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Center, Stack, Text, Title } from "@mantine/core";
import { useAuth } from "../../auth/AuthContext";
import classes from "../pages.module.css";

export default function Main() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      navigate("/");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <Center className={classes.fullPage}>
      <Stack className={classes.stack}>
        <Title order={1}>FinTrack</Title>
        <Text className={classes.dimmed}>Signed in as {user?.email}</Text>
        <Button variant="default" onClick={handleLogout} loading={loggingOut}>
          Log out
        </Button>
      </Stack>
    </Center>
  );
}
