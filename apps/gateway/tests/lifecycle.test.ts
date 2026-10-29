import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

import { SAMPLE_API_KEY } from '@fiducy/testing';
import { CHAT_APP, DESK_APP, startGatewayHarness } from './harness';

let harness: Awaited<ReturnType<typeof startGatewayHarness>>;

beforeAll(async () => {
  harness = await startGatewayHarness();
});

afterAll(() => harness.stop());

function sendAuthorized(path: string, appSecret: string, handle: string, method = 'POST') {
  return fetch(`${harness.gatewayURL}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${appSecret}`,
      'x-key-handle': handle,
      'content-type': 'application/json'
    },
    body: method === 'POST' ? JSON.stringify({ model: 'gpt-4o-mini', messages: [] }) : undefined
  });
}

describe('the gateway health check', () => {
  it('reports that it is up', async () => {
    const response = await fetch(`${harness.gatewayURL}/health`);
    expect(await response.json()).toEqual({ data: { status: 'ok' }, message: 'Gateway is up' });
  });
});

describe('monthly request limits', () => {
  it('blocks a key once it reaches its app limit', async () => {
    const { body } = await harness.storeKey(CHAT_APP.appID, SAMPLE_API_KEY);
    const statuses: number[] = [];
    for (const _attempt of [1, 2, 3, 4]) {
      const response = await sendAuthorized(
        '/openai/v1/chat/completions',
        CHAT_APP.appSecret,
        body.data.handle
      );
      await response.text();
      await Bun.sleep(5);
      statuses.push(response.status);
    }
    expect(statuses).toEqual([200, 200, 200, 429]);
  });
});

describe('revoking a key', () => {
  it('stops the handle from working', async () => {
    const { body } = await harness.storeKey(CHAT_APP.appID, SAMPLE_API_KEY);
    const keyID = body.data.handle.slice(3, 25);
    const revoked = await sendAuthorized(
      `/keys/${keyID}`,
      CHAT_APP.appSecret,
      body.data.handle,
      'DELETE'
    );
    expect(revoked.status).toBe(200);
    const afterRevoke = await sendAuthorized(
      '/openai/v1/chat/completions',
      CHAT_APP.appSecret,
      body.data.handle
    );
    expect(afterRevoke.status).toBe(404);
  });

  it('does not let another app revoke the key', async () => {
    const { body } = await harness.storeKey(CHAT_APP.appID, SAMPLE_API_KEY);
    const keyID = body.data.handle.slice(3, 25);
    const response = await sendAuthorized(
      `/keys/${keyID}`,
      DESK_APP.appSecret,
      body.data.handle,
      'DELETE'
    );
    expect(response.status).toBe(404);
  });
});

describe('releasing a key to the app server', () => {
  it('is refused for apps on gateway-only mode', async () => {
    const { body } = await harness.storeKey(CHAT_APP.appID, SAMPLE_API_KEY);
    expect((await sendAuthorized('/release', CHAT_APP.appSecret, body.data.handle)).status).toBe(
      403
    );
  });

  it('returns the key with a time to live for apps that turned it on', async () => {
    const { body } = await harness.storeKey(DESK_APP.appID, SAMPLE_API_KEY);
    const response = await sendAuthorized('/release', DESK_APP.appSecret, body.data.handle);
    expect(await response.json()).toEqual({
      data: { apiKey: SAMPLE_API_KEY, expiresInSeconds: 300 },
      message: 'Key released. Keep it in memory only'
    });
  });
});
