import type { InvestmentUpdateMode } from "../../../auth/authApi";
import type { CapitalEntity } from "../consts";

export const ENTITY_TITLES: Record<
  CapitalEntity,
  { add: string; edit: string }
> = {
  available: { add: "הוספת כסף זמין", edit: "עריכת כסף זמין" },
  investment: { add: "הוספת השקעה", edit: "עדכון השקעה" },
  future: { add: "הוספת כסף עתידי", edit: "עריכת כסף עתידי" },
};

export const INVESTMENT_UPDATE_MODES = [
  { value: "contribution", label: "הפרשה/משיכה" },
  { value: "valuation", label: "עדכון תשואה/מצב" },
] as const;

export const INVESTMENT_FIELD_LABELS = {
  currentAmount: "סכום נוכחי",
  contribution: "סכום שינוי",
  contributionHint:
    "מספר חיובי = הפרשה, מספר שלילי = משיכה. לא משפיע על סך התשואה.",
  valuationAmount: "סכום נוכחי מעודכן",
  url: "קישור לאתר",
  urlPlaceholder: "https://example.com",
  urlHint: "אופציונלי",
  description: "תיאור",
  descriptionHint: "אופציונלי",
} as const;

export const ERRORS = {
  saveFailed: "שמירה נכשלה.",
} as const;

export type AvailableFormValues = {
  type: string;
  amount: number | string;
  currency: string;
  description: string;
};

export type InvestmentFormValues = {
  type: string;
  amount: number | string;
  principalAmount: number | string;
  currency: string;
  url: string;
  description: string;
  updateMode: InvestmentUpdateMode;
  contribution: number | string;
  valuationAmount: number | string;
};

export type FutureFormValues = {
  description: string;
  amount: number | string;
  currency: string;
  expectedPaymentDate: string | null;
};
