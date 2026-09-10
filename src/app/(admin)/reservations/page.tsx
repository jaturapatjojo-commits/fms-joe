import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  RESERVATION_P,
  listResources,
  listReservations,
} from "@/features/reservations/server";
import { ReservationsAdminClient } from "./_components/reservations-admin-client";

export default async function ReservationsAdminPage() {
  const ctx = await requirePermission(RESERVATION_P.reservationRead);
  const [resources, reservations] = await Promise.all([
    listResources(ctx.tenantId),
    listReservations(ctx.tenantId),
  ]);

  return (
    <ReservationsAdminClient
      initialResources={resources}
      initialReservations={reservations}
      canManage={hasPermission(ctx, RESERVATION_P.reservationManage)}
      canApprove={hasPermission(ctx, RESERVATION_P.reservationApprove)}
    />
  );
}
