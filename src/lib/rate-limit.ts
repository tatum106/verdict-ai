// Simple in-memory rate limiter for MVP. Replace with Redis/Upstash for production.
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 50; // 50 debates per hour for authenticated, 5 for anonymous

export function checkRateLimit(
  identifier: string,
  isAuthenticated: boolean
): { success: boolean; remaining: number; resetAt: number } {
  const max = isAuthenticated ? RATE_LIMIT_MAX : 5;
  const key = `judge:${identifier}`;
  const now = Date.now();

  let record = rateLimitStore.get(key);

  if (!record) {
    record = { count: 1, resetAt: now + RATE_LIMIT_WINDOW };
    rateLimitStore.set(key, record);
    return { success: true, remaining: max - 1, resetAt: record.resetAt };
  }

  if (now > record.resetAt) {
    record = { count: 1, resetAt: now + RATE_LIMIT_WINDOW };
    rateLimitStore.set(key, record);
    return { success: true, remaining: max - 1, resetAt: record.resetAt };
  }

  record.count++;

  if (record.count > max) {
    return {
      success: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  return {
    success: true,
    remaining: max - record.count,
    resetAt: record.resetAt,
  };
}
