import { Box, Text } from "@mantine/core";
import { currency, type CapitalKpiItem } from "../../utils";
import classes from "./CapitalKpiGrid.module.css";

type CapitalKpiGridProps = {
  kpis: CapitalKpiItem[];
};

export function CapitalKpiGrid({ kpis }: CapitalKpiGridProps) {
  return (
    <Box className={classes.kpiGrid}>
      {kpis.map((kpi) => (
        <Box key={kpi.label} className={classes.kpiCard}>
          <Text className={classes.kpiLabel}>{kpi.label}</Text>
          <Text className={`${classes.kpiValue} ${kpi.className}`}>
            {currency.format(kpi.value)}
          </Text>
          {kpi.comparison ? (
            <Text className={classes.kpiComparison}>{kpi.comparison}</Text>
          ) : null}
        </Box>
      ))}
    </Box>
  );
}
