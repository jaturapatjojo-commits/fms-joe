"use client";

import { useState, useTransition } from "react";
import { Plus, Send, CheckCircle2, XCircle, FileText, Clock, AlertCircle, Eye, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import {
  DataTable,
  StatusPill,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonField,
  LiyonSelect,
  type DataTableColumn,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { DocumentDto } from "@/features/documents";
import {
  createDocumentAction,
  submitDocumentAction,
  processApprovalAction,
} from "@/features/documents/actions";

interface Props {
  initialDocuments: DocumentDto[];
  users: { id: string; name: string; email: string }[];
  currentUserId: string;
  canManage: boolean;
  canApprove: boolean;
}

export function DocumentsAdminClient({
  initialDocuments,
  users,
  currentUserId,
  canManage,
  canApprove,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const [documents, setDocuments] = useState<DocumentDto[]>(initialDocuments);
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewDoc, setViewDoc] = useState<DocumentDto | null>(null);
  const [approvalDoc, setApprovalDoc] = useState<DocumentDto | null>(null);
  const [approvalAction, setApprovalAction] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [approvalComment, setApprovalComment] = useState("");

  // Form states
  const [docNo, setDocNo] = useState(`บันทึก/${new Date().getFullYear() + 543}/00${documents.length + 1}`);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"MEMO" | "CIRCULAR" | "ORDER" | "PETITION" | "EXPENSE">("MEMO");
  const [urgency, setUrgency] = useState<"NORMAL" | "URGENT" | "VERY_URGENT">("NORMAL");
  const [content, setContent] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [selectedApproverId, setSelectedApproverId] = useState(users[0]?.id || "");

  // Submit New Document
  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNo || !title) {
      toast.error(locale === "th" ? "กรุณาระบุเลขที่หนังสือและชื่อเรื่อง" : "Document number and title required");
      return;
    }

    startTransition(async () => {
      const res = await createDocumentAction({
        documentNo: docNo,
        title,
        category,
        urgency,
        content: content || undefined,
        fileUrl: fileUrl || undefined,
        approverIds: selectedApproverId ? [selectedApproverId] : [],
      });

      if (res.ok) {
        toast.success(t("document.saveSuccess"));
        setDocuments((prev) => [res.data, ...prev]);
        setCreateModalOpen(false);
        setTitle("");
        setContent("");
        setFileUrl("");
        setDocNo(`บันทึก/${new Date().getFullYear() + 543}/00${documents.length + 2}`);
      } else {
        toast.error(res.error.message);
      }
    });
  };

  // Submit For Approval
  const handleSubmitForApproval = (doc: DocumentDto) => {
    startTransition(async () => {
      const res = await submitDocumentAction(doc.id);
      if (res.ok) {
        toast.success(t("document.submitSuccess"));
        setDocuments((prev) => prev.map((d) => (d.id === res.data.id ? res.data : d)));
      } else {
        toast.error(res.error.message);
      }
    });
  };

  // Process Approval (Approve / Reject)
  const handleProcessApproval = () => {
    if (!approvalDoc) return;
    startTransition(async () => {
      const res = await processApprovalAction({
        documentId: approvalDoc.id,
        status: approvalAction,
        comment: approvalComment || undefined,
      });

      if (res.ok) {
        toast.success(t("document.approveSuccess"));
        setDocuments((prev) => prev.map((d) => (d.id === res.data.id ? res.data : d)));
        setApprovalDoc(null);
        setApprovalComment("");
      } else {
        toast.error(res.error.message);
      }
    });
  };

  // Columns definition
  const columns: DataTableColumn<DocumentDto>[] = [
    {
      key: "docNo",
      header: t("document.no"),
      render: (r) => (
        <div>
          <div className="font-mono text-xs font-semibold text-foreground">{r.documentNo}</div>
          <span className="text-[11px] text-muted-foreground">
            {r.category === "MEMO" && t("document.category.memo")}
            {r.category === "CIRCULAR" && t("document.category.circular")}
            {r.category === "ORDER" && t("document.category.order")}
            {r.category === "PETITION" && t("document.category.petition")}
            {r.category === "EXPENSE" && t("document.category.expense")}
          </span>
        </div>
      ),
    },
    {
      key: "title",
      header: t("document.titleField"),
      render: (r) => (
        <div>
          <div className="font-medium text-sm text-foreground hover:underline cursor-pointer" onClick={() => setViewDoc(r)}>
            {r.title}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {r.urgency === "URGENT" && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                ด่วน
              </span>
            )}
            {r.urgency === "VERY_URGENT" && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                ด่วนที่สุด
              </span>
            )}
            {r.fileUrl && (
              <a
                href={r.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-primary hover:underline flex items-center gap-0.5"
              >
                <ExternalLink className="h-3 w-3" />
                เอกสารแนบ PDF
              </a>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: t("document.status"),
      render: (r) => {
        if (r.status === "APPROVED") return <StatusPill tone="ok">{t("document.status.approved")}</StatusPill>;
        if (r.status === "IN_REVIEW") return <StatusPill tone="info">{t("document.status.in_review")}</StatusPill>;
        if (r.status === "REJECTED") return <StatusPill tone="bad">{t("document.status.rejected")}</StatusPill>;
        return <StatusPill tone="off">{t("document.status.draft")}</StatusPill>;
      },
    },
    {
      key: "actions",
      header: "",
      render: (r) => {
        const myPendingStep = r.approvals.find(
          (a) => a.approverId === currentUserId && a.status === "PENDING"
        );
        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={() => setViewDoc(r)}
            >
              <Eye className="h-3.5 w-3.5" />
              ดูเอกสาร
            </Button>

            {canManage && r.status === "DRAFT" && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs text-primary border-primary/40 hover:bg-primary/5"
                onClick={() => handleSubmitForApproval(r)}
              >
                <Send className="h-3.5 w-3.5" />
                {t("document.submit")}
              </Button>
            )}

            {canApprove && r.status === "IN_REVIEW" && myPendingStep && (
              <Button
                size="sm"
                className="h-8 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  setApprovalDoc(r);
                  setApprovalAction("APPROVED");
                }}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                ลงนามอนุมัติ
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("document.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("document.subtitle")}
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("document.create")}
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-xs font-medium text-muted-foreground">เอกสารทั้งหมด</div>
          <div className="text-2xl font-bold text-foreground mt-1">{documents.length} ฉบับ</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-xs font-medium text-blue-600">รอการพิจารณาอนุมัติ</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {documents.filter((d) => d.status === "IN_REVIEW").length} ฉบับ
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-xs font-medium text-emerald-600">อนุมัติเรียบร้อย</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {documents.filter((d) => d.status === "APPROVED").length} ฉบับ
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-xs font-medium text-rose-600">ตีกลับแก้ไข</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">
            {documents.filter((d) => d.status === "REJECTED").length} ฉบับ
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <DataTable
          state={documents.length > 0 ? "data" : "empty"}
          columns={columns}
          rows={documents}
          getRowId={(r) => r.id}
          headHeading={locale === "th" ? "ทะเบียนหนังสือและบันทึกข้อความ" : "Document Registry"}
          headMeta={`${documents.length} ฉบับ`}
          empty={{
            icon: <FileText aria-hidden="true" />,
            title: t("document.empty"),
          }}
          error={{
            icon: <AlertCircle aria-hidden="true" />,
            title: t("common.error"),
          }}
        />
      </div>

      {/* Create Document Dialog */}
      <LiyonDialog open={createModalOpen} onOpenChange={(open) => setCreateModalOpen(open)}>
        <form onSubmit={handleCreateDocument}>
          <LiyonDialogHeader title={t("document.create")} />
          <LiyonDialogBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("document.no")}>
                <input
                  required
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background border-input"
                  value={docNo}
                  onChange={(e) => setDocNo(e.target.value)}
                />
              </LiyonField>
              <LiyonField label={t("document.category")}>
                <LiyonSelect
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                >
                  <option value="MEMO">{t("document.category.memo")}</option>
                  <option value="CIRCULAR">{t("document.category.circular")}</option>
                  <option value="ORDER">{t("document.category.order")}</option>
                  <option value="PETITION">{t("document.category.petition")}</option>
                  <option value="EXPENSE">{t("document.category.expense")}</option>
                </LiyonSelect>
              </LiyonField>
            </div>

            <LiyonField label={t("document.titleField")}>
              <input
                required
                placeholder="เช่น ขออนุมัติจัดโครงการสัมมนาเชิงปฏิบัติการ..."
                className="w-full px-3 py-2 border rounded-md text-sm bg-background border-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </LiyonField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("document.urgency")}>
                <LiyonSelect
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as any)}
                >
                  <option value="NORMAL">{t("document.urgency.normal")}</option>
                  <option value="URGENT">{t("document.urgency.urgent")}</option>
                  <option value="VERY_URGENT">{t("document.urgency.very_urgent")}</option>
                </LiyonSelect>
              </LiyonField>

              <LiyonField label="ผู้พิจารณาอนุมัติ (Approver)">
                <LiyonSelect
                  value={selectedApproverId}
                  onChange={(e) => setSelectedApproverId(e.target.value)}
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </LiyonSelect>
              </LiyonField>
            </div>

            <LiyonField label="แนบไฟล์เอกสาร PDF (URL)">
              <input
                type="url"
                placeholder="https://example.com/files/memo.pdf"
                className="w-full px-3 py-2 border rounded-md text-sm bg-background border-input"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
              />
            </LiyonField>

            <LiyonField label="เนื้อหา / บันทึกข้อความ">
              <textarea
                rows={4}
                placeholder="ระบุข้อความหรือสรุปเนื้อหาสำคัญของเอกสาร..."
                className="w-full px-3 py-2 border rounded-md text-sm bg-background border-input"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </LiyonField>
          </LiyonDialogBody>
          <LiyonDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateModalOpen(false)}
              disabled={isPending}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "กำลังบันทึก..." : "บันทึกร่างเอกสาร"}
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>

      {/* View Document Details Dialog */}
      <LiyonDialog open={!!viewDoc} onOpenChange={() => setViewDoc(null)}>
        <LiyonDialogHeader title={viewDoc?.title || "รายละเอียดเอกสาร"} />
        <LiyonDialogBody className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-xs bg-muted/40 p-3 rounded-lg border border-border">
            <div>
              <span className="text-muted-foreground">เลขที่หนังสือ:</span>{" "}
              <strong className="text-foreground font-mono">{viewDoc?.documentNo}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">สถานะ:</span>{" "}
              <strong className="text-foreground">{viewDoc?.status}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">ประเภท:</span>{" "}
              <strong className="text-foreground">{viewDoc?.category}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">ระดับความเร็ว:</span>{" "}
              <strong className="text-foreground">{viewDoc?.urgency}</strong>
            </div>
          </div>

          {viewDoc?.content && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-1">เนื้อหาบันทึก:</h4>
              <p className="text-sm bg-background p-3 rounded-lg border border-border whitespace-pre-wrap">
                {viewDoc.content}
              </p>
            </div>
          )}

          {/* Sequential Approvals History */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">สายการพิจารณาอนุมัติ:</h4>
            <div className="space-y-2">
              {viewDoc?.approvals.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">ยังไม่ได้กำหนดสายการอนุมัติ</p>
              ) : (
                viewDoc?.approvals.map((step) => (
                  <div
                    key={step.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                        {step.stepOrder}
                      </span>
                      <span>ลำดับพิจารณาที่ {step.stepOrder}</span>
                    </div>
                    <div>
                      {step.status === "APPROVED" && (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> อนุมัติแล้ว
                        </span>
                      )}
                      {step.status === "PENDING" && (
                        <span className="text-amber-600 font-semibold flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> รอพิจารณา
                        </span>
                      )}
                      {step.status === "REJECTED" && (
                        <span className="text-rose-600 font-semibold flex items-center gap-1">
                          <XCircle className="h-3.5 w-3.5" /> ตีกลับ
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button variant="outline" onClick={() => setViewDoc(null)}>
            ปิดหน้าต่าง
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Approve / Reject Dialog */}
      <LiyonDialog open={!!approvalDoc} onOpenChange={() => setApprovalDoc(null)}>
        <LiyonDialogHeader title="พิจารณาลงนามเอกสาร" />
        <LiyonDialogBody className="space-y-4">
          <p className="text-sm">
            เอกสาร: <strong>{approvalDoc?.title}</strong> ({approvalDoc?.documentNo})
          </p>
          <LiyonField label="ผลการพิจารณา">
            <LiyonSelect
              value={approvalAction}
              onChange={(e) => setApprovalAction(e.target.value as any)}
            >
              <option value="APPROVED">ลงนามอนุมัติ (Approve)</option>
              <option value="REJECTED">ตีกลับแก้ไข / ไม่อนุมัติ (Reject)</option>
            </LiyonSelect>
          </LiyonField>

          <LiyonField label="ความเห็น / คำสั่งการเพิ่มเติม">
            <textarea
              rows={3}
              placeholder="ระบุข้อคิดเห็นหรือเงื่อนไขการอนุมัติ..."
              className="w-full px-3 py-2 border rounded-md text-sm bg-background border-input"
              value={approvalComment}
              onChange={(e) => setApprovalComment(e.target.value)}
            />
          </LiyonField>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button variant="outline" onClick={() => setApprovalDoc(null)} disabled={isPending}>
            ยกเลิก
          </Button>
          <Button
            variant={approvalAction === "APPROVED" ? "default" : "destructive"}
            onClick={handleProcessApproval}
            disabled={isPending}
          >
            {isPending ? "กำลังบันทึก..." : "ยืนยันผลการพิจารณา"}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
