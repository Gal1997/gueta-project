import dayjs from "dayjs";
import type {
  CapitalSummary,
  CapitalCurrency,
  ExchangeRates,
  StoredAvailableCash,
  StoredCapitalInvestment,
} from "../../auth/authApi";
import {
  AVAILABLE_CASH_TYPE_LABELS,
  AVAILABLE_CASH_TYPE_COLORS,
  CAPITAL_INVESTMENT_TYPE_LABELS,
  CAPITAL_INVESTMENT_TYPE_COLORS,
  DISTRIBUTION_COLORS,
} from "../../finance/capitalConstants";
import { convertToIls } from "../../finance/currency";
import { KPI_LABELS, currency } from "./consts";

export type CapitalKpiItem = {
  label: string;
  value: number;
  className: string;
  comparison?: string;
};

export type ChartEntry = {
  name: string;
  value: number;
  color: string;
};

export function formatAxisTick(value: number): string {
  const abs = Math.abs(value);
  const prefix = value < 0 ? "-" : "";
  if (abs >= 1000) return `${prefix}${Math.round(abs / 1000)}k`;
  return `${prefix}${abs}`;
}

export function formatDate(value: string): string {
  return dayjs(value).format("DD/MM/YYYY");
}

export function formatOptionalDate(value: string | null | undefined): string {
  return value ? formatDate(value) : "—";
}

export function formatDelta(delta: number): string {
  const formatted = currency.format(Math.abs(delta));
  if (delta > 0) return `+${formatted} לעומת חודש שעבר`;
  if (delta < 0) return `-${formatted} לעומת חודש שעבר`;
  return "ללא שינוי לעומת חודש שעבר";
}

export function formatReturn(value: number): string {
  const formatted = currency.format(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

export function buildKpis(
  summary: CapitalSummary,
  classes: {
    total: string;
    available: string;
    investments: string;
    future: string;
  },
): CapitalKpiItem[] {
  return [
    {
      label: KPI_LABELS.total,
      value: summary.totalCapital,
      className: classes.total,
      comparison: formatDelta(summary.totalDelta),
    },
    {
      label: KPI_LABELS.available,
      value: summary.availableTotal,
      className: classes.available,
    },
    {
      label: KPI_LABELS.investments,
      value: summary.investmentTotal,
      className: classes.investments,
    },
    {
      label: KPI_LABELS.future,
      value: summary.futureTotal,
      className: classes.future,
    },
  ];
}

export function buildDistributionData(summary: CapitalSummary): ChartEntry[] {
  return [
    {
      name: KPI_LABELS.available,
      value: summary.availableTotal,
      color: DISTRIBUTION_COLORS.available,
    },
    {
      name: KPI_LABELS.investments,
      value: summary.investmentTotal,
      color: DISTRIBUTION_COLORS.investments,
    },
    {
      name: KPI_LABELS.future,
      value: summary.futureTotal,
      color: DISTRIBUTION_COLORS.future,
    },
  ].filter((entry) => entry.value > 0);
}

function buildTypeDistribution(
  items: { type: string; amount: number; currency: CapitalCurrency }[],
  labelMap: Record<string, string>,
  colorMap: Record<string, string>,
  rates: ExchangeRates,
): ChartEntry[] {
  const totals = new Map<string, number>();

  for (const item of items) {
    const ilsAmount = convertToIls(item.amount, item.currency, rates.toIls);
    totals.set(item.type, (totals.get(item.type) ?? 0) + ilsAmount);
  }

  return Array.from(totals.entries())
    .filter(([, value]) => value > 0)
    .map(([type, value]) => ({
      name: labelMap[type] ?? type,
      value,
      color: colorMap[type] ?? "#868e96",
    }));
}

export function buildAvailableDistributionData(
  items: StoredAvailableCash[],
  rates: ExchangeRates,
): ChartEntry[] {
  return buildTypeDistribution(
    items,
    AVAILABLE_CASH_TYPE_LABELS,
    AVAILABLE_CASH_TYPE_COLORS,
    rates,
  ).sort((a, b) => b.value - a.value);
}

export function buildInvestmentDistributionData(
  items: StoredCapitalInvestment[],
  rates: ExchangeRates,
): ChartEntry[] {
  return buildTypeDistribution(
    items,
    CAPITAL_INVESTMENT_TYPE_LABELS,
    CAPITAL_INVESTMENT_TYPE_COLORS,
    rates,
  );
}

export { currency };
