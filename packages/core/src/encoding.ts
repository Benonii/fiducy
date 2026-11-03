import type { Bytes } from './types.ts';

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function encodeBase64URL(bytes: Bytes): string {
  return Buffer.from(bytes).toString('base64url');
}

export function decodeBase64URL(text: string): Bytes {
  return new Uint8Array(Buffer.from(text, 'base64url'));
}

export function encodeText(text: string): Bytes {
  return textEncoder.encode(text);
}

export function decodeText(bytes: Bytes): string {
  return textDecoder.decode(bytes);
}

export function generateRandomBytes(length: number): Bytes {
  return crypto.getRandomValues(new Uint8Array(length));
}

export function wipeBytes(bytes: Bytes): void {
  bytes.fill(0);
}

export function concatenateBytes(first: Bytes, second: Bytes): Bytes {
  const combined = new Uint8Array(first.length + second.length);
  combined.set(first, 0);
  combined.set(second, first.length);
  return combined;
}
