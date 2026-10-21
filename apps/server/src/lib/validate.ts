// zod validation for request bodies and params, with our { error } format on failure.
import { zValidator } from '@hono/zod-validator';
import type { ValidationTargets } from 'hono';
import type { ZodType } from 'zod';

export const validate = <T extends ZodType, Target extends keyof ValidationTargets>(target: Target, schema: T) =>
  zValidator(target, schema, (result, c) => {
    if (!result.success) {
      const issue = result.error.issues[0];
      const field = issue?.path.join('.');
      return c.json({ error: field ? `${field}: ${issue.message}` : (issue?.message ?? 'Invalid request') }, 400);
    }
  });
