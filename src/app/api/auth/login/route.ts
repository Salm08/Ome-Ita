import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createToken, checkUserBan } from "@/lib/auth";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";
import { isIpBanned } from "@/lib/ip-ban";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const ipBan = await isIpBanned(ip);
    if (ipBan.banned) {
      return NextResponse.json({ error: "Accesso bloccato", reason: ipBan.reason }, { status: 403 });
    }

    const rl = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
    if (!rl.ok) return rateLimitResponse(rl.retryAfterMs);

    const body = await req.json();
    const data = schema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Credenziali non valide" }, { status: 401 });
    }

    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Credenziali non valide" }, { status: 401 });
    }

    const ban = await checkUserBan(user.id);
    if (ban.banned) {
      return NextResponse.json(
        { error: "Account sospeso", reason: ban.reason, until: ban.until },
        { status: 403 }
      );
    }

    const token = await createToken({
      id: user.id,
      email: user.email,
      gender: user.gender,
      age: user.age,
      region: user.region,
      stato: user.stato,
      role: user.role,
      emailVerified: user.emailVerified,
      preferRegionMatch: user.preferRegionMatch,
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        gender: user.gender,
        age: user.age,
        region: user.region,
        stato: user.stato,
        role: user.role,
        emailVerified: user.emailVerified,
        preferRegionMatch: user.preferRegionMatch,
      },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
    }
    return NextResponse.json({ error: "Errore durante il login" }, { status: 500 });
  }
}
