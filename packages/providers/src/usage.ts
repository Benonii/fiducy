import type { TokenUsage } from './types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readNumber(source: unknown, keys: string[]): number {
  if (!isRecord(source)) return 0;
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'number') return value;
  }
  return 0;
}

function findUsageObject(payload: Record<string, unknown>): unknown {
  const message = payload.message;
  if (isRecord(message) && isRecord(message.usage)) return message.usage;
  return payload.usage ?? payload.usageMetadata;
}

export function readUsage(payload: unknown): TokenUsage {
  if (!isRecord(payload)) return { inputTokens: 0, outputTokens: 0 };
  const usage = findUsageObject(payload);
  return {
    inputTokens: readNumber(usage, ['prompt_tokens', 'input_tokens', 'promptTokenCount']),
    outputTokens: readNumber(usage, ['completion_tokens', 'output_tokens', 'candidatesTokenCount'])
  };
}

export function mergeUsage(current: TokenUsage, next: TokenUsage): TokenUsage {
  return {
    inputTokens: Math.max(current.inputTokens, next.inputTokens),
    outputTokens: Math.max(current.outputTokens, next.outputTokens)
  };
}

export function parseJSON(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
