export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export function normalizeIp(ip: string): string {
  if (ip.startsWith("::ffff:")) return ip.slice(7);
  return ip;
}
