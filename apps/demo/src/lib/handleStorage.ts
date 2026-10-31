import { useSyncExternalStore } from 'react';

import { HANDLE_STORAGE_KEY } from './constants';

const listeners = new Set<() => void>();

function readStoredHandle(): string | null {
  try {
    return window.localStorage.getItem(HANDLE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeHandle(handle: string | null) {
  try {
    if (handle) window.localStorage.setItem(HANDLE_STORAGE_KEY, handle);
    else window.localStorage.removeItem(HANDLE_STORAGE_KEY);
  } catch {}
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStoredHandle() {
  const handle = useSyncExternalStore(subscribe, readStoredHandle, () => null);
  return [handle, storeHandle] as const;
}
