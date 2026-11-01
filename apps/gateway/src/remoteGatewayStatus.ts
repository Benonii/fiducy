import { GATEWAY_STATUS_PATH } from './constants';
import { callControlPlane, normalizeError } from './controlPlane';

import type { AttestationSource, GatewayStatusReporter } from './types';
import type { GatewayStatusReporterOptions } from './types';

async function checkAttestation(attest: AttestationSource | undefined): Promise<boolean> {
  if (!attest) return false;
  try {
    return (await attest(null)) !== null;
  } catch (error) {
    console.error(`The enclave did not answer an attestation check: ${normalizeError(error)}`);
    return false;
  }
}

export function createRemoteGatewayStatus(
  options: GatewayStatusReporterOptions
): GatewayStatusReporter {
  let attestedAt: string | null = null;

  const report = async () => {
    if (await checkAttestation(options.attest)) attestedAt = new Date().toISOString();
    try {
      await callControlPlane(options, GATEWAY_STATUS_PATH, {
        method: 'POST',
        body: JSON.stringify({ measurement: options.measurement, attestedAt })
      });
      return true;
    } catch (error) {
      console.error(`Could not report the gateway status: ${normalizeError(error)}`);
      return false;
    }
  };

  const timer = setInterval(report, options.reportIntervalMilliseconds);

  return { report, stop: () => clearInterval(timer) };
}
