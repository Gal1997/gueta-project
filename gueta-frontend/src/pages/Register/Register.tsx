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
import { hasLength, isEmail, matchesField, useForm } from "@mantine/form";
import { IconBrandGoogle } from "@tabler/icons-react";
import { useAuth } from "../../auth/AuthContext";
import { requestGoogleAccessToken } from "../../auth/google";
import classes from "../authShared.module.css";

export default function Register() {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");

  const form = useForm({
    mode: "uncontrolled",
    initialValues: { name: "", email: "", password: "", confirmPassword: "" },
    validate: {
      name: hasLength({ min: 2 }, "Please enter your name"),
      email: isEmail("Please enter a valid email"),
      password: hasLength({ min: 6 }, "Password must be at least 6 characters"),
      confirmPassword: matchesField("password", "Passwords do not match"),
    },
  });

  async function handleRegister(values: typeof form.values) {
    setSubmitting(true);
    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      navigate("/onboarding");
    } catch (error) {
      form.setFieldError(
        "email",
        error instanceof Error ? error.message : "Registration failed",
      );
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
      navigate(user.onboarded ? "/main" : "/onboarding");
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
          <Title className={classes.title}>Create your account</Title>
          <Text className={classes.subtitle}>
            Start tracking your finances in minutes
          </Text>
        </Stack>

        <Box
          component="form"
          className={classes.form}
          onSubmit={form.onSubmit(handleRegister)}
        >
          <TextInput
            label="Name"
            placeholder="Jane Doe"
            autoComplete="name"
            key={form.key("name")}
            {...form.getInputProps("name")}
          />

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
            placeholder="At least 6 characters"
            autoComplete="new-password"
            key={form.key("password")}
            {...form.getInputProps("password")}
          />

          <PasswordInput
            label="Confirm password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            key={form.key("confirmPassword")}
            {...form.getInputProps("confirmPassword")}
          />

          <Button type="submit" className={classes.blockButton} loading={submitting}>
            Create account
          </Button>
        </Box>

        <Divider label="or" labelPosition="center" className={classes.divider} />

        <Button
          className={classes.googleButton}
          leftSection={<IconBrandGoogle />}
          loading={googleLoading}
          onClick={handleGoogle}
        >
          Sign up with Google
        </Button>

        {googleError && <Text className={classes.error}>{googleError}</Text>}

        <Text className={classes.footer}>
          Already have an account?{" "}
          <Anchor component={Link} to="/">
            Login
          </Anchor>
        </Text>
      </Paper>
    </Center>
  );
}
