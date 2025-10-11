// lib/rateLimiter.ts

interface RateLimitInfo {
  count: number;
  expiresAt: number;
}

const memoryStore = new Map<string, RateLimitInfo>();

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * 🚦 Custom in-memory rate limiter
 * - Tracks requests per key (API key or IP)
 * - Resets automatically after window expires
 * - No external dependencies
 */
export async function rateLimiter(
  key: string,
  limit = 100,
  windowInSeconds = 60
): Promise<RateLimitResult> {
  const now = Date.now();
  const record = memoryStore.get(key);

  if (!record || record.expiresAt < now) {
    // First request or expired window → reset counter
    memoryStore.set(key, {
      count: 1,
      expiresAt: now + windowInSeconds * 1000,
    });

    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: Math.floor((now + windowInSeconds * 1000) / 1000),
    };
  }

  if (record.count >= limit) {
    // Too many requests — rate limited
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.floor(record.expiresAt / 1000),
    };
  }

  // Increment and continue
  record.count++;
  memoryStore.set(key, record);

  return {
    success: true,
    limit,
    remaining: limit - record.count,
    reset: Math.floor(record.expiresAt / 1000),
  };
}

/**
 * 🧹 Optional: Auto-cleanup expired keys every few minutes
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of memoryStore.entries()) {
    if (record.expiresAt < now) memoryStore.delete(key);
  }
}, 5 * 60 * 1000); // every 5 minutes
