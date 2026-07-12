import { prisma } from "../../db/prisma";
import { HttpError } from "../../lib/errors";
import { fetchGoogleProfile } from "../../lib/google";
import { toPublicUser } from "../../lib/mappers";
import { hashPassword, verifyPassword } from "../../lib/password";
import type { LoginInput, RegisterInput } from "./auth.schemas";
import type { PublicUser } from "./auth.types";

export async function registerUser(input: RegisterInput): Promise<PublicUser> {
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new HttpError(409, "כבר קיים חשבון עם אימייל זה.");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: { email, name: input.name, passwordHash, provider: "password" },
  });

  return toPublicUser(user);
}

export async function loginUser(input: LoginInput): Promise<PublicUser> {
  const email = input.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.passwordHash) {
    throw new HttpError(401, "אימייל או סיסמה שגויים.");
  }

  const valid = await verifyPassword(user.passwordHash, input.password);
  if (!valid) {
    throw new HttpError(401, "אימייל או סיסמה שגויים.");
  }

  return toPublicUser(user);
}

export async function loginWithGoogle(accessToken: string): Promise<PublicUser> {
  const profile = await fetchGoogleProfile(accessToken);
  const email = profile.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (!existing.googleId) {
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: { googleId: profile.googleId },
      });
      return toPublicUser(updated);
    }
    return toPublicUser(existing);
  }

  const user = await prisma.user.create({
    data: {
      email,
      name: profile.name,
      provider: "google",
      googleId: profile.googleId,
    },
  });

  return toPublicUser(user);
}

export async function completeOnboarding(userId: string): Promise<PublicUser> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { onboarded: true },
  });
  return toPublicUser(user);
}

export async function getUserById(userId: string): Promise<PublicUser | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user ? toPublicUser(user) : null;
}

export type { PublicUser } from "./auth.types";
