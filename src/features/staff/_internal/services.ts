import { prisma } from "@/shared/lib/infra/prisma";
import type {
  CreateDepartmentInput,
  UpdateDepartmentInput,
  CreateStaffMemberInput,
  UpdateStaffMemberInput,
} from "./validations";

export interface DepartmentDto {
  id: string;
  tenantId: string;
  nameTh: string;
  nameEn: string;
  code: string;
  sortOrder: number;
  staffCount?: number;
}

export interface StaffMemberDto {
  id: string;
  tenantId: string;
  departmentId: string | null;
  departmentNameTh?: string | null;
  departmentNameEn?: string | null;
  prefixTh: string;
  prefixEn: string;
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
  academicPosition: string | null;
  adminPosition: string | null;
  email: string | null;
  phone: string | null;
  roomNumber: string | null;
  avatarUrl: string | null;
  education: string[];
  expertise: string[];
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** ดึงรายชื่อภาควิชาทั้งหมด */
export async function listDepartments(tenantId: string): Promise<DepartmentDto[]> {
  const depts = await prisma.department.findMany({
    where: { tenantId },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { staffMembers: true } } },
  });
  return depts.map((d) => ({
    id: d.id,
    tenantId: d.tenantId,
    nameTh: d.nameTh,
    nameEn: d.nameEn,
    code: d.code,
    sortOrder: d.sortOrder,
    staffCount: d._count.staffMembers,
  }));
}

/** สร้างภาควิชา */
export async function createDepartment(
  tenantId: string,
  input: CreateDepartmentInput,
): Promise<DepartmentDto> {
  const created = await prisma.department.create({
    data: {
      tenantId,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      code: input.code,
      sortOrder: input.sortOrder,
    },
  });
  return {
    id: created.id,
    tenantId: created.tenantId,
    nameTh: created.nameTh,
    nameEn: created.nameEn,
    code: created.code,
    sortOrder: created.sortOrder,
  };
}

/** อัปเดตภาควิชา */
export async function updateDepartment(
  tenantId: string,
  input: UpdateDepartmentInput,
): Promise<DepartmentDto> {
  const updated = await prisma.department.update({
    where: { id: input.id, tenantId },
    data: {
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      code: input.code,
      sortOrder: input.sortOrder,
    },
  });
  return {
    id: updated.id,
    tenantId: updated.tenantId,
    nameTh: updated.nameTh,
    nameEn: updated.nameEn,
    code: updated.code,
    sortOrder: updated.sortOrder,
  };
}

/** ลบภาควิชา */
export async function deleteDepartment(tenantId: string, id: string): Promise<void> {
  await prisma.department.delete({
    where: { id, tenantId },
  });
}

/** ดึงรายชื่อบุคลากรทั้งหมดสำหรับ Admin */
export async function listAdminStaffMembers(
  tenantId: string,
  options?: { departmentId?: string; search?: string },
): Promise<StaffMemberDto[]> {
  const where: {
    tenantId: string;
    departmentId?: string;
    OR?: Array<{
      firstNameTh?: { contains: string; mode: "insensitive" };
      lastNameTh?: { contains: string; mode: "insensitive" };
      firstNameEn?: { contains: string; mode: "insensitive" };
      lastNameEn?: { contains: string; mode: "insensitive" };
      adminPosition?: { contains: string; mode: "insensitive" };
    }>;
  } = { tenantId };

  if (options?.departmentId) where.departmentId = options.departmentId;
  if (options?.search) {
    where.OR = [
      { firstNameTh: { contains: options.search, mode: "insensitive" } },
      { lastNameTh: { contains: options.search, mode: "insensitive" } },
      { firstNameEn: { contains: options.search, mode: "insensitive" } },
      { lastNameEn: { contains: options.search, mode: "insensitive" } },
      { adminPosition: { contains: options.search, mode: "insensitive" } },
    ];
  }

  const staff = await prisma.staffMember.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { department: true },
  });

  return staff.map((s) => ({
    id: s.id,
    tenantId: s.tenantId,
    departmentId: s.departmentId,
    departmentNameTh: s.department?.nameTh ?? null,
    departmentNameEn: s.department?.nameEn ?? null,
    prefixTh: s.prefixTh,
    prefixEn: s.prefixEn,
    firstNameTh: s.firstNameTh,
    lastNameTh: s.lastNameTh,
    firstNameEn: s.firstNameEn,
    lastNameEn: s.lastNameEn,
    academicPosition: s.academicPosition,
    adminPosition: s.adminPosition,
    email: s.email,
    phone: s.phone,
    roomNumber: s.roomNumber,
    avatarUrl: s.avatarUrl,
    education: (s.education as string[]) ?? [],
    expertise: (s.expertise as string[]) ?? [],
    sortOrder: s.sortOrder,
    isActive: s.isActive,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));
}

/** ดึงรายชื่อบุคลากรสำหรับ Public Portal (เฉพาะ isActive = true) */
export async function listPublicStaffMembers(
  tenantId: string,
  options?: { departmentCode?: string },
): Promise<StaffMemberDto[]> {
  const where: {
    tenantId: string;
    isActive: boolean;
    department?: { code: string };
  } = { tenantId, isActive: true };

  if (options?.departmentCode) {
    where.department = { code: options.departmentCode };
  }

  const staff = await prisma.staffMember.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { department: true },
  });

  return staff.map((s) => ({
    id: s.id,
    tenantId: s.tenantId,
    departmentId: s.departmentId,
    departmentNameTh: s.department?.nameTh ?? null,
    departmentNameEn: s.department?.nameEn ?? null,
    prefixTh: s.prefixTh,
    prefixEn: s.prefixEn,
    firstNameTh: s.firstNameTh,
    lastNameTh: s.lastNameTh,
    firstNameEn: s.firstNameEn,
    lastNameEn: s.lastNameEn,
    academicPosition: s.academicPosition,
    adminPosition: s.adminPosition,
    email: s.email,
    phone: s.phone,
    roomNumber: s.roomNumber,
    avatarUrl: s.avatarUrl,
    education: (s.education as string[]) ?? [],
    expertise: (s.expertise as string[]) ?? [],
    sortOrder: s.sortOrder,
    isActive: s.isActive,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));
}

/** สร้างข้อมูลบุคลากร */
export async function createStaffMember(
  tenantId: string,
  input: CreateStaffMemberInput,
): Promise<StaffMemberDto> {
  const created = await prisma.staffMember.create({
    data: {
      tenantId,
      departmentId: input.departmentId || null,
      prefixTh: input.prefixTh,
      prefixEn: input.prefixEn,
      firstNameTh: input.firstNameTh,
      lastNameTh: input.lastNameTh,
      firstNameEn: input.firstNameEn,
      lastNameEn: input.lastNameEn,
      academicPosition: input.academicPosition || null,
      adminPosition: input.adminPosition || null,
      email: input.email || null,
      phone: input.phone || null,
      roomNumber: input.roomNumber || null,
      avatarUrl: input.avatarUrl || null,
      education: input.education ?? [],
      expertise: input.expertise ?? [],
      sortOrder: input.sortOrder,
      isActive: input.isActive,
    },
    include: { department: true },
  });

  return {
    id: created.id,
    tenantId: created.tenantId,
    departmentId: created.departmentId,
    departmentNameTh: created.department?.nameTh ?? null,
    departmentNameEn: created.department?.nameEn ?? null,
    prefixTh: created.prefixTh,
    prefixEn: created.prefixEn,
    firstNameTh: created.firstNameTh,
    lastNameTh: created.lastNameTh,
    firstNameEn: created.firstNameEn,
    lastNameEn: created.lastNameEn,
    academicPosition: created.academicPosition,
    adminPosition: created.adminPosition,
    email: created.email,
    phone: created.phone,
    roomNumber: created.roomNumber,
    avatarUrl: created.avatarUrl,
    education: (created.education as string[]) ?? [],
    expertise: (created.expertise as string[]) ?? [],
    sortOrder: created.sortOrder,
    isActive: created.isActive,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  };
}

/** อัปเดตข้อมูลบุคลากร */
export async function updateStaffMember(
  tenantId: string,
  input: UpdateStaffMemberInput,
): Promise<StaffMemberDto> {
  const updated = await prisma.staffMember.update({
    where: { id: input.id, tenantId },
    data: {
      departmentId: input.departmentId || null,
      prefixTh: input.prefixTh,
      prefixEn: input.prefixEn,
      firstNameTh: input.firstNameTh,
      lastNameTh: input.lastNameTh,
      firstNameEn: input.firstNameEn,
      lastNameEn: input.lastNameEn,
      academicPosition: input.academicPosition || null,
      adminPosition: input.adminPosition || null,
      email: input.email || null,
      phone: input.phone || null,
      roomNumber: input.roomNumber || null,
      avatarUrl: input.avatarUrl || null,
      education: input.education ?? [],
      expertise: input.expertise ?? [],
      sortOrder: input.sortOrder,
      isActive: input.isActive,
    },
    include: { department: true },
  });

  return {
    id: updated.id,
    tenantId: updated.tenantId,
    departmentId: updated.departmentId,
    departmentNameTh: updated.department?.nameTh ?? null,
    departmentNameEn: updated.department?.nameEn ?? null,
    prefixTh: updated.prefixTh,
    prefixEn: updated.prefixEn,
    firstNameTh: updated.firstNameTh,
    lastNameTh: updated.lastNameTh,
    firstNameEn: updated.firstNameEn,
    lastNameEn: updated.lastNameEn,
    academicPosition: updated.academicPosition,
    adminPosition: updated.adminPosition,
    email: updated.email,
    phone: updated.phone,
    roomNumber: updated.roomNumber,
    avatarUrl: updated.avatarUrl,
    education: (updated.education as string[]) ?? [],
    expertise: (updated.expertise as string[]) ?? [],
    sortOrder: updated.sortOrder,
    isActive: updated.isActive,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

/** ลบข้อมูลบุคลากร */
export async function deleteStaffMember(tenantId: string, id: string): Promise<void> {
  await prisma.staffMember.delete({
    where: { id, tenantId },
  });
}
