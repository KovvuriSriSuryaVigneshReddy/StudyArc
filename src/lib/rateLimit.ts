/**
 * In-Memory IP-Based Rate Limiter Utility
 * Limits requests to 5 requests per minute per IP address.
 */

export interface RateLimitRecord {
  /** Total requests recorded within current window */
  count: number;
  /** Unix timestamp in ms when the window expires */
  resetTime: number;
}

/** Rate limit time window in milliseconds (1 minute) */
export const WINDOW_MS = 60 * 1000;

/** Maximum requests permitted per IP address within the window */
export const MAX_REQUESTS = 5;

// Global in-memory storage for IP rate tracking
const rateLimitMap = new Map<string, RateLimitRecord>();

// Cleanup expired entries periodically to prevent memory leaks
if (typeof setInterval !== "undefined") {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) {
        rateLimitMap.delete(ip);
      }
    }
  }, 2 * 60 * 1000);
  // Prevent cleanup timer from keeping Node process alive in tests
  if (cleanupTimer && typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    (cleanupTimer as { unref: () => void }).unref();
  }
}

export interface RateLimitResult {
  /** Whether the request is permitted */
  allowed: boolean;
  /** Number of remaining allowed requests within current window */
  remaining: number;
  /** Unix timestamp in ms when rate limit count resets */
  resetTime: number;
}

/**
 * Checks and increments the rate limit counter for a given client IP address.
 * Employs a fixed/sliding-window tracking algorithm in memory.
 *
 * @param ip - The client's IP address (from headers or connection).
 * @returns An object containing `allowed`, `remaining`, and `resetTime`.
 * @example
 * ```ts
 * const limit = checkRateLimit(clientIp);
 * if (!limit.allowed) {
 *   return NextResponse.json({ error: "Too many requests" }, { status: 429 });
 * }
 * ```
 */
export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const safeIp = ip.trim() || "127.0.0.1";
  const record = rateLimitMap.get(safeIp);

  if (!record || now > record.resetTime) {
    // New window
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + WINDOW_MS,
    };
    rateLimitMap.set(safeIp, newRecord);
    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      resetTime: newRecord.resetTime,
    };
  }

  // Window is active
  if (record.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: MAX_REQUESTS - record.count,
    resetTime: record.resetTime,
  };
}

