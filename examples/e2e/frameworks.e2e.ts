import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { chromium } from 'playwright';

import { SAMPLE_API_KEY } from '@fiducy/testing';
import { EXAMPLE_APPS } from './examples';
import { buildPackages, startExample, startGateway } from './stack';

import type { Browser, Page } from 'playwright';

const selectedNames = Bun.env.EXAMPLES?.split(',');
const examples = EXAMPLE_APPS.filter(
  (example) => !selectedNames || selectedNames.includes(example.name)
);

let gateway: Awaited<ReturnType<typeof startGateway>>;
let browser: Browser;

beforeAll(async () => {
  buildPackages();
  gateway = await startGateway();
  browser = await chromium.launch();
}, 120000);

afterAll(async () => {
  await browser.close();
  gateway.stop();
});

function waitForKeyState(page: Page, state: string) {
  return page.locator(`fiducy-key[state="${state}"]`).waitFor({ timeout: 60000 });
}

async function ask(page: Page, expected: string) {
  await page.getByRole('button', { name: 'Ask' }).click();
  await page.getByRole('status').filter({ hasText: expected }).waitFor({ timeout: 30000 });
}

for (const example of examples) {
  describe(`the ${example.name} example`, () => {
    it('signs in, connects a key, answers, and heals a stale key', async () => {
      const app = await startExample(example, gateway.gatewayURL);
      const context = await browser.newContext({ viewport: { width: 360, height: 800 } });
      const page = await context.newPage();
      try {
        await page.goto(app.appURL);
        await waitForKeyState(page, 'signed-out');
        await ask(page, 'Sign in to use your OpenAI key');

        await page.getByRole('button', { name: 'Sign in as a test user' }).click();
        await waitForKeyState(page, 'connect');
        await ask(page, 'Connect your OpenAI key to keep going');

        const widget = page.frameLocator('fiducy-key iframe');
        await widget.getByLabel('Your API key').fill(SAMPLE_API_KEY);
        await widget.getByRole('button', { name: 'Save key' }).click();
        await waitForKeyState(page, 'connected');
        await ask(page, 'Hello');
        expect(await page.content()).not.toContain(SAMPLE_API_KEY);
        await page.screenshot({
          path: `${Bun.env.EXAMPLES_SCREENSHOTS ?? '/tmp'}/${example.name}-connected.png`
        });

        for (const keyID of await app.readStoredKeyIDs())
          await gateway.keyStore.deleteRecord(keyID);
        await ask(page, 'The saved OpenAI key is no longer available. Connect it again.');
        await page.reload();
        await waitForKeyState(page, 'connect');
      } finally {
        await context.close();
        app.stop();
      }
    }, 600000);
  });
}
