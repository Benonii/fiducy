import { KeyWidget } from './KeyWidget.tsx';
import { useSaveConnectedKey } from './useFiducyKeys.ts';

import type { ConnectKeyWidgetProps } from './types.ts';

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
