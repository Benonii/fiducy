export type ProviderName = 'openai' | 'anthropic' | 'gemini' | 'openrouter';

export interface ProviderConfiguration {
  name: ProviderName;
  baseURL: string;
  allowedPathPrefix: string;
  authorizationHeader: string;
  formatAuthorization: (apiKey: string) => string;
  defaultHeaders: Record<string, string>;
}

export type ProviderRegistry = Record<ProviderName, ProviderConfiguration>;

export interface UpstreamRequestInput {
  provider: ProviderConfiguration;
  path: string;
  method: string;
  headers: Headers;
  body: string | ReadableStream<Uint8Array> | null;
  apiKey: string;
}

export type UpstreamRequestError = 'path_not_allowed';

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface RelayResponseInput {
  upstreamResponse: Response;
  apiKey: string;
  onUsage: (usage: TokenUsage) => void;
}
