import { describe, it, expect } from "vitest";
import { createReservationSchema } from "./_internal/validations";

describe("Reservations Validation & Business Rules", () => {
  it("ผ่านการตรวจสอบเมื่อกรอกข้อมูลครบถ้วนถูกต้อง", () => {
    const input = {
      resourceId: "123e4567-e89b-12d3-a456-426614174000",
      title: "การประชุมคณะกรรมการประจำคณะ",
      description: "วาระพิเศษ",
      startTime: new Date("2026-09-15T09:00:00Z").toISOString(),
      endTime: new Date("2026-09-15T12:00:00Z").toISOString(),
      passengerCount: 15,
      destination: "อาคารเรียนรวม",
    };
    const result = createReservationSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("ปฏิเสธเมื่อไม่มี resourceId", () => {
    const input = {
      title: "ทดสอบไม่มีห้อง",
      startTime: new Date("2026-09-15T09:00:00Z").toISOString(),
      endTime: new Date("2026-09-15T12:00:00Z").toISOString(),
    };
    const result = createReservationSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("ปฏิเสธเมื่อหัวข้อว่างเปล่า", () => {
    const input = {
      resourceId: "123e4567-e89b-12d3-a456-426614174000",
      title: "",
      startTime: new Date("2026-09-15T09:00:00Z").toISOString(),
      endTime: new Date("2026-09-15T12:00:00Z").toISOString(),
    };
    const result = createReservationSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});
