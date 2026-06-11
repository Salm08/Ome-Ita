import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession, hashPassword, verifyPassword, createToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ITALIAN_REGIONS } from "@/lib/constants";

const updateSchema = z.object({
  region: z.enum(ITALIAN_REGIONS as unknown as [string, ...string[]]).optional(),
  stato: z.string().min(1).max(50).optional(),
  gender: z.enum(["MALE", "FEMALE", "COUPLE"]).optional(),
  age: z.number().min(18).max(99).optional(),
  preferRegionMatch: z.boolean().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

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
      googleId: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  try {
    const data = updateSchema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });

    const updateData: Record<string, unknown> = {};
    if (data.region) updateData.region = data.region;
    if (data.stato) updateData.stato = data.stato;
    if (data.gender) updateData.gender = data.gender;
    if (data.age) updateData.age = data.age;
    if (data.preferRegionMatch !== undefined) updateData.preferRegionMatch = data.preferRegionMatch;

    if (data.newPassword) {
      if (!data.currentPassword) {
        return NextResponse.json({ error: "Password attuale richiesta" }, { status: 400 });
      }
      const valid = await verifyPassword(data.currentPassword, user.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: "Password attuale non corretta" }, { status: 400 });
      }
      updateData.passwordHash = await hashPassword(data.newPassword);
    }

    const updated = await prisma.user.update({
      where: { id: session.id },
      data: updateData,
    });

    const token = await createToken({
      id: updated.id,
      email: updated.email,
      gender: updated.gender,
      age: updated.age,
      region: updated.region,
      stato: updated.stato,
      role: updated.role,
      emailVerified: updated.emailVerified,
      preferRegionMatch: updated.preferRegionMatch,
    });

    const response = NextResponse.json({
      user: {
        id: updated.id,
        email: updated.email,
        gender: updated.gender,
        age: updated.age,
        region: updated.region,
        stato: updated.stato,
        emailVerified: updated.emailVerified,
        preferRegionMatch: updated.preferRegionMatch,
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
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Errore aggiornamento profilo" }, { status: 500 });
  }
}
