export const GITHUB_URL = 'https://github.com/Benonii/fiducy';
export const DEMO_URL = import.meta.env.VITE_FIDUCY_DEMO_URL ?? 'http://localhost:3001';
export const INSTALL_COMMAND = 'bun add @fiducy/sdk @fiducy/farm';
export const PROVIDERS = ['OpenAI', 'Anthropic', 'Gemini', 'OpenRouter'] as const;
export const REQUEST_TRACE = [
  { step: 'handle received', detail: 'kh_9f2c…' },
  { step: 'enclave attested', detail: 'PCR0 a41e…' },
  { step: 'key opened', detail: 'in memory' },
  { step: 'openai', detail: '200 · streamed' },
  { step: 'key dropped', detail: 'request ended' }
];
