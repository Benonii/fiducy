import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { chromium } from 'playwright';

import { SAMPLE_API_KEY } from '@fiducy/testing';
import { startDemoStack } from './stack';

import type { Browser, Page } from 'playwright';

const TEST_TIMEOUT_MILLISECONDS = 90000;

let stack: Awaited<ReturnType<typeof startDemoStack>>;
let browser: Browser;

beforeAll(async () => {
  stack = await startDemoStack();
  browser = await chromium.launch();
}, TEST_TIMEOUT_MILLISECONDS);

afterAll(async () => {
  await browser?.close();
  await stack?.stop();
});

async function connectKey(page: Page) {
  await page.goto(stack.demoURL);
  const widget = page.frameLocator('iframe');
  await widget.getByLabel('Your API key').fill(SAMPLE_API_KEY);
  await widget.getByRole('button', { name: 'Save key' }).click();
  await page.getByText('Your key is connected').waitFor();
}

function readStoredRecords(): string {
  const directory = join(stack.dataDirectory, 'fiducy');
  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => readFileSync(join(entry.parentPath, entry.name), 'utf8'))
    .join('\n');
}

async function sendMessage(page: Page, text: string) {
  await page.getByLabel('Message').fill(text);
  await page.getByRole('button', { name: 'Send' }).click();
}

describe('demo chat with a bring-your-own key', () => {
  it(
    'chats through the gateway without the page ever seeing the key',
    async () => {
      const page = await browser.newPage();
      await connectKey(page);
      await sendMessage(page, 'Summarize this');
      await page.getByText('Here is a summary.').waitFor();

      const forwarded = stack.mockProvider.recordedRequests.at(-1);
      expect(forwarded?.path).toBe('/v1/chat/completions');
      expect(forwarded?.headers.get('authorization')).toBe(`Bearer ${SAMPLE_API_KEY}`);
      expect(forwarded?.body).toContain('Summarize this');
      expect(await page.content()).not.toContain(SAMPLE_API_KEY);
      const storage = await page.evaluate(() => JSON.stringify(window.localStorage));
      expect(storage).not.toContain(SAMPLE_API_KEY);
      const records = readStoredRecords();
      expect(records).toContain('kh_');
      expect(records).not.toContain(SAMPLE_API_KEY);
      await page.close();
    },
    TEST_TIMEOUT_MILLISECONDS
  );

  it(
    'keeps the key across reloads and shows gateway errors in the chat',
    async () => {
      const page = await browser.newPage();
      await connectKey(page);
      await page.reload();
      await page.getByText('Your key is connected').waitFor();
      await sendMessage(page, 'First');
      await page.getByText('Here is a summary.').waitFor();
      await sendMessage(page, 'Second');
      await page.getByText('This key reached its monthly request limit').waitFor();
      await page.close();
    },
    TEST_TIMEOUT_MILLISECONDS
  );

  it('gives a new browser an http-only demo user cookie once', async () => {
    const first = await fetch(`${stack.demoURL}/api/config`);
    expect(first.headers.get('set-cookie')).toMatch(/^fiducy_demo_user=[0-9a-f-]{36};.*HttpOnly/);
    const returning = await fetch(`${stack.demoURL}/api/config`, {
      headers: { cookie: 'fiducy_demo_user=returning-user-01' }
    });
    expect(returning.headers.get('set-cookie')).toBeNull();
  });

  it('refuses chat requests from a user with no connected key', async () => {
    const response = await fetch(`${stack.demoURL}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: 'fiducy_demo_user=no-key-user-01' },
      body: JSON.stringify({
        messages: [{ id: 'm1', role: 'user', parts: [{ type: 'text', text: 'Hi' }] }]
      })
    });
    expect(response.status).toBe(400);
    expect(((await response.json()) as { message: string }).message).toBe(
      'Connect your API key first'
    );
  });
});
