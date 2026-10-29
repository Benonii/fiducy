import { createLocalKeyWrapper } from '../src';

export const SAMPLE_API_KEY = 'sk-proj-a81fQ7mXv2Lr9Tn4Wd6Hc3Bk8Pz1Ys5Ue0Ji7Ga2Rf9c2e';
export const SAMPLE_APP_ID = 'app_chatforge';
export const OTHER_APP_ID = 'app_promptdesk';

export function createTestKeyWrapper(seed = 7) {
  return createLocalKeyWrapper(new Uint8Array(32).fill(seed));
}
