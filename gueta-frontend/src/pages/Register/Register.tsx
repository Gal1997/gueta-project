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
import { BRAND_LOGO, BRAND_NAME, REGISTER_COPY } from "./consts";
import { useRegister } from "./useRegister";

export default function Register() {
  const {
    form,
    submitting,
    googleLoading,
    googleError,
    handleRegister,
    handleGoogle,
  } = useRegister();

  return (
    <Center className={classes.page}>
      <Paper className={classes.card}>
        <Stack className={classes.header}>
          <Group className={classes.brand}>
            <Text className={classes.brandName}>{BRAND_NAME}</Text>
            <Box className={classes.logo}>{BRAND_LOGO}</Box>
          </Group>
          <Title className={classes.title}>{REGISTER_COPY.title}</Title>
        </Stack>

        <Box
          component="form"
          className={classes.form}
          onSubmit={form.onSubmit(handleRegister)}
        >
          <TextInput
            label="שם"
            placeholder="ישראל ישראלי"
            autoComplete="name"
            key={form.key("name")}
            {...form.getInputProps("name")}
          />

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
            placeholder="לפחות 6 תווים"
            autoComplete="new-password"
            key={form.key("password")}
            {...form.getInputProps("password")}
          />

          <PasswordInput
            label="אימות סיסמה"
            placeholder="הזינו שוב את הסיסמה"
            autoComplete="new-password"
            key={form.key("confirmPassword")}
            {...form.getInputProps("confirmPassword")}
          />

          <Button type="submit" className={classes.blockButton} loading={submitting}>
            {REGISTER_COPY.submit}
          </Button>
        </Box>

        <Divider label="או" labelPosition="center" className={classes.divider} />

        <Button
          className={classes.googleButton}
          leftSection={<IconBrandGoogle />}
          loading={googleLoading}
          onClick={handleGoogle}
        >
          {REGISTER_COPY.google}
        </Button>

        {googleError && <Text className={classes.error}>{googleError}</Text>}

        <Text className={classes.footer}>
          {REGISTER_COPY.footerPrefix}{" "}
          <Anchor component={Link} to="/">
            {REGISTER_COPY.footerLink}
          </Anchor>
        </Text>
      </Paper>
    </Center>
  );
}
