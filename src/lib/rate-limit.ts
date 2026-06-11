const store = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (entry.count >= limit) {
    return { ok: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { ok: true };
}

export function rateLimitResponse(retryAfterMs?: number) {
  return new Response(
    JSON.stringify({ error: "Troppe richieste. Riprova tra poco." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        ...(retryAfterMs ? { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } : {}),
      },
    }
  );
}
