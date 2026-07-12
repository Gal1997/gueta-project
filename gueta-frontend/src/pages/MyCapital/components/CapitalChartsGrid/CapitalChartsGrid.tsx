import { Box } from "@mantine/core";
import { CHART_TITLE, INVESTMENT_CHART_TITLE } from "../../consts";
import type { ChartEntry } from "../../utils";
import { AvailableCashChart } from "../AvailableCashChart/AvailableCashChart";
import { CapitalDistributionChart } from "../CapitalDistributionChart/CapitalDistributionChart";
import classes from "./CapitalChartsGrid.module.css";

type CapitalChartsGridProps = {
  totalData: ChartEntry[];
  availableData: ChartEntry[];
  investmentData: ChartEntry[];
};

export function CapitalChartsGrid({
  totalData,
  availableData,
  investmentData,
}: CapitalChartsGridProps) {
  return (
    <Box className={classes.chartsGrid}>
      <CapitalDistributionChart title={CHART_TITLE} data={totalData} />
      <AvailableCashChart data={availableData} />
      <CapitalDistributionChart
        title={INVESTMENT_CHART_TITLE}
        data={investmentData}
      />
    </Box>
  );
}
