import { GATEWAY_ERROR_HEADER, GATEWAY_FAILURE_ERROR } from '@fiducy/core';

import type { GatewayFailure } from './types';

export function respondWith(status: number, data: unknown, message: string): Response {
  return Response.json({ data, message }, { status });
}

export function respondWithFailure({ status, message, code }: GatewayFailure): Response {
  const response = respondWith(status, null, message);
  response.headers.set(GATEWAY_ERROR_HEADER, code ?? GATEWAY_FAILURE_ERROR);
  return response;
}

export function describeFailure(status: number, message: string, code?: string): GatewayFailure {
  return code ? { status, message, code } : { status, message };
}
