import type { ProviderName, ProviderRegistry } from './types';

function formatBearer(apiKey: string): string {
  return `Bearer ${apiKey}`;
}

function passThrough(apiKey: string): string {
  return apiKey;
}

export function createProviderRegistry(
  baseURLOverrides: Partial<Record<ProviderName, string>> = {}
): ProviderRegistry {
  return {
    openai: {
      name: 'openai',
      baseURL: baseURLOverrides.openai ?? 'https://api.openai.com',
      allowedPathPrefix: '/v1/',
      authorizationHeader: 'authorization',
      formatAuthorization: formatBearer,
      defaultHeaders: {}
    },
    anthropic: {
      name: 'anthropic',
      baseURL: baseURLOverrides.anthropic ?? 'https://api.anthropic.com',
      allowedPathPrefix: '/v1/',
      authorizationHeader: 'x-api-key',
      formatAuthorization: passThrough,
      defaultHeaders: { 'anthropic-version': '2023-06-01' }
    },
    gemini: {
      name: 'gemini',
      baseURL: baseURLOverrides.gemini ?? 'https://generativelanguage.googleapis.com',
      allowedPathPrefix: '/v1beta/',
      authorizationHeader: 'x-goog-api-key',
      formatAuthorization: passThrough,
      defaultHeaders: {}
    },
    openrouter: {
      name: 'openrouter',
      baseURL: baseURLOverrides.openrouter ?? 'https://openrouter.ai',
      allowedPathPrefix: '/api/v1/',
      authorizationHeader: 'authorization',
      formatAuthorization: formatBearer,
      defaultHeaders: {}
    }
  };
}
