import { decideAttestation, describeAttestationError } from '@fiducy/core/attestation';
import { describeMissingPCR0, describeSkippedAttestation } from '@fiducy/core/attestation';
import { isLocalGateway, verifyGatewayAttestation } from '@fiducy/core/attestation';

import { FiducyGatewayError } from './errors.ts';

import type { FetchGateway } from '../types.ts';
import type { FiducyConnection } from './types.ts';

export async function assertGatewayAttested(
  { gatewayURL, enclavePCR0, enclavePCR16, skipAttestation }: FiducyConnection,
  fetchGateway: FetchGateway = fetch
): Promise<void> {
  const decision = decideAttestation({ gatewayURL, enclavePCR0, skipAttestation });
  if (decision === 'refuse') throw new FiducyGatewayError(describeMissingPCR0(gatewayURL));
  if (decision === 'skip') {
    if (!isLocalGateway(gatewayURL)) console.warn(describeSkippedAttestation(gatewayURL));
    return;
  }
  const fetchAttestation = (url: string) => fetchGateway(url, { method: 'GET' });
  const expected = { enclavePCR0: enclavePCR0 ?? '', enclavePCR16 };
  const input = { gatewayURL, ...expected, fetch: fetchAttestation };
  const verified = await verifyGatewayAttestation(input);
  if (!verified.ok) throw new FiducyGatewayError(describeAttestationError(verified.error));
}
