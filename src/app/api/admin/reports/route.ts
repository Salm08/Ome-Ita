import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();
    const reports = await prisma.report.findMany({
      where: { status: "pending" },
      include: {
        reporter: { select: { id: true, email: true } },
        reported: { select: { id: true, email: true, gender: true, region: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ reports });
  } catch {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const { reportId, status } = await req.json();
    await prisma.report.update({ where: { id: reportId }, data: { status } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
