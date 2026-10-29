import { IV_LENGTH, MASTER_KEY_LENGTH, WRAPPER_SALT } from './constants';
import { concatenateBytes, encodeText, generateRandomBytes } from './encoding';
import { fail, succeed } from './result';

import type { KeyWrapper } from './types';

async function deriveAppKey(masterKey: CryptoKey, appID: string): Promise<CryptoKey> {
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: encodeText(WRAPPER_SALT), info: encodeText(appID) },
    masterKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function assertMasterKeyLength(masterKey: Uint8Array): void {
  if (masterKey.length !== MASTER_KEY_LENGTH) {
    throw new Error(`Master key must be ${MASTER_KEY_LENGTH} bytes, received ${masterKey.length}`);
  }
}

export function createLocalKeyWrapper(rawMasterKey: Uint8Array): KeyWrapper {
  assertMasterKeyLength(rawMasterKey);
  const masterKey = crypto.subtle.importKey('raw', rawMasterKey, 'HKDF', false, ['deriveKey']);

  const wrap = async (appID: string, bytes: Uint8Array): Promise<Uint8Array> => {
    const iv = generateRandomBytes(IV_LENGTH);
    const appKey = await deriveAppKey(await masterKey, appID);
    const additionalData = encodeText(appID);
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv, additionalData },
      appKey,
      bytes
    );
    return concatenateBytes(iv, new Uint8Array(encrypted));
  };

  const unwrap = async (appID: string, wrapped: Uint8Array) => {
    try {
      const appKey = await deriveAppKey(await masterKey, appID);
      const iv = wrapped.slice(0, IV_LENGTH);
      const additionalData = encodeText(appID);
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv, additionalData },
        appKey,
        wrapped.slice(IV_LENGTH)
      );
      return succeed(new Uint8Array(decrypted));
    } catch {
      return fail('unwrap_failed' as const);
    }
  };

  return { wrap, unwrap };
}
