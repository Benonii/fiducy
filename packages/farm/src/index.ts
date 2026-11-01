import { defineIntegration } from '@farm.js/core';

import type { Fiducy } from '@fiducy/sdk/server';

export interface FiducyIntegrationInput {
  instance: Fiducy;
  basePath?: string;
}

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
