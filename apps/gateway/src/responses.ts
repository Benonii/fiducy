import type { GatewayFailure } from './types';

export function respondWith(status: number, data: unknown, message: string): Response {
  return Response.json({ data, message }, { status });
}

export function respondWithFailure({ status, message }: GatewayFailure): Response {
  return respondWith(status, null, message);
}

export function describeFailure(status: number, message: string): GatewayFailure {
  return { status, message };
}
