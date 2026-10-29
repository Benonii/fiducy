import { describe, expect, it } from 'bun:test';

import { openSecret, sealSecret } from '../src';
import { OTHER_APP_ID, SAMPLE_API_KEY, SAMPLE_APP_ID } from './fixtures';
import { createTestKeyWrapper } from './fixtures';

const keyWrapper = createTestKeyWrapper();

async function sealSampleKey() {
  return sealSecret({ appID: SAMPLE_APP_ID, apiKey: SAMPLE_API_KEY, keyWrapper });
}

function replaceCharacterAt(text: string, position: number): string {
  const replacement = text[position] === 'A' ? 'B' : 'A';
  return `${text.slice(0, position)}${replacement}${text.slice(position + 1)}`;
}

describe('sealing and opening an API key', () => {
  it('returns the original key when opened with its handle', async () => {
    const { handle, record } = await sealSampleKey();
    const opened = await openSecret({ appID: SAMPLE_APP_ID, handle, record, keyWrapper });
    expect(opened).toEqual({ ok: true, value: SAMPLE_API_KEY });
  });

  it('issues a handle in the kh_<keyID>.<shareA> format', async () => {
    const { handle, record } = await sealSampleKey();
    expect(handle).toMatch(/^kh_[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}$/);
    expect(handle.startsWith(`kh_${record.keyID}.`)).toBe(true);
  });

  it('never stores the plaintext key in the record', async () => {
    const { record } = await sealSampleKey();
    const storedText = JSON.stringify(record);
    expect(storedText).not.toContain(SAMPLE_API_KEY);
    expect(storedText).not.toContain(Buffer.from(SAMPLE_API_KEY).toString('base64url'));
  });

  it('gives every sealed key its own key ID, IV and handle', async () => {
    const first = await sealSampleKey();
    const second = await sealSampleKey();
    expect(first.record.keyID).not.toBe(second.record.keyID);
    expect(first.record.iv).not.toBe(second.record.iv);
    expect(first.handle).not.toBe(second.handle);
  });

  it('fails to decrypt when share A in the handle is altered', async () => {
    const { handle, record } = await sealSampleKey();
    const alteredHandle = replaceCharacterAt(handle, handle.indexOf('.') + 1);
    const opened = await openSecret({
      appID: SAMPLE_APP_ID,
      handle: alteredHandle,
      record,
      keyWrapper
    });
    expect(opened).toEqual({ ok: false, error: 'decryption_failed' });
  });

  it('fails to decrypt when the stored ciphertext is tampered with', async () => {
    const { handle, record } = await sealSampleKey();
    const tamperedRecord = { ...record, ciphertext: replaceCharacterAt(record.ciphertext, 0) };
    const opened = await openSecret({
      appID: SAMPLE_APP_ID,
      handle,
      record: tamperedRecord,
      keyWrapper
    });
    expect(opened.ok).toBe(false);
  });

  it('rejects a handle that belongs to a different key', async () => {
    const first = await sealSampleKey();
    const second = await sealSampleKey();
    const opened = await openSecret({
      appID: SAMPLE_APP_ID,
      handle: second.handle,
      record: first.record,
      keyWrapper
    });
    expect(opened).toEqual({ ok: false, error: 'handle_mismatch' });
  });

  it('rejects a request from another app', async () => {
    const { handle, record } = await sealSampleKey();
    const opened = await openSecret({ appID: OTHER_APP_ID, handle, record, keyWrapper });
    expect(opened).toEqual({ ok: false, error: 'app_mismatch' });
  });

  it('cannot be opened after an attacker reassigns the record to another app', async () => {
    const { handle, record } = await sealSampleKey();
    const movedRecord = { ...record, appID: OTHER_APP_ID };
    const opened = await openSecret({
      appID: OTHER_APP_ID,
      handle,
      record: movedRecord,
      keyWrapper
    });
    expect(opened).toEqual({ ok: false, error: 'unwrap_failed' });
  });

  it('cannot be opened with a different master key', async () => {
    const { handle, record } = await sealSampleKey();
    const otherKeyWrapper = createTestKeyWrapper(9);
    const opened = await openSecret({
      appID: SAMPLE_APP_ID,
      handle,
      record,
      keyWrapper: otherKeyWrapper
    });
    expect(opened).toEqual({ ok: false, error: 'unwrap_failed' });
  });

  it('reports a malformed handle instead of throwing', async () => {
    const { record } = await sealSampleKey();
    const opened = await openSecret({
      appID: SAMPLE_APP_ID,
      handle: 'sk-not-a-handle',
      record,
      keyWrapper
    });
    expect(opened).toEqual({ ok: false, error: 'invalid_handle' });
  });
});
