import { prisma } from "@/shared/lib/infra/prisma";
import type {
  CreateResourceInput,
  UpdateResourceInput,
  CreateReservationInput,
  ApproveReservationInput,
} from "./validations";

export interface ResourceDto {
  id: string;
  tenantId: string;
  resourceType: string;
  nameTh: string;
  nameEn: string;
  capacity: number;
  location: string | null;
  details: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationDto {
  id: string;
  tenantId: string;
  resourceId: string;
  resourceNameTh?: string;
  resourceNameEn?: string;
  resourceType?: string;
  userId: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  passengerCount: number | null;
  destination: string | null;
  status: string;
  rejectReason: string | null;
  approvedById: string | null;
  createdAt: string;
  updatedAt: string;
}

/** ดึงรายชื่อทรัพยากรห้อง/รถ */
export async function listResources(
  tenantId: string,
  options?: { resourceType?: string },
): Promise<ResourceDto[]> {
  const where: { tenantId: string; resourceType?: string } = { tenantId };
  if (options?.resourceType) where.resourceType = options.resourceType;

  const resources = await prisma.resource.findMany({
    where,
    orderBy: { createdAt: "asc" },
  });

  return resources.map((r) => ({
    id: r.id,
    tenantId: r.tenantId,
    resourceType: r.resourceType,
    nameTh: r.nameTh,
    nameEn: r.nameEn,
    capacity: r.capacity,
    location: r.location,
    details: r.details,
    imageUrl: r.imageUrl,
    isActive: r.isActive,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

/** สร้างทรัพยากร */
export async function createResource(
  tenantId: string,
  input: CreateResourceInput,
): Promise<ResourceDto> {
  const created = await prisma.resource.create({
    data: {
      tenantId,
      resourceType: input.resourceType,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      capacity: input.capacity,
      location: input.location || null,
      details: input.details || null,
      imageUrl: input.imageUrl || null,
      isActive: input.isActive,
    },
  });

  return {
    id: created.id,
    tenantId: created.tenantId,
    resourceType: created.resourceType,
    nameTh: created.nameTh,
    nameEn: created.nameEn,
    capacity: created.capacity,
    location: created.location,
    details: created.details,
    imageUrl: created.imageUrl,
    isActive: created.isActive,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  };
}

/** ดึงรายการจอง (สำหรับ Admin และผู้ใช้) */
export async function listReservations(
  tenantId: string,
  options?: { resourceType?: string; status?: string; userId?: string },
): Promise<ReservationDto[]> {
  const where: {
    tenantId: string;
    userId?: string;
    status?: string;
    resource?: { resourceType: string };
  } = { tenantId };

  if (options?.userId) where.userId = options.userId;
  if (options?.status) where.status = options.status;
  if (options?.resourceType) where.resource = { resourceType: options.resourceType };

  const items = await prisma.reservation.findMany({
    where,
    orderBy: { startTime: "desc" },
    include: { resource: true },
  });

  return items.map((i) => ({
    id: i.id,
    tenantId: i.tenantId,
    resourceId: i.resourceId,
    resourceNameTh: i.resource.nameTh,
    resourceNameEn: i.resource.nameEn,
    resourceType: i.resource.resourceType,
    userId: i.userId,
    title: i.title,
    description: i.description,
    startTime: i.startTime.toISOString(),
    endTime: i.endTime.toISOString(),
    passengerCount: i.passengerCount,
    destination: i.destination,
    status: i.status,
    rejectReason: i.rejectReason,
    approvedById: i.approvedById,
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
  }));
}

/** ดึงรายการจองสำหรับปฏิทินสาธารณะ (เฉพาะ APPROVED / CONFIRMED) */
export async function listPublicSchedule(
  tenantId: string,
  options?: { resourceId?: string; resourceType?: string },
): Promise<ReservationDto[]> {
  const now = new Date();
  // ย้อนหลัง 7 วัน ถึงอนาคต 30 วัน
  const startRange = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const endRange = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const where: {
    tenantId: string;
    status: string;
    startTime: { gte: Date; lte: Date };
    resourceId?: string;
    resource?: { resourceType: string };
  } = {
    tenantId,
    status: "APPROVED",
    startTime: { gte: startRange, lte: endRange },
  };

  if (options?.resourceId) where.resourceId = options.resourceId;
  if (options?.resourceType) where.resource = { resourceType: options.resourceType };

  const items = await prisma.reservation.findMany({
    where,
    orderBy: { startTime: "asc" },
    include: { resource: true },
  });

  return items.map((i) => ({
    id: i.id,
    tenantId: i.tenantId,
    resourceId: i.resourceId,
    resourceNameTh: i.resource.nameTh,
    resourceNameEn: i.resource.nameEn,
    resourceType: i.resource.resourceType,
    userId: i.userId,
    title: i.title,
    description: i.description,
    startTime: i.startTime.toISOString(),
    endTime: i.endTime.toISOString(),
    passengerCount: i.passengerCount,
    destination: i.destination,
    status: i.status,
    rejectReason: null,
    approvedById: null,
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
  }));
}

/** สร้างคำขอจอง พร้อมตรวจ Zero Double-booking */
export async function createReservation(
  tenantId: string,
  userId: string,
  input: CreateReservationInput,
): Promise<ReservationDto> {
  const start = new Date(input.startTime);
  const end = new Date(input.endTime);

  // ตรวจสอบการชนกันของช่วงเวลา (Overlapping Check)
  const overlap = await prisma.reservation.findFirst({
    where: {
      tenantId,
      resourceId: input.resourceId,
      status: { in: ["PENDING", "APPROVED"] },
      OR: [
        { startTime: { lte: start }, endTime: { gt: start } },
        { startTime: { lt: end }, endTime: { gte: end } },
        { startTime: { gte: start }, endTime: { lte: end } },
      ],
    },
  });

  if (overlap) {
    throw new Error("ช่วงเวลาดังกล่าวมีการจองแล้ว กรุณาเลือกช่วงเวลาอื่น");
  }

  const created = await prisma.reservation.create({
    data: {
      tenantId,
      userId,
      resourceId: input.resourceId,
      title: input.title,
      description: input.description || null,
      startTime: start,
      endTime: end,
      passengerCount: input.passengerCount || null,
      destination: input.destination || null,
      status: "PENDING",
    },
    include: { resource: true },
  });

  return {
    id: created.id,
    tenantId: created.tenantId,
    resourceId: created.resourceId,
    resourceNameTh: created.resource.nameTh,
    resourceNameEn: created.resource.nameEn,
    resourceType: created.resource.resourceType,
    userId: created.userId,
    title: created.title,
    description: created.description,
    startTime: created.startTime.toISOString(),
    endTime: created.endTime.toISOString(),
    passengerCount: created.passengerCount,
    destination: created.destination,
    status: created.status,
    rejectReason: created.rejectReason,
    approvedById: created.approvedById,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  };
}

/** อนุมัติ / ปฏิเสธคำขอจอง */
export async function approveReservation(
  tenantId: string,
  approverId: string,
  input: ApproveReservationInput,
): Promise<ReservationDto> {
  const updated = await prisma.reservation.update({
    where: { id: input.id, tenantId },
    data: {
      status: input.status,
      rejectReason: input.rejectReason || null,
      approvedById: approverId,
    },
    include: { resource: true },
  });

  return {
    id: updated.id,
    tenantId: updated.tenantId,
    resourceId: updated.resourceId,
    resourceNameTh: updated.resource.nameTh,
    resourceNameEn: updated.resource.nameEn,
    resourceType: updated.resource.resourceType,
    userId: updated.userId,
    title: updated.title,
    description: updated.description,
    startTime: updated.startTime.toISOString(),
    endTime: updated.endTime.toISOString(),
    passengerCount: updated.passengerCount,
    destination: updated.destination,
    status: updated.status,
    rejectReason: updated.rejectReason,
    approvedById: updated.approvedById,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

/** ยกเลิกคำขอจอง */
export async function cancelReservation(
  tenantId: string,
  id: string,
): Promise<void> {
  await prisma.reservation.update({
    where: { id, tenantId },
    data: { status: "CANCELLED" },
  });
}
