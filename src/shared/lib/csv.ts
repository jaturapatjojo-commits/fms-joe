/**
 * CSV utility functions complying with RFC 4180.
 * Supports UTF-8 BOM (\uFEFF) for seamless Thai language rendering in Microsoft Excel.
 */

export const UTF8_BOM = "\uFEFF";

/**
 * Escapes a cell value according to RFC 4180:
 * - If value contains commas, quotes, or newlines, wrap in quotes and escape internal quotes by doubling them ("").
 */
export function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) {
    return "";
  }
  const str = String(val);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Serializes headers and rows into an RFC 4180 CSV string with UTF-8 BOM.
 */
export function serializeCsv(
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][],
): string {
  const headerLine = headers.map(escapeCsvCell).join(",");
  const dataLines = rows.map((row) => row.map(escapeCsvCell).join(","));
  return `${UTF8_BOM}${headerLine}\r\n${dataLines.join("\r\n")}${dataLines.length > 0 ? "\r\n" : ""}`;
}

/**
 * Parses an RFC 4180 CSV string into a 2D array of strings.
 * Handles UTF-8 BOM, quoted fields, escaped quotes (""), and multiline fields.
 */
export function parseCsv(text: string): string[][] {
  let input = text;
  if (input.startsWith(UTF8_BOM)) {
    input = input.slice(UTF8_BOM.length);
  }

  const result: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const nextChar = input[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++; // Skip the escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        currentRow.push(currentField.trim());
        currentField = "";
      } else if (char === "\r" || char === "\n") {
        if (char === "\r" && nextChar === "\n") {
          i++; // Handle CRLF
        }
        currentRow.push(currentField.trim());
        // Only push non-empty rows or rows with more than 1 field
        if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== "")) {
          result.push(currentRow);
        }
        currentRow = [];
        currentField = "";
      } else {
        currentField += char;
      }
    }
  }

  // Handle remaining field/row after EOF
  if (currentField !== "" || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== "")) {
      result.push(currentRow);
    }
  }

  return result;
}

/**
 * Triggers a browser file download for a CSV string.
 */
export function downloadCsv(filename: string, content: string): void {
  if (typeof window === "undefined") return;

  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
