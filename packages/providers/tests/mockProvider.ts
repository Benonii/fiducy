import { SAMPLE_API_KEY } from './fixtures';

export interface RecordedRequest {
  path: string;
  headers: Headers;
  body: string;
}

const encoder = new TextEncoder();

export const OPENAI_STREAM_CHUNKS = [
  'data: {"choices":[{"delta":{"content":"Here is"}}]}\n\n',
  'data: {"choices":[{"delta":{"content":" a summ',
  'ary."}}]}\n\ndata: {"choices":[],"usage":{"prompt_tokens":41,"completion_tokens":17}}\n\n',
  'data: [DONE]\n\n'
];

export const ANTHROPIC_STREAM_CHUNKS = [
  'event: message_start\ndata: {"type":"message_start","message":{"usage":{"input_tokens":25,"output_tokens":1}}}\n\n',
  'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"text":"Hi"}}\n\n',
  'event: message_delta\ndata: {"type":"message_delta","usage":{"output_tokens":12}}\n\n'
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
      choices: [{ message: { content: 'Hello' } }],
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
