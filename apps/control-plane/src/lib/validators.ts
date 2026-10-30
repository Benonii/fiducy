import { z } from 'zod';

import { MAXIMUM_ALLOWED_ORIGINS, MAXIMUM_MONTHLY_REQUEST_LIMIT } from './constants';
import { MAXIMUM_USAGE_BATCH_SIZE } from './constants';
import { DEFAULT_USAGE_SERIES_DAYS, MAXIMUM_USAGE_SERIES_DAYS } from './constants';

function isBareOrigin(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === 'https:' || url.protocol === 'http:') && url.origin === value;
  } catch {
    return false;
  }
}

const originSchema = z
  .string()
  .trim()
  .refine(isBareOrigin, 'Use a bare origin such as https://example.com with no path');

export const appSettingsSchema = z.object({
  name: z.string().trim().min(1, 'Give the app a name').max(80),
  accessMode: z.enum(['gateway', 'gateway_and_release']).default('gateway'),
  monthlyRequestLimitPerKey: z.coerce.number().int().min(1).max(MAXIMUM_MONTHLY_REQUEST_LIMIT),
  allowedOrigins: z.array(originSchema).max(MAXIMUM_ALLOWED_ORIGINS),
  recordStorage: z.enum(['fiducy', 'app']).default('fiducy')
});

export const appSettingsUpdateSchema = appSettingsSchema.partial();

export const usageEventSchema = z.object({
  appID: z.string().min(1),
  keyID: z.string().min(1),
  provider: z.string().min(1),
  inputTokens: z.number().int().min(0),
  outputTokens: z.number().int().min(0),
  recordedAt: z.string().datetime()
});

export const usageBatchSchema = z.object({
  events: z.array(usageEventSchema).max(MAXIMUM_USAGE_BATCH_SIZE)
});

const base64URLSchema = z.string().regex(/^[A-Za-z0-9_-]+$/, 'Use base64url');

export const keyRecordSchema = z.object({
  keyID: z.string().regex(/^[A-Za-z0-9_-]{22}$/, 'Use a 22 character key ID'),
  appID: z.string().min(1).max(80),
  ciphertext: base64URLSchema.max(4096),
  iv: base64URLSchema.max(64),
  wrappedShareB: base64URLSchema.max(4096)
});

export const seededAppSchema = appSettingsSchema.extend({
  appID: z.string().regex(/^app_[A-Za-z0-9_-]{1,64}$/, 'App IDs start with app_'),
  appSecretHash: z.string().regex(/^[a-f0-9]{64}$/, 'Send a SHA-256 hex digest')
});

export const usageSeriesQuerySchema = z.object({
  days: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAXIMUM_USAGE_SERIES_DAYS)
    .default(DEFAULT_USAGE_SERIES_DAYS)
});
