import { defineIntegration } from '@farm.js/core';

import type { Fiducy } from '@fiducy/sdk/server';

export interface FiducyIntegrationInput {
  /** The server instance from createFiducy in @fiducy/sdk/server. */
  instance: Fiducy;
  /** Must match the basePath given to createFiducy. Defaults to /api/fiducy. */
  basePath?: string;
}

/**
 * Mounts the Fiducy handler in a Farm.js app, the same way @farm.js/better-auth mounts
 * Better Auth: integrations: { byok: fiducy({ instance }) }.
 */
export function fiducy({ instance, basePath = '/api/fiducy' }: FiducyIntegrationInput) {
  return defineIntegration({
    category: 'byok',
    type: 'fiducy',
    instance,
    routes: [
      {
        path: `${basePath.replace(/\/+$/, '')}/[...fiducy]`,
        methods: ['GET', 'POST', 'DELETE'],
        handler: (request: Request) => instance.handler(request)
      }
    ]
  });
}
