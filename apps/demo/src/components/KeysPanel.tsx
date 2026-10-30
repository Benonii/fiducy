import { PROVIDER_LABELS } from '@fiducy/assistant-ui';

import { Button } from '@/components/ui/button';

import type { FiducyKeysState } from '@fiducy/sdk/react';

// What the app knows about each key: a provider and an ID. The key itself stays in the enclave.
export function KeysPanel({ keys, isLoading, error, revoke }: FiducyKeysState) {
  return (
    <section aria-labelledby="keys-heading">
      <h2
        id="keys-heading"
        className="mb-2 font-medium font-mono text-[0.6875rem] text-muted-foreground uppercase tracking-wider"
      >
        Your keys
      </h2>
      {isLoading ? <p className="text-muted-foreground text-xs">Loading</p> : null}
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {!isLoading && keys.length === 0 ? (
        <p className="text-muted-foreground text-xs">
          None yet. Send a message and the chat asks for one.
        </p>
      ) : null}
      <ul className="grid gap-1.5">
        {keys.map((key) => (
          <li key={key.keyID} className="flex items-baseline gap-2 text-sm">
            <span className="font-semibold text-foreground">{PROVIDER_LABELS[key.provider]}</span>
            <span className="font-mono text-muted-foreground text-xs">{key.keyID.slice(0, 8)}</span>
            <Button
              variant="link"
              size="xs"
              className="ml-auto text-muted-foreground"
              onClick={() => revoke(key.keyID)}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
