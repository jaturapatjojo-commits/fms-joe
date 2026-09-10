"use client";

import { useState, useTransition } from "react";
import { Plus, Check, X, Calendar, Clock, MapPin, Users, Ban, Car, DoorOpen, CalendarCheck, AlertCircle } from "lucide-react";
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
import type { ResourceDto, ReservationDto } from "@/features/reservations";
import {
  createReservationAction,
  approveReservationAction,
  cancelReservationAction,
  createResourceAction,
} from "@/features/reservations/actions";

interface Props {
  initialResources: ResourceDto[];
  initialReservations: ReservationDto[];
  canManage: boolean;
  canApprove: boolean;
}

export function ReservationsAdminClient({
  initialResources,
  initialReservations,
  canManage,
  canApprove,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const [resources, setResources] = useState<ResourceDto[]>(initialResources);
  const [reservations, setReservations] = useState<ReservationDto[]>(initialReservations);
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [decisionModalItem, setDecisionModalItem] = useState<ReservationDto | null>(null);
  const [cancelModalItem, setCancelModalItem] = useState<ReservationDto | null>(null);
  const [decisionType, setDecisionType] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [rejectReason, setRejectReason] = useState("");

  // New Booking Form states
  const [selectedResourceId, setSelectedResourceId] = useState(resources[0]?.id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [passengerCount, setPassengerCount] = useState<number | "">("");
  const [destination, setDestination] = useState("");

  // New Resource Form states
  const [resType, setResType] = useState<"ROOM" | "VEHICLE">("ROOM");
  const [resNameTh, setResNameTh] = useState("");
  const [resNameEn, setResNameEn] = useState("");
  const [resCapacity, setResCapacity] = useState<number>(20);
  const [resLocation, setResLocation] = useState("");
  const [resDetails, setResDetails] = useState("");
  const [resImageUrl, setResImageUrl] = useState("");

  const selectedResource = resources.find((r) => r.id === selectedResourceId);

  // Submit Booking
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResourceId || !title || !startTime || !endTime) {
      toast.error(locale === "th" ? "กรุณากรอกข้อมูลสำคัญให้ครบถ้วน" : "Please fill in all required fields");
      return;
    }

    startTransition(async () => {
      const res = await createReservationAction({
        resourceId: selectedResourceId,
        title,
        description: description || undefined,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        passengerCount: passengerCount ? Number(passengerCount) : undefined,
        destination: destination || undefined,
      });

      if (res.ok) {
        toast.success(t("reservation.saveSuccess"));
        setReservations((prev) => [res.data, ...prev]);
        setBookingModalOpen(false);
        setTitle("");
        setDescription("");
        setStartTime("");
        setEndTime("");
        setPassengerCount("");
        setDestination("");
      } else {
        toast.error(res.error.message);
      }
    });
  };

  // Submit Decision (Approve / Reject)
  const handleDecisionSubmit = () => {
    if (!decisionModalItem) return;
    startTransition(async () => {
      const res = await approveReservationAction({
        id: decisionModalItem.id,
        status: decisionType,
        rejectReason: decisionType === "REJECTED" ? rejectReason : undefined,
      });

      if (res.ok) {
        toast.success(t("reservation.approveSuccess"));
        setReservations((prev) =>
          prev.map((r) => (r.id === res.data.id ? res.data : r))
        );
        setDecisionModalItem(null);
        setRejectReason("");
      } else {
        toast.error(res.error.message);
      }
    });
  };

  // Submit Cancellation
  const handleCancelSubmit = () => {
    if (!cancelModalItem) return;
    startTransition(async () => {
      const res = await cancelReservationAction(cancelModalItem.id);
      if (res.ok) {
        toast.success(locale === "th" ? "ยกเลิกคำขอเรียบร้อย" : "Reservation cancelled");
        setReservations((prev) =>
          prev.map((r) => (r.id === cancelModalItem.id ? { ...r, status: "CANCELLED" } : r))
        );
        setCancelModalItem(null);
      } else {
        toast.error(res.error.message);
      }
    });
  };

  // Submit New Resource
  const handleResourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resNameTh) {
      toast.error(locale === "th" ? "กรุณาระบุชื่อทรัพยากร" : "Resource name required");
      return;
    }
    startTransition(async () => {
      const res = await createResourceAction({
        resourceType: resType,
        nameTh: resNameTh,
        nameEn: resNameEn || undefined,
        capacity: Number(resCapacity),
        location: resLocation || undefined,
        details: resDetails || undefined,
        imageUrl: resImageUrl || undefined,
        isActive: true,
      });
      if (res.ok) {
        toast.success(locale === "th" ? "เพิ่มทรัพยากรใหม่เรียบร้อย" : "Resource created");
        setResources((prev) => [...prev, res.data]);
        setResourceModalOpen(false);
        setResNameTh("");
        setResNameEn("");
        setResLocation("");
        setResDetails("");
        setResImageUrl("");
      } else {
        toast.error(res.error.message);
      }
    });
  };

  // Table Columns
  const columns: DataTableColumn<ReservationDto>[] = [
    {
      key: "resource",
      header: t("reservation.resource"),
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0">
            {r.resourceType === "VEHICLE" ? <Car className="h-4.5 w-4.5" /> : <DoorOpen className="h-4.5 w-4.5" />}
          </div>
          <div>
            <div className="font-semibold text-foreground text-sm">
              {locale === "th" ? r.resourceNameTh : r.resourceNameEn || r.resourceNameTh}
            </div>
            <span className="text-xs text-muted-foreground">
              {r.resourceType === "VEHICLE" ? t("reservation.type.vehicle") : t("reservation.type.room")}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "title",
      header: t("reservation.titleField"),
      render: (r) => (
        <div>
          <div className="font-medium text-sm text-foreground">{r.title}</div>
          {r.destination && (
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" />
              {r.destination}
            </div>
          )}
          {r.passengerCount && (
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Users className="h-3 w-3" />
              {r.passengerCount} {locale === "th" ? "คน/ที่นั่ง" : "persons"}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "schedule",
      header: locale === "th" ? "วันเวลาที่จอง" : "Schedule",
      render: (r) => {
        const start = new Date(r.startTime);
        const end = new Date(r.endTime);
        return (
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-1 font-medium text-foreground">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              {start.toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
              {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      header: t("reservation.status"),
      render: (r) => {
        if (r.status === "APPROVED") {
          return <StatusPill tone="ok">{t("reservation.status.approved")}</StatusPill>;
        }
        if (r.status === "PENDING") {
          return <StatusPill tone="warn">{t("reservation.status.pending")}</StatusPill>;
        }
        if (r.status === "REJECTED") {
          return <StatusPill tone="bad">{t("reservation.status.rejected")}</StatusPill>;
        }
        return <StatusPill tone="off">{t("reservation.status.cancelled")}</StatusPill>;
      },
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          {canApprove && r.status === "PENDING" && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs text-emerald-600 border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                onClick={() => {
                  setDecisionModalItem(r);
                  setDecisionType("APPROVED");
                }}
              >
                <Check className="h-3.5 w-3.5" />
                {t("reservation.approve")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs text-rose-600 border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                onClick={() => {
                  setDecisionModalItem(r);
                  setDecisionType("REJECTED");
                }}
              >
                <X className="h-3.5 w-3.5" />
                {t("reservation.reject")}
              </Button>
            </>
          )}
          {canManage && r.status !== "CANCELLED" && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground hover:text-destructive"
              onClick={() => setCancelModalItem(r)}
            >
              <Ban className="h-3.5 w-3.5" />
              {t("reservation.cancel")}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("reservation.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("reservation.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canManage && (
            <>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setResourceModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                {locale === "th" ? "เพิ่มห้อง/ยานพาหนะ" : "Add Resource"}
              </Button>
              <Button
                className="gap-2"
                onClick={() => setBookingModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                {t("reservation.create")}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-xs font-medium text-muted-foreground">ห้อง/ยานพาหนะทั้งหมด</div>
          <div className="text-2xl font-bold text-foreground mt-1">{resources.length} รายการ</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-xs font-medium text-amber-600">รออนุมัติ</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {reservations.filter((r) => r.status === "PENDING").length} คำขอ
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-xs font-medium text-emerald-600">อนุมัติแล้ว (ใช้งานได้)</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {reservations.filter((r) => r.status === "APPROVED").length} รายการ
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <DataTable
          state={reservations.length > 0 ? "data" : "empty"}
          columns={columns}
          rows={reservations}
          getRowId={(r) => r.id}
          headHeading={locale === "th" ? "รายการจองและขอใช้บริการ" : "Reservation Records"}
          headMeta={`${reservations.length} รายการ`}
          empty={{
            icon: <CalendarCheck aria-hidden="true" />,
            title: t("reservation.empty"),
          }}
          error={{
            icon: <AlertCircle aria-hidden="true" />,
            title: t("common.error"),
          }}
        />
      </div>

      {/* Create Booking Dialog */}
      <LiyonDialog open={bookingModalOpen} onOpenChange={(open) => setBookingModalOpen(open)}>
        <form onSubmit={handleBookingSubmit}>
          <LiyonDialogHeader title={t("reservation.create")} />
          <LiyonDialogBody className="space-y-4">
            <LiyonField label={t("reservation.resource")}>
              <LiyonSelect
                value={selectedResourceId}
                onChange={(e) => setSelectedResourceId(e.target.value)}
              >
                {resources.map((res) => (
                  <option key={res.id} value={res.id}>
                    {locale === "th" ? res.nameTh : res.nameEn || res.nameTh} ({res.resourceType === "VEHICLE" ? "ยานพาหนะ" : "ห้อง"})
                  </option>
                ))}
              </LiyonSelect>
            </LiyonField>

            <LiyonField label={t("reservation.titleField")}>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border rounded-md text-sm bg-background border-input"
                placeholder="เช่น การประชุมโครงการจัดทำแผนยุทธศาสตร์ประจำปี"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </LiyonField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("reservation.startTime")}>
                <input
                  type="datetime-local"
                  required
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background border-input"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </LiyonField>
              <LiyonField label={t("reservation.endTime")}>
                <input
                  type="datetime-local"
                  required
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background border-input"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("reservation.passengerCount")}>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background border-input"
                  placeholder="เช่น 15"
                  value={passengerCount}
                  onChange={(e) => setPassengerCount(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </LiyonField>
              {selectedResource?.resourceType === "VEHICLE" && (
                <LiyonField label={t("reservation.destination")}>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background border-input"
                    placeholder="เช่น มจร วังน้อย จ.พระนครศรีอยุธยา"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </LiyonField>
              )}
            </div>

            <LiyonField label="รายละเอียดเพิ่มเติม">
              <textarea
                rows={3}
                className="w-full px-3 py-2 border rounded-md text-sm bg-background border-input"
                placeholder="ระบุความต้องการเพิ่มเติม เช่น จำนวนไมค์, อาหารว่าง ฯลฯ"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </LiyonField>
          </LiyonDialogBody>
          <LiyonDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setBookingModalOpen(false)}
              disabled={isPending}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "กำลังบันทึก..." : "ส่งคำขอจอง"}
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>

      {/* Decision Dialog (Approve/Reject) */}
      <LiyonDialog open={!!decisionModalItem} onOpenChange={() => setDecisionModalItem(null)}>
        <LiyonDialogHeader
          title={decisionType === "APPROVED" ? t("reservation.approve") : t("reservation.reject")}
        />
        <LiyonDialogBody className="space-y-4">
          <p className="text-sm text-foreground">
            ยืนยันการ{decisionType === "APPROVED" ? "อนุมัติ" : "ปฏิเสธ"}คำขอ:{" "}
            <strong>{decisionModalItem?.title}</strong>
          </p>
          {decisionType === "REJECTED" && (
            <LiyonField label="เหตุผลที่ปฏิเสธ">
              <textarea
                rows={3}
                required
                className="w-full px-3 py-2 border rounded-md text-sm bg-background border-input"
                placeholder="โปรดระบุเหตุผล เช่น ทรัพยากรปิดซ่อมบำรุง หรือติดภารกิจสำคัญเร่งด่วน"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </LiyonField>
          )}
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button
            variant="outline"
            onClick={() => setDecisionModalItem(null)}
            disabled={isPending}
          >
            ยกเลิก
          </Button>
          <Button
            variant={decisionType === "APPROVED" ? "default" : "destructive"}
            onClick={handleDecisionSubmit}
            disabled={isPending}
          >
            {isPending ? "กำลังบันทึก..." : "ยืนยันผลการพิจารณา"}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Cancel Confirm Dialog */}
      <LiyonDialog open={!!cancelModalItem} onOpenChange={() => setCancelModalItem(null)}>
        <LiyonDialogHeader title={t("reservation.cancel")} />
        <LiyonDialogBody>
          <p className="text-sm text-muted-foreground">
            ท่านต้องการยกเลิกคำขอจอง <strong>{cancelModalItem?.title}</strong> ใช่หรือไม่?
          </p>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button
            variant="outline"
            onClick={() => setCancelModalItem(null)}
            disabled={isPending}
          >
            ไม่ใช่
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancelSubmit}
            disabled={isPending}
          >
            {isPending ? "กำลังยกเลิก..." : "ยืนยันยกเลิกคำขอ"}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Add Resource Dialog */}
      <LiyonDialog open={resourceModalOpen} onOpenChange={(open) => setResourceModalOpen(open)}>
        <form onSubmit={handleResourceSubmit}>
          <LiyonDialogHeader title="เพิ่มห้องหรือยานพาหนะใหม่" />
          <LiyonDialogBody className="space-y-4">
            <LiyonField label={t("reservation.resourceType")}>
              <LiyonSelect
                value={resType}
                onChange={(e) => setResType(e.target.value as "ROOM" | "VEHICLE")}
              >
                <option value="ROOM">ห้องประชุม / ห้องเรียน (Room)</option>
                <option value="VEHICLE">ยานพาหนะ (Vehicle)</option>
              </LiyonSelect>
            </LiyonField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label="ชื่อภาษาไทย">
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background border-input"
                  placeholder="เช่น ห้องสัมมนา 302"
                  value={resNameTh}
                  onChange={(e) => setResNameTh(e.target.value)}
                />
              </LiyonField>
              <LiyonField label="ชื่อภาษาอังกฤษ">
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background border-input"
                  placeholder="Seminar Room 302"
                  value={resNameEn}
                  onChange={(e) => setResNameEn(e.target.value)}
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label="ความจุ (ที่นั่ง/ผู้โดยสาร)">
                <input
                  type="number"
                  min="1"
                  required
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background border-input"
                  value={resCapacity}
                  onChange={(e) => setResCapacity(Number(e.target.value))}
                />
              </LiyonField>
              <LiyonField label="สถานที่ / จุดจอด">
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background border-input"
                  placeholder="เช่น ชั้น 3 อาคารเรียนรวม"
                  value={resLocation}
                  onChange={(e) => setResLocation(e.target.value)}
                />
              </LiyonField>
            </div>

            <LiyonField label="รูปภาพ URL">
              <input
                type="url"
                className="w-full px-3 py-2 border rounded-md text-sm bg-background border-input"
                placeholder="https://images.unsplash.com/..."
                value={resImageUrl}
                onChange={(e) => setResImageUrl(e.target.value)}
              />
            </LiyonField>

            <LiyonField label="อุปกรณ์อำนวยความสะดวก / รายละเอียด">
              <textarea
                rows={3}
                className="w-full px-3 py-2 border rounded-md text-sm bg-background border-input"
                placeholder="เช่น จอ LED 120 นิ้ว, ระบบเสียง surround"
                value={resDetails}
                onChange={(e) => setResDetails(e.target.value)}
              />
            </LiyonField>
          </LiyonDialogBody>
          <LiyonDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setResourceModalOpen(false)}
              disabled={isPending}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "กำลังบันทึก..." : "บันทึกทรัพยากร"}
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>
    </div>
  );
}
