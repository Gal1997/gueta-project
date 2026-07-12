export const COPY = {
  title: "ההון שלי",
  subtitle: "מעקב אחר מיקום וסכום הכסף שלך",
} as const;

export const KPI_LABELS = {
  total: "ההון הכולל",
  available: "כסף זמין",
  investments: "כסף בהשקעות",
  future: "כסף עתידי",
} as const;

export const TABLE_TITLES = {
  available: "כסף זמין",
  investments: "השקעות",
  future: "כסף עתידי (מעקב ידני)",
} as const;

export const INVESTMENT_RETURN_LABEL = "סך תשואה";
export const INVESTMENT_DEPOSITS_LABEL = "סך הפקדות";

export const CHART_TITLE = "פיזור ההון הכולל";
export const AVAILABLE_CHART_TITLE = "פיזור כסף זמין";
export const INVESTMENT_CHART_TITLE = "פיזור השקעות";

export const CHART_TICK = { fill: "var(--mantine-color-dimmed)", fontSize: 12 };

export const BAR_CHART_MARGIN = { top: 12, right: 16, left: 4, bottom: 8 };

export const ERRORS = {
  loadFailed: "טעינת נתוני ההון נכשלה.",
  deleteFailed: "מחיקה נכשלה.",
  receiveFailed: "העברת הכסף לעו\"ש נכשלה.",
  withdrawFailed: "משיכת הכסף לעו\"ש נכשלה.",
  refreshFailed: "רענון הנתונים נכשל.",
} as const;

import { MONEY_DECIMAL_SCALE } from "../../finance/money";

export const currency = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  minimumFractionDigits: 0,
  maximumFractionDigits: MONEY_DECIMAL_SCALE,
});

export type CapitalEntity = "available" | "investment" | "future";

export type CapitalModalState = {
  entity: CapitalEntity;
  mode: "add" | "edit";
  recordId?: string;
  available?: import("../../auth/authApi").StoredAvailableCash;
  investment?: import("../../auth/authApi").StoredCapitalInvestment;
  investmentUpdateMode?: import("../../auth/authApi").InvestmentUpdateMode;
  future?: import("../../auth/authApi").StoredFutureMoney;
};

export type CapitalDeleteState = {
  entity: CapitalEntity;
  recordId: string;
  label: string;
};

export type CapitalReceiveState = {
  recordId: string;
  label: string;
  amount: number;
  currency: import("../../auth/authApi").CapitalCurrency;
};

export type CapitalWithdrawState = {
  recordId: string;
  maxAmount: number;
  currency: import("../../auth/authApi").CapitalCurrency;
  sourceLabel: string;
};
