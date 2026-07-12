import type { FastifyInstance } from "fastify";
import { idParamSchema } from "../../lib/schemas";
import {
  expenseSchema,
  goalSchema,
  incomeSchema,
} from "./finance.schemas";
import {
  createExpense,
  createGoal,
  createIncome,
  deleteExpense,
  deleteGoal,
  deleteIncome,
  getFinanceData,
  updateExpense,
  updateGoal,
  updateIncome,
} from "./finance.service";

export async function financeRoutes(app: FastifyInstance): Promise<void> {
  app.get("/", { preHandler: [app.authenticate] }, async (request) => {
    return getFinanceData(request.user.sub);
  });

  app.post("/incomes", { preHandler: [app.authenticate] }, async (request) => {
    const body = incomeSchema.parse(request.body);
    const income = await createIncome(request.user.sub, body);
    return { income };
  });

  app.patch(
    "/incomes/:id",
    { preHandler: [app.authenticate] },
    async (request) => {
      const { id } = idParamSchema.parse(request.params);
      const body = incomeSchema.parse(request.body);
      const income = await updateIncome(request.user.sub, id, body);
      return { income };
    },
  );

  app.delete(
    "/incomes/:id",
    { preHandler: [app.authenticate] },
    async (request) => {
      const { id } = idParamSchema.parse(request.params);
      await deleteIncome(request.user.sub, id);
      return { ok: true };
    },
  );

  app.post("/expenses", { preHandler: [app.authenticate] }, async (request) => {
    const body = expenseSchema.parse(request.body);
    const expense = await createExpense(request.user.sub, body);
    return { expense };
  });

  app.patch(
    "/expenses/:id",
    { preHandler: [app.authenticate] },
    async (request) => {
      const { id } = idParamSchema.parse(request.params);
      const body = expenseSchema.parse(request.body);
      const expense = await updateExpense(request.user.sub, id, body);
      return { expense };
    },
  );

  app.delete(
    "/expenses/:id",
    { preHandler: [app.authenticate] },
    async (request) => {
      const { id } = idParamSchema.parse(request.params);
      await deleteExpense(request.user.sub, id);
      return { ok: true };
    },
  );

  app.post("/goals", { preHandler: [app.authenticate] }, async (request) => {
    const body = goalSchema.parse(request.body);
    const goal = await createGoal(request.user.sub, body);
    return { goal };
  });

  app.patch("/goals/:id", { preHandler: [app.authenticate] }, async (request) => {
    const { id } = idParamSchema.parse(request.params);
    const body = goalSchema.parse(request.body);
    const goal = await updateGoal(request.user.sub, id, body);
    return { goal };
  });

  app.delete(
    "/goals/:id",
    { preHandler: [app.authenticate] },
    async (request) => {
      const { id } = idParamSchema.parse(request.params);
      await deleteGoal(request.user.sub, id);
      return { ok: true };
    },
  );
}
