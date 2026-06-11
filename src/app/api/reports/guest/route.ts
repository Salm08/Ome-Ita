import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";

const schema = z.object({
  reason: z.string().min(1),
  description: z.string().optional(),
  reportedUserId: z.string().optional(),
  partnerInfo: z.object({
    gender: z.string(),
    region: z.string(),
    stato: z.string(),
    age: z.number().optional(),
    isRegistered: z.boolean(),
    userId: z.string().optional(),
  }),
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`report:${ip}`, 10, 60 * 60 * 1000);
    if (!rl.ok) return rateLimitResponse(rl.retryAfterMs);

    const session = await getSession();
    const data = schema.parse(await req.json());

    if (data.reportedUserId && session) {
      const existing = await prisma.report.findFirst({
        where: {
          reporterId: session.id,
          reportedId: data.reportedUserId,
          status: "pending",
        },
      });
      if (!existing) {
        await prisma.report.create({
          data: {
            reporterId: session.id,
            reportedId: data.reportedUserId,
            reason: data.reason,
            description: data.description,
          },
        });
        return NextResponse.json({ success: true, type: "user" });
      }
      return NextResponse.json({ success: true, type: "user", duplicate: true });
    }

    await prisma.guestReport.create({
      data: {
        reason: data.reason,
        description: data.description,
        reporterIp: ip,
        reporterUserId: session?.id,
        reportedUserId: data.partnerInfo.userId,
        partnerInfo: JSON.stringify(data.partnerInfo),
      },
    });

    return NextResponse.json({ success: true, type: "guest" });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Errore segnalazione" }, { status: 500 });
  }
}
