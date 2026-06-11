import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { socketStats } from "@/lib/socket-state";

export async function GET() {
  try {
    await requireAdmin();

    const [totalUsers, bannedUsers, pendingReports, pendingGuestReports, bansToday] = await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.user.count({ where: { isBanned: true } }),
      prisma.report.count({ where: { status: "pending" } }),
      prisma.guestReport.count({ where: { status: "pending" } }),
      prisma.ban.count({
        where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      }),
    ]);

    return NextResponse.json({
      socket: socketStats,
      users: { total: totalUsers, banned: bannedUsers },
      reports: { pending: pendingReports, pendingGuest: pendingGuestReports },
      bansToday,
    });
  } catch {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }
}
