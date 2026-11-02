import { REDACTED_TEXT, SECRET_PATTERN } from './constants.ts';

export function redactSecrets(text: string, apiKey: string): string {
  const withoutExactKey = apiKey ? text.replaceAll(apiKey, REDACTED_TEXT) : text;
  return withoutExactKey.replace(SECRET_PATTERN, REDACTED_TEXT);
}
