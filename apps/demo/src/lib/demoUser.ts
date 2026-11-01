import { DEMO_USER_COOKIE, DEMO_USER_COOKIE_MAX_AGE } from './constants';

export function issueDemoUserCookie(): string {
  return `${DEMO_USER_COOKIE}=${crypto.randomUUID()}; Path=/; Max-Age=${DEMO_USER_COOKIE_MAX_AGE}; HttpOnly; SameSite=Lax`;
}
