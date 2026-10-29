import { fail, succeed } from '@fiducy/core';

import { MAX_API_KEY_LENGTH } from './constants';
import { describeFailure } from './responses';

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
