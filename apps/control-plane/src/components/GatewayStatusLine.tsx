'use client';

import { useGatewayStatus } from '@/lib/queries';
import { cn } from '@/lib/utils';

import { formatRelativeTime } from './format';

import type { GatewayStatus } from '@/lib/types';

function describeGateway(status: GatewayStatus | undefined): string {
  if (!status) return 'Gateway status unavailable';
  if (status.reachable) return 'Gateway online';
  return status.lastSeenAt ? 'Gateway unreachable' : 'Gateway not seen yet';
}

function describeAttestation(status: GatewayStatus | undefined): string {
  if (!status?.pcr0) return 'Enclave not attested yet';
  return status.attestedAt
    ? `Enclave attested ${formatRelativeTime(status.attestedAt)}`
    : 'Enclave attested';
}

export function GatewayStatusLine() {
  const gatewayStatus = useGatewayStatus();
  const status = gatewayStatus.data;
  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-x-2.5 gap-y-0.5">
      <span
        aria-hidden="true"
        className={cn(
          'size-2 border border-foreground',
          status?.reachable ? 'bg-foreground' : 'bg-transparent'
        )}
      />
      <span className="text-foreground text-xs">{describeGateway(status)}</span>
      <span className="col-start-2 text-ink-quiet text-xs">{describeAttestation(status)}</span>
    </div>
  );
}
