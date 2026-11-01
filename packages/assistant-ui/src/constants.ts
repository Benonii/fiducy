import type { GatewayProvider } from '@fiducy/sdk/react';

/** The tool name the model and the app server use to ask for a key inside the thread. */
export const CONNECT_KEY_TOOL = 'connect_api_key';

/** Tool calls the app server makes itself (not the model) start with this, so they can be dropped later. */
export const SERVER_TOOL_CALL_PREFIX = 'fiducy_';

export const PROVIDER_LABELS: Record<GatewayProvider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  gemini: 'Gemini',
  openrouter: 'OpenRouter'
};

export const PROVIDERS = Object.keys(PROVIDER_LABELS) as GatewayProvider[];
