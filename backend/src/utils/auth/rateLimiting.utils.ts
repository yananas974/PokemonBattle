import { RateLimitStore } from "../../models/interfaces/rateLimiter.interface";

const store: RateLimitStore = {};

export const checkRateLimit = (
  identifier: string,
  windowMs: number,
  maxRequests: number
): { allowed: boolean, resetTime?: number } => {
  const now = Date.now();
  const key = identifier;

  if (!store[key] || now < store[key].resetTime) {
    store[key] = { count: 1,  resetTime: now + windowMs };
    return { allowed: true };
  }

  store[key].count++;
  return { allowed: false, resetTime: store[key].resetTime };
};


export const cleanupExpiredEntries = () => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
};