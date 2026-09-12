import { z } from "zod";

export const degreeLevelSchema = z
  .string()
  .trim()
  .min(1, "กรุณาระบุระดับการศึกษา")
  .max(50, "ระดับการศึกษาต้องไม่เกิน 50 ตัวอักษร");
export type DegreeLevel = z.infer<typeof degreeLevelSchema>;

export const createCurriculumSchema = z.object({
  code: z.string().min(1, "กรุณาระบุรหัสหลักสูตร").max(50),
  degreeLevel: degreeLevelSchema,
  nameTh: z.string().min(1, "กรุณาระบุชื่อหลักสูตร (ไทย)").max(255),
  nameEn: z.string().min(1, "Please specify curriculum name in English").max(255),
  degreeTh: z.string().min(1, "กรุณาระบุชื่อปริญญา (ไทย)").max(255),
  degreeEn: z.string().min(1, "Please specify degree name in English").max(255),
  revisionYear: z.coerce.number().int().min(2500).max(2600),
  totalCredits: z.coerce.number().int().min(1),
  studyYears: z.coerce.number().int().min(1).default(4),
  tuitionFee: z.string().max(100).optional().nullable(),
  descriptionTh: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  careerPaths: z.array(z.string()).default([]),
  studyPlan: z.array(z.any()).default([]),
  syllabusFileUrl: z.string().url("URL เอกสารไม่ถูกต้อง").optional().nullable().or(z.literal("")),
  isOpenAdmission: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

export const updateCurriculumSchema = createCurriculumSchema.extend({
  id: z.string().uuid(),
});

export type CreateCurriculumInput = z.infer<typeof createCurriculumSchema>;
export type UpdateCurriculumInput = z.infer<typeof updateCurriculumSchema>;

export const createEducationLevelSchema = z.object({
  code: z.string().trim().min(1, "กรุณาระบุรหัสระดับการศึกษา").max(50, "รหัสต้องไม่เกิน 50 ตัวอักษร"),
  nameTh: z.string().trim().min(1, "กรุณาระบุชื่อระดับการศึกษา (ไทย)").max(150, "ชื่อต้องไม่เกิน 150 ตัวอักษร"),
  nameEn: z.string().trim().min(1, "Please specify level name in English").max(150, "Name must not exceed 150 characters"),
  sortOrder: z.coerce.number().int().default(0),
});

export const updateEducationLevelSchema = createEducationLevelSchema.extend({
  id: z.string().uuid(),
});

export type CreateEducationLevelInput = z.infer<typeof createEducationLevelSchema>;
export type UpdateEducationLevelInput = z.infer<typeof updateEducationLevelSchema>;

export const createCurriculumMajorSchema = z.object({
  curriculumId: z.string().uuid("รหัสหลักสูตรไม่ถูกต้อง"),
  code: z.string().trim().max(50).optional().nullable(),
  nameTh: z.string().trim().min(1, "กรุณาระบุชื่อสาขาวิชา (ไทย)").max(255),
  nameEn: z.string().trim().min(1, "Please specify major name in English").max(255),
  degreeTh: z.string().trim().max(255).optional().nullable(),
  degreeEn: z.string().trim().max(255).optional().nullable(),
  descriptionTh: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  careerPaths: z.array(z.string()).default([]),
  studyPlan: z.array(z.any()).default([]),
  syllabusFileUrl: z.string().url("URL เอกสารไม่ถูกต้อง").optional().nullable().or(z.literal("")),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateCurriculumMajorSchema = createCurriculumMajorSchema.extend({
  id: z.string().uuid(),
});

export type CreateCurriculumMajorInput = z.infer<typeof createCurriculumMajorSchema>;
export type UpdateCurriculumMajorInput = z.infer<typeof updateCurriculumMajorSchema>;

