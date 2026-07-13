import { z } from "zod";

const hexColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a hex value like #4f8cff");

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1, "Category name is required").max(40),
  color: hexColorSchema.optional(),
});

export const categoryUpdateSchema = categoryInputSchema.partial().refine(
  (data) => data.name !== undefined || data.color !== undefined,
  { message: "At least one field is required" },
);

export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type CategoryUpdate = z.infer<typeof categoryUpdateSchema>;

export const categoryIdParamSchema = z.object({
  id: z.string().min(1, "מזהה לא תקין"),
});
