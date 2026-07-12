import { Box, Text } from "@mantine/core";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BAR_CHART_MARGIN, CHART_TICK, PIE_PALETTE, type ChartEntry } from "../../consts";
import { formatAxisTick } from "../../utils";
import { CHART_TOOLTIP_PROPS } from "./consts";
import classes from "./DashboardCharts.module.css";

type DashboardChartsProps = {
  spendingData: ChartEntry[];
  savingsData: ChartEntry[];
  expenseTypeData: ChartEntry[];
};

export function DashboardCharts({
  spendingData,
  savingsData,
  expenseTypeData,
}: DashboardChartsProps) {
  return (
    <Box className={classes.chartsGrid}>
      <Box className={classes.chartCard}>
        <Text className={classes.cardTitle}>על מה מוציאים כסף</Text>
        {spendingData.length > 0 ? (
          <Box className={classes.chartBody}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={spendingData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="55%"
                  outerRadius="80%"
                  paddingAngle={2}
                >
                  {spendingData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={PIE_PALETTE[index % PIE_PALETTE.length]}
                    />
                  ))}
                </Pie>
                <Tooltip {...CHART_TOOLTIP_PROPS} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Text className={classes.emptyText}>אין הוצאות להצגה.</Text>
        )}
      </Box>

      <Box className={classes.chartCard}>
        <Text className={classes.cardTitle}>חיסכון החודש</Text>
        <Box className={classes.chartBody}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={savingsData} margin={BAR_CHART_MARGIN}>
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
                {savingsData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      <Box className={classes.chartCard}>
        <Text className={classes.cardTitle}>הוצאות לפי סוג</Text>
        {expenseTypeData.length > 0 ? (
          <Box className={classes.chartBody}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseTypeData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="55%"
                  outerRadius="80%"
                  paddingAngle={2}
                >
                  {expenseTypeData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...CHART_TOOLTIP_PROPS} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Text className={classes.emptyText}>אין הוצאות להצגה.</Text>
        )}
      </Box>
    </Box>
  );
}
