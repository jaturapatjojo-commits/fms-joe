import { z } from "zod";

export const createDepartmentSchema = z.object({
  nameTh: z.string().min(1, "กรุณาระบุชื่อภาควิชา/ฝ่ายงาน (ไทย)").max(150),
  nameEn: z.string().min(1, "Please specify department name in English").max(150),
  code: z.string().min(1, "กรุณาระบุรหัสภาควิชา").max(50),
  sortOrder: z.coerce.number().int().default(0),
});

export const updateDepartmentSchema = createDepartmentSchema.extend({
  id: z.string().uuid(),
});

export const createStaffMemberSchema = z.object({
  departmentId: z.string().uuid().nullable().optional(),
  prefixTh: z.string().min(1, "กรุณาระบุคำนำหน้า (ไทย)").max(50),
  prefixEn: z.string().min(1, "Please specify prefix in English").max(50),
  firstNameTh: z.string().min(1, "กรุณาระบุชื่อ (ไทย)").max(100),
  lastNameTh: z.string().min(1, "กรุณาระบุนามสกุล (ไทย)").max(100),
  firstNameEn: z.string().min(1, "Please specify first name in English").max(100),
  lastNameEn: z.string().min(1, "Please specify last name in English").max(100),
  academicPosition: z.string().max(100).optional().nullable(),
  adminPosition: z.string().max(150).optional().nullable(),
  email: z.string().email("อีเมลไม่ถูกต้อง").optional().nullable().or(z.literal("")),
  phone: z.string().max(50).optional().nullable(),
  roomNumber: z.string().max(50).optional().nullable(),
  avatarUrl: z.string().url("URL รูปภาพไม่ถูกต้อง").optional().nullable().or(z.literal("")),
  education: z.array(z.string()).default([]),
  expertise: z.array(z.string()).default([]),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateStaffMemberSchema = createStaffMemberSchema.extend({
  id: z.string().uuid(),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type CreateStaffMemberInput = z.infer<typeof createStaffMemberSchema>;
export type UpdateStaffMemberInput = z.infer<typeof updateStaffMemberSchema>;
