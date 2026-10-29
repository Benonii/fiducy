export type Bytes = Uint8Array<ArrayBuffer>;

export type Result<Value, Failure> = { ok: true; value: Value } | { ok: false; error: Failure };

export interface EncryptedSecret {
  ciphertext: Bytes;
  iv: Bytes;
}

export interface EncryptSecretInput {
  plaintext: Bytes;
  dataKey: Bytes;
  associatedData: Bytes;
}

export interface DecryptSecretInput extends EncryptedSecret {
  dataKey: Bytes;
  associatedData: Bytes;
}

export interface KeyShares {
  shareA: Bytes;
  shareB: Bytes;
}

export interface ParsedHandle {
  keyID: string;
  shareA: Bytes;
}

export interface KeyWrapper {
  wrap: (appID: string, bytes: Bytes) => Promise<Bytes>;
  unwrap: (appID: string, wrapped: Bytes) => Promise<Result<Bytes, 'unwrap_failed'>>;
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
