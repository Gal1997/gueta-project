import type { Prisma } from "@prisma/client";
import type { ExchangeRates, SupportedCurrency } from "../../lib/exchangeRates";
import { convertToIls } from "../../lib/exchangeRates";

export function currentMonthKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function previousMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  return `${prevYear}-${String(prevMonth).padStart(2, "0")}`;
}

export function sumAmounts(items: { amount: number }[]): number {
  return items.reduce((sum, item) => sum + item.amount, 0);
}

export function sumAmountsInIls(
  items: { amount: number; currency?: SupportedCurrency }[],
  rates: ExchangeRates,
): number {
  return items.reduce(
    (sum, item) =>
      sum + convertToIls(item.amount, item.currency ?? "ILS", rates),
    0,
  );
}

export async function adjustCheckingBalance(
  tx: Prisma.TransactionClient,
  userId: string,
  amountDelta: number,
): Promise<void> {
  if (amountDelta === 0) return;

  let checking = await tx.availableCash.findFirst({
    where: { userId, type: "checking" },
    orderBy: { updatedAt: "desc" },
  });

  if (!checking) {
    checking = await tx.availableCash.create({
      data: { userId, type: "checking", amount: 0, currency: "ILS" },
    });
  }

  await tx.availableCash.update({
    where: { id: checking.id },
    data: { amount: checking.amount + amountDelta },
  });
}
