import { prisma } from "./prisma";

export async function logModeration(
  adminId: string,
  action: string,
  details?: string,
  targetUserId?: string,
  targetIp?: string
) {
  await prisma.moderationLog.create({
    data: { adminId, action, details, targetUserId, targetIp },
  });
}
