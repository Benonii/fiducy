import { fail, succeed } from '@fiducy/core';

import { APP_SECRET_HEADERS } from './constants';
import { describeFailure } from './responses';

import type { AppDirectory, GatewayResult, RegisteredApp } from './types';

export function readAppSecret(headers: Headers): string | null {
  for (const headerName of APP_SECRET_HEADERS) {
    const value = headers.get(headerName)?.trim();
    if (value) return value.replace(/^Bearer\s+/i, '');
  }
  return null;
}

export async function authenticateApp(
  appDirectory: AppDirectory,
  headers: Headers
): Promise<GatewayResult<RegisteredApp>> {
  const appSecret = readAppSecret(headers);
  if (!appSecret) return fail(describeFailure(401, 'Send your app secret as a Bearer token'));
  const app = await appDirectory.findAppBySecret(appSecret);
  if (!app) return fail(describeFailure(401, 'This app secret is not valid'));
  return succeed(app);
}
