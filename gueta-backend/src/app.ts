import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import Fastify, {
  type FastifyInstance,
  type FastifyReply,
  type FastifyRequest,
} from "fastify";
import { ZodError } from "zod";
import { env } from "./config/env";
import { HttpError } from "./lib/errors";
import { authRoutes } from "./modules/auth/auth.routes";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }
}

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  await app.register(cookie, { secret: env.COOKIE_SECRET });

  await app.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: { cookieName: "token", signed: false },
  });

  app.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch {
        reply.code(401).send({ message: "Unauthorized" });
      }
    },
  );

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        message: "Validation failed",
        errors: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    if (error instanceof HttpError) {
      return reply.code(error.statusCode).send({ message: error.message });
    }

    // Framework errors (invalid JSON, payload too large, etc.) carry a 4xx code.
    if (
      typeof error.statusCode === "number" &&
      error.statusCode >= 400 &&
      error.statusCode < 500
    ) {
      return reply.code(error.statusCode).send({ message: error.message });
    }

    request.log.error(error);
    return reply.code(500).send({ message: "Internal server error" });
  });

  app.get("/health", async () => ({ status: "ok" }));

  await app.register(authRoutes, { prefix: "/api/auth" });

  return app;
}
