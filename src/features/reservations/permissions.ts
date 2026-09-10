import type { PermissionDef } from "@/shared/lib/permission-def";

export const RESERVATION_P = {
  reservationRead: "reservation:read",
  reservationManage: "reservation:manage",
  reservationApprove: "reservation:approve",
} as const;

export const RESERVATION_PERMISSIONS: readonly PermissionDef[] = [
  { code: RESERVATION_P.reservationRead, module: "reservation", action: "read", description: "ดูรายการจองและปฏิทินการใช้ห้อง/ยานพาหนะ" },
  { code: RESERVATION_P.reservationManage, module: "reservation", action: "manage", description: "สร้าง แก้ไข และยกเลิกคำขอจอง" },
  { code: RESERVATION_P.reservationApprove, module: "reservation", action: "approve", description: "อนุมัติหรือปฏิเสธคำขอจองห้องและยานพาหนะ" },
];
