import { KeyWidget } from '@fiducy/sdk/react';
import { useState } from 'react';

import type { PublicDemoConfig } from '../lib/types';

interface ConnectKeyProps {
  config: PublicDemoConfig;
  onHandle: (handle: string) => void;
}

export function ConnectKey({ config, onHandle }: ConnectKeyProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  return (
    <section className="card stack">
      <h2>Connect your OpenAI key</h2>
      <p className="hint">
        The box below is served by the Fiducy gateway. This page never sees your key, only a handle
        that works for this app.
      </p>
      <KeyWidget
        gatewayURL={config.gatewayURL}
        appID={config.appID}
        onHandle={onHandle}
        onError={setErrorMessage}
        className="widget"
      />
      {errorMessage && <p className="notice error">{errorMessage}</p>}
    </section>
  );
}
