import { cache } from "react";
import { prisma, type Db } from "@/shared/lib/infra/prisma";
import { DEFAULT_PALETTE, isPalette, type PaletteId } from "@/shared/lib/palette";
import { errors } from "@/shared/lib/errors";
import type { Prisma } from "@/generated/prisma";
import { writeAudit } from "../audit";
import type { UpdateSettingsInput } from "../validations/settings";

export interface TenantSmtpSettings {
  enabled: boolean;
  user: string;
  pass: string;
  from: string;
  [key: string]: unknown;
}

export interface TenantContactSettings {
  address: string;
  phone: string;
  email: string;
  workingHours: string;
  mapUrl: string;
  facebookUrl: string;
  lineId: string;
  [key: string]: unknown;
}

export interface TenantGeminiSettings {
  apiKey: string;
  model: string;
  [key: string]: unknown;
}

export interface TenantSettings {
  code: string;
  nameTh: string;
  nameEn: string;
  logoUrl: string | null;
  palette: PaletteId;
  smtp?: TenantSmtpSettings;
  contact?: TenantContactSettings;
  gemini?: TenantGeminiSettings;
}


async function readTenantSettings(tenantId: string, db: Db): Promise<TenantSettings> {
  const t = await db.tenant.findUnique({ where: { id: tenantId } });
  if (!t) throw errors.not_found();
  const settings = (t.settings ?? {}) as {
    palette?: unknown;
    smtp?: TenantSmtpSettings;
    contact?: TenantContactSettings;
    gemini?: TenantGeminiSettings;
  };
  const p = settings.palette;
  const smtp = settings.smtp ?? {
    enabled: false,
    user: "",
    pass: "",
    from: "",
  };
  const contact = settings.contact ?? {
    address: "",
    phone: "",
    email: "",
    workingHours: "",
    mapUrl: "",
    facebookUrl: "",
    lineId: "",
  };
  const gemini = settings.gemini ?? {
    apiKey: "",
    model: "gemini-3.6-flash",
  };
  return {
    code: t.code,
    nameTh: t.nameTh,
    nameEn: t.nameEn,
    logoUrl: t.logoUrl,
    palette: isPalette(p) ? p : DEFAULT_PALETTE,
    smtp,
    contact,
    gemini,
  };
}


export async function getTenantSettings(tenantId: string): Promise<TenantSettings> {
  return readTenantSettings(tenantId, prisma);
}

/** เก็บคีย์อื่น ๆ ใน settings JSON ไว้ทั้งหมด — merge palette, smtp และ contact ที่เปลี่ยน ไม่ทับทั้งก้อน */
export async function updateTenantSettings(input: { tenantId: string; actorId: string } & UpdateSettingsInput): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const before = await readTenantSettings(input.tenantId, tx);
    const t = await tx.tenant.findUniqueOrThrow({ where: { id: input.tenantId }, select: { settings: true } });
    const currentSettings = (t.settings ?? {}) as Record<string, unknown>;

    let newSmtp = before.smtp;
    if (input.smtp) {
      newSmtp = {
        enabled: input.smtp.enabled,
        user: input.smtp.user,
        pass: input.smtp.pass ? input.smtp.pass : (before.smtp?.pass ?? ""),
        from: input.smtp.from,
      };
    }

    let newContact = before.contact;
    if (input.contact) {
      newContact = {
        address: input.contact.address ?? "",
        phone: input.contact.phone ?? "",
        email: input.contact.email ?? "",
        workingHours: input.contact.workingHours ?? "",
        mapUrl: input.contact.mapUrl ?? "",
        facebookUrl: input.contact.facebookUrl ?? "",
        lineId: input.contact.lineId ?? "",
      };
    }

    let newGemini = before.gemini;
    if (input.gemini) {
      newGemini = {
        apiKey: input.gemini.apiKey ? input.gemini.apiKey : (before.gemini?.apiKey ?? ""),
        model: input.gemini.model || before.gemini?.model || "gemini-3.6-flash",
      };
    }

    const updatedSettings = {
      ...currentSettings,
      palette: input.palette,
      ...(newSmtp ? { smtp: newSmtp } : {}),
      ...(newContact ? { contact: newContact } : {}),
      ...(newGemini ? { gemini: newGemini } : {}),
    };

    await tx.tenant.update({
      where: { id: input.tenantId },
      data: {
        nameTh: input.nameTh,
        nameEn: input.nameEn,
        logoUrl: input.logoUrl || null,
        settings: updatedSettings as Prisma.InputJsonObject,
      },
    });
    await writeAudit({ tenantId: input.tenantId, actorId: input.actorId, action: "tenant.settings_update", entity: "tenant", entityId: input.tenantId, before, after: input }, tx);
  });
}

export async function getTenantGemini(tenantId: string): Promise<TenantGeminiSettings | null> {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
  const g = (t?.settings as { gemini?: TenantGeminiSettings } | null)?.gemini;
  return g && g.apiKey ? g : null;
}

export async function getTenantSmtp(tenantId: string): Promise<TenantSmtpSettings | null> {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
  const s = (t?.settings as { smtp?: TenantSmtpSettings } | null)?.smtp;
  return s && s.enabled && s.user && s.pass ? s : null;
}

export async function getTenantPalette(tenantId: string): Promise<PaletteId> {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
  const p = (t?.settings as { palette?: unknown } | null)?.palette;
  return isPalette(p) ? p : DEFAULT_PALETTE;
}


/**
 * tenant ของ session ถ้ามี — import แบบ dynamic เพราะ `../auth` ดึง next-auth ทั้งก้อนเข้ามา และ
 * โมดูลนี้ถูก import จาก root layout ที่รันทุก request · แยก try ของตัวเองไว้ต่างหากโดยเจตนา: เดิมมันอยู่
 * ใน try เดียวกับการอ่านฐานข้อมูล ทำให้ "โหลด auth ไม่ได้" กับ "ฐานข้อมูลล้ม" กลืนหายไปเป็นค่าเดียวกัน
 * และเส้นทางอ่าน tenant ทั้งเส้นทดสอบไม่ได้เลย (ในสภาพแวดล้อมเทสต์ next-auth resolve ไม่ผ่าน)
 */
async function sessionTenantId(): Promise<string | null> {
  try {
    const { auth } = await import("../auth");
    return (await auth())?.tenantId || null;
  } catch {
    return null;
  }
}

/** ใช้โดย root layout ทุก request — tenant จาก session ถ้ามี ไม่งั้น tenant แรก (หน้า login ยังไม่มี session) · ไม่ throw */
export const resolvePalette = cache(async (): Promise<PaletteId> => {
  try {
    const tenantId = (await sessionTenantId()) || (await prisma.tenant.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } }))?.id;
    return tenantId ? await getTenantPalette(tenantId) : DEFAULT_PALETTE;
  } catch {
    return DEFAULT_PALETTE;
  }
});
