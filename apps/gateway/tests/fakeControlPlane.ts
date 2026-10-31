import { hashSecret } from '../src/hashing';

import type { AppRegistration, RemoteAppConfig } from '../src/types';
import type { ReceivedUsageBatch } from './types';

export const GATEWAY_TOKEN = 'gateway_token_4Fq9Lm2Xz7Rt';

export async function toRemoteAppConfig({
  appSecret,
  ...app
}: AppRegistration): Promise<RemoteAppConfig> {
  return { ...app, appSecretHash: await hashSecret(appSecret) };
}

export function startFakeControlPlane() {
  let apps: RemoteAppConfig[] = [];
  const usageBatches: ReceivedUsageBatch[] = [];
  let appListRequestCount = 0;
  let usageStatus = 202;

  const server = Bun.serve({
    port: 0,
    fetch: async (request) => {
      if (request.headers.get('authorization') !== `Bearer ${GATEWAY_TOKEN}`) {
        return Response.json({ data: null, message: 'Bad token' }, { status: 401 });
      }
      const { pathname } = new URL(request.url);
      if (pathname === '/api/gateway/apps') {
        appListRequestCount += 1;
        return Response.json({ data: apps, message: 'App configs loaded' });
      }
      if (pathname === '/api/gateway/usage' && usageStatus === 202) {
        usageBatches.push((await request.json()) as ReceivedUsageBatch);
        return Response.json({ data: null, message: 'Usage recorded' }, { status: 202 });
      }
      return Response.json({ data: null, message: 'Unavailable' }, { status: usageStatus });
    }
  });

  return {
    controlPlaneURL: `http://localhost:${server.port}`,
    setApps: async (registrations: AppRegistration[]) => {
      apps = await Promise.all(registrations.map(toRemoteAppConfig));
    },
    failUsageWith: (status: number) => {
      usageStatus = status;
    },
    countAppListRequests: () => appListRequestCount,
    usageBatches,
    stop: () => server.stop(true)
  };
}
