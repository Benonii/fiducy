import { SEALED_RECORD_FIELDS } from '@fiducy/core';

import { PROVIDER_BASE_PATHS } from '../constants.ts';

import type { SealedRecord } from '@fiducy/core';
import type { GatewayProvider } from '../types.ts';
import type { KeySource } from './types.ts';

export function isProvider(value: unknown): value is GatewayProvider {
  return typeof value === 'string' && value in PROVIDER_BASE_PATHS;
}

export function isKeySource(value: unknown): value is KeySource {
  return value === 'widget' || value === 'import';
}

export function isSealedRecord(value: unknown): value is SealedRecord {
  if (typeof value !== 'object' || value === null) return false;
  const fields = value as Record<string, unknown>;
  return SEALED_RECORD_FIELDS.every((field) => typeof fields[field] === 'string');
}
