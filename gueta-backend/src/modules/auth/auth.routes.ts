import type { FastifyInstance, FastifyReply } from "fastify";
import { isProduction } from "../../config/env";
import { HttpError } from "../../lib/errors";
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

const COOKIE_NAME = "token";
const SEVEN_DAYS_SECONDS = 60 * 60 * 24 * 7;

async function issueSession(
  app: FastifyInstance,
  reply: FastifyReply,
  userId: string,
): Promise<void> {
  const token = await reply.jwtSign({ sub: userId }, { expiresIn: "7d" });
  reply.setCookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: SEVEN_DAYS_SECONDS,
  });
}

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
    reply.clearCookie(COOKIE_NAME, { path: "/" });
    return reply.send({ ok: true });
  });

  app.get("/me", { preHandler: [app.authenticate] }, async (request) => {
    const user = await getUserById(request.user.sub);
    if (!user) {
      throw new HttpError(401, "Session is no longer valid.");
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
