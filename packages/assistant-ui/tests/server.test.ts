import { describe, expect, it } from 'bun:test';

import { CONNECT_KEY_TOOL, requestKey, withoutKeyRequests } from '../src/server';

import type { UIMessage } from 'ai';

function keyRequestMessage(toolCallId: string): UIMessage {
  return {
    id: 'a1',
    role: 'assistant',
    parts: [
      { type: 'text', text: 'Connect your OpenAI key to keep going.' },
      {
        type: `tool-${CONNECT_KEY_TOOL}`,
        toolCallId,
        state: 'output-available',
        input: { provider: 'openai' },
        output: { connected: true, provider: 'openai' }
      }
    ]
  } as UIMessage;
}

const question: UIMessage = { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'Hi' }] };

describe('requestKey', () => {
  it('streams a message that calls the connect tool for the provider', async () => {
    const response = requestKey({ provider: 'gemini' });
    const body = await response.text();
    expect(response.headers.get('content-type')).toContain('text/event-stream');
    expect(body).toContain('Connect your Gemini key to keep going.');
    expect(body).toContain('"type":"tool-input-available"');
    expect(body).toContain(`"toolName":"${CONNECT_KEY_TOOL}"`);
    expect(body).toContain('"input":{"provider":"gemini"}');
    expect(body).toMatch(/"toolCallId":"fiducy_[0-9a-f-]{36}"/);
  });
});

describe('withoutKeyRequests', () => {
  it('drops the key requests the server made so the question is last', () => {
    expect(withoutKeyRequests([question, keyRequestMessage('fiducy_1')])).toEqual([question]);
  });

  it('keeps key requests the model made itself', () => {
    const fromModel = keyRequestMessage('call_abc');
    expect(withoutKeyRequests([question, fromModel])).toEqual([question, fromModel]);
  });
});
