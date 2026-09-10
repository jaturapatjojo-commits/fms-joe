import type { PermissionDef } from "@/shared/lib/permission-def";

export const DOCUMENT_P = {
  documentRead: "document:read",
  documentManage: "document:manage",
  documentApprove: "document:approve",
} as const;

export const DOCUMENT_PERMISSIONS: readonly PermissionDef[] = [
  {
    code: DOCUMENT_P.documentRead,
    module: "document",
    action: "read",
    description: "ดูรายการเอกสารสารบรรณและคำสั่งคณะ",
  },
  {
    code: DOCUMENT_P.documentManage,
    module: "document",
    action: "manage",
    description: "สร้าง ร่าง และยื่นขออนุมัติเอกสาร",
  },
  {
    code: DOCUMENT_P.documentApprove,
    module: "document",
    action: "approve",
    description: "พิจารณาลงนาม อนุมัติ หรือตีกลับเอกสาร",
  },
];
