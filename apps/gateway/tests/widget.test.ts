import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { chromium } from 'playwright';

import { SAMPLE_API_KEY } from '@fiducy/testing';
import { startGatewayHarness } from './harness';
import { startHostPage } from './hostPage';

import type { Browser } from 'playwright';
import type { AppRegistration } from '../src/types';

let harness: Awaited<ReturnType<typeof startGatewayHarness>>;
let hostPage: Awaited<ReturnType<typeof startHostPage>>;
let browser: Browser;

const widgetApp: AppRegistration = {
  appID: 'app_widgetdemo',
  name: 'Chatforge',
  appSecret: 'app_sk_widgetdemo_7Hc3Bk8Pz1Ys5Ue',
  monthlyRequestLimitPerKey: 100,
  allowedOrigins: []
};

beforeAll(async () => {
  harness = await startGatewayHarness([widgetApp]);
  hostPage = await startHostPage(harness.gatewayURL, widgetApp.appID);
  widgetApp.allowedOrigins.push(hostPage.hostURL);
  browser = await chromium.launch();
}, 30000);

afterAll(async () => {
  await browser.close();
  hostPage.server.stop(true);
  harness.stop();
});

async function callProviderWith(handle: string) {
  const response = await fetch(`${harness.gatewayURL}/openai/v1/chat/completions`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${widgetApp.appSecret}`,
      'x-key-handle': handle,
      'content-type': 'application/json'
    },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [] })
  });
  const forwarded = harness.mockProvider.recordedRequests.at(-1);
  return { status: response.status, upstreamKey: forwarded?.headers.get('authorization') };
}

describe('the embedded key widget', () => {
  it('hands the host page a working handle and never the key', async () => {
    const page = await browser.newPage();
    await page.goto(hostPage.hostURL);
    const widget = page.frameLocator('iframe');
    await widget.getByLabel('Your API key').fill(SAMPLE_API_KEY);
    await widget.getByRole('button', { name: 'Save key' }).click();
    await page.locator('#result', { hasText: /^kh_/ }).waitFor();

    const handle = (await page.textContent('#result')) ?? '';
    expect(await page.content()).not.toContain(SAMPLE_API_KEY);
    expect(await widget.getByText('Key saved and encrypted.').isVisible()).toBe(true);
    expect(await callProviderWith(handle)).toEqual({
      status: 200,
      upstreamKey: `Bearer ${SAMPLE_API_KEY}`
    });
    await page.close();
  });

  it('keeps the key input out of reach of the host page script', async () => {
    const page = await browser.newPage();
    await page.goto(hostPage.hostURL);
    await page.frameLocator('iframe').getByLabel('Your API key').waitFor();
    const canReadFrame = await page.evaluate(
      "(() => { try { return document.querySelector('iframe').contentDocument !== null; } catch { return false; } })()"
    );
    expect(canReadFrame).toBe(false);
    await page.close();
  });

  it('shows the gateway error inside the widget and reports it to the host', async () => {
    const page = await browser.newPage();
    await page.goto(hostPage.hostURL);
    const widget = page.frameLocator('iframe');
    await widget.getByLabel('Your API key').fill('x'.repeat(600));
    await widget.getByRole('button', { name: 'Save key' }).click();
    await page.locator('#result', { hasText: /^error/ }).waitFor();
    expect(await widget.getByRole('status').first().textContent()).toContain('apiKey is required');
    await page.close();
  });
});

describe('widget access rules', () => {
  it('refuses to render for a site the app did not allow', async () => {
    const widgetURL = `${harness.gatewayURL}/widget?app=${widgetApp.appID}&origin=https://evil.example`;
    expect((await fetch(widgetURL)).status).toBe(403);
  });

  it('only lets the allowed site frame it and blocks inline injection', async () => {
    const widgetURL = `${harness.gatewayURL}/widget?app=${widgetApp.appID}&origin=${hostPage.hostURL}`;
    const policy = (await fetch(widgetURL)).headers.get('content-security-policy') ?? '';
    expect(policy).toContain(`frame-ancestors ${hostPage.hostURL}`);
    expect(policy).toContain("script-src 'nonce-");
  });

  it('rejects key submissions sent from other websites', async () => {
    const response = await fetch(`${harness.gatewayURL}/keys`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://evil.example' },
      body: JSON.stringify({ appID: widgetApp.appID, apiKey: SAMPLE_API_KEY })
    });
    expect(response.status).toBe(403);
  });
});
