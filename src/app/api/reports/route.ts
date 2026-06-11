import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  reportedUserId: z.string(),
  reason: z.string().min(1),
  description: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Devi essere registrato per segnalare" }, { status: 401 });
    }

    const data = schema.parse(await req.json());

    await prisma.report.create({
      data: {
        reporterId: session.id,
        reportedId: data.reportedUserId,
        reason: data.reason,
        description: data.description,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
