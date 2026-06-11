import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logModeration } from "@/lib/moderation-log";

const schema = z.object({
  userId: z.string(),
  reason: z.string().min(1),
  durationHours: z.number().optional(),
  permanent: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const data = schema.parse(await req.json());

    const expiresAt = data.permanent
      ? null
      : data.durationHours
        ? new Date(Date.now() + data.durationHours * 60 * 60 * 1000)
        : new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: data.userId },
      data: {
        isBanned: true,
        banReason: data.reason,
        bannedUntil: expiresAt,
      },
    });

    await prisma.ban.create({
      data: {
        userId: data.userId,
        bannedById: admin.id,
        reason: data.reason,
        expiresAt,
      },
    });

    await logModeration(admin.id, "ban_user", data.reason, data.userId);

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();
    const { userId } = await req.json();
    const admin = await requireAdmin();
    await prisma.user.update({
      where: { id: userId },
      data: { isBanned: false, bannedUntil: null, banReason: null },
    });
    await logModeration(admin.id, "unban_user", undefined, userId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
