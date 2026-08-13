import { createMiddleware } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';

/**
 * Validates the Appwrite JWT sent by the browser and exposes the account on
 * `context` as `userId`, `email` and `name`.
 */
export const requireAppwriteAuth = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const request = getRequest();
    const authHeader = request?.headers?.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('Unauthorized: no session token provided');
    }
    const jwt = authHeader.slice('Bearer '.length).trim();
    if (!jwt) throw new Error('Unauthorized: no session token provided');

    const { getAccountFromJwt } = await import('./admin.server');
    const account = await getAccountFromJwt(jwt);

    const { ensureBootstrapAdmin } = await import('@/lib/roles.server');
    await ensureBootstrapAdmin(account.$id, account.email);

    return next({
      context: { userId: account.$id, email: account.email, name: account.name },
    });
  },
);