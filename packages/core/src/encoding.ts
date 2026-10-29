const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function encodeBase64URL(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64url');
}

export function decodeBase64URL(text: string): Uint8Array {
  return new Uint8Array(Buffer.from(text, 'base64url'));
}

export function encodeText(text: string): Uint8Array {
  return textEncoder.encode(text);
}

export function decodeText(bytes: Uint8Array): string {
  return textDecoder.decode(bytes);
}

export function generateRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

export function wipeBytes(bytes: Uint8Array): void {
  bytes.fill(0);
}

export function concatenateBytes(first: Uint8Array, second: Uint8Array): Uint8Array {
  const combined = new Uint8Array(first.length + second.length);
  combined.set(first, 0);
  combined.set(second, first.length);
  return combined;
}
