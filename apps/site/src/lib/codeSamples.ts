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
    file: 'lib/fiducy.ts',
    code: `import { createFiducy, keyValueStorage } from '@fiducy/sdk/server';

import { auth } from '@/lib/auth'; // your auth (Better Auth shown)
import { kv } from '@/lib/kv'; // any unstorage driver

const { FIDUCY_GATEWAY_URL, FIDUCY_APP_SECRET } = process.env;
if (!FIDUCY_GATEWAY_URL || !FIDUCY_APP_SECRET) throw new Error('Set the Fiducy env vars');

export async function getUserID(request: Request) {
  // Use your own auth's server-side session lookup here.
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user.id ?? null;
}

export const fiducy = createFiducy({
  gatewayURL: FIDUCY_GATEWAY_URL,
  appSecret: FIDUCY_APP_SECRET,
  storage: keyValueStorage(kv),
  getUserID
});`
  },
  {
    id: 'routes',
    label: 'Key route',
    file: 'app/api/fiducy/[...path]/route.ts',
    code: `import { fiducy } from '@/lib/fiducy';

// A standard Request => Response handler: works in any framework.
export const GET = fiducy.handler;
export const POST = fiducy.handler;
export const DELETE = fiducy.handler;`
  },
  {
    id: 'widget',
    label: 'Widget',
    file: 'app/settings/page.tsx',
    code: `'use client';

import { ConnectKeyWidget } from '@fiducy/sdk/react';
import { useState } from 'react';

export default function Settings() {
  const [connected, setConnected] = useState(false);
  if (connected) return <p>Your OpenAI key is connected.</p>;

  return (
    <ConnectKeyWidget
      gatewayURL="https://gateway.yourapp.com"
      appID="app_..."
      provider="openai"
      onConnected={() => setConnected(true)}
    />
  );
}`
  },
  {
    id: 'route',
    label: 'Model call',
    file: 'app/api/chat/route.ts',
    code: `import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

import { fiducy, getUserID } from '@/lib/fiducy';

export async function POST(request: Request) {
  const userID = await getUserID(request);
  const settings = userID ? await fiducy.providerSettings('openai', { userID }) : null;
  if (!settings) return Response.json({ connectKey: 'openai' }, { status: 409 });

  const { messages } = await request.json();
  const result = streamText({ model: createOpenAI(settings).chat('gpt-4o-mini'), messages });
  return result.toUIMessageStreamResponse();
}`
  }
];
