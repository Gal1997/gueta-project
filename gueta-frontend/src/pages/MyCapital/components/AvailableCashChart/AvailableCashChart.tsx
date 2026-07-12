import { Box, Text } from "@mantine/core";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AVAILABLE_CHART_TITLE, BAR_CHART_MARGIN, CHART_TICK } from "../../consts";
import type { ChartEntry } from "../../utils";
import { formatAxisTick } from "../../utils";
import { CHART_TOOLTIP_PROPS } from "../CapitalDistributionChart/consts";
import classes from "./AvailableCashChart.module.css";

type AvailableCashChartProps = {
  data: ChartEntry[];
};

export function AvailableCashChart({ data }: AvailableCashChartProps) {
  return (
    <Box className={classes.chartCard}>
      <Text className={classes.cardTitle}>{AVAILABLE_CHART_TITLE}</Text>
      {data.length > 0 ? (
        <Box className={classes.chartBody}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={BAR_CHART_MARGIN}>
              <XAxis
                dataKey="name"
                tick={CHART_TICK}
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                interval={0}
              />
              <YAxis
                tick={CHART_TICK}
                axisLine={false}
                tickLine={false}
                width={48}
                tickFormatter={formatAxisTick}
              />
              <Tooltip cursor={false} {...CHART_TOOLTIP_PROPS} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      ) : (
        <Text className={classes.emptyText}>אין נתונים להצגה.</Text>
      )}
    </Box>
  );
}
