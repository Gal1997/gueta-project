import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Anchor,
  Box,
  Button,
  Center,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconBrandGoogle } from "@tabler/icons-react";
import { useAuth } from "../../auth/AuthContext";
import type { User } from "../../auth/authApi";
import { requestGoogleAccessToken } from "../../auth/google";
import classes from "../authShared.module.css";

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");

  const form = useForm({
    mode: "uncontrolled",
    initialValues: { email: "", password: "" },
    validate: {
      email: (value) => (value ? null : "Please enter your email"),
      password: (value) => (value ? null : "Please enter your password"),
    },
  });

  function goAfterAuth(user: User) {
    navigate(user.onboarded ? "/main" : "/onboarding");
  }

  async function handleLogin(values: typeof form.values) {
    setSubmitting(true);
    try {
      const user = await login(values);
      goAfterAuth(user);
    } catch (error) {
      form.setErrors({
        email: " ",
        password: error instanceof Error ? error.message : "Login failed",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setGoogleError("");
    setGoogleLoading(true);
    try {
      const accessToken = await requestGoogleAccessToken();
      const user = await loginWithGoogle(accessToken);
      goAfterAuth(user);
    } catch (error) {
      setGoogleError(
        error instanceof Error ? error.message : "Google sign-in failed.",
      );
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <Center className={classes.page}>
      <Paper className={classes.card}>
        <Stack className={classes.header}>
          <Group className={classes.brand}>
            <Box className={classes.logo}>OG</Box>
            <Text className={classes.brandName}>FinTrack</Text>
          </Group>
          <Title className={classes.title}>Welcome back</Title>
          <Text className={classes.subtitle}>
            Sign in to your account to continue
          </Text>
        </Stack>

        <Box
          component="form"
          className={classes.form}
          onSubmit={form.onSubmit(handleLogin)}
        >
          <TextInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            key={form.key("email")}
            {...form.getInputProps("email")}
          />

          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            autoComplete="current-password"
            key={form.key("password")}
            {...form.getInputProps("password")}
          />

          <Button type="submit" className={classes.blockButton} loading={submitting}>
            Log in
          </Button>
        </Box>

        <Divider label="or" labelPosition="center" className={classes.divider} />

        <Button
          className={classes.googleButton}
          leftSection={<IconBrandGoogle />}
          loading={googleLoading}
          onClick={handleGoogle}
        >
          Log in with Google
        </Button>

        {googleError && <Text className={classes.error}>{googleError}</Text>}

        <Text className={classes.footer}>
          Don't have an account?{" "}
          <Anchor component={Link} to="/register">
            Register
          </Anchor>
        </Text>
      </Paper>
    </Center>
  );
}
