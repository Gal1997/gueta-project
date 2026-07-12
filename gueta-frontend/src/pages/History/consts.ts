export const ERRORS = {
  loadFailed: "טעינת הנתונים נכשלה.",
} as const;

export const COPY = {
  title: "היסטוריה",
  subtitleSuffix: "הוצאות שהסתיימו",
  cardTitle: "הוצאות בהיסטוריה",
  empty: "אין הוצאות בהיסטוריה.",
  onceRemaining: "—",
} as const;

import { MONEY_DECIMAL_SCALE } from "../../finance/money";

export const currency = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  minimumFractionDigits: 0,
  maximumFractionDigits: MONEY_DECIMAL_SCALE,
});
