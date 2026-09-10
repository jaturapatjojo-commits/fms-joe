import { z } from "zod";

export const resourceTypeSchema = z.enum(["ROOM", "VEHICLE"]);
export type ResourceType = z.infer<typeof resourceTypeSchema>;

export const reservationStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]);
export type ReservationStatus = z.infer<typeof reservationStatusSchema>;

export const createResourceSchema = z.object({
  resourceType: resourceTypeSchema,
  nameTh: z.string().min(1, "กรุณาระบุชื่อ (ไทย)").max(150),
  nameEn: z.string().min(1, "Please specify name in English").max(150),
  capacity: z.coerce.number().int().min(1, "ความจุต้องอย่างน้อย 1"),
  location: z.string().max(255).optional().nullable(),
  details: z.string().optional().nullable(),
  imageUrl: z.string().url("URL รูปภาพไม่ถูกต้อง").optional().nullable().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export const updateResourceSchema = createResourceSchema.extend({
  id: z.string().uuid(),
});

export const createReservationSchema = z.object({
  resourceId: z.string().uuid("กรุณาเลือกห้องหรือยานพาหนะ"),
  title: z.string().min(1, "กรุณาระบุวัตถุประสงค์การจอง").max(255),
  description: z.string().optional().nullable(),
  startTime: z.string().datetime("รูปแบบวันเวลาเริ่มต้นไม่ถูกต้อง"),
  endTime: z.string().datetime("รูปแบบวันเวลาสิ้นสุดไม่ถูกต้อง"),
  passengerCount: z.coerce.number().int().optional().nullable(),
  destination: z.string().max(255).optional().nullable(),
}).refine((data) => new Date(data.endTime) > new Date(data.startTime), {
  message: "เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น",
  path: ["endTime"],
});

export const approveReservationSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["APPROVED", "REJECTED"]),
  rejectReason: z.string().optional().nullable(),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type ApproveReservationInput = z.infer<typeof approveReservationSchema>;
