import type { Expense, Goal, Income, Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { HttpError } from "../../lib/errors";
import { convertToIls, getExchangeRates } from "../../lib/exchangeRates";
import { fromMinorUnits } from "../../lib/money";
import { mapExpense, mapGoal, mapIncome } from "../../lib/moneyMappers";
import { adjustCheckingBalance } from "../capital/capital.utils";
import {
  assertCategoryBelongsToUser,
  listCategories,
} from "../categories/categories.service";
import { listCategoryAllocations } from "./allocations.service";
import type { ExpenseInput, GoalInput, IncomeInput } from "./finance.schemas";
import { INFINITE_REMAINING_PAYMENTS } from "./finance.constants";
import type { FinanceData } from "./finance.types";
import {
  computeMonthlySavings,
  currentMonthKey,
  debtMonthlyChargeFromTotal,
  nextMonthKey,
  toIlsAmount,
} from "./finance.utils";

type DbClient = Prisma.TransactionClient | typeof prisma;

async function applyMonthlyRollover(
  userId: string,
  monthlySavings: number,
): Promise<{ accumulatedSavings: number; monthsElapsed: number }> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const currentMonth = currentMonthKey();

  if (!user.savingsRolledUpThrough) {
    await prisma.user.update({
      where: { id: userId },
      data: { savingsRolledUpThrough: currentMonth },
    });
    return { accumulatedSavings: user.accumulatedSavings, monthsElapsed: 0 };
  }

  if (user.savingsRolledUpThrough >= currentMonth) {
    return { accumulatedSavings: user.accumulatedSavings, monthsElapsed: 0 };
  }

  let rolledThrough = user.savingsRolledUpThrough;
  let accumulated = user.accumulatedSavings;
  let monthsElapsed = 0;

  while (rolledThrough < currentMonth) {
    accumulated += monthlySavings;
    monthsElapsed += 1;
    rolledThrough = nextMonthKey(rolledThrough);
  }

  await prisma.expense.updateMany({
    where: {
      userId,
      recurrence: "recurring",
      remainingPayments: { gt: 0 },
    },
    data: { remainingPayments: { decrement: monthsElapsed } },
  });
  await prisma.expense.updateMany({
    where: {
      userId,
      remainingPayments: { lt: 0, not: INFINITE_REMAINING_PAYMENTS },
    },
    data: { remainingPayments: 0 },
  });

  if (monthsElapsed > 0) {
    const debtExpenses = await prisma.expense.findMany({
      where: {
        userId,
        kind: "debt",
        recurrence: "recurring",
        totalPayments: { gt: 0 },
      },
    });

    await Promise.all(
      debtExpenses.map((expense) =>
        prisma.expense.update({
          where: { id: expense.id },
          data: {
            monthlyCharge: debtMonthlyChargeFromTotal(
              expense.amount,
              expense.totalPayments as number,
            ),
          },
        }),
      ),
    );
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      accumulatedSavings: accumulated,
      savingsRolledUpThrough: currentMonth,
    },
  });

  return { accumulatedSavings: accumulated, monthsElapsed };
}

export async function getFinanceData(userId: string): Promise<FinanceData> {
  const exchangeRates = await getExchangeRates();
  const [incomes, goals, categories, allocations] = await Promise.all([
    prisma.income.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    }),
    listCategories(userId),
    listCategoryAllocations(userId),
  ]);
  let expenses = await prisma.expense.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { createdAt: "asc" },
  });

  const monthlySavingsBefore = computeMonthlySavings(
    incomes,
    expenses,
    goals,
    exchangeRates,
  );
  const { accumulatedSavings, monthsElapsed } = await applyMonthlyRollover(
    userId,
    monthlySavingsBefore,
  );

  if (monthsElapsed > 0) {
    expenses = await prisma.expense.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: "asc" },
    });
  }

  const monthlySavings =
    monthsElapsed > 0
      ? computeMonthlySavings(incomes, expenses, goals, exchangeRates)
      : monthlySavingsBefore;

  return {
    categories,
    allocations,
    incomes: incomes.map(mapIncome),
    expenses: expenses.map(mapExpense),
    goals: goals.map(mapGoal),
    monthlySavings: fromMinorUnits(monthlySavings),
    accumulatedSavings: fromMinorUnits(accumulatedSavings),
    exchangeRates,
  };
}

async function assertIncomeOwner(
  userId: string,
  id: string,
  tx: DbClient = prisma,
): Promise<Income> {
  const income = await tx.income.findUnique({ where: { id } });
  if (!income || income.userId !== userId) {
    throw new HttpError(404, "ההכנסה לא נמצאה.");
  }
  return income;
}

async function assertExpenseOwner(
  userId: string,
  id: string,
  tx: DbClient = prisma,
): Promise<Expense> {
  const expense = await tx.expense.findUnique({ where: { id } });
  if (!expense || expense.userId !== userId) {
    throw new HttpError(404, "ההוצאה לא נמצאה.");
  }
  return expense;
}

async function syncCheckingForIncomeChange(
  tx: Prisma.TransactionClient,
  userId: string,
  previous: Income | null,
  next: IncomeInput | null,
): Promise<void> {
  const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.onboarded) return;

  const rates = await getExchangeRates();

  if (previous && next) {
    const delta =
      toIlsAmount(
        { amount: next.amount, currency: next.currency ?? "ILS" },
        rates,
      ) -
      toIlsAmount(
        { amount: previous.amount, currency: previous.currency },
        rates,
      );
    await adjustCheckingBalance(tx, userId, delta);
    return;
  }

  if (previous) {
    await adjustCheckingBalance(
      tx,
      userId,
      -toIlsAmount(
        { amount: previous.amount, currency: previous.currency },
        rates,
      ),
    );
  }

  if (next) {
    await adjustCheckingBalance(
      tx,
      userId,
      toIlsAmount(
        { amount: next.amount, currency: next.currency ?? "ILS" },
        rates,
      ),
    );
  }
}

async function syncCheckingForExpenseChange(
  tx: Prisma.TransactionClient,
  userId: string,
  previous: Expense | null,
  next: ExpenseInput | null,
): Promise<void> {
  const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.onboarded) return;

  const rates = await getExchangeRates();

  if (previous && next) {
    const delta =
      toIlsAmount(
        { amount: previous.amount, currency: previous.currency },
        rates,
      ) -
      toIlsAmount(
        { amount: next.amount, currency: next.currency ?? "ILS" },
        rates,
      );
    await adjustCheckingBalance(tx, userId, delta);
    return;
  }

  if (previous) {
    await adjustCheckingBalance(
      tx,
      userId,
      toIlsAmount(
        { amount: previous.amount, currency: previous.currency },
        rates,
      ),
    );
  }

  if (next) {
    await adjustCheckingBalance(
      tx,
      userId,
      -toIlsAmount(
        { amount: next.amount, currency: next.currency ?? "ILS" },
        rates,
      ),
    );
  }
}

async function assertGoalOwner(userId: string, id: string): Promise<Goal> {
  const goal = await prisma.goal.findUnique({ where: { id } });
  if (!goal || goal.userId !== userId) {
    throw new HttpError(404, "המטרה לא נמצאה.");
  }
  return goal;
}

export async function createIncome(
  userId: string,
  data: IncomeInput,
) {
  return prisma.$transaction(async (tx) => {
    const income = await tx.income.create({
      data: { ...data, userId, currency: data.currency ?? "ILS" },
    });
    await syncCheckingForIncomeChange(tx, userId, null, data);
    return mapIncome(income);
  });
}

export async function updateIncome(
  userId: string,
  id: string,
  data: IncomeInput,
) {
  return prisma.$transaction(async (tx) => {
    const existing = await assertIncomeOwner(userId, id, tx);
    const income = await tx.income.update({
      where: { id },
      data: { ...data, currency: data.currency ?? "ILS" },
    });
    await syncCheckingForIncomeChange(tx, userId, existing, data);
    return mapIncome(income);
  });
}

export async function deleteIncome(userId: string, id: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const existing = await assertIncomeOwner(userId, id, tx);
    await syncCheckingForIncomeChange(tx, userId, existing, null);
    await tx.income.delete({ where: { id } });
  });
}

export async function createExpense(
  userId: string,
  data: ExpenseInput,
) {
  return prisma.$transaction(async (tx) => {
    await assertCategoryBelongsToUser(userId, data.categoryId);

    const totalPayments =
      data.kind === "debt" &&
      data.recurrence === "recurring" &&
      data.remainingPayments > 0
        ? data.remainingPayments
        : null;

    const expense = await tx.expense.create({
      data: {
        ...data,
        userId,
        currency: data.currency ?? "ILS",
        totalPayments,
      },
      include: { category: true },
    });
    await syncCheckingForExpenseChange(tx, userId, null, data);
    return mapExpense(expense);
  });
}

export async function updateExpense(
  userId: string,
  id: string,
  data: ExpenseInput,
) {
  return prisma.$transaction(async (tx) => {
    const existing = await assertExpenseOwner(userId, id, tx);
    await assertCategoryBelongsToUser(userId, data.categoryId);

    const expense = await tx.expense.update({
      where: { id },
      data: {
        ...data,
        currency: data.currency ?? "ILS",
        totalPayments:
          existing.kind === "debt" ? existing.totalPayments : null,
      },
      include: { category: true },
    });
    await syncCheckingForExpenseChange(tx, userId, existing, data);
    return mapExpense(expense);
  });
}

export async function deleteExpense(userId: string, id: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const existing = await assertExpenseOwner(userId, id, tx);
    await syncCheckingForExpenseChange(tx, userId, existing, null);
    await tx.expense.delete({ where: { id } });
  });
}

export async function createGoal(userId: string, data: GoalInput) {
  const goal = await prisma.goal.create({
    data: { ...data, userId, currency: data.currency ?? "ILS" },
  });
  return mapGoal(goal);
}

export async function updateGoal(userId: string, id: string, data: GoalInput) {
  await assertGoalOwner(userId, id);
  const goal = await prisma.goal.update({
    where: { id },
    data: { ...data, currency: data.currency ?? "ILS" },
  });
  return mapGoal(goal);
}

export async function deleteGoal(userId: string, id: string): Promise<void> {
  await assertGoalOwner(userId, id);
  await prisma.goal.delete({ where: { id } });
}

export type { FinanceData } from "./finance.types";
