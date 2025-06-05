import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12, { message: 'Password must be at least 12 characters long' }),
});

export const signupValidator = zValidator('json', signupSchema, (result, c) => {
  if (!result.success) {
    return c.json({ error: result.error.issues.map((issue) => issue.message)},
     400);
  }
});



