import { readServerDemoConfig } from '../../../lib/config';
import { respondWith } from '../../../lib/responses';

export async function GET() {
  const config = readServerDemoConfig();
  if (!config) return respondWith(503, null, 'Set FIDUCY_APP_ID and FIDUCY_APP_SECRET');
  return respondWith(200, { gatewayURL: config.gatewayURL, appID: config.appID }, 'Config loaded');
}
