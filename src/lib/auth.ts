import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { Gender, UserRole } from "@prisma/client";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-in-production-min-32-chars"
);

export interface SessionUser {
  id: string;
  email: string;
  gender: Gender;
  age: number;
  region: string;
  stato: string;
  role: UserRole;
  emailVerified: boolean;
  preferRegionMatch: boolean;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createToken(user: SessionUser) {
  return new SignJWT({
    id: user.id,
    email: user.email,
    gender: user.gender,
    age: user.age,
    region: user.region,
    stato: user.stato,
    role: user.role,
    emailVerified: user.emailVerified,
    preferRegionMatch: user.preferRegionMatch,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function checkUserBan(userId: string): Promise<{ banned: boolean; reason?: string; until?: Date }> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { banned: false };

  if (user.isBanned) {
    if (user.bannedUntil && user.bannedUntil < new Date()) {
      await prisma.user.update({
        where: { id: userId },
        data: { isBanned: false, bannedUntil: null, banReason: null },
      });
      return { banned: false };
    }
    return { banned: true, reason: user.banReason || undefined, until: user.bannedUntil || undefined };
  }
  return { banned: false };
}
