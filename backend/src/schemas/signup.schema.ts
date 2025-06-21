import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email(),
  username: z.string()
    .min(3, { message: 'Username must be at least 3 characters long' })
    .max(20, { message: 'Username must be at most 20 characters long' }),
   
  password: z.string()
  .min(12, { message: 'Password must be at least 12 characters long' })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/, { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }),
  
});

export const signupValidator = zValidator('json', signupSchema, (result, c) => {
  if (!result.success) {
    return c.json({ error: result.error.issues.map((issue) => issue.message)},
     400);
  }
});



