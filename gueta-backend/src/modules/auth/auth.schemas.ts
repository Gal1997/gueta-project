import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "השם חייב להכיל לפחות 2 תווים"),
  email: z.string().trim().email("נדרש אימייל תקין"),
  password: z.string().min(6, "הסיסמה חייבת להכיל לפחות 6 תווים"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("נדרש אימייל תקין"),
  password: z.string().min(1, "נדרשת סיסמה"),
});

export const googleSchema = z.object({
  accessToken: z.string().min(1, "חסר אסימון גישה של Google"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GoogleInput = z.infer<typeof googleSchema>;
