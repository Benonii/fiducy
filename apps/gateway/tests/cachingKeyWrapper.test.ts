import { describe, expect, it } from 'bun:test';
import { createLocalKeyWrapper, openSecret, sealSecret } from '@fiducy/core';

import { SAMPLE_API_KEY } from '@fiducy/testing';
import { createCachingKeyWrapper } from '../src/cachingKeyWrapper';
import { CHAT_APP, DESK_APP } from './harness';

import type { KeyWrapper } from '@fiducy/core';

const TIME_TO_LIVE_MILLISECONDS = 300000;

function createCountingKeyWrapper() {
  const localKeyWrapper = createLocalKeyWrapper(crypto.getRandomValues(new Uint8Array(32)));
  const counter = { unwrapCalls: 0 };
  const keyWrapper: KeyWrapper = {
    wrap: localKeyWrapper.wrap,
    unwrap: (appID, wrapped) => {
      counter.unwrapCalls += 1;
      return localKeyWrapper.unwrap(appID, wrapped);
    }
  };
  return { keyWrapper, counter };
}

function createCachedSetup(maximumEntries = 100) {
  const { keyWrapper, counter } = createCountingKeyWrapper();
  const clock = { currentTime: 1_000_000 };
  const cachingKeyWrapper = createCachingKeyWrapper({
    keyWrapper,
    timeToLiveMilliseconds: TIME_TO_LIVE_MILLISECONDS,
    maximumEntries,
    readCurrentTime: () => clock.currentTime
  });
  const sealKey = (appID: string, apiKey = SAMPLE_API_KEY) =>
    sealSecret({ appID, apiKey, keyWrapper: cachingKeyWrapper });
  const openKey = (appID: string, sealed: Awaited<ReturnType<typeof sealKey>>) =>
    openSecret({ appID, ...sealed, keyWrapper: cachingKeyWrapper });
  return { counter, clock, sealKey, openKey };
}

describe('caching unwrapped shares', () => {
  it('opens the same key twice with one call to the inner key wrapper', async () => {
    const { counter, sealKey, openKey } = createCachedSetup();
    const sealed = await sealKey(CHAT_APP.appID);
    expect(await openKey(CHAT_APP.appID, sealed)).toEqual({ ok: true, value: SAMPLE_API_KEY });
    expect(await openKey(CHAT_APP.appID, sealed)).toEqual({ ok: true, value: SAMPLE_API_KEY });
    expect(counter.unwrapCalls).toBe(1);
  });

  it('unwraps again once the cached share is five minutes old', async () => {
    const { counter, clock, sealKey, openKey } = createCachedSetup();
    const sealed = await sealKey(CHAT_APP.appID);
    await openKey(CHAT_APP.appID, sealed);
    clock.currentTime += TIME_TO_LIVE_MILLISECONDS - 1;
    await openKey(CHAT_APP.appID, sealed);
    expect(counter.unwrapCalls).toBe(1);
    clock.currentTime += 1;
    expect(await openKey(CHAT_APP.appID, sealed)).toEqual({ ok: true, value: SAMPLE_API_KEY });
    expect(counter.unwrapCalls).toBe(2);
  });

  it('keeps shares of different keys apart', async () => {
    const { counter, sealKey, openKey } = createCachedSetup();
    const firstSealed = await sealKey(CHAT_APP.appID, 'sk-proj-first-user-key-111111');
    const secondSealed = await sealKey(CHAT_APP.appID, 'sk-proj-second-user-key-222222');
    expect(await openKey(CHAT_APP.appID, firstSealed)).toMatchObject({
      value: 'sk-proj-first-user-key-111111'
    });
    expect(await openKey(CHAT_APP.appID, secondSealed)).toMatchObject({
      value: 'sk-proj-second-user-key-222222'
    });
    expect(counter.unwrapCalls).toBe(2);
  });

  it('does not let another app open a key through the cache', async () => {
    const { sealKey, openKey } = createCachedSetup();
    const sealed = await sealKey(CHAT_APP.appID);
    await openKey(CHAT_APP.appID, sealed);
    const forgedRecord = { ...sealed.record, appID: DESK_APP.appID };
    const opened = await openKey(DESK_APP.appID, { ...sealed, record: forgedRecord });
    expect(opened).toEqual({ ok: false, error: 'unwrap_failed' });
  });

  it('does not cache failed unwraps', async () => {
    const { counter, sealKey, openKey } = createCachedSetup();
    const sealed = await sealKey(CHAT_APP.appID);
    const forgedRecord = { ...sealed.record, appID: DESK_APP.appID };
    await openKey(DESK_APP.appID, { ...sealed, record: forgedRecord });
    await openKey(DESK_APP.appID, { ...sealed, record: forgedRecord });
    expect(counter.unwrapCalls).toBe(2);
  });

  it('drops the least recently used share when the cache is full', async () => {
    const { counter, sealKey, openKey } = createCachedSetup(2);
    const firstSealed = await sealKey(CHAT_APP.appID);
    const secondSealed = await sealKey(CHAT_APP.appID);
    const thirdSealed = await sealKey(CHAT_APP.appID);
    await openKey(CHAT_APP.appID, firstSealed);
    await openKey(CHAT_APP.appID, secondSealed);
    await openKey(CHAT_APP.appID, firstSealed);
    await openKey(CHAT_APP.appID, thirdSealed);
    expect(counter.unwrapCalls).toBe(3);
    await openKey(CHAT_APP.appID, firstSealed);
    expect(counter.unwrapCalls).toBe(3);
    await openKey(CHAT_APP.appID, secondSealed);
    expect(counter.unwrapCalls).toBe(4);
  });
});
