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
      expect(storage).toContain('kh_');
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

  it('refuses chat requests without a handle', async () => {
    const response = await fetch(`${stack.demoURL}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ handle: '', messages: [] })
    });
    expect(response.status).toBe(400);
    expect(((await response.json()) as { message: string }).message).toBe(
      'Connect your API key first'
    );
  });
});
