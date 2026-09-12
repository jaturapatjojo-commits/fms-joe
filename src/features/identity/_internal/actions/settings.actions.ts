"use server";
import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { P } from "../../permissions";
import { requirePermission } from "../rbac";
import { requireSession } from "../session";
import { errors, isAppError } from "@/shared/lib/errors";
import nodemailer from "nodemailer";
import { updateSettingsSchema, testSmtpSchema, testGeminiSchema } from "../validations/settings";
import { getTenantSettings, updateTenantSettings, type TenantSettings } from "../services/tenant.service";
import { testGeminiConnection } from "@/shared/lib/ai/gemini";


export async function getSettingsAction(): Promise<ActionResult<TenantSettings>> {
  return runAction(async () => getTenantSettings((await requirePermission(P.settingsManage)).tenantId));
}
export async function getTenantBrandingAction(): Promise<ActionResult<{ nameTh: string; nameEn: string; logoUrl: string | null }>> {
  return runAction(async () => {
    const s = await getTenantSettings((await requireSession()).tenantId);
    return { nameTh: s.nameTh, nameEn: s.nameEn, logoUrl: s.logoUrl };
  });
}
export async function updateSettingsAction(input: unknown): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(P.settingsManage);
    await updateTenantSettings({ tenantId: ctx.tenantId, actorId: ctx.userId, ...updateSettingsSchema.parse(input, { error: zodErrorMap(await getLocale()) }) });
    revalidatePath("/", "layout"); // data-palette บน <html> อ่านใหม่
  });
}

export async function testSmtpConnectionAction(input: unknown): Promise<ActionResult<{ success: boolean }>> {
  return runAction(async () => {
    await requirePermission(P.settingsManage);
    const parsed = testSmtpSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const cleanPass = parsed.pass.replace(/\s+/g, "");

    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: parsed.user,
        pass: cleanPass,
      },
    });

    try {
      await transport.verify();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw errors.validation(`เชื่อมต่อ Gmail ล้มเหลว (${msg})`);
    }

    try {
      const fromAddress = parsed.from.trim() || `FMS System <${parsed.user}>`;
      await transport.sendMail({
        from: fromAddress,
        to: parsed.testTo,
        subject: "ทดสอบการเชื่อมต่อ Gmail SMTP - สำเร็จ",
        text: `สวัสดีครับ,\n\nนี่คืออีเมลทดสอบจากระบบ FMS เพื่อยืนยันว่าการตั้งค่า Gmail SMTP (${parsed.user}) สามารถส่งออกได้อย่างถูกต้องและปลอดภัย\n\nเวลาทดสอบ: ${new Date().toLocaleString("th-TH")}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333;">
            <h2 style="color: #10b981;">✅ ทดสอบการเชื่อมต่อ Gmail SMTP สำเร็จ</h2>
            <p>นี่คืออีเมลทดสอบจากระบบ <strong>FMS Platform</strong> เพื่อยืนยันว่าการตั้งค่าบัญชี <strong>${parsed.user}</strong> ทำงานได้อย่างสมบูรณ์</p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
            <p style="color: #6b7280; font-size: 13px;">เวลาที่ส่ง: ${new Date().toLocaleString("th-TH")}</p>
          </div>
        `,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw errors.validation(`ส่งอีเมลไม่สำเร็จ (${msg})`);
    }

    return { success: true };
  });
}

export async function testGeminiConnectionAction(
  input: unknown,
): Promise<ActionResult<{ success: boolean; latencyMs: number; model: string; message: string }>> {
  return runAction(async () => {
    await requirePermission(P.settingsManage);
    const parsed = testGeminiSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    try {
      const result = await testGeminiConnection(parsed.apiKey, parsed.model);
      return {
        success: true,
        latencyMs: result.latencyMs,
        model: result.model,
        message: result.message,
      };
    } catch (err: unknown) {
      if (isAppError(err)) throw err;
      const msg = err instanceof Error ? err.message : String(err);
      throw errors.validation(msg);
    }
  });
}

