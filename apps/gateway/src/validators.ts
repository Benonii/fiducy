import { fail, succeed } from '@fiducy/core';

import { MAX_API_KEY_LENGTH, MAX_RECORD_HEADER_LENGTH } from './constants';
import { describeFailure } from './responses';

import type { SealedRecord } from '@fiducy/core';
import type { GatewayResult, StoreKeyBody } from './types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonEmptyString(value: unknown, maximumLength: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maximumLength;
}

export function validateStoreKeyBody(body: unknown): GatewayResult<StoreKeyBody> {
  if (!isRecord(body)) return fail(describeFailure(400, 'Send a JSON body with appID and apiKey'));
  if (!isNonEmptyString(body.appID, 64)) return fail(describeFailure(400, 'appID is required'));
  if (!isNonEmptyString(body.apiKey, MAX_API_KEY_LENGTH)) {
    return fail(
      describeFailure(400, `apiKey is required and must be under ${MAX_API_KEY_LENGTH} characters`)
    );
  }
  return succeed({ appID: body.appID, apiKey: body.apiKey.trim() });
}

export async function readJSONBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;
const RECORD_FIELDS = ['keyID', 'appID', 'ciphertext', 'iv', 'wrappedShareB'] as const;

// The app sends its stored record as base64url JSON. Tampering only makes decryption fail,
// because the record is bound to its app and key ID by AES-GCM and by KMS.
export function parseRecordHeader(header: string): GatewayResult<SealedRecord> {
  const malformed = fail(describeFailure(400, 'The key record header is malformed'));
  if (header.length > MAX_RECORD_HEADER_LENGTH || !BASE64URL_PATTERN.test(header)) return malformed;
  try {
    const parsed: unknown = JSON.parse(Buffer.from(header, 'base64url').toString('utf8'));
    if (!isRecord(parsed)) return malformed;
    const fieldsAreValid = RECORD_FIELDS.every((field) => isNonEmptyString(parsed[field], 4096));
    if (!fieldsAreValid) return malformed;
    return succeed(parsed as unknown as SealedRecord);
  } catch {
    return malformed;
  }
}
