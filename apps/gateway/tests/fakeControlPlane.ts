import { hashSecret } from '../src/hashing';

import type { SealedRecord } from '@fiducy/core';
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
  const keyRecords = new Map<string, SealedRecord>();

  const serveKeyRecords = async (request: Request, keyID: string | undefined) => {
    if (request.method === 'POST') {
      const record = (await request.json()) as SealedRecord;
      keyRecords.set(record.keyID, record);
      return Response.json({ data: { keyID: record.keyID }, message: 'Saved' }, { status: 201 });
    }
    const record = keyID ? keyRecords.get(keyID) : undefined;
    if (!keyID || !record)
      return Response.json({ data: null, message: 'Missing' }, { status: 404 });
    if (request.method === 'DELETE') keyRecords.delete(keyID);
    return Response.json({ data: record, message: 'Found' });
  };

  const server = Bun.serve({
    port: 0,
    fetch: async (request) => {
      if (request.headers.get('authorization') !== `Bearer ${GATEWAY_TOKEN}`) {
        return Response.json({ data: null, message: 'Bad token' }, { status: 401 });
      }
      const { pathname } = new URL(request.url);
      if (pathname.startsWith('/api/gateway/keys')) {
        return serveKeyRecords(request, pathname.split('/')[4]);
      }
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
    keyRecords,
    stop: () => server.stop(true)
  };
}
