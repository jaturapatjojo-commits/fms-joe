import { prisma } from "@/shared/lib/infra/prisma";
import type { CreateCurriculumInput, UpdateCurriculumInput } from "./validations";

export interface CurriculumDto {
  id: string;
  tenantId: string;
  code: string;
  degreeLevel: string;
  nameTh: string;
  nameEn: string;
  degreeTh: string;
  degreeEn: string;
  revisionYear: number;
  totalCredits: number;
  studyYears: number;
  tuitionFee: string | null;
  descriptionTh: string | null;
  descriptionEn: string | null;
  careerPaths: string[];
  studyPlan: unknown[];
  syllabusFileUrl: string | null;
  isOpenAdmission: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** ดึงรายชื่อหลักสูตรทั้งหมดสำหรับ Admin */
export async function listAdminCurriculums(
  tenantId: string,
  options?: { degreeLevel?: string; search?: string },
): Promise<CurriculumDto[]> {
  const where: {
    tenantId: string;
    degreeLevel?: string;
    OR?: Array<{
      nameTh?: { contains: string; mode: "insensitive" };
      nameEn?: { contains: string; mode: "insensitive" };
      code?: { contains: string; mode: "insensitive" };
    }>;
  } = { tenantId };

  if (options?.degreeLevel) where.degreeLevel = options.degreeLevel;
  if (options?.search) {
    where.OR = [
      { nameTh: { contains: options.search, mode: "insensitive" } },
      { nameEn: { contains: options.search, mode: "insensitive" } },
      { code: { contains: options.search, mode: "insensitive" } },
    ];
  }

  const items = await prisma.curriculum.findMany({
    where,
    orderBy: [{ degreeLevel: "asc" }, { revisionYear: "desc" }],
  });

  return items.map((c) => ({
    id: c.id,
    tenantId: c.tenantId,
    code: c.code,
    degreeLevel: c.degreeLevel,
    nameTh: c.nameTh,
    nameEn: c.nameEn,
    degreeTh: c.degreeTh,
    degreeEn: c.degreeEn,
    revisionYear: c.revisionYear,
    totalCredits: c.totalCredits,
    studyYears: c.studyYears,
    tuitionFee: c.tuitionFee,
    descriptionTh: c.descriptionTh,
    descriptionEn: c.descriptionEn,
    careerPaths: (c.careerPaths as string[]) ?? [],
    studyPlan: (c.studyPlan as unknown[]) ?? [],
    syllabusFileUrl: c.syllabusFileUrl,
    isOpenAdmission: c.isOpenAdmission,
    isActive: c.isActive,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));
}

/** ดึงรายชื่อหลักสูตรสำหรับ Public Portal */
export async function listPublicCurriculums(
  tenantId: string,
  options?: { degreeLevel?: string },
): Promise<CurriculumDto[]> {
  const where: {
    tenantId: string;
    isActive: boolean;
    degreeLevel?: string;
  } = { tenantId, isActive: true };

  if (options?.degreeLevel) {
    where.degreeLevel = options.degreeLevel;
  }

  const items = await prisma.curriculum.findMany({
    where,
    orderBy: [{ degreeLevel: "asc" }, { revisionYear: "desc" }],
  });

  return items.map((c) => ({
    id: c.id,
    tenantId: c.tenantId,
    code: c.code,
    degreeLevel: c.degreeLevel,
    nameTh: c.nameTh,
    nameEn: c.nameEn,
    degreeTh: c.degreeTh,
    degreeEn: c.degreeEn,
    revisionYear: c.revisionYear,
    totalCredits: c.totalCredits,
    studyYears: c.studyYears,
    tuitionFee: c.tuitionFee,
    descriptionTh: c.descriptionTh,
    descriptionEn: c.descriptionEn,
    careerPaths: (c.careerPaths as string[]) ?? [],
    studyPlan: (c.studyPlan as unknown[]) ?? [],
    syllabusFileUrl: c.syllabusFileUrl,
    isOpenAdmission: c.isOpenAdmission,
    isActive: c.isActive,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));
}

/** ดึงข้อมูลหลักสูตรเดี่ยวด้วย ID */
export async function getCurriculumById(
  tenantId: string,
  id: string,
): Promise<CurriculumDto | null> {
  const c = await prisma.curriculum.findFirst({
    where: { id, tenantId },
  });

  if (!c) return null;

  return {
    id: c.id,
    tenantId: c.tenantId,
    code: c.code,
    degreeLevel: c.degreeLevel,
    nameTh: c.nameTh,
    nameEn: c.nameEn,
    degreeTh: c.degreeTh,
    degreeEn: c.degreeEn,
    revisionYear: c.revisionYear,
    totalCredits: c.totalCredits,
    studyYears: c.studyYears,
    tuitionFee: c.tuitionFee,
    descriptionTh: c.descriptionTh,
    descriptionEn: c.descriptionEn,
    careerPaths: (c.careerPaths as string[]) ?? [],
    studyPlan: (c.studyPlan as unknown[]) ?? [],
    syllabusFileUrl: c.syllabusFileUrl,
    isOpenAdmission: c.isOpenAdmission,
    isActive: c.isActive,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

/** สร้างหลักสูตร */
export async function createCurriculum(
  tenantId: string,
  input: CreateCurriculumInput,
): Promise<CurriculumDto> {
  const created = await prisma.curriculum.create({
    data: {
      tenantId,
      code: input.code,
      degreeLevel: input.degreeLevel,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      degreeTh: input.degreeTh,
      degreeEn: input.degreeEn,
      revisionYear: input.revisionYear,
      totalCredits: input.totalCredits,
      studyYears: input.studyYears,
      tuitionFee: input.tuitionFee || null,
      descriptionTh: input.descriptionTh || null,
      descriptionEn: input.descriptionEn || null,
      careerPaths: input.careerPaths ?? [],
      studyPlan: input.studyPlan ?? [],
      syllabusFileUrl: input.syllabusFileUrl || null,
      isOpenAdmission: input.isOpenAdmission,
      isActive: input.isActive,
    },
  });

  return {
    id: created.id,
    tenantId: created.tenantId,
    code: created.code,
    degreeLevel: created.degreeLevel,
    nameTh: created.nameTh,
    nameEn: created.nameEn,
    degreeTh: created.degreeTh,
    degreeEn: created.degreeEn,
    revisionYear: created.revisionYear,
    totalCredits: created.totalCredits,
    studyYears: created.studyYears,
    tuitionFee: created.tuitionFee,
    descriptionTh: created.descriptionTh,
    descriptionEn: created.descriptionEn,
    careerPaths: (created.careerPaths as string[]) ?? [],
    studyPlan: (created.studyPlan as unknown[]) ?? [],
    syllabusFileUrl: created.syllabusFileUrl,
    isOpenAdmission: created.isOpenAdmission,
    isActive: created.isActive,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  };
}

/** อัปเดตหลักสูตร */
export async function updateCurriculum(
  tenantId: string,
  input: UpdateCurriculumInput,
): Promise<CurriculumDto> {
  const updated = await prisma.curriculum.update({
    where: { id: input.id, tenantId },
    data: {
      code: input.code,
      degreeLevel: input.degreeLevel,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      degreeTh: input.degreeTh,
      degreeEn: input.degreeEn,
      revisionYear: input.revisionYear,
      totalCredits: input.totalCredits,
      studyYears: input.studyYears,
      tuitionFee: input.tuitionFee || null,
      descriptionTh: input.descriptionTh || null,
      descriptionEn: input.descriptionEn || null,
      careerPaths: input.careerPaths ?? [],
      studyPlan: input.studyPlan ?? [],
      syllabusFileUrl: input.syllabusFileUrl || null,
      isOpenAdmission: input.isOpenAdmission,
      isActive: input.isActive,
    },
  });

  return {
    id: updated.id,
    tenantId: updated.tenantId,
    code: updated.code,
    degreeLevel: updated.degreeLevel,
    nameTh: updated.nameTh,
    nameEn: updated.nameEn,
    degreeTh: updated.degreeTh,
    degreeEn: updated.degreeEn,
    revisionYear: updated.revisionYear,
    totalCredits: updated.totalCredits,
    studyYears: updated.studyYears,
    tuitionFee: updated.tuitionFee,
    descriptionTh: updated.descriptionTh,
    descriptionEn: updated.descriptionEn,
    careerPaths: (updated.careerPaths as string[]) ?? [],
    studyPlan: (updated.studyPlan as unknown[]) ?? [],
    syllabusFileUrl: updated.syllabusFileUrl,
    isOpenAdmission: updated.isOpenAdmission,
    isActive: updated.isActive,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

/** ลบหลักสูตร */
export async function deleteCurriculum(tenantId: string, id: string): Promise<void> {
  await prisma.curriculum.delete({
    where: { id, tenantId },
  });
}
