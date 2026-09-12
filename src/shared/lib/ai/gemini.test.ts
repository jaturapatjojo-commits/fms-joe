import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { testGeminiConnection, generateEnglishFromThaiNews } from "./gemini";

describe("Gemini AI integration", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("testGeminiConnection", () => {
    it("throws error if API key is blank", async () => {
      await expect(testGeminiConnection("   ")).rejects.toThrow("กรุณาระบุ Gemini API Key");
    });

    it("succeeds when Gemini responds with 200", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: "OK" }],
              },
            },
          ],
        }),
      } as unknown as Response);

      const result = await testGeminiConnection("test-key", "gemini-2.5-flash");
      expect(result.ok).toBe(true);
      expect(result.model).toBe("gemini-2.5-flash");
      expect(result.message).toBe("OK");
    });

    it("throws friendly error when API key is invalid", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: {
            code: 400,
            message: "API_KEY_INVALID",
          },
        }),
      } as unknown as Response);

      await expect(testGeminiConnection("invalid-key")).rejects.toThrow("API Key ไม่ถูกต้อง");
    });
  });

  describe("generateEnglishFromThaiNews", () => {
    it("throws error if API key is blank", async () => {
      await expect(
        generateEnglishFromThaiNews({
          apiKey: "",
          titleTh: "หัวข้อข่าว",
          contentTh: "เนื้อหาข่าว",
        }),
      ).rejects.toThrow("ยังไม่ได้กำหนด Gemini API Key");
    });

    it("parses valid JSON response and normalizes slug", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      titleEn: "Annual Teacher Homage Ceremony 2026",
                      summaryEn: "The Faculty of Management Sciences held the annual ceremony.",
                      contentEn: "Full details of the homage ceremony...",
                      slug: "Annual Teacher Homage! Ceremony 2026",
                    }),
                  },
                ],
              },
            },
          ],
        }),
      } as unknown as Response);

      const result = await generateEnglishFromThaiNews({
        apiKey: "valid-key",
        titleTh: "พิธีไหว้ครู 2569",
        summaryTh: "คณะวิทยาการจัดการจัดพิธีไหว้ครู",
        contentTh: "รายละเอียดพิธีการไหว้ครูประจำปี 2569",
      });

      expect(result.titleEn).toBe("Annual Teacher Homage Ceremony 2026");
      expect(result.summaryEn).toBe("The Faculty of Management Sciences held the annual ceremony.");
      expect(result.contentEn).toBe("Full details of the homage ceremony...");
      expect(result.slug).toBe("annual-teacher-homage-ceremony-2026");
    });
  });
});
