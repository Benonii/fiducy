import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

import { SAMPLE_API_KEY } from '@fiducy/testing';
import { startGatewayHarness } from './harness';

import type { SealedRecord } from '@fiducy/core';
import type { AppRegistration } from '../src/types';

const OWNED_APP: AppRegistration = {
  appID: 'app_ownstore',
  name: 'Ownstore',
  appSecret: 'app_sk_ownstore_5Rt8Pw2Mn6Qx',
  accessMode: 'gateway',
  monthlyRequestLimitPerKey: 50,
  allowedOrigins: ['https://ownstore.example'],
  recordStorage: 'app'
};

let harness: Awaited<ReturnType<typeof startGatewayHarness>>;

beforeAll(async () => {
  harness = await startGatewayHarness([OWNED_APP]);
});

afterAll(() => harness.stop());

function encodeRecord(record: SealedRecord): string {
  return Buffer.from(JSON.stringify(record)).toString('base64url');
}

function callProvider(handle: string, recordHeader?: string) {
  const headers: Record<string, string> = {
    authorization: `Bearer ${OWNED_APP.appSecret}`,
    'x-key-handle': handle,
    'content-type': 'application/json'
  };
  if (recordHeader) headers['x-key-record'] = recordHeader;
  return fetch(`${harness.gatewayURL}/openai/v1/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [] })
  });
}

async function sealForApp() {
  const { status, body } = await harness.storeKey(OWNED_APP.appID, SAMPLE_API_KEY);
  const { handle, record } = body.data;
  if (!record) throw new Error('Expected the gateway to return the sealed record');
  return { status, handle, record };
}

describe('apps that store their own sealed records', () => {
  it('returns the record to the app and keeps nothing', async () => {
    const { status, handle, record } = await sealForApp();
    expect(status).toBe(201);
    expect(handle).toStartWith('kh_');
    expect(record.appID).toBe(OWNED_APP.appID);
    expect(JSON.stringify(record)).not.toContain(SAMPLE_API_KEY);
    expect(await harness.keyStore.findRecord(record.keyID)).toBeNull();
  });

  it('opens the key from the record the app sends', async () => {
    const { handle, record } = await sealForApp();
    const response = await callProvider(handle, encodeRecord(record));
    expect(response.status).toBe(200);
    const forwarded = harness.mockProvider.recordedRequests.at(-1);
    expect(forwarded?.headers.get('authorization')).toBe(`Bearer ${SAMPLE_API_KEY}`);
  });

  it('asks for the record when it is missing or malformed', async () => {
    const { handle } = await sealForApp();
    expect((await callProvider(handle)).status).toBe(400);
    expect((await callProvider(handle, 'not*base64')).status).toBe(400);
  });

  it('refuses a tampered record', async () => {
    const { handle, record } = await sealForApp();
    const tampered = { ...record, ciphertext: `${record.ciphertext.slice(0, -2)}AA` };
    expect((await callProvider(handle, encodeRecord(tampered))).status).toBe(403);
  });

  it('refuses a record from another app', async () => {
    const { handle, record } = await sealForApp();
    const moved = { ...record, appID: 'app_chatforge' };
    expect((await callProvider(handle, encodeRecord(moved))).status).toBe(403);
  });

  it('points revokes at the app, since it holds the record', async () => {
    const { record } = await sealForApp();
    const response = await fetch(`${harness.gatewayURL}/keys/${record.keyID}`, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${OWNED_APP.appSecret}` }
    });
    expect(response.status).toBe(409);
  });
});
