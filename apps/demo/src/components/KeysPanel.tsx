import { PROVIDER_LABELS } from '@fiducy/assistant-ui';

import type { FiducyKeysState } from '@fiducy/sdk/react';

// What the app knows about each key: a provider and an ID. The key itself stays in the enclave.
export function KeysPanel({ keys, isLoading, error, revoke }: FiducyKeysState) {
  return (
    <section className="keys" aria-labelledby="keys-heading">
      <h2 id="keys-heading" className="sidebar-heading">
        Your keys
      </h2>
      {isLoading && <p className="muted">Loading</p>}
      {error && <p className="error-text">{error}</p>}
      {!isLoading && keys.length === 0 && (
        <p className="muted">None yet. Send a message and the chat asks for one.</p>
      )}
      <ul>
        {keys.map((key) => (
          <li key={key.keyID}>
            <span className="key-provider">{PROVIDER_LABELS[key.provider]}</span>
            <span className="key-id">{key.keyID.slice(0, 8)}</span>
            <button type="button" className="text-button" onClick={() => revoke(key.keyID)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
