import { ConnectKeyWidget } from '@fiducy/sdk/react';
import { useState } from 'react';

import { FIDUCY_BASE_PATH } from '@/lib/constants';

import type { PublicDemoConfig } from '@/lib/types';

interface ConnectKeyProps {
  config: PublicDemoConfig;
  onConnected: () => void;
}

export function ConnectKey({ config, onConnected }: ConnectKeyProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  return (
    <section className="card stack">
      <h2>Connect your OpenAI key</h2>
      <p className="hint">
        The box below is served by the Fiducy gateway. This page never sees your key. The app server
        stores a handle for your account.
      </p>
      <ConnectKeyWidget
        gatewayURL={config.gatewayURL}
        appID={config.appID}
        provider="openai"
        basePath={FIDUCY_BASE_PATH}
        onConnected={onConnected}
        onError={setErrorMessage}
        className="widget"
      />
      {errorMessage && <p className="notice error">{errorMessage}</p>}
    </section>
  );
}
