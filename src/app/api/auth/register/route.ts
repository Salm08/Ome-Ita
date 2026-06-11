import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, createToken } from "@/lib/auth";
import { ITALIAN_REGIONS } from "@/lib/constants";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";
import { generateVerifyToken, sendVerificationEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(8, "La password deve avere almeno 8 caratteri"),
  gender: z.enum(["MALE", "FEMALE", "COUPLE"]),
  age: z.number().min(18, "Devi avere almeno 18 anni").max(99),
  region: z.enum(ITALIAN_REGIONS as unknown as [string, ...string[]]),
  stato: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
    if (!rl.ok) return rateLimitResponse(rl.retryAfterMs);

    const body = await req.json();
    const data = schema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: "Email già registrata" }, { status: 409 });
    }

    const verifyToken = generateVerifyToken();
    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        gender: data.gender,
        age: data.age,
        region: data.region,
        stato: data.stato || "online",
        emailVerifyToken: verifyToken,
      },
    });

    const emailResult = await sendVerificationEmail(user.email, verifyToken);

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
        role: user.role,
        emailVerified: user.emailVerified,
      },
      verifyEmailSent: emailResult.sent,
      devVerifyLink: emailResult.devLink,
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
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("Register error:", err);
    return NextResponse.json({ error: "Errore durante la registrazione" }, { status: 500 });
  }
}
