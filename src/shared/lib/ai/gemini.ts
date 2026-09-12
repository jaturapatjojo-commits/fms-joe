import { errors, isAppError } from "@/shared/lib/errors";

export const GEMINI_MODELS = [
  { id: "gemini-3.6-flash", label: "Gemini 3.6 Flash (แนะนำ - รวดเร็ว ฉลาด และแม่นยำ)" },
  { id: "gemini-flash-latest", label: "Gemini Flash (รุ่นล่าสุดอัตโนมัติ)" },
  { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite (ประหยัดโควตา รวดเร็ว)" },
  { id: "gemini-pro-latest", label: "Gemini Pro (รุ่นล่าสุดสำหรับวิเคราะห์เชิงลึก)" },
] as const;

export const DEFAULT_GEMINI_MODEL = "gemini-3.6-flash";

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
    finishReason?: string;
  }>;
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

/**
 * ทดสอบการเชื่อมต่อ Google Gemini API ด้วย API Key ที่ระบุ
 */
export async function testGeminiConnection(
  apiKey: string,
  model: string = DEFAULT_GEMINI_MODEL,
): Promise<{ ok: boolean; latencyMs: number; model: string; message: string }> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    throw errors.validation("กรุณาระบุ Gemini API Key");
  }

  const selectedModel = model.trim() || DEFAULT_GEMINI_MODEL;
  const startTime = Date.now();

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    selectedModel,
  )}:generateContent?key=${encodeURIComponent(cleanKey)}`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: "Hello, reply with OK to confirm API connection." }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 20,
        },
      }),
    });

    const latencyMs = Date.now() - startTime;
    const data = (await res.json()) as GeminiGenerateContentResponse;

    if (!res.ok || data.error) {
      const errMsg = data.error?.message || `HTTP ${res.status} ${res.statusText}`;
      if (res.status === 400 || errMsg.toLowerCase().includes("api_key")) {
        throw errors.validation("API Key ไม่ถูกต้อง หรือไม่มีสิทธิ์เข้าถึงโมเดลนี้ (กรุณาตรวจสอบที่ Google AI Studio)");
      }
      if (res.status === 429) {
        throw errors.rate_limited("โควตาการเรียกใช้งาน Gemini API เต็มชั่วคราว (Rate limit exceeded)");
      }
      if (errMsg.includes("not found") || errMsg.includes("no longer available")) {
        throw errors.validation(`โมเดล ${selectedModel} ไม่เปิดให้ใช้งานสำหรับคีย์นี้ หรือถูกยกเลิกแล้ว กรุณาเลือกใช้ 'Gemini 3.6 Flash' หรือ 'Gemini Flash'`);
      }
      throw errors.validation(`เชื่อมต่อ Gemini API ไม่สำเร็จ: ${errMsg}`);
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "OK";

    return {
      ok: true,
      latencyMs,
      model: selectedModel,
      message: reply,
    };
  } catch (err: unknown) {
    if (isAppError(err)) {
      throw err;
    }
    throw errors.validation(err instanceof Error ? err.message : String(err));
  }
}

export interface GeneratedEnglishNews {
  titleEn: string;
  summaryEn: string;
  contentEn: string;
  slug: string;
}

/**
 * แปลงและสร้างข่าวสารภาษาอังกฤษจากข้อมูลภาษาไทยโดยใช้ Gemini API
 */
export async function generateEnglishFromThaiNews(params: {
  apiKey: string;
  model?: string;
  titleTh: string;
  summaryTh?: string;
  contentTh: string;
}): Promise<GeneratedEnglishNews> {
  const cleanKey = params.apiKey.trim();
  if (!cleanKey) {
    throw errors.validation("ยังไม่ได้กำหนด Gemini API Key กรุณาไปตั้งค่าที่หน้า 'ตั้งค่าระบบ' ก่อนใช้งาน");
  }

  const selectedModel = params.model?.trim() || DEFAULT_GEMINI_MODEL;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    selectedModel,
  )}:generateContent?key=${encodeURIComponent(cleanKey)}`;

  const prompt = `You are a professional university public relations officer and bilingual journalist.
Translate and adapt the following Thai university news article into formal, natural, engaging, and professional English.

Thai Title:
${params.titleTh}

Thai Summary (Optional):
${params.summaryTh?.trim() || "(No summary provided, please compose a concise 1-2 sentence English summary based on the content)"}

Thai Full Content:
${params.contentTh}

Instructions:
1. Provide a clear, natural English headline (titleEn).
2. Provide a concise 1-2 sentence English summary (summaryEn) suitable for a news card preview.
3. Provide a complete, polished, and journalistic English full text (contentEn) conveying all details accurately. If the Thai content contains HTML markup (such as <p>, <strong>, <em>, <ul>, <ol>, <li>, <h3>, <table>, etc.), please preserve and format the English content with clean, semantic HTML structure as well.
4. Provide a URL-friendly slug (slug) in lowercase kebab-case (e.g. "annual-wai-kru-ceremony-2026") derived from the English headline without special characters.

You MUST reply ONLY with a valid JSON object matching this structure:
{
  "titleEn": "...",
  "summaryEn": "...",
  "contentEn": "...",
  "slug": "..."
}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    }),
  });

  const data = (await res.json()) as GeminiGenerateContentResponse;

  if (!res.ok || data.error) {
    const errMsg = data.error?.message || `HTTP ${res.status} ${res.statusText}`;
    if (res.status === 400 || errMsg.toLowerCase().includes("api_key")) {
      throw errors.validation("Gemini API Key ไม่ถูกต้อง หรือหมดอายุ กรุณาตรวจสอบในหน้า Settings");
    }
    if (res.status === 429) {
      throw errors.rate_limited("โควตาการเรียกใช้งาน Gemini API เต็มชั่วคราว กรุณารอสักครู่แล้วลองใหม่");
    }
    if (errMsg.includes("not found") || errMsg.includes("no longer available")) {
      throw errors.validation(`โมเดล ${selectedModel} ไม่เปิดให้ใช้งานแล้ว กรุณาไปที่หน้า 'ตั้งค่าระบบ' และเปลี่ยนเป็น 'Gemini 3.6 Flash' หรือ 'Gemini Flash'`);
    }
    throw errors.validation(`การเรียกใช้ Gemini API ล้มเหลว: ${errMsg}`);
  }

  const rawJsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawJsonText) {
    throw errors.validation("Gemini API ไม่ได้ส่งคืนเนื้อหาผลลัพธ์");
  }

  try {
    const parsed = JSON.parse(rawJsonText);
    return {
      titleEn: String(parsed.titleEn || "").trim(),
      summaryEn: String(parsed.summaryEn || "").trim(),
      contentEn: String(parsed.contentEn || "").trim(),
      slug: String(parsed.slug || "")
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/--+/g, "-"),
    };
  } catch {
    throw errors.validation("รูปแบบผลลัพธ์จาก Gemini API ไม่ตรงกับโครงสร้าง JSON ที่ต้องการ");
  }
}
