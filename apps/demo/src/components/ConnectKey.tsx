import { ConnectKeyWidget } from '@fiducy/sdk/react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardDescription, CardHeader, CardPanel, CardTitle } from '@/components/ui/card';
import { FIDUCY_BASE_PATH } from '@/lib/constants';

import type { PublicDemoConfig } from '@/lib/types';

interface ConnectKeyProps {
  config: PublicDemoConfig;
}

export function ConnectKey({ config }: ConnectKeyProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  return (
    <Card render={<section />}>
      <CardHeader>
        <CardTitle render={(props) => <h2 {...props} />}>Connect your OpenAI key</CardTitle>
        <CardDescription>
          The box below is served by the Fiducy gateway. This page never sees your key. The app
          server stores a handle for your account.
        </CardDescription>
      </CardHeader>
      <CardPanel className="grid gap-4">
        <ConnectKeyWidget
          gatewayURL={config.gatewayURL}
          appID={config.appID}
          provider="openai"
          basePath={FIDUCY_BASE_PATH}
          onError={setErrorMessage}
          className="[&_iframe]:block [&_iframe]:border [&_iframe]:border-border"
        />
        {errorMessage ? (
          <Alert variant="error">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}
      </CardPanel>
    </Card>
  );
}
