import { getStorage } from '@farm.js/core/storage';
import { createFiducy, keyValueStorage } from '@fiducy/sdk/server';

import { DEFAULT_GATEWAY_URL, DEMO_USER_COOKIE, FIDUCY_STORAGE_MOUNT } from './constants';

// The demo has no sign-in, so each browser gets a random user ID cookie. A real app returns
// its own user here, for example from its Better Auth session.
function readDemoUser(request: Request): string | null {
  const cookies = request.headers.get('cookie') ?? '';
  const match = new RegExp(`(?:^|;\\s*)${DEMO_USER_COOKIE}=([A-Za-z0-9-]{8,64})`).exec(cookies);
  return match?.[1] ?? null;
}

export const fiducyServer = createFiducy({
  gatewayURL: process.env.FIDUCY_GATEWAY_URL ?? DEFAULT_GATEWAY_URL,
  appSecret: process.env.FIDUCY_APP_SECRET ?? '',
  // Resolved per call, so the Farm storage mount only has to exist once requests arrive.
  storage: keyValueStorage({
    getItem: (key) => getStorage(FIDUCY_STORAGE_MOUNT).getItem(key),
    setItem: (key, value) => getStorage(FIDUCY_STORAGE_MOUNT).setItem(key, value),
    removeItem: (key) => getStorage(FIDUCY_STORAGE_MOUNT).removeItem(key),
    getKeys: (base) => getStorage(FIDUCY_STORAGE_MOUNT).getKeys(base)
  }),
  getUserID: readDemoUser
});

export { readDemoUser };
