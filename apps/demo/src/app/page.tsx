'use client';

import { useFiducyKeys } from '@fiducy/sdk/react';

import { Chat } from '@/components/Chat';
import { ConnectKey } from '@/components/ConnectKey';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { FIDUCY_BASE_PATH } from '@/lib/constants';
import { useDemoConfig } from '@/lib/queries';

import type { PublicDemoConfig } from '@/lib/types';

function Loading() {
  return (
    <p className="flex items-center gap-2 text-muted-foreground text-sm">
      <Spinner />
      Loading
    </p>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <Alert variant="error">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

function ConnectedDemo({ config }: { config: PublicDemoConfig }) {
  const { keys, isLoading, error, revoke } = useFiducyKeys(FIDUCY_BASE_PATH);
  const openAIKey = keys.find((key) => key.provider === 'openai');

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!openAIKey) return <ConnectKey config={config} />;
  return <Chat onForgetKey={() => revoke(openAIKey.keyID)} />;
}

export default function DemoPage() {
  const config = useDemoConfig();

  if (config.isPending) return <Loading />;
  if (config.isError) return <ErrorMessage message={config.error.message} />;
  return <ConnectedDemo config={config.data} />;
}
