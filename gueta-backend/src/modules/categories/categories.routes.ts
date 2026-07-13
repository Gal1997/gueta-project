import type { FastifyInstance } from "fastify";
import {
  categoryIdParamSchema,
  categoryInputSchema,
  categoryUpdateSchema,
} from "./categories.schemas";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "./categories.service";

export async function categoryRoutes(app: FastifyInstance): Promise<void> {
  app.get("/", { preHandler: [app.authenticate] }, async (request) => {
    const categories = await listCategories(request.user.sub);
    return { categories };
  });

  app.post("/", { preHandler: [app.authenticate] }, async (request) => {
    const body = categoryInputSchema.parse(request.body);
    const category = await createCategory(request.user.sub, body);
    return { category };
  });

  app.patch(
    "/:id",
    { preHandler: [app.authenticate] },
    async (request) => {
      const { id } = categoryIdParamSchema.parse(request.params);
      const body = categoryUpdateSchema.parse(request.body);
      const category = await updateCategory(request.user.sub, id, body);
      return { category };
    },
  );

  app.delete(
    "/:id",
    { preHandler: [app.authenticate] },
    async (request) => {
      const { id } = categoryIdParamSchema.parse(request.params);
      await deleteCategory(request.user.sub, id);
      return { ok: true };
    },
  );
}
