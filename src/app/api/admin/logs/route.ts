import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();
    const logs = await prisma.moderationLog.findMany({
      include: { admin: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ logs });
  } catch {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }
}
