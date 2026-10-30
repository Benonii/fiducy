export interface CodeSampleTab {
  id: string;
  label: string;
  file: string;
  code: string;
}

export const CODE_SAMPLES: CodeSampleTab[] = [
  {
    id: 'server',
    label: 'Server',
    file: 'src/lib/fiducy.ts',
    code: `import { getStorage } from '@farm.js/core/storage';
import { createFiducy, keyValueStorage } from '@fiducy/sdk/server';

export const fiducyServer = createFiducy({
  gatewayURL: process.env.FIDUCY_GATEWAY_URL,
  appSecret: process.env.FIDUCY_APP_SECRET,
  storage: keyValueStorage(getStorage('fiducy')),
  getUserID: (request) => getSession(request)?.user.id ?? null
});`
  },
  {
    id: 'config',
    label: 'Integration',
    file: 'farm.config.ts',
    code: `import { defineConfig } from '@farm.js/core';
import { fiducy } from '@fiducy/farm';

import { fiducyServer } from './src/lib/fiducy';

export default defineConfig({
  integrations: {
    byok: fiducy({ instance: fiducyServer })
  }
});`
  },
  {
    id: 'widget',
    label: 'Widget',
    file: 'src/app/settings/page.tsx',
    code: `import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKeyWidget, useFiducyKeys } from '@fiducy/sdk/react';

const queryClient = new QueryClient();

function ConnectOpenAI() {
  const { keys, refresh } = useFiducyKeys();
  if (keys.length > 0) return <p>Your OpenAI key is connected.</p>;

  return <ConnectKeyWidget provider="openai" appID="app_..." onConnected={refresh} />;
}

export default function Settings() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConnectOpenAI />
    </QueryClientProvider>
  );
}`
  },
  {
    id: 'route',
    label: 'Model call',
    file: 'src/app/api/chat/route.ts',
    code: `const settings = await fiducyServer.providerSettings('openai', { userID });
if (!settings) return new Response('Connect your API key first', { status: 400 });

const result = streamText({
  model: createOpenAI(settings).chat('gpt-4o-mini'),
  messages
});`
  }
];
