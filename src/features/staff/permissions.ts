import type { PermissionDef } from "@/shared/lib/permission-def";

export const STAFF_P = {
  staffRead: "staff:read",
  staffManage: "staff:manage",
} as const;

export const STAFF_PERMISSIONS: readonly PermissionDef[] = [
  { code: STAFF_P.staffRead, module: "staff", action: "read", description: "ดูรายชื่อและข้อมูลบุคลากรในระบบหลังบ้าน" },
  { code: STAFF_P.staffManage, module: "staff", action: "manage", description: "เพิ่ม แก้ไข ลบ บุคลากรและภาควิชา" },
];
