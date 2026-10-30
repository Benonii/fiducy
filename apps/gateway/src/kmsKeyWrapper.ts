import { DecryptCommand, EncryptCommand, KMSClient } from '@aws-sdk/client-kms';
import { fail, succeed } from '@fiducy/core';

import { ENCLAVE_PLACEHOLDER_CREDENTIALS } from './constants';

import type { KeyWrapper } from '@fiducy/core';
import type { KmsKeyWrapperOptions, KmsSender } from './types';

function buildEncryptionContext(appID: string): Record<string, string> {
  return { fiducyAppID: appID };
}

export function createKmsClient(endpoint: string, region: string): KmsSender {
  // Inside the enclave, the Enclaver KMS proxy re-signs every call with the parent's role
  // and attaches the attestation document, so these placeholder credentials never reach AWS.
  const kms = new KMSClient({ endpoint, region, credentials: ENCLAVE_PLACEHOLDER_CREDENTIALS });
  return {
    send: (command) => (command instanceof EncryptCommand ? kms.send(command) : kms.send(command))
  };
}

export function createKmsKeyWrapper({ client, keyID }: KmsKeyWrapperOptions): KeyWrapper {
  const wrap = async (appID: string, bytes: Uint8Array) => {
    const output = await client.send(
      new EncryptCommand({
        KeyId: keyID,
        Plaintext: bytes,
        EncryptionContext: buildEncryptionContext(appID)
      })
    );
    if (!output.CiphertextBlob) throw new Error('KMS returned no ciphertext');
    return output.CiphertextBlob;
  };

  const unwrap = async (appID: string, wrapped: Uint8Array) => {
    try {
      const output = await client.send(
        new DecryptCommand({
          KeyId: keyID,
          CiphertextBlob: wrapped,
          EncryptionContext: buildEncryptionContext(appID)
        })
      );
      if (!output.Plaintext) return fail('unwrap_failed' as const);
      return succeed(output.Plaintext);
    } catch (error) {
      console.error(`KMS refused to unwrap: ${error instanceof Error ? error.name : 'unknown'}`);
      return fail('unwrap_failed' as const);
    }
  };

  return { wrap, unwrap };
}

export async function decryptBootSecret(
  client: KmsSender,
  keyID: string,
  ciphertext: string,
  purpose: string
): Promise<string> {
  const output = await client.send(
    new DecryptCommand({
      KeyId: keyID,
      CiphertextBlob: new Uint8Array(Buffer.from(ciphertext, 'base64')),
      EncryptionContext: { fiducyPurpose: purpose }
    })
  );
  if (!output.Plaintext) throw new Error(`KMS returned nothing for ${purpose}`);
  return new TextDecoder().decode(output.Plaintext);
}
