import { prisma } from "./prisma";
import { normalizeIp } from "./ip";

export async function isIpBanned(ip: string): Promise<{ banned: boolean; reason?: string; until?: Date }> {
  const normalized = normalizeIp(ip);
  if (normalized === "unknown") return { banned: false };

  const ban = await prisma.ipBan.findUnique({ where: { ip: normalized } });
  if (!ban) return { banned: false };

  if (ban.expiresAt && ban.expiresAt < new Date()) {
    await prisma.ipBan.delete({ where: { ip: normalized } });
    return { banned: false };
  }

  return { banned: true, reason: ban.reason, until: ban.expiresAt || undefined };
}

export async function banIp(
  ip: string,
  reason: string,
  adminId?: string,
  durationHours?: number,
  permanent?: boolean
) {
  const normalized = normalizeIp(ip);
  const expiresAt = permanent
    ? null
    : durationHours
      ? new Date(Date.now() + durationHours * 60 * 60 * 1000)
      : new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.ipBan.upsert({
    where: { ip: normalized },
    create: { ip: normalized, reason, expiresAt, bannedById: adminId },
    update: { reason, expiresAt, bannedById: adminId },
  });
}

export async function unbanIp(ip: string) {
  const normalized = normalizeIp(ip);
  await prisma.ipBan.deleteMany({ where: { ip: normalized } });
}
