export const GITHUB_URL = 'https://github.com/Benonii/fiducy';
export const DEMO_URL: string | null = import.meta.env.VITE_FIDUCY_DEMO_URL ?? null;
export const INSTALL_COMMAND = 'bun add @fiducy/sdk @fiducy/farm';
export const PROVIDERS = ['OpenAI', 'Anthropic', 'Gemini', 'OpenRouter'] as const;
export const REQUEST_TRACE = [
  { step: 'handle received', detail: 'kh_9f2c…' },
  { step: 'enclave attested', detail: 'PCR0 a41e…' },
  { step: 'key opened', detail: 'in memory' },
  { step: 'openai', detail: '200 · streamed' },
  { step: 'key dropped', detail: 'request ended' }
];

export const SHOWCASE_CODE = `import { ConnectKeyWidget } from '@fiducy/sdk/react';

<ConnectKeyWidget provider="openai" appID="app_acme" />

const settings = await fiducy.providerSettings('openai', { userID });
const result = streamText({
  model: createOpenAI(settings).chat('gpt-4o-mini'),
  messages
});`;
export const SHOWCASE_KEY = 'sk-proj-7Tq2m9Lx4bVn8cRk0wXWYZ';
export const SHOWCASE_QUESTION = 'Summarize this contract in three lines.';
export const SHOWCASE_ANSWER =
  'The vendor licenses the software for 12 months, renews automatically, and either side can end it with 30 days notice.';
export const SHOWCASE_STEPS = [
  { value: 'key', label: 'Connect key' },
  { value: 'ask', label: 'Ask' },
  { value: 'answer', label: 'Answer' }
] as const;
