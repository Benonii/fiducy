import { GATEWAY_KEYS_PATH } from './constants';
import { callControlPlane } from './controlPlane';

import type { SealedRecord } from '@fiducy/core';
import type { ControlPlaneConnection, KeyStore } from './types';

// Sealed records are ciphertext. Storing them on the control plane is safe because opening one
// still needs the app's handle and a KMS decrypt that only the attested enclave can make.
export function createRemoteKeyStore(connection: ControlPlaneConnection): KeyStore {
  const recordPath = (keyID: string) => `${GATEWAY_KEYS_PATH}/${encodeURIComponent(keyID)}`;
  return {
    saveRecord: async (record) => {
      await callControlPlane(connection, GATEWAY_KEYS_PATH, {
        method: 'POST',
        body: JSON.stringify(record)
      });
    },
    findRecord: async (keyID) => {
      const record = await callControlPlane(connection, recordPath(keyID), {}, [404]);
      return (record as SealedRecord | null) ?? null;
    },
    deleteRecord: async (keyID) => {
      const deleted = await callControlPlane(
        connection,
        recordPath(keyID),
        { method: 'DELETE' },
        [404]
      );
      return deleted !== null;
    }
  };
}
