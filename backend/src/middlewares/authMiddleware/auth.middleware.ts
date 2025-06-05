import { Hono } from "hono";

const authMiddleware = new Hono();

authMiddleware.get('/', async (c) => {
  return c.json({ message: 'Hello, world!' });
});

export default authMiddleware;