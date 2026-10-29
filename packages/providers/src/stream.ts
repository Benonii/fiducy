import { mergeUsage, parseJSON, readUsage } from './usage';

import type { TokenUsage } from './types';

function readEventData(line: string): string | null {
  if (!line.startsWith('data:')) return null;
  const data = line.slice('data:'.length).trim();
  return data && data !== '[DONE]' ? data : null;
}

function createUsageObserver() {
  let pendingText = '';
  let usage: TokenUsage = { inputTokens: 0, outputTokens: 0 };

  const observeLines = (text: string) => {
    const lines = `${pendingText}${text}`.split('\n');
    pendingText = lines.pop() ?? '';
    for (const line of lines) {
      const data = readEventData(line.trim());
      if (data) usage = mergeUsage(usage, readUsage(parseJSON(data)));
    }
  };

  return { observeLines, readUsage: () => usage };
}

export function observeUsageInBody(
  body: NonNullable<Response['body']>,
  onUsage: (usage: TokenUsage) => void
): ReadableStream<Uint8Array> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const observer = createUsageObserver();
  return new ReadableStream<Uint8Array>({
    pull: async (controller) => {
      const { done, value } = await reader.read();
      if (done) {
        observer.observeLines(`${decoder.decode()}\n`);
        onUsage(observer.readUsage());
        controller.close();
        return;
      }
      controller.enqueue(value);
      observer.observeLines(decoder.decode(value, { stream: true }));
    },
    cancel: (reason) => reader.cancel(reason)
  });
}
