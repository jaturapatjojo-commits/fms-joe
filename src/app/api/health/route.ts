import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/infra/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "ok";

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    dbStatus = error instanceof Error ? error.message : "database_unreachable";
  }

  const isHealthy = dbStatus === "ok";
  const durationMs = Date.now() - startTime;

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        status: dbStatus,
        latencyMs: durationMs,
      },
    },
    { status: isHealthy ? 200 : 503 }
  );
}