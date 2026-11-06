import { fail, succeed } from '../result.ts';
import { areBytesEqual, encodeHex, isAllZero } from './bytes.ts';
import { parseCertificate } from './certificate.ts';
import { importP384PublicKey, verifyCertificateChain, verifyP384Signature } from './chain.ts';
import { AWS_NITRO_ROOT_FINGERPRINT, DEBUG_MODE_PCR_INDEXES } from './constants.ts';
import { ECDSA_P384_COORDINATE_LENGTH, MAXIMUM_DOCUMENT_LENGTH } from './constants.ts';
import { decodeAttestationPayload, decodeCoseSign1 } from './document.ts';
import { encodeSignatureStructure, isES384Signed } from './document.ts';
import { normalizePCR0 } from './pcr.ts';

import type { Bytes, Result } from '../types.ts';
import type { AttestationError, CoseSignedMessage, NitroAttestationPayload } from './types.ts';
import type { VerifiedAttestation, VerifyAttestationInput } from './types.ts';

async function isSignedByLeaf(message: CoseSignedMessage, leaf: Bytes): Promise<boolean> {
  if (message.signature.length !== ECDSA_P384_COORDINATE_LENGTH * 2) return false;
  const { subjectPublicKeyInfo } = parseCertificate(leaf);
  const leafKey = await importP384PublicKey(subjectPublicKeyInfo);
  return verifyP384Signature(leafKey, message.signature, encodeSignatureStructure(message));
}

function readPCR0Error(
  payload: NitroAttestationPayload,
  expectedPCR0s: string[]
): AttestationError | null {
  const isDebugMode = DEBUG_MODE_PCR_INDEXES.some((index) => {
    const measurement = payload.pcrs.get(index);
    return !measurement || isAllZero(measurement);
  });
  if (isDebugMode) return 'debug_mode_enclave';
  const pcr0 = encodeHex(payload.pcrs.get(0) ?? new Uint8Array(0));
  return expectedPCR0s.map(normalizePCR0).includes(pcr0) ? null : 'unexpected_pcr0';
}

async function readDocumentError(
  message: CoseSignedMessage,
  payload: NitroAttestationPayload,
  trustedRootFingerprint: string
): Promise<AttestationError | null> {
  if (!isES384Signed(message.protectedHeader)) return 'unsupported_algorithm';
  const chain = [...payload.certificateBundle, payload.certificate];
  const verdict = await verifyCertificateChain(chain, trustedRootFingerprint, payload.timestamp);
  if (verdict === 'untrusted') return 'untrusted_certificate_chain';
  if (verdict === 'expired') return 'certificate_not_valid_at_timestamp';
  if (!(await isSignedByLeaf(message, payload.certificate))) return 'invalid_signature';
  return null;
}

async function checkAttestation(
  { document, nonce, expectedPCR0s }: VerifyAttestationInput,
  trustedRootFingerprint: string
): Promise<Result<VerifiedAttestation, AttestationError>> {
  if (document.length > MAXIMUM_DOCUMENT_LENGTH) return fail('malformed_document');
  const message = decodeCoseSign1(document);
  const payload = decodeAttestationPayload(message.payload);
  const documentError = await readDocumentError(message, payload, trustedRootFingerprint);
  if (documentError) return fail(documentError);
  if (!payload.nonce || !areBytesEqual(payload.nonce, nonce)) return fail('nonce_mismatch');
  const pcr0Error = readPCR0Error(payload, expectedPCR0s);
  if (pcr0Error) return fail(pcr0Error);
  const { moduleID, timestamp, userData, publicKey } = payload;
  const pcr0 = encodeHex(payload.pcrs.get(0) ?? new Uint8Array(0));
  return succeed({ pcr0, moduleID, timestamp, userData, publicKey });
}

export async function verifyAttestationWithRoot(
  input: VerifyAttestationInput,
  trustedRootFingerprint: string
): Promise<Result<VerifiedAttestation, AttestationError>> {
  try {
    return await checkAttestation(input, trustedRootFingerprint);
  } catch {
    return fail('malformed_document');
  }
}

export async function verifyNitroAttestation(
  input: VerifyAttestationInput
): Promise<Result<VerifiedAttestation, AttestationError>> {
  return verifyAttestationWithRoot(input, AWS_NITRO_ROOT_FINGERPRINT);
}
