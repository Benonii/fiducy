import { KeyWidget } from './KeyWidget.tsx';
import { saveConnectedKey } from './keysApi.ts';

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
  return (
    <KeyWidget
      gatewayURL={gatewayURL}
      appID={appID}
      className={className}
      onError={onError}
      onHandle={(handle, record) => {
        saveConnectedKey({ provider, handle, record }, basePath).then(
          (key) => onConnected?.(key),
          (error: Error) => onError?.(error.message)
        );
      }}
    />
  );
}
