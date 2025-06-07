import  {checkRateLimit, cleanupExpiredEntries} from '../../utils/auth/rateLimiting.utils';

export const createRateLimiter = ( windowMs: number, maxRequests: number ) => {
  return async (c: any, next: any) => {
    const identifier = c.req.header('x-forwarded-for') || 
                      c.req.header('cf-connecting-ip') ||
                         'anonymous';
    const  result = checkRateLimit(identifier, windowMs, maxRequests);

    if (!result.allowed) {
      return c.json({ error: 'Rate limit exceeded' }, 429);
    }

    await next();
  };
};

export const authRateLimiter = createRateLimiter(15 * 60 * 1000, 5);
export const apiRateLimiter = createRateLimiter(15 * 60 * 1000, 5);
