import { Badge } from '@/components/ui/badge';

import { KeyLimitMeter } from './KeyLimitMeter';
import { RevokeKey } from './RevokeKey';
import { formatDay, formatProvider, formatRelativeTime, shortenIdentifier } from './format';

import type { KeysTableProps } from './types';

export function KeysList({ appID, keys, usage, monthlyLimit }: KeysTableProps) {
  return (
    <ul className="grid">
      {keys.map((key) => (
        <li
          key={key.keyID}
          className={`grid gap-3 border-b border-dashed py-4 first:pt-0 last:border-b-0 last:pb-0 ${key.status === 'revoked' ? 'text-ink-quiet' : ''}`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="grid min-w-0 gap-0.5">
              <code className="truncate text-xs">{shortenIdentifier(key.keyID, 14)}</code>
              <span className="text-sm">{formatProvider(key.provider)}</span>
            </div>
            <Badge variant={key.status === 'active' ? 'outline' : 'secondary'}>
              {key.status === 'active' ? 'Active' : 'Revoked'}
            </Badge>
          </div>
          <KeyLimitMeter
            requestCount={usage?.requestsByKey[key.keyID] ?? 0}
            monthlyLimit={monthlyLimit}
          />
          <div className="flex items-center justify-between gap-3 text-xs">
            <span>
              Last used {key.lastUsedAt ? formatRelativeTime(key.lastUsedAt) : 'never'}, added{' '}
              {formatDay(key.createdAt)}
            </span>
            {key.status === 'active' ? <RevokeKey appID={appID} keyID={key.keyID} /> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
