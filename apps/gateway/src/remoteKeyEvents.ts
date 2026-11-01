import { GATEWAY_KEY_EVENTS_PATH } from './constants';
import { callControlPlane, normalizeError } from './controlPlane';

import type { ControlPlaneConnection, KeyEventReporter } from './types';

export function createRemoteKeyEvents(connection: ControlPlaneConnection): KeyEventReporter {
  return {
    report: async (event) => {
      try {
        await callControlPlane(connection, GATEWAY_KEY_EVENTS_PATH, {
          method: 'POST',
          body: JSON.stringify(event)
        });
      } catch (error) {
        console.error(`Could not report a key ${event.type} event: ${normalizeError(error)}`);
      }
    }
  };
}
