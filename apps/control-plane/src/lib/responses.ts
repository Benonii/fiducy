import type { ControlFailure } from './types';

export function respondWith(status: number, data: unknown, message: string): Response {
  return Response.json({ data, message }, { status });
}

export function respondWithFailure({ status, message }: ControlFailure): Response {
  return respondWith(status, null, message);
}
