import { z } from "zod";

export const createDocumentSchema = z.object({
  documentNo: z.string().min(1, "validation.required"),
  title: z.string().min(1, "validation.required").max(255),
  category: z.enum(["MEMO", "CIRCULAR", "ORDER", "PETITION", "EXPENSE"]),
  urgency: z.enum(["NORMAL", "URGENT", "VERY_URGENT"]),
  content: z.string().optional(),
  fileUrl: z.string().url("validation.url").optional().or(z.literal("")),
  approverIds: z.array(z.string().uuid()).optional(),
});

export const updateDocumentSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "validation.required").max(255),
  category: z.enum(["MEMO", "CIRCULAR", "ORDER", "PETITION", "EXPENSE"]),
  urgency: z.enum(["NORMAL", "URGENT", "VERY_URGENT"]),
  content: z.string().optional(),
  fileUrl: z.string().url("validation.url").optional().or(z.literal("")),
});

export const processApprovalSchema = z.object({
  documentId: z.string().uuid(),
  status: z.enum(["APPROVED", "REJECTED"]),
  comment: z.string().optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type ProcessApprovalInput = z.infer<typeof processApprovalSchema>;
