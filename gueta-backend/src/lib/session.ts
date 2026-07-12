import type { FastifyInstance, FastifyReply } from "fastify";
import { isProduction } from "../config/env";

export const SESSION_COOKIE_NAME = "token";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export async function issueSession(
  app: FastifyInstance,
  reply: FastifyReply,
  userId: string,
): Promise<void> {
  const token = await reply.jwtSign({ sub: userId }, { expiresIn: "7d" });
  reply.setCookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSession(reply: FastifyReply): void {
  reply.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
}
