export type Result<Value, Failure> = { ok: true; value: Value } | { ok: false; error: Failure };

export interface EncryptedSecret {
  ciphertext: Uint8Array;
  iv: Uint8Array;
}

export interface EncryptSecretInput {
  plaintext: Uint8Array;
  dataKey: Uint8Array;
  associatedData: Uint8Array;
}

export interface DecryptSecretInput extends EncryptedSecret {
  dataKey: Uint8Array;
  associatedData: Uint8Array;
}

export interface KeyShares {
  shareA: Uint8Array;
  shareB: Uint8Array;
}

export interface ParsedHandle {
  keyID: string;
  shareA: Uint8Array;
}

export interface KeyWrapper {
  wrap: (appID: string, bytes: Uint8Array) => Promise<Uint8Array>;
  unwrap: (appID: string, wrapped: Uint8Array) => Promise<Result<Uint8Array, 'unwrap_failed'>>;
}

export interface SealedRecord {
  keyID: string;
  appID: string;
  ciphertext: string;
  iv: string;
  wrappedShareB: string;
}

export interface SealSecretInput {
  appID: string;
  apiKey: string;
  keyWrapper: KeyWrapper;
}

export interface SealSecretResult {
  handle: string;
  record: SealedRecord;
}

export interface OpenSecretInput {
  appID: string;
  handle: string;
  record: SealedRecord;
  keyWrapper: KeyWrapper;
}

export type OpenSecretError =
  | 'invalid_handle'
  | 'handle_mismatch'
  | 'app_mismatch'
  | 'unwrap_failed'
  | 'decryption_failed';
