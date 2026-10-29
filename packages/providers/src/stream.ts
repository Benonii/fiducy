import { mergeUsage, parseJSON, readUsage } from './usage';

import type { TokenUsage } from './types';

function readEventData(line: string): string | null {
  if (!line.startsWith('data:')) return null;
  const data = line.slice('data:'.length).trim();
  return data && data !== '[DONE]' ? data : null;
}

export function createUsageObservingStream(onUsage: (usage: TokenUsage) => void) {
  const decoder = new TextDecoder();
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

  return new TransformStream<Uint8Array, Uint8Array>({
    transform: (chunk, controller) => {
      controller.enqueue(chunk);
      observeLines(decoder.decode(chunk, { stream: true }));
    },
    flush: () => {
      observeLines(`${decoder.decode()}\n`);
      onUsage(usage);
    }
  });
}
