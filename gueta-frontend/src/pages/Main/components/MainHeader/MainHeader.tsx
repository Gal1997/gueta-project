import { Group, Stack, Text, Title } from "@mantine/core";
import type { User } from "../../../../auth/authApi";
import { monthLabel } from "../../consts";
import classes from "./MainHeader.module.css";

type MainHeaderProps = {
  user: User | null;
};

export function MainHeader({ user }: MainHeaderProps) {
  return (
    <Group className={classes.header}>
      <Stack className={classes.titles}>
        <Title className={classes.title} order={1}>
          לוח בקרה
        </Title>
        <Text className={classes.subtitle}>
          {user ? `${user.name} · ${monthLabel}` : monthLabel}
        </Text>
      </Stack>
    </Group>
  );
}
