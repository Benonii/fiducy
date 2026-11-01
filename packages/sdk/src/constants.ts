export const KEY_HANDLE_HEADER = 'x-key-handle';
export const KEY_RECORD_HEADER = 'x-key-record';

export const PROVIDER_BASE_PATHS = {
  openai: '/openai/v1',
  anthropic: '/anthropic/v1',
  gemini: '/gemini/v1beta',
  openrouter: '/openrouter/api/v1'
} as const;
