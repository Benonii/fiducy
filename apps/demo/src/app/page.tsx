'use client';

import { useEffect, useState } from 'react';

import { Chat } from '../components/Chat';
import { ConnectKey } from '../components/ConnectKey';
import { readStoredHandle, storeHandle } from '../lib/handleStorage';

import type { PublicDemoConfig } from '../lib/types';

type ConfigState =
  | { status: 'loading' }
  | { status: 'failed'; message: string }
  | { status: 'ready'; config: PublicDemoConfig };

export default function DemoPage() {
  const [configState, setConfigState] = useState<ConfigState>({ status: 'loading' });
  const [handle, setHandle] = useState<string | null>(null);

  useEffect(() => {
    setHandle(readStoredHandle());
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

  const updateHandle = (nextHandle: string | null) => {
    storeHandle(nextHandle);
    setHandle(nextHandle);
  };

  if (configState.status === 'loading') return <p className="hint">Loading</p>;
  if (configState.status === 'failed') return <p className="notice error">{configState.message}</p>;
  if (!handle) return <ConnectKey config={configState.config} onHandle={updateHandle} />;
  return <Chat handle={handle} onForgetKey={() => updateHandle(null)} />;
}
