import type { ControlFailure } from './types';

export function describeFailure(status: number, message: string): ControlFailure {
  return { status, message };
}

export const APP_NOT_FOUND = describeFailure(404, 'No app with this ID belongs to your account');

export const KEY_NOT_FOUND = describeFailure(404, 'No key with this ID belongs to this app');
