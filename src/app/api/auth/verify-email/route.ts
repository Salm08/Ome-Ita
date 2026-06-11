import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/profile?error=token-mancante", req.url));
  }

  const user = await prisma.user.findUnique({ where: { emailVerifyToken: token } });
  if (!user) {
    return NextResponse.redirect(new URL("/profile?error=token-non-valido", req.url));
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, emailVerifyToken: null },
  });

  return NextResponse.redirect(new URL("/profile?verified=1", req.url));
}
