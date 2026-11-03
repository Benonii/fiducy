import { SAMPLE_API_KEY } from '@fiducy/testing';

import type { Page } from 'playwright';

export function waitForKeyState(page: Page, state: string) {
  return page.locator(`fiducy-key[state="${state}"]`).waitFor({ timeout: 60000 });
}

export async function ask(page: Page, expected: string) {
  await page.getByRole('button', { name: 'Ask' }).click();
  await page.getByRole('status').filter({ hasText: expected }).waitFor({ timeout: 30000 });
}

export async function signInAndConnectKey(page: Page, appURL: string) {
  await page.goto(appURL);
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
}

export const STALE_KEY_MESSAGE = 'The saved OpenAI key is no longer available. Connect it again.';
