import { KeyWidget } from './KeyWidget';
import { useSaveConnectedKey } from './useFiducyKeys';

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
  const saveConnectedKey = useSaveConnectedKey(basePath);
  return (
    <KeyWidget
      gatewayURL={gatewayURL}
      appID={appID}
      className={className}
      onError={onError}
      onHandle={(handle, record) => {
        saveConnectedKey.mutate(
          { provider, handle, record },
          { onSuccess: (key) => onConnected?.(key), onError: (error) => onError?.(error.message) }
        );
      }}
    />
  );
}
