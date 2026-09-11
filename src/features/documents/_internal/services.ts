import { prisma } from "@/shared/lib/infra/prisma";
import type {
  CreateDocumentInput,
  ProcessApprovalInput,
} from "./validations";

export interface ApprovalStepDto {
  id: string;
  approverId: string;
  approverName?: string;
  stepOrder: number;
  status: string;
  comment: string | null;
  actionAt: string | null;
}

export interface DocumentDto {
  id: string;
  tenantId: string;
  userId: string;
  userName?: string;
  documentNo: string;
  title: string;
  category: string;
  content: string | null;
  fileUrl: string | null;
  status: string;
  urgency: string;
  createdAt: string;
  updatedAt: string;
  approvals: ApprovalStepDto[];
}

/** รายการเอกสารสำหรับ Admin / เจ้าหน้าที่ */
export async function listDocuments(
  tenantId: string,
  options?: { category?: string; status?: string; userId?: string }
): Promise<DocumentDto[]> {
  const where: {
    tenantId: string;
    category?: string;
    status?: string;
    userId?: string;
  } = { tenantId };

  if (options?.category) where.category = options.category;
  if (options?.status) where.status = options.status;
  if (options?.userId) where.userId = options.userId;

  const docs = await prisma.document.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      approvals: {
        orderBy: { stepOrder: "asc" },
      },
    },
  });

  return docs.map((d) => ({
    id: d.id,
    tenantId: d.tenantId,
    userId: d.userId,
    documentNo: d.documentNo,
    title: d.title,
    category: d.category,
    content: d.content,
    fileUrl: d.fileUrl,
    status: d.status,
    urgency: d.urgency,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
    approvals: d.approvals.map((a) => ({
      id: a.id,
      approverId: a.approverId,
      stepOrder: a.stepOrder,
      status: a.status,
      comment: a.comment,
      actionAt: a.actionAt ? a.actionAt.toISOString() : null,
    })),
  }));
}

/** ดึงเอกสารเดี่ยว */
export async function getDocumentById(
  tenantId: string,
  id: string
): Promise<DocumentDto | null> {
  const doc = await prisma.document.findFirst({
    where: { id, tenantId },
    include: {
      approvals: {
        orderBy: { stepOrder: "asc" },
      },
    },
  });

  if (!doc) return null;

  return {
    id: doc.id,
    tenantId: doc.tenantId,
    userId: doc.userId,
    documentNo: doc.documentNo,
    title: doc.title,
    category: doc.category,
    content: doc.content,
    fileUrl: doc.fileUrl,
    status: doc.status,
    urgency: doc.urgency,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    approvals: doc.approvals.map((a) => ({
      id: a.id,
      approverId: a.approverId,
      stepOrder: a.stepOrder,
      status: a.status,
      comment: a.comment,
      actionAt: a.actionAt ? a.actionAt.toISOString() : null,
    })),
  };
}

/** สร้างร่างเอกสารใหม่ */
export async function createDocument(
  tenantId: string,
  userId: string,
  input: CreateDocumentInput
): Promise<DocumentDto> {
  const created = await prisma.document.create({
    data: {
      tenantId,
      userId,
      documentNo: input.documentNo,
      title: input.title,
      category: input.category,
      urgency: input.urgency,
      content: input.content || null,
      fileUrl: input.fileUrl || null,
      status: "DRAFT",
    },
  });

  // ถ้ามีการระบุผู้อนุมัติ
  if (input.approverIds && input.approverIds.length > 0) {
    await prisma.documentApproval.createMany({
      data: input.approverIds.map((approverId, idx) => ({
        tenantId,
        documentId: created.id,
        approverId,
        stepOrder: idx + 1,
        status: "PENDING",
      })),
    });
  }

  return (await getDocumentById(tenantId, created.id))!;
}

/** ยื่นเอกสารเข้าสู่กระบวนการพิจารณา (Submit for Review) */
export async function submitDocumentForApproval(
  tenantId: string,
  documentId: string
): Promise<DocumentDto> {
  const doc = await prisma.document.findFirstOrThrow({
    where: { id: documentId, tenantId },
    include: { approvals: true },
  });

  if (doc.approvals.length === 0) {
    throw new Error("ไม่สามารถยื่นเอกสารได้เนื่องจากยังไม่ได้ระบุสายการอนุมัติ");
  }

  await prisma.document.update({
    where: { id: documentId },
    data: { status: "IN_REVIEW" },
  });

  return (await getDocumentById(tenantId, documentId))!;
}

/** บันทึกผลการพิจารณา (อนุมัติ / ตีกลับ) */
export async function processApproval(
  tenantId: string,
  approverId: string,
  input: ProcessApprovalInput
): Promise<DocumentDto> {
  const doc = await prisma.document.findFirstOrThrow({
    where: { id: input.documentId, tenantId },
    include: {
      approvals: { orderBy: { stepOrder: "asc" } },
    },
  });

  // หาขั้นตอนของผู้อนุมัติคนนี้ที่ยังรอการพิจารณา
  const pendingStep = doc.approvals.find(
    (a) => a.approverId === approverId && a.status === "PENDING"
  );

  if (!pendingStep) {
    throw new Error("ไม่พบรายการรออนุมัติของคุณสำหรับเอกสารฉบับนี้");
  }

  // อัปเดตสถานะของขั้นตอนนี้
  await prisma.documentApproval.update({
    where: { id: pendingStep.id },
    data: {
      status: input.status,
      comment: input.comment || null,
      actionAt: new Date(),
    },
  });

  // ถ้าปฏิเสธ / ตีกลับ -> เอกสารเปลี่ยนสถานะเป็น REJECTED ทันที
  if (input.status === "REJECTED") {
    await prisma.document.update({
      where: { id: input.documentId },
      data: { status: "REJECTED" },
    });
  } else {
    // ถ้าอนุมัติ -> เช็คว่ายังมีขั้นตอนถัดไปหรือไม่
    const remainingPending = doc.approvals.filter(
      (a) => a.id !== pendingStep.id && a.status === "PENDING"
    );

    if (remainingPending.length === 0) {
      // ทุกคนอนุมัติครบแล้ว -> เอกสารเสร็จสมบูรณ์
      await prisma.document.update({
        where: { id: input.documentId },
        data: { status: "APPROVED" },
      });
    }
  }

  return (await getDocumentById(tenantId, input.documentId))!;
}

/** ดึงเอกสารประกาศ/คำสั่งสาธารณะสำหรับหน้า Portal */
export async function listPublicDocuments(
  tenantId: string
): Promise<DocumentDto[]> {
  const docs = await prisma.document.findMany({
    where: {
      tenantId,
      status: "APPROVED",
      category: { in: ["CIRCULAR", "ORDER"] },
    },
    orderBy: { createdAt: "desc" },
    include: {
      approvals: { orderBy: { stepOrder: "asc" } },
    },
  });

  return docs.map((d) => ({
    id: d.id,
    tenantId: d.tenantId,
    userId: d.userId,
    documentNo: d.documentNo,
    title: d.title,
    category: d.category,
    content: d.content,
    fileUrl: d.fileUrl,
    status: d.status,
    urgency: d.urgency,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
    approvals: [],
  }));
}
