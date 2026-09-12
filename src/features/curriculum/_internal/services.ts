import { prisma } from "@/shared/lib/infra/prisma";
import type {
  CreateCurriculumInput,
  UpdateCurriculumInput,
  CreateEducationLevelInput,
  UpdateEducationLevelInput,
  CreateCurriculumMajorInput,
  UpdateCurriculumMajorInput,
} from "./validations";

export interface CurriculumMajorDto {
  id: string;
  curriculumId: string;
  code: string | null;
  nameTh: string;
  nameEn: string;
  degreeTh: string | null;
  degreeEn: string | null;
  descriptionTh: string | null;
  descriptionEn: string | null;
  careerPaths: string[];
  studyPlan: unknown[];
  syllabusFileUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  majors?: CurriculumMajorDto[];
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
    include: {
      majors: {
        orderBy: { sortOrder: "asc" },
      },
    },
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
    majors: (c.majors ?? []).map((m) => ({
      id: m.id,
      curriculumId: m.curriculumId,
      code: m.code,
      nameTh: m.nameTh,
      nameEn: m.nameEn,
      degreeTh: m.degreeTh,
      degreeEn: m.degreeEn,
      descriptionTh: m.descriptionTh,
      descriptionEn: m.descriptionEn,
      careerPaths: (m.careerPaths as string[]) ?? [],
      studyPlan: (m.studyPlan as unknown[]) ?? [],
      syllabusFileUrl: m.syllabusFileUrl,
      sortOrder: m.sortOrder,
      isActive: m.isActive,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    })),
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
    include: {
      majors: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
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
    majors: (c.majors ?? []).map((m) => ({
      id: m.id,
      curriculumId: m.curriculumId,
      code: m.code,
      nameTh: m.nameTh,
      nameEn: m.nameEn,
      degreeTh: m.degreeTh,
      degreeEn: m.degreeEn,
      descriptionTh: m.descriptionTh,
      descriptionEn: m.descriptionEn,
      careerPaths: (m.careerPaths as string[]) ?? [],
      studyPlan: (m.studyPlan as unknown[]) ?? [],
      syllabusFileUrl: m.syllabusFileUrl,
      sortOrder: m.sortOrder,
      isActive: m.isActive,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    })),
  }));
}

/** ดึงระดับการศึกษาทั้งหมดที่มีการใช้งานในระบบสำหรับ Tenant */
export async function listActiveDegreeLevels(
  tenantId: string,
  options?: { onlyActive?: boolean },
): Promise<string[]> {
  const where: { tenantId: string; isActive?: boolean } = { tenantId };
  if (options?.onlyActive ?? true) {
    where.isActive = true;
  }
  const items = await prisma.curriculum.findMany({
    where,
    select: { degreeLevel: true },
    distinct: ["degreeLevel"],
    orderBy: { degreeLevel: "asc" },
  });
  return items.map((i) => i.degreeLevel).filter(Boolean);
}

/** ดึงข้อมูลหลักสูตรเดี่ยวด้วย ID */
export async function getCurriculumById(
  tenantId: string,
  id: string,
): Promise<CurriculumDto | null> {
  const c = await prisma.curriculum.findFirst({
    where: { id, tenantId },
    include: {
      majors: {
        orderBy: { sortOrder: "asc" },
      },
    },
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
    majors: (c.majors ?? []).map((m) => ({
      id: m.id,
      curriculumId: m.curriculumId,
      code: m.code,
      nameTh: m.nameTh,
      nameEn: m.nameEn,
      degreeTh: m.degreeTh,
      degreeEn: m.degreeEn,
      descriptionTh: m.descriptionTh,
      descriptionEn: m.descriptionEn,
      careerPaths: (m.careerPaths as string[]) ?? [],
      studyPlan: (m.studyPlan as unknown[]) ?? [],
      syllabusFileUrl: m.syllabusFileUrl,
      sortOrder: m.sortOrder,
      isActive: m.isActive,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    })),
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

export interface EducationLevelDto {
  id: string;
  tenantId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  sortOrder: number;
  curriculumsCount?: number;
  createdAt: string;
  updatedAt: string;
}

/** ดึงรายการระดับการศึกษาทั้งหมดสำหรับ Admin */
export async function listEducationLevels(tenantId: string): Promise<EducationLevelDto[]> {
  const [levels, curriculumCounts] = await Promise.all([
    prisma.educationLevel.findMany({
      where: { tenantId },
      orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
    }),
    prisma.curriculum.groupBy({
      by: ["degreeLevel"],
      where: { tenantId },
      _count: { id: true },
    }),
  ]);

  const countMap = new Map<string, number>();
  for (const c of curriculumCounts) {
    countMap.set(c.degreeLevel, c._count.id);
  }

  return levels.map((l) => ({
    id: l.id,
    tenantId: l.tenantId,
    code: l.code,
    nameTh: l.nameTh,
    nameEn: l.nameEn,
    sortOrder: l.sortOrder,
    curriculumsCount: countMap.get(l.code) ?? 0,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }));
}

/** สร้างระดับการศึกษาใหม่ */
export async function createEducationLevel(
  tenantId: string,
  input: CreateEducationLevelInput,
): Promise<EducationLevelDto> {
  const existing = await prisma.educationLevel.findUnique({
    where: { tenantId_code: { tenantId, code: input.code } },
  });
  if (existing) {
    throw new Error(`รหัสระดับการศึกษา "${input.code}" มีอยู่ในระบบแล้ว`);
  }

  const level = await prisma.educationLevel.create({
    data: {
      tenantId,
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      sortOrder: input.sortOrder,
    },
  });

  return {
    id: level.id,
    tenantId: level.tenantId,
    code: level.code,
    nameTh: level.nameTh,
    nameEn: level.nameEn,
    sortOrder: level.sortOrder,
    curriculumsCount: 0,
    createdAt: level.createdAt.toISOString(),
    updatedAt: level.updatedAt.toISOString(),
  };
}

/** แก้ไขระดับการศึกษา */
export async function updateEducationLevel(
  tenantId: string,
  input: UpdateEducationLevelInput,
): Promise<EducationLevelDto> {
  const current = await prisma.educationLevel.findFirst({
    where: { id: input.id, tenantId },
  });
  if (!current) {
    throw new Error("ไม่พบข้อมูลระดับการศึกษา");
  }

  if (current.code !== input.code) {
    const conflict = await prisma.educationLevel.findUnique({
      where: { tenantId_code: { tenantId, code: input.code } },
    });
    if (conflict) {
      throw new Error(`รหัสระดับการศึกษา "${input.code}" มีอยู่ในระบบแล้ว`);
    }

    // อัปเดตการอ้างอิงในหลักสูตรที่มีอยู่เดิม
    await prisma.curriculum.updateMany({
      where: { tenantId, degreeLevel: current.code },
      data: { degreeLevel: input.code },
    });
  }

  const updated = await prisma.educationLevel.update({
    where: { id: input.id },
    data: {
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      sortOrder: input.sortOrder,
    },
  });

  const count = await prisma.curriculum.count({
    where: { tenantId, degreeLevel: updated.code },
  });

  return {
    id: updated.id,
    tenantId: updated.tenantId,
    code: updated.code,
    nameTh: updated.nameTh,
    nameEn: updated.nameEn,
    sortOrder: updated.sortOrder,
    curriculumsCount: count,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

/** ลบระดับการศึกษา */
export async function deleteEducationLevel(tenantId: string, id: string): Promise<void> {
  const current = await prisma.educationLevel.findFirst({
    where: { id, tenantId },
  });
  if (!current) {
    throw new Error("ไม่พบข้อมูลระดับการศึกษา");
  }

  const count = await prisma.curriculum.count({
    where: { tenantId, degreeLevel: current.code },
  });
  if (count > 0) {
    throw new Error(`ไม่สามารถลบได้ เนื่องจากมีหลักสูตรจำนวน ${count} รายการที่กำลังใช้ระดับการศึกษานี้`);
  }

  await prisma.educationLevel.delete({
    where: { id },
  });
}

/** ดึงรายชื่อสาขาวิชาของหลักสูตร */
export async function listCurriculumMajors(
  curriculumId: string,
  options?: { onlyActive?: boolean },
): Promise<CurriculumMajorDto[]> {
  const where: { curriculumId: string; isActive?: boolean } = { curriculumId };
  if (options?.onlyActive) {
    where.isActive = true;
  }
  const items = await prisma.curriculumMajor.findMany({
    where,
    orderBy: { sortOrder: "asc" },
  });
  return items.map((m) => ({
    id: m.id,
    curriculumId: m.curriculumId,
    code: m.code,
    nameTh: m.nameTh,
    nameEn: m.nameEn,
    degreeTh: m.degreeTh,
    degreeEn: m.degreeEn,
    descriptionTh: m.descriptionTh,
    descriptionEn: m.descriptionEn,
    careerPaths: (m.careerPaths as string[]) ?? [],
    studyPlan: (m.studyPlan as unknown[]) ?? [],
    syllabusFileUrl: m.syllabusFileUrl,
    sortOrder: m.sortOrder,
    isActive: m.isActive,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  }));
}

/** สร้างสาขาวิชาใหม่ */
export async function createCurriculumMajor(
  tenantId: string,
  input: CreateCurriculumMajorInput,
): Promise<CurriculumMajorDto> {
  const curriculum = await prisma.curriculum.findFirst({
    where: { id: input.curriculumId, tenantId },
  });
  if (!curriculum) {
    throw new Error("ไม่พบข้อมูลหลักสูตรที่ระบุ");
  }

  const created = await prisma.curriculumMajor.create({
    data: {
      curriculumId: input.curriculumId,
      code: input.code || null,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      degreeTh: input.degreeTh || null,
      degreeEn: input.degreeEn || null,
      descriptionTh: input.descriptionTh || null,
      descriptionEn: input.descriptionEn || null,
      careerPaths: input.careerPaths ?? [],
      studyPlan: input.studyPlan ?? [],
      syllabusFileUrl: input.syllabusFileUrl || null,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
    },
  });

  return {
    id: created.id,
    curriculumId: created.curriculumId,
    code: created.code,
    nameTh: created.nameTh,
    nameEn: created.nameEn,
    degreeTh: created.degreeTh,
    degreeEn: created.degreeEn,
    descriptionTh: created.descriptionTh,
    descriptionEn: created.descriptionEn,
    careerPaths: (created.careerPaths as string[]) ?? [],
    studyPlan: (created.studyPlan as unknown[]) ?? [],
    syllabusFileUrl: created.syllabusFileUrl,
    sortOrder: created.sortOrder,
    isActive: created.isActive,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  };
}

/** แก้ไขสาขาวิชา */
export async function updateCurriculumMajor(
  tenantId: string,
  input: UpdateCurriculumMajorInput,
): Promise<CurriculumMajorDto> {
  const current = await prisma.curriculumMajor.findFirst({
    where: {
      id: input.id,
      curriculum: { tenantId },
    },
  });
  if (!current) {
    throw new Error("ไม่พบข้อมูลสาขาวิชา");
  }

  const updated = await prisma.curriculumMajor.update({
    where: { id: input.id },
    data: {
      code: input.code !== undefined ? (input.code || null) : undefined,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      degreeTh: input.degreeTh !== undefined ? (input.degreeTh || null) : undefined,
      degreeEn: input.degreeEn !== undefined ? (input.degreeEn || null) : undefined,
      descriptionTh: input.descriptionTh !== undefined ? (input.descriptionTh || null) : undefined,
      descriptionEn: input.descriptionEn !== undefined ? (input.descriptionEn || null) : undefined,
      careerPaths: input.careerPaths,
      studyPlan: input.studyPlan,
      syllabusFileUrl: input.syllabusFileUrl !== undefined ? (input.syllabusFileUrl || null) : undefined,
      sortOrder: input.sortOrder,
      isActive: input.isActive,
    },
  });

  return {
    id: updated.id,
    curriculumId: updated.curriculumId,
    code: updated.code,
    nameTh: updated.nameTh,
    nameEn: updated.nameEn,
    degreeTh: updated.degreeTh,
    degreeEn: updated.degreeEn,
    descriptionTh: updated.descriptionTh,
    descriptionEn: updated.descriptionEn,
    careerPaths: (updated.careerPaths as string[]) ?? [],
    studyPlan: (updated.studyPlan as unknown[]) ?? [],
    syllabusFileUrl: updated.syllabusFileUrl,
    sortOrder: updated.sortOrder,
    isActive: updated.isActive,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

/** ลบสาขาวิชา */
export async function deleteCurriculumMajor(tenantId: string, id: string): Promise<void> {
  const current = await prisma.curriculumMajor.findFirst({
    where: {
      id,
      curriculum: { tenantId },
    },
  });
  if (!current) {
    throw new Error("ไม่พบข้อมูลสาขาวิชา");
  }

  await prisma.curriculumMajor.delete({
    where: { id },
  });
}

