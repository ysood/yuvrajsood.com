import { createHash } from "node:crypto";
import { isIP } from "node:net";

import { headers } from "next/headers";

import { getPayloadClient } from "@/lib/payload";

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

type AttemptState = {
  failures: number;
  lockedUntil: number;
  windowStartedAt: number;
};

function getRequestIP(requestHeaders: Headers) {
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIP = requestHeaders.get("x-real-ip")?.trim();
  const candidate = forwarded || realIP || "unknown";

  return isIP(candidate) ? candidate : "unknown";
}

async function getRateLimitKey() {
  const requestHeaders = await headers();
  const ip = getRequestIP(requestHeaders);
  const pepper = process.env.PAYLOAD_SECRET ?? "missing-secret";
  const digest = createHash("sha256")
    .update(`${pepper}:${ip}`)
    .digest("hex")
    .slice(0, 24);

  return `admin-login:${digest}`;
}

export async function getLoginRateLimit() {
  const payload = await getPayloadClient();
  const key = await getRateLimitKey();
  const state = await payload.kv.get<AttemptState>(key);
  const now = Date.now();

  if (!state || now - state.windowStartedAt >= WINDOW_MS) {
    return { key, retryAfterSeconds: 0 };
  }

  return {
    key,
    retryAfterSeconds:
      state.lockedUntil > now
        ? Math.max(1, Math.ceil((state.lockedUntil - now) / 1000))
        : 0,
  };
}

export async function recordFailedLogin(key: string) {
  const payload = await getPayloadClient();
  const now = Date.now();
  const existing = await payload.kv.get<AttemptState>(key);
  const current =
    existing && now - existing.windowStartedAt < WINDOW_MS
      ? existing
      : { failures: 0, lockedUntil: 0, windowStartedAt: now };
  const failures = current.failures + 1;

  await payload.kv.set(key, {
    failures,
    lockedUntil: failures >= MAX_FAILURES ? now + WINDOW_MS : 0,
    windowStartedAt: current.windowStartedAt,
  } satisfies AttemptState);
}

export async function clearLoginRateLimit(key: string) {
  const payload = await getPayloadClient();
  await payload.kv.delete(key);
}
