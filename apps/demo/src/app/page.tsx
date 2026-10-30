'use client';

import { useFiducyKeys } from '@fiducy/sdk/react';
import { useEffect, useState } from 'react';

import { Chat } from '../components/Chat';
import { ConnectKey } from '../components/ConnectKey';
import { FIDUCY_BASE_PATH } from '../lib/constants';
import { ensureDemoUser } from '../lib/demoUser';

import type { PublicDemoConfig } from '../lib/types';

type ConfigState =
  | { status: 'loading' }
  | { status: 'failed'; message: string }
  | { status: 'ready'; config: PublicDemoConfig };

function ConnectedDemo({ config }: { config: PublicDemoConfig }) {
  const { keys, isLoading, error, refresh, revoke } = useFiducyKeys(FIDUCY_BASE_PATH);
  const openAIKey = keys.find((key) => key.provider === 'openai');

  if (isLoading) return <p className="hint">Loading</p>;
  if (error) return <p className="notice error">{error}</p>;
  if (!openAIKey) return <ConnectKey config={config} onConnected={refresh} />;
  return <Chat onForgetKey={() => revoke(openAIKey.keyID)} />;
}

export default function DemoPage() {
  const [configState, setConfigState] = useState<ConfigState>({ status: 'loading' });

  useEffect(() => {
    ensureDemoUser();
    fetch('/api/config')
      .then((response) => response.json())
      .then((body: { data: PublicDemoConfig | null; message: string }) =>
        setConfigState(
          body.data
            ? { status: 'ready', config: body.data }
            : { status: 'failed', message: body.message }
        )
      )
      .catch(() => setConfigState({ status: 'failed', message: 'Could not load the demo config' }));
  }, []);

  if (configState.status === 'loading') return <p className="hint">Loading</p>;
  if (configState.status === 'failed') return <p className="notice error">{configState.message}</p>;
  return <ConnectedDemo config={configState.config} />;
}
