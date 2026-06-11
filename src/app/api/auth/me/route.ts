import { NextResponse } from "next/server";
import { getSession, checkUserBan } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const ban = await checkUserBan(session.id);
  if (ban.banned) {
    return NextResponse.json({ user: null, banned: true, reason: ban.reason });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      gender: true,
      age: true,
      region: true,
      stato: true,
      role: true,
      emailVerified: true,
      preferRegionMatch: true,
    },
  });

  return NextResponse.json({ user: user || session });
}
