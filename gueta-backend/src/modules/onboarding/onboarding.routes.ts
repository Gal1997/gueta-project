import type { FastifyInstance } from "fastify";
import { onboardingSchema } from "./onboarding.schemas";
import { saveOnboarding } from "./onboarding.service";

export async function onboardingRoutes(app: FastifyInstance): Promise<void> {
  app.post("/", { preHandler: [app.authenticate] }, async (request) => {
    const body = onboardingSchema.parse(request.body);
    const user = await saveOnboarding(request.user.sub, body);
    return { user };
  });
}
