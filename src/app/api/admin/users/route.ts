import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();
    const users = await prisma.user.findMany({
      where: { role: "USER" },
      select: {
        id: true,
        email: true,
        gender: true,
        age: true,
        region: true,
        isBanned: true,
        bannedUntil: true,
        banReason: true,
        createdAt: true,
        _count: { select: { reportsReceived: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }
}
