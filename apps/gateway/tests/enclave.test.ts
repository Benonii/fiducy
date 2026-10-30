import { afterAll, describe, expect, it } from 'bun:test';

import { DecryptCommand, EncryptCommand } from '@aws-sdk/client-kms';
import { openSecret, sealSecret } from '@fiducy/core';
import { createProviderRegistry } from '@fiducy/providers';

import { createKmsKeyWrapper, decryptBootSecret } from '../src/kmsKeyWrapper';
import { createMemoryAppDirectory, createMemoryUsageLedger } from '../src/memoryStores';
import { createMemoryKeyStore } from '../src/memoryStores';
import { createRemoteKeyStore } from '../src/remoteKeyStore';
import { createGateway } from '../src/router';
import { GATEWAY_TOKEN, startFakeControlPlane } from './fakeControlPlane';
import { CHAT_APP } from './harness';

import type { KmsOutput, KmsSender } from '../src/types';

const KEY_ID = 'arn:aws:kms:us-east-1:111122223333:key/test';

// Stands in for KMS: encrypts by prefixing the context, and refuses to decrypt when the
// attestation check fails, the way the real key policy refuses a parent-side Decrypt.
function createFakeKms() {
  let attested = true;
  const sealed = new Map<string, { plaintext: Uint8Array; context: string }>();
  const client: KmsSender = {
    send: async (command): Promise<KmsOutput> => {
      const context = JSON.stringify(command.input.EncryptionContext);
      if (command instanceof EncryptCommand) {
        const blob = crypto.getRandomValues(new Uint8Array(24));
        sealed.set(Buffer.from(blob).toString('hex'), {
          plaintext: new Uint8Array(command.input.Plaintext ?? []),
          context
        });
        return { CiphertextBlob: blob };
      }
      if (!(command instanceof DecryptCommand) || !attested) throw new Error('AccessDenied');
      const entry = sealed.get(Buffer.from(command.input.CiphertextBlob ?? []).toString('hex'));
      if (!entry || entry.context !== context) throw new Error('InvalidCiphertextException');
      return { Plaintext: entry.plaintext };
    }
  };
  return {
    client,
    sealed,
    refuseAttestation: () => {
      attested = false;
    }
  };
}

describe('wrapping share B with KMS', () => {
  it('seals and opens a key through KMS, bound to the app', async () => {
    const kms = createFakeKms();
    const keyWrapper = createKmsKeyWrapper({ client: kms.client, keyID: KEY_ID });
    const { handle, record } = await sealSecret({
      appID: 'app_one',
      apiKey: 'sk-live',
      keyWrapper
    });
    const opened = await openSecret({ appID: 'app_one', handle, record, keyWrapper });
    expect(opened).toEqual({ ok: true, value: 'sk-live' });
    const otherApp = await keyWrapper.unwrap(
      'app_two',
      Buffer.from(record.wrappedShareB, 'base64url')
    );
    expect(otherApp.ok).toBe(false);
  });

  it('cannot open a key when KMS refuses the attestation', async () => {
    const kms = createFakeKms();
    const keyWrapper = createKmsKeyWrapper({ client: kms.client, keyID: KEY_ID });
    const { handle, record } = await sealSecret({
      appID: 'app_one',
      apiKey: 'sk-live',
      keyWrapper
    });
    kms.refuseAttestation();
    const opened = await openSecret({ appID: 'app_one', handle, record, keyWrapper });
    expect(opened).toEqual({ ok: false, error: 'unwrap_failed' });
  });

  it('decrypts a boot secret only with its purpose', async () => {
    const kms = createFakeKms();
    const { CiphertextBlob } = await kms.client.send(
      new EncryptCommand({
        KeyId: KEY_ID,
        Plaintext: new TextEncoder().encode('token_123'),
        EncryptionContext: { fiducyPurpose: 'gateway-token' }
      })
    );
    const ciphertext = Buffer.from(CiphertextBlob ?? []).toString('base64');
    expect(await decryptBootSecret(kms.client, KEY_ID, ciphertext, 'gateway-token')).toBe(
      'token_123'
    );
    expect(decryptBootSecret(kms.client, KEY_ID, ciphertext, 'other')).rejects.toThrow();
  });
});

describe('keeping sealed records on the control plane', () => {
  const controlPlane = startFakeControlPlane();
  const store = createRemoteKeyStore({
    controlPlaneURL: controlPlane.controlPlaneURL,
    gatewayToken: GATEWAY_TOKEN
  });
  afterAll(() => controlPlane.stop());

  it('saves, finds and deletes a record', async () => {
    const record = {
      keyID: 'AAAAAAAAAAAAAAAAAAAAAA',
      appID: 'app_one',
      ciphertext: 'abc',
      iv: 'def',
      wrappedShareB: 'ghi'
    };
    await store.saveRecord(record);
    expect(await store.findRecord(record.keyID)).toEqual(record);
    expect(await store.deleteRecord(record.keyID)).toBe(true);
    expect(await store.findRecord(record.keyID)).toBeNull();
    expect(await store.deleteRecord(record.keyID)).toBe(false);
  });
});

describe('serving attestation documents', () => {
  const createTestGateway = async (attest?: (nonce: Uint8Array | null) => Promise<Uint8Array>) =>
    createGateway({
      keyWrapper: createKmsKeyWrapper({ client: createFakeKms().client, keyID: KEY_ID }),
      keyStore: createMemoryKeyStore(),
      appDirectory: await createMemoryAppDirectory([CHAT_APP]),
      usageLedger: createMemoryUsageLedger(),
      providerRegistry: createProviderRegistry(),
      attest
    });

  it('returns the document with the caller nonce', async () => {
    const gateway = await createTestGateway(async (nonce) =>
      new TextEncoder().encode(`doc:${new TextDecoder().decode(nonce ?? new Uint8Array())}`)
    );
    const response = await gateway(new Request('http://gateway/attestation?nonce=n123'));
    const body = (await response.json()) as { data: { document: string } };
    expect(response.status).toBe(200);
    expect(Buffer.from(body.data.document, 'base64').toString()).toBe('doc:n123');
  });

  it('says so when it is not in an enclave', async () => {
    const gateway = await createTestGateway();
    const response = await gateway(new Request('http://gateway/attestation'));
    expect(response.status).toBe(404);
  });
});
