import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

export const createTeamSchema = z.object({
  teamName: z.string().min(3, { message: "Team name must be at least 3 characters long" }),
});

export const createTeamValidator = zValidator("json", createTeamSchema, (result, c) => {
  if (!result.success) {
    return c.json({ error: result.error.issues.map((issue) => issue.message) }, 400);
  }
});