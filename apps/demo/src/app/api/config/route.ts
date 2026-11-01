import { readServerDemoConfig } from '@/lib/config';
import { issueDemoUserCookie } from '@/lib/demoUser';
import { readDemoUser } from '@/lib/fiducy';
import { respondWith } from '@/lib/responses';

export async function GET(request: Request) {
  const config = readServerDemoConfig();
  if (!config) return respondWith(503, null, 'Set FIDUCY_APP_ID and FIDUCY_APP_SECRET');
  const response = respondWith(
    200,
    { gatewayURL: config.gatewayURL, appID: config.appID },
    'Config loaded'
  );
  if (!readDemoUser(request)) response.headers.append('set-cookie', issueDemoUserCookie());
  return response;
}
