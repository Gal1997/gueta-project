import { Box, Text } from "@mantine/core";
import type { KpiItem } from "../../consts";
import { currency } from "../../utils";
import classes from "./KpiGrid.module.css";

type KpiGridProps = {
  kpis: KpiItem[];
};

export function KpiGrid({ kpis }: KpiGridProps) {
  return (
    <Box className={classes.kpiGrid}>
      {kpis.map((kpi) => (
        <Box key={kpi.label} className={classes.kpiCard}>
          <Text className={classes.kpiLabel}>{kpi.label}</Text>
          <Text className={`${classes.kpiValue} ${kpi.className}`}>
            {currency.format(kpi.value)}
          </Text>
        </Box>
      ))}
    </Box>
  );
}
