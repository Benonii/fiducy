import { KeyWidget } from './KeyWidget';
import { saveConnectedKey } from './useFiducyKeys';

import type { ConnectKeyWidgetProps } from './types';

/**
 * The key widget plus the round trip to your server: when the user saves a key, the handle
 * (and the sealed record, in app-owned mode) is posted to your Fiducy handler for this user.
 */
export function ConnectKeyWidget({
  gatewayURL,
  appID,
  provider,
  basePath = '/api/fiducy',
  onConnected,
  onError,
  className
}: ConnectKeyWidgetProps) {
  return (
    <KeyWidget
      gatewayURL={gatewayURL}
      appID={appID}
      className={className}
      onError={onError}
      onHandle={(handle, record) => {
        saveConnectedKey(basePath, { provider, handle, record })
          .then((key) => onConnected?.(key))
          .catch((error: unknown) =>
            onError?.(error instanceof Error ? error.message : String(error))
          );
      }}
    />
  );
}
