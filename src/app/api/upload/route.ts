import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { requirePermission, P } from "@/features/identity/server";

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
]);

const EXTENSION_MAP: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
};

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(req: NextRequest) {
  try {
    // ต้องมีสิทธิ์ settings:manage ถึงจะอัปโหลดโลโก้ได้
    await requirePermission(P.settingsManage);

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "file_required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { ok: false, error: "unsupported_media_type" },
        { status: 415 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { ok: false, error: "file_too_large" },
        { status: 413 }
      );
    }

    const ext = EXTENSION_MAP[file.type] || path.extname(file.name) || ".png";
    const filename = `logo-${randomUUID()}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "logos");
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/logos/${filename}`;

    return NextResponse.json({
      ok: true,
      url: publicUrl,
    });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { ok: false, error: errMessage },
      { status: 500 }
    );
  }
}
