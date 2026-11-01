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

import { auth } from '@/lib/auth';

const { FIDUCY_GATEWAY_URL, FIDUCY_APP_SECRET } = process.env;
if (!FIDUCY_GATEWAY_URL || !FIDUCY_APP_SECRET) throw new Error('Set the Fiducci env vars');

export async function getUserID(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user.id ?? null;
}

export const fiducyServer = createFiducy({
  gatewayURL: FIDUCY_GATEWAY_URL,
  appSecret: FIDUCY_APP_SECRET,
  storage: keyValueStorage(getStorage('fiducy')),
  getUserID
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

  return (
    <ConnectKeyWidget
      gatewayURL="https://gw.fiducy.dev"
      appID="app_..."
      provider="openai"
      onConnected={refresh}
    />
  );
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
    code: `import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

import { fiducyServer, getUserID } from '@/lib/fiducy';

export async function POST(request: Request) {
  const userID = await getUserID(request);
  const settings = userID ? await fiducyServer.providerSettings('openai', { userID }) : null;
  if (!settings) return new Response('Connect your API key first', { status: 400 });

  const { messages } = await request.json();
  const result = streamText({ model: createOpenAI(settings).chat('gpt-4o-mini'), messages });
  return result.toUIMessageStreamResponse();
}`
  }
];
