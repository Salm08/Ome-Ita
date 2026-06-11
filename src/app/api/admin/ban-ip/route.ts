import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { banIp, unbanIp } from "@/lib/ip-ban";
import { logModeration } from "@/lib/moderation-log";

const schema = z.object({
  ip: z.string().min(1),
  reason: z.string().min(1),
  durationHours: z.number().optional(),
  permanent: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const data = schema.parse(await req.json());
    await banIp(data.ip, data.reason, admin.id, data.durationHours, data.permanent);
    await logModeration(admin.id, "ban_ip", data.reason, undefined, data.ip);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = await requireAdmin();
    const { ip } = await req.json();
    await unbanIp(ip);
    await logModeration(admin.id, "unban_ip", undefined, undefined, ip);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
