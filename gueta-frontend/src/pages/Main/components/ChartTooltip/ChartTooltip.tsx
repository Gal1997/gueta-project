import { Box, Text } from "@mantine/core";
import { formatTooltipAmount } from "../../utils";
import classes from "./ChartTooltip.module.css";

export function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: readonly { name?: string | number; value?: number | string }[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;

  const entry = payload[0];
  const title =
    (typeof label === "string" && label) ||
    (typeof entry?.name === "string" ? entry.name : null);
  const value = entry?.value;
  if (value == null) return null;

  return (
    <Box className={classes.tooltip}>
      {title ? <Text className={classes.tooltipLabel}>{title}</Text> : null}
      <Text className={classes.tooltipValue}>{formatTooltipAmount(value)}</Text>
    </Box>
  );
}
