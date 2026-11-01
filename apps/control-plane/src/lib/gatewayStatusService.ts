import { GATEWAY_REACHABLE_WITHIN_MILLISECONDS } from './constants';

import type { ControlStore, GatewayAttestation, GatewayStatus } from './types';

export async function noteGatewayContact(store: ControlStore, now = new Date()) {
  await store.saveGatewayHeartbeat({ lastSeenAt: now.toISOString() });
}

export async function noteGatewayAttestation(store: ControlStore, attestation: GatewayAttestation) {
  await store.saveGatewayAttestation(attestation);
}

export async function readGatewayStatus(
  store: ControlStore,
  now = new Date()
): Promise<GatewayStatus> {
  const heartbeat = await store.readGatewayHeartbeat();
  const attestation = await store.readGatewayAttestation();
  const lastSeenAt = heartbeat?.lastSeenAt ?? null;
  const reachable =
    lastSeenAt !== null &&
    now.getTime() - new Date(lastSeenAt).getTime() <= GATEWAY_REACHABLE_WITHIN_MILLISECONDS;
  return {
    reachable,
    lastSeenAt,
    measurement: attestation?.measurement ?? null,
    attestedAt: attestation?.attestedAt ?? null,
    region: process.env.AWS_REGION ?? null
  };
}
