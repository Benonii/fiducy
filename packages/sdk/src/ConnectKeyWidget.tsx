import { KeyWidget } from './KeyWidget';
import { useSaveConnectedKey } from './useFiducyKeys';

import type { ConnectKeyWidgetProps } from './types';

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
