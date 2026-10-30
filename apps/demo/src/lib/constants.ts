import type { DemoModel } from './types';

export const DEFAULT_GATEWAY_URL = 'http://localhost:8787';
export const CHAT_API_PATH = '/api/chat';
export const FIDUCY_BASE_PATH = '/api/fiducy';
export const FIDUCY_STORAGE_MOUNT = 'fiducy';
export const DEMO_USER_COOKIE = 'fiducy_demo_user';
export const DEMO_USER_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const DEMO_MODELS: DemoModel[] = [
  { id: 'gpt-5-mini', label: 'GPT-5 mini', provider: 'openai' },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5', provider: 'anthropic' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', provider: 'gemini' },
  { id: 'openrouter/auto', label: 'OpenRouter Auto', provider: 'openrouter' }
];

export const DEFAULT_MODEL_ID = 'gpt-5-mini';

export const SUGGESTIONS = [
  'Summarize this contract in three lines',
  'Draft a reply declining the meeting',
  'Explain what an attested enclave is'
];
