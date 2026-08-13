import { createMiddleware } from '@tanstack/react-start';
import { createSessionJwt } from './client';

// Registered as a global `functionMiddleware` in src/start.ts so every server
// function call carries the current Appwrite session as a bearer JWT.
export const attachAppwriteAuth = createMiddleware({ type: 'function' }).client(async ({ next }) => {
  const token = await createSessionJwt();
  return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
});