import { APP_ID_BYTES, APP_ID_PREFIX, APP_SECRET_BYTES } from './constants';
import { APP_SECRET_PREFIX, APP_SECRET_PREVIEW_LENGTH } from './constants';

function generateRandomToken(byteLength: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return Buffer.from(bytes).toString('base64url');
}

export async function hashSecret(secret: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret));
  return Buffer.from(digest).toString('hex');
}

export function generateAppID(): string {
  return `${APP_ID_PREFIX}${generateRandomToken(APP_ID_BYTES)}`;
}

export function generateAppSecret(): string {
  return `${APP_SECRET_PREFIX}${generateRandomToken(APP_SECRET_BYTES)}`;
}

export function previewAppSecret(appSecret: string): string {
  return appSecret.slice(-APP_SECRET_PREVIEW_LENGTH);
}

export function matchesToken(received: string, expected: string): boolean {
  const receivedBytes = new TextEncoder().encode(received);
  const expectedBytes = new TextEncoder().encode(expected);
  if (receivedBytes.length !== expectedBytes.length) return false;
  let difference = 0;
  for (let index = 0; index < expectedBytes.length; index += 1) {
    difference |= (receivedBytes[index] ?? 0) ^ (expectedBytes[index] ?? 0);
  }
  return difference === 0;
}
