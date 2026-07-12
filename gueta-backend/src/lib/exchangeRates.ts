export type SupportedCurrency = "ILS" | "USD" | "EUR";

export type ExchangeRates = {
  toIls: Record<SupportedCurrency, number>;
  source: "google" | "frankfurter";
  updatedAt: string;
};

const CACHE_TTL_MS = 60 * 60 * 1000;
const FOREIGN_CURRENCIES: SupportedCurrency[] = ["USD", "EUR"];

let cache: { rates: ExchangeRates; expiresAt: number } | null = null;

async function fetchGoogleRate(
  from: SupportedCurrency,
  to: SupportedCurrency,
): Promise<number | null> {
  if (from === to) return 1;

  try {
    const response = await fetch(
      `https://www.google.com/finance/quote/${from}-${to}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
      },
    );

    if (!response.ok) return null;

    const html = await response.text();
    const patterns = [
      /data-last-price="([\d.]+)"/,
      /data-exchange-rate="([\d.]+)"/,
      new RegExp(
        `${from}\\s*/\\s*${to}[\\s\\S]{0,3000}?class="[^"]*"[^>]*>([\\d.]+)<`,
        "i",
      ),
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (!match) continue;
      const rate = Number.parseFloat(match[1]);
      if (Number.isFinite(rate) && rate > 0) return rate;
    }

    return null;
  } catch {
    return null;
  }
}

async function fetchFrankfurterRate(
  from: SupportedCurrency,
  to: SupportedCurrency,
): Promise<number> {
  const response = await fetch(
    `https://api.frankfurter.app/latest?from=${from}&to=${to}`,
    { redirect: "follow" },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch exchange rates.");
  }

  const data = (await response.json()) as { rates: Record<string, number> };
  const rate = data.rates[to];
  if (!rate) {
    throw new Error(`Missing exchange rate for ${from} to ${to}.`);
  }

  return rate;
}

export async function getExchangeRates(): Promise<ExchangeRates> {
  if (cache && Date.now() < cache.expiresAt) {
    return cache.rates;
  }

  const toIls: Record<SupportedCurrency, number> = {
    ILS: 1,
    USD: 1,
    EUR: 1,
  };

  let usedGoogle = true;

  for (const currency of FOREIGN_CURRENCIES) {
    const googleRate = await fetchGoogleRate(currency, "ILS");
    if (googleRate) {
      toIls[currency] = googleRate;
      continue;
    }

    usedGoogle = false;
    toIls[currency] = await fetchFrankfurterRate(currency, "ILS");
  }

  const rates: ExchangeRates = {
    toIls,
    source: usedGoogle ? "google" : "frankfurter",
    updatedAt: new Date().toISOString(),
  };

  cache = { rates, expiresAt: Date.now() + CACHE_TTL_MS };
  return rates;
}

import { fromMinorUnits, toMinorUnits } from "./money";

export function convertToIls(
  amountMinor: number,
  currency: SupportedCurrency,
  rates: ExchangeRates,
): number {
  const major = fromMinorUnits(amountMinor);
  return toMinorUnits(major * rates.toIls[currency]);
}
