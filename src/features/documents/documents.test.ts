import { describe, it, expect } from "vitest";
import { createDocumentSchema, processApprovalSchema } from "./_internal/validations";

describe("Documents Validation & Approval Rules", () => {
  it("ผ่านการตรวจสอบการสร้างร่างเอกสาร", () => {
    const input = {
      documentNo: "ว 99/2569",
      title: "ประกาศวันหยุดราชการกรณีพิเศษ",
      category: "CIRCULAR",
      urgency: "NORMAL",
      content: "เนื่องในโอกาสวันสำคัญ...",
      fileUrl: "https://example.com/holiday.pdf",
    };
    const result = createDocumentSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("ปฏิเสธเมื่อไม่มีเลขที่หนังสือหรือชื่อเรื่อง", () => {
    const input = {
      documentNo: "",
      title: "",
      category: "MEMO",
      urgency: "NORMAL",
    };
    const result = createDocumentSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("ตรวจสอบการส่งผลการพิจารณาอนุมัติเอกสาร", () => {
    const validApproval = {
      documentId: "123e4567-e89b-12d3-a456-426614174000",
      status: "APPROVED",
      comment: "อนุมัติให้ดำเนินการตามเสนอ",
    };
    const result = processApprovalSchema.safeParse(validApproval);
    expect(result.success).toBe(true);
  });
});
