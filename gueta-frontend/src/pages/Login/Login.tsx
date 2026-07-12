import { Link } from "react-router-dom";
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
import { IconBrandGoogle } from "@tabler/icons-react";
import classes from "../authShared.module.css";
import { BRAND_LOGO, BRAND_NAME, LOGIN_COPY } from "./consts";
import { useLogin } from "./useLogin";

export default function Login() {
  const { form, submitting, googleLoading, googleError, handleLogin, handleGoogle } =
    useLogin();

  return (
    <Center className={classes.page}>
      <Paper className={classes.card}>
        <Stack className={classes.header}>
          <Group className={classes.brand}>
            <Text className={classes.brandName}>{BRAND_NAME}</Text>
            <Box className={classes.logo}>{BRAND_LOGO}</Box>
          </Group>
          <Title className={classes.title}>{LOGIN_COPY.title}</Title>
          <Text className={classes.subtitle}>{LOGIN_COPY.subtitle}</Text>
        </Stack>

        <Box
          component="form"
          className={classes.form}
          onSubmit={form.onSubmit(handleLogin)}
        >
          <TextInput
            label="אימייל"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            key={form.key("email")}
            {...form.getInputProps("email")}
          />

          <PasswordInput
            label="סיסמה"
            placeholder="הזינו את הסיסמה"
            autoComplete="current-password"
            key={form.key("password")}
            {...form.getInputProps("password")}
          />

          <Button type="submit" className={classes.blockButton} loading={submitting}>
            {LOGIN_COPY.submit}
          </Button>
        </Box>

        <Divider label="או" labelPosition="center" className={classes.divider} />

        <Button
          className={classes.googleButton}
          rightSection={<IconBrandGoogle />}
          loading={googleLoading}
          onClick={handleGoogle}
        >
          {LOGIN_COPY.google}
        </Button>

        {googleError && <Text className={classes.error}>{googleError}</Text>}

        <Text className={classes.footer}>
          {LOGIN_COPY.footerPrefix}{" "}
          <Anchor component={Link} to="/register">
            {LOGIN_COPY.footerLink}
          </Anchor>
        </Text>
      </Paper>
    </Center>
  );
}
