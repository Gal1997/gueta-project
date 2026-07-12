import type {
  AvailableCash,
  CapitalInvestment,
  FutureMoney,
} from "@prisma/client";
import { prisma } from "../../db/prisma";
import { HttpError } from "../../lib/errors";
import {
  convertToIls,
  getExchangeRates,
  type ExchangeRates,
} from "../../lib/exchangeRates";
import {
  mapAvailableCash,
  mapCapitalSummary,
  mapFutureMoney,
  mapInvestment,
} from "../../lib/moneyMappers";
import type {
  AvailableCashInput,
  CapitalInvestmentInput,
  FutureMoneyInput,
  UpdateCapitalInvestmentInput,
} from "./capital.schemas";
import type { CapitalData } from "./capital.types";
import {
  adjustCheckingBalance,
  currentMonthKey,
  previousMonthKey,
  sumAmountsInIls,
} from "./capital.utils";

const WITHDRAWABLE_TO_CHECKING_TYPES = new Set(["bit", "paybox"]);

async function syncCurrentMonthSnapshot(
  userId: string,
  totalCapital: number,
): Promise<void> {
  const monthKey = currentMonthKey();
  await prisma.capitalMonthlySnapshot.upsert({
    where: { userId_monthKey: { userId, monthKey } },
    create: { userId, monthKey, totalCapital },
    update: { totalCapital },
  });
}

async function getLastMonthTotal(userId: string): Promise<number> {
  const prevKey = previousMonthKey(currentMonthKey());
  const snapshot = await prisma.capitalMonthlySnapshot.findUnique({
    where: { userId_monthKey: { userId, monthKey: prevKey } },
  });
  return snapshot?.totalCapital ?? 0;
}

function sumInvestmentReturns(
  investments: CapitalInvestment[],
  rates: ExchangeRates,
): number {
  return investments.reduce(
    (sum, item) =>
      sum +
      convertToIls(item.amount - item.principalAmount, item.currency, rates),
    0,
  );
}

function sumInvestmentPrincipal(
  investments: CapitalInvestment[],
  rates: ExchangeRates,
): number {
  return investments.reduce(
    (sum, item) =>
      sum + convertToIls(item.principalAmount, item.currency, rates),
    0,
  );
}

function buildSummary(
  available: AvailableCash[],
  investments: CapitalInvestment[],
  future: FutureMoney[],
  lastMonthTotal: number,
  rates: ExchangeRates,
) {
  const availableTotal = sumAmountsInIls(available, rates);
  const investmentTotal = sumAmountsInIls(investments, rates);
  const investmentReturnTotal = sumInvestmentReturns(investments, rates);
  const investmentPrincipalTotal = sumInvestmentPrincipal(investments, rates);
  const futureTotal = sumAmountsInIls(future, rates);
  const totalCapital = availableTotal + investmentTotal + futureTotal;

  return {
    totalCapital,
    availableTotal,
    investmentTotal,
    investmentReturnTotal,
    investmentPrincipalTotal,
    futureTotal,
    lastMonthTotal,
    totalDelta: totalCapital - lastMonthTotal,
  };
}

export async function getCapitalData(userId: string): Promise<CapitalData> {
  const [available, investments, future, lastMonthTotal, exchangeRates] =
    await Promise.all([
      prisma.availableCash.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.capitalInvestment.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.futureMoney.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      }),
      getLastMonthTotal(userId),
      getExchangeRates(),
    ]);

  const summary = buildSummary(
    available,
    investments,
    future,
    lastMonthTotal,
    exchangeRates,
  );

  await syncCurrentMonthSnapshot(userId, summary.totalCapital);

  return {
    available: available.map(mapAvailableCash),
    investments: investments.map(mapInvestment),
    future: future.map(mapFutureMoney),
    summary: mapCapitalSummary(summary),
    exchangeRates,
  };
}

async function assertAvailableCashOwner(
  userId: string,
  id: string,
): Promise<AvailableCash> {
  const record = await prisma.availableCash.findUnique({ where: { id } });
  if (!record || record.userId !== userId) {
    throw new HttpError(404, "רשומת כסף זמין לא נמצאה.");
  }
  return record;
}

async function assertCapitalInvestmentOwner(
  userId: string,
  id: string,
): Promise<CapitalInvestment> {
  const record = await prisma.capitalInvestment.findUnique({ where: { id } });
  if (!record || record.userId !== userId) {
    throw new HttpError(404, "רשומת השקעה לא נמצאה.");
  }
  return record;
}

async function assertFutureMoneyOwner(
  userId: string,
  id: string,
): Promise<FutureMoney> {
  const record = await prisma.futureMoney.findUnique({ where: { id } });
  if (!record || record.userId !== userId) {
    throw new HttpError(404, "רשומת כסף עתידי לא נמצאה.");
  }
  return record;
}

export async function createAvailableCash(
  userId: string,
  data: AvailableCashInput,
) {
  const record = await prisma.availableCash.create({
    data: {
      ...data,
      userId,
      currency: data.currency ?? "ILS",
    },
  });
  return mapAvailableCash(record);
}

export async function updateAvailableCash(
  userId: string,
  id: string,
  data: AvailableCashInput,
) {
  await assertAvailableCashOwner(userId, id);
  const record = await prisma.availableCash.update({
    where: { id },
    data: {
      ...data,
      currency: data.currency ?? "ILS",
    },
  });
  return mapAvailableCash(record);
}

export async function deleteAvailableCash(
  userId: string,
  id: string,
): Promise<void> {
  await assertAvailableCashOwner(userId, id);
  await prisma.availableCash.delete({ where: { id } });
}

export async function createCapitalInvestment(
  userId: string,
  data: CapitalInvestmentInput,
) {
  const record = await prisma.capitalInvestment.create({
    data: {
      ...data,
      userId,
      currency: data.currency ?? "ILS",
      principalAmount: data.amount,
    },
  });
  return mapInvestment(record);
}

export async function updateCapitalInvestment(
  userId: string,
  id: string,
  data: UpdateCapitalInvestmentInput,
) {
  const record = await assertCapitalInvestmentOwner(userId, id);

  if (data.updateMode === "contribution") {
    const newAmount = record.amount + data.contribution;
    const newPrincipal = record.principalAmount + data.contribution;

    if (newAmount < 0 || newPrincipal < 0) {
      throw new HttpError(400, "סכום המשיכה גבוה מהיתרה.");
    }

    const updated = await prisma.capitalInvestment.update({
      where: { id },
      data: {
        amount: newAmount,
        principalAmount: newPrincipal,
      },
    });
    return mapInvestment(updated);
  }

  if (data.updateMode === "link") {
    const updated = await prisma.capitalInvestment.update({
      where: { id },
      data: { url: data.url },
    });
    return mapInvestment(updated);
  }

  if (data.updateMode === "description") {
    const updated = await prisma.capitalInvestment.update({
      where: { id },
      data: { description: data.description },
    });
    return mapInvestment(updated);
  }

  const updated = await prisma.capitalInvestment.update({
    where: { id },
    data: { amount: data.amount },
  });
  return mapInvestment(updated);
}

export async function deleteCapitalInvestment(
  userId: string,
  id: string,
): Promise<void> {
  await assertCapitalInvestmentOwner(userId, id);
  await prisma.capitalInvestment.delete({ where: { id } });
}

export async function createFutureMoney(
  userId: string,
  data: FutureMoneyInput,
) {
  const record = await prisma.futureMoney.create({
    data: {
      ...data,
      userId,
      currency: data.currency ?? "ILS",
    },
  });
  return mapFutureMoney(record);
}

export async function updateFutureMoney(
  userId: string,
  id: string,
  data: FutureMoneyInput,
) {
  await assertFutureMoneyOwner(userId, id);
  const record = await prisma.futureMoney.update({
    where: { id },
    data: {
      ...data,
      currency: data.currency ?? "ILS",
    },
  });
  return mapFutureMoney(record);
}

export async function deleteFutureMoney(
  userId: string,
  id: string,
): Promise<void> {
  await assertFutureMoneyOwner(userId, id);
  await prisma.futureMoney.delete({ where: { id } });
}

export async function receiveFutureMoney(
  userId: string,
  id: string,
): Promise<void> {
  const rates = await getExchangeRates();

  await prisma.$transaction(async (tx) => {
    const future = await tx.futureMoney.findUnique({ where: { id } });
    if (!future || future.userId !== userId) {
      throw new HttpError(404, "רשומת כסף עתידי לא נמצאה.");
    }

    const ilsAmount = convertToIls(future.amount, future.currency, rates);
    await adjustCheckingBalance(tx, userId, ilsAmount);
    await tx.futureMoney.delete({ where: { id } });
  });
}

export async function withdrawToChecking(
  userId: string,
  id: string,
  amount: number,
): Promise<void> {
  const rates = await getExchangeRates();

  await prisma.$transaction(async (tx) => {
    const source = await tx.availableCash.findUnique({ where: { id } });
    if (!source || source.userId !== userId) {
      throw new HttpError(404, "רשומת כסף זמין לא נמצאה.");
    }
    if (!WITHDRAWABLE_TO_CHECKING_TYPES.has(source.type)) {
      throw new HttpError(400, 'ניתן למשוך לעו"ש רק מביט או פייבוקס.');
    }
    if (amount > source.amount) {
      throw new HttpError(400, "סכום המשיכה גבוה מהיתרה.");
    }

    const ilsAmount = convertToIls(amount, source.currency, rates);

    await tx.availableCash.update({
      where: { id },
      data: { amount: source.amount - amount },
    });
    await adjustCheckingBalance(tx, userId, ilsAmount);
  });
}

export type { CapitalData } from "./capital.types";
