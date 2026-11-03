import { succeed } from '@fiducy/core';

import type { Bytes, KeyWrapper } from '@fiducy/core';
import type { CachedShare, CachingKeyWrapperOptions } from './types';

function buildCacheKey(appID: string, wrapped: Bytes): string {
  return `${appID}:${Buffer.from(wrapped).toString('base64')}`;
}

export function createCachingKeyWrapper({
  keyWrapper,
  timeToLiveMilliseconds,
  maximumEntries,
  readCurrentTime = Date.now
}: CachingKeyWrapperOptions): KeyWrapper {
  const cachedShares = new Map<string, CachedShare>();

  const removeShare = (cacheKey: string) => {
    cachedShares.get(cacheKey)?.share.fill(0);
    cachedShares.delete(cacheKey);
  };

  const readCachedShare = (cacheKey: string) => {
    const cached = cachedShares.get(cacheKey);
    if (!cached) return null;
    if (cached.expiresAt <= readCurrentTime()) {
      removeShare(cacheKey);
      return null;
    }
    cachedShares.delete(cacheKey);
    cachedShares.set(cacheKey, cached);
    return cached.share;
  };

  const saveShare = (cacheKey: string, share: Bytes) => {
    const oldestCacheKey = cachedShares.keys().next().value;
    if (cachedShares.size >= maximumEntries && oldestCacheKey !== undefined) {
      removeShare(oldestCacheKey);
    }
    const expiresAt = readCurrentTime() + timeToLiveMilliseconds;
    cachedShares.set(cacheKey, { share: new Uint8Array(share), expiresAt });
  };

  const unwrap = async (appID: string, wrapped: Bytes) => {
    const cacheKey = buildCacheKey(appID, wrapped);
    const cachedShare = readCachedShare(cacheKey);
    if (cachedShare) return succeed(new Uint8Array(cachedShare));
    const unwrapped = await keyWrapper.unwrap(appID, wrapped);
    if (unwrapped.ok) saveShare(cacheKey, unwrapped.value);
    return unwrapped;
  };

  return { wrap: keyWrapper.wrap, unwrap };
}
