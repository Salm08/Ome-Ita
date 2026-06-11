import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      reportsMade: { select: { reason: true, createdAt: true, status: true } },
      reportsReceived: { select: { reason: true, createdAt: true, status: true } },
      bansReceived: { select: { reason: true, createdAt: true, expiresAt: true } },
    },
  });

  if (!user) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });

  const exportData = {
    exportedAt: new Date().toISOString(),
    profile: {
      email: user.email,
      gender: user.gender,
      age: user.age,
      region: user.region,
      stato: user.stato,
      emailVerified: user.emailVerified,
      preferRegionMatch: user.preferRegionMatch,
      createdAt: user.createdAt,
    },
    reportsMade: user.reportsMade,
    reportsReceived: user.reportsReceived,
    bansReceived: user.bansReceived,
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="ome-ita-dati-${session.id}.json"`,
    },
  });
}
