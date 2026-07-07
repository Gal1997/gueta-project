import type { User } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { HttpError } from "../../lib/errors";
import { fetchGoogleProfile } from "../../lib/google";
import { hashPassword, verifyPassword } from "../../lib/password";
import type { LoginInput, RegisterInput } from "./auth.schemas";

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  provider: "password" | "google";
  onboarded: boolean;
}

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    provider: user.provider,
    onboarded: user.onboarded,
  };
}

export async function registerUser(input: RegisterInput): Promise<PublicUser> {
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new HttpError(409, "An account with this email already exists.");
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
    throw new HttpError(401, "Invalid email or password.");
  }

  const valid = await verifyPassword(user.passwordHash, input.password);
  if (!valid) {
    throw new HttpError(401, "Invalid email or password.");
  }

  return toPublicUser(user);
}

export async function loginWithGoogle(accessToken: string): Promise<PublicUser> {
  const profile = await fetchGoogleProfile(accessToken);
  const email = profile.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Link the Google id if this account was created another way.
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
