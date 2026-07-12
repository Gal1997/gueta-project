import { Box, Text } from "@mantine/core";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ChartEntry } from "../../utils";
import { CHART_TOOLTIP_PROPS } from "./consts";
import classes from "./CapitalDistributionChart.module.css";

type CapitalDistributionChartProps = {
  title: string;
  data: ChartEntry[];
};

export function CapitalDistributionChart({
  title,
  data,
}: CapitalDistributionChartProps) {
  return (
    <Box className={classes.chartCard}>
      <Text className={classes.cardTitle}>{title}</Text>
      {data.length > 0 ? (
        <Box className={classes.chartBody}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="55%"
                outerRadius="80%"
                paddingAngle={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip {...CHART_TOOLTIP_PROPS} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      ) : (
        <Text className={classes.emptyText}>אין נתונים להצגה.</Text>
      )}
    </Box>
  );
}
