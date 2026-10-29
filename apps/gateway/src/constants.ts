export const MAX_API_KEY_LENGTH = 512;
export const RELEASE_TIME_TO_LIVE_SECONDS = 300;
export const PROVIDER_ROUTE_PATTERN = /^\/(openai|anthropic|gemini|openrouter)(\/.*)$/;
export const KEY_ROUTE_PATTERN = /^\/keys\/([A-Za-z0-9_-]{22})$/;
export const APP_SECRET_HEADERS = ['authorization', 'x-api-key', 'x-goog-api-key'];
export const KEY_HANDLE_HEADER = 'x-key-handle';
