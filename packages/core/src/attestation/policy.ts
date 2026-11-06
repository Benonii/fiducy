import { ATTESTATION_ERROR_MESSAGES, LOCAL_GATEWAY_HOSTNAMES } from './constants.ts';
import { parsePCR0List } from './pcr.ts';

import type { AttestationDecision, AttestationPolicyInput } from './types.ts';
import type { GatewayAttestationError } from './types.ts';

export function isLocalGateway(gatewayURL: string): boolean {
  const hostname = URL.parse(gatewayURL)?.hostname ?? '';
  return LOCAL_GATEWAY_HOSTNAMES.includes(hostname);
}

export function decideAttestation({
  gatewayURL,
  enclavePCR0,
  skipAttestation
}: AttestationPolicyInput): AttestationDecision {
  if (parsePCR0List(enclavePCR0 ?? undefined).length > 0) return 'verify';
  if (skipAttestation || isLocalGateway(gatewayURL)) return 'skip';
  return 'refuse';
}

export function describeMissingPCR0(gatewayURL: string): string {
  return `Fiducy will not send keys to ${gatewayURL} until it can check the enclave. Set FIDUCY_ENCLAVE_PCR0 to the PCR0 your deploy printed, or set FIDUCY_SKIP_ATTESTATION=true for a test gateway that is not in an enclave.`;
}

export function describeSkippedAttestation(gatewayURL: string): string {
  return `Fiducy: FIDUCY_SKIP_ATTESTATION is on, so keys go to ${gatewayURL} without checking its enclave. Use this only for a test gateway.`;
}

export function describeAttestationError(error: GatewayAttestationError): string {
  return `Fiducy refused the gateway: ${ATTESTATION_ERROR_MESSAGES[error]}. No key was sent.`;
}
