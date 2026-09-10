import type { PermissionDef } from "@/shared/lib/permission-def";
import { IDENTITY_PERMISSIONS } from "@/features/identity/permissions";
import { SAMPLE_PERMISSIONS } from "@/features/sample/permissions";
import { NEWS_PERMISSIONS } from "@/features/news/permissions";
import { STAFF_PERMISSIONS } from "@/features/staff/permissions";
import { CURRICULUM_PERMISSIONS } from "@/features/curriculum/permissions";
import { RESERVATION_PERMISSIONS } from "@/features/reservations/permissions";
import { DOCUMENT_PERMISSIONS } from "@/features/documents/permissions";

/** สิทธิ์ทั้งระบบ — feature ใหม่เพิ่มบรรทัดที่นี่ · seed เขียนลง permissions ทุกครั้ง */
export const ALL_PERMISSIONS: readonly PermissionDef[] = [
  ...IDENTITY_PERMISSIONS,
  ...SAMPLE_PERMISSIONS,
  ...NEWS_PERMISSIONS,
  ...STAFF_PERMISSIONS,
  ...CURRICULUM_PERMISSIONS,
  ...RESERVATION_PERMISSIONS,
  ...DOCUMENT_PERMISSIONS,
];

const codes = ALL_PERMISSIONS.map((p) => p.code);
if (new Set(codes).size !== codes.length) throw new Error("permission code ซ้ำใน ALL_PERMISSIONS");
