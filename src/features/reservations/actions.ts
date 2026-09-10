"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { RESERVATION_P } from "./permissions";
import {
  createResourceSchema,
  createReservationSchema,
  approveReservationSchema,
} from "./_internal/validations";
import {
  createResource,
  createReservation,
  approveReservation,
  cancelReservation,
  type ResourceDto,
  type ReservationDto,
} from "./_internal/services";

export async function createResourceAction(input: unknown): Promise<ActionResult<ResourceDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(RESERVATION_P.reservationManage);
    const parsed = createResourceSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createResource(ctx.tenantId, parsed);
    revalidatePath("/reservations");
    return result;
  });
}

export async function createReservationAction(input: unknown): Promise<ActionResult<ReservationDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(RESERVATION_P.reservationManage);
    const parsed = createReservationSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createReservation(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/reservations");
    revalidatePath("/portal/reservations");
    return result;
  });
}

export async function approveReservationAction(input: unknown): Promise<ActionResult<ReservationDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(RESERVATION_P.reservationApprove);
    const parsed = approveReservationSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await approveReservation(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/reservations");
    revalidatePath("/portal/reservations");
    return result;
  });
}

export async function cancelReservationAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(RESERVATION_P.reservationManage);
    await cancelReservation(ctx.tenantId, id);
    revalidatePath("/reservations");
    revalidatePath("/portal/reservations");
  });
}
