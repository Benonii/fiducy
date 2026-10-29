import { APICallError } from 'ai';

import type { GatewayErrorBody } from './types';

function readGatewayMessage(responseBody: string | undefined): string | null {
  if (!responseBody) return null;
  try {
    return (JSON.parse(responseBody) as GatewayErrorBody).message ?? null;
  } catch {
    return null;
  }
}

export function describeChatError(error: unknown): string {
  if (APICallError.isInstance(error)) {
    return (
      readGatewayMessage(error.responseBody) ?? `The gateway answered with ${error.statusCode}`
    );
  }
  return 'Something went wrong while answering';
}
