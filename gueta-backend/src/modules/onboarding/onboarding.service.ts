import { prisma } from "../../db/prisma";
import { getExchangeRates } from "../../lib/exchangeRates";
import { toPublicUser } from "../../lib/mappers";
import { currentMonthKey, sumAmountsInIls } from "../capital/capital.utils";
import type { PublicUser } from "../auth/auth.types";
import type { OnboardingInput } from "./onboarding.schemas";

export async function saveOnboarding(
  userId: string,
  data: OnboardingInput,
): Promise<PublicUser> {
  const exchangeRates = await getExchangeRates();

  const user = await prisma.$transaction(async (tx) => {
    if (data.availableCash.length > 0) {
      await tx.availableCash.createMany({
        data: data.availableCash.map((item) => ({
          ...item,
          userId,
          currency: item.currency ?? "ILS",
        })),
      });
    }

    if (data.investments.length > 0) {
      await tx.capitalInvestment.createMany({
        data: data.investments.map((item) => ({
          ...item,
          userId,
          currency: item.currency ?? "ILS",
          principalAmount: item.amount,
        })),
      });
    }

    if (data.futureMoney.length > 0) {
      await tx.futureMoney.createMany({
        data: data.futureMoney.map((item) => ({
          ...item,
          userId,
          currency: item.currency ?? "ILS",
        })),
      });
    }

    if (data.incomes.length > 0) {
      await tx.income.createMany({
        data: data.incomes.map((income) => ({
          ...income,
          userId,
          currency: income.currency ?? "ILS",
        })),
      });
    }

    if (data.expenses.length > 0) {
      await tx.expense.createMany({
        data: data.expenses.map((expense) => ({
          ...expense,
          userId,
          currency: expense.currency ?? "ILS",
          totalPayments:
            expense.category === "debt" &&
            expense.recurrence === "recurring" &&
            (expense.remainingPayments ?? 0) > 0
              ? expense.remainingPayments
              : null,
        })),
      });
    }

    if (data.goals.length > 0) {
      await tx.goal.createMany({
        data: data.goals.map((goal) => ({
          ...goal,
          userId,
          currency: goal.currency ?? "ILS",
        })),
      });
    }

    const totalCapital =
      sumAmountsInIls(data.availableCash, exchangeRates) +
      sumAmountsInIls(data.investments, exchangeRates) +
      sumAmountsInIls(data.futureMoney, exchangeRates);

    if (totalCapital > 0) {
      const monthKey = currentMonthKey();
      await tx.capitalMonthlySnapshot.upsert({
        where: { userId_monthKey: { userId, monthKey } },
        create: { userId, monthKey, totalCapital },
        update: { totalCapital },
      });
    }

    return tx.user.update({
      where: { id: userId },
      data: { onboarded: true },
    });
  });

  return toPublicUser(user);
}
