import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const deleteSchema = z.object({
  password: z.string().min(1),
  confirm: z.literal("ELIMINA"),
});

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  if (session.role === "ADMIN") {
    return NextResponse.json({ error: "L'account admin non può essere eliminato da qui" }, { status: 403 });
  }

  try {
    const data = deleteSchema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });

    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Password non corretta" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: session.id } });

    const response = NextResponse.json({ success: true });
    response.cookies.set("auth_token", "", { httpOnly: true, maxAge: 0, path: "/" });
    return response;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Errore eliminazione account" }, { status: 500 });
  }
}
