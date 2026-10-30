export const MAX_API_KEY_LENGTH = 512;
export const RELEASE_TIME_TO_LIVE_SECONDS = 300;
export const PROVIDER_ROUTE_PATTERN = /^\/(openai|anthropic|gemini|openrouter)(\/.*)$/;
export const KEY_ROUTE_PATTERN = /^\/keys\/([A-Za-z0-9_-]{22})$/;
export const APP_SECRET_HEADERS = ['authorization', 'x-api-key', 'x-goog-api-key'];
export const KEY_HANDLE_HEADER = 'x-key-handle';
export const GATEWAY_APPS_PATH = '/api/gateway/apps';
export const GATEWAY_USAGE_PATH = '/api/gateway/usage';
export const MINIMUM_REFRESH_GAP_MILLISECONDS = 1000;
export const MAXIMUM_USAGE_BATCH_SIZE = 1000;
export const GATEWAY_KEYS_PATH = '/api/gateway/keys';
export const ATTESTATION_PATH = '/v1/attestation';
export const MAXIMUM_NONCE_LENGTH = 512;
export const GATEWAY_TOKEN_PURPOSE = 'gateway-token';
export const ENCLAVE_PLACEHOLDER_CREDENTIALS = {
  accessKeyId: 'enclave-placeholder',
  secretAccessKey: 'enclave-placeholder'
};
