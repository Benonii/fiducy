import { DEMO_USER_COOKIE } from './constants';

export function ensureDemoUser() {
  if (document.cookie.includes(`${DEMO_USER_COOKIE}=`)) return;
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${DEMO_USER_COOKIE}=${crypto.randomUUID()}; path=/; max-age=${oneYear}; samesite=lax`;
}
