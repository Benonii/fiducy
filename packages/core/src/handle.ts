import { HANDLE_PATTERN, HANDLE_PREFIX, KEY_ID_LENGTH } from './constants';
import { decodeBase64URL, encodeBase64URL, generateRandomBytes } from './encoding';
import { fail, succeed } from './result';

import type { Bytes, ParsedHandle, Result } from './types';

export function generateKeyID(): string {
  return encodeBase64URL(generateRandomBytes(KEY_ID_LENGTH));
}

export function createHandle(keyID: string, shareA: Bytes): string {
  return `${HANDLE_PREFIX}${keyID}.${encodeBase64URL(shareA)}`;
}

export function parseHandle(handle: string): Result<ParsedHandle, 'invalid_handle'> {
  const match = HANDLE_PATTERN.exec(handle);
  const keyID = match?.[1];
  const encodedShareA = match?.[2];
  if (!keyID || !encodedShareA) {
    return fail('invalid_handle');
  }
  return succeed({ keyID, shareA: decodeBase64URL(encodedShareA) });
}
