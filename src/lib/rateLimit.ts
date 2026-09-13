/**
 * In-Memory IP-Based Rate Limiter Utility
 * Limits requests to 5 per minute per IP address.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 5;

// Global in-memory storage for IP rate tracking
const rateLimitMap = new Map<string, RateLimitRecord>();

// Cleanup expired entries every 2 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) {
        rateLimitMap.delete(ip);
      }
    }
  }, 2 * 60 * 1000);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

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
