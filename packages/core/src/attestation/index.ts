export { AWS_NITRO_ROOT_FINGERPRINT } from './constants.ts';
export { decodeBase64 } from './bytes.ts';
export { verifyGatewayAttestation } from './gateway.ts';
export { isPCR, normalizePCR, parsePCRList } from './pcr.ts';
export { decideAttestation, describeAttestationError, describeMissingPCR0 } from './policy.ts';
export { describeSkippedAttestation, isLocalGateway } from './policy.ts';
export { verifyNitroAttestation } from './verifyAttestation.ts';

export type { AttestationDecision, AttestationError, AttestationPolicyInput } from './types.ts';
export type { FetchAttestation, GatewayAttestationError, VerifiedAttestation } from './types.ts';
export type { VerifyAttestationInput, VerifyGatewayInput } from './types.ts';
