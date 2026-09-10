import { z } from "zod";

export const degreeLevelSchema = z.enum(["BACHELOR", "MASTER", "DOCTORAL"]);
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
