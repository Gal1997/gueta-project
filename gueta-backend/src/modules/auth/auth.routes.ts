import type { FastifyInstance } from "fastify";
import { HttpError } from "../../lib/errors";
import { clearSession, issueSession } from "../../lib/session";
import {
  googleSchema,
  loginSchema,
  registerSchema,
} from "./auth.schemas";
import {
  completeOnboarding,
  getUserById,
  loginUser,
  loginWithGoogle,
  registerUser,
} from "./auth.service";

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post("/register", async (request, reply) => {
    const body = registerSchema.parse(request.body);
    const user = await registerUser(body);
    await issueSession(app, reply, user.id);
    return reply.code(201).send({ user });
  });

  app.post("/login", async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const user = await loginUser(body);
    await issueSession(app, reply, user.id);
    return reply.send({ user });
  });

  app.post("/google", async (request, reply) => {
    const body = googleSchema.parse(request.body);
    const user = await loginWithGoogle(body.accessToken);
    await issueSession(app, reply, user.id);
    return reply.send({ user });
  });

  app.post("/logout", async (_request, reply) => {
    clearSession(reply);
    return reply.send({ ok: true });
  });

  app.get("/me", { preHandler: [app.authenticate] }, async (request) => {
    const user = await getUserById(request.user.sub);
    if (!user) {
      throw new HttpError(401, "ההתחברות אינה תקפה עוד.");
    }
    return { user };
  });

  app.post(
    "/complete-onboarding",
    { preHandler: [app.authenticate] },
    async (request) => {
      const user = await completeOnboarding(request.user.sub);
      return { user };
    },
  );
}
