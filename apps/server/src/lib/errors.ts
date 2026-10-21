// Shared error helpers. Every error reaches the client as { error: "message" } (docs/API.md).
import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

/** Stop the request with a status and a message the user can read. */
export function fail(status: ContentfulStatusCode, message: string): never {
  throw new HTTPException(status, { message });
}

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof HTTPException) return c.json({ error: err.message }, err.status);
  console.error(err);
  return c.json({ error: 'Something went wrong. Please try again.' }, 500);
};
