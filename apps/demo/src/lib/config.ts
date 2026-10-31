import { DEFAULT_GATEWAY_URL, DEFAULT_MODEL } from './constants';

import type { ServerDemoConfig } from './types';

export function readServerDemoConfig(): ServerDemoConfig | null {
  const appID = process.env.FIDUCY_APP_ID;
  const appSecret = process.env.FIDUCY_APP_SECRET;
  if (!appID || !appSecret) return null;
  return {
    appID,
    appSecret,
    gatewayURL: process.env.FIDUCY_GATEWAY_URL ?? DEFAULT_GATEWAY_URL,
    model: process.env.FIDUCY_DEMO_MODEL ?? DEFAULT_MODEL
  };
}
