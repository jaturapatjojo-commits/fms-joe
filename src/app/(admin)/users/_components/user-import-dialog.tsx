"use client";

import { useId, useMemo, useRef, useState, useTransition } from "react";
import { Download, Upload, FileSpreadsheet, AlertCircle, RefreshCw, X, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
  LiyonField,
  LiyonSelect,
  StatusPill,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { localizedName } from "@/shared/lib/format";
import { parseCsv, serializeCsv, downloadCsv } from "@/shared/lib/csv";
import { importUsersCsvAction } from "@/features/identity/actions";
import type { RolePick } from "./types";

interface ParsedUserRow {
  rowNum: number;
  name: string;
  email: string;
  roles: string;
  password?: string;
  status: "active" | "inactive";
  rawStatusStr?: string;
  validationStatus: "ready" | "update" | "skip" | "invalid";
  note?: string;
}

export function UserImportDialog({
  open,
  onOpenChange,
  roles,
  existingEmails,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: RolePick[];
  existingEmails: Set<string>;
  onSuccess: () => void;
}) {
  const t = useT();
  const locale = useLocale();
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [rawRows, setRawRows] = useState<{ headers: string[]; data: string[][] } | null>(null);
  const [conflictMode, setConflictMode] = useState<"skip" | "update">("skip");
  const [defaultRoleId, setDefaultRoleId] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, startTransition] = useTransition();

  // Filter assignable roles (prevent SUPER_ADMIN assignment)
  const assignableRoles = useMemo(() => roles.filter((r) => r.code !== "SUPER_ADMIN"), [roles]);
  const defaultRoleFallback = assignableRoles.find((r) => r.code === "VIEWER")?.id ?? assignableRoles[0]?.id ?? "";
  const effectiveDefaultRoleId = defaultRoleId || defaultRoleFallback;

  // Handle downloading sample template CSV
  function handleDownloadTemplate() {
    const headers = ["name", "email", "roles", "password", "status"];
    const sampleRows = [
      ["สมชาย ใจดี", "somchai.j@example.com", "STAFF", "Passw0rd!123", "active"],
      ["สมศรี มีสุข", "somsri.m@example.com", "VIEWER", "", "active"],
    ];
    downloadCsv("users-template.csv", serializeCsv(headers, sampleRows));
  }

  // Parse CSV file content
  async function processFile(uploadedFile: File) {
    if (!uploadedFile.name.toLowerCase().endsWith(".csv")) {
      toast.error(t("users.dropzoneHint"));
      return;
    }
    setFile(uploadedFile);
    try {
      const text = await uploadedFile.text();
      const rows = parseCsv(text);
      if (rows.length < 2) {
        toast.error(t("users.importNoValidRows"));
        setRawRows(null);
        return;
      }
      const [headers, ...data] = rows;
      setRawRows({ headers, data });
    } catch {
      toast.error(t("common.error"));
      setRawRows(null);
    }
  }

  // Map and validate rows based on current settings
  const parsedRows: ParsedUserRow[] = useMemo(() => {
    if (!rawRows || rawRows.data.length === 0) return [];

    const { headers, data } = rawRows;
    const lowerHeaders = headers.map((h) => h.toLowerCase().trim());

    // Resolve column indexes supporting English and Thai header names
    const nameIdx = lowerHeaders.findIndex((h) => h === "name" || h.includes("ชื่อ"));
    const emailIdx = lowerHeaders.findIndex((h) => h === "email" || h.includes("อีเมล"));
    const rolesIdx = lowerHeaders.findIndex((h) => h === "roles" || h === "role" || h.includes("บทบาท"));
    const passwordIdx = lowerHeaders.findIndex((h) => h === "password" || h.includes("รหัสผ่าน"));
    const statusIdx = lowerHeaders.findIndex((h) => h === "status" || h.includes("สถานะ"));

    const seenEmailsInFile = new Set<string>();

    return data.map((cols, idx) => {
      const rowNum = idx + 2;
      const name = nameIdx !== -1 && cols[nameIdx] ? cols[nameIdx].trim() : "";
      const email = emailIdx !== -1 && cols[emailIdx] ? cols[emailIdx].trim().toLowerCase() : "";
      const rolesStr = rolesIdx !== -1 && cols[rolesIdx] ? cols[rolesIdx].trim() : "";
      const password = passwordIdx !== -1 && cols[passwordIdx] ? cols[passwordIdx].trim() : "";
      const rawStatus = statusIdx !== -1 && cols[statusIdx] ? cols[statusIdx].trim().toLowerCase() : "";
      const status: "active" | "inactive" = rawStatus === "inactive" || rawStatus === "ระงับ" ? "inactive" : "active";

      let validationStatus: "ready" | "update" | "skip" | "invalid" = "ready";
      let note = "";

      if (!name) {
        validationStatus = "invalid";
        note = t("users.errNameRequired");
      } else if (!email) {
        validationStatus = "invalid";
        note = t("users.errEmailRequired");
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        validationStatus = "invalid";
        note = t("users.errEmailInvalid");
      } else if (seenEmailsInFile.has(email)) {
        validationStatus = "invalid";
        note = t("users.errDuplicateInCsv");
      } else if (password && password.length < 8) {
        validationStatus = "invalid";
        note = t("users.errPasswordTooShort");
      } else if (existingEmails.has(email)) {
        if (conflictMode === "update") {
          validationStatus = "update";
        } else {
          validationStatus = "skip";
          note = t("users.statusSkip");
        }
      }

      if (email) seenEmailsInFile.add(email);

      return {
        rowNum,
        name,
        email,
        roles: rolesStr,
        password: password || undefined,
        status,
        rawStatusStr: rawStatus,
        validationStatus,
        note,
      };
    });
  }, [rawRows, existingEmails, conflictMode, t]);

  const validRows = useMemo(
    () => parsedRows.filter((r) => r.validationStatus === "ready" || r.validationStatus === "update"),
    [parsedRows],
  );

  function resetFile() {
    setFile(null);
    setRawRows(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleImportSubmit() {
    if (validRows.length === 0) return;

    startTransition(async () => {
      const payloadRows = validRows.map((r) => ({
        name: r.name,
        email: r.email,
        roles: r.roles || "",
        password: r.password || "",
        status: r.status,
      }));

      const res = await importUsersCsvAction({
        rows: payloadRows,
        conflictMode,
        defaultRoleId: effectiveDefaultRoleId || undefined,
      });

      if (!res.ok) {
        toast.error(res.error.message || t("common.error"));
        return;
      }

      const { created, updated, skipped, errors } = res.data;
      if (errors.length === 0) {
        toast.success(t("users.importDoneTitle"), {
          description: t("users.importDoneDesc", {
            created,
            updated,
            skipped,
            failed: 0,
          }),
        });
      } else {
        toast.warning(t("users.importDoneTitle"), {
          description: t("users.importDoneDesc", {
            created,
            updated,
            skipped,
            failed: errors.length,
          }),
        });
      }

      onSuccess();
      onOpenChange(false);
      resetFile();
    });
  }

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange} wide className="max-w-3xl">
      <LiyonDialogCloseButton label={t("common.close")} />
      <LiyonDialogHeader title={t("users.importTitle")} description={t("users.importDesc")} />
      <LiyonDialogBody>
        <div className="flex flex-col gap-5">
          {/* Header Action: Download Template Button */}
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileSpreadsheet className="h-4 w-4 text-primary" />
              <span>{t("users.downloadTemplate")}</span>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleDownloadTemplate} className="gap-1.5 h-8">
              <Download className="h-3.5 w-3.5" />
              {t("users.downloadTemplate")}
            </Button>
          </div>

          {/* Upload Dropzone */}
          {!file ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files?.[0]) {
                  void processFile(e.dataTransfer.files[0]);
                }
              }}
              className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-sm">{t("users.dropzoneTitle")}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("users.dropzoneHint")}</p>
              </div>
              <input
                id={fileInputId}
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    void processFile(e.target.files[0]);
                  }
                }}
              />
              <label
                htmlFor={fileInputId}
                className="inline-flex items-center justify-center rounded-md text-xs font-medium px-3 py-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer mt-2"
              >
                {t("common.chooseFile")}
              </label>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("users.selectedFile", { filename: file.name, count: parsedRows.length })}
                  </p>
                </div>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={resetFile} className="gap-1 text-xs text-destructive hover:text-destructive">
                <X className="h-3.5 w-3.5" />
                {t("users.changeFile")}
              </Button>
            </div>
          )}

          {/* Import Settings */}
          {file && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg border border-border/60 p-4 bg-card/40">
              <LiyonField label={t("users.conflictLabel")}>
                <LiyonSelect
                  value={conflictMode}
                  onChange={(e) => setConflictMode(e.target.value as "skip" | "update")}
                >
                  <option value="skip">{t("users.conflictSkip")}</option>
                  <option value="update">{t("users.conflictUpdate")}</option>
                </LiyonSelect>
              </LiyonField>

              <LiyonField label={t("users.defaultRoleLabel")}>
                <LiyonSelect
                  value={effectiveDefaultRoleId}
                  onChange={(e) => setDefaultRoleId(e.target.value)}
                >
                  {assignableRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {localizedName(role, locale)} ({role.code})
                    </option>
                  ))}
                </LiyonSelect>
              </LiyonField>
            </div>
          )}

          {/* Preview Table */}
          {parsedRows.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span className="font-semibold text-foreground">
                  {t("users.previewTitle", { valid: validRows.length, total: parsedRows.length })}
                </span>
                <span className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1"><StatusPill tone="ok">{t("users.statusReady")}</StatusPill></span>
                  {conflictMode === "update" && <span className="inline-flex items-center gap-1"><StatusPill tone="info">{t("users.statusUpdate")}</StatusPill></span>}
                  {conflictMode === "skip" && <span className="inline-flex items-center gap-1"><StatusPill tone="warn">{t("users.statusSkip")}</StatusPill></span>}
                  <span className="inline-flex items-center gap-1"><StatusPill tone="bad">{t("users.statusInvalid")}</StatusPill></span>
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto rounded-lg border border-border">
                <table className="w-full text-xs text-left">
                  <thead className="sticky top-0 bg-muted/90 backdrop-blur-sm border-b border-border text-muted-foreground">
                    <tr>
                      <th className="py-2 px-3 font-semibold w-12">{t("users.colRow")}</th>
                      <th className="py-2 px-3 font-semibold w-28">{t("users.colStatus")}</th>
                      <th className="py-2 px-3 font-semibold">{t("users.name")}</th>
                      <th className="py-2 px-3 font-semibold">{t("users.email")}</th>
                      <th className="py-2 px-3 font-semibold">{t("users.roles")}</th>
                      <th className="py-2 px-3 font-semibold">{t("users.colNotes")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {parsedRows.map((r) => {
                      const tone =
                        r.validationStatus === "ready"
                          ? "ok"
                          : r.validationStatus === "update"
                            ? "info"
                            : r.validationStatus === "skip"
                              ? "warn"
                              : "bad";
                      const statusLabel =
                        r.validationStatus === "ready"
                          ? t("users.statusReady")
                          : r.validationStatus === "update"
                            ? t("users.statusUpdate")
                            : r.validationStatus === "skip"
                              ? t("users.statusSkip")
                              : t("users.statusInvalid");

                      return (
                        <tr key={r.rowNum} className={r.validationStatus === "invalid" ? "bg-destructive/5" : undefined}>
                          <td className="py-2 px-3 text-muted-foreground">{r.rowNum}</td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            <StatusPill tone={tone}>{statusLabel}</StatusPill>
                          </td>
                          <td className="py-2 px-3 font-medium text-foreground">{r.name || "-"}</td>
                          <td className="py-2 px-3 text-muted-foreground">{r.email || "-"}</td>
                          <td className="py-2 px-3 text-muted-foreground">{r.roles || "-"}</td>
                          <td className="py-2 px-3 text-xs text-muted-foreground">
                            {r.note ? (
                              <span className={r.validationStatus === "invalid" ? "text-destructive flex items-center gap-1" : ""}>
                                {r.validationStatus === "invalid" && <AlertCircle className="h-3 w-3 inline flex-none" />}
                                {r.note}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </LiyonDialogBody>

      <LiyonDialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
          {t("common.cancel")}
        </Button>
        <Button
          type="button"
          disabled={validRows.length === 0 || isSubmitting}
          onClick={handleImportSubmit}
          className="gap-2"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              {t("users.importSubmitting")}
            </>
          ) : (
            t("users.importSubmit", { n: validRows.length })
          )}
        </Button>
      </LiyonDialogFooter>
    </LiyonDialog>
  );
}
