import type { User } from "@prisma/client";
import type { PublicUser } from "../modules/auth/auth.types";

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    provider: user.provider,
    onboarded: user.onboarded,
  };
}
