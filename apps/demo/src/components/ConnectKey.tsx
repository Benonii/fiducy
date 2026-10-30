import { KeyWidget } from '@fiducy/sdk/react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardDescription, CardHeader, CardPanel, CardTitle } from '@/components/ui/card';

import type { PublicDemoConfig } from '@/lib/types';

interface ConnectKeyProps {
  config: PublicDemoConfig;
  onHandle: (handle: string) => void;
}

export function ConnectKey({ config, onHandle }: ConnectKeyProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  return (
    <Card render={<section />}>
      <CardHeader>
        <CardTitle render={(props) => <h2 {...props} />}>Connect your OpenAI key</CardTitle>
        <CardDescription>
          The box below is served by the Fiducy gateway. This page never sees your key, only a
          handle that works for this app.
        </CardDescription>
      </CardHeader>
      <CardPanel className="grid gap-4">
        <KeyWidget
          gatewayURL={config.gatewayURL}
          appID={config.appID}
          onHandle={onHandle}
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
