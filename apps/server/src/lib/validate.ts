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

/** Ids are UUIDs; anything else can't exist (and would make Postgres throw). */
export const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
