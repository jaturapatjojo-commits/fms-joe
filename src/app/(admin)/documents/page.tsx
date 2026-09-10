import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  DOCUMENT_P,
  listDocuments,
} from "@/features/documents/server";
import { prisma } from "@/shared/lib/infra/prisma";
import { DocumentsAdminClient } from "./_components/documents-admin-client";

export default async function DocumentsAdminPage() {
  const ctx = await requirePermission(DOCUMENT_P.documentRead);
  const [documents, staffList] = await Promise.all([
    listDocuments(ctx.tenantId),
    prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <DocumentsAdminClient
      initialDocuments={documents}
      users={staffList}
      currentUserId={ctx.userId}
      canManage={hasPermission(ctx, DOCUMENT_P.documentManage)}
      canApprove={hasPermission(ctx, DOCUMENT_P.documentApprove)}
    />
  );
}
