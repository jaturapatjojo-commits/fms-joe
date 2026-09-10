"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, Globe, Users, AlertCircle, Mail, Phone } from "lucide-react";
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
  RowMenuItem,
  type DataTableColumn,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { StaffMemberDto, DepartmentDto } from "@/features/staff";
import {
  createStaffMemberAction,
  updateStaffMemberAction,
  deleteStaffMemberAction,
} from "@/features/staff/actions";

interface Props {
  initialStaff: StaffMemberDto[];
  departments: DepartmentDto[];
  canManage: boolean;
}

export function StaffAdminClient({
  initialStaff,
  departments,
  canManage,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const [staff, setStaff] = useState<StaffMemberDto[]>(initialStaff);
  const [isPending, startTransition] = useTransition();

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<StaffMemberDto | null>(null);
  const [editingItem, setEditingItem] = useState<StaffMemberDto | null>(null);

  // Form states
  const [prefixTh, setPrefixTh] = useState("");
  const [prefixEn, setPrefixEn] = useState("");
  const [firstNameTh, setFirstNameTh] = useState("");
  const [lastNameTh, setLastNameTh] = useState("");
  const [firstNameEn, setFirstNameEn] = useState("");
  const [lastNameEn, setLastNameEn] = useState("");
  const [academicPosition, setAcademicPosition] = useState("");
  const [adminPosition, setAdminPosition] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  const openCreateDialog = () => {
    setEditingItem(null);
    setPrefixTh("อ.");
    setPrefixEn("Aj.");
    setFirstNameTh("");
    setLastNameTh("");
    setFirstNameEn("");
    setLastNameEn("");
    setAcademicPosition("");
    setAdminPosition("");
    setDepartmentId("");
    setEmail("");
    setPhone("");
    setRoomNumber("");
    setAvatarUrl("");
    setSortOrder(0);
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditDialog = (item: StaffMemberDto) => {
    setEditingItem(item);
    setPrefixTh(item.prefixTh);
    setPrefixEn(item.prefixEn);
    setFirstNameTh(item.firstNameTh);
    setLastNameTh(item.lastNameTh);
    setFirstNameEn(item.firstNameEn);
    setLastNameEn(item.lastNameEn);
    setAcademicPosition(item.academicPosition ?? "");
    setAdminPosition(item.adminPosition ?? "");
    setDepartmentId(item.departmentId ?? "");
    setEmail(item.email ?? "");
    setPhone(item.phone ?? "");
    setRoomNumber(item.roomNumber ?? "");
    setAvatarUrl(item.avatarUrl ?? "");
    setSortOrder(item.sortOrder);
    setIsActive(item.isActive);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const payload = {
        prefixTh,
        prefixEn,
        firstNameTh,
        lastNameTh,
        firstNameEn,
        lastNameEn,
        academicPosition: academicPosition || null,
        adminPosition: adminPosition || null,
        departmentId: departmentId || null,
        email: email || null,
        phone: phone || null,
        roomNumber: roomNumber || null,
        avatarUrl: avatarUrl || null,
        education: [],
        expertise: [],
        sortOrder,
        isActive,
      };

      if (editingItem) {
        const res = await updateStaffMemberAction({ id: editingItem.id, ...payload });
        if (res.ok) {
          toast.success(t("staff.saveSuccess"));
          setStaff((prev) =>
            prev.map((s) => (s.id === editingItem.id ? { ...s, ...res.data } : s)),
          );
          setModalOpen(false);
        } else {
          toast.error(res.error.message);
        }
      } else {
        const res = await createStaffMemberAction(payload);
        if (res.ok) {
          toast.success(t("staff.saveSuccess"));
          setStaff((prev) => [...prev, res.data]);
          setModalOpen(false);
        } else {
          toast.error(res.error.message);
        }
      }
    });
  };

  const handleDelete = () => {
    if (!deleteConfirmItem) return;
    startTransition(async () => {
      const res = await deleteStaffMemberAction(deleteConfirmItem.id);
      if (res.ok) {
        toast.success(t("staff.deleteSuccess"));
        setStaff((prev) => prev.filter((s) => s.id !== deleteConfirmItem.id));
        setDeleteConfirmItem(null);
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const columns: DataTableColumn<StaffMemberDto>[] = [
    {
      key: "name",
      header: t("staff.nameTh"),
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.avatarUrl}
              alt={row.firstNameTh}
              className="h-9 w-9 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
              {row.firstNameTh.charAt(0)}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-medium text-foreground">
              {locale === "en"
                ? `${row.prefixEn} ${row.firstNameEn} ${row.lastNameEn}`
                : `${row.prefixTh} ${row.firstNameTh} ${row.lastNameTh}`}
            </span>
            <span className="text-xs text-muted-foreground">
              {row.adminPosition || row.academicPosition || "-"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "department",
      header: t("staff.department"),
      render: (row) => (
        <span className="text-sm">
          {locale === "en" ? row.departmentNameEn ?? "-" : row.departmentNameTh ?? "-"}
        </span>
      ),
    },
    {
      key: "contact",
      header: "ช่องทางติดต่อ",
      render: (row) => (
        <div className="flex flex-col text-xs text-muted-foreground gap-0.5">
          {row.email && (
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3 w-3 text-primary" />
              {row.email}
            </span>
          )}
          {row.phone && (
            <span className="inline-flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {row.phone}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: t("staff.status"),
      render: (row) => (
        <StatusPill tone={row.isActive ? "ok" : "off"}>
          {row.isActive ? t("staff.status.active") : t("staff.status.inactive")}
        </StatusPill>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("staff.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("staff.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/portal/staff"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-xs hover:bg-accent"
          >
            <Globe className="h-4 w-4" />
            หน้าเว็บสาธารณะ
          </a>
          {canManage && (
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("staff.create")}
            </Button>
          )}
        </div>
      </div>

      <DataTable
        state={staff.length > 0 ? "data" : "empty"}
        columns={columns}
        rows={staff}
        getRowId={(row) => row.id}
        headHeading={t("staff.title")}
        headMeta={`${staff.length} ท่าน`}
        empty={{
          icon: <Users aria-hidden="true" />,
          title: t("staff.empty"),
        }}
        error={{
          icon: <AlertCircle aria-hidden="true" />,
          title: t("common.error"),
        }}
        renderRowMenu={
          canManage
            ? (row) => (
                <>
                  <RowMenuItem onSelect={() => openEditDialog(row)} icon={<Edit2 className="h-4 w-4" />}>
                    {t("staff.edit")}
                  </RowMenuItem>
                  <RowMenuItem
                    onSelect={() => setDeleteConfirmItem(row)}
                    icon={<Trash2 className="h-4 w-4 text-destructive" />}
                    danger
                  >
                    {t("staff.delete")}
                  </RowMenuItem>
                </>
              )
            : undefined
        }
      />

      {/* Modal สร้าง / แก้ไขบุคลากร */}
      <LiyonDialog open={modalOpen} onOpenChange={setModalOpen}>
        <form onSubmit={handleSave}>
          <LiyonDialogHeader
            title={editingItem ? t("staff.edit") : t("staff.create")}
            description={t("staff.subtitle")}
          />
          <LiyonDialogBody className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <LiyonField label={t("staff.prefixTh")}>
                <input
                  type="text"
                  required
                  value={prefixTh}
                  onChange={(e) => setPrefixTh(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="เช่น ผศ.ดร., อ."
                />
              </LiyonField>
              <LiyonField label="ชื่อ (ไทย)">
                <input
                  type="text"
                  required
                  value={firstNameTh}
                  onChange={(e) => setFirstNameTh(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="สมชาย"
                />
              </LiyonField>
              <LiyonField label="นามสกุล (ไทย)">
                <input
                  type="text"
                  required
                  value={lastNameTh}
                  onChange={(e) => setLastNameTh(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="ใจดี"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <LiyonField label={t("staff.prefixEn")}>
                <input
                  type="text"
                  required
                  value={prefixEn}
                  onChange={(e) => setPrefixEn(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="e.g. Asst.Prof.Dr., Mr."
                />
              </LiyonField>
              <LiyonField label="First Name (EN)">
                <input
                  type="text"
                  required
                  value={firstNameEn}
                  onChange={(e) => setFirstNameEn(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Somchai"
                />
              </LiyonField>
              <LiyonField label="Last Name (EN)">
                <input
                  type="text"
                  required
                  value={lastNameEn}
                  onChange={(e) => setLastNameEn(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Jaidee"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiyonField label={t("staff.department")}>
                <LiyonSelect
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                >
                  <option value="">{t("staff.allDepartments")}</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {locale === "en" ? d.nameEn : d.nameTh}
                    </option>
                  ))}
                </LiyonSelect>
              </LiyonField>

              <LiyonField label={t("staff.adminPosition")}>
                <input
                  type="text"
                  value={adminPosition}
                  onChange={(e) => setAdminPosition(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="เช่น คณบดี, รองคณบดีฝ่ายวิชาการ"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <LiyonField label={t("staff.email")}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="teacher@mcu.ac.th"
                />
              </LiyonField>

              <LiyonField label={t("staff.phone")}>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="035-248-xxx"
                />
              </LiyonField>

              <LiyonField label={t("staff.roomNumber")}>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="ห้อง 302 อาคารเรียนรวม"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiyonField label={t("staff.avatarUrl")}>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="https://images.unsplash.com/..."
                />
              </LiyonField>

              <LiyonField label={t("staff.sortOrder")} hint="ตัวเลขน้อยจะแสดงก่อน">
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </LiyonField>
            </div>
          </LiyonDialogBody>
          <LiyonDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={isPending}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {t("common.save")}
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>

      {/* Modal ยืนยันการลบ */}
      <LiyonDialog open={!!deleteConfirmItem} onOpenChange={() => setDeleteConfirmItem(null)}>
        <LiyonDialogHeader
          title={t("staff.delete")}
          description={t("staff.deleteConfirm")}
        />
        <LiyonDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setDeleteConfirmItem(null)}
            disabled={isPending}
          >
            {t("common.cancel")}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {t("staff.delete")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
