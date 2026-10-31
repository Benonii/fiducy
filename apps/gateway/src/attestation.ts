import { ATTESTATION_PATH } from './constants';

import type { AttestationSource } from './types';

export function createEnclaverAttestation(apiURL: string): AttestationSource {
  return async (nonce) => {
    const body = nonce ? { nonce: Buffer.from(nonce).toString('base64') } : {};
    const response = await fetch(new URL(ATTESTATION_PATH, apiURL), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!response.ok) return null;
    return new Uint8Array(await response.arrayBuffer());
  };
}
