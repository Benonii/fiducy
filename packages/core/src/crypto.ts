import { DATA_KEY_LENGTH, IV_LENGTH } from './constants';
import { generateRandomBytes } from './encoding';
import { fail, succeed } from './result';

import type { Bytes, DecryptSecretInput, EncryptSecretInput, EncryptedSecret } from './types';
import type { KeyShares, Result } from './types';

export function generateDataKey(): Bytes {
  return generateRandomBytes(DATA_KEY_LENGTH);
}

export async function importAESKey(rawKey: Bytes): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

export async function encryptSecret({
  plaintext,
  dataKey,
  associatedData
}: EncryptSecretInput): Promise<EncryptedSecret> {
  const iv = generateRandomBytes(IV_LENGTH);
  const key = await importAESKey(dataKey);
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: associatedData },
    key,
    plaintext
  );
  return { ciphertext: new Uint8Array(encrypted), iv };
}

export async function decryptSecret({
  ciphertext,
  iv,
  dataKey,
  associatedData
}: DecryptSecretInput): Promise<Result<Bytes, 'decryption_failed'>> {
  try {
    const key = await importAESKey(dataKey);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv, additionalData: associatedData },
      key,
      ciphertext
    );
    return succeed(new Uint8Array(decrypted));
  } catch {
    return fail('decryption_failed');
  }
}

export function xorBytes(first: Bytes, second: Bytes): Bytes {
  if (first.length !== second.length) {
    throw new Error(`Cannot combine byte arrays of length ${first.length} and ${second.length}`);
  }
  return first.map((byte, index) => byte ^ (second[index] ?? 0));
}

export function splitDataKey(dataKey: Bytes): KeyShares {
  const shareA = generateRandomBytes(dataKey.length);
  return { shareA, shareB: xorBytes(dataKey, shareA) };
}

export function combineShares({ shareA, shareB }: KeyShares): Bytes {
  return xorBytes(shareA, shareB);
}
