import { describe, expect, it } from 'bun:test';

import { combineShares, createHandle, createLocalKeyWrapper } from '../src';
import { generateDataKey, generateKeyID, parseHandle } from '../src';
import { splitDataKey } from '../src';
import { OTHER_APP_ID, SAMPLE_APP_ID, createTestKeyWrapper } from './fixtures';

describe('splitting a data key', () => {
  it('rebuilds the original key from both shares', () => {
    const dataKey = generateDataKey();
    const shares = splitDataKey(dataKey);
    expect(combineShares(shares)).toEqual(dataKey);
  });

  it('never hands out the data key itself as a share', () => {
    const dataKey = generateDataKey();
    const { shareA, shareB } = splitDataKey(dataKey);
    expect(shareA).not.toEqual(dataKey);
    expect(shareB).not.toEqual(dataKey);
  });

  it('produces different shares each time the same key is split', () => {
    const dataKey = generateDataKey();
    expect(splitDataKey(dataKey).shareA).not.toEqual(splitDataKey(dataKey).shareA);
  });

  it('refuses to combine shares of different lengths', () => {
    expect(() =>
      combineShares({ shareA: new Uint8Array(32), shareB: new Uint8Array(16) })
    ).toThrow();
  });
});

describe('parsing handles', () => {
  const keyID = generateKeyID();
  const shareA = generateDataKey();
  const handle = createHandle(keyID, shareA);

  it('reads back the key ID and share A', () => {
    expect(parseHandle(handle)).toEqual({ ok: true, value: { keyID, shareA } });
  });

  it('rejects handles with the wrong prefix, length or characters', () => {
    const malformedHandles = [
      '',
      handle.replace('kh_', 'kx_'),
      handle.slice(0, -1),
      `${handle}A`,
      handle.replace('.', '!'),
      `${handle}.extra`,
      handle.replace(/.$/, '+')
    ];
    for (const malformedHandle of malformedHandles) {
      expect(parseHandle(malformedHandle)).toEqual({ ok: false, error: 'invalid_handle' });
    }
  });
});

describe('the local key wrapper', () => {
  const keyWrapper = createTestKeyWrapper();
  const secretBytes = generateDataKey();

  it('unwraps what it wrapped for the same app', async () => {
    const wrapped = await keyWrapper.wrap(SAMPLE_APP_ID, secretBytes);
    expect(await keyWrapper.unwrap(SAMPLE_APP_ID, wrapped)).toEqual({
      ok: true,
      value: secretBytes
    });
  });

  it('refuses to unwrap for a different app', async () => {
    const wrapped = await keyWrapper.wrap(SAMPLE_APP_ID, secretBytes);
    expect(await keyWrapper.unwrap(OTHER_APP_ID, wrapped)).toEqual({
      ok: false,
      error: 'unwrap_failed'
    });
  });

  it('refuses truncated input instead of throwing', async () => {
    expect(await keyWrapper.unwrap(SAMPLE_APP_ID, new Uint8Array(5))).toEqual({
      ok: false,
      error: 'unwrap_failed'
    });
  });

  it('rejects a master key that is not 32 bytes', () => {
    expect(() => createLocalKeyWrapper(new Uint8Array(16))).toThrow();
  });
});
