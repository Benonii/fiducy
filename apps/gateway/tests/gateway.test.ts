import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

import { SAMPLE_API_KEY } from '@fiducy/testing';
import { CHAT_APP, DESK_APP, startGatewayHarness } from './harness';

let harness: Awaited<ReturnType<typeof startGatewayHarness>>;
let chatHandle: string;

beforeAll(async () => {
  harness = await startGatewayHarness();
  const stored = await harness.storeKey(CHAT_APP.appID, SAMPLE_API_KEY);
  chatHandle = stored.body.data.handle;
});

afterAll(() => harness.stop());

function createOpenAIClient(appSecret: string, handle: string) {
  return new OpenAI({
    apiKey: appSecret,
    baseURL: `${harness.gatewayURL}/openai/v1`,
    defaultHeaders: { 'x-key-handle': handle },
    maxRetries: 0
  });
}

function callGateway(path: string, init: RequestInit) {
  return fetch(`${harness.gatewayURL}${path}`, init);
}

describe('storing a user key', () => {
  it('returns a handle and keeps only ciphertext in the store', async () => {
    const stored = await harness.storeKey(CHAT_APP.appID, 'sk-proj-second-user-key-123456');
    expect(stored.status).toBe(201);
    expect(stored.body.data.handle).toStartWith('kh_');
    const keyID = stored.body.data.handle.slice(3, 25);
    const record = await harness.keyStore.findRecord(keyID);
    expect(JSON.stringify(record)).not.toContain('sk-proj-second-user-key');
  });

  it('rejects unknown apps and empty keys', async () => {
    expect((await harness.storeKey('app_unknown', SAMPLE_API_KEY)).status).toBe(404);
    expect((await harness.storeKey(CHAT_APP.appID, '  ')).status).toBe(400);
  });
});

describe('calling providers through the gateway with official SDKs', () => {
  it('completes an OpenAI chat with the real key swapped in', async () => {
    const completion = await createOpenAIClient(
      CHAT_APP.appSecret,
      chatHandle
    ).chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Hi' }]
    });
    expect(completion.choices[0]?.message.content).toBe('Hello');
    const forwarded = harness.mockProvider.recordedRequests.at(-1);
    expect(forwarded?.headers.get('authorization')).toBe(`Bearer ${SAMPLE_API_KEY}`);
    expect(forwarded?.headers.get('x-key-handle')).toBeNull();
  });

  it('streams an OpenAI reply and records token usage without prompts', async () => {
    const stream = await createOpenAIClient(CHAT_APP.appSecret, chatHandle).chat.completions.create(
      {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Summarise this' }],
        stream: true
      }
    );
    const parts: string[] = [];
    for await (const chunk of stream) parts.push(chunk.choices[0]?.delta.content ?? '');
    expect(parts.join('')).toBe('Here is a summary.');
    await Bun.sleep(10);
    const lastEvent = harness.usageLedger.listEvents().at(-1);
    expect(lastEvent?.usage).toEqual({ inputTokens: 41, outputTokens: 17 });
    expect(JSON.stringify(lastEvent)).not.toContain('Summarise');
  });

  it('streams an Anthropic message with the app secret sent as x-api-key', async () => {
    const anthropic = new Anthropic({
      apiKey: CHAT_APP.appSecret,
      baseURL: `${harness.gatewayURL}/anthropic`,
      defaultHeaders: { 'x-key-handle': chatHandle },
      maxRetries: 0
    });
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-5',
      max_tokens: 64,
      messages: [{ role: 'user', content: 'Hi' }]
    });
    const message = await stream.finalMessage();
    expect(message.content[0]).toEqual({ type: 'text', text: 'Hi there' });
    expect(harness.mockProvider.recordedRequests.at(-1)?.headers.get('x-api-key')).toBe(
      SAMPLE_API_KEY
    );
  });
});

describe('refusing bad requests', () => {
  const chatRequest = (headers: Record<string, string>) =>
    callGateway('/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [] })
    });

  it('answers 401 for a missing or wrong app secret', async () => {
    expect((await chatRequest({ 'x-key-handle': chatHandle })).status).toBe(401);
    const wrongSecret = await chatRequest({
      authorization: 'Bearer app_sk_wrong',
      'x-key-handle': chatHandle
    });
    expect(wrongSecret.status).toBe(401);
    expect(await wrongSecret.json()).toEqual({
      data: null,
      message: 'This app secret is not valid'
    });
  });

  it('answers 400 for a missing or malformed handle', async () => {
    expect((await chatRequest({ authorization: `Bearer ${CHAT_APP.appSecret}` })).status).toBe(400);
    const malformed = await chatRequest({
      authorization: `Bearer ${CHAT_APP.appSecret}`,
      'x-key-handle': 'kh_bad'
    });
    expect(malformed.status).toBe(400);
  });

  it('answers 403 when another app uses a stolen handle', async () => {
    const response = await chatRequest({
      authorization: `Bearer ${DESK_APP.appSecret}`,
      'x-key-handle': chatHandle
    });
    expect(response.status).toBe(403);
  });

  it('answers 400 for provider paths outside the API', async () => {
    const response = await callGateway('/openai/v2/models', {
      headers: { authorization: `Bearer ${CHAT_APP.appSecret}`, 'x-key-handle': chatHandle }
    });
    expect(response.status).toBe(400);
  });
});
