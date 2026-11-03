import { getPublicEnv } from '@farm.js/core/env';

import type { PublicDemoEnvironment } from './types';

export function readPublicEnvironment(): PublicDemoEnvironment {
  return getPublicEnv<PublicDemoEnvironment>();
}
