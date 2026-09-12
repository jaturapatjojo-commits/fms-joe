import { describe, it, expect } from "vitest";
import { createNewsArticleSchema, updateNewsArticleSchema } from "./validations";

describe("news article validations", () => {
  it("passes validation with Thai-only title and content", () => {
    const input = {
      titleTh: "โครงการสัมมนาวิชาการ 2569",
      contentTh: "<p>คณะวิทยาการจัดการจัดสัมมนาวิชาการ...</p>",
    };

    const parsed = createNewsArticleSchema.parse(input);
    expect(parsed.titleTh).toBe("โครงการสัมมนาวิชาการ 2569");
    expect(parsed.contentTh).toContain("<p>คณะวิทยาการจัดการจัดสัมมนาวิชาการ...</p>");
  });

  it("passes validation with optional slug and English fields", () => {
    const input = {
      titleTh: "ข่าวประชาสัมพันธ์",
      titleEn: "",
      slug: "",
      summaryTh: "",
      summaryEn: "",
      contentTh: "เนื้อหาข่าวภาษาไทย",
      contentEn: "",
    };

    const parsed = createNewsArticleSchema.parse(input);
    expect(parsed.titleTh).toBe("ข่าวประชาสัมพันธ์");
    expect(parsed.contentTh).toBe("เนื้อหาข่าวภาษาไทย");
  });

  it("fails validation when titleTh or contentTh is missing", () => {
    expect(() =>
      createNewsArticleSchema.parse({
        titleTh: "",
        contentTh: "เนื้อหา",
      }),
    ).toThrow();

    expect(() =>
      createNewsArticleSchema.parse({
        titleTh: "หัวข้อข่าว",
        contentTh: "",
      }),
    ).toThrow();
  });

  it("validates updateNewsArticleSchema requiring valid uuid", () => {
    const valid = {
      id: "93793694-0df3-443c-906f-baf75e776d7f",
      titleTh: "แก้ไขหัวข้อข่าว",
      contentTh: "<p>แก้ไขเนื้อหาข่าว</p>",
    };

    const parsed = updateNewsArticleSchema.parse(valid);
    expect(parsed.id).toBe("93793694-0df3-443c-906f-baf75e776d7f");
    expect(parsed.titleTh).toBe("แก้ไขหัวข้อข่าว");
  });
});
