import { z } from "zod";
import { PALETTE_IDS } from "@/shared/lib/palette";

export const smtpSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  user: z.string().trim().default(""),
  pass: z.string().trim().default(""),
  from: z.string().trim().default(""),
});

export const testSmtpSchema = z.object({
  user: z.string().trim().min(1),
  pass: z.string().trim().min(1),
  from: z.string().trim().optional().default(""),
  testTo: z.string().trim().email(),
});

export const updateSettingsSchema = z.object({
  nameTh: z.string().trim().min(1).max(255),
  nameEn: z.string().trim().min(1).max(255),
  logoUrl: z
    .string()
    .trim()
    .max(500)
    .refine((val) => val === "" || val.startsWith("/") || /^https?:\/\//.test(val), {
      message: "invalid_url",
    })
    .default(""),
  palette: z.enum(PALETTE_IDS),
  smtp: smtpSettingsSchema.optional(),
});
export const updateProfileSchema = z.object({ name: z.string().trim().min(1).max(255), locale: z.enum(["th", "en"]) });
export type SmtpSettingsInput = z.infer<typeof smtpSettingsSchema>;
export type TestSmtpInput = z.infer<typeof testSmtpSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
