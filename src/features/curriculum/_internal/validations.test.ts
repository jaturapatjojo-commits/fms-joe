import { describe, it, expect } from "vitest";
import {
  createCurriculumMajorSchema,
  updateCurriculumMajorSchema,
  createEducationLevelSchema,
  updateEducationLevelSchema,
} from "./validations";

describe("curriculum major validations", () => {
  const dummyCurriculumId = "93793694-0df3-443c-906f-baf75e776d7f";
  const dummyMajorId = "86eb2d73-bf20-42b7-b557-07a4d80a39ee";

  it("validate createCurriculumMajorSchema สำเร็จเมื่อข้อมูลถูกต้อง", () => {
    const valid = {
      curriculumId: dummyCurriculumId,
      code: "BUD-01",
      nameTh: "สาขาวิชาพระพุทธศาสนา",
      nameEn: "Buddhism",
      degreeTh: "พุทธศาสตรบัณฑิต (พระพุทธศาสนา)",
      degreeEn: "Bachelor of Arts (Buddhism)",
      careerPaths: ["พระธรรมทูต", "ครูสอนวิชาพระพุทธศาสนา"],
      sortOrder: 1,
      isActive: true,
    };
    const parsed = createCurriculumMajorSchema.parse(valid);
    expect(parsed.nameTh).toBe("สาขาวิชาพระพุทธศาสนา");
    expect(parsed.careerPaths).toHaveLength(2);
  });

  it("validate createCurriculumMajorSchema ล้มเหลวเมื่อไม่มี nameTh หรือ nameEn", () => {
    expect(() =>
      createCurriculumMajorSchema.parse({
        curriculumId: dummyCurriculumId,
        nameTh: "",
        nameEn: "Buddhism",
      }),
    ).toThrow();

    expect(() =>
      createCurriculumMajorSchema.parse({
        curriculumId: dummyCurriculumId,
        nameTh: "สาขาวิชาพระพุทธศาสนา",
        nameEn: "",
      }),
    ).toThrow();
  });

  it("validate updateCurriculumMajorSchema ตรวจสอบ UUID ของ id", () => {
    const valid = {
      id: dummyMajorId,
      curriculumId: dummyCurriculumId,
      nameTh: "สาขาวิชาปรัชญา",
      nameEn: "Philosophy",
      sortOrder: 2,
    };
    const parsed = updateCurriculumMajorSchema.parse(valid);
    expect(parsed.id).toBe(dummyMajorId);
  });

  it("validate updateCurriculumMajorSchema ล้มเหลวเมื่อ id ไม่ใช่ UUID", () => {
    expect(() =>
      updateCurriculumMajorSchema.parse({
        id: "invalid-uuid",
        curriculumId: dummyCurriculumId,
        nameTh: "สาขาวิชาปรัชญา",
        nameEn: "Philosophy",
      }),
    ).toThrow();
  });
});

describe("education level validations", () => {
  it("validate createEducationLevelSchema สำเร็จเมื่อข้อมูลครบ", () => {
    const valid = {
      code: "VOCATIONAL",
      nameTh: "ประกาศนียบัตรวิชาชีพ (ปวช.)",
      nameEn: "Vocational Certificate",
      sortOrder: 3,
    };
    const parsed = createEducationLevelSchema.parse(valid);
    expect(parsed.code).toBe("VOCATIONAL");
  });

  it("validate updateEducationLevelSchema ต้องมี id ที่ถูกต้อง", () => {
    const valid = {
      id: "93793694-0df3-443c-906f-baf75e776d7f",
      code: "BACHELOR",
      nameTh: "ปริญญาตรี",
      nameEn: "Bachelor",
      sortOrder: 1,
    };
    expect(updateEducationLevelSchema.parse(valid).id).toBe(valid.id);
  });
});
