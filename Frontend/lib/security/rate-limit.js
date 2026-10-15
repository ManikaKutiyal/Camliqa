import "server-only";

import { HttpError } from "@/lib/security/errors";

const STORE_KEY = Symbol.for("vedonyx.rate-limit.store");
const globalStore = globalThis[STORE_KEY] || new Map();

if (!globalThis[STORE_KEY]) {
  globalThis[STORE_KEY] = globalStore;
}

/**
 * Best-effort in-memory limiter. This protects local/dev and single-instance
 * deployments. For horizontally scaled production, swap this store for Redis.
 */
export function checkRateLimit({ key, limit, windowMs }) {
  const now = Date.now();
  const record = globalStore.get(key);

  if (!record || now > record.resetAt) {
    const freshRecord = {
      count: 1,
      resetAt: now + windowMs,
    };
    globalStore.set(key, freshRecord);
    return { allowed: true, remaining: limit - 1, resetAt: freshRecord.resetAt };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count += 1;
  return { allowed: true, remaining: Math.max(limit - record.count, 0), resetAt: record.resetAt };
}

export function assertRateLimit(options) {
  const result = checkRateLimit(options);
  if (!result.allowed) {
    throw new HttpError(429, "Too many attempts. Please try again later.");
  }
  return result;
}
