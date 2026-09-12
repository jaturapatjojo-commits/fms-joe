import { describe, it, expect } from "vitest";
import { serializeCsv, parseCsv, escapeCsvCell, UTF8_BOM } from "./csv";

describe("csv utility", () => {
  describe("escapeCsvCell", () => {
    it("returns empty string for null and undefined", () => {
      expect(escapeCsvCell(null)).toBe("");
      expect(escapeCsvCell(undefined)).toBe("");
    });

    it("leaves regular strings unquoted", () => {
      expect(escapeCsvCell("hello")).toBe("hello");
      expect(escapeCsvCell("สมชาย")).toBe("สมชาย");
    });

    it("quotes strings with comma, quotes, or newlines and escapes internal quotes", () => {
      expect(escapeCsvCell("hello, world")).toBe('"hello, world"');
      expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""');
      expect(escapeCsvCell("line1\nline2")).toBe('"line1\nline2"');
    });
  });

  describe("serializeCsv", () => {
    it("starts with UTF-8 BOM and serializes headers and rows correctly", () => {
      const headers = ["Name", "Email", "Role"];
      const rows = [
        ["สมชาย ใจดี", "somchai@example.com", "STAFF"],
        ['"นายก" สมศักดิ์, ผู้จัดการ', "somsak@example.com", "ADMIN"],
      ];

      const csv = serializeCsv(headers, rows);
      expect(csv.startsWith(UTF8_BOM)).toBe(true);

      const parsed = parseCsv(csv);
      expect(parsed).toEqual([
        ["Name", "Email", "Role"],
        ["สมชาย ใจดี", "somchai@example.com", "STAFF"],
        ['"นายก" สมศักดิ์, ผู้จัดการ', "somsak@example.com", "ADMIN"],
      ]);
    });
  });

  describe("parseCsv", () => {
    it("handles CRLF and LF lines", () => {
      const input = "a,b,c\r\n1,2,3\n4,5,6";
      expect(parseCsv(input)).toEqual([
        ["a", "b", "c"],
        ["1", "2", "3"],
        ["4", "5", "6"],
      ]);
    });

    it("handles quoted cells with embedded commas and quotes", () => {
      const input = 'name,notes\n"Smith, John","He said ""Hello"""';
      expect(parseCsv(input)).toEqual([
        ["name", "notes"],
        ["Smith, John", 'He said "Hello"'],
      ]);
    });

    it("handles BOM correctly", () => {
      const input = `${UTF8_BOM}name,role\nสมศรี,VIEWER`;
      expect(parseCsv(input)).toEqual([
        ["name", "role"],
        ["สมศรี", "VIEWER"],
      ]);
    });
  });
});
