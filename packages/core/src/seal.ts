import { combineShares, decryptSecret, encryptSecret } from './crypto.ts';
import { generateDataKey, splitDataKey } from './crypto.ts';
import { decodeBase64URL, decodeText, encodeBase64URL } from './encoding.ts';
import { encodeText, wipeBytes } from './encoding.ts';
import { createHandle, generateKeyID, parseHandle } from './handle.ts';
import { fail, succeed } from './result.ts';

import type { Bytes, OpenSecretError, OpenSecretInput, Result } from './types.ts';
import type { SealSecretInput, SealSecretResult } from './types.ts';

function buildAssociatedData(appID: string, keyID: string): Bytes {
  return encodeText(`${appID}:${keyID}`);
}

export async function sealSecret({
  appID,
  apiKey,
  keyWrapper
}: SealSecretInput): Promise<SealSecretResult> {
  const keyID = generateKeyID();
  const dataKey = generateDataKey();
  const plaintext = encodeText(apiKey);
  const associatedData = buildAssociatedData(appID, keyID);
  const { ciphertext, iv } = await encryptSecret({ plaintext, dataKey, associatedData });
  const { shareA, shareB } = splitDataKey(dataKey);
  const wrappedShareB = await keyWrapper.wrap(appID, shareB);
  const handle = createHandle(keyID, shareA);
  wipeBytes(plaintext);
  wipeBytes(dataKey);
  wipeBytes(shareB);
  return {
    handle,
    record: {
      keyID,
      appID,
      ciphertext: encodeBase64URL(ciphertext),
      iv: encodeBase64URL(iv),
      wrappedShareB: encodeBase64URL(wrappedShareB)
    }
  };
}

export async function openSecret({
  appID,
  handle,
  record,
  keyWrapper
}: OpenSecretInput): Promise<Result<string, OpenSecretError>> {
  const parsedHandle = parseHandle(handle);
  if (!parsedHandle.ok) return parsedHandle;
  if (parsedHandle.value.keyID !== record.keyID) return fail('handle_mismatch');
  if (record.appID !== appID) return fail('app_mismatch');

  const unwrapped = await keyWrapper.unwrap(appID, decodeBase64URL(record.wrappedShareB));
  if (!unwrapped.ok) return unwrapped;

  const dataKey = combineShares({ shareA: parsedHandle.value.shareA, shareB: unwrapped.value });
  const decrypted = await decryptSecret({
    ciphertext: decodeBase64URL(record.ciphertext),
    iv: decodeBase64URL(record.iv),
    dataKey,
    associatedData: buildAssociatedData(appID, record.keyID)
  });
  wipeBytes(dataKey);
  wipeBytes(unwrapped.value);
  if (!decrypted.ok) return decrypted;

  const apiKey = decodeText(decrypted.value);
  wipeBytes(decrypted.value);
  return succeed(apiKey);
}
