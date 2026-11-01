import { afterAll, beforeEach, describe, expect, it } from 'bun:test';

import { createRemoteAppDirectory } from '../src/remoteAppDirectory';
import { createRemoteGatewayStatus } from '../src/remoteGatewayStatus';
import { createRemoteUsageLedger } from '../src/remoteUsageLedger';
import { GATEWAY_TOKEN, startFakeControlPlane } from './fakeControlPlane';
import { CHAT_APP, DESK_APP } from './harness';

import type { UsageEvent } from '../src/types';

const controlPlane = startFakeControlPlane();
const connection = { controlPlaneURL: controlPlane.controlPlaneURL, gatewayToken: GATEWAY_TOKEN };

afterAll(() => controlPlane.stop());

function createUsageEvent(keyID: string): UsageEvent {
  return {
    appID: CHAT_APP.appID,
    keyID,
    provider: 'openai',
    usage: { inputTokens: 12, outputTokens: 30 },
    recordedAt: new Date()
  };
}

describe('loading app configs from the control plane', () => {
  beforeEach(() => controlPlane.setApps([CHAT_APP]));

  it('finds an app by ID and by its secret without receiving the secret', async () => {
    const directory = createRemoteAppDirectory({
      ...connection,
      refreshIntervalMilliseconds: 60000
    });
    expect(await directory.findApp(CHAT_APP.appID)).toMatchObject({ name: 'Chatforge' });
    const app = await directory.findAppBySecret(CHAT_APP.appSecret);
    expect(app).toMatchObject({ appID: CHAT_APP.appID, monthlyRequestLimitPerKey: 3 });
    expect(JSON.stringify(app)).not.toContain('appSecretHash');
    expect(await directory.findAppBySecret('fsk_wrong_secret')).toBeNull();
  });

  it('refetches once when it meets an app created after the last refresh', async () => {
    const directory = createRemoteAppDirectory({
      ...connection,
      refreshIntervalMilliseconds: 60000
    });
    await directory.findApp(CHAT_APP.appID);
    await controlPlane.setApps([CHAT_APP, DESK_APP]);
    await Bun.sleep(1100);
    expect(await directory.findApp(DESK_APP.appID)).toMatchObject({ name: 'Promptdesk' });
  });

  it('does not hammer the control plane with lookups for unknown apps', async () => {
    const directory = createRemoteAppDirectory({
      ...connection,
      refreshIntervalMilliseconds: 60000
    });
    const before = controlPlane.countAppListRequests();
    for (const attempt of [1, 2, 3, 4, 5]) {
      expect(await directory.findApp(`app_missing_${attempt}`)).toBeNull();
    }
    expect(controlPlane.countAppListRequests() - before).toBe(1);
  });

  it('keeps answering when the gateway token is rejected', async () => {
    const directory = createRemoteAppDirectory({
      controlPlaneURL: controlPlane.controlPlaneURL,
      gatewayToken: 'wrong_token',
      refreshIntervalMilliseconds: 60000
    });
    expect(await directory.findApp(CHAT_APP.appID)).toBeNull();
  });
});

describe('sending usage to the control plane', () => {
  it('batches token counts with the gateway token and keeps local request counts', async () => {
    const ledger = createRemoteUsageLedger({ ...connection, flushIntervalMilliseconds: 60000 });
    await ledger.recordUsage(createUsageEvent('key_one'));
    await ledger.recordUsage(createUsageEvent('key_one'));
    expect(await ledger.countRequestsThisMonth('key_one')).toBe(2);
    expect(await ledger.flush()).toBe(2);
    expect(controlPlane.usageBatches.at(-1)?.events).toEqual([
      {
        appID: CHAT_APP.appID,
        keyID: 'key_one',
        provider: 'openai',
        inputTokens: 12,
        outputTokens: 30,
        recordedAt: expect.any(String)
      },
      expect.objectContaining({ keyID: 'key_one' })
    ]);
    expect(await ledger.flush()).toBe(0);
    await ledger.stop();
  });

  it('keeps events queued when the control plane is down and sends them later', async () => {
    const ledger = createRemoteUsageLedger({ ...connection, flushIntervalMilliseconds: 60000 });
    controlPlane.failUsageWith(503);
    await ledger.recordUsage(createUsageEvent('key_two'));
    expect(await ledger.flush()).toBe(0);
    controlPlane.failUsageWith(202);
    expect(await ledger.flush()).toBe(1);
    await ledger.stop();
  });
});

describe('reporting the gateway status to the control plane', () => {
  const measurement = `sha256:${'5d3a'.repeat(16)}`;

  it('sends the image digest and the time the enclave last answered attestation', async () => {
    const reporter = createRemoteGatewayStatus({
      ...connection,
      measurement,
      attest: async () => new TextEncoder().encode('attestation-token'),
      reportIntervalMilliseconds: 60000
    });
    const before = Date.now();
    expect(await reporter.report()).toBe(true);
    reporter.stop();
    const report = controlPlane.statusReports.at(-1);
    expect(report?.measurement).toBe(measurement);
    expect(new Date(report?.attestedAt ?? 0).getTime()).toBeGreaterThanOrEqual(before);
  });

  it('keeps the last attestation time when the enclave stops answering', async () => {
    let isEnclaveAnswering = true;
    const reporter = createRemoteGatewayStatus({
      ...connection,
      measurement,
      attest: async () => (isEnclaveAnswering ? new Uint8Array([1]) : null),
      reportIntervalMilliseconds: 60000
    });
    await reporter.report();
    const firstAttestedAt = controlPlane.statusReports.at(-1)?.attestedAt;
    isEnclaveAnswering = false;
    await Bun.sleep(5);
    await reporter.report();
    reporter.stop();
    expect(firstAttestedAt).toBeTruthy();
    expect(controlPlane.statusReports.at(-1)?.attestedAt).toBe(firstAttestedAt ?? null);
  });

  it('reports no attestation outside an enclave', async () => {
    const reporter = createRemoteGatewayStatus({
      ...connection,
      measurement: null,
      reportIntervalMilliseconds: 60000
    });
    await reporter.report();
    reporter.stop();
    expect(controlPlane.statusReports.at(-1)).toEqual({ measurement: null, attestedAt: null });
  });

  it('answers false instead of throwing when the control plane refuses the token', async () => {
    const reporter = createRemoteGatewayStatus({
      ...connection,
      gatewayToken: 'wrong_token',
      measurement,
      reportIntervalMilliseconds: 60000
    });
    expect(await reporter.report()).toBe(false);
    reporter.stop();
  });
});
