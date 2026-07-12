import type { FastifyInstance } from "fastify";
import { idParamSchema } from "../../lib/schemas";
import {
  availableCashSchema,
  capitalInvestmentSchema,
  futureMoneySchema,
  updateCapitalInvestmentSchema,
  withdrawToCheckingSchema,
} from "./capital.schemas";
import {
  createAvailableCash,
  createCapitalInvestment,
  createFutureMoney,
  deleteAvailableCash,
  deleteCapitalInvestment,
  deleteFutureMoney,
  getCapitalData,
  receiveFutureMoney,
  updateAvailableCash,
  updateCapitalInvestment,
  updateFutureMoney,
  withdrawToChecking,
} from "./capital.service";

export async function capitalRoutes(app: FastifyInstance): Promise<void> {
  app.get("/", { preHandler: [app.authenticate] }, async (request) => {
    return getCapitalData(request.user.sub);
  });

  app.post("/available", { preHandler: [app.authenticate] }, async (request) => {
    const body = availableCashSchema.parse(request.body);
    const item = await createAvailableCash(request.user.sub, body);
    return { item };
  });

  app.patch(
    "/available/:id",
    { preHandler: [app.authenticate] },
    async (request) => {
      const { id } = idParamSchema.parse(request.params);
      const body = availableCashSchema.parse(request.body);
      const item = await updateAvailableCash(request.user.sub, id, body);
      return { item };
    },
  );

  app.delete(
    "/available/:id",
    { preHandler: [app.authenticate] },
    async (request) => {
      const { id } = idParamSchema.parse(request.params);
      await deleteAvailableCash(request.user.sub, id);
      return { ok: true };
    },
  );

  app.post(
    "/available/:id/withdraw-to-checking",
    { preHandler: [app.authenticate] },
    async (request) => {
      const { id } = idParamSchema.parse(request.params);
      const body = withdrawToCheckingSchema.parse(request.body);
      await withdrawToChecking(request.user.sub, id, body.amount);
      return { ok: true };
    },
  );

  app.post(
    "/investments",
    { preHandler: [app.authenticate] },
    async (request) => {
      const body = capitalInvestmentSchema.parse(request.body);
      const item = await createCapitalInvestment(request.user.sub, body);
      return { item };
    },
  );

  app.patch(
    "/investments/:id",
    { preHandler: [app.authenticate] },
    async (request) => {
      const { id } = idParamSchema.parse(request.params);
      const body = updateCapitalInvestmentSchema.parse(request.body);
      const item = await updateCapitalInvestment(request.user.sub, id, body);
      return { item };
    },
  );

  app.delete(
    "/investments/:id",
    { preHandler: [app.authenticate] },
    async (request) => {
      const { id } = idParamSchema.parse(request.params);
      await deleteCapitalInvestment(request.user.sub, id);
      return { ok: true };
    },
  );

  app.post("/future", { preHandler: [app.authenticate] }, async (request) => {
    const body = futureMoneySchema.parse(request.body);
    const item = await createFutureMoney(request.user.sub, body);
    return { item };
  });

  app.patch(
    "/future/:id",
    { preHandler: [app.authenticate] },
    async (request) => {
      const { id } = idParamSchema.parse(request.params);
      const body = futureMoneySchema.parse(request.body);
      const item = await updateFutureMoney(request.user.sub, id, body);
      return { item };
    },
  );

  app.delete(
    "/future/:id",
    { preHandler: [app.authenticate] },
    async (request) => {
      const { id } = idParamSchema.parse(request.params);
      await deleteFutureMoney(request.user.sub, id);
      return { ok: true };
    },
  );

  app.post(
    "/future/:id/receive",
    { preHandler: [app.authenticate] },
    async (request) => {
      const { id } = idParamSchema.parse(request.params);
      await receiveFutureMoney(request.user.sub, id);
      return { ok: true };
    },
  );
}
