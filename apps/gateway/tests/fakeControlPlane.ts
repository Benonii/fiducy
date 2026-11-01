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
  let requestCountLookups = 0;
  const requestCounts = new Map<string, number>();

  const addRequestCounts = (batch: ReceivedUsageBatch) => {
    for (const { appID, keyID } of batch.events) {
      const countKey = `${appID}|${keyID}`;
      requestCounts.set(countKey, (requestCounts.get(countKey) ?? 0) + 1);
    }
  };

  const respondWithRequestCount = (searchParams: URLSearchParams) => {
    requestCountLookups += 1;
    const countKey = `${searchParams.get('appID')}|${searchParams.get('keyID')}`;
    const requestCount = requestCounts.get(countKey) ?? 0;
    return Response.json({ data: { requestCount }, message: 'Request count loaded' });
  };

  const server = Bun.serve({
    port: 0,
    fetch: async (request) => {
      if (request.headers.get('authorization') !== `Bearer ${GATEWAY_TOKEN}`) {
        return Response.json({ data: null, message: 'Bad token' }, { status: 401 });
      }
      const { pathname, searchParams } = new URL(request.url);
      if (pathname === '/api/gateway/apps') {
        appListRequestCount += 1;
        return Response.json({ data: apps, message: 'App configs loaded' });
      }
      if (usageStatus !== 202) {
        return Response.json({ data: null, message: 'Unavailable' }, { status: usageStatus });
      }
      if (pathname === '/api/gateway/usage/count') return respondWithRequestCount(searchParams);
      if (pathname === '/api/gateway/usage') {
        const batch = (await request.json()) as ReceivedUsageBatch;
        usageBatches.push(batch);
        addRequestCounts(batch);
        return Response.json({ data: null, message: 'Usage recorded' }, { status: 202 });
      }
      return Response.json({ data: null, message: 'Not found' }, { status: 404 });
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
    countRequestCountLookups: () => requestCountLookups,
    usageBatches,
    stop: () => server.stop(true)
  };
}
