export const MAX_API_KEY_LENGTH = 512;
export const RELEASE_TIME_TO_LIVE_SECONDS = 300;
export const PROVIDER_ROUTE_PATTERN = /^\/(openai|anthropic|gemini|openrouter)(\/.*)$/;
export const KEY_ROUTE_PATTERN = /^\/keys\/([A-Za-z0-9_-]{22})$/;
export const APP_SECRET_HEADERS = ['authorization', 'x-api-key', 'x-goog-api-key'];
export const KEY_HANDLE_HEADER = 'x-key-handle';
export const KEY_RECORD_HEADER = 'x-key-record';
export const MAX_RECORD_HEADER_LENGTH = 8192;
export const GATEWAY_APPS_PATH = '/api/gateway/apps';
export const GATEWAY_USAGE_PATH = '/api/gateway/usage';
export const GATEWAY_KEY_EVENTS_PATH = '/api/gateway/key-events';
export const MINIMUM_REFRESH_GAP_MILLISECONDS = 1000;
export const MAXIMUM_USAGE_BATCH_SIZE = 1000;
export const ATTESTATION_PATH = '/v1/attestation';
export const MAXIMUM_NONCE_LENGTH = 512;
export const GATEWAY_TOKEN_PURPOSE = 'gateway-token';
export const ENCLAVE_PLACEHOLDER_CREDENTIALS = {
  accessKeyId: 'enclave-placeholder',
  secretAccessKey: 'enclave-placeholder'
};
export const IMDS_URL = 'http://169.254.169.254';
export const IMDS_TOKEN_PATH = '/latest/api/token';
export const IMDS_ROLE_PATH = '/latest/meta-data/iam/security-credentials/';
export const IMDS_TOKEN_TTL_SECONDS = 300;
export const BLOB_KEY_PREFIX = 'blob:';
export const BLOB_ATTRIBUTE = 'blob';
export const TLS_STATE_BLOB_NAME = 'tls-state';
export const TLS_STATE_SCOPE = 'tls-state';
export const TLS_STATE_PERSIST_INTERVAL_MILLISECONDS = 60000;
export const SEALED_BLOB_KEY_LENGTH_BYTES = 2;
