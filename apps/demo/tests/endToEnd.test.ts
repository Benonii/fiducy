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

// Asks a question with no key: the reply opens the key box inside the thread, and once the
// key is saved the conversation is sent again and answered.
async function askAndConnect(page: Page, question: string) {
  await page.goto(stack.demoURL);
  await sendMessage(page, question);
  await page.getByText('Connect your OpenAI key', { exact: true }).waitFor();
  const widget = page.frameLocator('.fiducy-tool iframe');
  await widget.getByLabel('Your API key').fill(SAMPLE_API_KEY);
  await widget.getByRole('button', { name: 'Save key' }).click();
  await page.getByText('OpenAI key connected').waitFor();
  await page.getByText('Here is a summary.').waitFor();
}

// The demo keeps sealed records on its own disk through the Farm storage mount.
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

describe('assistant-ui demo with bring-your-own keys', () => {
  it(
    'asks for the key inside the thread and answers through the gateway',
    async () => {
      const page = await browser.newPage();
      await askAndConnect(page, 'Summarize this');

      const forwarded = stack.mockProvider.recordedRequests.at(-1);
      expect(forwarded?.path).toBe('/v1/chat/completions');
      expect(forwarded?.headers.get('authorization')).toBe(`Bearer ${SAMPLE_API_KEY}`);
      expect(forwarded?.body).toContain('Summarize this');
      // The server-made key request is dropped, so the model only sees the question.
      expect(forwarded?.body).not.toContain('Connect your OpenAI key');
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
      await askAndConnect(page, 'First');
      await page.reload();
      await page.getByText('Your OpenAI key', { exact: true }).waitFor();
      await sendMessage(page, 'Second');
      await page.getByText('This key reached its monthly request limit').waitFor();
      expect(await page.locator('.fiducy-tool iframe').count()).toBe(0);
      await page.close();
    },
    TEST_TIMEOUT_MILLISECONDS
  );

  it('answers a user with no key by calling the connect tool', async () => {
    const response = await fetch(`${stack.demoURL}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: 'fiducy_demo_user=no-key-user-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        messages: [{ id: 'm1', role: 'user', parts: [{ type: 'text', text: 'Hi' }] }]
      })
    });
    expect(response.status).toBe(200);
    const stream = await response.text();
    expect(stream).toContain('"toolName":"connect_api_key"');
    expect(stream).toContain('"provider":"anthropic"');
    expect(stack.mockProvider.recordedRequests.some((entry) => entry.body.includes('"Hi"'))).toBe(
      false
    );
  });
});
