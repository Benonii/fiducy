export { combineShares, decryptSecret, encryptSecret } from './crypto';
export { generateDataKey, splitDataKey } from './crypto';
export { createHandle, generateKeyID, parseHandle } from './handle';
export { createLocalKeyWrapper } from './keyWrapper';
export { openSecret, sealSecret } from './seal';

export type { KeyWrapper, OpenSecretError, Result } from './types';
export type { SealedRecord, SealSecretResult } from './types';
