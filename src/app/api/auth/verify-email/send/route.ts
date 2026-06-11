import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateVerifyToken, sendVerificationEmail } from "@/lib/email";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const rl = rateLimit(`verify:${session.id}`, 3, 60 * 60 * 1000);
  if (!rl.ok) return rateLimitResponse(rl.retryAfterMs);

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
  if (user.emailVerified) {
    return NextResponse.json({ error: "Email già verificata" }, { status: 400 });
  }

  const token = generateVerifyToken();
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerifyToken: token },
  });

  const result = await sendVerificationEmail(user.email, token);
  return NextResponse.json({ success: true, devVerifyLink: result.devLink });
}
