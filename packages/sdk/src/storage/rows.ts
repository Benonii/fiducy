import { isProvider, isSealedRecord } from '../server/validators.ts';

import type { StoredUserKey } from '../server/types.ts';
import type { UserKeyRow } from './types.ts';

function parseRecord(record: string | null): StoredUserKey['record'] {
  if (record === null) return undefined;
  const parsed: unknown = JSON.parse(record);
  if (!isSealedRecord(parsed)) throw new Error('A stored sealed record is malformed');
  return parsed;
}

export function toUserKeyRow(key: StoredUserKey): UserKeyRow {
  return {
    user_id: key.userID,
    key_id: key.keyID,
    provider: key.provider,
    handle: key.handle,
    record: key.record ? JSON.stringify(key.record) : null,
    created_at: key.createdAt
  };
}

export function fromUserKeyRow(row: UserKeyRow): StoredUserKey {
  if (!isProvider(row.provider)) throw new Error('A stored key has an unknown provider');
  const key: StoredUserKey = {
    userID: row.user_id,
    provider: row.provider,
    keyID: row.key_id,
    handle: row.handle,
    createdAt: row.created_at
  };
  const record = parseRecord(row.record);
  if (record) key.record = record;
  return key;
}
