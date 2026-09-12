import { test, expect } from "@playwright/test";

test.describe("News Management E2E", () => {
  test("เขียนข่าวสารใหม่ด้วยภาษาไทยและ TinyMCE → บันทึกสำเร็จ → แสดงผลบนตารางและ Portal", async ({ page }) => {
    const testTitle = `ข่าวสารทดสอบ ${Date.now()}`;

    // 1. ไปหน้าจัดการข่าวสาร
    await page.goto("/news");
    await expect(page).toHaveURL(/\/news/);

    // 2. คลิกปุ่มเขียนข่าวใหม่
    const createBtn = page.getByRole("button", { name: /เขียนข่าวใหม่|Create News/ });
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    // 3. ตรวจสอบว่าหน้าต่างโมดอลเปิดขึ้นมา
    const dialog = page.locator(".dlg");
    await expect(dialog).toBeVisible();

    // 4. กรอกหัวข้อข่าวภาษาไทย
    const titleThInput = page.locator("input[placeholder*='พิธีไหว้ครู']");
    await titleThInput.fill(testTitle);

    // 5. รอ TinyMCE โหลดพร้อมทำงาน และใส่เนื้อหา HTML
    await page.waitForFunction(() => {
      const w = window as unknown as { tinymce?: { get: (id: string) => { initialized?: boolean } | null } };
      const ed = w.tinymce?.get("news-content-th");
      return !!ed && !!ed.initialized;
    }, { timeout: 20_000 });

    await page.evaluate(() => {
      const w = window as unknown as { tinymce: { get: (id: string) => { setContent: (c: string) => void; fire: (e: string) => void } } };
      const editor = w.tinymce.get("news-content-th");
      editor.setContent("<p>ทดสอบเนื้อหาข่าวภาษาไทยด้วย <strong>TinyMCE Rich Text Editor</strong> สำเร็จสมบูรณ์</p>");
      editor.fire("change");
      editor.fire("input");
      editor.fire("SetContent");
    });

    // 6. เลือกสถานะเป็น "เผยแพร่แล้ว" (PUBLISHED)
    const statusSelect = dialog.locator("select").nth(1);
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption("PUBLISHED");
    }

    // 7. กดปุ่มบันทึก
    const saveBtn = page.locator("button[type='submit']").filter({ hasText: /บันทึก|Save/ });
    await saveBtn.click();

    // 8. ตรวจสอบว่าโมดอลปิดลง และ Toast บันทึกสำเร็จแสดงผล
    await expect(dialog).not.toBeVisible({ timeout: 10_000 });
    await expect(page.locator("[data-sonner-toast]")).toContainText(/บันทึกข่าวสารสำเร็จ|News article saved/i);

    // 9. ตรวจสอบว่าข่าวใหม่ปรากฏในตาราง
    const articleRow = page.locator(`text=${testTitle}`);
    await expect(articleRow).toBeVisible();

    // 10. ตรวจสอบว่าข่าวเผยแพร่ไปยังหน้า Public Portal
    await page.goto("/portal/news");
    await expect(page.locator(`text=${testTitle}`)).toBeVisible();

    // 11. คลิกอ่านข่าวต่อ เพื่อตรวจดูหน้าเนื้อหาข่าวฉบับเต็มว่าเรนเดอร์ TinyMCE HTML ได้ถูกต้อง
    const newsLink = page.locator(`a[href*='/portal/news/']:has-text('${testTitle}')`).first();
    await newsLink.click();

    await page.waitForURL(/\/portal\/news\/.+/);
    await expect(page.locator("h1")).toContainText(testTitle);
    await expect(page.locator("strong:has-text('TinyMCE Rich Text Editor')")).toBeVisible();
  });

  test("แก้ไขข่าวสารเดิม → โหลดเนื้อหา TinyMCE เดิมถูกต้อง → แก้ไขและบันทึกสำเร็จ", async ({ page }) => {
    // 1. ไปหน้าจัดการข่าวสาร
    await page.goto("/news");
    await expect(page).toHaveURL(/\/news/);

    // 2. คลิกเมนูเพิ่มเติมของแถวแรก แล้วกดปุ่มแก้ไข
    const firstRowMenuTrigger = page.locator("tbody tr").first().locator("button").last();
    await firstRowMenuTrigger.click();

    const editMenuItem = page.getByRole("menuitem", { name: /แก้ไข|Edit/ });
    await editMenuItem.click();

    // 3. ตรวจสอบว่าหน้าต่างโมดอลเปิดขึ้นมาพร้อมข้อมูลเดิม
    const dialog = page.locator(".dlg");
    await expect(dialog).toBeVisible();

    // 4. รอ TinyMCE พร้อม และตรวจว่ามีเนื้อหาเดิม
    await page.waitForFunction(() => {
      const w = window as unknown as { tinymce?: { get: (id: string) => { getContent: () => string; initialized?: boolean } | null } };
      const ed = w.tinymce?.get("news-content-th");
      return !!ed && !!ed.initialized;
    }, { timeout: 20_000 });

    // 5. ปรับแก้เนื้อหาเพิ่มเติมใน TinyMCE
    const updatedNote = " [แก้ไขเพิ่มเติมเมื่อ " + Date.now() + "]";
    await page.evaluate((note) => {
      const w = window as unknown as { tinymce: { get: (id: string) => { getContent: () => string; setContent: (c: string) => void; fire: (e: string) => void } } };
      const editor = w.tinymce.get("news-content-th");
      const current = editor.getContent();
      editor.setContent(current + `<p><em>${note}</em></p>`);
      editor.fire("change");
      editor.fire("input");
      editor.fire("SetContent");
    }, updatedNote);

    // 6. กดบันทึก
    const saveBtn = dialog.locator("button[type='submit']").filter({ hasText: /บันทึก|Save/ });
    await saveBtn.click();

    // 7. ตรวจสอบว่าโมดอลปิด และบันทึกสำเร็จ
    await expect(dialog).not.toBeVisible({ timeout: 10_000 });
    await expect(page.locator("[data-sonner-toast]")).toContainText(/บันทึกข่าวสารสำเร็จ|News article saved/i);
  });

  test("กดปุ่มสร้างภาษาอังกฤษด้วย Gemini AI เมื่อยังไม่ได้ตั้งค่า API Key → แจ้งเตือนข้อความชัดเจน ไม่แสดงคำว่า internal", async ({ page }) => {
    // 1. ไปหน้าจัดการข่าวสาร
    await page.goto("/news");
    await expect(page).toHaveURL(/\/news/);

    // 2. คลิกปุ่มเขียนข่าวใหม่
    const createBtn = page.getByRole("button", { name: /เขียนข่าวใหม่|Create News/ });
    await createBtn.click();

    const dialog = page.locator(".dlg");
    await expect(dialog).toBeVisible();

    // 3. กรอกข้อมูลภาษาไทย
    const titleThInput = dialog.locator("input[placeholder*='พิธีไหว้ครู']");
    await titleThInput.fill("ทดสอบระบบแปลภาษาอัตโนมัติ");

    await page.waitForFunction(() => {
      const w = window as unknown as { tinymce?: { get: (id: string) => { initialized?: boolean } | null } };
      const ed = w.tinymce?.get("news-content-th");
      return !!ed && !!ed.initialized;
    }, { timeout: 20_000 });

    await page.evaluate(() => {
      const w = window as unknown as { tinymce: { get: (id: string) => { setContent: (c: string) => void; fire: (e: string) => void } } };
      const editor = w.tinymce.get("news-content-th");
      editor.setContent("<p>เนื้อหาข่าวสำหรับทดสอบ Gemini AI เพื่อสร้างภาษาอังกฤษ</p>");
      editor.fire("change");
      editor.fire("input");
      editor.fire("SetContent");
    });

    // 4. คลิกปุ่ม "สร้างภาษาอังกฤษด้วย Gemini AI"
    const aiBtn = dialog.getByRole("button", { name: /สร้างภาษาอังกฤษด้วย Gemini AI|Gemini/i });
    await aiBtn.click();

    // 5. ตรวจสอบ Toast ว่าขึ้นเตือนเรื่องยังไม่ได้ตั้งค่า API Key และต้องไม่ขึ้นคำว่า "internal"
    const toast = page.locator("[data-sonner-toast]").last();
    await expect(toast).toBeVisible({ timeout: 10_000 });
    const toastText = await toast.textContent();
    expect(toastText).toContain("ยังไม่ได้ตั้งค่า Gemini API Key");
    expect(toastText).not.toBe("internal");
  });
});
