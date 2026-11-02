import { DEMO_USER_COOKIE, DEMO_USER_COOKIE_MAX_AGE } from '@/lib/constants';

import type { RequestMiddlewareContext } from '@farm.js/core/middleware';

export function middleware(_request: Request, context: RequestMiddlewareContext) {
  if (context.cookies.get(DEMO_USER_COOKIE)) return;
  context.cookies.set(DEMO_USER_COOKIE, crypto.randomUUID(), {
    path: '/',
    maxAge: DEMO_USER_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: 'lax'
  });
}
