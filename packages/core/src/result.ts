import type { Result } from './types.ts';

export function succeed<Value>(value: Value): Result<Value, never> {
  return { ok: true, value };
}

export function fail<Failure>(error: Failure): Result<never, Failure> {
  return { ok: false, error };
}
