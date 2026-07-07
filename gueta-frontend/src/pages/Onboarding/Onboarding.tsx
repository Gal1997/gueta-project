import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Center, Stack, Text, Title } from "@mantine/core";
import { useAuth } from "../../auth/AuthContext";
import classes from "../pages.module.css";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, completeOnboarding } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  async function handleFinish() {
    setSubmitting(true);
    try {
      await completeOnboarding();
      navigate("/main");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Center className={classes.fullPage}>
      <Stack className={classes.stack}>
        <Title order={1}>Welcome{user ? `, ${user.name}` : ""}</Title>
        <Text className={classes.dimmed}>
          Let's get your account set up. Onboarding steps will go here.
        </Text>
        <Button onClick={handleFinish} loading={submitting}>
          Finish setup
        </Button>
      </Stack>
    </Center>
  );
}
