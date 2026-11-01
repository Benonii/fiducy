import { SAMPLE_API_KEY } from './fixtures';

import type { RecordedRequest } from './types';

const encoder = new TextEncoder();

export const OPENAI_STREAM_CHUNKS = [
  'data: {"id":"chatcmpl-1","choices":[{"index":0,"delta":{"role":"assistant","content":"Here is"}}]}\n\n',
  'data: {"id":"chatcmpl-1","choices":[{"index":0,"delta":{"content":" a summ',
  'ary."}}]}\n\ndata: {"id":"chatcmpl-1","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\n',
  'data: {"id":"chatcmpl-1","choices":[],"usage":{"prompt_tokens":41,"completion_tokens":17}}\n\n',
  'data: [DONE]\n\n'
];

export const ANTHROPIC_STREAM_CHUNKS = [
  'event: message_start\ndata: {"type":"message_start","message":{"id":"msg_01","type":"message","role":"assistant","model":"claude-sonnet-4-5","content":[],"stop_reason":null,"stop_sequence":null,"usage":{"input_tokens":25,"output_tokens":1}}}\n\n',
  'event: content_block_start\ndata: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}\n\n',
  'event: content_block_delta\ndata: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Hi there"}}\n\n',
  'event: content_block_stop\ndata: {"type":"content_block_stop","index":0}\n\n',
  'event: message_delta\ndata: {"type":"message_delta","delta":{"stop_reason":"end_turn","stop_sequence":null},"usage":{"output_tokens":12}}\n\n',
  'event: message_stop\ndata: {"type":"message_stop"}\n\n'
];

function streamChunks(chunks: string[]): Response {
  const body = new ReadableStream({
    start: (controller) => {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    }
  });
  return new Response(body, { headers: { 'content-type': 'text/event-stream' } });
}

function answerChatCompletion(body: string): Response {
  if (JSON.parse(body).stream) return streamChunks(OPENAI_STREAM_CHUNKS);
  return Response.json(
    {
      id: 'chatcmpl-0',
      choices: [
        { index: 0, message: { role: 'assistant', content: 'Hello' }, finish_reason: 'stop' }
      ],
      usage: { prompt_tokens: 9, completion_tokens: 3 }
    },
    { headers: { 'set-cookie': 'tracking=1' } }
  );
}

function answerInvalidKey(): Response {
  const message = `Incorrect API key provided: sk-proj-a81f****9c2e. Received ${SAMPLE_API_KEY}`;
  return Response.json({ error: { message } }, { status: 401 });
}

export function startMockProvider() {
  const recordedRequests: RecordedRequest[] = [];
  const server = Bun.serve({
    port: 0,
    fetch: async (request) => {
      const path = new URL(request.url).pathname;
      const body = await request.text();
      recordedRequests.push({ path, headers: request.headers, body });
      if (path === '/v1/chat/completions') return answerChatCompletion(body);
      if (path === '/v1/messages') return streamChunks(ANTHROPIC_STREAM_CHUNKS);
      if (path === '/v1/invalid-key') return answerInvalidKey();
      return new Response('not found', { status: 404 });
    }
  });
  return { server, recordedRequests, baseURL: `http://localhost:${server.port}` };
}
