import type {
  AvailableCash,
  CapitalInvestment,
  FutureMoney,
} from "@prisma/client";

import type { ExchangeRates } from "../../lib/exchangeRates";

export interface CapitalSummary {
  totalCapital: number;
  availableTotal: number;
  investmentTotal: number;
  investmentReturnTotal: number;
  investmentPrincipalTotal: number;
  futureTotal: number;
  lastMonthTotal: number;
  totalDelta: number;
}

export interface CapitalData {
  available: AvailableCash[];
  investments: CapitalInvestment[];
  future: FutureMoney[];
  summary: CapitalSummary;
  exchangeRates: ExchangeRates;
}
