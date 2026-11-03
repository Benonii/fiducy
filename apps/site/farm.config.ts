import { defineConfig } from '@farm.js/core';
import { withDocs } from '@farming-labs/farmjs/config';

export default withDocs(
  defineConfig({
    deploy: { target: 'vercel' },
    agent: { jsonLd: false, apiCatalog: true, crawlers: { search: 'allow', training: 'allow' } },
    openapi: {
      enabled: true,
      route: '/api-reference',
      specRoute: '/openapi.json',
      title: 'Fiducy site API',
      description:
        'The public endpoints served by fiducy.dev, such as the managed-service waitlist.',
      version: '1.0.0',
      servers: [{ url: 'https://fiducy.dev/api', description: 'Production' }]
    }
  })
);
